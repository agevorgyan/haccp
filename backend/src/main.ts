import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

  // Enable CORS allowing React PWA frontend requests
  app.enableCors({
    origin: [corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global DTO validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Transform Interceptor: Wraps all REST responses into { "success": true, "data": payload }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Exception Filter: Formats all errors into { "success": false, "error": { "code", "message", "details" }, "requestId" }
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  logger.log(`🚀 HACCP SaaS Backend running on: http://localhost:${port}/api/v1`);
  logger.log(`🔒 CORS enabled for origin: ${corsOrigin}`);
}
bootstrap();
