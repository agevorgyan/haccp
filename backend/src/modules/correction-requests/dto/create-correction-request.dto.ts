import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCorrectionRequestDto {
  @IsUUID()
  @IsNotEmpty()
  logEntryId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsObject()
  @IsNotEmpty()
  proposedData: Record<string, any>;
}
