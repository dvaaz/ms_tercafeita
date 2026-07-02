import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateRespostaDto } from './dto/create-resposta.dto';

interface AuthUser { id: string; name: string; nome: string; email: string }

@Injectable()
export class ReviewsService {
  private readonly authUrl = process.env.AUTH_URL ?? 'http://auth:3040';

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  private async fetchUser(userId: string): Promise<{ name: string } | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<AuthUser>(`${this.authUrl}/auth/users/${userId}`),
      );
      return { name: data.nome ?? data.name ?? 'Usuário' };
    } catch {
      return null;
    }
  }

  private serializeAvaliacao(a: {
    id_avaliacao: number;
    UUID: string;
    id_produto: number;
    nota: number;
    titulo: string | null;
    comentario: string | null;
    data_criacao: Date;
    curtidas?: { id_curtida: number; UUID: string }[];
    respostas?: { id_resposta: number; comentario: string; data_criacao: Date }[];
  }, userName = 'Usuário') {
    return {
      id: a.id_avaliacao,
      userId: a.UUID,
      user: { name: userName },
      productId: a.id_produto,
      nota: a.nota,
      rating: a.nota,
      titulo: a.titulo ?? null,
      comentario: a.comentario ?? null,
      comment: a.comentario ?? null,
      curtidas: (a.curtidas ?? []).length,
      respostas: (a.respostas ?? []).map((r) => ({
        id: r.id_resposta,
        comentario: r.comentario,
        criadoEm: r.data_criacao.toISOString(),
      })),
      criadoEm: a.data_criacao.toISOString(),
      createdAt: a.data_criacao.toISOString(),
    };
  }

  async findByProduct(productId: string) {
    const id = parseInt(productId, 10);
    if (isNaN(id)) return [];

    const avaliacoes = await this.prisma.avaliacao.findMany({
      where: { id_produto: id },
      include: { curtidas: true, respostas: true },
      orderBy: { data_criacao: 'desc' },
    });

    return Promise.all(
      avaliacoes.map(async (a) => {
        const user = await this.fetchUser(a.UUID);
        return this.serializeAvaliacao(a, user?.name ?? 'Usuário');
      }),
    );
  }

  async create(dto: CreateReviewDto, userId: string) {    
    const user = await this.fetchUser(userId);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado no sistema');
    }

    const existing = await this.prisma.avaliacao.findFirst({
      where: { UUID: userId, id_produto: dto.productId },
    });
    if (existing) {
      throw new ConflictException('Você já avaliou este produto');
    }

    const now = new Date();
    const avaliacao = await this.prisma.avaliacao.create({
      data: {
        UUID: userId,
        id_produto: dto.productId,
        nota: dto.nota,
        titulo: dto.titulo ?? null,
        comentario: dto.comentario ?? null,
        data_criacao: now,
        data_atualizacao: now,
      },
      include: { curtidas: true, respostas: true },
    });

    return this.serializeAvaliacao(avaliacao, user.name);
  }

  async remove(id: number, userId: string) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id_avaliacao: id },
    });
    if (!avaliacao) throw new NotFoundException(`Avaliação ${id} não encontrada`);
    if (avaliacao.UUID !== userId) throw new ForbiddenException('Você não pode excluir a avaliação de outro usuário');
    
    await this.prisma.curtida.deleteMany({ where: { id_avaliacao: id } });
    await this.prisma.resposta.deleteMany({ where: { id_avaliacao: id } });
    await this.prisma.avaliacao.delete({ where: { id_avaliacao: id } });
  }

  async curtir(avaliacaoId: number, userId: string) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id_avaliacao: avaliacaoId },
    });
    if (!avaliacao) throw new NotFoundException(`Avaliação ${avaliacaoId} não encontrada`);

    try {
      await this.prisma.curtida.create({
        data: { id_avaliacao: avaliacaoId, UUID: userId },
      });
    } catch {
      throw new ConflictException('Você já curtiu esta avaliação');
    }

    return { message: 'Avaliação curtida com sucesso' };
  }

  async descurtir(avaliacaoId: number, userId: string) {
    const curtida = await this.prisma.curtida.findUnique({
      where: { id_avaliacao_UUID: { id_avaliacao: avaliacaoId, UUID: userId } },
    });
    if (!curtida) throw new NotFoundException('Curtida não encontrada');

    await this.prisma.curtida.delete({
      where: { id_avaliacao_UUID: { id_avaliacao: avaliacaoId, UUID: userId } },
    });
    return { message: 'Curtida removida' };
  }

  async createResposta(avaliacaoId: number, dto: CreateRespostaDto, userId: string) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id_avaliacao: avaliacaoId },
    });
    if (!avaliacao) throw new NotFoundException(`Avaliação ${avaliacaoId} não encontrada`);

    const user = await this.fetchUser(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado no sistema');

    const now = new Date();
    const resposta = await this.prisma.resposta.create({
      data: {
        id_avaliacao: avaliacaoId,
        comentario: dto.comentario,
        data_criacao: now,
        data_atualizacao: now,
      },
    });

    return {
      id: resposta.id_resposta,
      id_avaliacao: resposta.id_avaliacao,
      comentario: resposta.comentario,
      userId,
      user: { name: user.name },
      criadoEm: resposta.data_criacao.toISOString(),
    };
  }

  async removeResposta(respostaId: number, avaliacaoId: number) {
    const resposta = await this.prisma.resposta.findFirst({
      where: { id_resposta: respostaId, id_avaliacao: avaliacaoId },
    });
    if (!resposta) throw new NotFoundException(`Resposta ${respostaId} não encontrada`);

    await this.prisma.resposta.delete({ where: { id_resposta: respostaId } });
  }
}
