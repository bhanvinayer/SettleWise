export type ExceptionCategory =
  | 'AMOUNT_MISMATCH'
  | 'MISSING_SETTLEMENT'
  | 'DUPLICATE_CANDIDATE'
  | 'PARTIAL_REFUND'
  | 'FEE_MISMATCH'
  | 'TIMING_MISMATCH'
  | 'UNEXPLAINED';

export type DecisionAction =
  | 'AUTO_RESOLVE'
  | 'HUMAN_REVIEW'
  | 'MONITOR'
  | 'RECOVERY_CASE'
  | 'BLOCK';

export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseStatus = 'OPEN' | 'RESOLVED' | 'ESCALATED' | 'RECOVERING' | 'BLOCKED';

export interface PaymentRecord {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  timestamp: string;
  paymentMethod: string;
  status: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  amount: number;
  timestamp: string;
  reason: string;
  status: string;
}

export interface FeeRecord {
  id: string;
  paymentId: string;
  feeAmount: number;
  taxAmount: number;
  status: 'SETTLED' | 'UNACCOUNTED' | 'DISPUTED';
}

export interface SettlementRecord {
  id: string;
  merchantId: string;
  settlementBatchId: string;
  netAmount: number;
  payoutDate: string;
  status: string;
}

export interface BankRecord {
  id: string;
  referenceNo: string;
  creditAmount: number;
  creditDate: string;
  utr: string;
}

export interface WebhookLog {
  eventId: string;
  eventType: string;
  timestamp: string;
  payloadMatch: boolean;
}

export interface EvidenceItem {
  id: string;
  source: 'Payment Gateway' | 'Refund Ledger' | 'Fee Engine' | 'Settlement Batch' | 'Bank Statement' | 'Webhook Log';
  recordReference: string;
  matchScore: number; // 0-100
  keyValues: Record<string, string | number>;
  status: 'VERIFIED' | 'DISCREPANCY' | 'MISSING';
}

export interface Hypothesis {
  id: string;
  title: string;
  explanation: string;
  confidenceScore: number; // 0 - 100
  supportingFactors: string[];
  counterEvidence?: string[];
  suggestedAction: DecisionAction;
}

export interface MoneyTrailStep {
  stage: 'PAYMENT' | 'REFUND' | 'FEE' | 'EXPECTED_SETTLEMENT' | 'ACTUAL_SETTLEMENT' | 'BANK_ENTRY';
  label: string;
  expectedAmount: number;
  actualAmount: number;
  delta: number;
  status: 'MATCH' | 'MISMATCH' | 'UNEXPLAINED' | 'RESOLVED' | 'RECOVERABLE';
  detailNote: string;
}

export interface ExceptionCase {
  id: string;
  merchantId: string;
  merchantName: string;
  paymentId: string;
  paymentAmount: number;
  expectedSettlement: number;
  actualSettlement: number;
  unexplainedDelta: number;
  category: ExceptionCategory;
  urgency: UrgencyLevel;
  status: CaseStatus;
  aiConfidence: number;
  moneyTrail: MoneyTrailStep[];
  evidence: EvidenceItem[];
  hypotheses: Hypothesis[];
  recommendedAction: DecisionAction;
  authorizedAction: DecisionAction | null;
  aiReasoning: string;
  ruleValidationNotes: string[];
  honestExceptionReason?: string;
  createdAt: string;
  recoveryAmount?: number;
  recoveryNotes?: string;
  historicalMemoryMatches?: number;
}

export interface PolicyGuardrails {
  minConfidenceAutoResolve: number; // default 95.0%
  minCandidateMargin: number; // default 15.0%
  maxAutoResolveAmount: number; // default 50000
  mandatoryReviewDuplicate: boolean; // default true
  mandatoryReviewUnexplainedAbove: number; // default 500
  requireDeterministicArithmeticMatch: boolean; // default true
}

export interface BenchmarkMetrics {
  totalRecords: number;
  cleanRecords: number;
  injectedExceptions: number;
  correctDiagnoses: number;
  diagnosisPrecision: number;
  autoResolveCount: number;
  autoResolvePrecision: number;
  safelyEscalatedCount: number;
  falseAutoResolutions: number;
  totalRupeesInvestigated: number;
  totalRupeesReconciled: number;
  moneyLeakageDetected: number;
  avgInvestigationTimeSec: number;
  honestExceptionsList: ExceptionCase[];
}

export interface InstitutionalPattern {
  id: string;
  category: ExceptionCategory;
  patternDescription: string;
  historicalCaseCount: number;
  historicalResolutionSuccess: number;
  suggestedAction: DecisionAction;
}

export interface LangGraphNodeLog {
  nodeId: string;
  nodeName: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'PAUSED' | 'FAILED';
  outputSummary: string;
  latencyMs: number;
  stateSnapshot: {
    stage: string;
    activeAgents: string[];
    confidence: number;
    decision?: string;
  };
}

export interface LangGraphTelemetry {
  graphId: string;
  executionStatus: 'COMPLETED' | 'PAUSED_HITL' | 'BLOCKED';
  totalLatencyMs: number;
  nodesExecuted: LangGraphNodeLog[];
  stateCheckpoint: {
    currentNode: string;
    nextEdge: string;
    memoryVectorsMatched: number;
    policyPassed: boolean;
  };
}
