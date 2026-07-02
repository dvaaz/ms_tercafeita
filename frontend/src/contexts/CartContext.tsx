import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';
import { mapCart } from '../mappers';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, size: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Record<string, unknown>>('/cart');
      setCart(mapCart(data));
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (productId: string, size: string, quantity: number) => {
      const { data } = await api.post<Record<string, unknown>>('/cart/items', {
        productId,
        size,
        quantity,
      });
      // Re-fetch para obter total atualizado
      await fetchCart();
      void data;
    },
    [fetchCart],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      await api.put(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    },
    [fetchCart],
  );

  const mergeGuestCart = useCallback(async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;
    try {
      await api.post('/cart/merge', { sessionId });
      await fetchCart();
    } catch {
      // Se não houver carrinho de convidado, ignora
    }
  }, [fetchCart]);

  // Quando usuário faz login, faz merge do carrinho de convidado
  useEffect(() => {
    if (user) {
      mergeGuestCart().catch(console.error);
    } else {
      fetchCart().catch(console.error);
    }
  }, [user, mergeGuestCart, fetchCart]);

  return (
    <CartContext.Provider
      value={{ cart, loading, fetchCart, addItem, updateItem, removeItem, mergeGuestCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
