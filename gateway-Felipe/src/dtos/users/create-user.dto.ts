import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {

  @ApiProperty({
    example: 'Marcos almeida',
    description: 'Nome de Usuário.'
  })  
  name!: string;

  @ApiProperty({
    example: 'marcos@email.com.br',
    description: 'Email do usuário.'
  })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha de usuário.'
  })
  password!: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Perfil de usuário dentro do Gateway.'
  })
  role!: string;
}