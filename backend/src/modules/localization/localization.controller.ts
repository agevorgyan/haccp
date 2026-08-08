import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { LocalizationService } from './localization.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { BulkTranslationDto } from './dto/bulk-translation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('translations')
export class LocalizationController {
  constructor(private readonly localizationService: LocalizationService) {}

  // =========================================================================
  // PUBLIC ENDPOINTS (i18next-http-backend consumption)
  // =========================================================================

  /**
   * GET /api/v1/translations/all
   * Returns complete structured JSON map for all languages
   */
  @Get('all')
  async getAllTranslations() {
    return this.localizationService.getAllTranslations();
  }

  /**
   * GET /api/v1/translations/:code
   * Returns key-value translations object for specified language (e.g. /translations/en)
   */
  @Get(':code')
  async getTranslationsByLanguage(@Param('code') code: string) {
    return this.localizationService.getTranslationsByLanguage(code);
  }

  // =========================================================================
  // SUPER ADMIN RBAC PROTECTED ENDPOINTS
  // =========================================================================

  /**
   * GET /api/v1/translations/languages/list
   * Returns list of configured languages
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Get('languages/list')
  async getLanguages() {
    return this.localizationService.getAllLanguages();
  }

  /**
   * POST /api/v1/translations/languages
   * Add a new language
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Post('languages')
  async createLanguage(@Body() dto: CreateLanguageDto) {
    return this.localizationService.addLanguage(dto);
  }

  /**
   * PUT /api/v1/translations/languages/:id
   * Update language configuration
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Put('languages/:id')
  async updateLanguage(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.localizationService.updateLanguage(id, dto);
  }

  /**
   * DELETE /api/v1/translations/languages/:id
   * Delete language and associated translations
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Delete('languages/:id')
  async deleteLanguage(@Param('id') id: string) {
    return this.localizationService.deleteLanguage(id);
  }

  /**
   * POST /api/v1/translations/bulk
   * Bulk import / update translation keys & values for a language
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Post('bulk')
  async bulkUpsertTranslations(@Body() dto: BulkTranslationDto) {
    return this.localizationService.bulkUpsertTranslations(dto);
  }
}
