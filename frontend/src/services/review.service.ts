import { api } from '../api/client';
import type { Review, Resposta } from '../types';

export async function listProductReviews(productId: string | number): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/reviews/product/${productId}`);
  return data.map(normalizeReview);
}

export async function createReview(
  productId: number,
  nota: number,
  options?: { titulo?: string; comentario?: string },
): Promise<Review> {
  const { data } = await api.post<Review>('/reviews', {
    productId,
    nota,
    titulo: options?.titulo,
    comentario: options?.comentario,
  });
  return normalizeReview(data);
}

export async function deleteReview(reviewId: number): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}

export async function curtirReview(reviewId: number): Promise<void> {
  await api.post(`/reviews/${reviewId}/curtida`);
}

export async function descurtirReview(reviewId: number): Promise<void> {
  await api.delete(`/reviews/${reviewId}/curtida`);
}

export async function createResposta(reviewId: number, comentario: string): Promise<Resposta> {
  const { data } = await api.post<Resposta>(`/reviews/${reviewId}/respostas`, { comentario });
  return data;
}

export async function deleteResposta(reviewId: number, respostaId: number): Promise<void> {
  await api.delete(`/reviews/${reviewId}/respostas/${respostaId}`);
}

function normalizeReview(r: Review): Review {
  return {
    ...r,
    id: Number(r.id),
    productId: Number(r.productId),
    nota: r.nota ?? r.rating ?? 0,
    rating: r.rating ?? r.nota ?? 0,
    comment: r.comment ?? r.comentario ?? null,
    comentario: r.comentario ?? r.comment ?? null,
    curtidas: r.curtidas ?? 0,
    respostas: r.respostas ?? [],
  };
}
