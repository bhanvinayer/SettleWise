import React from 'react';
import { ShieldCheck, Cpu, Play, Settings, AlertTriangle, DollarSign } from 'lucide-react';

interface HeaderProps {
  onRunReplay: () => void;
  onOpenPolicy: () => void;
  onOpenRecovery: () => void;
  onOpenHonestExceptions: () => void;
  honestExceptionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRunReplay,
  onOpenPolicy,
  onOpenRecovery,
  onOpenHonestExceptions,
  honestExceptionsCount
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Track Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-glow">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 font-sans">
                  SETTLEWISE
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  BUILDATHON 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                AI Financial Exception Investigator & Recovery Controller
              </p>
            </div>
          </div>

          <div className="md:hidden">
            <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              TRACK 04
            </span>
          </div>
        </div>

        {/* Motto Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Principle: <strong className="text-blue-300">AI Investigates.</strong> <strong className="text-emerald-400">Rules Authorize.</strong></span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          
          <button
            onClick={onOpenHonestExceptions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Honest Exceptions</span>
            <span className="bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {honestExceptionsCount}
            </span>
          </button>

          <button
            onClick={onOpenRecovery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Money Recovery</span>
          </button>

          <button
            onClick={onOpenPolicy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Policy Rules</span>
          </button>

          <button
            onClick={onRunReplay}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Replay (50+ Batch)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
