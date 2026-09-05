import { BenchmarkMetrics, PolicyGuardrails } from '../types/settlewise.js';

export interface SettleWiseAgentRecommendation {
  summary: string;
  recommendedChanges: { field: string; value: string | number | boolean; reason: string }[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  checks: string[];
}

export function createSettleWiseAgentRecommendation(
  guardrails: PolicyGuardrails,
  metrics: BenchmarkMetrics | null
): SettleWiseAgentRecommendation {
  const falsePositiveRate = metrics?.falsePositiveRate ?? 0;
  const safeEscalationRate = metrics?.safeEscalationRate ?? 0;
  const needsStricterReview = falsePositiveRate > 0 || safeEscalationRate < 95;
  const recommendedConfidence = needsStricterReview
    ? Math.min(99, Math.max(guardrails.minConfidenceAutoResolve + 1, 97))
    : guardrails.minConfidenceAutoResolve;
  const recommendedMargin = needsStricterReview
    ? Math.min(30, Math.max(guardrails.minCandidateMargin + 2, 17))
    : guardrails.minCandidateMargin;

  return {
    summary: needsStricterReview
      ? 'SettleWise Agent recommends tightening authorization because the replay shows avoidable decision risk.'
      : 'SettleWise Agent found the current guardrails appropriately conservative for the replay evidence.',
    recommendedChanges: [
      {
        field: 'minConfidenceAutoResolve',
        value: recommendedConfidence,
        reason: needsStricterReview ? 'Raise the confidence floor before allowing autonomous money movement.' : 'Current confidence floor is consistent with observed replay safety.',
      },
      {
        field: 'minCandidateMargin',
        value: recommendedMargin,
        reason: needsStricterReview ? 'Increase separation between competing hypotheses to protect ambiguous settlements.' : 'Current candidate separation is sufficient for this replay.',
      },
      {
        field: 'mandatoryReviewDuplicate',
        value: true,
        reason: 'Duplicate settlement candidates must remain human-authorized regardless of model confidence.',
      },
    ],
    riskLevel: falsePositiveRate > 0 ? 'HIGH' : safeEscalationRate < 95 ? 'MEDIUM' : 'LOW',
    reasoning: `The agent evaluated ${metrics?.totalRecords ?? 0} records, ${metrics?.correctActionDecisions ?? 0} correct policy actions, a ${falsePositiveRate}% false-positive rate, and ${safeEscalationRate}% safe escalation coverage. Recommendations are advisory; deterministic rules and operator approval remain authoritative.`,
    checks: ['Ground-truth action comparison', 'False-positive detection', 'Duplicate-candidate protection', 'Human approval preserved'],
  };
}
