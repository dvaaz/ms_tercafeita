import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido' })
  email!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  senha?: string;
}
