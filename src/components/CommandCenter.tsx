import React, { useState } from 'react';
import { ExceptionCase, BenchmarkMetrics } from '../types/settlewise';
import { generateCashForecast } from '../engine/cashForecaster';
import {
  TrendingDown, ChevronRight, Search, ArrowUpRight
} from 'lucide-react';

interface CommandCenterProps {
  cases: ExceptionCase[];
  metrics: BenchmarkMetrics;
  activeCategoryFilter: string | null;
  searchQuery: string;
  onSelectCase: (c: ExceptionCase) => void;
  onSelectFilter: (f: string | null) => void;
  onOpenRecovery: () => void;
  onOpenExceptions: () => void;
}

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Blocked', value: 'BLOCKED' },
  { label: 'Review', value: 'REVIEW' },
  { label: 'Recovery', value: 'RECOVERING' },
  { label: 'Resolved', value: 'RESOLVED' },
];

function getActionBadge(c: ExceptionCase) {
  if (c.authorizedAction === 'AUTO_RESOLVE' || c.status === 'RESOLVED')
    return <span className="badge badge-green">Resolved</span>;
  if (c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED')
    return <span className="badge badge-red">Blocked</span>;
  if (c.authorizedAction === 'RECOVERY_CASE' || c.status === 'RECOVERING')
    return <span className="badge badge-blue">Recovery</span>;
  if (c.honestExceptionReason)
    return <span className="badge badge-amber">Exception</span>;
  return <span className="badge badge-amber">Review</span>;
}

function getUrgencyDot(urgency: string) {
  const color = urgency === 'HIGH' ? 'var(--danger)' : urgency === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
}

function confColor(v: number) {
  if (v >= 95) return 'var(--success)';
  if (v >= 80) return 'var(--warning)';
  return 'var(--danger)';
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtL = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

export const CommandCenter: React.FC<CommandCenterProps> = ({
  cases, metrics, activeCategoryFilter, searchQuery,
  onSelectCase, onSelectFilter, onOpenRecovery, onOpenExceptions
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Aggregate at-risk amount
  const atRisk = cases
    .filter(c => c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED' || c.honestExceptionReason)
    .reduce((sum, c) => sum + c.unexplainedDelta, 0);

  const attentionCount = cases.filter(
    c => c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED' || c.honestExceptionReason || !c.authorizedAction
  ).length;

  const leakage = metrics.moneyLeakageDetected;
  const recovered = Math.round(leakage * 0.3);
  const claimReady = Math.round(leakage * 0.65);
  const verified = Math.round(leakage * 0.95);

  const cashForecast = generateCashForecast(cases);
  const forecastValues = cashForecast.dailyProjections.map(projection => Number((projection.netCashPosition / 100000).toFixed(1)));
  const forecastMax = Math.max(...forecastValues);

  const filtered = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.merchantName.toLowerCase().includes(q) ||
      c.paymentId.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);

    const sf = activeCategoryFilter || statusFilter;
    const matchStatus =
      sf === 'ALL' ||
      (sf === 'BLOCKED' && (c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED')) ||
      (sf === 'REVIEW' && (!c.authorizedAction || c.authorizedAction === 'HUMAN_REVIEW')) ||
      (sf === 'RECOVERING' && (c.authorizedAction === 'RECOVERY_CASE' || c.status === 'RECOVERING')) ||
      (sf === 'RESOLVED' && (c.authorizedAction === 'AUTO_RESOLVE' || c.status === 'RESOLVED'));

    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── KPI Row ──────────────────────────────────────────────────── */}
      <div className="card" style={{ display: 'flex', overflow: 'hidden' }}>
        {/* KPI 1 */}
        <div className="stat-cell" style={{ flex: 1 }}>
          <div className="stat-label">Investigated</div>
          <div className="stat-value money">{fmtL(metrics.totalRupeesInvestigated)}</div>
          <div className="stat-sub">{metrics.totalRecords} records · {metrics.avgInvestigationTimeSec}s avg</div>
        </div>

        {/* KPI 2 */}
        <div className="stat-cell" style={{ flex: 1, cursor: 'pointer' }} onClick={onOpenExceptions}>
          <div className="stat-label" style={{ color: 'var(--warning)' }}>Requires Attention</div>
          <div className="stat-value money" style={{ color: 'var(--warning)' }}>{attentionCount}</div>
          <div className="stat-sub">{fmt(atRisk)} exposure</div>
        </div>

        {/* KPI 3 */}
        <div className="stat-cell" style={{ flex: 1 }}>
          <div className="stat-label" style={{ color: 'var(--danger)' }}>Money at Risk</div>
          <div className="stat-value money" style={{ color: 'var(--danger)' }}>{fmt(atRisk)}</div>
          <div className="stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingDown size={10} />
            <span>Quarantined by policy</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="stat-cell" style={{ flex: 1 }}>
          <div className="stat-label">Auto Precision</div>
          <div className="stat-value money" style={{ color: 'var(--success)' }}>{metrics.autoResolvePrecision}%</div>
          <div className="stat-sub">{metrics.falseAutoResolutions} false positives</div>
        </div>

        {/* KPI 5 */}
        <div className="stat-cell" style={{ flex: 1, cursor: 'pointer' }} onClick={onOpenRecovery}>
          <div className="stat-label">Leakage Found</div>
          <div className="stat-value money" style={{ color: 'var(--accent)' }}>{fmt(leakage)}</div>
          <div className="stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Recovery pipeline open</span>
            <ArrowUpRight size={10} />
          </div>
        </div>
      </div>

      {/* ── Two-column bottom: Table + right panel ───────────────────── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* ── Exception table ────────────────────────────────────────── */}
        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          {/* Table header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>
                Requires Attention
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {filtered.length} cases · {fmt(atRisk)} exposure
              </div>
            </div>

            {/* Filters + search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 4 }}>
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={`btn btn-sm btn-ghost`}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      background: (activeCategoryFilter || statusFilter) === f.value ? 'var(--accent-light)' : undefined,
                      color: (activeCategoryFilter || statusFilter) === f.value ? 'var(--brand)' : undefined,
                      borderColor: (activeCategoryFilter || statusFilter) === f.value ? 'var(--brand)' : undefined,
                    }}
                    onClick={() => { onSelectFilter(null); setStatusFilter(f.value); }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="fin-input"
                  style={{ paddingLeft: 26, width: 160 }}
                  placeholder="Case, merchant…"
                  value={searchQuery}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Merchant</th>
                  <th>Issue</th>
                  <th className="text-right">Delta</th>
                  <th className="text-right">Conf.</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 12px' }}>
                      No exceptions match your filter.
                    </td>
                  </tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => onSelectCase(c)}>
                    {/* Case ID */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getUrgencyDot(c.urgency)}
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 600,
                          color: 'var(--brand)',
                          fontSize: 12,
                        }}>{c.id}</span>
                      </div>
                    </td>

                    {/* Merchant */}
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>
                        {c.merchantName}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {c.paymentId}
                      </div>
                    </td>

                    {/* Issue */}
                    <td>
                      <span style={{
                        fontSize: 11, color: 'var(--text-secondary)',
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: 4, padding: '2px 7px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {c.category.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Delta — right aligned */}
                    <td className="text-right">
                      <span className="money" style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: c.unexplainedDelta > 5000 ? 'var(--danger)' : 'var(--text-primary)',
                      }}>
                        {fmt(c.unexplainedDelta)}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="text-right">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <div className="conf-bar-track">
                          <div
                            className="conf-bar-fill"
                            style={{ width: `${c.aiConfidence}%`, background: confColor(c.aiConfidence) }}
                          />
                        </div>
                        <span className="money" style={{ fontSize: 12, fontWeight: 600, color: confColor(c.aiConfidence) }}>
                          {c.aiConfidence.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Action badge */}
                    <td>{getActionBadge(c)}</td>

                    {/* Arrow */}
                    <td>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right panel ────────────────────────────────────────────── */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Cash Position */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>
              Cash Position
            </div>
            {[
              { label: 'Available',         value: '₹42.8L',    color: 'var(--text-primary)' },
              { label: 'Expected inflows',  value: '₹18.4L',    color: 'var(--success)' },
              { label: 'Quarantined',       value: fmt(atRisk),  color: 'var(--warning)' },
              { label: 'Recoverable',       value: fmt(leakage), color: 'var(--accent)' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.label}</span>
                <span className="money" style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}

            {/* 7-day mini forecast */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', margin: '10px 0 8px' }}>
              7-Day Forecast
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, alignItems: 'end' }}>
              {cashForecast.dailyProjections.map((projection, i) => {
                const value = forecastValues[i];
                const pct = Math.max(16, (value / forecastMax) * 100);
                return (
                  <div key={projection.dateStr} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }} title={`${projection.dateStr}: ₹${value.toFixed(1)}L net cash, ${projection.liquidityHealth.toLowerCase()}`}>
                    <span style={{ fontSize: 8, lineHeight: 1, color: i === 0 ? 'var(--brand)' : 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      ₹{value.toFixed(1)}L
                    </span>
                    <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        aria-label={`${projection.dayLabel} projected net cash ₹${value.toFixed(1)} lakh`}
                        style={{
                          width: '100%',
                          height: `${pct}%`,
                          borderRadius: '3px 3px 0 0',
                          background: i === 0 ? 'var(--brand)' : 'var(--accent-light)',
                          border: `1px solid ${i === 0 ? 'var(--brand)' : 'var(--border)'}`,
                          transition: 'height 0.2s, opacity 0.2s',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: i === 0 ? 700 : 500, whiteSpace: 'nowrap' }}>
                      {i === 0 ? 'Today' : `+${i}d`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 7, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              <span>Projected range</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹{forecastValues[0].toFixed(1)}L → ₹{forecastValues[6].toFixed(1)}L · {cashForecast.payoutConfidenceIndex}% confidence</strong>
            </div>
          </div>

          {/* Money Recovery pipeline */}
          <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={onOpenRecovery}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
              Money Recovery
            </div>
            <div className="money" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              {fmt(leakage)}
            </div>
            {/* Pipeline stages */}
            {[
              { label: 'Identified',   value: leakage,    color: 'var(--text-secondary)' },
              { label: 'Verified',     value: verified,   color: 'var(--accent)' },
              { label: 'Claim Ready',  value: claimReady, color: 'var(--warning)' },
              { label: 'Recovered',    value: recovered,  color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span className="money" style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{fmt(s.value)}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View pipeline <ChevronRight size={11} />
            </div>
          </div>

          {/* Batch summary */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>
              Last Batch
            </div>
            {[
              { label: 'Processed',        value: metrics.totalRecords, mono: true },
              { label: 'Auto-Resolved',    value: metrics.autoResolveCount, mono: true },
              { label: 'Exceptions',value: metrics.safelyEscalatedCount, mono: true },
              { label: 'Precision',        value: `${metrics.autoResolvePrecision}%`, mono: true },
              { label: 'Accuracy',         value: `${metrics.diagnosisPrecision}%`, mono: true },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                  fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'inherit',
                }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
