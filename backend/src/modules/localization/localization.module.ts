import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { Translation } from './entities/translation.entity';
import { LocalizationService } from './localization.service';
import { LocalizationController } from './localization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Language, Translation])],
  controllers: [LocalizationController],
  providers: [LocalizationService],
  exports: [LocalizationService],
})
export class LocalizationModule {}
