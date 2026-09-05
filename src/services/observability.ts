import { BenchmarkMetrics, ExceptionCase, LangGraphTelemetry, PolicyGuardrails } from '../types/settlewise';

export interface PolicyRecommendation {
  summary: string;
  recommendedChanges: { field: string; value: string | number | boolean; reason: string }[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  reasoning: string;
}

export async function requestPolicyRecommendation(
  guardrails: PolicyGuardrails,
  metrics: BenchmarkMetrics | null
): Promise<PolicyRecommendation> {
  const response = await fetch('/api/ai-policy-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guardrails, metrics }),
  });
  const rawBody = await response.text();
  let payload: { error?: string; recommendation?: PolicyRecommendation } = {};
  if (rawBody.trim()) {
    try {
      payload = JSON.parse(rawBody) as typeof payload;
    } catch {
      throw new Error('AI service returned an invalid response. Check the Vercel API deployment.');
    }
  }
  if (!response.ok) throw new Error(payload.error || 'AI policy recommendation unavailable');
  if (!payload.recommendation) throw new Error('AI service returned no recommendation. Check the Groq configuration.');
  return payload.recommendation;
}

export async function traceInvestigation(
  caseItem: ExceptionCase,
  telemetry: LangGraphTelemetry
): Promise<void> {
  await fetch('/api/langfuse-trace', {
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
}
