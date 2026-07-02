import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  { nome: 'Admin ShirtStore', email: 'admin@shirtstore.com', cpf: '00000000001', password: 'Admin@123456', role: 'admin' },
  { nome: 'João Silva', email: 'joao@example.com', cpf: '00000000002', password: 'Senha@123456', role: 'user' },
  { nome: 'Maria Souza', email: 'maria@example.com', cpf: '00000000003', password: 'Senha@123456', role: 'user' },
  { nome: 'Pedro Lima', email: 'pedro@example.com', cpf: '00000000004', password: 'Senha@123456', role: 'user' },
];

async function main() {
  for (const u of users) {
    const senha_hash = await bcrypt.hash(u.password, 10);
    await prisma.usuarios.upsert({
      where: { email: u.email },
      update: { senha_hash, role: u.role },
      create: { email: u.email, nome: u.nome, cpf: u.cpf, senha_hash, role: u.role },
    });
    console.log(`Upserted ${u.email}`);
  }
  console.log('Auth seed concluído.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
