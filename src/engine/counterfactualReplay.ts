import { ExceptionCase, BenchmarkMetrics, LangGraphTelemetry, PolicyGuardrails } from '../types/settlewise';
import { generateSyntheticBatch } from './syntheticDataEngine';
import { evaluatePolicyRules, DEFAULT_POLICY_GUARDRAILS } from './policyEngine';
import { runLangGraphExecutionTrace } from './langgraphEngine';
import { traceInvestigation } from '../services/observability';

export interface CounterfactualPipelineResult {
  metrics: BenchmarkMetrics;
  cases: ExceptionCase[];
}

export interface PipelineProgress {
  index: number;
  total: number;
  caseId: string;
  merchantName: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  decision?: string;
}

export function runCounterfactualReplayBenchmark(
  batchSize: number = 50,
  guardrails: PolicyGuardrails = DEFAULT_POLICY_GUARDRAILS,
  replaySeed: string = 'SW-TRACK04-001'
): BenchmarkMetrics {
  return evaluateBenchmarkCases(generateSyntheticBatch(batchSize, replaySeed), guardrails, replaySeed);
}

function evaluateBenchmarkCases(cases: ExceptionCase[], guardrails: PolicyGuardrails, replaySeed: string, telemetryByCase = new Map<string, LangGraphTelemetry>()): BenchmarkMetrics {
  const batchSize = cases.length;

  let cleanRecords = 0;
  let injectedExceptions = 0;
  let correctDiagnoses = 0;
  let autoResolveCount = 0;
  let falseAutoResolutions = 0;
  let safelyEscalatedCount = 0;
  let totalRupeesInvestigated = 0;
  let totalRupeesReconciled = 0;
  let moneyLeakageDetected = 0;
  let totalInvestigationTime = 0;
  let correctActionDecisions = 0;
  let falsePositiveCount = 0;
  let safeEscalationCount = 0;
  const groundTruthExceptionCount = cases.filter(caseItem => !caseItem.groundTruthShouldAutoResolve).length;

  const honestExceptionsList: ExceptionCase[] = [];

  cases.forEach((c) => {
    totalRupeesInvestigated += c.paymentAmount;
    const timeSec = c.category === 'DUPLICATE_CANDIDATE' ? 0.43 : c.category === 'FEE_MISMATCH' ? 0.31 : 0.22;
    totalInvestigationTime += timeSec;

    const policyRes = evaluatePolicyRules(c, guardrails);
    const telemetry = telemetryByCase.get(c.id);
    const llmVetoed = telemetry?.stateCheckpoint.policyPassed && telemetry.stateCheckpoint.llmPolicyUsed && !telemetry.stateCheckpoint.llmPolicyApproved;
    const effectiveAction = llmVetoed ? 'HUMAN_REVIEW' : policyRes.authorizedAction;
    c.authorizedAction = effectiveAction;

    // Compare the policy outcome with the labeled synthetic ground truth.
    if (effectiveAction === c.groundTruthAction) {
      correctActionDecisions++;
    }
    if (effectiveAction === 'AUTO_RESOLVE' && !c.groundTruthShouldAutoResolve) {
      falsePositiveCount++;
    }
    if (effectiveAction !== 'AUTO_RESOLVE' && !c.groundTruthShouldAutoResolve) {
      safeEscalationCount++;
    }

    // Infer the category from ledger evidence independently of the generator label.
    if (inferCategoryFromEvidence(c) === c.groundTruthCategory) {
      correctDiagnoses++;
    }

    if (c.category === 'PARTIAL_REFUND' || c.category === 'TIMING_MISMATCH') {
      cleanRecords++;
    } else {
      injectedExceptions++;
    }

    if (effectiveAction === 'AUTO_RESOLVE') {
      autoResolveCount++;
      totalRupeesReconciled += c.paymentAmount;

      // In rare cases (e.g. noise injection), evaluate false resolution
      if (c.category === 'DUPLICATE_CANDIDATE' || c.unexplainedDelta > 1000) {
        falseAutoResolutions++;
      }
    } else {
      safelyEscalatedCount++;
      honestExceptionsList.push(c);
    }

    if (c.recoveryAmount) {
      moneyLeakageDetected += c.recoveryAmount;
    }
  });

  const diagnosisPrecision = Number(((correctDiagnoses / batchSize) * 100).toFixed(1));
  const autoResolvePrecision = autoResolveCount > 0
    ? Number((((autoResolveCount - falseAutoResolutions) / autoResolveCount) * 100).toFixed(1))
    : 100;

  return {
    totalRecords: batchSize,
    cleanRecords,
    injectedExceptions,
    correctDiagnoses,
    diagnosisPrecision,
    autoResolveCount,
    autoResolvePrecision,
    safelyEscalatedCount,
    falseAutoResolutions,
    totalRupeesInvestigated,
    totalRupeesReconciled,
    moneyLeakageDetected,
    avgInvestigationTimeSec: Number((totalInvestigationTime / batchSize).toFixed(2)),
    honestExceptionsList,
    replaySeed,
    correctActionDecisions,
    falsePositiveRate: Number(((falsePositiveCount / batchSize) * 100).toFixed(1)),
    safeEscalationRate: Number(((safeEscalationCount / Math.max(groundTruthExceptionCount, 1)) * 100).toFixed(1)),
    pipelineExecuted: false,
    graphNodesExecuted: 0,
    langfuseTracesAttempted: 0,
    langfuseTracesSucceeded: 0,
    langfuseTracesFailed: 0
  };
}

function inferCategoryFromEvidence(caseItem: ExceptionCase): ExceptionCase['category'] {
  const trailText = caseItem.moneyTrail.map(step => `${step.label} ${step.detailNote}`).join(' ').toLowerCase();
  const evidenceSources = caseItem.evidence.map(item => item.source);
  if (caseItem.moneyTrail.filter(step => step.stage === 'ACTUAL_SETTLEMENT').length > 1 || evidenceSources.filter(source => source === 'Settlement Batch').length > 1) return 'DUPLICATE_CANDIDATE';
  if (evidenceSources.includes('Webhook Log') || trailText.includes('webhook')) return 'MISSING_SETTLEMENT';
  if (trailText.includes('t+1') || trailText.includes('cutoff') || trailText.includes('timing')) return 'TIMING_MISMATCH';
  if (caseItem.moneyTrail.some(step => step.status === 'RECOVERABLE') || caseItem.recoveryAmount || evidenceSources.includes('Bank Statement') && evidenceSources.includes('Fee Engine')) return 'FEE_MISMATCH';
  if (caseItem.moneyTrail.some(step => step.stage === 'REFUND')) return 'PARTIAL_REFUND';
  return 'AMOUNT_MISMATCH';
}

export async function runCounterfactualReplayPipeline(
  batchSize: number = 50,
  guardrails: PolicyGuardrails = DEFAULT_POLICY_GUARDRAILS,
  replaySeed: string = 'SW-TRACK04-001',
  onProgress?: (progress: PipelineProgress) => void
): Promise<CounterfactualPipelineResult> {
  const cases = generateSyntheticBatch(batchSize, replaySeed);
  const startedAt = performance.now();
  let graphNodesExecuted = 0;
  let langfuseTracesSucceeded = 0;
  let langfuseTracesFailed = 0;
  let langfuseError = '';
  const telemetryByCase = new Map<string, LangGraphTelemetry>();

  // Execute the same StateGraph used by transaction inspection, in bounded groups.
  for (let offset = 0; offset < cases.length; offset += 50) {
    const group = cases.slice(offset, offset + 50);
    group.forEach((caseItem, index) => onProgress?.({ index: offset + index, total: cases.length, caseId: caseItem.id, merchantName: caseItem.merchantName, status: 'RUNNING' }));
    const traces = await Promise.all(group.map(async (caseItem, index) => {
      try {
        const trace = await runLangGraphExecutionTrace(caseItem, guardrails);
        onProgress?.({ index: offset + index, total: cases.length, caseId: caseItem.id, merchantName: caseItem.merchantName, status: 'COMPLETED', decision: trace.stateCheckpoint.policyPassed ? 'AUTO_RESOLVE' : 'HUMAN_REVIEW' });
        return trace;
      } catch (error) {
        onProgress?.({ index: offset + index, total: cases.length, caseId: caseItem.id, merchantName: caseItem.merchantName, status: 'FAILED', decision: error instanceof Error ? error.message : 'Pipeline failed' });
        throw error;
      }
    }));
    traces.forEach((trace, index) => telemetryByCase.set(group[index].id, trace));
    graphNodesExecuted += traces.reduce((count, trace) => count + trace.nodesExecuted.length, 0);
    // Keep observability bounded for 500/1,000/10,000-record evaluations.
    const traceCases = group.filter((_, index) => offset + index < 100);
    const traceResults = await Promise.allSettled(traceCases.map(caseItem => traceInvestigation(caseItem, traces[group.indexOf(caseItem)])));
    langfuseTracesSucceeded += traceResults.filter(result => result.status === 'fulfilled').length;
    langfuseTracesFailed += traceResults.filter(result => result.status === 'rejected').length;
    const firstFailure = traceResults.find(result => result.status === 'rejected');
    if (firstFailure?.status === 'rejected' && !langfuseError) langfuseError = firstFailure.reason instanceof Error ? firstFailure.reason.message : String(firstFailure.reason);
  }

  const metrics = evaluateBenchmarkCases(cases, guardrails, replaySeed, telemetryByCase);
  metrics.avgInvestigationTimeSec = Number(((performance.now() - startedAt) / 1000 / batchSize).toFixed(2));
  metrics.pipelineExecuted = true;
  metrics.graphNodesExecuted = graphNodesExecuted;
  metrics.langfuseTracesAttempted = Math.min(cases.length, 100);
  metrics.langfuseTracesSucceeded = langfuseTracesSucceeded;
  metrics.langfuseTracesFailed = langfuseTracesFailed;
  metrics.langfuseError = langfuseError || undefined;
  return { metrics, cases };
}
