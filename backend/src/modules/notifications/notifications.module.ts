import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { CustomHandlebarsAdapter } from './adapters/custom-handlebars.adapter';
import { join } from 'path';

import { Notification } from './entities/notification.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { TelegramService } from './telegram.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, PushSubscription, User]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'super_secret_jwt_key_change_in_production',
        ),
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
          port: configService.get<number>('SMTP_PORT', 587),
          secure: configService.get<boolean>('SMTP_SECURE', false),
          auth: {
            user: configService.get<string>('SMTP_USER', 'test@ethereal.email'),
            pass: configService.get<string>('SMTP_PASS', 'testpass'),
          },
        },
        defaults: {
          from: configService.get<string>(
            'SMTP_FROM',
            '"SafeKitchen HACCP" <alerts@safekitchen.app>',
          ),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new CustomHandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, EmailService, TelegramService],
  exports: [NotificationsService, NotificationsGateway, EmailService, TelegramService],
})
export class NotificationsModule {}
