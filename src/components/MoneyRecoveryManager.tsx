import React from 'react';
import { ExceptionCase } from '../types/settlewise';
import { DollarSign, Download, X } from 'lucide-react';

interface MoneyRecoveryManagerProps {
  cases: ExceptionCase[];
  onClose: () => void;
}

export const MoneyRecoveryManager: React.FC<MoneyRecoveryManagerProps> = ({
  cases,
  onClose
}) => {
  const recoveryCases = cases.filter((c) => Boolean(c.recoveryAmount) || c.status === 'RECOVERING');
  const totalLeakage = recoveryCases.reduce((sum, c) => sum + (c.recoveryAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-6 overflow-y-auto theme-modal">
      <div className="bg-[#0b0f19] border border-emerald-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden theme-modal-panel">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-emerald-950/20 flex items-center justify-between theme-modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
                <span>Money Leakage & Recovery Controller</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ₹{totalLeakage.toLocaleString('en-IN')} Identified
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                SettleWise automatically detects intermediate bank fee leakage, un-webhooked refunds, and un-itemized deductions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recovery Table */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {recoveryCases.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No money leakage cases detected in current batch.
            </div>
          ) : (
            recoveryCases.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 shadow-glowEmerald flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">{c.id}</span>
                    <span className="font-semibold text-white text-sm">{c.merchantName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      RECOVERY TICKET
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2">
                    {c.recoveryNotes || c.aiReasoning}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Payment: <strong className="text-white">₹{c.paymentAmount.toLocaleString('en-IN')}</strong></span>
                    <span>Expected: <strong className="text-slate-200">₹{c.expectedSettlement.toLocaleString('en-IN')}</strong></span>
                    <span>Actual: <strong className="text-rose-400">₹{c.actualSettlement.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="text-lg font-extrabold font-mono text-emerald-400">
                    +₹{c.recoveryAmount?.toLocaleString('en-IN')} Leakage
                  </div>

                  <button
                    onClick={() => alert(`Generated Claim Package for Exception ${c.id}`)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Claim Dispute Package</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080b12] text-right theme-modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
