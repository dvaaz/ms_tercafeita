# API Gateway Projeto 5

Gateway disponivel em: http://localhost:3000/swagger

## Tecnologias Utilizadas

- NestJS
- TypeScript
- Prisma ORM
- MySQL / MariaDB
- JWT Authentication
- Passport
- Swagger
- Axios
- Bcrypt

---

## Instalação do Projeto

```bash
npm install

```
## Dependências Instaladas
### Prisma MySQL / MariaDB Adapter
```
npm install @prisma/adapter-mariadb mariadb
```
- Documentação: https://www.prisma.io/docs/orm/overview/databases/mysql

----

### JWT + Passport
```
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```
- Documentação:
  - https://docs.nestjs.com/security/authentication
  - https://www.passportjs.org/
  - https://jwt.io/

----

### Bcrypt
```
npm install bcrypt
npm install -D @types/bcrypt
```
- Documentação: https://www.npmjs.com/package/bcrypt

----

### Axios
```
npm install axios
```
- Documentação: https://axios-http.com/

----

### Swagger
```
npm install @nestjs/swagger swagger-ui-express
```
- Documentação:
  - https://docs.nestjs.com/openapi/introduction
  - https://swagger.io/

## Prisma

### Puxar estrutura do banco existente:
```
npx prisma db pull
```

### Gerar client:
```
npx prisma generate
```