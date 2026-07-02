import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {

  @ApiProperty({
    example: 'marcos@email.com.br',
    description: 'Email para login.'
  })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha para entrar no Gateway.'
  })
  password!: string;
}