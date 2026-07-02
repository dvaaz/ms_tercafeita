import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'password deve ter no mínimo 8 caracteres' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'name deve ter no mínimo 2 caracteres' })
  name!: string;
}
