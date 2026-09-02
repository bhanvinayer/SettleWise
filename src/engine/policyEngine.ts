import { ExceptionCase, PolicyGuardrails, DecisionAction } from '../types/settlewise';

export const DEFAULT_POLICY_GUARDRAILS: PolicyGuardrails = {
  minConfidenceAutoResolve: 95.0,
  minCandidateMargin: 15.0,
  maxAutoResolveAmount: 100000,
  mandatoryReviewDuplicate: true,
  mandatoryReviewUnexplainedAbove: 500,
  requireDeterministicArithmeticMatch: true
};

export interface PolicyEvaluationResult {
  authorizedAction: DecisionAction;
  isAutoResolvePermitted: boolean;
  validationChecklist: { check: string; passed: boolean; note: string }[];
  policySummary: string;
}

export function evaluatePolicyRules(
  exceptionCase: ExceptionCase,
  guardrails: PolicyGuardrails = DEFAULT_POLICY_GUARDRAILS
): PolicyEvaluationResult {
  const checklist: { check: string; passed: boolean; note: string }[] = [];
  let isPermitted = true;

  // Rule 1: AI Confidence Check
  const confPassed = exceptionCase.aiConfidence >= guardrails.minConfidenceAutoResolve;
  checklist.push({
    check: `AI Confidence Score (>= ${guardrails.minConfidenceAutoResolve}%)`,
    passed: confPassed,
    note: `Actual score: ${exceptionCase.aiConfidence.toFixed(1)}%`
  });
  if (!confPassed) isPermitted = false;

  // Rule 2: Candidate Confidence Margin Check (H1 vs H2)
  if (exceptionCase.hypotheses.length >= 2) {
    const h1 = exceptionCase.hypotheses[0].confidenceScore;
    const h2 = exceptionCase.hypotheses[1].confidenceScore;
    const margin = h1 - h2;
    const marginPassed = margin >= guardrails.minCandidateMargin;
    checklist.push({
      check: `Top Hypothesis Confidence Margin (>= ${guardrails.minCandidateMargin}%)`,
      passed: marginPassed,
      note: `H1 (${h1.toFixed(1)}%) vs H2 (${h2.toFixed(1)}%), Margin: ${margin.toFixed(1)}%`
    });
    if (!marginPassed) isPermitted = false;
  } else {
    checklist.push({
      check: `Dominant Hypothesis Isolation`,
      passed: true,
      note: 'Single hypothesis isolated cleanly'
    });
  }

  // Rule 3: Mandatory Human Review for Duplicate Candidate Settlements
  if (guardrails.mandatoryReviewDuplicate && exceptionCase.category === 'DUPLICATE_CANDIDATE') {
    checklist.push({
      check: 'Duplicate Settlement Ambiguity Protection',
      passed: false,
      note: 'Multiple candidate payouts exist. Mandatory human authorization required.'
    });
    isPermitted = false;
  }

  // Rule 4: Maximum Auto-Resolution Amount Cap
  const amountPassed = exceptionCase.paymentAmount <= guardrails.maxAutoResolveAmount;
  checklist.push({
    check: `Transaction Amount Limit (<= ₹${guardrails.maxAutoResolveAmount.toLocaleString('en-IN')})`,
    passed: amountPassed,
    note: `Transaction amount: ₹${exceptionCase.paymentAmount.toLocaleString('en-IN')}`
  });
  if (!amountPassed) isPermitted = false;

  // Rule 5: Unexplained Rupee Delta Threshold
  const deltaPassed = exceptionCase.unexplainedDelta <= guardrails.mandatoryReviewUnexplainedAbove;
  checklist.push({
    check: `Unexplained Discrepancy Cap (<= ₹${guardrails.mandatoryReviewUnexplainedAbove})`,
    passed: deltaPassed,
    note: `Unexplained delta: ₹${exceptionCase.unexplainedDelta.toLocaleString('en-IN')}`
  });
  if (!deltaPassed) isPermitted = false;

  // Rule 6: Deterministic Arithmetic Verification
  if (guardrails.requireDeterministicArithmeticMatch) {
    const calculatedSettlement = exceptionCase.moneyTrail.reduce((acc, step) => {
      if (step.stage === 'PAYMENT') return acc + step.actualAmount;
      if (step.stage === 'REFUND') return acc + step.actualAmount;
      if (step.stage === 'FEE') return acc + step.actualAmount;
      return acc;
    }, 0);

    const arithmeticMatch = calculatedSettlement === exceptionCase.actualSettlement || exceptionCase.category === 'PARTIAL_REFUND';
    checklist.push({
      check: 'Deterministic Arithmetic Ledger Verification',
      passed: arithmeticMatch,
      note: arithmeticMatch ? 'Calculated ledger matches net payout' : 'Ledger arithmetic mismatch detected'
    });
    if (!arithmeticMatch) isPermitted = false;
  }

  // Determine final action based on evaluation & category
  let finalAction: DecisionAction = exceptionCase.recommendedAction;

  if (exceptionCase.category === 'FEE_MISMATCH' && exceptionCase.recoveryAmount) {
    finalAction = 'RECOVERY_CASE';
  } else if (!isPermitted) {
    if (exceptionCase.category === 'DUPLICATE_CANDIDATE' || exceptionCase.aiConfidence < 60) {
      finalAction = 'BLOCK';
    } else {
      finalAction = 'HUMAN_REVIEW';
    }
  } else {
    finalAction = 'AUTO_RESOLVE';
  }

  const summary = isPermitted
    ? `ALL POLICY GUARDRAILS PASSED. System authorized AUTO_RESOLVE for Exception ${exceptionCase.id}.`
    : `POLICY GUARDRAIL TRIGGERED. Auto-resolution withheld. Case escalated to ${finalAction}.`;

  return {
    authorizedAction: finalAction,
    isAutoResolvePermitted: isPermitted,
    validationChecklist: checklist,
    policySummary: summary
  };
}
