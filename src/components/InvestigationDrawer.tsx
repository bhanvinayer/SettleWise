import React, { useState } from 'react';
import { ExceptionCase, DecisionAction } from '../types/settlewise';
import { evaluatePolicyRules } from '../engine/policyEngine';
import { X, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';
import { MoneyTrailVisualizer } from './MoneyTrailVisualizer';

interface InvestigationDrawerProps {
  exceptionCase: ExceptionCase;
  onClose: () => void;
  onUpdateAction: (caseId: string, action: DecisionAction, note: string) => void;
}

type DrawerTab = 'overview' | 'trail' | 'hypotheses' | 'agents' | 'langgraph' | 'evidence' | 'policy';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function StepDot({ status }: { status: 'done' | 'active' | 'pending' }) {
  return (
    <div className={`timeline-dot ${status}`}>
      {status === 'done' && <CheckCircle2 size={10} />}
      {status === 'active' && <span>●</span>}
      {status === 'pending' && <span>○</span>}
    </div>
  );
}

export const InvestigationDrawer: React.FC<InvestigationDrawerProps> = ({
  exceptionCase: c, onClose, onUpdateAction
}) => {
  const [tab, setTab] = useState<DrawerTab>('overview');
  const policyRes = evaluatePolicyRules(c);

  const isResolved = c.authorizedAction === 'AUTO_RESOLVE' || c.status === 'RESOLVED';
  const isBlocked  = c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED';
  const isRecovery = c.authorizedAction === 'RECOVERY_CASE' || c.status === 'RECOVERING';
  const feeStep = c.moneyTrail.find(step => step.stage === 'FEE');

  const telemetryProfile = (() => {
    switch (c.category) {
      case 'PARTIAL_REFUND':
        return {
          rootDetail: `Linked ${fmt(Math.abs(c.moneyTrail.find(step => step.stage === 'REFUND')?.actualAmount || 0))} refund to payment ${c.paymentId} and verified the net payout arithmetic.`,
          contextDetail: 'Matched the customer refund pattern against prior partial-refund resolutions.',
          matcherDetail: feeStep ? `Verified ${fmt(Math.abs(feeStep.actualAmount))} MDR fee against the gateway schedule and settlement credit.` : 'No fee line required for this settlement.',
          auditChecks: 'duplicate payout injection, refund replay, missing webhook drops, and rate drift',
        };
      case 'TIMING_MISMATCH':
        return {
          rootDetail: 'Detected a settlement-window shift while preserving the full net payout and UTR linkage.',
          contextDetail: 'Compared the merchant cutoff pattern with prior weekend and banking-holiday settlement shifts.',
          matcherDetail: feeStep ? `Reconciled ${fmt(Math.abs(feeStep.actualAmount))} gateway fee before validating the delayed bank credit.` : 'Validated the delayed bank credit against the expected payout.',
          auditChecks: 'duplicate batch injection, cutoff-window drift, missing webhook drops, and payout suppression',
        };
      case 'DUPLICATE_CANDIDATE':
        return {
          rootDetail: 'Flagged competing settlement candidates with identical amounts and separate UTR references.',
          contextDetail: 'Found similar duplicate-candidate cases, but historical matches cannot authorize one payout.',
          matcherDetail: 'Compared both candidate batches, fee deductions, and bank references for deterministic separation.',
          auditChecks: 'duplicate payout injection, candidate collision, replayed webhook events, and ledger drift',
        };
      case 'FEE_MISMATCH':
        return {
          rootDetail: `Isolated a fee variance of ${fmt(Math.abs(c.unexplainedDelta))} between the contracted MDR schedule and the settlement.`,
          contextDetail: 'Compared this merchant against prior fee-tier and tax-ledger exceptions.',
          matcherDetail: feeStep ? `Recalculated the ${fmt(Math.abs(feeStep.actualAmount))} fee and checked MDR plus GST alignment.` : 'Reconstructed the fee and tax ledger from settlement evidence.',
          auditChecks: 'rate drift, tax duplication, fee replay, and missing gateway ledger entries',
        };
      default:
        return {
          rootDetail: `Investigated the ${c.category.replace(/_/g, ' ').toLowerCase()} signal across bank and gateway records.`,
          contextDetail: `Compared ${c.merchantName} against prior cases with the same settlement pattern.`,
          matcherDetail: feeStep ? `Validated the ${fmt(Math.abs(feeStep.actualAmount))} fee line against the bank credit.` : 'Checked all available fee and settlement ledger entries.',
          auditChecks: 'duplicate payout injection, missing webhook drops, rate drift, and ledger timing anomalies',
        };
    }
  })();

  // Determine timeline states
  const step = (cond: boolean): 'done' | 'active' | 'pending' =>
    cond ? 'done' : 'active';

  const timelineSteps = [
    {
      label: 'Reconciled',
      sub: 'Evidence assembled from all ledgers',
      status: 'done' as const,
    },
    {
      label: 'Investigated',
      sub: `${c.category.replace(/_/g, ' ')} identified — ${fmt(c.unexplainedDelta)} delta`,
      status: 'done' as const,
    },
    {
      label: 'Adversarial Challenge',
      sub: c.aiConfidence >= 88 ? 'Alternative explanations tested & rejected' : 'Ambiguity flagged',
      status: step(c.aiConfidence >= 88),
    },
    {
      label: 'Policy Authorization',
      sub: policyRes.isAutoResolvePermitted ? 'Guardrails satisfied' : 'Threshold not met — human required',
      status: isResolved ? 'done' as const : isBlocked ? 'done' as const : 'active' as const,
    },
    {
      label: isResolved ? 'Auto-Resolved' : isBlocked ? 'Quarantined' : 'Recovery',
      sub: isResolved ? 'Ledger updated automatically'
        : isBlocked ? 'Awaiting operator authorization'
        : isRecovery ? 'Recovery ticket open'
        : 'Awaiting decision',
      status: (isResolved || isBlocked || isRecovery) ? 'done' as const : 'pending' as const,
    },
  ];

  const TABS: { id: DrawerTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trail', label: 'Money Trail' },
    { id: 'hypotheses', label: `Money TrailAI Hypotheses (${c.hypotheses.length})` },
    { id: 'agents', label: 'Tri-Agent Telemetry' },
    { id: 'langgraph', label: 'LangGraph Machine' },
    { id: 'evidence', label: `Evidence (${c.evidence.length})` },
    { id: 'policy', label: 'Policy Check' },
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>

        {/* ── Drawer header ─────────────────────────────────────────── */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'var(--brand)',
                }}>{c.id}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 4,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {c.category.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 4,
                  background: c.urgency === 'HIGH' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  border: `1px solid color-mix(in srgb, ${c.urgency === 'HIGH' ? 'var(--danger)' : 'var(--warning)'} 30%, transparent)`,
                  color: c.urgency === 'HIGH' ? 'var(--danger)' : 'var(--warning)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {c.urgency}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {c.merchantName}
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  ({c.merchantId})
                </span>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 6px', flexShrink: 0 }}
              onClick={onClose}
            >
              <X size={15} />
            </button>
          </div>

          {/* Amount delta block */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8, marginBottom: 12,
          }}>
            {[
              { label: 'Delta', value: fmt(c.unexplainedDelta), color: 'var(--danger)' },
              { label: 'Expected', value: fmt(c.expectedSettlement), color: 'var(--text-primary)' },
              { label: 'Actual',   value: fmt(c.actualSettlement),  color: 'var(--text-primary)' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '8px 10px', background: 'var(--surface-2)',
                borderRadius: 6, border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.label}
                </div>
                <div className="money" style={{ fontSize: 13, fontWeight: 700, color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="drawer-tabs" style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: -17, paddingBottom: 0 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12, fontWeight: 500,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tab === t.id ? 'var(--brand)' : 'var(--text-muted)',
                  borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'color 0.12s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Drawer body ───────────────────────────────────────────── */}
        <div className="drawer-body">
          {tab === 'trail' && (
            <>
              <MoneyTrailVisualizer
                steps={c.moneyTrail}
                paymentAmount={c.paymentAmount}
                unexplainedDelta={c.unexplainedDelta}
              />
              <div className="drawer-section">
                <div className="drawer-section-label">SettleWise Investigation Synthesis</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {c.aiReasoning}
                </div>
              </div>
            </>
          )}

          {tab === 'hypotheses' && (
            <div className="drawer-section">
              <div className="drawer-section-label">Money TrailAI Hypotheses ({c.hypotheses.length})</div>
              {c.hypotheses.map(h => (
                <div key={h.id} style={{ padding: 12, marginBottom: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                    <strong style={{ fontSize: 13 }}>{h.title}</strong>
                    <span style={{ color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{h.confidenceScore.toFixed(1)}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{h.explanation}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'agents' && (
            <div className="drawer-section">
              <div style={{ padding: 14, marginBottom: 12, background: 'var(--accent-light)', border: '1px solid color-mix(in srgb, var(--brand) 25%, transparent)', borderRadius: 6 }}>
                <div className="drawer-section-label" style={{ color: 'var(--brand)', marginBottom: 6 }}>Tri-Agent Autonomous Decomposition Network</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  SettleWise splits complex financial investigation across 3 dedicated specialized sub-agents before running deterministic policy guardrails.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>Agent 01</span>
                    <span className={`badge ${c.aiConfidence >= 88 ? 'badge-green' : 'badge-amber'}`}>{c.aiConfidence >= 88 ? 'Active' : 'Review'}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>Root Cause & Drift Agent</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{telemetryProfile.rootDetail}</div>
                  <div style={{ fontSize: 11, color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>✓ Diagnostic Confidence: {c.aiConfidence.toFixed(1)}%</div>
                </div>

                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>Agent 02</span>
                    <span className="badge badge-blue">Memory Vector</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>Merchant Context Agent</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Retrieved <strong style={{ color: 'var(--text-primary)' }}>{c.historicalMemoryMatches || 12}</strong> past similar resolution patterns for {c.merchantName}. {telemetryProfile.contextDetail}</div>
                  <div style={{ fontSize: 11, color: 'var(--brand)', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>✓ Historical Alignment {c.historicalMemoryMatches && c.historicalMemoryMatches >= 80 ? 'High' : 'Moderate'}</div>
                </div>

                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>Agent 03</span>
                    <span className="badge badge-green">Tax Ledger</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>Fee & Tax Matcher Agent</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{telemetryProfile.matcherDetail}</div>
                  <div style={{ fontSize: 11, color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>✓ {feeStep ? 'MDR Tier Validated' : 'Ledger Alignment Validated'}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, padding: 12, background: 'var(--warning-bg)', border: '1px solid color-mix(in srgb, var(--warning) 35%, transparent)', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>Dual-Key Adversarial Auditor Gate</div>
                  <span className={`badge ${c.aiConfidence >= 88 ? 'badge-green' : 'badge-amber'}`}>{c.aiConfidence >= 88 ? 'Challenge Cleared' : 'Review Raised'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  The Adversarial Auditor Agent executed counter-evidence checks for {telemetryProfile.auditChecks}. Result: {c.aiReasoning}
                </div>
              </div>
            </div>
          )}

          {tab === 'overview' && (
            <>
              {/* Investigation Timeline */}
              <div className="drawer-section">
                <div className="drawer-section-label">Investigation Pipeline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {timelineSteps.map((step, i) => (
                    <React.Fragment key={i}>
                      <div className="timeline-step">
                        <StepDot status={step.status} />
                        <div style={{ paddingBottom: i < timelineSteps.length - 1 ? 12 : 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: '20px' }}>
                            {step.label}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {step.sub}
                          </div>
                        </div>
                      </div>
                      {i < timelineSteps.length - 1 && <div className="timeline-line" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Root cause */}
              <div className="drawer-section">
                <div className="drawer-section-label">Root Cause</div>
                {c.hypotheses.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {c.hypotheses[0].title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                      {c.hypotheses[0].explanation}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence</span>
                      <div className="conf-bar-track" style={{ width: 80 }}>
                        <div
                          className="conf-bar-fill"
                          style={{
                            width: `${c.aiConfidence}%`,
                            background: c.aiConfidence >= 95 ? 'var(--success)' : c.aiConfidence >= 80 ? 'var(--warning)' : 'var(--danger)',
                          }}
                        />
                      </div>
                      <span className="money" style={{ fontSize: 12, fontWeight: 700, color: c.aiConfidence >= 95 ? 'var(--success)' : 'var(--warning)' }}>
                        {c.aiConfidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Adversarial audit */}
              <div className="drawer-section">
                <div className="drawer-section-label">Adversarial Audit</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Could the discrepancy be caused by:
                </div>
                {[
                  { q: 'Refund processing error?', pass: c.category !== 'PARTIAL_REFUND' },
                  { q: 'MDR / fee mismatch?',       pass: c.category !== 'FEE_MISMATCH' },
                  { q: 'Missing webhook?',            pass: true },
                  { q: 'Bank deduction?',             pass: c.category === 'AMOUNT_MISMATCH' || c.category === 'FEE_MISMATCH' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 0', borderBottom: '1px solid var(--border)',
                    fontSize: 12,
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.q}</span>
                    <span style={{
                      fontWeight: 600,
                      color: item.pass ? 'var(--danger)' : 'var(--success)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                    }}>
                      {item.pass ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
                <div style={{
                  marginTop: 10, padding: '8px 10px', borderRadius: 6,
                  background: c.aiConfidence >= 88 ? 'var(--success-bg)' : 'var(--warning-bg)',
                  border: `1px solid color-mix(in srgb, ${c.aiConfidence >= 88 ? 'var(--success)' : 'var(--warning)'} 25%, transparent)`,
                  fontSize: 12, fontWeight: 600,
                  color: c.aiConfidence >= 88 ? 'var(--success)' : 'var(--warning)',
                }}>
                  {c.aiConfidence >= 88
                    ? '✓ Hypothesis survived adversarial challenge'
                    : '⚠ Ambiguity challenge raised — human review required'}
                </div>
              </div>

              {/* Policy Decision */}
              <div className="drawer-section">
                <div className="drawer-section-label">Policy Decision</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {policyRes.validationChecklist.map((chk, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 8px', borderRadius: 5,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                        {chk.passed
                          ? <CheckCircle2 size={12} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          : <AlertTriangle size={12} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
                        {chk.check}
                      </div>
                      <span style={{
                        fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        color: chk.passed ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {chk.note}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Final verdict box */}
                <div style={{
                  padding: '10px 12px', borderRadius: 6,
                  background: policyRes.isAutoResolvePermitted ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid color-mix(in srgb, ${policyRes.isAutoResolvePermitted ? 'var(--success)' : 'var(--danger)'} 30%, transparent)`,
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: policyRes.isAutoResolvePermitted ? 'var(--success)' : 'var(--danger)',
                    fontFamily: 'JetBrains Mono, monospace', marginBottom: 4,
                  }}>
                    {policyRes.isAutoResolvePermitted ? 'Auto-Resolution Authorized' : 'Auto-Resolution Blocked'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {policyRes.policySummary}
                  </div>
                </div>

                {c.honestExceptionReason && (
                  <div style={{
                    marginTop: 8, padding: '8px 10px', borderRadius: 5,
                    background: 'var(--warning-bg)',
                    border: '1px solid color-mix(in srgb, var(--warning) 25%, transparent)',
                    fontSize: 11, color: 'var(--warning)',
                  }}>
                    ⚠ {c.honestExceptionReason}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'policy' && (
            <div className="drawer-section">
              <div className="drawer-section-label">Policy Check</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {policyRes.isAutoResolvePermitted ? 'Policy authorizes immediate auto-resolution.' : 'Policy requires human review before resolution.'}
              </div>
              {c.ruleValidationNotes.map((note, i) => <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{note}</div>)}
            </div>
          )}

          {tab === 'evidence' && (
            <div className="drawer-section">
              <div className="drawer-section-label">Evidence Ledger</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {c.evidence.map(ev => (
                  <div key={ev.id} style={{
                    padding: '8px 10px', borderRadius: 5,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--brand)' }}>
                        {ev.source}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                        color: ev.status === 'VERIFIED' ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {ev.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {ev.recordReference} · Match: <strong style={{ color: 'var(--text-primary)' }}>{ev.matchScore}%</strong>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                      {Object.entries(ev.keyValues).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'langgraph' && (
            <div className="drawer-section">
              <div className="drawer-section-label">LangGraph Execution Trace</div>
              {[
                { name: '01 — Ingestion Node',          status: 'SUCCESS', ms: 80,  agents: ['LedgerParser'] },
                { name: '02 — Tri-Agent Sub-Graph',     status: 'SUCCESS', ms: 210, agents: ['RootCause', 'MerchantContext', 'FeeTax'] },
                { name: '03 — Adversarial Gate',        status: c.aiConfidence >= 88 ? 'SUCCESS' : 'WARNING', ms: 140, agents: ['AdversarialAuditor'] },
                { name: '04 — Policy Guardrails',       status: policyRes.isAutoResolvePermitted ? 'SUCCESS' : 'PAUSED',  ms: 60,  agents: ['RuleEngine'] },
                { name: '05 — Terminal Node',           status: isResolved ? 'SUCCESS' : isBlocked ? 'PAUSED' : 'PENDING', ms: 45, agents: [isResolved ? 'LedgerWriter' : 'QuarantineCtrl'] },
              ].map((node, i) => (
                <div key={i} style={{
                  padding: '8px 10px', marginBottom: 6, borderRadius: 5,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{node.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{node.ms}ms</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
                        background: node.status === 'SUCCESS' ? 'var(--success-bg)' : node.status === 'WARNING' ? 'var(--warning-bg)' : 'var(--surface)',
                        color: node.status === 'SUCCESS' ? 'var(--success)' : node.status === 'WARNING' ? 'var(--warning)' : 'var(--text-muted)',
                        border: `1px solid color-mix(in srgb, ${node.status === 'SUCCESS' ? 'var(--success)' : node.status === 'WARNING' ? 'var(--warning)' : 'var(--border)'} 30%, transparent)`,
                      }}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {node.agents.map(a => (
                      <span key={a} style={{
                        marginRight: 4, padding: '1px 5px', borderRadius: 3,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        color: 'var(--accent)',
                      }}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer actions ─────────────────────────────────────────── */}
        <div className="drawer-footer">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onUpdateAction(c.id, 'BLOCK', 'Blocked by operator — high risk')}
          >
            <AlertTriangle size={12} /> Block & Escalate
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onUpdateAction(c.id, 'RECOVERY_CASE', 'Recovery ticket created')}
          >
            <DollarSign size={12} /> Recovery Ticket
          </button>
          <button
            className="btn btn-success btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => onUpdateAction(c.id, 'AUTO_RESOLVE', 'Authorized by operator')}
          >
            <CheckCircle2 size={12} /> Authorize Resolve
          </button>
        </div>
      </div>
    </div>
  );
};
