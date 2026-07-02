import { api } from '../api/client';
import { mapOrder } from '../mappers';
import type { Order, Address, PaymentInfo } from '../types';

export async function createOrder(shippingAddress: Address, payment: PaymentInfo): Promise<Order> {
  const { data } = await api.post<Record<string, unknown>>('/orders', { shippingAddress, payment });
  return mapOrder(data);
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await api.get<Record<string, unknown>[]>('/orders');
  return data.map(mapOrder);
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<Record<string, unknown>>(`/orders/${id}`);
  return mapOrder(data);
}
