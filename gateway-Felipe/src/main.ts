import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('API Gateway Ecommerce')
    .setDescription('Documentação da API Gateway com NestJS')
    .setVersion('1.5')
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
