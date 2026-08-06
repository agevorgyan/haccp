import React, { useState } from 'react';
import { Thermometer, CheckCircle, AlertTriangle, Save, Camera } from 'lucide-react';

export const TempLogPage: React.FC = () => {
  const [temperature, setTemperature] = useState<string>('3.8');
  const [equipment, setEquipment] = useState<string>('Walk-in Fridge #1');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const isWarning = parseFloat(temperature) > 4.0 || parseFloat(temperature) < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Temperature Log</h2>
          <p className="text-xs text-slate-500">Critical Control Point (CCP 1)</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
          Standard Range: 0°C to 4.0°C
        </span>
      </div>

      {submitted && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg animate-bounce">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <div>
            <p className="text-xs font-bold">Log Saved & Time-Stamped!</p>
            <p className="text-[11px] text-emerald-100">Stored locally in PWA database.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        {/* Equipment Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Equipment / Area
          </label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Walk-in Fridge #1">Walk-in Fridge #1 (Produce)</option>
            <option value="Walk-in Freezer #2">Walk-in Freezer #2 (Meat & Poultry)</option>
            <option value="Prep Counter Chiller">Prep Counter Chiller</option>
            <option value="Hot Holding Station">Hot Holding Station (&ge; 60°C)</option>
          </select>
        </div>

        {/* Large Touch Numpad / Temperature Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Measured Temperature (°C)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className={`w-full text-center text-4xl font-extrabold p-4 rounded-2xl border-2 transition-all ${
                isWarning
                  ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                  : 'border-emerald-500 bg-emerald-50/50 text-slate-900 focus:ring-emerald-500'
              }`}
            />
            <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400" />
          </div>
        </div>

        {/* Status Callout */}
        {isWarning ? (
          <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Temperature breach detected! Corrective Action Log will be required upon submit.</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Temperature within safe limits according to HACCP Standard 4.1.</span>
          </div>
        )}

        {/* Photo Attachment Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
        >
          <Camera className="w-4 h-4 text-slate-500" />
          <span>Attach Digital Thermometer Photo (Optional)</span>
        </button>

        {/* Big Touch Submit Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Save Log Entry</span>
        </button>
      </form>
    </div>
  );
};
