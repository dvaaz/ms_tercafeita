import { api } from "../api/axios";
import type { CreateRouteConfigRequest, RouteConfig, UpdateRouteConfigRequest } from "../types/route";

export async function getRoutes(): Promise<RouteConfig[]> {
  const response = await api.get<RouteConfig[]>("/route-configs");
  return response.data;
}

export async function createRoute(data: CreateRouteConfigRequest): Promise<RouteConfig> {
  const response = await api.post<RouteConfig>("/route-configs", data);
  return response.data;
}

export async function updateRoute(
  id: string,
  data: UpdateRouteConfigRequest
): Promise<RouteConfig> {
  const response = await api.put<RouteConfig>(`/route-configs/${id}`, data);
  return response.data;
}

export async function deleteRoute(id: string): Promise<void> {
  await api.delete(`/route-configs/${id}`);
}