import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class DecrementBatchQuantityDto {
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;
}
