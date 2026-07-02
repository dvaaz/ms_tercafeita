import {
  IsObject,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty({ message: 'street não pode estar vazio' })
  street!: string;

  @IsString()
  @IsNotEmpty({ message: 'city não pode estar vazio' })
  city!: string;

  @IsString()
  @IsNotEmpty({ message: 'state não pode estar vazio' })
  state!: string;

  @IsString()
  @IsNotEmpty({ message: 'zipCode não pode estar vazio' })
  zipCode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  number?: number;

  @IsOptional()
  @IsString()
  complement?: string;
}

export class PaymentDto {
  @IsInt()
  @Min(2)
  methodId!: number; // 2=PIX, 3=BOLETO_BANCARIO, 4=CARTAO_CREDITO

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  installments?: number;

  @IsOptional()
  @IsString()
  code?: string;
}

export class CreateOrderDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress!: AddressDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment!: PaymentDto;
}
