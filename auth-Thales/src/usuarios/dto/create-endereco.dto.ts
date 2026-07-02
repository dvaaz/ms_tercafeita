import { IsString, IsNotEmpty, IsOptional, IsInt, Length, Min } from 'class-validator';

export class CreateEnderecoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @Length(8, 8, { message: 'CEP deve ter 8 dígitos' })
  cep!: string;

  @IsString()
  @IsNotEmpty()
  rua!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numero?: number;

  @IsOptional()
  @IsString()
  complemento?: string;
}
