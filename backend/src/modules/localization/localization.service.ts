import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';
import { Translation } from './entities/translation.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { BulkTranslationDto } from './dto/bulk-translation.dto';

@Injectable()
export class LocalizationService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
  ) {}

  /**
   * Retrieve all configured languages
   */
  async getAllLanguages(): Promise<Language[]> {
    return this.languageRepository.find({ order: { isDefault: 'DESC', name: 'ASC' } });
  }

  /**
   * Add a new supported language
   */
  async addLanguage(dto: CreateLanguageDto): Promise<Language> {
    const existing = await this.languageRepository.findOne({ where: { code: dto.code.toLowerCase() } });
    if (existing) {
      throw new ConflictException(`Language with code '${dto.code}' already exists`);
    }

    const language = this.languageRepository.create({
      ...dto,
      code: dto.code.toLowerCase(),
    });

    return this.languageRepository.save(language);
  }

  /**
   * Update language configuration
   */
  async updateLanguage(id: string, dto: UpdateLanguageDto): Promise<Language> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID '${id}' not found`);
    }

    Object.assign(language, dto);
    return this.languageRepository.save(language);
  }

  /**
   * Delete language and all associated translations
   */
  async deleteLanguage(id: string): Promise<{ success: boolean }> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID '${id}' not found`);
    }

    await this.languageRepository.remove(language);
    return { success: true };
  }

  /**
   * Bulk import / update translation key-value pairs for a specific language
   */
  async bulkUpsertTranslations(dto: BulkTranslationDto): Promise<{ updatedCount: number }> {
    const langCode = dto.languageCode.toLowerCase();
    const language = await this.languageRepository.findOne({ where: { code: langCode } });
    if (!language) {
      throw new NotFoundException(`Language with code '${langCode}' not found. Create language first.`);
    }

    const entities = dto.translations.map((item) =>
      this.translationRepository.create({
        languageCode: langCode,
        key: item.key,
        value: item.value,
        language: language,
      })
    );

    // Perform atomic bulk upsert on unique constraint ['languageCode', 'key']
    await this.translationRepository.upsert(entities, ['languageCode', 'key']);

    return { updatedCount: entities.length };
  }

  /**
   * Returns a structured JSON map of all languages and their key-value translations:
   * Output structure:
   * {
   *   "en": { "dashboard": "Dashboard", "auth.login": "Sign In" },
   *   "am": { "dashboard": "Կառավարում", "auth.login": "Մուտք" }
   * }
   */
  async getAllTranslations(): Promise<Record<string, Record<string, string>>> {
    const translations = await this.translationRepository.find();
    const result: Record<string, Record<string, string>> = {};

    for (const t of translations) {
      if (!result[t.languageCode]) {
        result[t.languageCode] = {};
      }
      result[t.languageCode][t.key] = t.value;
    }

    return result;
  }

  /**
   * Returns translations for a single language code formatted for i18next-http-backend
   * Output structure: { "dashboard": "Dashboard", "auth.login": "Sign In" }
   */
  async getTranslationsByLanguage(code: string): Promise<Record<string, string>> {
    const langCode = code.toLowerCase();
    const translations = await this.translationRepository.find({
      where: { languageCode: langCode },
    });

    const result: Record<string, string> = {};
    for (const t of translations) {
      result[t.key] = t.value;
    }

    return result;
  }
}
