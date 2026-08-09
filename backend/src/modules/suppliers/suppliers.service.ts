import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, SupplierRiskLevel } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * List all suppliers for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<Supplier[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.supplierRepository.find({
        where: { organizationId: tenant.organizationId },
        order: { name: 'ASC' },
      });
    }

    return this.supplierRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Find specific supplier by ID with tenant boundary checks
   */
  async findById(id: string, tenant: TenantContext): Promise<Supplier> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const supplier = await this.supplierRepository.findOne({
      where: whereCondition,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID "${id}" not found or unauthorized.`);
    }

    return supplier;
  }

  /**
   * Create a new food supply chain vendor
   */
  async create(dto: CreateSupplierDto, tenant: TenantContext): Promise<Supplier> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to register a supplier.');
    }

    const supplier = this.supplierRepository.create({
      organizationId: tenant.organizationId,
      name: dto.name,
      contactPerson: dto.contactPerson,
      phone: dto.phone,
      email: dto.email,
      categories: dto.categories || [],
      certificates: dto.certificates,
      status: dto.status,
      riskLevel: dto.riskLevel,
      rating: 5.00,
    });

    return this.supplierRepository.save(supplier);
  }

  /**
   * Update supplier details
   */
  async update(
    id: string,
    dto: UpdateSupplierDto,
    tenant: TenantContext,
  ): Promise<Supplier> {
    const supplier = await this.findById(id, tenant);

    if (dto.name) supplier.name = dto.name;
    if (dto.contactPerson) supplier.contactPerson = dto.contactPerson;
    if (dto.phone) supplier.phone = dto.phone;
    if (dto.email) supplier.email = dto.email;
    if (dto.categories) supplier.categories = dto.categories;
    if (dto.certificates !== undefined) supplier.certificates = dto.certificates;
    if (dto.status) supplier.status = dto.status;
    if (dto.riskLevel) supplier.riskLevel = dto.riskLevel;
    if (dto.rating !== undefined) supplier.rating = dto.rating;

    return this.supplierRepository.save(supplier);
  }

  /**
   * Automatically flag or log supplier performance risk upon delivery rejection
   */
  async recordDeliveryRejection(supplierId: string, tenant: TenantContext): Promise<Supplier> {
    const supplier = await this.findById(supplierId, tenant);

    const currentRating = Number(supplier.rating) || 5.00;
    const newRating = Math.max(0, currentRating - 0.50);
    supplier.rating = Number(newRating.toFixed(2));

    if (newRating < 3.00) {
      supplier.riskLevel = SupplierRiskLevel.HIGH;
    } else if (newRating < 4.00) {
      supplier.riskLevel = SupplierRiskLevel.MEDIUM;
    }

    return this.supplierRepository.save(supplier);
  }

  /**
   * Remove a supplier entry
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const supplier = await this.findById(id, tenant);
    await this.supplierRepository.remove(supplier);
    return { success: true, id };
  }
}
