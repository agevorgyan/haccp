import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * LoginDto
 * Validates incoming authentication request payload.
 */
export class LoginDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(4, { message: 'Password or PIN must be at least 4 characters' })
  password: string;
}
