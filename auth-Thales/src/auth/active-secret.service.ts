import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const CACHE_TTL_MS = 60_000;

// A secret usada pra assinar/validar o token de acesso do cliente vive no
// banco do gateway e rotaciona sozinha a cada 7 dias (ver JwtSecretsService).
// Aqui buscamos ela via HTTP e guardamos em cache curto pra não bater no
// gateway a cada login/requisição.
@Injectable()
export class ActiveSecretService {
  private readonly logger = new Logger(ActiveSecretService.name);
  private cachedSecret: string | null = null;
  private cachedAt = 0;

  constructor(private readonly http: HttpService) {}

  async getActiveSecret(): Promise<string> {
    const now = Date.now();
    if (this.cachedSecret && now - this.cachedAt < CACHE_TTL_MS) {
      return this.cachedSecret;
    }

    const gatewayUrl = process.env.GATEWAY_URL ?? 'http://gateway:3000';

    try {
      const { data } = await firstValueFrom(
        this.http.get<{ secret: string }>(`${gatewayUrl}/jwt-secrets/external/active`, {
          headers: { 'x-api-key': process.env.INTERNAL_API_KEY ?? '' },
        }),
      );
      this.cachedSecret = data.secret;
      this.cachedAt = now;
      return this.cachedSecret;
    } catch (err) {
      if (this.cachedSecret) {
        this.logger.warn('Gateway indisponível, reaproveitando secret em cache.');
        return this.cachedSecret;
      }
      throw err;
    }
  }
}
