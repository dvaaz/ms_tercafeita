export interface JwtSecret {
  id: string;
  name: string;
  secret: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJwtSecretRequest {
  name: string;  
}

export interface UpdateJwtSecretRequest {
  name?: string;
  secret?: string;
  isActive?: boolean;
}