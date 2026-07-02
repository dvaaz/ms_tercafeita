import { api } from "../api/axios";
import type { CreateJwtSecretRequest, JwtSecret, UpdateJwtSecretRequest } from "../types/Jwt-Secret";

export async function getJwtSecrets(): Promise<JwtSecret[]> {
  const response = await api.get<JwtSecret[]>("/jwt-secrets");
  return response.data;
}

export async function getActiveJwtSecrets(): Promise<JwtSecret[]> {
  const response = await api.get<JwtSecret[]>("/jwt-secrets/active");
  return response.data;
}

export async function getJwtSecretById(id: string): Promise<JwtSecret> {
  const response = await api.get<JwtSecret>(`/jwt-secrets/${id}`);
  return response.data;
}

export async function createJwtSecret(
  data: CreateJwtSecretRequest
): Promise<JwtSecret> {
  const response = await api.post<JwtSecret>("/jwt-secrets", data);
  return response.data;
}

export async function updateJwtSecret(
  id: string,
  data: UpdateJwtSecretRequest
): Promise<JwtSecret> {
  const response = await api.put<JwtSecret>(`/jwt-secrets/${id}`, data);
  return response.data;
}

export async function deleteJwtSecret(id: string): Promise<void> {
  await api.delete(`/jwt-secrets/${id}`);
}