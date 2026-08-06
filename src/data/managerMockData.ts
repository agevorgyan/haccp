export interface SummaryStats {
  totalBranches: number;
  logCompletionRate: number; // e.g. 96.4%
  openViolations: number;
  activeSensors: number;
  auditReadinessScore: number;
  completionTrendChange: number; // e.g. +2.1%
}

export interface CriticalViolation {
  id: string;
  date: string;
  time: string;
  branchName: string;
  issue: string;
  equipment: string;
  ccpCode: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Open' | 'In Progress' | 'Resolved';
  assignedTo: string;
}

export interface TempTrendPoint {
  date: string; // e.g. "Aug 01"
  day: string;  // e.g. "Mon"
  downtownBistro: number;
  uptownBakery: number;
  centralKitchen: number;
  minSafe: number; // 2.0
  maxSafe: number; // 6.0
}

export interface BranchPerformance {
  id: string;
  name: string;
  city: string;
  complianceScore: number;
  completedToday: number;
  totalToday: number;
  activeAlerts: number;
  status: 'Compliant' | 'Warning' | 'Critical';
}

export const MOCK_SUMMARY_STATS: SummaryStats = {
  totalBranches: 5,
  logCompletionRate: 96.4,
  openViolations: 3,
  activeSensors: 42,
  auditReadinessScore: 98.2,
  completionTrendChange: 2.1,
};

export const MOCK_CRITICAL_VIOLATIONS: CriticalViolation[] = [
  {
    id: 'viol-901',
    date: 'Today',
    time: '08:15 AM',
    branchName: 'Downtown Bistro',
    issue: 'Walk-in Freezer #2 recorded 4.2°C (Limit: max -18°C)',
    equipment: 'Walk-in Freezer #2',
    ccpCode: 'CCP 1A',
    severity: 'Critical',
    status: 'Open',
    assignedTo: 'Chef Marco',
  },
  {
    id: 'viol-902',
    date: 'Today',
    time: '07:45 AM',
    branchName: 'Central Kitchen',
    issue: 'Raw Chicken receiving temp recorded at 7.2°C (Limit: max 4°C)',
    equipment: 'Loading Dock Bay 2',
    ccpCode: 'CCP 3',
    severity: 'High',
    status: 'In Progress',
    assignedTo: 'Dave Chen (QA)',
  },
  {
    id: 'viol-903',
    date: 'Yesterday',
    time: '19:30 PM',
    branchName: 'Harbor Seafood Grill',
    issue: 'Sanitizer concentration low at 100 PPM (Limit: min 200 PPM)',
    equipment: 'Prep Sink Line B',
    ccpCode: 'HYG 2',
    severity: 'Medium',
    status: 'In Progress',
    assignedTo: 'Elena R.',
  },
  {
    id: 'viol-904',
    date: 'Aug 04',
    time: '11:20 AM',
    branchName: 'Uptown Bakery',
    issue: 'Hot Holding Bain-Marie dropped to 54°C for 25 mins',
    equipment: 'Bain-Marie #1',
    ccpCode: 'CCP 2A',
    severity: 'High',
    status: 'Resolved',
    assignedTo: 'Sarah Jenkins',
  },
];

export const MOCK_TEMP_TRENDS: TempTrendPoint[] = [
  { date: 'Aug 01', day: 'Mon', downtownBistro: 3.4, uptownBakery: 2.9, centralKitchen: 4.1, minSafe: 2.0, maxSafe: 6.0 },
  { date: 'Aug 02', day: 'Tue', downtownBistro: 3.8, uptownBakery: 3.1, centralKitchen: 4.5, minSafe: 2.0, maxSafe: 6.0 },
  { date: 'Aug 03', day: 'Wed', downtownBistro: 4.2, uptownBakery: 3.0, centralKitchen: 5.2, minSafe: 2.0, maxSafe: 6.0 },
  { date: 'Aug 04', day: 'Thu', downtownBistro: 7.8, uptownBakery: 3.2, centralKitchen: 4.8, minSafe: 2.0, maxSafe: 6.0 }, // Spike breach day
  { date: 'Aug 05', day: 'Fri', downtownBistro: 3.9, uptownBakery: 3.3, centralKitchen: 4.6, minSafe: 2.0, maxSafe: 6.0 },
  { date: 'Aug 06', day: 'Sat', downtownBistro: 3.5, uptownBakery: 3.1, centralKitchen: 4.3, minSafe: 2.0, maxSafe: 6.0 },
  { date: 'Aug 07', day: 'Sun', downtownBistro: 3.6, uptownBakery: 3.2, centralKitchen: 4.2, minSafe: 2.0, maxSafe: 6.0 },
];

export const MOCK_BRANCH_PERFORMANCE: BranchPerformance[] = [
  { id: 'b-1', name: 'Downtown Bistro', city: 'Central District', complianceScore: 98.5, completedToday: 42, totalToday: 43, activeAlerts: 1, status: 'Warning' },
  { id: 'b-2', name: 'Uptown Bakery & Cafe', city: 'North Hill', complianceScore: 100.0, completedToday: 36, totalToday: 36, activeAlerts: 0, status: 'Compliant' },
  { id: 'b-3', name: 'Central Kitchen Facility', city: 'Industrial Park', complianceScore: 94.2, completedToday: 64, totalToday: 68, activeAlerts: 1, status: 'Warning' },
  { id: 'b-4', name: 'Harbor Seafood Grill', city: 'Bay Waterfront', complianceScore: 91.8, completedToday: 28, totalToday: 32, activeAlerts: 1, status: 'Critical' },
  { id: 'b-5', name: 'Airport Express Kiosk', city: 'Terminal 2', complianceScore: 99.1, completedToday: 20, totalToday: 20, activeAlerts: 0, status: 'Compliant' },
];
