/**
 * HACCP Log Types & Compliance Domain Interfaces
 */

export type TaskStatus = 'pending' | 'completed' | 'warning' | 'overdue';

export type TaskCategory = 'temperature' | 'hygiene' | 'receiving' | 'hot-holding' | 'pest-control';

export interface TemperatureRange {
  min: number;
  max: number;
  unit: '°C' | '°F';
}

export interface CorrectiveActionOption {
  id: string;
  label: string;
  requiresSupervisorApproval: boolean;
}

export interface DailyLog {
  id: string;
  title: string;
  subtitle: string;
  category: TaskCategory;
  status: TaskStatus;
  equipmentOrArea: string;
  timeDue: string;
  safeRange?: TemperatureRange;
  lastReading?: {
    value: number;
    recordedAt: string;
    recordedBy: string;
  };
  isCriticalControlPoint: boolean; // CCP flag
  ccpCode?: string; // e.g. "CCP 1B"
}

export interface TemperatureSubmission {
  logId: string;
  equipmentOrArea: string;
  temperature: number;
  isWithinSafeZone: boolean;
  correctiveAction?: string;
  notes?: string;
  photoUrl?: string;
  timestamp: string;
  operatorName: string;
}
