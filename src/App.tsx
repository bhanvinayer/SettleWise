import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ExceptionQueue } from './components/ExceptionQueue';
import { InvestigationModal } from './components/InvestigationModal';
import { HonestExceptionsView } from './components/HonestExceptionsView';
import { MoneyRecoveryManager } from './components/MoneyRecoveryManager';
import { CounterfactualReplayModal } from './components/CounterfactualReplayModal';
import { PolicyGuardrailsConfigurator } from './components/PolicyGuardrailsConfigurator';

import { ExceptionCase, BenchmarkMetrics, PolicyGuardrails, DecisionAction } from './types/settlewise';
import { generateSyntheticBatch } from './engine/syntheticDataEngine';
import { runCounterfactualReplayBenchmark } from './engine/counterfactualReplay';
import { DEFAULT_POLICY_GUARDRAILS } from './engine/policyEngine';

export function App() {
  const [cases, setCases] = useState<ExceptionCase[]>([]);
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [guardrails, setGuardrails] = useState<PolicyGuardrails>(DEFAULT_POLICY_GUARDRAILS);
  
  const [selectedCase, setSelectedCase] = useState<ExceptionCase | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Modal Visibility States
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);
  const [showHonestExceptionsModal, setShowHonestExceptionsModal] = useState<boolean>(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);

  // Initialize initial batch on load
  useEffect(() => {
    const initialBatch = generateSyntheticBatch(50);
    setCases(initialBatch);

    const initialMetrics = runCounterfactualReplayBenchmark(50, guardrails);
    setMetrics(initialMetrics);
  }, []);

  const handleUpdateCaseAction = (caseId: string, newAction: DecisionAction, note: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedStatus =
            newAction === 'AUTO_RESOLVE'
              ? 'RESOLVED'
              : newAction === 'RECOVERY_CASE'
              ? 'RECOVERING'
              : newAction === 'BLOCK'
              ? 'BLOCKED'
              : 'ESCALATED';

          return {
            ...c,
            authorizedAction: newAction,
            status: updatedStatus,
            ruleValidationNotes: [...c.ruleValidationNotes, `[Operator Override]: ${note}`]
          };
        }
        return c;
      })
    );

    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase((prev) =>
        prev
          ? {
              ...prev,
              authorizedAction: newAction,
              status:
                newAction === 'AUTO_RESOLVE'
                  ? 'RESOLVED'
                  : newAction === 'RECOVERY_CASE'
                  ? 'RECOVERING'
                  : newAction === 'BLOCK'
                  ? 'BLOCKED'
                  : 'ESCALATED'
            }
          : null
      );
    }
  };

  const honestExceptionsCount = cases.filter(
    (c) => c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED' || c.honestExceptionReason
  ).length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* Brand Header */}
      <Header
        onRunReplay={() => setShowReplayModal(true)}
        onOpenPolicy={() => setShowPolicyModal(true)}
        onOpenRecovery={() => setShowRecoveryModal(true)}
        onOpenHonestExceptions={() => setShowHonestExceptionsModal(true)}
        honestExceptionsCount={honestExceptionsCount}
      />

      {/* Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Executive Metrics Overview */}
        {metrics && (
          <ExecutiveDashboard
            metrics={metrics}
            onSelectCategoryFilter={(cat) => setActiveCategoryFilter(cat)}
            activeFilter={activeCategoryFilter}
          />
        )}

        {/* Exception Queue */}
        <ExceptionQueue
          cases={cases}
          onSelectCase={(c) => setSelectedCase(c)}
          selectedCategoryFilter={activeCategoryFilter}
          onClearFilter={() => setActiveCategoryFilter(null)}
        />

      </main>

      {/* Modals Suite */}
      {selectedCase && (
        <InvestigationModal
          exceptionCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdateAction={handleUpdateCaseAction}
        />
      )}

      {showHonestExceptionsModal && (
        <HonestExceptionsView
          cases={cases}
          onClose={() => setShowHonestExceptionsModal(false)}
          onSelectCase={(c) => setSelectedCase(c)}
        />
      )}

      {showRecoveryModal && (
        <MoneyRecoveryManager
          cases={cases}
          onClose={() => setShowRecoveryModal(false)}
        />
      )}

      {showReplayModal && (
        <CounterfactualReplayModal
          guardrails={guardrails}
          onClose={() => setShowReplayModal(false)}
          onApplyBatchResults={(newMetrics) => {
            setMetrics(newMetrics);
            const freshBatch = generateSyntheticBatch(newMetrics.totalRecords);
            setCases(freshBatch);
          }}
        />
      )}

      {showPolicyModal && (
        <PolicyGuardrailsConfigurator
          guardrails={guardrails}
          onClose={() => setShowPolicyModal(false)}
          onSave={(updated) => {
            setGuardrails(updated);
            if (metrics) {
              const reEvaluated = runCounterfactualReplayBenchmark(metrics.totalRecords, updated);
              setMetrics(reEvaluated);
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080b12] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SettleWise — Razorpay AI Buildathon 2026 Submission | Track 04 — AI Finance Controller | Principle: AI Investigates. Rules Authorize.
      </footer>

    </div>
  );
}

export default App;
