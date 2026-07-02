import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { randomUUID } from 'crypto';

interface ProductResponse {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ItemRaw {
  id: string;
  carrinho_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: Decimal;
  produto: { id: string; nome: string; preco: Decimal };
}

interface CarrinhoRaw {
  id: string;
  usuario_id: string | null;
  session_id: string | null;
  item_carrinho: ItemRaw[];
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('userId ou sessionId é obrigatório');
    }

    if (userId) await this.ensureUsuario(userId, userId, `${userId}@shirtstore.internal`);

    let cart = await this.prisma.carrinho.findFirst({
      where: userId ? { usuario_id: userId } : { session_id: sessionId },
      include: { item_carrinho: { include: { produto: true } } },
    });

    if (!cart) {
      cart = await this.prisma.carrinho.create({
        data: {
          id: randomUUID(),
          ...(userId ? { usuario_id: userId } : { session_id: sessionId }),
          status: 'ATIVO',
        },
        include: { item_carrinho: { include: { produto: true } } },
      });
    }

    return this.serialize(cart as CarrinhoRaw);
  }

  async addItem(dto: AddItemDto, userId?: string, sessionId?: string) {
    const cartData = await this.getOrCreateCart(userId, sessionId);
    const cart = await this.prisma.carrinho.findUniqueOrThrow({
      where: { id: cartData.id },
      include: { item_carrinho: { include: { produto: true } } },
    });

    const product = await this.fetchProduct(dto.productId);
    
    await this.prisma.produto.upsert({
      where: { id: dto.productId },
      update: { nome: product.name, preco: product.price, estoque_disponivel: product.stock },
      create: {
        id: dto.productId,
        nome: product.name,
        sku: `PROD-${dto.productId}`,
        preco: product.price,
        estoque_disponivel: product.stock,
      },
    });

    const existing = cart.item_carrinho.find((i) => i.produto_id === dto.productId);

    if (existing) {
      await this.prisma.item_carrinho.update({
        where: { id: existing.id },
        data: { quantidade: existing.quantidade + dto.quantity },
      });
    } else {
      await this.prisma.item_carrinho.create({
        data: {
          id: randomUUID(),
          carrinho_id: cart.id,
          produto_id: dto.productId,
          quantidade: dto.quantity,
          preco_unitario: product.price,
        },
      });
    }

    await this.prisma.carrinho.update({
      where: { id: cart.id },
      data: { data_atualizacao: new Date() },
    });

    const updated = await this.prisma.carrinho.findUniqueOrThrow({
      where: { id: cart.id },
      include: { item_carrinho: { include: { produto: true } } },
    });
    return this.serialize(updated as CarrinhoRaw);
  }

  async updateItem(itemId: string, dto: UpdateItemDto, userId?: string, sessionId?: string) {
    const cartData = await this.getOrCreateCart(userId, sessionId);
    const item = await this.prisma.item_carrinho.findFirst({
      where: { id: itemId, carrinho_id: cartData.id },
    });
    if (!item) throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);

    const updated = await this.prisma.item_carrinho.update({
      where: { id: itemId },
      data: { quantidade: dto.quantity },
    });

    return {
      id: updated.id,
      cartId: updated.carrinho_id,
      productId: updated.produto_id,
      size: '',
      quantity: updated.quantidade,
      priceAtAdd: parseFloat(updated.preco_unitario.toString()),
    };
  }

  async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cartData = await this.getOrCreateCart(userId, sessionId);
    const item = await this.prisma.item_carrinho.findFirst({
      where: { id: itemId, carrinho_id: cartData.id },
    });
    if (!item) throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    await this.prisma.item_carrinho.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.carrinho.findFirst({ where: { usuario_id: userId } });
    if (cart) {
      await this.prisma.item_carrinho.deleteMany({ where: { carrinho_id: cart.id } });
    }
  }

  async mergeCart(dto: MergeCartDto, userId: string) {
    await this.ensureUsuario(userId, userId, `${userId}@shirtstore.internal`);

    const guestCart = await this.prisma.carrinho.findFirst({
      where: { session_id: dto.sessionId },
      include: { item_carrinho: { include: { produto: true } } },
    });

    if (!guestCart || guestCart.item_carrinho.length === 0) {
      return this.getOrCreateCart(userId);
    }

    let userCart = await this.prisma.carrinho.findFirst({
      where: { usuario_id: userId },
      include: { item_carrinho: { include: { produto: true } } },
    });

    if (!userCart) {
      userCart = await this.prisma.carrinho.create({
        data: { id: randomUUID(), usuario_id: userId, status: 'ATIVO' },
        include: { item_carrinho: { include: { produto: true } } },
      });
    }

    for (const guestItem of guestCart.item_carrinho) {
      const existing = userCart.item_carrinho.find(
        (i) => i.produto_id === guestItem.produto_id,
      );
      if (existing) {
        await this.prisma.item_carrinho.update({
          where: { id: existing.id },
          data: { quantidade: existing.quantidade + guestItem.quantidade },
        });
      } else {
        await this.prisma.item_carrinho.create({
          data: {
            id: randomUUID(),
            carrinho_id: userCart.id,
            produto_id: guestItem.produto_id,
            quantidade: guestItem.quantidade,
            preco_unitario: guestItem.preco_unitario,
          },
        });
      }
    }

    await this.prisma.carrinho.delete({ where: { id: guestCart.id } });

    const merged = await this.prisma.carrinho.findUniqueOrThrow({
      where: { id: userCart.id },
      include: { item_carrinho: { include: { produto: true } } },
    });
    return this.serialize(merged as CarrinhoRaw);
  }

  private async fetchProduct(productId: string): Promise<ProductResponse> {
    const catalogUrl = process.env.CATALOG_URL ?? 'http://catalog:3010';
    const { data } = await firstValueFrom(
      this.http.get<ProductResponse>(`${catalogUrl}/products/${productId}`),
    );
    return data;
  }

  private async ensureUsuario(id: string, nome: string, email: string) {
    await this.prisma.usuario.upsert({
      where: { id },
      update: {},
      create: { id, nome: nome.substring(0, 150), email },
    });
  }

  private serialize(cart: CarrinhoRaw) {
    const items = cart.item_carrinho.map((i) => ({
      id: i.id,
      cartId: i.carrinho_id,
      productId: i.produto_id,
      productName: i.produto?.nome ?? '',
      size: '',
      quantity: i.quantidade,
      priceAtAdd: parseFloat(i.preco_unitario.toString()),
    }));

    const total = items.reduce((sum, i) => sum + i.quantity * i.priceAtAdd, 0);

    return {
      id: cart.id,
      userId: cart.usuario_id,
      items,
      total: parseFloat(total.toFixed(2)),
    };
  }
}
