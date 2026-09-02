import React from 'react';
import { MoneyTrailStep } from '../types/settlewise';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, DollarSign } from 'lucide-react';

interface MoneyTrailVisualizerProps {
  steps: MoneyTrailStep[];
  paymentAmount: number;
  unexplainedDelta: number;
  compact?: boolean;
}

export const MoneyTrailVisualizer: React.FC<MoneyTrailVisualizerProps> = ({
  steps,
  paymentAmount,
  unexplainedDelta,
  compact = false
}) => {
  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-4 lg:p-5 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Explainable Money Trail
            </h4>
            <p className="text-[11px] text-slate-400">
              Complete rupee lifecycle breakdown (&ldquo;Where did the ₹ go?&rdquo;)
            </p>
          </div>
        </div>

        {unexplainedDelta === 0 ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ✓ 100% EXPLAINED
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            ⚠️ ₹{unexplainedDelta.toLocaleString('en-IN')} UNEXPLAINED
          </span>
        )}
      </div>

      {/* Visual Nodes Timeline Flow */}
      <div className="relative overflow-x-auto py-2">
        <div className="flex items-center gap-3 min-w-[650px] justify-between">
          {steps.map((step, idx) => {
            const isMatch = step.status === 'MATCH' || step.status === 'RESOLVED';
            const isUnexplained = step.status === 'UNEXPLAINED';
            const isRecoverable = step.status === 'RECOVERABLE';

            return (
              <React.Fragment key={idx}>
                {/* Node Box */}
                <div
                  className={`flex-1 min-w-[120px] p-3 rounded-xl border transition-all relative ${
                    isMatch
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                      : isUnexplained
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-glowRose'
                      : isRecoverable
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glowEmerald'
                      : 'bg-amber-950/20 border-amber-500/40'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {step.stage.replace('_', ' ')}
                    </span>
                    {isMatch && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isUnexplained && <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                    {isRecoverable && <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>

                  {/* Step Label */}
                  <div className="text-xs font-semibold text-slate-200 truncate" title={step.label}>
                    {step.label}
                  </div>

                  {/* Financial Amount */}
                  <div
                    className={`text-sm font-extrabold font-mono mt-1 ${
                      step.actualAmount < 0
                        ? 'text-rose-400'
                        : isMatch
                        ? 'text-emerald-400'
                        : isUnexplained
                        ? 'text-rose-400'
                        : 'text-amber-300'
                    }`}
                  >
                    {step.actualAmount < 0 ? '-' : ''}₹{Math.abs(step.actualAmount).toLocaleString('en-IN')}
                  </div>

                  {/* Note detail */}
                  {!compact && (
                    <div className="text-[10px] text-slate-400 mt-1.5 leading-tight truncate" title={step.detailNote}>
                      {step.detailNote}
                    </div>
                  )}
                </div>

                {/* Arrow Connector */}
                {idx < steps.length - 1 && (
                  <div className="flex items-center text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Calculation Summary Bar */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-2 rounded-lg">
          <div>
            <span>Initial Payment: <strong className="text-white">₹{paymentAmount.toLocaleString('en-IN')}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            {steps.filter(s => s.stage === 'REFUND').map((s, i) => (
              <span key={i} className="text-rose-400">
                Refund: -₹{Math.abs(s.actualAmount).toLocaleString('en-IN')}
              </span>
            ))}
            {steps.filter(s => s.stage === 'FEE').map((s, i) => (
              <span key={i} className="text-amber-400">
                Fee: -₹{Math.abs(s.actualAmount).toLocaleString('en-IN')}
              </span>
            ))}
          </div>
          <div>
            <span>Net Financial Payout: <strong className="text-emerald-400">₹{steps[steps.length - 1]?.actualAmount?.toLocaleString('en-IN') || 0}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
