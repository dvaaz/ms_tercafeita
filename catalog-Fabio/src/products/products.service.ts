import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';

type ProdutoWithRelations = {
  id_produto: number;
  nome_produto: string;
  preco_produto: number;
  url_imagem: string | null;
  categoria: { nome_categoria: string } | null;
  estoque: { id_estoque: number; quantidade_estoque: number } | null;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsQueryDto) {
    const { page = 1, limit = 12, category, search } = query;
    const skip = (page - 1) * limit;

    let categoriaId: number | undefined;
    if (category) {
      const cat = await this.prisma.categoria.findFirst({
        where: { nome_categoria: { contains: category } },
      });
      if (!cat) return { data: [], total: 0, page, limit };
      categoriaId = cat.id_categoria;
    }

    const where = {
      ...(search ? { nome_produto: { contains: search } } : {}),
      ...(categoriaId !== undefined ? { categoria_id_categoria: categoriaId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        include: { categoria: true, estoque: true },
        skip,
        take: limit,
        orderBy: { id_produto: 'asc' },
      }),
      this.prisma.produto.count({ where }),
    ]);

    return { data: data.map((p) => this.serialize(p)), total, page, limit };
  }

  async findOne(id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) throw new NotFoundException(`Produto ${id} não encontrado`);

    const product = await this.prisma.produto.findUnique({
      where: { id_produto: idNum },
      include: { categoria: true, estoque: true },
    });
    if (!product) throw new NotFoundException(`Produto ${id} não encontrado`);
    return this.serialize(product);
  }

  async create(dto: CreateProductDto) {
    let categoria = await this.prisma.categoria.findFirst({
      where: { nome_categoria: dto.category },
    });
    if (!categoria) {
      categoria = await this.prisma.categoria.create({
        data: { nome_categoria: dto.category, descricao_categoria: dto.category },
      });
    }

    const estoque = await this.prisma.estoque.create({
      data: {
        quantidade_estoque: dto.stock ?? 0,
        disponibilidade_estoque: (dto.stock ?? 0) > 0 ? 'DISPONIVEL' : 'INDISPONIVEL',
      },
    });

    const product = await this.prisma.produto.create({
      data: {
        nome_produto: dto.name,
        preco_produto: Math.round(dto.price),
        url_imagem: dto.imageUrl ?? null,
        categoria_id_categoria: categoria.id_categoria,
        estoque_id_estoque: estoque.id_estoque,
      },
      include: { categoria: true, estoque: true },
    });

    return this.serialize(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const idNum = parseInt(id, 10);
    await this.findOne(id);

    const productData: Record<string, unknown> = {};
    if (dto.name !== undefined) productData.nome_produto = dto.name;
    if (dto.price !== undefined) productData.preco_produto = Math.round(dto.price);
    if (dto.imageUrl !== undefined) productData.url_imagem = dto.imageUrl;

    if (dto.category !== undefined) {
      let categoria = await this.prisma.categoria.findFirst({
        where: { nome_categoria: dto.category },
      });
      if (!categoria) {
        categoria = await this.prisma.categoria.create({
          data: { nome_categoria: dto.category, descricao_categoria: dto.category },
        });
      }
      productData.categoria_id_categoria = categoria.id_categoria;
    }

    const product = await this.prisma.produto.update({
      where: { id_produto: idNum },
      data: productData,
      include: { categoria: true, estoque: true },
    });

    if (dto.stock !== undefined && product.estoque_id_estoque) {
      await this.prisma.estoque.update({
        where: { id_estoque: product.estoque_id_estoque },
        data: {
          quantidade_estoque: dto.stock,
          disponibilidade_estoque: dto.stock > 0 ? 'DISPONIVEL' : 'INDISPONIVEL',
        },
      });
      return this.serialize({ ...product, estoque: { id_estoque: product.estoque_id_estoque, quantidade_estoque: dto.stock } });
    }

    return this.serialize(product);
  }

  async remove(id: string) {
    const idNum = parseInt(id, 10);
    await this.findOne(id);
    await this.prisma.produto.delete({ where: { id_produto: idNum } });
  }

  private serialize(product: ProdutoWithRelations) {
    return {
      id: product.id_produto.toString(),
      name: product.nome_produto,
      description: '',
      price: product.preco_produto,
      imageUrl: product.url_imagem ?? '',
      category: product.categoria?.nome_categoria ?? 'sem categoria',
      sizes: [] as { size: string; stock: number }[],
      stock: product.estoque?.quantidade_estoque ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
