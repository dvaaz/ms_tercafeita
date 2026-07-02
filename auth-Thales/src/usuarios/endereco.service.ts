import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnderecoDto } from './dto/create-endereco.dto';

@Injectable()
export class EnderecoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.enderecos.findMany({ where: { usuario_id: userId }, orderBy: { id: 'asc' } });
  }

  async create(userId: string, dto: CreateEnderecoDto) {
    return this.prisma.enderecos.create({
      data: {
        usuario_id: userId,
        nome: dto.nome,
        cep: dto.cep.replace(/\D/g, '').substring(0, 8),
        rua: dto.rua,
        numero: dto.numero ?? null,
        complemento: dto.complemento ?? null,
      },
    });
  }

  async update(id: number, userId: string, dto: CreateEnderecoDto) {
    const endereco = await this.prisma.enderecos.findUnique({ where: { id } });
    if (!endereco) throw new NotFoundException(`Endereço ${id} não encontrado`);
    if (endereco.usuario_id !== userId) throw new ForbiddenException('Acesso negado');

    return this.prisma.enderecos.update({
      where: { id },
      data: {
        nome: dto.nome,
        cep: dto.cep.replace(/\D/g, '').substring(0, 8),
        rua: dto.rua,
        numero: dto.numero ?? null,
        complemento: dto.complemento ?? null,
      },
    });
  }

  async remove(id: number, userId: string) {
    const endereco = await this.prisma.enderecos.findUnique({ where: { id } });
    if (!endereco) throw new NotFoundException(`Endereço ${id} não encontrado`);
    if (endereco.usuario_id !== userId) throw new ForbiddenException('Acesso negado');

    await this.prisma.enderecos.delete({ where: { id } });
    return { message: 'Endereço excluído com sucesso' };
  }
}
