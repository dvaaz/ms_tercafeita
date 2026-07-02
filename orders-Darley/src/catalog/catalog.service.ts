import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type CatalogCache = {
  byId: Map<number, string>;
  byName: Map<string, number>;
};

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);

  private readonly cache: Record<
    "statusPedido" | "statusPagamento" | "metodoPagamento",
    CatalogCache
  > = {
    statusPedido: {
      byId: new Map(),
      byName: new Map(),
    },

    statusPagamento: {
      byId: new Map(),
      byName: new Map(),
    },

    metodoPagamento: {
      byId: new Map(),
      byName: new Map(),
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const [statusPedidos, statusPagamentos, metodosPagamento] =
      await Promise.all([
        this.prisma.status_pedido.findMany({
          select: {
            status_pedido_id: true,
            status_pedido_nome: true,
          },
        }),

        this.prisma.status_pagamento.findMany({
          select: {
            status_pagamento_id: true,
            status_pagamento_nome: true,
          },
        }),

        this.prisma.metodos_de_pagamento.findMany({
          select: {
            metodos_de_pagamento_id: true,
            metodo_de_pagamento_nome: true,
          },
        }),
      ]);

    this.fillCache(
      statusPedidos.map((i) => ({
        id: i.status_pedido_id,
        nome: i.status_pedido_nome,
      })),
      this.cache.statusPedido,
    );

    this.fillCache(
      statusPagamentos.map((i) => ({
        id: i.status_pagamento_id,
        nome: i.status_pagamento_nome,
      })),
      this.cache.statusPagamento,
    );

    this.fillCache(
      metodosPagamento.map((i) => ({
        id: i.metodos_de_pagamento_id,
        nome: i.metodo_de_pagamento_nome,
      })),
      this.cache.metodoPagamento,
    );

    this.logger.log("Catálogos carregados.");
  }

  private fillCache(
    items: { id: number; nome: string | null }[],
    cache: CatalogCache,
  ) {
    for (const item of items) {
      if (!item.nome) continue;

      const nome = item.nome.trim().toUpperCase();

      cache.byId.set(item.id, nome);
      cache.byName.set(nome, item.id);
    }
  }

  private getByName(cache: CatalogCache, nome: string, tipo: string): number {
    const value = cache.byName.get(nome.trim().toUpperCase());

    if (value === undefined) {
      throw new InternalServerErrorException(
        `${tipo} '${nome}' não encontrado.`,
      );
    }

    return value;
  }

  private getById(cache: CatalogCache, id: number, tipo: string): string {
    const value = cache.byId.get(id);

    if (!value) {
      throw new InternalServerErrorException(`${tipo} '${id}' não encontrado.`);
    }

    return value;
  }

  statusPedidoId(nome: string): number {
    return this.getByName(this.cache.statusPedido, nome, "Status do pedido");
  }

  statusPedidoNome(id: number): string {
    return this.getById(this.cache.statusPedido, id, "Status do pedido");
  }

  statusPagamentoId(nome: string): number {
    return this.getByName(
      this.cache.statusPagamento,
      nome,
      "Status do pagamento",
    );
  }

  statusPagamentoNome(id: number): string {
    return this.getById(this.cache.statusPagamento, id, "Status do pagamento");
  }

  metodoPagamentoId(nome: string): number {
    return this.getByName(
      this.cache.metodoPagamento,
      nome,
      "Método de pagamento",
    );
  }

  metodoPagamentoNome(id: number): string {
    return this.getById(this.cache.metodoPagamento, id, "Método de pagamento");
  }
}
