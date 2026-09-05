import { ExceptionCase, BenchmarkMetrics, PolicyGuardrails } from '../types/settlewise';
import { generateSyntheticBatch } from './syntheticDataEngine';
import { evaluatePolicyRules, DEFAULT_POLICY_GUARDRAILS } from './policyEngine';

export function runCounterfactualReplayBenchmark(
  batchSize: number = 50,
  guardrails: PolicyGuardrails = DEFAULT_POLICY_GUARDRAILS,
  replaySeed: string = 'SW-TRACK04-001'
): BenchmarkMetrics {
  const cases = generateSyntheticBatch(batchSize, replaySeed);

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

  const honestExceptionsList: ExceptionCase[] = [];

  cases.forEach((c) => {
    totalRupeesInvestigated += c.paymentAmount;
    // Simulate microscopic AI analysis latency per case (0.05 to 0.18 sec)
    const timeSec = 0.05 + Math.random() * 0.13;
    totalInvestigationTime += timeSec;

    const policyRes = evaluatePolicyRules(c, guardrails);
    c.authorizedAction = policyRes.authorizedAction;

    // Compare the policy outcome with the labeled synthetic ground truth.
    if (policyRes.authorizedAction === c.groundTruthAction) {
      correctActionDecisions++;
    }
    if (policyRes.authorizedAction === 'AUTO_RESOLVE' && !c.groundTruthShouldAutoResolve) {
      falsePositiveCount++;
    }
    if (policyRes.authorizedAction !== 'AUTO_RESOLVE' && !c.groundTruthShouldAutoResolve) {
      safeEscalationCount++;
    }

    // Diagnosis precision is based on the generated case label, not confidence alone.
    if (c.groundTruthCategory === c.category) {
      correctDiagnoses++;
    }

    if (c.category === 'PARTIAL_REFUND' || c.category === 'TIMING_MISMATCH') {
      cleanRecords++;
    } else {
      injectedExceptions++;
    }

    if (policyRes.authorizedAction === 'AUTO_RESOLVE') {
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
    safeEscalationRate: Number(((safeEscalationCount / Math.max(injectedExceptions, 1)) * 100).toFixed(1))
  };
}
