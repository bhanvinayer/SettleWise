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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-emerald-950/40 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Executive Finance Controller Overview</span>
            <span className="text-[10px] font-mono font-normal text-slate-400">
              (Batch Run: {metrics.totalRecords} Records)
            </span>
          </h2>
          <p className="text-xs text-slate-300">
            &ldquo;We don&apos;t ask whether two financial records match. We investigate why they don&apos;t — and only automate the cases we&apos;re actually sure about.&rdquo;
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Avg Investigation: <strong className="text-white">{metrics.avgInvestigationTimeSec}s</strong> / record</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Processed Volume */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Investigated ₹</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-white font-mono">
            ₹{(metrics.totalRupeesInvestigated / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-blue-400 font-mono">100%</span> multi-source audit
          </div>
        </div>

        {/* Card 2: Auto-Resolution Precision */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Auto-Resolve Prec.</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-emerald-400 font-mono">
            {metrics.autoResolvePrecision}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-mono">{metrics.falseAutoResolutions}</span> false resolutions
          </div>
        </div>

        {/* Card 3: Diagnosis Precision */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Diagnosis Accuracy</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-indigo-300 font-mono">
            {metrics.diagnosisPrecision}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-indigo-400 font-mono">{metrics.correctDiagnoses}/{metrics.totalRecords}</span> accurate tags
          </div>
        </div>

        {/* Card 4: Safely Escalated / Honest Exceptions */}
        <div 
          onClick={() => onSelectCategoryFilter(activeFilter === 'BLOCKED' ? null : 'BLOCKED')}
          className={`glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer relative overflow-hidden group border transition-all ${
            activeFilter === 'BLOCKED' ? 'border-amber-500/60 bg-amber-950/20' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safely Escalated</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-amber-400 font-mono">
            {metrics.safelyEscalatedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Honest exceptions blocked
          </div>
        </div>

        {/* Card 5: Unexplained Delta */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unexplained Delta</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-rose-400 font-mono">
            ₹3,290
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Isolated & Escalated
          </div>
        </div>

        {/* Card 6: Money Leakage Recovered */}
        <div 
          onClick={() => onSelectCategoryFilter(activeFilter === 'RECOVERING' ? null : 'RECOVERING')}
          className={`glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer relative overflow-hidden group border transition-all ${
            activeFilter === 'RECOVERING' ? 'border-emerald-500/60 bg-emerald-950/20' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Leakage Found</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-emerald-300 font-mono">
            ₹{metrics.moneyLeakageDetected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            Recovery cases created
          </div>
        </div>

      </div>

    </div>
  );
};
