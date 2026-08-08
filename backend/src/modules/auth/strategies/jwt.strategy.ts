import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  phone: string;
  role: UserRole;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_change_in_production'),
    });
  }

  /**
   * Called automatically by Passport after JWT signature verification.
   * Attaches sanitized user claims directly to HTTP request object (req.user).
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload tokens');
    }

    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
      organizationId: payload.organizationId || '',
    };
  }
}
