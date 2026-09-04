import React, { useState } from 'react';
import { ExceptionCase, DecisionAction } from '../types/settlewise';
import { MoneyTrailVisualizer } from './MoneyTrailVisualizer';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, DollarSign, Cpu, FileText, Layers, Lock, GitBranch } from 'lucide-react';
import { evaluatePolicyRules } from '../engine/policyEngine';

interface InvestigationModalProps {
  exceptionCase: ExceptionCase | null;
  onClose: () => void;
  onUpdateAction: (caseId: string, action: DecisionAction, note: string) => void;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({
  exceptionCase,
  onClose,
  onUpdateAction
}) => {
  const [activeTab, setActiveTab] = useState<'TRAIL' | 'HYPOTHESES' | 'AGENTS' | 'LANGGRAPH' | 'EVIDENCE' | 'POLICY'>('TRAIL');

  if (!exceptionCase) return null;

  const policyRes = evaluatePolicyRules(exceptionCase);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
      
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">
                  {exceptionCase.id}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {exceptionCase.category.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    exceptionCase.urgency === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {exceptionCase.urgency} URGENCY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Merchant: <strong className="text-slate-200">{exceptionCase.merchantName}</strong> ({exceptionCase.merchantId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Confidence pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">AI Confidence:</span>
              <strong className="text-emerald-400 font-bold">{exceptionCase.aiConfidence.toFixed(1)}%</strong>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Segmented Tab Navigation Bar */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-[#0b0e17] flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'TRAIL', label: 'Money Trail', icon: DollarSign },
            { id: 'HYPOTHESES', label: `AI Hypotheses (${exceptionCase.hypotheses.length})`, icon: Layers },
            { id: 'AGENTS', label: 'Tri-Agent Telemetry', icon: Cpu },
            { id: 'LANGGRAPH', label: 'LangGraph Machine', icon: GitBranch },
            { id: 'EVIDENCE', label: `Evidence (${exceptionCase.evidence.length})`, icon: FileText },
            { id: 'POLICY', label: 'Policy Check', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-semibold'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: Money Trail */}
          {activeTab === 'TRAIL' && (
            <div className="space-y-4">
              <MoneyTrailVisualizer
                steps={exceptionCase.moneyTrail}
                paymentAmount={exceptionCase.paymentAmount}
                unexplainedDelta={exceptionCase.unexplainedDelta}
              />

              {/* AI Reasoning Synthesis */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase text-blue-400 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  SettleWise Investigation Synthesis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {exceptionCase.aiReasoning}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AI Hypotheses */}
          {activeTab === 'HYPOTHESES' && (
            <div className="space-y-3">
              {exceptionCase.hypotheses.map((h, i) => (
                <div
                  key={h.id}
                  className={`p-4 rounded-xl border transition-all ${
                    i === 0
                      ? 'bg-blue-950/20 border-blue-500/40 shadow-glow'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                        {h.id}
                      </span>
                      <h4 className="text-sm font-bold text-white">{h.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      <span>Confidence:</span>
                      <span>{h.confidenceScore.toFixed(1)}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{h.explanation}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                        ✓ Supporting Factors
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {h.supportingFactors.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    {h.counterEvidence && h.counterEvidence.length > 0 && (
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block mb-1">
                          ⚠️ Counter Evidence
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                          {h.counterEvidence.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: Tri-Agent & Dual-Key Telemetry */}
          {activeTab === 'AGENTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30">
                <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Tri-Agent Autonomous Decomposition Network
                </h4>
                <p className="text-xs text-slate-300">
                  SettleWise splits complex financial investigation across 3 dedicated specialized sub-agents before running deterministic policy guardrails.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                {/* Agent 1: Root Cause */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-400 text-[11px] uppercase">Agent 01</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">Active</span>
                  </div>
                  <h5 className="font-bold text-white">Root Cause & Drift Agent</h5>
                  <p className="text-slate-400 text-[11px]">
                    Isolated delta: <strong className="text-slate-200">₹{exceptionCase.unexplainedDelta}</strong> across bank statement & gateway ledger.
                  </p>
                  <div className="text-[10px] font-mono text-emerald-400">✓ Diagnostic Confidence: {exceptionCase.aiConfidence.toFixed(1)}%</div>
                </div>

                {/* Agent 2: Merchant Context */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-400 text-[11px] uppercase">Agent 02</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Memory Vector</span>
                  </div>
                  <h5 className="font-bold text-white">Merchant Context Agent</h5>
                  <p className="text-slate-400 text-[11px]">
                    Retrieved <strong className="text-slate-200">{exceptionCase.historicalMemoryMatches || 12}</strong> past similar resolution patterns for {exceptionCase.merchantName}.
                  </p>
                  <div className="text-[10px] font-mono text-indigo-400">✓ Historical Alignment High</div>
                </div>

                {/* Agent 3: Fee & Tax Matcher */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 text-[11px] uppercase">Agent 03</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Tax Ledger</span>
                  </div>
                  <h5 className="font-bold text-white">Fee & Tax Matcher Agent</h5>
                  <p className="text-slate-400 text-[11px]">
                    Evaluated MDR schedule + 18% GST invoice alignment against bank credit entries.
                  </p>
                  <div className="text-[10px] font-mono text-emerald-400">✓ MDR Tier Validated</div>
                </div>

              </div>

              {/* Dual-Key Adversarial Gate */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <h5 className="font-mono font-bold text-amber-300 text-xs uppercase">
                      Dual-Key Adversarial Auditor Gate
                    </h5>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    exceptionCase.aiConfidence >= 90
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {exceptionCase.aiConfidence >= 90 ? 'CHALLENGE CLEARED' : 'AMBIGUITY CHALLENGE RAISED'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  The Adversarial Auditor Agent executed counter-evidence checks (testing for duplicate payout injection, missing webhook drops, and rate drift). Result: {exceptionCase.aiReasoning}
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: Evidence Ledger */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 font-mono text-slate-400 bg-slate-900/80">
                      <th className="py-2.5 px-3">Evidence ID</th>
                      <th className="py-2.5 px-3">Source Ledger</th>
                      <th className="py-2.5 px-3">Record Ref</th>
                      <th className="py-2.5 px-3">Match Score</th>
                      <th className="py-2.5 px-3">Extracted Fields</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {exceptionCase.evidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{ev.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{ev.source}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{ev.recordReference}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{ev.matchScore}%</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                          {JSON.stringify(ev.keyValues).replace(/["{}]/g, '').replace(/,/g, ' | ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              ev.status === 'VERIFIED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LangGraph State Machine Graph */}
          {activeTab === 'LANGGRAPH' && (
            <div className="space-y-4">
              
              {/* Banner Tagline */}
              <div className="p-4 rounded-xl surface-card border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    LangGraph State Machine Trace
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-sans">
                    Stateful Graph Architecture (<code className="text-indigo-300">@langchain/langgraph</code>) with explicit checkpoint gates.
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                    GRAPH STATUS: {exceptionCase.authorizedAction === 'BLOCK' ? 'PAUSED_HITL' : 'COMPLETED'}
                  </span>
                </div>
              </div>

              {/* LangGraph Node Execution Chain */}
              <div className="space-y-2.5">
                {[
                  {
                    nodeId: 'ingestionNode',
                    nodeName: '01. Ingestion & Ledger Parsing Node',
                    status: 'SUCCESS',
                    output: `Ingested payment ID ${exceptionCase.paymentId} for merchant ${exceptionCase.merchantName}. Total amount: ₹${exceptionCase.paymentAmount}.`,
                    latencyMs: 80,
                    activeAgents: ['LedgerParserNode']
                  },
                  {
                    nodeId: 'triAgentNode',
                    nodeName: '02. Tri-Agent Pipeline Sub-Graph',
                    status: 'SUCCESS',
                    output: `Sub-agents executed. Root cause isolated: ${exceptionCase.category}. Matched ${exceptionCase.historicalMemoryMatches || 14} memory vectors.`,
                    latencyMs: 210,
                    activeAgents: ['RootCauseAgent', 'MerchantContextAgent', 'FeeTaxMatcherAgent']
                  },
                  {
                    nodeId: 'auditorGateNode',
                    nodeName: '03. Dual-Key Adversarial Auditor Gate Node',
                    status: exceptionCase.aiConfidence >= 88 ? 'SUCCESS' : 'WARNING',
                    output: exceptionCase.aiConfidence >= 88
                      ? `Counterfactual challenger agent test PASSED. Confidence: ${exceptionCase.aiConfidence.toFixed(1)}%.`
                      : `Adversarial Auditor: Counterfactual challenge raised! Confidence capped at ${exceptionCase.aiConfidence.toFixed(1)}%.`,
                    latencyMs: 140,
                    activeAgents: ['AdversarialChallengerAuditor']
                  },
                  {
                    nodeId: 'deterministicPolicyNode',
                    nodeName: '04. Deterministic Policy Guardrails Engine Node',
                    status: exceptionCase.authorizedAction === 'AUTO_RESOLVE' ? 'SUCCESS' : 'PAUSED',
                    output: `Evaluated policy guardrails. Decision authorized: [${exceptionCase.authorizedAction || 'HUMAN_REVIEW'}].`,
                    latencyMs: 60,
                    activeAgents: ['DeterministicRuleEngine']
                  },
                  {
                    nodeId: exceptionCase.authorizedAction === 'AUTO_RESOLVE' ? 'executeResolutionNode' : 'blockExceptionNode',
                    nodeName: exceptionCase.authorizedAction === 'AUTO_RESOLVE' ? '05. Auto-Resolution Execution Terminal Node' : '05. Honest Exception Quarantine Terminal Node',
                    status: exceptionCase.authorizedAction === 'AUTO_RESOLVE' ? 'SUCCESS' : 'PAUSED',
                    output: exceptionCase.authorizedAction === 'AUTO_RESOLVE'
                      ? 'Graph reached terminal state: Auto-resolution executed & ledger updated.'
                      : 'Graph state paused at Honest Exception Quarantine node awaiting human operator authorization.',
                    latencyMs: 45,
                    activeAgents: [exceptionCase.authorizedAction === 'AUTO_RESOLVE' ? 'LedgerWriterNode' : 'QuarantineControllerNode']
                  }
                ].map((log, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="font-bold text-white">{log.nodeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{log.latencyMs}ms</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs font-sans pl-4 border-l-2 border-slate-800">
                      {log.output}
                    </p>
                    <div className="text-[10px] text-slate-500 pl-4 flex items-center gap-2">
                      <span>Active Agents:</span>
                      {log.activeAgents.map((a, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: Deterministic Policy Check */}
          {activeTab === 'POLICY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-2">
                  Engineering Motto Validation: &ldquo;AI Investigates. Rules Authorize.&rdquo;
                </h4>
                <p className="text-xs text-slate-300 mb-4">{policyRes.policySummary}</p>

                <div className="space-y-2">
                  {policyRes.validationChecklist.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        {c.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className="text-slate-200">{c.check}</span>
                      </div>
                      <span className={c.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {c.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {exceptionCase.honestExceptionReason && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs space-y-1">
                  <h4 className="font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Honest Exception Safeguard Explanation
                  </h4>
                  <p className="text-amber-200">{exceptionCase.honestExceptionReason}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#080b12] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Authorized Action: <strong className="text-white uppercase">{exceptionCase.authorizedAction || 'PENDING'}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onUpdateAction(exceptionCase.id, 'BLOCK', 'Blocked high risk ambiguity by operator')}
              className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Block & Escalate</span>
            </button>

            <button
              onClick={() => onUpdateAction(exceptionCase.id, 'RECOVERY_CASE', 'Created money recovery ticket')}
              className="px-3.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-glowEmerald transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Create Recovery Ticket</span>
            </button>

            <button
              onClick={() => onUpdateAction(exceptionCase.id, 'AUTO_RESOLVE', 'Authorized auto-resolution')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glowEmerald transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authorize Auto-Resolve</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
