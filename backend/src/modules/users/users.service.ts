import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  /**
   * Fetch system users scoped strictly by tenant organization ID.
   * SUPER_ADMIN can view all organizations' users; all other roles are strictly isolated.
   */
  async findAll(tenant?: TenantContext): Promise<User[]> {
    const isSuperAdmin = tenant?.role === UserRole.SUPER_ADMIN;

    if (tenant && tenant.organizationId && !isSuperAdmin) {
      return this.userRepository.find({
        where: { organization: { id: tenant.organizationId } },
        relations: ['organization'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.userRepository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find user by UUID primary key with strict tenant organization scoping
   */
  async findById(id: string, tenant?: TenantContext): Promise<User> {
    const isSuperAdmin = tenant?.role === UserRole.SUPER_ADMIN;
    
    const whereCondition: any = { id };
    if (tenant && tenant.organizationId && !isSuperAdmin) {
      whereCondition.organization = { id: tenant.organizationId };
    }

    const user = await this.userRepository.findOne({
      where: whereCondition,
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found or unauthorized.`);
    }

    return user;
  }

  /**
   * Find user by phone number
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['organization'],
    });
  }

  /**
   * Create a new user account with bcrypt hashed password.
   * Forces organizationId from tenant context to prevent client parameter tampering.
   */
  async create(dto: CreateUserDto, tenant?: TenantContext): Promise<User> {
    // 1. Check for duplicate phone number
    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException(`User with phone number "${dto.phone}" already exists.`);
    }

    // 2. Hash raw PIN / Password with bcrypt
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Resolve Organization safely via server-side tenant context
    const isSuperAdmin = tenant?.role === UserRole.SUPER_ADMIN;
    const targetOrgId = isSuperAdmin && dto.organizationId ? dto.organizationId : tenant?.organizationId;

    let organization: Organization | null = null;

    if (targetOrgId) {
      organization = await this.organizationRepository.findOne({ where: { id: targetOrgId } });
    }

    if (!organization) {
      // Fallback to first available organization if none provided (dev seeding)
      const orgs = await this.organizationRepository.find({ take: 1 });
      organization = orgs[0] || null;
    }

    if (!organization) {
      throw new ForbiddenException('Cannot create user: Valid organization tenant reference required.');
    }

    // 4. Build and save user
    const newUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      passwordHash,
      role: dto.role,
      organization,
    });

    const saved = await this.userRepository.save(newUser);

    // Return re-fetched entity with relations
    return this.findById(saved.id, tenant);
  }

  /**
   * Update existing user configuration scoped to tenant organization
   */
  async update(id: string, dto: UpdateUserDto, tenant?: TenantContext): Promise<User> {
    const user = await this.findById(id, tenant);

    // If phone number is updated, check for conflicts
    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Phone number "${dto.phone}" is already in use by another user.`);
      }
      user.phone = dto.phone;
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.role) user.role = dto.role;

    // Hash password if updated
    if (dto.password && dto.password.trim().length > 0) {
      user.passwordHash = await bcrypt.hash(dto.password.trim(), 10);
    }

    // Only SUPER_ADMIN can reassign user organization
    if (dto.organizationId && tenant?.role === UserRole.SUPER_ADMIN) {
      const org = await this.organizationRepository.findOne({ where: { id: dto.organizationId } });
      if (org) {
        user.organization = org;
      }
    }

    await this.userRepository.save(user);
    return this.findById(id, tenant);
  }

  /**
   * Delete user account scoped strictly to tenant organization
   */
  async remove(id: string, tenant?: TenantContext): Promise<{ success: boolean; id: string }> {
    const user = await this.findById(id, tenant);
    await this.userRepository.remove(user);
    return { success: true, id };
  }
}
