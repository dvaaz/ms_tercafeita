import { api } from "../api/axios";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/gateway/auth/login", data);
  return response.data;
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem("gateway_refresh_token");

  const response = await api.post("/auth/refresh", {
    refreshToken,
  });

  return response.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {}

  localStorage.removeItem("gateway_token");
  localStorage.removeItem("gateway_refresh_token");
}

export function getToken() {
  return localStorage.getItem("gateway_token");
}

export function isAuthenticated() {
  return !!getToken();
}