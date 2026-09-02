import React from 'react';
import { ShieldCheck, Cpu, Play, Sliders, AlertTriangle, DollarSign } from 'lucide-react';

interface HeaderProps {
  onRunReplay: () => void;
  onOpenPolicy: () => void;
  onOpenRecovery: () => void;
  onOpenHonestExceptions: () => void;
  onOpenLanding?: () => void;
  honestExceptionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRunReplay,
  onOpenPolicy,
  onOpenRecovery,
  onOpenHonestExceptions,
  onOpenLanding,
  honestExceptionsCount
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0c0e17]/95 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Track Identification */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={onOpenLanding}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/50 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans group-hover:text-indigo-300 transition-colors">
                  SettleWise
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Buildathon 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Autonomous Financial Discrepancy & Recovery Controller
              </p>
            </div>
          </div>

          <div className="md:hidden">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              TRACK 04
            </span>
          </div>
        </div>

        {/* Motto Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Motto: <span className="text-slate-200 font-semibold">AI Investigates.</span> <span className="text-emerald-400 font-semibold">Rules Authorize.</span></span>
        </div>

        {/* Operational Toolbar */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          
          <button
            onClick={onOpenHonestExceptions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 border border-amber-500/25 text-xs font-medium transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Honest Exceptions</span>
            <span className="bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
              {honestExceptionsCount}
            </span>
          </button>

          <button
            onClick={onOpenRecovery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-xs font-medium transition-all"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Money Recovery</span>
          </button>

          <button
            onClick={onOpenPolicy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Policy Rules</span>
          </button>

          <button
            onClick={onRunReplay}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Replay (50+ Batch)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
