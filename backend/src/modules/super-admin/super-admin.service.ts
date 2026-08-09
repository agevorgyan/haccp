import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Organization, SubscriptionStatus } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { IoTSensor } from '../iot-sensors/entities/iot-sensor.entity';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateTenantSubscriptionDto } from './dto/update-tenant-subscription.dto';

export interface TenantBackofficeItem {
  organization: Organization;
  userCount: number;
  sensorCount: number;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
}

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(IoTSensor)
    private readonly sensorRepository: Repository<IoTSensor>,
  ) {}

  /**
   * Get all SaaS Subscription Plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({
      order: { priceMonthly: 'ASC' },
    });
  }

  /**
   * Create a new SaaS Subscription Plan
   */
  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  /**
   * Global Tenant Directory for Super Admin (no tenant isolation)
   */
  async getTenants(): Promise<TenantBackofficeItem[]> {
    const orgs = await this.orgRepository.find({
      relations: ['subscriptionPlan'],
      order: { createdAt: 'DESC' },
    });

    const tenantItems: TenantBackofficeItem[] = [];

    for (const org of orgs) {
      const userCount = await this.userRepository.count({
        where: { organization: { id: org.id } },
      });

      const sensorCount = await this.sensorRepository.count({
        where: { organizationId: org.id },
      });

      tenantItems.push({
        organization: org,
        userCount,
        sensorCount,
        subscriptionPlan: org.subscriptionPlan,
        subscriptionStatus: org.subscriptionStatus || SubscriptionStatus.ACTIVE,
      });
    }

    return tenantItems;
  }

  /**
   * Update Tenant Subscription Plan or Status (Suspend / Activate)
   */
  async updateTenantSubscription(
    id: string,
    dto: UpdateTenantSubscriptionDto,
  ): Promise<Organization> {
    const org = await this.orgRepository.findOne({
      where: { id },
      relations: ['subscriptionPlan'],
    });

    if (!org) {
      throw new NotFoundException(`Organization tenant with ID "${id}" not found.`);
    }

    if (dto.subscriptionPlanId) {
      const plan = await this.planRepository.findOne({ where: { id: dto.subscriptionPlanId } });
      if (!plan) {
        throw new NotFoundException(`Subscription Plan with ID "${dto.subscriptionPlanId}" not found.`);
      }
      org.subscriptionPlanId = dto.subscriptionPlanId;
      org.subscriptionPlan = plan;
    }

    if (dto.subscriptionStatus) {
      org.subscriptionStatus = dto.subscriptionStatus;
      org.isActive = dto.subscriptionStatus === SubscriptionStatus.ACTIVE || dto.subscriptionStatus === SubscriptionStatus.TRIAL;
    }

    return this.orgRepository.save(org);
  }
}
