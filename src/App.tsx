import { useState, useEffect } from 'react';
import { ExceptionCase, BenchmarkMetrics, PolicyGuardrails, DecisionAction } from './types/settlewise';
import { generateSyntheticBatch } from './engine/syntheticDataEngine';
import { runCounterfactualReplayBenchmark } from './engine/counterfactualReplay';
import { DEFAULT_POLICY_GUARDRAILS } from './engine/policyEngine';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CommandCenter } from './components/CommandCenter';
import { InvestigationDrawer } from './components/InvestigationDrawer';
import { HonestExceptionsView } from './components/HonestExceptionsView';
import { MoneyRecoveryManager } from './components/MoneyRecoveryManager';
import { CounterfactualReplayModal } from './components/CounterfactualReplayModal';
import { PolicyGuardrailsConfigurator } from './components/PolicyGuardrailsConfigurator';
import { LandingPage } from './components/LandingPage';

export type ActiveView = 'command-center' | 'exceptions' | 'recoveries' | 'policy' | 'batch-runs';

export function App() {
  const [viewMode, setViewMode] = useState<'LANDING' | 'DASHBOARD'>('LANDING');
  const [activeView, setActiveView] = useState<ActiveView>('command-center');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [cases, setCases] = useState<ExceptionCase[]>([]);
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [guardrails, setGuardrails] = useState<PolicyGuardrails>(DEFAULT_POLICY_GUARDRAILS);

  const [selectedCase, setSelectedCase] = useState<ExceptionCase | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const [showReplayModal, setShowReplayModal] = useState(false);
  const [showHonestModal, setShowHonestModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    const batch = generateSyntheticBatch(50);
    setCases(batch);
    const m = runCounterfactualReplayBenchmark(50, guardrails);
    setMetrics(m);
  }, []);

  // Apply theme to root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleUpdateCaseAction = (caseId: string, newAction: DecisionAction, note: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const status =
          newAction === 'AUTO_RESOLVE' ? 'RESOLVED' :
          newAction === 'RECOVERY_CASE' ? 'RECOVERING' :
          newAction === 'BLOCK' ? 'BLOCKED' : 'ESCALATED';
        return { ...c, authorizedAction: newAction, status, ruleValidationNotes: [...c.ruleValidationNotes, `[Operator]: ${note}`] };
      })
    );
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, authorizedAction: newAction } : null);
    }
  };

  const handleLaunch = (action?: 'DASHBOARD' | 'REPLAY' | 'HONEST') => {
    setViewMode('DASHBOARD');
    if (action === 'REPLAY') setShowReplayModal(true);
    if (action === 'HONEST') setShowHonestModal(true);
  };

  const honestCount = cases.filter(c => c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED' || c.honestExceptionReason).length;

  if (viewMode === 'LANDING') {
    return <LandingPage onLaunchApp={handleLaunch} />;
  }

  return (
    <div className="app-shell" data-theme={theme}>
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        honestCount={honestCount}
        onOpenLanding={() => setViewMode('LANDING')}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      {/* Main content */}
      <div className="main-area">
        <Topbar
          metrics={metrics}
          onRunBatch={() => setShowReplayModal(true)}
          onOpenPolicy={() => setShowPolicyModal(true)}
          activeView={activeView}
        />

        <div className="content-area">
          {activeView === 'command-center' && metrics && (
            <CommandCenter
              cases={cases}
              metrics={metrics}
              activeCategoryFilter={activeCategoryFilter}
              onSelectCase={setSelectedCase}
              onSelectFilter={setActiveCategoryFilter}
              onOpenRecovery={() => setShowRecoveryModal(true)}
              onOpenExceptions={() => setShowHonestModal(true)}
            />
          )}

          {activeView === 'exceptions' && (
            <HonestExceptionsView
              cases={cases}
              onClose={() => setActiveView('command-center')}
              onSelectCase={setSelectedCase}
            />
          )}

          {activeView === 'recoveries' && (
            <MoneyRecoveryManager
              cases={cases}
              onClose={() => setActiveView('command-center')}
            />
          )}

          {activeView === 'policy' && (
            <PolicyGuardrailsConfigurator
              guardrails={guardrails}
              onClose={() => setActiveView('command-center')}
              onSave={updated => {
                setGuardrails(updated);
                if (metrics) setMetrics(runCounterfactualReplayBenchmark(metrics.totalRecords, updated));
              }}
            />
          )}

          {activeView === 'batch-runs' && (
            <CounterfactualReplayModal
              guardrails={guardrails}
              onClose={() => setActiveView('command-center')}
              onApplyBatchResults={newMetrics => {
                setMetrics(newMetrics);
                setCases(generateSyntheticBatch(newMetrics.totalRecords));
                setActiveView('command-center');
              }}
            />
          )}
        </div>
      </div>

      {/* Investigation Drawer */}
      {selectedCase && (
        <InvestigationDrawer
          exceptionCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdateAction={handleUpdateCaseAction}
        />
      )}

      {/* Modals */}
      {showHonestModal && (
        <div className="drawer-overlay" onClick={() => setShowHonestModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', width: 700, maxWidth: '95vw', height: '100%', overflow: 'auto', borderLeft: '1px solid var(--border)' }}>
            <HonestExceptionsView cases={cases} onClose={() => setShowHonestModal(false)} onSelectCase={c => { setSelectedCase(c); setShowHonestModal(false); }} />
          </div>
        </div>
      )}
      {showRecoveryModal && (
        <div className="drawer-overlay" onClick={() => setShowRecoveryModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', width: 700, maxWidth: '95vw', height: '100%', overflow: 'auto', borderLeft: '1px solid var(--border)' }}>
            <MoneyRecoveryManager cases={cases} onClose={() => setShowRecoveryModal(false)} />
          </div>
        </div>
      )}
      {showReplayModal && (
        <CounterfactualReplayModal
          guardrails={guardrails}
          onClose={() => setShowReplayModal(false)}
          onApplyBatchResults={newMetrics => {
            setMetrics(newMetrics);
            setCases(generateSyntheticBatch(newMetrics.totalRecords));
          }}
        />
      )}
      {showPolicyModal && (
        <PolicyGuardrailsConfigurator
          guardrails={guardrails}
          onClose={() => setShowPolicyModal(false)}
          onSave={updated => {
            setGuardrails(updated);
            if (metrics) setMetrics(runCounterfactualReplayBenchmark(metrics.totalRecords, updated));
          }}
        />
      )}
    </div>
  );
}

export default App;
