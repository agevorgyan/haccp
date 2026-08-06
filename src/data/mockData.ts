import type { DailyLog, CorrectiveActionOption } from '../types/haccp';

export const MOCK_OPERATOR = {
  id: 'usr_882',
  name: 'Marco Rossi',
  role: 'Head Line Cook / Food Safety Lead',
  venue: 'Downtown Bistro — Main Kitchen',
  shift: 'Morning Prep (06:00 - 14:00)',
  avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
};

export const MOCK_DAILY_LOGS: DailyLog[] = [
  {
    id: 'log-101',
    title: 'Morning Walk-In Fridge Check',
    subtitle: 'Main Produce & Dairy Storage',
    category: 'temperature',
    status: 'pending',
    equipmentOrArea: 'Walk-in Fridge #1',
    timeDue: '08:30 AM',
    isCriticalControlPoint: true,
    ccpCode: 'CCP 1B',
    safeRange: {
      min: 2.0,
      max: 6.0,
      unit: '°C'
    },
    lastReading: {
      value: 3.8,
      recordedAt: 'Yesterday, 18:00',
      recordedBy: 'Chef Marco'
    }
  },
  {
    id: 'log-102',
    title: 'Hot Holding Line Verification',
    subtitle: 'Buffet Soups & Bain-Marie Station',
    category: 'hot-holding',
    status: 'pending',
    equipmentOrArea: 'Station 3 Bain-Marie',
    timeDue: '10:00 AM',
    isCriticalControlPoint: true,
    ccpCode: 'CCP 2A',
    safeRange: {
      min: 60.0,
      max: 85.0,
      unit: '°C'
    },
    lastReading: {
      value: 65.2,
      recordedAt: 'Yesterday, 12:30',
      recordedBy: 'Sarah J.'
    }
  },
  {
    id: 'log-103',
    title: 'Raw Poultry Receiving Inspection',
    subtitle: 'Delivery Truck Temp & Packaging Integrity',
    category: 'receiving',
    status: 'warning',
    equipmentOrArea: 'Loading Dock Bay 2',
    timeDue: '07:15 AM',
    isCriticalControlPoint: true,
    ccpCode: 'CCP 3',
    safeRange: {
      min: 0.0,
      max: 4.0,
      unit: '°C'
    },
    lastReading: {
      value: 7.2,
      recordedAt: 'Today, 07:18 AM',
      recordedBy: 'Chef Marco'
    }
  },
  {
    id: 'log-104',
    title: 'Sanitizer Bucket PPM Concentration',
    subtitle: 'Prep Counters & Prep Sink Stations',
    category: 'hygiene',
    status: 'completed',
    equipmentOrArea: 'Kitchen Prep Line A',
    timeDue: '07:00 AM',
    isCriticalControlPoint: false,
    lastReading: {
      value: 200,
      recordedAt: 'Today, 07:02 AM',
      recordedBy: 'Chef Marco'
    }
  },
  {
    id: 'log-105',
    title: 'Deep Freezer Unit 2 Temperature',
    subtitle: 'Seafood & Raw Meat Storage',
    category: 'temperature',
    status: 'completed',
    equipmentOrArea: 'Walk-in Freezer #2',
    timeDue: '08:00 AM',
    isCriticalControlPoint: true,
    ccpCode: 'CCP 1A',
    safeRange: {
      min: -24.0,
      max: -18.0,
      unit: '°C'
    },
    lastReading: {
      value: -20.5,
      recordedAt: 'Today, 07:55 AM',
      recordedBy: 'Chef Marco'
    }
  },
  {
    id: 'log-106',
    title: 'High-Temp Dishwasher Final Rinse',
    subtitle: 'Sanitizing Cycle Thermal Check',
    category: 'hygiene',
    status: 'pending',
    equipmentOrArea: 'Commercial Dishwasher A',
    timeDue: '11:30 AM',
    isCriticalControlPoint: false,
    safeRange: {
      min: 82.0,
      max: 90.0,
      unit: '°C'
    }
  },
  {
    id: 'log-107',
    title: 'Evening Kitchen Cleaning Checklist',
    subtitle: 'Grease Trap, Floors & Exhaust Hoods',
    category: 'hygiene',
    status: 'pending',
    equipmentOrArea: 'Entire Kitchen Prep Area',
    timeDue: '02:00 PM',
    isCriticalControlPoint: false
  }
];

export const CORRECTIVE_ACTION_OPTIONS: CorrectiveActionOption[] = [
  { id: 'ca-1', label: 'Adjusted thermostat & scheduled 30-min re-check', requiresSupervisorApproval: false },
  { id: 'ca-2', label: 'Transferred stock to backup walk-in fridge #2', requiresSupervisorApproval: false },
  { id: 'ca-3', label: 'Rejected delivery batch due to temperature breach', requiresSupervisorApproval: true },
  { id: 'ca-4', label: 'Discarded out-of-temp inventory per HACCP policy', requiresSupervisorApproval: true },
  { id: 'ca-5', label: 'Called maintenance technician for sensor calibration', requiresSupervisorApproval: true },
];
