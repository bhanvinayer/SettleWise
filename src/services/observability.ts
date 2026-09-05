import { BenchmarkMetrics, ExceptionCase, LangGraphTelemetry, PolicyGuardrails } from '../types/settlewise';
import { createSettleWiseAgentRecommendation } from '../engine/settleWiseAgent';

export interface PolicyRecommendation {
  summary: string;
  recommendedChanges: { field: string; value: string | number | boolean; reason: string }[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  reasoning: string;
  source?: 'groq' | 'deterministic-fallback';
}

export async function requestPolicyRecommendation(
  guardrails: PolicyGuardrails,
  metrics: BenchmarkMetrics | null
): Promise<PolicyRecommendation> {
  try {
    const response = await fetch('/api/ai-policy-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guardrails, metrics }),
    });
    const rawBody = await response.text();
    let payload: { error?: string; recommendation?: PolicyRecommendation; aiProvider?: string } = {};
    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody) as typeof payload;
      } catch {
        throw new Error('AI service returned an invalid response');
      }
    }
    if (!response.ok) throw new Error(payload.error || 'AI policy recommendation unavailable');
    if (!payload.recommendation) throw new Error('SettleWise Agent returned no recommendation');
    return { ...payload.recommendation, source: payload.aiProvider === 'groq' ? 'groq' : 'deterministic-fallback' };
  } catch {
    return {
      ...createSettleWiseAgentRecommendation(guardrails, metrics),
      source: 'deterministic-fallback',
    };
  }
}

export async function traceInvestigation(
  caseItem: ExceptionCase,
  telemetry: LangGraphTelemetry
): Promise<void> {
  const response = await fetch('/api/langfuse-trace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      traceId: `settlewise-${caseItem.id.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
      name: 'settlewise-finance-investigation',
      input: { caseId: caseItem.id, category: caseItem.category, paymentAmount: caseItem.paymentAmount },
      output: { executionStatus: telemetry.executionStatus, policyPassed: telemetry.stateCheckpoint.policyPassed },
      metadata: { graphId: telemetry.graphId, totalLatencyMs: telemetry.totalLatencyMs, nodes: telemetry.nodesExecuted.length },
    }),
  });
  const rawBody = await response.text();
  let payload: { error?: string; traced?: boolean } = {};
  if (rawBody.trim()) {
    try {
      payload = JSON.parse(rawBody) as typeof payload;
    } catch {
      throw new Error('Langfuse endpoint returned an invalid response');
    }
  }
  if (!response.ok || payload.traced === false) {
    throw new Error(payload.error || 'Langfuse trace was not accepted');
  }
}
