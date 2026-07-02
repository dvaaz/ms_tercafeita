import { RouteConfig } from 'src/models/route-config,model';
import { CreateRouteDto } from 'src/dtos/route/create-route.dto';
import { UpdateRouteDto } from 'src/dtos/route/update-route.dto';

export interface IRouteConfigService {
  create(data: CreateRouteDto): Promise<RouteConfig>;
  findAll(): Promise<RouteConfig[]>;
  findById(id: string): Promise<RouteConfig | null>;
  findByPathAndMethod(path: string, method: string): Promise<RouteConfig | null>;
  update(id: string, data: UpdateRouteDto): Promise<RouteConfig>;
  delete(id: string): Promise<void>;
}