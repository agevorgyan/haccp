import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  /**
   * Fetch all registered system users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find user by UUID primary key
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
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
   * Create a new user with bcrypt hashed password
   */
  async create(dto: CreateUserDto, currentUser?: AuthenticatedUser): Promise<User> {
    // 1. Check for duplicate phone number
    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException(`User with phone number "${dto.phone}" already exists.`);
    }

    // 2. Hash raw PIN / Password with bcrypt
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Resolve Organization
    const targetOrgId = dto.organizationId || currentUser?.organizationId;
    let organization: Organization | null = null;
    
    if (targetOrgId) {
      organization = await this.organizationRepository.findOne({ where: { id: targetOrgId } });
    }

    if (!organization) {
      // Fallback to first available organization if not specified
      const orgs = await this.organizationRepository.find({ take: 1 });
      organization = orgs[0] || null;
    }

    // 4. Build and save user
    const newUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      passwordHash,
      role: dto.role,
      organization: organization || undefined,
    });

    const saved = await this.userRepository.save(newUser);
    
    // Return re-fetched entity with relations
    return this.findById(saved.id);
  }

  /**
   * Update existing user configuration
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

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

    if (dto.organizationId) {
      const org = await this.organizationRepository.findOne({ where: { id: dto.organizationId } });
      if (org) {
        user.organization = org;
      }
    }

    await this.userRepository.save(user);
    return this.findById(id);
  }

  /**
   * Delete user account
   */
  async remove(id: string): Promise<{ success: boolean; id: string }> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
    return { success: true, id };
  }
}
