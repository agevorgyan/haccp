import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    organizationId: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user phone number and verify password hash with bcrypt.
   */
  async validateUser(phone: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (isMatch) {
      return user;
    }

    return null;
  }

  /**
   * Generate signed JWT access token containing tenant claims.
   */
  async login(user: User): Promise<LoginResponse> {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      organizationId: user.organization?.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        organizationId: user.organization?.id,
      },
    };
  }
}
