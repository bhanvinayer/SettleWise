import { ExceptionCase, PolicyGuardrails } from '../types/settlewise';
import { PolicyEvaluationResult } from '../engine/policyEngine';

export interface LlmPolicyReview {
  available: boolean;
  approved: boolean;
  decision: string;
  risk: string;
  reason: string;
  checks: string[];
  provider: string;
}

export async function reviewPolicyWithGroq(
  exceptionCase: ExceptionCase,
  guardrails: PolicyGuardrails,
  deterministicPolicy: PolicyEvaluationResult
): Promise<LlmPolicyReview> {
  const response = await fetch('/api/langgraph-policy-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exceptionCase, guardrails, deterministicPolicy }),
  });
  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return { available: false, approved: false, decision: 'HUMAN_REVIEW', risk: 'HIGH', reason: 'LLM returned no policy review.', checks: [], provider: 'deterministic-only' };
  }
  const payload = JSON.parse(rawBody) as { available?: boolean; provider?: string; review?: Partial<LlmPolicyReview> };
  if (!payload.available || !payload.review) {
    return { available: false, approved: false, decision: 'HUMAN_REVIEW', risk: 'HIGH', reason: 'Groq unavailable; deterministic policy remains authoritative.', checks: [], provider: payload.provider || 'deterministic-only' };
  }
  return {
    available: true,
    approved: payload.review.approved === true,
    decision: payload.review.decision || 'HUMAN_REVIEW',
    risk: payload.review.risk || 'HIGH',
    reason: payload.review.reason || 'LLM provided no explanation.',
    checks: payload.review.checks || [],
    provider: payload.provider || 'groq',
  };
}
