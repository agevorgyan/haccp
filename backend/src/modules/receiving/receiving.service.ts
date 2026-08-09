import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceivingLog, ReceivingStatus } from './entities/receiving-log.entity';
import { CreateReceivingLogDto } from './dto/create-receiving-log.dto';
import { SuppliersService } from '../suppliers/suppliers.service';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReceivingService {
  constructor(
    @InjectRepository(ReceivingLog)
    private readonly receivingLogRepository: Repository<ReceivingLog>,
    private readonly suppliersService: SuppliersService,
  ) {}

  /**
   * List all delivery receiving logs for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<ReceivingLog[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.receivingLogRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['supplier', 'receiver'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.receivingLogRepository.find({
      relations: ['supplier', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find specific receiving log by ID with tenant boundary checks
   */
  async findById(id: string, tenant: TenantContext): Promise<ReceivingLog> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const log = await this.receivingLogRepository.findOne({
      where: whereCondition,
      relations: ['supplier', 'receiver'],
    });

    if (!log) {
      throw new NotFoundException(`Receiving Log with ID "${id}" not found or unauthorized.`);
    }

    return log;
  }

  /**
   * Log a new food supply delivery inspection
   */
  async logInspection(dto: CreateReceivingLogDto, tenant: TenantContext): Promise<ReceivingLog> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to log a delivery inspection.');
    }

    // 1. Verify supplier exists
    const supplier = await this.suppliersService.findById(dto.supplierId, tenant);

    // 2. Validate REJECTED status requirements
    if (dto.status === ReceivingStatus.REJECTED) {
      if (!dto.rejectionReason || dto.rejectionReason.trim() === '') {
        throw new BadRequestException('A non-empty rejectionReason is strictly required when a delivery is REJECTED.');
      }

      // Automatically penalize and flag supplier performance risk
      await this.suppliersService.recordDeliveryRejection(supplier.id, tenant);
    }

    // 3. Create receiving log
    const log = this.receivingLogRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      supplierId: supplier.id,
      receivedBy: tenant.userId,
      productName: dto.productName,
      batchNumber: dto.batchNumber,
      quantity: dto.quantity,
      unit: dto.unit,
      temperature: dto.temperature,
      packagingCondition: dto.packagingCondition,
      expiryDate: new Date(dto.expiryDate),
      status: dto.status,
      rejectionReason: dto.rejectionReason,
      photoUrl: dto.photoUrl,
    });

    return this.receivingLogRepository.save(log);
  }
}
