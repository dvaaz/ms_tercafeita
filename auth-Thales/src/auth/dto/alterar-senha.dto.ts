import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class AlterarSenhaDto {
  @IsString()
  @IsNotEmpty()
  senha_atual!: string;

  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  nova_senha!: string;
}
