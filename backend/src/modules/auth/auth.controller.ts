import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Phone Number + Password/PIN Authentication Endpoint
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginDto.phone, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    return this.authService.login(user);
  }
}
