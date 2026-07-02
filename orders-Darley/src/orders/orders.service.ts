import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { randomUUID } from 'crypto';

interface CartItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  priceAtAdd: number;
}

interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  total: number;
}

const STATUS_MAP: Record<string, string> = {
  PENDENTE: 'pending',
  CANCELADO: 'cancelled',
  APROVADO: 'confirmed',
  ACEITO: 'confirmed',
  SEPARACAO: 'shipped',
  ENVIADO: 'shipped',
  ENTREGUE: 'delivered',
  DEVOLUCAO: 'cancelled',
  REJEITADO: 'cancelled',
};

const PAYMENT_METHOD_MAP: Record<number, string> = {
  2: 'PIX',
  3: 'BOLETO_BANCARIO',
  4: 'CARTAO_CREDITO',
};

const STATUS_PEDIDO_PENDENTE = 1;
const STATUS_PEDIDO_APROVADO = 6;
const STATUS_PAGAMENTO_APROVADO = 3;

@Injectable()
export class OrdersService {
  private readonly cartUrl = process.env.CART_URL ?? 'http://cart:3030';
  private readonly internalKey = process.env.INTERNAL_KEY ?? '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  async create(dto: CreateOrderDto, userId: string, userName: string) {
    const cart = await this.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Carrinho está vazio');
    }

    const enderecoUuid = randomUUID();
    await this.prisma.endereco_de_entrega.create({
      data: {
        endereco_uuid: enderecoUuid,
        endereco_uf: dto.shippingAddress.state.substring(0, 45),
        endereco_municipio: dto.shippingAddress.city.substring(0, 45),
        endereco_logradouro: dto.shippingAddress.street.substring(0, 45),
        endereco_numero: dto.shippingAddress.number ?? 0,
        endereco_complemento: dto.shippingAddress.complement?.substring(0, 45) ?? null,
        endereco_cep: dto.shippingAddress.zipCode.substring(0, 10),
        endereco_usuario_uuid: userId,
      },
    });

    const totalAmount = cart.items.reduce(
      (sum, i) => sum + i.quantity * i.priceAtAdd,
      0,
    );

    const pedidoUuid = randomUUID();
    await this.prisma.pedido.create({
      data: {
        pedido_uuid: pedidoUuid,
        pedido_valor_total: Math.round(totalAmount),
        usuario_uuid: userId,
        endereco_de_entrega_uuid: enderecoUuid,
        status_pedido_id: STATUS_PEDIDO_PENDENTE,
        pedido_nome_destinatario: (userName || 'Cliente').substring(0, 150),
      },
    });

    for (const item of cart.items) {
      const idProduto = parseInt(item.productId, 10) || 0;
      await this.prisma.item_pedido.create({
        data: {
          pedido_uuid: pedidoUuid,
          id_produto: idProduto,
          item_pedido_nome_produto: item.productName.substring(0, 150),
          item_pedido_preco: Math.round(item.priceAtAdd),
          item_pedido_total_preco: Math.round(item.priceAtAdd * item.quantity),
          item_pedido_quantidade: item.quantity,
        },
      });
    }

    const installments = dto.payment.installments ?? 1;
    const valorParcelas = Math.round((totalAmount * 100) / installments) / 100;
    const valorPrimeiraParcela = Math.round(totalAmount) - Math.round(valorParcelas * (installments - 1));

    await this.prisma.pagamento.create({
      data: {
        pagamento_uuid: randomUUID(),
        metodos_de_pagamento_id: dto.payment.methodId,
        codigo_do_pagamento: dto.payment.code ?? this.generatePaymentCode(dto.payment.methodId),
        pedido_uuid: pedidoUuid,
        status_pagamento_id: STATUS_PAGAMENTO_APROVADO,
        pagamento_numero_parcelas: installments,
        pagamento_valor_parcelas: Math.round(valorParcelas),
        pagamento_valor_primeira_parcela: valorPrimeiraParcela,
      },
    });

    await this.prisma.pedido.update({
      where: { pedido_uuid: pedidoUuid },
      data: { status_pedido_id: STATUS_PEDIDO_APROVADO },
    });

    await this.clearCart(userId);

    return this.findOne(pedidoUuid, userId);
  }

  async findAll(userId: string) {
    const orders = await this.prisma.pedido.findMany({
      where: { usuario_uuid: userId },
      include: { item_pedido: true, status_pedido: true, endereco_de_entrega: true, pagamento: { include: { metodo: true, status: true } } },
      orderBy: { pedido_created_at: 'desc' },
    });
    return orders.map((o) => this.serialize(o));
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.pedido.findUnique({
      where: { pedido_uuid: id },
      include: { item_pedido: true, status_pedido: true, endereco_de_entrega: true, pagamento: { include: { metodo: true, status: true } } },
    });
    if (!order) throw new NotFoundException(`Pedido ${id} não encontrado`);
    if (order.usuario_uuid !== userId) throw new ForbiddenException('Acesso negado');
    return this.serialize(order);
  }

  private async getCart(userId: string): Promise<Cart> {
    const { data } = await firstValueFrom(
      this.http.get<Cart>(`${this.cartUrl}/cart`, {
        headers: { 'x-user-id': userId },
      }),
    );
    return data;
  }

  private async clearCart(userId: string) {
    try {
      await firstValueFrom(
        this.http.delete(`${this.cartUrl}/cart`, {
          headers: {
            'x-internal-key': this.internalKey,
            'x-user-id': userId,
          },
        }),
      );
    } catch {      
    }
  }

  private generatePaymentCode(methodId: number): string {
    const rand = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    if (methodId === 2) return `PIX-${rand()}-${rand()}`; // PIX
    if (methodId === 3) return `34191.${rand()} ${rand()}.${rand()} ${rand()}.${rand()} 1`; // Boleto
    return `CARD-${rand()}`;
  }

  private serialize(order: {
    pedido_uuid: string;
    usuario_uuid: string;
    pedido_valor_total: number;
    pedido_created_at: Date;
    status_pedido: { status_pedido_nome: string | null } | null;
    item_pedido: {
      item_pedido_id: number;
      id_produto: number;
      item_pedido_nome_produto: string;
      item_pedido_preco: number;
      item_pedido_quantidade: number;
    }[];
    endereco_de_entrega: {
      endereco_logradouro: string;
      endereco_municipio: string;
      endereco_uf: string;
      endereco_cep: string;
      endereco_complemento: string | null;
    } | null;
    pagamento: {
      pagamento_uuid: string;
      pagamento_numero_parcelas: number | null;
      pagamento_valor_parcelas: number | null;
      codigo_do_pagamento: string;
      metodo: { metodo_de_pagamento_nome: string | null } | null;
      status: { status_pagamento_nome: string } | null;
    }[];
  }) {
    const statusNome = order.status_pedido?.status_pedido_nome ?? 'PENDENTE';
    const status = STATUS_MAP[statusNome] ?? 'pending';
    const pag = order.pagamento[0] ?? null;

    return {
      id: order.pedido_uuid,
      userId: order.usuario_uuid,
      status,
      totalAmount: order.pedido_valor_total,
      items: order.item_pedido.map((i) => ({
        id: i.item_pedido_id.toString(),
        productId: i.id_produto.toString(),
        productName: i.item_pedido_nome_produto,
        size: '',
        quantity: i.item_pedido_quantidade,
        unitPrice: i.item_pedido_preco,
      })),
      shippingAddress: {
        street: order.endereco_de_entrega?.endereco_logradouro ?? '',
        city: order.endereco_de_entrega?.endereco_municipio ?? '',
        state: order.endereco_de_entrega?.endereco_uf ?? '',
        zipCode: order.endereco_de_entrega?.endereco_cep ?? '',
        country: 'Brasil',
      },
      payment: pag
        ? {
            id: pag.pagamento_uuid,
            method: PAYMENT_METHOD_MAP[pag.metodo ? Object.entries(PAYMENT_METHOD_MAP).find(([, v]) => v === pag.metodo?.metodo_de_pagamento_nome)?.[0] as unknown as number : 0] ?? pag.metodo?.metodo_de_pagamento_nome ?? 'DESCONHECIDO',
            methodLabel: pag.metodo?.metodo_de_pagamento_nome ?? 'Desconhecido',
            installments: pag.pagamento_numero_parcelas ?? 1,
            installmentValue: pag.pagamento_valor_parcelas ?? order.pedido_valor_total,
            code: pag.codigo_do_pagamento,
            status: pag.status?.status_pagamento_nome ?? 'DESCONHECIDO',
          }
        : null,
      createdAt: order.pedido_created_at.toISOString(),
    };
  }
}
