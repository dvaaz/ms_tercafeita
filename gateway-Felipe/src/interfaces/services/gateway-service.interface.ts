export interface IGatewayService {
  processRequest(method: string, path: string, headers: Record<string, any>, body?: any, query?: any, ip?: string, ): Promise<any>;
}