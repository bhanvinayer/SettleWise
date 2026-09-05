import React, { useEffect, useRef } from 'react';
import { BenchmarkMetrics } from '../types/settlewise';
import { ActiveView } from '../App';
import { Play, Sliders, Search } from 'lucide-react';

interface TopbarProps {
  metrics: BenchmarkMetrics | null;
  onRunBatch: () => void;
  onOpenPolicy: () => void;
  activeView: ActiveView;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  observabilityStatus: 'idle' | 'traced' | 'unavailable';
}

const VIEW_LABELS: Record<ActiveView, string> = {
  'command-center': 'Command Center',
  'exceptions':     'Exceptions',
  'recoveries':     'Money Recovery',
  'policy':         'Policy Simulator',
  'batch-runs':     'Batch Runs',
};

export const Topbar: React.FC<TopbarProps> = ({ metrics, onRunBatch, onOpenPolicy, activeView, searchQuery, onSearchQueryChange, observabilityStatus }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="topbar">
      {/* Left: Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {VIEW_LABELS[activeView]}
        </h1>

        {metrics && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '3px 10px', borderRadius: 5,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span>Batch #BW-2026-{now.toISOString().slice(0, 10).replace(/-/g, '')}</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span>{metrics.totalRecords.toLocaleString()} records</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span>Last run {timeStr}</span>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* System status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 5,
          background: 'var(--success-bg)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
          fontSize: 11, color: 'var(--success)', fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}
            className="animate-pulse-dot" />
          Operational
        </div>

        <div title="Langfuse trace delivery status" style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 5,
          background: 'var(--success-bg)',
          border: '1px solid var(--border)', fontSize: 10,
          color: 'var(--success)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
          Langfuse {observabilityStatus === 'traced' ? 'synced' : 'ready'}
        </div>

        {/* Functional transaction search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 5,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          fontSize: 11, color: 'var(--text-muted)',
        }}>
          <Search size={12} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={event => onSearchQueryChange(event.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            style={{ width: 128, border: 0, outline: 0, background: 'transparent', color: 'var(--text-primary)', fontSize: 11 }}
          />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            padding: '1px 4px', borderRadius: 3,
            background: 'var(--surface)', border: '1px solid var(--border)',
            fontSize: 10,
          }}>⌘K</span>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={onOpenPolicy}>
          <Sliders size={12} />
          Policy
        </button>

        <button className="btn btn-primary btn-sm" onClick={onRunBatch}>
          <Play size={12} />
          Run Batch
        </button>
      </div>
    </header>
  );
};
