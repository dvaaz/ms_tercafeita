import { LoginDto } from "src/dtos/auth/login.dto";

export interface IAuthService {
  login(data: LoginDto): Promise<{ accessToken: string; refreshToken: string; }>;

  refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string; }>;

  validateUser(email: string, password: string): Promise<any>;

  logout(userId: string): Promise<void>;
}