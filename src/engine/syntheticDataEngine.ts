import { ExceptionCase, MoneyTrailStep, EvidenceItem, Hypothesis } from '../types/settlewise';

const MERCHANTS = [
  { id: 'MCH_9021', name: 'Zomato Fresh Technologies' },
  { id: 'MCH_4482', name: 'Swiggy Instamart Commerce' },
  { id: 'MCH_1193', name: 'Meesho Direct Retail' },
  { id: 'MCH_7832', name: 'Urban Company Services' },
  { id: 'MCH_3391', name: 'Nykaa Beauty Platform' },
  { id: 'MCH_5510', name: 'Blinkit Hyperlocal' },
  { id: 'MCH_8294', name: 'Cleartrip Travel Solutions' },
  { id: 'MCH_6104', name: 'BookMyShow Entertainment' },
  { id: 'MCH_2941', name: 'Pepperfry Home Decor' },
  { id: 'MCH_7719', name: 'Dunzo Express Logistics' },
];

export function generateSyntheticBatch(count: number = 50): ExceptionCase[] {
  const cases: ExceptionCase[] = [];

  // Anchor high-impact predefined cases for full demo fidelity
  cases.push(createCase1_EasyException());
  cases.push(createCase2_SettlementDelay());
  cases.push(createCase3_DangerousAmbiguityDuplicate());
  cases.push(createCase4_MoneyLeakageRecovery());
  cases.push(createCase5_MissingRefundWebhook());
  cases.push(createCase6_FeeMismatchDiscrepancy());

  const remaining = count - cases.length;

  for (let i = 0; i < remaining; i++) {
    const caseNum = 48300 + i;
    const merchant = MERCHANTS[i % MERCHANTS.length];
    const categoryRoll = Math.random();

    if (categoryRoll < 0.45) {
      // Standard Easy Exception (Partial refund / Fee)
      cases.push(generateRandomEasyCase(caseNum, merchant));
    } else if (categoryRoll < 0.70) {
      // Settlement delay T+1
      cases.push(generateRandomDelayCase(caseNum, merchant));
    } else if (categoryRoll < 0.85) {
      // Money Leakage Recovery Case
      cases.push(generateRandomRecoveryCase(caseNum, merchant));
    } else {
      // High Ambiguity Duplicate or Conflicting Case
      cases.push(generateRandomAmbiguousCase(caseNum, merchant));
    }
  }

  return cases;
}

// Example 1: Easy Exception (Partial Refund + Fee)
function createCase1_EasyException(): ExceptionCase {
  const payment = 25000;
  const refund = 2000;
  const fee = 250;
  const actualSettlement = 22750;

  const moneyTrail: MoneyTrailStep[] = [
    { stage: 'PAYMENT', label: 'Payment Received', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Razorpay Payment ID pay_P38291 verified' },
    { stage: 'REFUND', label: 'Partial Refund Processed', expectedAmount: -refund, actualAmount: -refund, delta: 0, status: 'MATCH', detailNote: 'Customer partial refund ref_R2931 matched' },
    { stage: 'FEE', label: 'Standard Gateway Fee (1%)', expectedAmount: -fee, actualAmount: -fee, delta: 0, status: 'MATCH', detailNote: 'Razorpay MDR fee fee_F1938 calculated' },
    { stage: 'EXPECTED_SETTLEMENT', label: 'Calculated Expected Payout', expectedAmount: 22750, actualAmount: 22750, delta: 0, status: 'MATCH', detailNote: '₹25,000 - ₹2,000 - ₹250 = ₹22,750' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Actual Bank Batch Payout', expectedAmount: 22750, actualAmount: actualSettlement, delta: 0, status: 'RESOLVED', detailNote: 'Settlement Batch set_S8392 matched in HDFC Bank' },
    { stage: 'BANK_ENTRY', label: 'Bank Statement Credit', expectedAmount: 22750, actualAmount: actualSettlement, delta: 0, status: 'RESOLVED', detailNote: 'UTR HDFC0002941 credited successfully' },
  ];

  const evidence: EvidenceItem[] = [
    { id: 'EVD_1', source: 'Payment Gateway', recordReference: 'pay_P38291', matchScore: 100, keyValues: { Amount: '₹25,000', Status: 'captured', Method: 'UPI' }, status: 'VERIFIED' },
    { id: 'EVD_2', source: 'Refund Ledger', recordReference: 'ref_R2931', matchScore: 99, keyValues: { Amount: '₹2,000', Reason: 'Customer return', PaymentId: 'pay_P38291' }, status: 'VERIFIED' },
    { id: 'EVD_3', source: 'Fee Engine', recordReference: 'fee_F1938', matchScore: 97, keyValues: { FeeAmount: '₹250', Tax: '₹0', StandardRate: '1.0%' }, status: 'VERIFIED' },
    { id: 'EVD_4', source: 'Settlement Batch', recordReference: 'set_S8392', matchScore: 100, keyValues: { BatchTotal: '₹22,750', UTR: 'HDFC0002941' }, status: 'VERIFIED' },
  ];

  const hypotheses: Hypothesis[] = [
    { id: 'H1', title: 'Partial refund + Standard Gateway Processing Fee', explanation: 'All money movements (₹25K payment, ₹2K refund, ₹250 MDR fee) arithmetic sums perfectly to ₹22,750 actual payout.', confidenceScore: 98.4, supportingFactors: ['100% Payment Match', 'Verified Refund ID', 'Timestamp sequence valid'], suggestedAction: 'AUTO_RESOLVE' },
    { id: 'H2', title: 'Full refund with missing fee ledger entry', explanation: 'Less likely due to refund record matching exact ₹2,000 partial request.', confidenceScore: 1.6, supportingFactors: [], counterEvidence: ['Refund explicitly marked partial'], suggestedAction: 'HUMAN_REVIEW' }
  ];

  return {
    id: '#48291',
    merchantId: 'MCH_9021',
    merchantName: 'Zomato Fresh Technologies',
    paymentId: 'pay_P38291',
    paymentAmount: payment,
    expectedSettlement: 22750,
    actualSettlement: actualSettlement,
    unexplainedDelta: 0,
    category: 'PARTIAL_REFUND',
    urgency: 'LOW',
    status: 'RESOLVED',
    aiConfidence: 98.4,
    moneyTrail,
    evidence,
    hypotheses,
    recommendedAction: 'AUTO_RESOLVE',
    authorizedAction: 'AUTO_RESOLVE',
    aiReasoning: 'AI investigation confirmed complete evidence match. Payment (₹25,000) minus Partial Refund (₹2,000) minus Gateway Fee (₹250) accounts for 100% of the ₹22,750 settlement. Policy authorizes immediate auto-resolution.',
    ruleValidationNotes: [
      '✓ AI Confidence (98.4%) exceeds minimum auto-resolve threshold (95.0%)',
      '✓ Deterministic arithmetic check passed (₹25,000 - ₹2,000 - ₹250 = ₹22,750)',
      '✓ Zero unexplained financial delta',
      '✓ Policy Authorized: AUTO_RESOLVE'
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    historicalMemoryMatches: 84
  };
}

// Example 2: Settlement Timing Delay (T+1 shift)
function createCase2_SettlementDelay(): ExceptionCase {
  const payment = 50000;
  const fee = 500;
  const expectedSettlement = 49500;
  const actualSettlement = 49500;

  const moneyTrail: MoneyTrailStep[] = [
    { stage: 'PAYMENT', label: 'Payment Received', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Razorpay Payment ID pay_P50022 captured on T-1' },
    { stage: 'FEE', label: 'Standard Gateway Fee', expectedAmount: -fee, actualAmount: -fee, delta: 0, status: 'MATCH', detailNote: 'Standard 1% fee deducted' },
    { stage: 'EXPECTED_SETTLEMENT', label: 'Expected Settlement Date (T+0)', expectedAmount: expectedSettlement, actualAmount: 0, delta: expectedSettlement, status: 'MISMATCH', detailNote: 'Batch payout missing on expected date' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Actual Bank Settlement Date (T+1)', expectedAmount: expectedSettlement, actualAmount: actualSettlement, delta: 0, status: 'RESOLVED', detailNote: 'Settled 24h later in batch set_S9910' },
    { stage: 'BANK_ENTRY', label: 'Bank Credit Record', expectedAmount: expectedSettlement, actualAmount: actualSettlement, delta: 0, status: 'RESOLVED', detailNote: 'UTR ICIC0009182 verified' }
  ];

  const evidence: EvidenceItem[] = [
    { id: 'EVD_1', source: 'Payment Gateway', recordReference: 'pay_P50022', matchScore: 100, keyValues: { Amount: '₹50,000', Timestamp: '2026-08-29 23:45 IST' }, status: 'VERIFIED' },
    { id: 'EVD_2', source: 'Settlement Batch', recordReference: 'set_S9910', matchScore: 96, keyValues: { PayoutDate: '2026-08-31 09:00 IST', DelayReason: 'Weekend Bank Cutoff' }, status: 'VERIFIED' },
  ];

  const hypotheses: Hypothesis[] = [
    { id: 'H1', title: 'Settlement Timing Window Shift (T+1 Bank Cutoff Delay)', explanation: 'Transaction occurred at 23:45 IST, after banking clearing window. Payout rolled safely to next business day batch.', confidenceScore: 94.2, supportingFactors: ['Same UTR & Merchant ID', 'Exact Net Payout Match', '24h timing delta'], suggestedAction: 'MONITOR' },
    { id: 'H2', title: 'Unsettled Gateway Hold', explanation: 'Unlikely as payout completed in following morning batch.', confidenceScore: 5.8, supportingFactors: [], suggestedAction: 'HUMAN_REVIEW' }
  ];

  return {
    id: '#48292',
    merchantId: 'MCH_4482',
    merchantName: 'Swiggy Instamart Commerce',
    paymentId: 'pay_P50022',
    paymentAmount: payment,
    expectedSettlement,
    actualSettlement,
    unexplainedDelta: 0,
    category: 'TIMING_MISMATCH',
    urgency: 'LOW',
    status: 'RESOLVED',
    aiConfidence: 94.2,
    moneyTrail,
    evidence,
    hypotheses,
    recommendedAction: 'MONITOR',
    authorizedAction: 'AUTO_RESOLVE',
    aiReasoning: 'AI investigation identified 24-hour settlement shift due to banking holiday / weekend cutoff window. UTR and batch numbers match 100%. Settled in full.',
    ruleValidationNotes: [
      '✓ UTR reference verified across bank statement & gateway ledger',
      '✓ Zero net financial leakage',
      '✓ Category: Timing Delay Resolved'
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    historicalMemoryMatches: 112
  };
}

// Example 3: Dangerous Ambiguity (Duplicate Candidates - HONEST EXCEPTION)
function createCase3_DangerousAmbiguityDuplicate(): ExceptionCase {
  const payment = 75000;
  const expectedSettlement = 74250;

  const moneyTrail: MoneyTrailStep[] = [
    { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Razorpay Payment ID pay_P75099' },
    { stage: 'FEE', label: 'Estimated Fee', expectedAmount: -750, actualAmount: -750, delta: 0, status: 'MATCH', detailNote: '₹750 Fee' },
    { stage: 'EXPECTED_SETTLEMENT', label: 'Expected Settlement', expectedAmount: expectedSettlement, actualAmount: 74250, delta: 0, status: 'MISMATCH', detailNote: 'Two conflicting ₹74,250 settlements detected' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Settlement Candidate A', expectedAmount: 74250, actualAmount: 74250, delta: 0, status: 'UNEXPLAINED', detailNote: 'Batch set_S3301 (UTR AXIS00182)' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Settlement Candidate B', expectedAmount: 74250, actualAmount: 74250, delta: 0, status: 'UNEXPLAINED', detailNote: 'Batch set_S3302 (UTR AXIS00189)' },
  ];

  const evidence: EvidenceItem[] = [
    { id: 'EVD_1', source: 'Payment Gateway', recordReference: 'pay_P75099', matchScore: 100, keyValues: { Amount: '₹75,000', Merchant: 'Meesho Direct' }, status: 'VERIFIED' },
    { id: 'EVD_2', source: 'Settlement Batch', recordReference: 'set_S3301', matchScore: 51.2, keyValues: { Amount: '₹74,250', UTR: 'AXIS00182' }, status: 'DISCREPANCY' },
    { id: 'EVD_3', source: 'Settlement Batch', recordReference: 'set_S3302', matchScore: 48.8, keyValues: { Amount: '₹74,250', UTR: 'AXIS00189' }, status: 'DISCREPANCY' },
  ];

  const hypotheses: Hypothesis[] = [
    { id: 'H1', title: 'Settlement Batch set_S3301 is authentic payout', explanation: 'Candidate A shares exact merchant batch timestamp but lacks bank webhook ack.', confidenceScore: 51.2, supportingFactors: ['Exact amount match'], counterEvidence: ['Candidate B exists with identical amount on same day'], suggestedAction: 'HUMAN_REVIEW' },
    { id: 'H2', title: 'Settlement Batch set_S3302 is authentic payout (Duplicate Batch Injection)', explanation: 'Candidate B matches bank credit UTR but lacks gateway reference correlation.', confidenceScore: 48.8, supportingFactors: ['Exact amount match'], counterEvidence: ['Candidate A exists with identical amount'], suggestedAction: 'HUMAN_REVIEW' }
  ];

  return {
    id: '#48293',
    merchantId: 'MCH_1193',
    merchantName: 'Meesho Direct Retail',
    paymentId: 'pay_P75099',
    paymentAmount: payment,
    expectedSettlement,
    actualSettlement: 74250,
    unexplainedDelta: 0,
    category: 'DUPLICATE_CANDIDATE',
    urgency: 'HIGH',
    status: 'BLOCKED',
    aiConfidence: 51.2,
    moneyTrail,
    evidence,
    hypotheses,
    recommendedAction: 'BLOCK',
    authorizedAction: 'BLOCK',
    aiReasoning: 'AI investigation detected TWO equally plausible candidate settlements (Candidate A: 51.2%, Candidate B: 48.8%). Automatically selecting either could create a false reconciliation and double-payout risk.',
    ruleValidationNotes: [
      '🛑 POLICY GUARDRAIL TRIGGERED: Mandatory Human Review for Duplicate Candidate Settlements',
      '🛑 Candidate confidence delta (2.4%) is below minimum safe margin requirement (15.0%)',
      '🛑 AI Auto-Resolution BLOCKED by deterministic policy engine',
      '✓ Safety Escalation Executed: Sent to Human Finance Operator'
    ],
    honestExceptionReason: 'Two equally plausible settlement candidates exist (AXIS00182 vs AXIS00189). Auto-resolving either poses a high risk of double reconciliation. Deterministic rules safely blocked execution.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    historicalMemoryMatches: 12
  };
}

// Example 4: Money Recovery Case (₹500 Settlement Leakage)
function createCase4_MoneyLeakageRecovery(): ExceptionCase {
  const payment = 40000;
  const fee = 300;
  const expectedSettlement = 39700;
  const actualSettlement = 39200;
  const unexplainedDelta = 500;

  const moneyTrail: MoneyTrailStep[] = [
    { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Razorpay Payment ID pay_P40081' },
    { stage: 'FEE', label: 'Agreed Contract Fee (0.75%)', expectedAmount: -fee, actualAmount: -fee, delta: 0, status: 'MATCH', detailNote: 'Contractual fee ₹300' },
    { stage: 'EXPECTED_SETTLEMENT', label: 'Expected Net Payout', expectedAmount: expectedSettlement, actualAmount: 39700, delta: 0, status: 'MATCH', detailNote: 'Calculated expected payout ₹39,700' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Actual Bank Payout', expectedAmount: expectedSettlement, actualAmount: actualSettlement, delta: -500, status: 'UNEXPLAINED', detailNote: 'Bank credit received only ₹39,200' },
    { stage: 'BANK_ENTRY', label: 'Settlement Fee Deduction Leakage', expectedAmount: -500, actualAmount: 0, delta: -500, status: 'RECOVERABLE', detailNote: 'Unexplained ₹500 fee deduction by intermediate clearing bank' }
  ];

  const evidence: EvidenceItem[] = [
    { id: 'EVD_1', source: 'Payment Gateway', recordReference: 'pay_P40081', matchScore: 100, keyValues: { Amount: '₹40,000', Merchant: 'Urban Company' }, status: 'VERIFIED' },
    { id: 'EVD_2', source: 'Fee Engine', recordReference: 'fee_F8821', matchScore: 100, keyValues: { AgreedFee: '₹300', Status: 'SETTLED' }, status: 'VERIFIED' },
    { id: 'EVD_3', source: 'Bank Statement', recordReference: 'bank_B9918', matchScore: 82, keyValues: { ActualCredit: '₹39,200', Discrepancy: '-₹500' }, status: 'DISCREPANCY' },
  ];

  const hypotheses: Hypothesis[] = [
    { id: 'H1', title: 'Unaccounted Clearing House / Intermediate Bank Charge Leakage', explanation: 'Gateway settled ₹39,700, but clearing bank deducted an un-itemized ₹500 fee without invoice backing. Merchant is owed ₹500 recovery.', confidenceScore: 96.1, supportingFactors: ['Gateway fee logs clean', 'Merchant contract rate verified', '₹500 isolated shortfall'], suggestedAction: 'RECOVERY_CASE' }
  ];

  return {
    id: '#48294',
    merchantId: 'MCH_7832',
    merchantName: 'Urban Company Services',
    paymentId: 'pay_P40081',
    paymentAmount: payment,
    expectedSettlement,
    actualSettlement,
    unexplainedDelta,
    category: 'FEE_MISMATCH',
    urgency: 'HIGH',
    status: 'RECOVERING',
    aiConfidence: 96.1,
    moneyTrail,
    evidence,
    hypotheses,
    recommendedAction: 'RECOVERY_CASE',
    authorizedAction: 'RECOVERY_CASE',
    aiReasoning: 'SettleWise investigated the ₹500 discrepancy and identified money leakage caused by an un-itemized intermediate bank deduction. Merchant contract guarantees ₹39,700 payout. Automated recovery claim generated.',
    ruleValidationNotes: [
      '✓ Financial Leakage Isolated: ₹500',
      '✓ Intermediate Bank Charge verified as non-contractual',
      '✓ Action Authorized: CREATE RECOVERY CASE'
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    recoveryAmount: 500,
    recoveryNotes: 'Recovery claim #REC-48294 generated for ₹500 against Partner Bank Clearing Ops.',
    historicalMemoryMatches: 39
  };
}

function createCase5_MissingRefundWebhook(): ExceptionCase {
  const payment = 21000;
  const expectedSettlement = 20790;
  const actualSettlement = 18000;
  const unexplainedDelta = 2790;

  const moneyTrail: MoneyTrailStep[] = [
    { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Payment ID pay_P21004' },
    { stage: 'REFUND', label: 'Unlinked Customer Refund Request', expectedAmount: -2790, actualAmount: 0, delta: -2790, status: 'UNEXPLAINED', detailNote: 'Refund recorded in Merchant CRM but missing Gateway Webhook' },
    { stage: 'EXPECTED_SETTLEMENT', label: 'Expected Payout', expectedAmount: expectedSettlement, actualAmount: 18000, delta: -2790, status: 'MISMATCH', detailNote: 'Shortfall of ₹2,790' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Actual Payout', expectedAmount: expectedSettlement, actualAmount: actualSettlement, delta: 0, status: 'UNEXPLAINED', detailNote: 'Payout received ₹18,000' },
  ];

  const evidence: EvidenceItem[] = [
    { id: 'EVD_1', source: 'Payment Gateway', recordReference: 'pay_P21004', matchScore: 100, keyValues: { Amount: '₹21,000' }, status: 'VERIFIED' },
    { id: 'EVD_2', source: 'Webhook Log', recordReference: 'wh_LOG881', matchScore: 40, keyValues: { WebhookStatus: 'FAILED_TIMEOUT', Event: 'refund.processed' }, status: 'DISCREPANCY' }
  ];

  const hypotheses: Hypothesis[] = [
    { id: 'H1', title: 'Dropped Refund Webhook Event', explanation: 'Gateway processed a ₹2,790 partial refund, but the webhook notification failed to reach merchant CRM.', confidenceScore: 88.5, supportingFactors: ['CRM refund request timestamp matches'], counterEvidence: ['Gateway webhook status marked FAILED'], suggestedAction: 'HUMAN_REVIEW' }
  ];

  return {
    id: '#48295',
    merchantId: 'MCH_3391',
    merchantName: 'Nykaa Beauty Platform',
    paymentId: 'pay_P21004',
    paymentAmount: payment,
    expectedSettlement,
    actualSettlement,
    unexplainedDelta,
    category: 'MISSING_SETTLEMENT',
    urgency: 'MEDIUM',
    status: 'ESCALATED',
    aiConfidence: 88.5,
    moneyTrail,
    evidence,
    hypotheses,
    recommendedAction: 'HUMAN_REVIEW',
    authorizedAction: 'HUMAN_REVIEW',
    aiReasoning: 'Investigation flagged a dropped refund webhook event resulting in ₹2,790 mismatch between merchant ledger and gateway payout. Escalated to human operator for webhook sync.',
    ruleValidationNotes: [
      '⚠️ AI Confidence (88.5%) below safe threshold (95.0%) for auto-resolution',
      '✓ Policy Action Executed: Send to Human Review with Webhook Audit Trail'
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    historicalMemoryMatches: 18
  };
}

function createCase6_FeeMismatchDiscrepancy(): ExceptionCase {
  const payment = 150000;
  const expectedSettlement = 148500;
  const actualSettlement = 148500;

  const moneyTrail: MoneyTrailStep[] = [
    { stage: 'PAYMENT', label: 'High Value B2B Payment', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Razorpay Payment ID pay_P15000' },
    { stage: 'FEE', label: 'Tiered Enterprise MDR Rate', expectedAmount: -1500, actualAmount: -1500, delta: 0, status: 'MATCH', detailNote: '1.0% Enterprise rate' },
    { stage: 'EXPECTED_SETTLEMENT', label: 'Expected Payout', expectedAmount: expectedSettlement, actualAmount: actualSettlement, delta: 0, status: 'MATCH', detailNote: '₹148,500' },
    { stage: 'ACTUAL_SETTLEMENT', label: 'Actual Payout', expectedAmount: expectedSettlement, actualAmount: actualSettlement, delta: 0, status: 'RESOLVED', detailNote: 'UTR HDFC009981 matched' }
  ];

  const evidence: EvidenceItem[] = [
    { id: 'EVD_1', source: 'Payment Gateway', recordReference: 'pay_P15000', matchScore: 100, keyValues: { Amount: '₹1,50,000' }, status: 'VERIFIED' },
    { id: 'EVD_2', source: 'Fee Engine', recordReference: 'fee_F998', matchScore: 99, keyValues: { Tier: 'Enterprise Level 2' }, status: 'VERIFIED' }
  ];

  const hypotheses: Hypothesis[] = [
    { id: 'H1', title: 'Enterprise Special Fee Slab Tiering', explanation: 'Correctly matches contract tier 2 fee schedule for transactions > ₹100,000.', confidenceScore: 99.1, supportingFactors: ['Contract tier verified'], suggestedAction: 'AUTO_RESOLVE' }
  ];

  return {
    id: '#48296',
    merchantId: 'MCH_5510',
    merchantName: 'Blinkit Hyperlocal',
    paymentId: 'pay_P15000',
    paymentAmount: payment,
    expectedSettlement,
    actualSettlement,
    unexplainedDelta: 0,
    category: 'FEE_MISMATCH',
    urgency: 'LOW',
    status: 'RESOLVED',
    aiConfidence: 99.1,
    moneyTrail,
    evidence,
    hypotheses,
    recommendedAction: 'AUTO_RESOLVE',
    authorizedAction: 'AUTO_RESOLVE',
    aiReasoning: 'Verified enterprise volume slab rate. 100% matched.',
    ruleValidationNotes: [
      '✓ AI Confidence 99.1% >= 95.0%',
      '✓ Zero unexplained delta',
      '✓ Auto-Resolution Executed'
    ],
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    historicalMemoryMatches: 65
  };
}

function generateRandomEasyCase(caseNum: number, merchant: { id: string; name: string }): ExceptionCase {
  const payment = Math.floor(Math.random() * 40000) + 5000;
  const refund = Math.floor(payment * 0.1);
  const fee = Math.floor(payment * 0.01);
  const net = payment - refund - fee;

  return {
    id: `#${caseNum}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    paymentId: `pay_P${caseNum}`,
    paymentAmount: payment,
    expectedSettlement: net,
    actualSettlement: net,
    unexplainedDelta: 0,
    category: 'PARTIAL_REFUND',
    urgency: 'LOW',
    status: 'RESOLVED',
    aiConfidence: Number((95 + Math.random() * 4.5).toFixed(1)),
    moneyTrail: [
      { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: `Payment ${payment}` },
      { stage: 'REFUND', label: 'Refund Processed', expectedAmount: -refund, actualAmount: -refund, delta: 0, status: 'MATCH', detailNote: `Refund ${refund}` },
      { stage: 'FEE', label: 'Gateway Fee', expectedAmount: -fee, actualAmount: -fee, delta: 0, status: 'MATCH', detailNote: `Fee ${fee}` },
      { stage: 'ACTUAL_SETTLEMENT', label: 'Settlement Credit', expectedAmount: net, actualAmount: net, delta: 0, status: 'RESOLVED', detailNote: `Net payout ${net}` }
    ],
    evidence: [
      { id: `EVD_${caseNum}_1`, source: 'Payment Gateway', recordReference: `pay_P${caseNum}`, matchScore: 100, keyValues: { Amount: `₹${payment}` }, status: 'VERIFIED' }
    ],
    hypotheses: [
      { id: 'H1', title: 'Standard Partial Refund + Fee Deduction', explanation: 'All evidence items align arithmetic values.', confidenceScore: 97.5, supportingFactors: ['100% Match'], suggestedAction: 'AUTO_RESOLVE' }
    ],
    recommendedAction: 'AUTO_RESOLVE',
    authorizedAction: 'AUTO_RESOLVE',
    aiReasoning: 'Easy exception resolved automatically via evidence synthesis.',
    ruleValidationNotes: ['✓ Auto-resolve authorized by deterministic policy engine'],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    historicalMemoryMatches: Math.floor(Math.random() * 50) + 10
  };
}

function generateRandomDelayCase(caseNum: number, merchant: { id: string; name: string }): ExceptionCase {
  const payment = Math.floor(Math.random() * 80000) + 10000;
  const fee = Math.floor(payment * 0.01);
  const net = payment - fee;

  return {
    id: `#${caseNum}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    paymentId: `pay_P${caseNum}`,
    paymentAmount: payment,
    expectedSettlement: net,
    actualSettlement: net,
    unexplainedDelta: 0,
    category: 'TIMING_MISMATCH',
    urgency: 'LOW',
    status: 'RESOLVED',
    aiConfidence: Number((92 + Math.random() * 5).toFixed(1)),
    moneyTrail: [
      { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Payment captured' },
      { stage: 'ACTUAL_SETTLEMENT', label: 'T+1 Delayed Payout', expectedAmount: net, actualAmount: net, delta: 0, status: 'RESOLVED', detailNote: 'Batch payout completed 24h later' }
    ],
    evidence: [
      { id: `EVD_${caseNum}`, source: 'Bank Statement', recordReference: `UTR_B${caseNum}`, matchScore: 95, keyValues: { UTR: `UTR${caseNum}89` }, status: 'VERIFIED' }
    ],
    hypotheses: [
      { id: 'H1', title: 'Settlement Window Shift', explanation: 'Bank settlement window shift T+1.', confidenceScore: 95.0, supportingFactors: ['UTR match'], suggestedAction: 'AUTO_RESOLVE' }
    ],
    recommendedAction: 'AUTO_RESOLVE',
    authorizedAction: 'AUTO_RESOLVE',
    aiReasoning: 'Settlement timing shift confirmed.',
    ruleValidationNotes: ['✓ Timing delay validated'],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
  };
}

function generateRandomRecoveryCase(caseNum: number, merchant: { id: string; name: string }): ExceptionCase {
  const payment = Math.floor(Math.random() * 50000) + 15000;
  const leakage = 400 + Math.floor(Math.random() * 600);
  const fee = Math.floor(payment * 0.01);
  const net = payment - fee - leakage;

  return {
    id: `#${caseNum}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    paymentId: `pay_P${caseNum}`,
    paymentAmount: payment,
    expectedSettlement: payment - fee,
    actualSettlement: net,
    unexplainedDelta: leakage,
    category: 'FEE_MISMATCH',
    urgency: 'HIGH',
    status: 'RECOVERING',
    aiConfidence: 96.5,
    moneyTrail: [
      { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Captured' },
      { stage: 'ACTUAL_SETTLEMENT', label: 'Bank Payout Received', expectedAmount: payment - fee, actualAmount: net, delta: -leakage, status: 'UNEXPLAINED', detailNote: `Unaccounted ₹${leakage} deduction` },
      { stage: 'BANK_ENTRY', label: 'Recoverable Fee Leakage', expectedAmount: -leakage, actualAmount: 0, delta: -leakage, status: 'RECOVERABLE', detailNote: 'Money leakage identified' }
    ],
    evidence: [
      { id: `EVD_${caseNum}`, source: 'Fee Engine', recordReference: `fee_F${caseNum}`, matchScore: 98, keyValues: { Discrepancy: `₹${leakage}` }, status: 'DISCREPANCY' }
    ],
    hypotheses: [
      { id: 'H1', title: 'Unaccounted Intermediate Bank Deduction', explanation: 'Money leakage detected.', confidenceScore: 96.5, supportingFactors: ['Contractual rate clear'], suggestedAction: 'RECOVERY_CASE' }
    ],
    recommendedAction: 'RECOVERY_CASE',
    authorizedAction: 'RECOVERY_CASE',
    aiReasoning: `Identified ₹${leakage} money leakage. Recovery ticket logged.`,
    ruleValidationNotes: ['✓ Money leakage recovery action authorized'],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    recoveryAmount: leakage,
    recoveryNotes: `Recovery case opened for ₹${leakage}`
  };
}

function generateRandomAmbiguousCase(caseNum: number, merchant: { id: string; name: string }): ExceptionCase {
  const payment = Math.floor(Math.random() * 90000) + 30000;
  const net = Math.floor(payment * 0.99);

  return {
    id: `#${caseNum}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    paymentId: `pay_P${caseNum}`,
    paymentAmount: payment,
    expectedSettlement: net,
    actualSettlement: net,
    unexplainedDelta: 0,
    category: 'DUPLICATE_CANDIDATE',
    urgency: 'HIGH',
    status: 'BLOCKED',
    aiConfidence: 53.4,
    moneyTrail: [
      { stage: 'PAYMENT', label: 'Payment Captured', expectedAmount: payment, actualAmount: payment, delta: 0, status: 'MATCH', detailNote: 'Captured' },
      { stage: 'ACTUAL_SETTLEMENT', label: 'Conflicting Candidate Payouts', expectedAmount: net, actualAmount: net, delta: 0, status: 'UNEXPLAINED', detailNote: 'Two matching settlements' }
    ],
    evidence: [
      { id: `EVD_${caseNum}_1`, source: 'Settlement Batch', recordReference: `set_A${caseNum}`, matchScore: 53, keyValues: { UTR: `UTR${caseNum}A` }, status: 'DISCREPANCY' },
      { id: `EVD_${caseNum}_2`, source: 'Settlement Batch', recordReference: `set_B${caseNum}`, matchScore: 47, keyValues: { UTR: `UTR${caseNum}B` }, status: 'DISCREPANCY' }
    ],
    hypotheses: [
      { id: 'H1', title: 'Candidate A Payout', explanation: 'Candidate A 53.4% confidence', confidenceScore: 53.4, supportingFactors: [], suggestedAction: 'HUMAN_REVIEW' },
      { id: 'H2', title: 'Candidate B Payout', explanation: 'Candidate B 46.6% confidence', confidenceScore: 46.6, supportingFactors: [], suggestedAction: 'HUMAN_REVIEW' }
    ],
    recommendedAction: 'BLOCK',
    authorizedAction: 'BLOCK',
    aiReasoning: 'High risk duplicate candidate detected. Confidence margin too small. Auto-resolution blocked by safety policy.',
    ruleValidationNotes: [
      '🛑 Safety Policy Triggered: Duplicate candidate ambiguous',
      '🛑 Auto-resolution BLOCKED'
    ],
    honestExceptionReason: 'Two conflicting settlement batches match transaction amount. Execution safely blocked.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
  };
}
