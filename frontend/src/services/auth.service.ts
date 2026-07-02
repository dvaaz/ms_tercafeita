import { api } from '../api/client';
import type { AuthResponse, User } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await api.patch('/usuarios/me/senha', {senha_atual: currentPassword, nova_senha: newPassword,});
}
