import './load-env.js'; // must be first — populates process.env from the root .env
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@etl/observability';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Raw source files (e.g. batch HL7 feeds) are posted as JSON strings, so lift
  // the default 100kb body limit. Large files still belong in object storage /
  // the workers; this covers interactive uploads and samples.
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

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
