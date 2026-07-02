// Centraliza toda transformação de dados da API para tipos do frontend (regra 18).
// Preços sempre retornados como number.

import type { Product, Cart, CartItem, Order, Review } from '../types';

export function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ''),
    price: Number(raw.price),
    imageUrl: String(raw.imageUrl ?? raw.image_url ?? ''),
    category: String(raw.category),
    sizes: Array.isArray(raw.sizes) ? raw.sizes.map((s: Record<string, unknown>) => ({
      id: String(s.id ?? s.size),
      size: String(s.size),
      stock: Number(s.stock),
    })) : [],
    stock: Number(raw.stock ?? 0),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  };
}

export function mapCartItem(raw: Record<string, unknown>): CartItem {
  return {
    id: String(raw.id),
    cartId: String(raw.cartId ?? raw.cart_id),
    productId: String(raw.productId ?? raw.product_id),
    size: String(raw.size),
    quantity: Number(raw.quantity),
    priceAtAdd: Number(raw.priceAtAdd ?? raw.price_at_add),
  };
}

export function mapCart(raw: Record<string, unknown>): Cart {
  const items = Array.isArray(raw.items)
    ? raw.items.map((i: Record<string, unknown>) => mapCartItem(i))
    : [];
  return {
    id: String(raw.id),
    userId: raw.userId != null ? String(raw.userId) : null,
    items,
    total: Number(raw.total),
  };
}

export function mapOrder(raw: Record<string, unknown>): Order {
  const addr = (raw.shippingAddress ?? {}) as Record<string, unknown>;
  const pag = raw.payment as Record<string, unknown> | null | undefined;
  return {
    id: String(raw.id),
    userId: String(raw.userId ?? raw.user_id),
    status: raw.status as Order['status'],
    items: Array.isArray(raw.items) ? raw.items.map((i: Record<string, unknown>) => ({
      id: String(i.id),
      productId: String(i.productId ?? i.product_id),
      productName: String(i.productName ?? i.product_name),
      size: String(i.size),
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice ?? i.unit_price),
    })) : [],
    totalAmount: Number(raw.totalAmount ?? raw.total_amount),
    shippingAddress: {
      street: String(addr.street ?? ''),
      city: String(addr.city ?? ''),
      state: String(addr.state ?? ''),
      zipCode: String(addr.zipCode ?? addr.zip_code ?? ''),
      country: String(addr.country ?? ''),
    },
    payment: pag
      ? {
          id: String(pag.id ?? ''),
          methodLabel: String(pag.methodLabel ?? pag.method ?? ''),
          installments: Number(pag.installments ?? 1),
          installmentValue: Number(pag.installmentValue ?? 0),
          code: String(pag.code ?? ''),
          status: String(pag.status ?? ''),
        }
      : null,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  };
}

export function mapReview(raw: Record<string, unknown>): Review {
  const nota = Number(raw.nota ?? raw.rating ?? 0);
  return {
    id: Number(raw.id),
    productId: Number(raw.productId ?? raw.id_produto),
    userId: String(raw.userId ?? raw.UUID ?? ''),
    user: raw.user ? { name: String((raw.user as Record<string, unknown>).name ?? 'Usuário') } : undefined,
    nota,
    rating: nota,
    titulo: raw.titulo != null ? String(raw.titulo) : null,
    comentario: raw.comentario != null ? String(raw.comentario) : (raw.comment != null ? String(raw.comment) : null),
    comment: raw.comment != null ? String(raw.comment) : (raw.comentario != null ? String(raw.comentario) : null),
    curtidas: Number(raw.curtidas ?? 0),
    respostas: Array.isArray(raw.respostas) ? raw.respostas as Review['respostas'] : [],
    createdAt: String(raw.createdAt ?? raw.criadoEm ?? ''),
    criadoEm: String(raw.criadoEm ?? raw.createdAt ?? ''),
  };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}
