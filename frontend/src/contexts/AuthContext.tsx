import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { User, AuthResponse } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token'),
  );

  const saveAuth = (u: User, t: string, rt: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
    localStorage.setItem('refresh_token', rt);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    saveAuth(data.user, data.token, data.refresh_token);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });
      saveAuth(data.user, data.token, data.refresh_token);
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }, []);

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await api.patch('/usuarios/me/senha', { senha_atual: currentPassword, nova_senha: newPassword });
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, updatePassword, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
