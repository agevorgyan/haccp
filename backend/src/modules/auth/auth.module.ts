import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { JwtStrategy } from './strategies/jwt.strategy'; // <--- Պարտադիր է ներմուծել

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_change_in_production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '86400s') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <--- Ավելացրու JwtStrategy-ն այստեղ
  exports: [AuthService],
})
export class AuthModule { }