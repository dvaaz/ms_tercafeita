import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CadastroDto } from './dto/cadastro.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async cadastro(dto: CadastroDto) {
    const existing = await this.prisma.usuarios.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const byCpf = await this.prisma.usuarios.findUnique({ where: { cpf: dto.cpf } });
    if (byCpf) throw new ConflictException('CPF já cadastrado');

    const email = dto.email.trim().toLowerCase();
    const senha_hash = await bcrypt.hash(dto.senha, 10);
    const nome = dto.sobrenome ? `${dto.nome} ${dto.sobrenome}` : dto.nome;

    await this.prisma.usuarios.create({
      data: { email: email, nome, cpf: dto.cpf, senha_hash, role: 'user' },
    });

    return { message: 'Usuário cadastrado com sucesso' };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuarios.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const senha_hash = await bcrypt.hash(dto.password, 10);
    const cpf = `00000000${Date.now()}`.slice(-11);

    const user = await this.prisma.usuarios.create({
      data: { email: dto.email, nome: dto.name, cpf, senha_hash, role: 'user' },
    });

    const { accessToken, refreshToken } = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.serialize(user), token: accessToken, refresh_token: refreshToken, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    const senha = dto.senha ?? dto.password;

    if (!email || !senha) {
      throw new UnauthorizedException('Email e senha são obrigatórios');
    }

    const user = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { accessToken, refreshToken } = await this.issueTokens(
      user.id,
      user.email,
      user.role,
    );

    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    return {
      user: this.serialize(user),
      accessToken,
      refreshToken,
      token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = await this.prisma.usuarios.findUnique({ where: { id: payload.sub } });
    if (!user || user.refresh_token !== refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const accessToken = this.signAccessToken(user.id, user.email, user.role);
    return { token: accessToken, accessToken };
  }

  async findById(id: string) {
    const user = await this.prisma.usuarios.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.serialize(user);
  }

  async alterarSenha(userId: string, dto: AlterarSenhaDto) {
    const user = await this.prisma.usuarios.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (!(await bcrypt.compare(dto.senha_atual, user.senha_hash))) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const senha_hash = await bcrypt.hash(dto.nova_senha, 10);
    await this.prisma.usuarios.update({ where: { id: userId }, data: { senha_hash } });
    return { message: 'Senha alterada com sucesso' };
  }

  private async issueTokens(sub: string, email: string, role: string) {
    const accessToken = this.signAccessToken(sub, email, role);
    const refreshToken = this.signRefreshToken(sub, email, role);
    return { accessToken, refreshToken };
  }

  private signAccessToken(sub: string, email: string, role: string) {
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '12h') as StringValue;

    return this.jwt.sign({ sub, email, role }, {
      expiresIn,
    });
  }

  private signRefreshToken(sub: string, email: string, role: string) {
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue;

    return this.jwt.sign({ sub, email, role }, {
      secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      expiresIn,
    });
  }

  serialize(user: { id: string; nome: string; email: string; role: string; data_criacao: Date }) {
    return {
      id: user.id,
      nome: user.nome,
      name: user.nome,
      email: user.email,
      role: user.role,
      createdAt: user.data_criacao.toISOString(),
    };
  }
}
