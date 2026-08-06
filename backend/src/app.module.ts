import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * AppModule - NestJS Core Application Module
 * 
 * Architectural Highlights:
 * 1. Global ConfigModule: Centralized validation and loading of environment variables (.env).
 * 2. Asynchronous TypeOrmModule Connection: Prevents hardcoding database credentials and allows GCP Cloud Run
 *    to inject environment variables dynamically at runtime (Cloud SQL proxy / Socket connection).
 * 3. Auto-Loading Entities: Automatically discovers feature module TypeORM entities without manual array lists.
 * 4. Development vs Production Safeguards: `synchronize` is dynamically toggled via environment variable.
 */
@Module({
  imports: [
    // Global environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Asynchronous Database connection setup using TypeORM & PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_NAME', 'haccp_db'),
          autoLoadEntities: true,
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', !isProduction),
          logging: configService.get<boolean>('DB_LOGGING', false),
          ssl: isProduction
            ? {
                rejectUnauthorized: false,
              }
            : false,
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export className AppModule {}
