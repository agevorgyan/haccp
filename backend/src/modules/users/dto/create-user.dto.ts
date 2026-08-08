import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Length(5, 50)
  phone: string;

  @IsNotEmpty({ message: 'Password/PIN is required' })
  @IsString()
  @Length(4, 100)
  password: string;

  @IsNotEmpty({ message: 'User role is required' })
  @IsEnum(UserRole, { message: 'Invalid user role specified' })
  role: UserRole;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
