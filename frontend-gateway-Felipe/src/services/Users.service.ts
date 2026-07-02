import { api } from "../api/axios";
import type { CreateUserRequest, UpdateUserRequest, User } from "../types/User";

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/users/buscar-todos");
  return response.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/buscar/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await api.post<User>("/users/criar-usuario", data);
  return response.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<User> {
  const response = await api.put<User>(`/users/atualizar-usuario/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/deleter-usuario/${id}`);
}