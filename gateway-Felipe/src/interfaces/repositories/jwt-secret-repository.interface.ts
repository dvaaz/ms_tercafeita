import { JwtSecret } from 'src/models/jwt-secret.model';
import { CreateJwtSecretDto } from 'src/dtos/jwt-secret/create-jwt-secret.dto';
import { UpdateJwtSecretDto } from 'src/dtos/jwt-secret/update.jwt.secret.dto';

export interface IJwtSecretRepository {
  create(data: CreateJwtSecretDto): Promise<JwtSecret>;
  findAll(): Promise<JwtSecret[]>;
  findActive(): Promise<JwtSecret | null>;
  findById(id: string): Promise<JwtSecret | null>;
  update(id: string, data: UpdateJwtSecretDto): Promise<JwtSecret>;
  delete(id: string): Promise<void>;
}