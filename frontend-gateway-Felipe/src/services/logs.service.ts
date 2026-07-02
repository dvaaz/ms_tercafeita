import { api } from "../api/axios";
import type { RequestLog } from "../types/request-logs";

export async function getRequestLogs(): Promise<RequestLog[]> {
  const response = await api.get<RequestLog[]>("/request-logs");
  return response.data;
}

export async function getRequestLogById(id: string): Promise<RequestLog> {
  const response = await api.get<RequestLog>(`/request-logs/${id}`);
  return response.data;
}