import { IsString, IsNotEmpty } from 'class-validator';

export class MergeCartDto {
  @IsString()
  @IsNotEmpty({ message: 'sessionId não pode estar vazio' })
  sessionId!: string;
}
