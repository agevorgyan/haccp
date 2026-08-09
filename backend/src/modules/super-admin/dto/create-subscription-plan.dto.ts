import { IsNumber, IsString, Min } from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  maxUsers: number;

  @IsNumber()
  @Min(0)
  maxSensors: number;

  @IsNumber()
  @Min(0)
  priceMonthly: number;
}
