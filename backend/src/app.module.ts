import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { HaccpPlansModule } from './modules/haccp-plans/haccp-plans.module';
import { HazardsModule } from './modules/hazards/hazards.module';
import { CcpsModule } from './modules/ccps/ccps.module';
import { LogTemplatesModule } from './modules/log-templates/log-templates.module';

/**
 * AppModule - NestJS Core Application Module
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
        const env = configService.get<string>('NODE_ENV', 'development');
        const isDev = env === 'development';
        const isProduction = env === 'production';
        const allowSync = configService.get<boolean>('DB_SYNCHRONIZE', false);

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_NAME', 'haccp_db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          // Production-grade migration architecture: synchronize is permanently false
          synchronize: false,
          logging: configService.get<boolean>('DB_LOGGING', false),
          ssl: isProduction
            ? {
              rejectUnauthorized: false,
            }
            : false,
        };
      },
    }),

    // Domain Feature Modules
    UsersModule,
    AuthModule,
    LocalizationModule,
    NotificationsModule,
    AuditModule,
    HaccpPlansModule,
    HazardsModule,
    CcpsModule,
    LogTemplatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
