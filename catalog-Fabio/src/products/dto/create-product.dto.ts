import { IsString, IsNumber, IsPositive, IsOptional, IsInt, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'name deve ter no mínimo 2 caracteres' })
  name!: string;

  @IsNumber({}, { message: 'price deve ser um número' })
  @IsPositive({ message: 'price deve ser positivo' })
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  @MinLength(1, { message: 'category não pode estar vazia' })
  category!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
