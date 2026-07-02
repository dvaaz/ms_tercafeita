import { User } from '../../models/user.model';
import { CreateUserDto } from '../../dtos/users/create-user.dto';
import { UpdateUserDto } from '../../dtos/users/update-user.dto';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}