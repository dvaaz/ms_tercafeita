import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsuariosController } from "./usuarios/usuarios.controller";
import { EnderecosController } from "./usuarios/enderecos.controller";
import { EnderecoService } from "./usuarios/endereco.service";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule],
  controllers: [UsuariosController, EnderecosController],
  providers: [EnderecoService],
})
export class AppModule {}
