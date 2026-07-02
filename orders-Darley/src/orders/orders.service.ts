import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "../catalog/catalog.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { randomUUID } from "crypto";

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

// status_pedido -> status retornado pela API
const STATUS_MAP: Record<string, string> = {
  PENDENTE: "pending",
  CANCELADO: "cancelled",
  APROVADO: "confirmed",
  ACEITO: "confirmed",
  SEPARACAO: "shipped",
  ENVIADO: "shipped",
  ENTREGUE: "delivered",
  DEVOLUCAO: "cancelled",
  REJEITADO: "cancelled",
};

@Injectable()
export class OrdersService {
  private readonly cartUrl = process.env.CART_URL ?? "http://cart:3030";

  private readonly internalKey = process.env.INTERNAL_KEY ?? "";

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly catalog: CatalogService,
  ) {}

  async create(
    dto: CreateOrderDto,
    userId: string,
    userName: string,
    token: string,
  ) {
    const cart = await this.getCart(userId, token);

    if (!cart.items.length) {
      throw new BadRequestException("Carrinho está vazio");
    }

    const enderecoUuid = randomUUID();

    await this.prisma.endereco_de_entrega.create({
      data: {
        endereco_uuid: enderecoUuid,
        endereco_uf: dto.shippingAddress.state.substring(0, 45),
        endereco_municipio: dto.shippingAddress.city.substring(0, 45),
        endereco_logradouro: dto.shippingAddress.street.substring(0, 45),
        endereco_numero: dto.shippingAddress.number ?? 0,
        endereco_complemento:
          dto.shippingAddress.complement?.substring(0, 45) ?? null,
        endereco_cep: dto.shippingAddress.zipCode.substring(0, 10),
        endereco_usuario_uuid: userId,
      },
    });

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtAdd,
      0,
    );

    const pedidoUuid = randomUUID();

    await this.prisma.pedido.create({
      data: {
        pedido_uuid: pedidoUuid,
        pedido_valor_total: Math.round(totalAmount),
        usuario_uuid: userId,
        endereco_de_entrega_uuid: enderecoUuid,
        status_pedido_id: this.catalog.statusPedidoId("PENDENTE"),
        pedido_nome_destinatario: (userName || "Cliente").substring(0, 150),
      },
    });

    for (const item of cart.items) {
      await this.prisma.item_pedido.create({
        data: {
          pedido_uuid: pedidoUuid,
          id_produto: Number(item.productId),
          item_pedido_nome_produto: item.productName.substring(0, 150),
          item_pedido_preco: Math.round(item.priceAtAdd),
          item_pedido_total_preco: Math.round(item.priceAtAdd * item.quantity),
          item_pedido_quantidade: item.quantity,
        },
      });
    }

    const installments = dto.payment.installments ?? 1;

    const valorParcelas = Math.round((totalAmount * 100) / installments) / 100;

    const valorPrimeiraParcela =
      Math.round(totalAmount) - Math.round(valorParcelas * (installments - 1));

    const metodoPagamentoNome = this.catalog.metodoPagamentoNome(
      dto.payment.methodId,
    );

    await this.prisma.pagamento.create({
      data: {
        pagamento_uuid: randomUUID(),

        metodos_de_pagamento_id: dto.payment.methodId,

        codigo_do_pagamento:
          dto.payment.code ?? this.generatePaymentCode(metodoPagamentoNome),

        pedido_uuid: pedidoUuid,

        status_pagamento_id: this.catalog.statusPagamentoId("AGUARDANDO_AUTH"),

        pagamento_numero_parcelas: installments,

        pagamento_valor_parcelas: Math.round(valorParcelas),

        pagamento_valor_primeira_parcela: valorPrimeiraParcela,
      },
    });

    await this.prisma.pedido.update({
      where: {
        pedido_uuid: pedidoUuid,
      },
      data: {
        status_pedido_id: this.catalog.statusPedidoId("APROVADO"),
      },
    });

    await this.clearCart(userId);

    return this.findOne(pedidoUuid, userId);
  }
  async findAll(userId: string) {
    const orders = await this.prisma.pedido.findMany({
      where: {
        usuario_uuid: userId,
      },
      include: {
        item_pedido: true,
        status_pedido: true,
        endereco_de_entrega: true,
        pagamento: {
          include: {
            metodo: true,
            status: true,
          },
        },
      },
      orderBy: {
        pedido_created_at: "desc",
      },
    });

    return orders.map((order) => this.serialize(order));
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.pedido.findUnique({
      where: {
        pedido_uuid: id,
      },
      include: {
        item_pedido: true,
        status_pedido: true,
        endereco_de_entrega: true,
        pagamento: {
          include: {
            metodo: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }

    if (order.usuario_uuid !== userId) {
      throw new ForbiddenException("Acesso negado");
    }

    return this.serialize(order);
  }

  private async getCart(userId: string, token: string): Promise<Cart> {
    const { data } = await firstValueFrom(
      this.http.get<Cart>(`${this.cartUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      }),
    );

    return data;
  }

  private async clearCart(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.cartUrl}/cart`, {
          headers: {
            "x-internal-key": this.internalKey,
            "x-user-id": userId,
          },
        }),
      );
    } catch {
      // A limpeza do carrinho não deve impedir a conclusão da compra.
      // Idealmente registrar um log aqui.
    }
  }
  private generatePaymentCode(method: string): string {
    const rand = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    switch (method.toUpperCase()) {
      case "PIX":
        return `PIX-${rand()}-${rand()}`;

      case "BOLETO_BANCARIO":
        return `34191.${rand()} ${rand()}.${rand()} ${rand()}.${rand()} 1`;

      case "CARTAO_CREDITO":
        return `CARD-${rand()}`;

      default:
        return rand();
    }
  }

  private serialize(order: {
    pedido_uuid: string;
    usuario_uuid: string;
    pedido_valor_total: number;
    pedido_created_at: Date;
    status_pedido: {
      status_pedido_id: number;
      status_pedido_nome: string | null;
    } | null;
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
      metodos_de_pagamento_id: number;
      pagamento_numero_parcelas: number | null;
      pagamento_valor_parcelas: number | null;
      codigo_do_pagamento: string;
      metodo: {
        metodo_de_pagamento_nome: string | null;
      } | null;
      status: {
        status_pagamento_nome: string;
      } | null;
    }[];
  }) {
    const statusNome = order.status_pedido?.status_pedido_nome ?? "PENDENTE";

    const status = STATUS_MAP[statusNome] ?? "pending";

    const pagamento = order.pagamento.length > 0 ? order.pagamento[0] : null;

    return {
      id: order.pedido_uuid,

      userId: order.usuario_uuid,

      status,

      totalAmount: order.pedido_valor_total,

      items: order.item_pedido.map((item) => ({
        id: item.item_pedido_id.toString(),
        productId: item.id_produto.toString(),
        productName: item.item_pedido_nome_produto,
        size: "",
        quantity: item.item_pedido_quantidade,
        unitPrice: item.item_pedido_preco,
      })),

      shippingAddress: {
        street: order.endereco_de_entrega?.endereco_logradouro ?? "",

        city: order.endereco_de_entrega?.endereco_municipio ?? "",

        state: order.endereco_de_entrega?.endereco_uf ?? "",

        zipCode: order.endereco_de_entrega?.endereco_cep ?? "",

        country: "Brasil",
      },

      payment: pagamento
        ? {
            id: pagamento.pagamento_uuid,

            method: this.catalog.metodoPagamentoNome(
              pagamento.metodos_de_pagamento_id,
            ),

            methodLabel:
              pagamento.metodo?.metodo_de_pagamento_nome ??
              this.catalog.metodoPagamentoNome(
                pagamento.metodos_de_pagamento_id,
              ),

            installments: pagamento.pagamento_numero_parcelas ?? 1,

            installmentValue:
              pagamento.pagamento_valor_parcelas ?? order.pedido_valor_total,

            code: pagamento.codigo_do_pagamento,

            status: pagamento.status?.status_pagamento_nome ?? "DESCONHECIDO",
          }
        : null,

      createdAt: order.pedido_created_at.toISOString(),
    };
  }
}
