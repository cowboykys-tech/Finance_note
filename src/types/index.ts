export interface UserInput {
  customerName: string;
  customerPhone: string;
  customerRegion: string;
  customerConcern: string;
  businessNumber: string;
  businessName: string;

  mainIndustry: string;
  subIndustry: string;
  businessDescription: string;

  annualRevenue: number; // 만원 단위
  loan: number; // 일반 대출 (만원 단위)
  guaranteeLoan: number; // 보증 대출 (만원 단위)
  credit: number; // NICE 신용점수

  startDate: string; // YYYY-MM-DD
  employeeCount: number;

  fundPurpose: string;

  hasDelinquency: boolean;
  hasTaxArrears: boolean;
}

export interface DiagnosisResult {
  status: 'ELIGIBLE' | 'CONDITIONAL' | 'REVIEW_REQUIRED' | 'TEMP_INELIGIBLE';
  statusMessage: string;
  statusReason: string;
  primaryInstitutions: string[];
  secondaryInstitutions: string[];
  direction: string;
  executionOrder: string[];
  realisticRange: string;
  conservativeMax: string;
  calculationBasis: string;
  notes: string[];
  consultationSummary: string;
  crmData: any;
  
  // UI compatibility
  summary?: string;
  possibleFunds?: string[];
  expectedInstitutions?: string[];
  requiredDocuments?: string[];
  precautions?: string[];
  
  // Deprecated but kept for safety during transition
  possibleInstitutions?: string[];
  expectedRange?: string;
  theoreticalMax?: string;
}

export type AppState = 'landing' | 'form' | 'result' | 'documents';
