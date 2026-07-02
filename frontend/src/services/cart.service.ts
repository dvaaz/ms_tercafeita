import { api } from '../api/client';
import { mapCart } from '../mappers';
import type { Cart } from '../types';

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Record<string, unknown>>('/cart');
  return mapCart(data);
}

export async function addCartItem(
  productId: string,
  size: string,
  quantity: number,
): Promise<Cart> {
  const { data } = await api.post<Record<string, unknown>>('/cart/items', { productId, size, quantity });
  return mapCart(data);
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await api.put<Record<string, unknown>>(`/cart/items/${itemId}`, { quantity });
  return mapCart(data);
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await api.delete<Record<string, unknown>>(`/cart/items/${itemId}`);
  return mapCart(data);
}

export async function mergeCart(sessionId: string): Promise<Cart> {
  const { data } = await api.post<Record<string, unknown>>('/cart/merge', { sessionId });
  return mapCart(data);
}
