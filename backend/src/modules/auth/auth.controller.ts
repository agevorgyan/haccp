import { Controller, Post, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.phone, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid phone or password/PIN');
    }
    return this.authService.login(user);
  }

  @Get('seed')
  async seed() {
    return this.authService.seedTestData();
  }
}