export interface BusinessProfile {
  name: string;
  industry: string;
  revenue: string;
  employees: number;
  location: string;
  healthScore: number;
}

export interface KPICard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  colorClass: 'blue' | 'purple' | 'orange' | 'green';
}

export interface Scheme {
  id: string;
  name: string;
  title: string;
  description: string;
  maxLoan: string;
  subsidy: string;
  matchScore: number;
  coachInsight: string;
  profileReadiness: number;
  eligibilityTag?: string;
  isTopMatch?: boolean;
}

export interface VaultFolder {
  id: string;
  name: string;
  fileCount: number;
  status: 'verified' | 'pending';
  info: string;
  iconName: string;
}

export interface ActivityLog {
  id: string;
  filename: string;
  type: 'upload' | 'api' | 'export';
  actionText: string;
  timeAgo: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  iconName: string;
  roiMonths: number;
  monthlyRev: string;
  capitalExpenditure: string;
  riskPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  aiConfidence: number;
  description: string;
  finishingTip: string;
}

export interface GrowthDataPoint {
  quarter: string;
  current: number;
  optimized: number;
}

export interface RoadmapStep {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  iconName: string;
}

export interface DocumentDraft {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorTheme: 'blue' | 'purple' | 'orange' | 'green';
}
