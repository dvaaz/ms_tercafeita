import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosController } from './usuarios/usuarios.controller';
import { EnderecosController } from './usuarios/enderecos.controller';
import { EnderecoService } from './usuarios/endereco.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsuariosController, EnderecosController],
  providers: [EnderecoService],
})
export class AppModule {}
