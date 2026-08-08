import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users
   * Retrieve team users strictly isolated to the requesting tenant's organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.usersService.findAll(tenant);
  }

  /**
   * GET /api/v1/users/:id
   * Retrieve specific user profile within tenant organization
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenant: TenantContext) {
    return this.usersService.findById(id, tenant);
  }

  /**
   * POST /api/v1/users
   * Register a new user account bound to tenant organization
   */
  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/users/:id
   * Update user details or role permissions within tenant organization
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.update(id, dto, tenant);
  }

  /**
   * DELETE /api/v1/users/:id
   * Delete user account within tenant organization
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.usersService.remove(id, tenant);
  }
}
