import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.users.create({
      data: {
        id: randomUUID(),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      },
    });
  }

  async findAll() {
    return this.prisma.users.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.users.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.users.delete({
      where: { id },
    });
  }
}