import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'productId deve ser um número inteiro' })
  @Min(1)
  productId!: number;

  @IsInt({ message: 'nota deve ser um número inteiro' })
  @Min(1, { message: 'nota deve ser no mínimo 1' })
  @Max(5, { message: 'nota deve ser no máximo 5' })
  nota!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  comentario?: string;
}
