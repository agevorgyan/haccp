import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch, BatchStatus } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { DecrementBatchQuantityDto } from './dto/decrement-batch-quantity.dto';
import { UpdateBatchStatusDto } from './dto/update-batch-status.dto';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  /**
   * Retrieve all lot/batch inventory records for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<Batch[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.batchRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['supplier', 'receivingLog'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.batchRepository.find({
      relations: ['supplier', 'receivingLog'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find specific batch record by ID with tenant boundary checks
   */
  async findById(id: string, tenant: TenantContext): Promise<Batch> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const batch = await this.batchRepository.findOne({
      where: whereCondition,
      relations: ['supplier', 'receivingLog'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch record with ID "${id}" not found or unauthorized.`);
    }

    return batch;
  }

  /**
   * Create a new ingredient or finished product lot batch
   */
  async create(dto: CreateBatchDto, tenant: TenantContext): Promise<Batch> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to register a batch.');
    }

    const initialQty = dto.initialQuantity;
    const currentQty = dto.currentQuantity !== undefined ? dto.currentQuantity : initialQty;

    const batch = this.batchRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      supplierId: dto.supplierId,
      receivingLogId: dto.receivingLogId,
      productName: dto.productName,
      batchNumber: dto.batchNumber,
      initialQuantity: initialQty,
      currentQuantity: currentQty,
      unit: dto.unit,
      productionDate: dto.productionDate ? new Date(dto.productionDate) : undefined,
      expiryDate: new Date(dto.expiryDate),
      status: dto.status || (currentQty <= 0 ? BatchStatus.EXHAUSTED : BatchStatus.ACTIVE),
    });

    return this.batchRepository.save(batch);
  }

  /**
   * Update batch details
   */
  async update(
    id: string,
    dto: UpdateBatchDto,
    tenant: TenantContext,
  ): Promise<Batch> {
    const batch = await this.findById(id, tenant);

    if (dto.supplierId !== undefined) batch.supplierId = dto.supplierId;
    if (dto.receivingLogId !== undefined) batch.receivingLogId = dto.receivingLogId;
    if (dto.productName) batch.productName = dto.productName;
    if (dto.batchNumber) batch.batchNumber = dto.batchNumber;
    if (dto.initialQuantity !== undefined) batch.initialQuantity = dto.initialQuantity;
    if (dto.currentQuantity !== undefined) {
      batch.currentQuantity = dto.currentQuantity;
      if (batch.currentQuantity <= 0) batch.status = BatchStatus.EXHAUSTED;
    }
    if (dto.unit) batch.unit = dto.unit;
    if (dto.productionDate !== undefined) {
      batch.productionDate = dto.productionDate ? new Date(dto.productionDate) : undefined;
    }
    if (dto.expiryDate) batch.expiryDate = new Date(dto.expiryDate);
    if (dto.status) batch.status = dto.status;

    return this.batchRepository.save(batch);
  }

  /**
   * Inventory decrement logic as lot ingredient is consumed
   */
  async decrementQuantity(
    id: string,
    dto: DecrementBatchQuantityDto,
    tenant: TenantContext,
  ): Promise<Batch> {
    const batch = await this.findById(id, tenant);

    if (batch.status === BatchStatus.QUARANTINED || batch.status === BatchStatus.RECALLED) {
      throw new BadRequestException(
        `Batch "${batch.batchNumber}" is ${batch.status} and cannot be consumed from inventory!`,
      );
    }

    const currentQty = Number(batch.currentQuantity) || 0;
    const newQty = Math.max(0, currentQty - dto.amount);
    batch.currentQuantity = Number(newQty.toFixed(2));

    if (batch.currentQuantity <= 0) {
      batch.status = BatchStatus.EXHAUSTED;
    }

    return this.batchRepository.save(batch);
  }

  /**
   * Update quarantine, recall, or active status of a batch
   */
  async updateStatus(
    id: string,
    dto: UpdateBatchStatusDto,
    tenant: TenantContext,
  ): Promise<Batch> {
    const batch = await this.findById(id, tenant);
    batch.status = dto.status;

    return this.batchRepository.save(batch);
  }

  /**
   * Remove a batch record
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const batch = await this.findById(id, tenant);
    await this.batchRepository.remove(batch);
    return { success: true, id };
  }
}
