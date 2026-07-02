import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CadastroDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(11, 11, { message: 'CPF deve ter 11 dígitos' })
  cpf!: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha!: string;
}
