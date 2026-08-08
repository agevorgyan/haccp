import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(4, 100)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role specified' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
