import api from './api';

export interface LanguageItem {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface TranslationEntry {
  key: string;
  value: string;
}

export interface BulkTranslationPayload {
  languageCode: string;
  translations: TranslationEntry[];
}

/**
 * Localization Service
 * API client methods for managing system languages and translation key-values.
 */
export const localizationService = {
  /**
   * Fetch list of configured languages (Requires SUPER_ADMIN or OWNER role)
   */
  async getLanguages(): Promise<LanguageItem[]> {
    const res = await api.get<LanguageItem[]>('/translations/languages/list');
    return res.data;
  },

  /**
   * Add a new system language
   */
  async addLanguage(payload: { code: string; name: string; isDefault?: boolean; isActive?: boolean }): Promise<LanguageItem> {
    const res = await api.post<LanguageItem>('/translations/languages', payload);
    return res.data;
  },

  /**
   * Update language configuration (e.g. toggle active, toggle default)
   */
  async updateLanguage(id: string, payload: Partial<LanguageItem>): Promise<LanguageItem> {
    const res = await api.put<LanguageItem>(`/translations/languages/${id}`, payload);
    return res.data;
  },

  /**
   * Delete language and associated translations
   */
  async deleteLanguage(id: string): Promise<{ success: boolean }> {
    const res = await api.delete<{ success: boolean }>(`/translations/languages/${id}`);
    return res.data;
  },

  /**
   * Bulk import / update translation keys & values for a language
   */
  async bulkUpsertTranslations(payload: BulkTranslationPayload): Promise<{ updatedCount: number }> {
    const res = await api.post<{ updatedCount: number }>('/translations/bulk', payload);
    return res.data;
  },

  /**
   * Fetch all active translations (Public)
   */
  async getAllTranslations(): Promise<Record<string, Record<string, string>>> {
    const res = await api.get<Record<string, Record<string, string>>>('/translations/all');
    return res.data;
  },
};

export default localizationService;
