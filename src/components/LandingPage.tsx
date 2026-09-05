import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Play,
  AlertTriangle,
  DollarSign,
  Cpu,
  Shield,
  Zap,
  Sparkles,
  Sliders,
  Database,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: (initialAction?: 'DASHBOARD' | 'REPLAY' | 'HONEST') => void;
}

interface SimulatedScenario {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  rootAgent: string;
  merchantAgent: string;
  taxAgent: string;
  auditorDecision: 'AUTHORIZED' | 'BLOCKED' | 'RECOVERY';
  confidence: number;
  unexplainedDelta: number;
}

const SCENARIOS: SimulatedScenario[] = [
  {
    id: 'EXC-84092',
    merchant: 'Zomato Merchant Services',
    amount: 14500,
    category: 'PARTIAL_REFUND',
    rootAgent: 'Isolated ₹1,250 delta in gateway UTR credit vs refund ledger.',
    merchantAgent: 'Matched 14 historical settlement vectors for Zomato.',
    taxAgent: 'Verified 1.2% MDR slab + 18% GST credit note alignment.',
    auditorDecision: 'AUTHORIZED',
    confidence: 96.8,
    unexplainedDelta: 0
  },
  {
    id: 'EXC-99120',
    merchant: 'Razorpay Synthetic Batch #4',
    amount: 32500,
    category: 'DUPLICATE_CANDIDATE',
    rootAgent: 'Detected duplicate UTR injection attempt across batch.',
    merchantAgent: 'Flagged suspicious timestamp overlap within 12 seconds.',
    taxAgent: 'Fee calculation match confirmed, but duplicate payload detected.',
    auditorDecision: 'BLOCKED',
    confidence: 99.1,
    unexplainedDelta: 3250
  },
  {
    id: 'EXC-77401',
    merchant: 'Swiggy Pay Partner',
    amount: 8900,
    category: 'UNWEBHOOKED_DROP',
    rootAgent: 'Bank ledger credited ₹8,900 but gateway webhook dropped.',
    merchantAgent: 'Verified merchant UTR pattern across ICICI bank feeds.',
    taxAgent: 'Matched 2.0% MDR + GST schedule with 0 unaccounted gap.',
    auditorDecision: 'RECOVERY',
    confidence: 94.2,
    unexplainedDelta: 0
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [simulatedConfidenceThreshold, setSimulatedConfidenceThreshold] = useState(95);
  const [simulatedToleranceDelta, setSimulatedToleranceDelta] = useState(10);

  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveScenarioIdx(prev => (prev + 1) % SCENARIOS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const scenario = SCENARIOS[activeScenarioIdx];
  const calculatedPrecision = Math.min(99.8, Math.max(90.0, 99.4 + (simulatedConfidenceThreshold - 95) * 0.2 - (simulatedToleranceDelta > 20 ? 1.5 : 0))).toFixed(1);
  const calculatedBlockedCount = simulatedConfidenceThreshold >= 95 ? 18 : 6;

  return (
    <div className="landing-page min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--accent)] selection:text-white flex flex-col relative overflow-hidden">
      {/* Subtle Background Glow Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/10 via-indigo-900/5 to-transparent blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-emerald-500/5 blur-3xl pointer-events-none" />
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      {/* Top Banner Bar */}
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-2 px-4 text-center text-xs font-mono text-indigo-300 flex items-center justify-center gap-2 z-50">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>Razorpay Buildathon 2026 — Track 04 Submission (AI Finance Controller)</span>
        <button onClick={() => onLaunchApp('DASHBOARD')} className="ml-2 underline font-semibold text-[var(--text)] hover:text-indigo-200">Launch Terminal →</button>
      </div>
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[var(--surface-bg)]/90 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">SettleWise</span>
              <span className="ml-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Track 04</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onLaunchApp('HONEST')} className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-all font-mono px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Exceptions</span>
            </button>
            <button onClick={() => onLaunchApp('DASHBOARD')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all group">
              <span>Launch Controller Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-6 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>RECONCILE → INVESTIGATE → CHALLENGE → SIMULATE → AUTHORIZE → RECOVER</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.12] mb-6 font-sans">
          The Finance Controller That Tries to Prove Itself Wrong.
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          <strong className="text-slate-200">SettleWise</strong> asks a CFO-grade question: <em className="text-indigo-300 font-medium">“Before AI touches the books, can I prove its decision is safe—and what happens to our capital if I change our policy controls?”</em>
          <span className="block mt-2 font-mono text-xs text-indigo-400 font-semibold uppercase tracking-wider">“AI Proposes. AI Challenges. Rules Decide.”</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <button onClick={() => onLaunchApp('DASHBOARD')} className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer">
            <span>Launch Financial Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => onLaunchApp('REPLAY')} className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Play className="w-4 h-4 fill-current text-indigo-400" />
            <span>Run Synthetic Benchmark (50+ Batch)</span>
          </button>
        </div>
        {/* Dynamic Telemetry Card */}
        <div className="max-w-5xl mx-auto rounded-2xl surface-card border border-slate-800/80 p-2 shadow-2xl text-left relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-indigo-500/20 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
          <div className="relative bg-[var(--surface-bg)] rounded-xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="font-mono text-xs text-slate-300 font-semibold flex items-center gap-2">
                  <span>LIVE TRI-AGENT PIPELINE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                {SCENARIOS.map((s, idx) => (
                  <button key={s.id} onClick={() => { setIsAutoCycling(false); setActiveScenarioIdx(idx); }} className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${activeScenarioIdx === idx ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                    Case {s.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Merchant: <strong className="text-white font-sans">{scenario.merchant}</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Category: <strong className="text-indigo-300">{scenario.category}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Payment: <strong className="text-white font-mono">₹{scenario.amount.toLocaleString('en-IN')}</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Unexplained: <strong className={scenario.unexplainedDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}>₹{scenario.unexplainedDelta}</strong></span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Agent 1 */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 font-bold uppercase">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Agent 01: Delta Diagnostic</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-semibold text-slate-200 text-xs">Root Cause Sub-Agent</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{scenario.rootAgent}</p>
              </div>
              {/* Agent 2 */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 font-bold uppercase">
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Agent 02: Merchant Memory</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-semibold text-slate-200 text-xs">Merchant Context Sub-Agent</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{scenario.merchantAgent}</p>
              </div>
              {/* Agent 3 */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  <span className="flex items-center gap-1"><FileCheck className="w-3 h-3" /> Agent 03: Fee & Tax Matcher</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-semibold text-slate-200 text-xs">GST & MDR Schedule Matcher</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{scenario.taxAgent}</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-slate-300 font-semibold flex items-center gap-2">
                    <span>Dual-Key Adversarial Gate Telemetry:</span>
                    <span className="text-indigo-400 font-bold">{scenario.confidence}% Confidence</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">Primary hypothesis verified against counterfactual challenger agent.</div>
                </div>
              </div>
              {scenario.auditorDecision === 'AUTHORIZED' && (
                <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AUTHORIZED AUTO-RESOLVE
                </span>
              )}
              {scenario.auditorDecision === 'BLOCKED' && (
                <span className="px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> SAFELY BLOCKED / REVIEW
                </span>
              )}
              {scenario.auditorDecision === 'RECOVERY' && (
                <span className="px-3 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> RECOVERY CASE CREATED
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Interactive Guardrails Policy Simulator Section */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-slate-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Policy Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans leading-tight">Test Deterministic Policy Guardrails in Real Time.</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">In financial operations, LLM confidence alone is insufficient. Adjust the policy guardrail parameters below to observe how SettleWise enforces mathematical safety boundaries.</p>
          </div>
          <div className="lg:col-span-7 surface-card p-6 rounded-2xl border border-slate-800/80 space-y-6">
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Min AI Confidence Required to Auto-Resolve:</span>
                <span className="text-indigo-400 font-bold">{simulatedConfidenceThreshold}%</span>
              </div>
              <input type="range" min="80" max="99" value={simulatedConfidenceThreshold} onChange={e => setSimulatedConfidenceThreshold(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>80% (Permissive)</span>
                <span>95% (Default Recommended)</span>
                <span>99% (Strict)</span>
              </div>
            </div>
            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Max Unexplained Margin Delta Allowed:</span>
                <span className="text-emerald-400 font-bold">₹{simulatedToleranceDelta}</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={simulatedToleranceDelta} onChange={e => setSimulatedToleranceDelta(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
            {/* Live Output Simulation Result */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Simulated Precision</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{calculatedPrecision}%</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Safely Blocked Ambiguities</div>
                <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">{calculatedBlockedCount} Cases</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Deep Dive Architectural Pillars */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-slate-800/60">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 mb-2">Architectural Blueprint</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">5 Layers of SettleWise Engineering</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="surface-card surface-card-hover p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">01</div>
            <h4 className="text-base font-bold text-white">Tri-Agent Decomposition</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Splits diagnostic reasoning across Root Cause, Merchant Context, and Tax & Fee Matcher sub-agents rather than relying on a single prompt.</p>
          </div>
          {/* Pillar 2 */}
          <div className="surface-card surface-card-hover p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">02</div>
            <h4 className="text-base font-bold text-white">Dual-Key Adversarial Gate</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">An independent Adversarial Auditor Agent actively attempts to disprove primary agent conclusions (testing for duplicate payout injection & timing drift).</p>
          </div>
          {/* Pillar 3 */}
          <div className="surface-card surface-card-hover p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">03</div>
            <h4 className="text-base font-bold text-white">Deterministic Rules Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Hard mathematical guardrails (confidence caps, margin deltas, ledger arithmetic checks) govern money movement with zero hallucination risk.</p>
          </div>
          {/* Pillar 4 */}
          <div className="surface-card surface-card-hover p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">04</div>
            <h4 className="text-base font-bold text-white">Synthetic Replay Suite</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Simulate 50 to 10,000 transaction batches with ground truth to measure precision, recall, and exception stopping rates in real time.</p>
          </div>
          {/* Pillar 5 */}
          <div className="surface-card surface-card-hover p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">05</div>
            <h4 className="text-base font-bold text-white">Exception List</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Explicitly isolates ambiguous cases (like duplicate payout candidates) to protect the ledger against double reconciliation errors.</p>
          </div>
          {/* Pillar 6 */}
          <div className="surface-card surface-card-hover p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">06</div>
            <h4 className="text-base font-bold text-white">Money Leakage Recovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Automatically packages dispute claim files for intermediate bank fee deductions and un-webhooked drops to recover leaked capital.</p>
          </div>
        </div>
      </section>
      {/* Bottom CTA Banner */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center">
        <div className="surface-card p-8 sm:p-12 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-sans">Ready to Explore the Controller Terminal?</h3>
            <p className="text-xs sm:text-sm text-slate-400">Run real-time discrepancy investigations across multi-source bank ledgers with SettleWise.</p>
            <div className="pt-2">
              <button onClick={() => onLaunchApp('DASHBOARD')} className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg transition-all group inline-flex items-center gap-2 cursor-pointer">
                <span>Enter Financial Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080b12] py-6 px-6 lg:px-12 mt-auto text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>SettleWise — Razorpay AI Buildathon 2026 | Track 04 — AI Finance Controller</div>
          <div>Principle: <strong className="text-slate-300">AI Investigates.</strong> <strong className="text-emerald-400">Rules Authorize.</strong></div>
        </div>
      </footer>
    </div>
  );
};
