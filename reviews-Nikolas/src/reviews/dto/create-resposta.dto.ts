import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRespostaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  comentario!: string;
}
