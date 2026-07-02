export interface RouteConfig {
  id: string;
  name: string;
  path: string;
  method: string;
  targetUrl: string;
  requiresAuth: boolean;
}

export interface CreateRouteConfigRequest {
  name: string;
  path: string;
  method: string;
  targetUrl: string;
  requiresAuth: boolean;
}

export interface UpdateRouteConfigRequest {
  name?: string;
  path?: string;
  method?: string;
  targetUrl?: string;
  requiresAuth?: boolean;
}
