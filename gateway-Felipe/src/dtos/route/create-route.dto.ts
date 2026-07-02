export class CreateRouteDto {
  name!: string;
  path!: string;
  targetUrl!: string;
  method!: string;
  requiresAuth!: boolean;
}