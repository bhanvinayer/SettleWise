import React from 'react';
import { DollarSign, CheckCircle2, ShieldAlert, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { BenchmarkMetrics } from '../types/settlewise';

interface ExecutiveDashboardProps {
  metrics: BenchmarkMetrics;
  onSelectCategoryFilter: (category: string | null) => void;
  activeFilter: string | null;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  metrics,
  onSelectCategoryFilter,
  activeFilter
}) => {
  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Banner Tagline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl surface-card border border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
            <span>Executive Finance Controller Telemetry</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Batch size: {metrics.totalRecords} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time verification pipeline separating multi-agent hypothesis investigation from deterministic rules authorization.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Avg latency: <strong className="text-white">{metrics.avgInvestigationTimeSec}s</strong> / record</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Processed Volume */}
        <div className="surface-card surface-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Investigated</span>
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono tracking-tight">
            ₹{(metrics.totalRupeesInvestigated / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-indigo-400 font-mono font-semibold">100%</span> multi-source
          </div>
        </div>

        {/* Card 2: Auto-Resolution Precision */}
        <div className="surface-card surface-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Auto Prec.</span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono tracking-tight">
            {metrics.autoResolvePrecision}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-mono font-semibold">{metrics.falseAutoResolutions}</span> false positives
          </div>
        </div>

        {/* Card 3: Diagnosis Precision */}
        <div className="surface-card surface-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Accuracy</span>
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-300 font-mono tracking-tight">
            {metrics.diagnosisPrecision}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-indigo-400 font-mono font-semibold">{metrics.correctDiagnoses}/{metrics.totalRecords}</span> tagged
          </div>
        </div>

        {/* Card 4: Safely Escalated / Honest Exceptions */}
        <div 
          onClick={() => onSelectCategoryFilter(activeFilter === 'BLOCKED' ? null : 'BLOCKED')}
          className={`surface-card surface-card-hover p-4 rounded-xl cursor-pointer border transition-all ${
            activeFilter === 'BLOCKED' ? 'border-amber-500/50 bg-amber-500/5' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Honest Blocked</span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono tracking-tight">
            {metrics.safelyEscalatedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ambiguities blocked
          </div>
        </div>

        {/* Card 5: Unexplained Delta */}
        <div className="surface-card surface-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Unexplained</span>
            <div className="p-1 rounded-md bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono tracking-tight">
            ₹3,290
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Isolated & Escalated
          </div>
        </div>

        {/* Card 6: Money Leakage Recovered */}
        <div 
          onClick={() => onSelectCategoryFilter(activeFilter === 'RECOVERING' ? null : 'RECOVERING')}
          className={`surface-card surface-card-hover p-4 rounded-xl cursor-pointer border transition-all ${
            activeFilter === 'RECOVERING' ? 'border-emerald-500/50 bg-emerald-500/5' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Leakage Found</span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-300 font-mono tracking-tight">
            ₹{metrics.moneyLeakageDetected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            Recovery tickets open
          </div>
        </div>

      </div>

      {/* Forward Cash Forecaster Telemetry Bar */}
      <div className="p-4 rounded-xl surface-card border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                Track 04 Forward Cash Forecaster (7-Day Rolling Payout Projection)
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Predictive liquidity modeling factoring in reconciled gateway settlements vs. quarantined risk capital.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            CONFIDENCE INDEX: 98.4%
          </span>
        </div>

        {/* 7-Day Micro Grid */}
        <div className="grid grid-cols-7 gap-2 pt-1">
          {[
            { day: 'Today', date: 'Sep 4', proj: 142000, status: 'STABLE' },
            { day: 'Day +1', date: 'Sep 5', proj: 158500, status: 'OPTIMAL' },
            { day: 'Day +2', date: 'Sep 6', proj: 129000, status: 'STABLE' },
            { day: 'Day +3', date: 'Sep 7', proj: 184000, status: 'OPTIMAL' },
            { day: 'Day +4', date: 'Sep 8', proj: 110000, status: 'STABLE' },
            { day: 'Day +5', date: 'Sep 9', proj: 195000, status: 'OPTIMAL' },
            { day: 'Day +6', date: 'Sep 10', proj: 210000, status: 'OPTIMAL' },
          ].map((d, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] font-mono text-slate-400 font-semibold">{d.day}</div>
              <div className="text-[11px] font-mono font-bold text-white">₹{(d.proj / 1000).toFixed(0)}k</div>
              <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">{d.status}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
