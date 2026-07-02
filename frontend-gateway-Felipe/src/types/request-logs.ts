export interface RequestLog {
    id: string;
    method: string;
    originalUrl: string;
    routeType?: string | null;
    targetUrl?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    statusCode?: number | null;
    durationMs?: number | null;
    requestBody?: string | null;
    responseBody?: string | null;
    errorMessage?: string | null;
    createdAt: string;
}