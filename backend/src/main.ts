import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Enable CORS for React PWA frontend
  app.enableCors({
    origin: '*', // Restrict to specific domains in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global DTO validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  logger.log(`🚀 HACCP SaaS Backend running on: http://localhost:${port}/api/v1`);
}
bootstrap();
