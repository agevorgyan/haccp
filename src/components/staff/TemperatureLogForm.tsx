import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  Save, 
  X,
  ShieldAlert
} from 'lucide-react';
import type { DailyLog, TemperatureSubmission } from '../../types/haccp';
import { CORRECTIVE_ACTION_OPTIONS } from '../../data/mockData';

interface TemperatureLogFormProps {
  log?: DailyLog;
  onSaveSuccess?: (submission: TemperatureSubmission) => void;
  onCancel?: () => void;
}

/**
 * TemperatureLogForm Component
 * Specialized touch-optimized interface for kitchen employees filling out CCP temperature logs.
 */
export const TemperatureLogForm: React.FC<TemperatureLogFormProps> = ({
  log,
  onSaveSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  // Safe bounds (default to +2°C to +6°C for standard refrigeration if unspecified)
  const minSafe = log?.safeRange?.min ?? 2.0;
  const maxSafe = log?.safeRange?.max ?? 6.0;
  const unit = log?.safeRange?.unit ?? '°C';
  const equipmentName = log?.equipmentOrArea ?? 'Walk-in Fridge #1';

  // Initial temperature state
  const initialTemp = log?.lastReading?.value ?? 3.5;
  const [temperature, setTemperature] = useState<number>(initialTemp);
  const [correctiveAction, setCorrectiveAction] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Check if current value is out of safe range
  const isOutOfRange = temperature < minSafe || temperature > maxSafe;

  // Clear corrective action if temp is returned to safe range
  useEffect(() => {
    if (!isOutOfRange) {
      setCorrectiveAction('');
    }
  }, [isOutOfRange]);

  const handleStep = (delta: number) => {
    setTemperature((prev) => parseFloat((prev + delta).toFixed(1)));
  };

  const handlePresetSelect = (val: number) => {
    setTemperature(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isOutOfRange && !correctiveAction) {
      alert('HACCP Compliance Requirement: You must select a Corrective Action for temperature breaches.');
      return;
    }

    setIsSubmitting(true);

    const submission: TemperatureSubmission = {
      logId: log?.id ?? 'log-custom',
      equipmentOrArea: equipmentName,
      temperature,
      isWithinSafeZone: !isOutOfRange,
      correctiveAction: isOutOfRange ? correctiveAction : undefined,
      notes: notes.trim() ? notes : undefined,
      photoUrl: photoAttached ? 'mock_photo_probe.jpg' : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operatorName: 'Chef Marco',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessToast(true);
      if (onSaveSuccess) {
        onSaveSuccess(submission);
      }
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
      {/* Form Header */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isOutOfRange ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            <Thermometer className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">{equipmentName}</h2>
              {log?.ccpCode && (
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {log.ccpCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Safe Zone Target: <span className="font-semibold text-slate-200">{minSafe}{unit} to {maxSafe}{unit}</span>
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="m-4 p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="text-xs font-bold">Temperature Log Saved Successfully!</p>
            <p className="text-[11px] text-emerald-100">Time-stamped and queued for offline cloud sync.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Large Touch Numpad & Stepper Section */}
        <div className={`p-5 rounded-2xl border-2 transition-all text-center ${
          isOutOfRange 
            ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/50' 
            : 'bg-slate-950/60 border-emerald-500/60'
        }`}>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Measured Probe Reading
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-center gap-3 my-2">
            {/* Decrease Buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleStep(-1.0)}
                className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-sm flex items-center justify-center border border-slate-700 active:scale-95 transition-all min-h-[44px]"
                aria-label="Decrease 1 degree"
              >
                -1.0
              </button>
              <button
                type="button"
                onClick={() => handleStep(-0.1)}
                className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-700 active:scale-95 transition-all min-h-[44px]"
                aria-label="Decrease 0.1 degree"
              >
                -0.1
              </button>
            </div>

            {/* Central Display */}
            <div className="px-4 py-2 flex flex-col items-center">
              <div className="flex items-baseline justify-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                  className={`w-36 text-center text-5xl font-extrabold tracking-tight bg-transparent focus:outline-none ${
                    isOutOfRange ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                />
                <span className="text-2xl font-bold text-slate-400">{unit}</span>
              </div>
            </div>

            {/* Increase Buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleStep(1.0)}
                className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-sm flex items-center justify-center border border-slate-700 active:scale-95 transition-all min-h-[44px]"
                aria-label="Increase 1 degree"
              >
                +1.0
              </button>
              <button
                type="button"
                onClick={() => handleStep(0.1)}
                className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-700 active:scale-95 transition-all min-h-[44px]"
                aria-label="Increase 0.1 degree"
              >
                +0.1
              </button>
            </div>
          </div>

          {/* Quick Preset Tap Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold block mb-2">Quick Presets</span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePresetSelect(2.5)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 min-h-[38px]"
              >
                2.5{unit}
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(3.8)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 min-h-[38px]"
              >
                3.8{unit}
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(5.0)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 min-h-[38px]"
              >
                5.0{unit}
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(8.5)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-xs font-semibold text-rose-300 border border-rose-700/60 min-h-[38px]"
              >
                8.5{unit} (Test Breach)
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Dynamic Validation Banner */}
        {isOutOfRange ? (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-700 text-rose-200 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>CRITICAL HACCP TEMPERATURE BREACH!</span>
            </div>
            <p className="text-xs text-rose-100/90 leading-relaxed">
              Reading of <strong className="text-white font-extrabold">{temperature}{unit}</strong> is outside the safe operating range ({minSafe}{unit} to {maxSafe}{unit}). Corrective action is mandatory.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 text-emerald-200 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Temperature is within safe limits ({minSafe}{unit} to {maxSafe}{unit}).</span>
          </div>
        )}

        {/* Mandatory Corrective Action Selection (If Breach Detected) */}
        {isOutOfRange && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 space-y-3">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Select Required Corrective Action *
            </label>
            <div className="space-y-2">
              {CORRECTIVE_ACTION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCorrectiveAction(option.label)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all min-h-[44px] flex items-start justify-between ${
                    correctiveAction === option.label
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold ring-1 ring-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.requiresSupervisorApproval && (
                    <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-bold shrink-0 ml-2">
                      Supervisor Approval
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Operator Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add comments, probe calibration state, or batch details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Photo Attachment Simulation */}
        <button
          type="button"
          onClick={() => setPhotoAttached(!photoAttached)}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-colors min-h-[48px] ${
            photoAttached
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{photoAttached ? '✓ Thermometer Photo Attached' : 'Attach Digital Thermometer Photo'}</span>
        </button>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 min-h-[54px] ${
            isOutOfRange
              ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-rose-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              {t('tempForm.submitting')}
            </span>
          ) : (
            <>
              <Save className="w-5 h-5 stroke-[2.5]" />
              <span>{t('tempForm.submitLog')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
