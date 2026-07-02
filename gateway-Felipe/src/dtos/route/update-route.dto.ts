export class UpdateRouteDto {
  name?: string;
  path?: string;
  targetUrl?: string;
  method?: string;
  requiresAuth?: boolean;
  isActive?: number;
}