import { User } from 'src/models/user.model';
import { CreateUserDto } from '../../dtos/users/create-user.dto';
import { UpdateUserDto } from '../../dtos/users/update-user.dto';

export interface IUserService {
  create(data: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}