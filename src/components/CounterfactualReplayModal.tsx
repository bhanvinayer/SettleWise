import React, { useState } from 'react';
import { BenchmarkMetrics, PolicyGuardrails } from '../types/settlewise';
import { CounterfactualPipelineResult, runCounterfactualReplayPipeline } from '../engine/counterfactualReplay';
import { Play, CheckCircle2, X, RefreshCw } from 'lucide-react';

interface CounterfactualReplayModalProps {
  onClose: () => void;
  onApplyBatchResults: (result: CounterfactualPipelineResult) => void;
  guardrails: PolicyGuardrails;
}

export const CounterfactualReplayModal: React.FC<CounterfactualReplayModalProps> = ({
  onClose,
  onApplyBatchResults,
  guardrails
}) => {
  const [batchSize, setBatchSize] = useState<number>(50);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentMetrics, setCurrentMetrics] = useState<BenchmarkMetrics | null>(null);

  const handleExecuteReplay = async () => {
    setIsRunning(true);
    try {
      const result = await runCounterfactualReplayPipeline(batchSize, guardrails);
      setCurrentMetrics(result.metrics);
      onApplyBatchResults(result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-6 overflow-y-auto theme-modal">
      <div className="bg-[#0b0f19] border border-blue-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden theme-modal-panel">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-blue-950/20 flex items-center justify-between theme-modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <span>Counterfactual Replay & Benchmark Engine</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  TRACK 04 EVALUATION
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Generate synthetic transaction datasets and measure SettleWise precision against ground truth.
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

        {/* Body Controls */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-slate-300">Dataset Batch Size:</span>
              <div className="flex items-center gap-2">
                {[50, 500, 1000, 10000].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBatchSize(size)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      batchSize === size
                        ? 'bg-blue-600 text-white shadow-glow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {size.toLocaleString()} Records
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteReplay}
              disabled={isRunning}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running LangGraph Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Pipeline Benchmark</span>
                </>
              )}
            </button>
          </div>

          {/* Benchmark Results Table */}
          {currentMetrics && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Razorpay Buildathon Benchmark Evaluation Table
                </h3>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Benchmark Completed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                <span>Seed: <strong className="text-slate-200">{currentMetrics.replaySeed}</strong></span>
                <span>Graph nodes: <strong className="text-slate-200">{currentMetrics.graphNodesExecuted}</strong></span>
                <span>Correct actions: <strong className="text-slate-200">{currentMetrics.correctActionDecisions}/{currentMetrics.totalRecords}</strong></span>
                <span>False positive rate: <strong className="text-rose-400">{currentMetrics.falsePositiveRate}%</strong></span>
                <span>Safe escalation: <strong className="text-emerald-400">{currentMetrics.safeEscalationRate}%</strong></span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                {currentMetrics.pipelineExecuted ? 'LIVE STATEGRAPH + POLICY PIPELINE EXECUTION VERIFIED' : 'DETERMINISTIC POLICY EVALUATION'} · OBSERVABILITY DELIVERY IS OPTIONAL
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Records</span>
                  <span className="text-lg font-extrabold font-mono text-white">{currentMetrics.totalRecords.toLocaleString()}</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Diagnosis Accuracy</span>
                  <span className="text-lg font-extrabold font-mono text-indigo-400">{currentMetrics.diagnosisPrecision}%</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Auto-Resolve Prec.</span>
                  <span className="text-lg font-extrabold font-mono text-emerald-400">{currentMetrics.autoResolvePrecision}%</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Safely Escalated</span>
                  <span className="text-lg font-extrabold font-mono text-amber-400">{currentMetrics.safelyEscalatedCount}</span>
                </div>
              </div>

              {/* Detailed Markdown-Style Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                      <th className="py-2.5 px-4">Evaluation Metric</th>
                      <th className="py-2.5 px-4 text-right">Measured Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-4">Records processed</td>
                      <td className="py-2.5 px-4 text-right font-bold text-white">{currentMetrics.totalRecords.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Exceptions injected</td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-400">{currentMetrics.injectedExceptions}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Correct AI diagnoses</td>
                      <td className="py-2.5 px-4 text-right font-bold text-indigo-300">{currentMetrics.correctDiagnoses}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Diagnosis precision</td>
                      <td className="py-2.5 px-4 text-right font-bold text-indigo-400">{currentMetrics.diagnosisPrecision}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Auto-resolution precision</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{currentMetrics.autoResolvePrecision}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Exceptions safely escalated</td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-300">{currentMetrics.safelyEscalatedCount}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">False auto-resolutions</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{currentMetrics.falseAutoResolutions}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">₹ Total Investigated</td>
                      <td className="py-2.5 px-4 text-right font-bold text-white">₹{currentMetrics.totalRupeesInvestigated.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">₹ Safely Reconciled</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">₹{currentMetrics.totalRupeesReconciled.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Money Leakage Identified</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-300">₹{currentMetrics.moneyLeakageDetected.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Avg. investigation time per record</td>
                      <td className="py-2.5 px-4 text-right font-bold text-blue-400">{currentMetrics.avgInvestigationTimeSec} sec</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080b12] text-right theme-modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
