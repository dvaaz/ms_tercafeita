import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import { Observable } from "rxjs";
import { JwtSecretsService } from "src/services/jwt-secret.service";

@Injectable()
export class ExternalJwtGuard implements CanActivate {
    constructor (
        private readonly jwtSecretService: JwtSecretsService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();        
        const authHeader = request.headers.authorization;

        if(!authHeader){
            throw new UnauthorizedException('Token não informado.')
        }

        const [type, token] = authHeader.split(' ');

        if(type !== 'Bearer' || !token){
            throw new UnauthorizedException('Token inválido.');
        }

        const activeSecret = await this.jwtSecretService.findActive();

        if(!activeSecret){
            throw new UnauthorizedException('Nenhuma JWT secret ativa encontrada.')
        }

        try{

            const decoded = jwt.verify(token, activeSecret.secret);

            request.externalUser = decoded;
            return true;
        }catch {
            throw new UnauthorizedException('Token externo invalido.');
        }
    }
    
}