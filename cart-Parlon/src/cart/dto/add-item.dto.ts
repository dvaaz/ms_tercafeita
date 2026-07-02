import { IsString, IsInt, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class AddItemDto {
  @IsString()
  @IsNotEmpty({ message: 'productId não pode estar vazio' })
  productId!: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsInt()
  @Min(1, { message: 'quantity deve ser pelo menos 1' })
  quantity!: number;
}
