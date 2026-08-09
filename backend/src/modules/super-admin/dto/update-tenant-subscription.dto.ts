import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '../../organizations/entities/organization.entity';

export class UpdateTenantSubscriptionDto {
  @IsOptional()
  @IsUUID()
  subscriptionPlanId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;
}
