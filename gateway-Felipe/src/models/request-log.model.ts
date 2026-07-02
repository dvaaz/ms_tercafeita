export class RequestLog {
  id: string;
  method: string;
  originalUrl: string;
  routeType: string | null;
  targetUrl: string | null;
  ip?: string | null;
  userAgent?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
  requestBody?: string | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  createdAt: Date | null;

  constructor(data: RequestLog){
    this.id = data.id;
    this.method = data.method;
    this.originalUrl = data.originalUrl;
    this.routeType = data.routeType;
    this.targetUrl = data.targetUrl;
    this.ip = data.ip;
    this.userAgent = data.userAgent;
    this.statusCode = data.statusCode;
    this.durationMs = data.durationMs;
    this.requestBody = data.requestBody;
    this.responseBody = data.responseBody;
    this.errorMessage = data.errorMessage;
    this.createdAt = data.createdAt;

  }
}