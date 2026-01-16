
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
}

export interface ArticleData {
  id: string;
  title: string;
  content: string;
  uploadDate: string;
}

export interface StyleRule {
  id: string;
  category: 'proofreading' | 'editing' | 'polishing';
  rule: string;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  explanations: {
    type: 'proofreading' | 'editing' | 'refining';
    target: string;
    change: string;
    reason: string;
    source?: string;
  }[];
}

export interface UsageStats {
  totalStorageMB: number;
  usedStorageMB: number;
  trafficMB: number;
  tokenCount: number;
  estimatedCostUSD: number;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'CORRECTION' | 'TITLE';
  data: any;
}
