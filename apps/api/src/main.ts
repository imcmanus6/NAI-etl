import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@etl/observability';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('etl-platform API')
    .setDescription('White-label, AI-assisted ETL & data migration platform')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port, process.env.API_HOST ?? '0.0.0.0');
  logger.info({ port }, `API listening — OpenAPI at http://localhost:${port}/api/docs`);
}

bootstrap();
