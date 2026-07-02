import { api } from '../api/client';
import { mapProduct } from '../mappers';
import type { Product, PaginatedResponse } from '../types';

interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export async function listProducts(params: ListProductsParams = {}): Promise<PaginatedResponse<Product>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.category) q.set('category', params.category);
  const { data } = await api.get<PaginatedResponse<Record<string, unknown>>>(`/products?${q}`);
  return { ...data, data: data.data.map(mapProduct) };
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Record<string, unknown>>(`/products/${id}`);
  return mapProduct(data);
}

export async function createProduct(payload: {
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock?: number;
}): Promise<Product> {
  const { data } = await api.post<Record<string, unknown>>('/products', payload);
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  payload: Partial<{
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
  }>,
): Promise<Product> {
  const { data } = await api.patch<Record<string, unknown>>(`/products/${id}`, payload);
  return mapProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
