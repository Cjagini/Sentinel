// API Response Types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

// Classification Types
export interface ClassificationResult {
  category: string;
  confidence: number;
}

// Alert Types
export interface AlertRuleInput {
  userId: string;
  category: string;
  threshold: number;
}

export interface AlertRuleOutput {
  id: string;
  userId: string;
  category: string;
  threshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionInput {
  userId: string;
  description: string;
  amount: number;
}

export interface TransactionOutput {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertEvent {
  userId: string;
  category: string;
  threshold: number;
  totalSpent: number;
  message: string;
  triggeredAt: Date;
}
