import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Languages, 
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import { localizationService, type LanguageItem } from '../../services/localizationService';

/**
 * LanguageManagementPage Component
 * Administrative interface for SUPER_ADMIN & OWNER roles to manage languages, toggle activation,
 * and bulk update translation key-values.
 */
export const LanguageManagementPage: React.FC = () => {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [selectedLangCode, setSelectedLangCode] = useState<string>('en');
  const [translationsMap, setTranslationsMap] = useState<Record<string, Record<string, string>>>({});
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Language Modal Form state
  const [showAddLangModal, setShowAddLangModal] = useState<boolean>(false);
  const [newLangCode, setNewLangCode] = useState<string>('');
  const [newLangName, setNewLangName] = useState<string>('');
  const [newLangDefault, setNewLangDefault] = useState<boolean>(false);

  // Translation editing state for selected language
  const [editingKeys, setEditingKeys] = useState<Array<{ key: string; value: string }>>([
    { key: 'dashboard', value: '' },
    { key: 'auth.login', value: '' },
    { key: 'settings.title', value: '' },
  ]);

  // Load languages and translations from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [langs, allTrans] = await Promise.all([
        localizationService.getLanguages(),
        localizationService.getAllTranslations(),
      ]);
      setLanguages(langs);
      setTranslationsMap(allTrans);

      // Select default language or first available language code
      if (langs.length > 0 && !selectedLangCode) {
        setSelectedLangCode(langs[0].code);
      }
    } catch (err: any) {
      console.error('Failed to load localization data:', err);
      setError('Unable to fetch languages from server. Please verify your authentication permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update local editing table when selected language or translationsMap changes
  useEffect(() => {
    if (selectedLangCode && translationsMap[selectedLangCode]) {
      const langTrans = translationsMap[selectedLangCode];
      const entries = Object.entries(langTrans).map(([key, value]) => ({ key, value }));
      if (entries.length > 0) {
        setEditingKeys(entries);
      }
    } else {
      setEditingKeys([
        { key: 'dashboard', value: '' },
        { key: 'auth.login', value: '' },
        { key: 'settings.title', value: '' },
      ]);
    }
  }, [selectedLangCode, translationsMap]);

  // Handle Add Language
  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangCode.trim() || !newLangName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const created = await localizationService.addLanguage({
        code: newLangCode.trim().toLowerCase(),
        name: newLangName.trim(),
        isDefault: newLangDefault,
        isActive: true,
      });

      setLanguages((prev) => [...prev, created]);
      setSelectedLangCode(created.code);
      setShowAddLangModal(false);
      setNewLangCode('');
      setNewLangName('');
      setNewLangDefault(false);
      setSuccessMsg(`Language "${created.name}" added successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add new language.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Language Active Status
  const handleToggleActive = async (lang: LanguageItem) => {
    try {
      const updated = await localizationService.updateLanguage(lang.id, {
        isActive: !lang.isActive,
      });
      setLanguages((prev) => prev.map((l) => (l.id === lang.id ? updated : l)));
    } catch (err: any) {
      setError('Failed to update language status.');
    }
  };

  // Delete Language
  const handleDeleteLanguage = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all its translations?`)) return;

    try {
      await localizationService.deleteLanguage(id);
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      setSuccessMsg(`Language "${name}" deleted.`);
    } catch (err: any) {
      setError('Failed to delete language.');
    }
  };

  // Add key-value row to table
  const handleAddKeyRow = () => {
    setEditingKeys((prev) => [...prev, { key: '', value: '' }]);
  };

  // Save bulk translations to backend
  const handleSaveTranslations = async () => {
    if (!selectedLangCode) return;

    const validTranslations = editingKeys.filter((k) => k.key.trim().length > 0);

    setSaving(true);
    setError(null);
    try {
      const result = await localizationService.bulkUpsertTranslations({
        languageCode: selectedLangCode,
        translations: validTranslations,
      });

      setSuccessMsg(`Successfully saved ${result.updatedCount} translation keys for [${selectedLangCode.toUpperCase()}]!`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save translations.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Localization & Translation Cockpit
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Super Admin & Owner Control Panel for multi-language SaaS configuration
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddLangModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Language</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Language Cards & Translation Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Languages List */}
        <div className="lg:col-span-1 bg-slate-950 p-5 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>Configured Languages ({languages.length})</span>
            </h2>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <span>Fetching language registry...</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  onClick={() => setSelectedLangCode(lang.code)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLangCode === lang.code
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-extrabold text-xs font-mono flex items-center justify-center uppercase border border-slate-700">
                      {lang.code}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-100">{lang.name}</p>
                        {lang.isDefault && (
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{lang.code.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(lang);
                      }}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                      title={lang.isActive ? 'Deactivate Language' : 'Activate Language'}
                    >
                      {lang.isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLanguage(lang.id, lang.name);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete Language"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key-Value Translation Matrix */}
        <div className="lg:col-span-2 bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Translations for</span>
                <span className="text-emerald-400 uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {selectedLangCode}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define dynamic translation key-value mappings returned to frontend i18next
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddKeyRow}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                + Add Key Row
              </button>
              <button
                onClick={handleSaveTranslations}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save All Keys</span>
              </button>
            </div>
          </div>

          {/* Key-Value Editor Table */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {editingKeys.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800">
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => {
                    const next = [...editingKeys];
                    next[idx].key = e.target.value;
                    setEditingKeys(next);
                  }}
                  placeholder="key (e.g. dashboard)"
                  className="w-1/3 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-500 font-mono text-xs">:</span>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => {
                    const next = [...editingKeys];
                    next[idx].value = e.target.value;
                    setEditingKeys(next);
                  }}
                  placeholder="translated string (e.g. Կառավարում / Dashboard)"
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setEditingKeys((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Language Modal Overlay */}
      {showAddLangModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Register New System Language</span>
            </h3>

            <form onSubmit={handleAddLanguage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ISO Language Code</label>
                <input
                  type="text"
                  placeholder="e.g. am, en, ru, es"
                  maxLength={10}
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Native Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Հայերեն, English, Русский"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newLangDefault}
                  onChange={(e) => setNewLangDefault(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Set as Default Application Language
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLangModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Language</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageManagementPage;
