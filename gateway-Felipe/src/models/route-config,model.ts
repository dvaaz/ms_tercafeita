export class RouteConfig {
  id: string;
  name: string;
  path: string;
  targetUrl: string;
  method: string;
  requiresAuth: boolean;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RouteConfig){
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.targetUrl = data.targetUrl;
    this.method = data.method;
    this.requiresAuth = data.requiresAuth;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}