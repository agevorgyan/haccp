import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Ավելացրու սա
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';           // <--- User entity
import { Organization } from '../organizations/entities/organization.entity'; // <--- Organization entity

@Module({
  imports: [
    // Ավելացնում ենք սա, որպեսզի Auth-ը հասկանա User և Organization բազայի աղյուսակները
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
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule { }