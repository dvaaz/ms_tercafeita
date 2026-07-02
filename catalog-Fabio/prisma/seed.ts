import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'Camiseta Básica Preta', price: 50, category: 'Básicas', stock: 20, imageUrl: 'https://placehold.co/400x400/000000/ffffff?text=Básica+Preta' },
  { name: 'Camiseta Básica Branca', price: 50, category: 'Básicas', stock: 20, imageUrl: 'https://placehold.co/400x400/ffffff/000000?text=Básica+Branca' },
  { name: 'Camiseta Básica Cinza', price: 50, category: 'Básicas', stock: 15, imageUrl: 'https://placehold.co/400x400/888888/ffffff?text=Básica+Cinza' },
  { name: 'Camiseta Estampada Rock', price: 80, category: 'Estampadas', stock: 10, imageUrl: 'https://placehold.co/400x400/1a1a2e/ffffff?text=Rock' },
  { name: 'Camiseta Estampada Street', price: 90, category: 'Estampadas', stock: 12, imageUrl: 'https://placehold.co/400x400/16213e/ffffff?text=Street' },
  { name: 'Camiseta Polo Listrada', price: 120, category: 'Polo', stock: 8, imageUrl: 'https://placehold.co/400x400/023e8a/ffffff?text=Polo' },
  { name: 'Camiseta Polo Lisa Azul', price: 110, category: 'Polo', stock: 10, imageUrl: 'https://placehold.co/400x400/03045e/ffffff?text=Polo+Azul' },
  { name: 'Camiseta Regata Dry Fit', price: 60, category: 'Esportivas', stock: 25, imageUrl: 'https://placehold.co/400x400/f72585/ffffff?text=Dry+Fit' },
  { name: 'Camiseta Performance', price: 130, category: 'Esportivas', stock: 7, imageUrl: 'https://placehold.co/400x400/7209b7/ffffff?text=Performance' },
  { name: 'Camiseta Natureza', price: 95, category: 'Estampadas', stock: 14, imageUrl: 'https://placehold.co/400x400/2d6a4f/ffffff?text=Natureza' },
];

async function main() {
  for (const p of products) {
    // Find or create categoria
    let categoria = await prisma.categoria.findFirst({
      where: { nome_categoria: p.category },
    });
    if (!categoria) {
      categoria = await prisma.categoria.create({
        data: { nome_categoria: p.category, descricao_categoria: p.category },
      });
    }

    // Check if product already exists by name
    const existing = await prisma.produto.findFirst({
      where: { nome_produto: p.name },
    });
    if (existing) continue;

    // Create estoque
    const estoque = await prisma.estoque.create({
      data: { quantidade_estoque: p.stock, disponibilidade_estoque: 'DISPONIVEL' },
    });

    // Create produto
    await prisma.produto.create({
      data: {
        nome_produto: p.name,
        preco_produto: p.price,
        url_imagem: p.imageUrl,
        categoria_id_categoria: categoria.id_categoria,
        estoque_id_estoque: estoque.id_estoque,
      },
    });
  }

  console.log('Catalog seed concluído.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
