import React, { useState } from 'react';
import { PolicyGuardrails } from '../types/settlewise';
import { Lock, X, RotateCcw } from 'lucide-react';
import { DEFAULT_POLICY_GUARDRAILS } from '../engine/policyEngine';

interface PolicyGuardrailsConfiguratorProps {
  guardrails: PolicyGuardrails;
  onSave: (updated: PolicyGuardrails) => void;
  onClose: () => void;
}

export const PolicyGuardrailsConfigurator: React.FC<PolicyGuardrailsConfiguratorProps> = ({
  guardrails,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState<PolicyGuardrails>({ ...guardrails });

  const handleReset = () => {
    setConfig({ ...DEFAULT_POLICY_GUARDRAILS });
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <span>Deterministic Authorization Policy Guardrails</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                &ldquo;AI Investigates. Rules Authorize.&rdquo; Configurable stopping rules.
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

        {/* Config Options */}
        <div className="p-6 space-y-5 text-xs text-slate-300 overflow-y-auto max-h-[70vh]">
          
          {/* Rule 1: Min Confidence */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white font-mono">
                Minimum AI Confidence Threshold for Auto-Resolve
              </label>
              <span className="font-mono font-bold text-emerald-400">{config.minConfidenceAutoResolve}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="99"
              step="0.5"
              value={config.minConfidenceAutoResolve}
              onChange={(e) => setConfig({ ...config, minConfidenceAutoResolve: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Cases below this confidence are automatically withheld from auto-resolution and sent to human review.
            </p>
          </div>

          {/* Rule 2: Min Candidate Margin */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white font-mono">
                Minimum Candidate Margin Delta (H1 vs H2 Confidence)
              </label>
              <span className="font-mono font-bold text-amber-400">{config.minCandidateMargin}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={config.minCandidateMargin}
              onChange={(e) => setConfig({ ...config, minCandidateMargin: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Protects against ambiguous settlement duplicates where top 2 candidates have close confidence scores.
            </p>
          </div>

          {/* Rule 3: Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-white font-mono">Mandatory Review for Duplicate Candidates</div>
                <div className="text-[11px] text-slate-400">Strictly block auto-resolution when multiple payouts exist</div>
              </div>
              <input
                type="checkbox"
                checked={config.mandatoryReviewDuplicate}
                onChange={(e) => setConfig({ ...config, mandatoryReviewDuplicate: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-white font-mono">Require Deterministic Ledger Arithmetic Match</div>
                <div className="text-[11px] text-slate-400">Verify Payment - Refund - Fee === Net Settlement before authorization</div>
              </div>
              <input
                type="checkbox"
                checked={config.requireDeterministicArithmeticMatch}
                onChange={(e) => setConfig({ ...config, requireDeterministicArithmeticMatch: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#080b12] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-glow"
            >
              Save Policy Rules
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
