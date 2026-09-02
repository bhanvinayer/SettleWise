import React, { useState } from 'react';
import { ExceptionCase, ExceptionCategory } from '../types/settlewise';
import { Search, Filter, ShieldCheck, AlertTriangle, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';

interface ExceptionQueueProps {
  cases: ExceptionCase[];
  onSelectCase: (exceptionCase: ExceptionCase) => void;
  selectedCategoryFilter: string | null;
  onClearFilter: () => void;
}

export const ExceptionQueue: React.FC<ExceptionQueueProps> = ({
  cases,
  onSelectCase,
  selectedCategoryFilter,
  onClearFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: { label: string; value: string }[] = [
    { label: 'All Cases', value: 'ALL' },
    { label: 'Partial Refunds', value: 'PARTIAL_REFUND' },
    { label: 'Duplicates (High Risk)', value: 'DUPLICATE_CANDIDATE' },
    { label: 'Timing Shifts', value: 'TIMING_MISMATCH' },
    { label: 'Fee Discrepancies', value: 'FEE_MISMATCH' },
    { label: 'Recoveries', value: 'RECOVERING' },
    { label: 'Blocked / Escalated', value: 'BLOCKED' },
  ];

  const filteredCases = cases.filter((c) => {
    // Check search query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(query) ||
      c.merchantName.toLowerCase().includes(query) ||
      c.paymentId.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Check category filter
    const cat = selectedCategoryFilter || selectedCategory;
    if (cat === 'ALL') return true;
    if (cat === 'RECOVERING') return c.status === 'RECOVERING' || Boolean(c.recoveryAmount);
    if (cat === 'BLOCKED') return c.status === 'BLOCKED' || c.authorizedAction === 'BLOCK';
    return c.category === (cat as ExceptionCategory);
  });

  return (
    <div className="surface-card rounded-2xl border border-slate-800/80 p-4 lg:p-6 shadow-sm">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
            <span>Exception Investigation Queue</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {filteredCases.length} Exceptions
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial discrepancy queue processed by SettleWise Tri-Agent verification network
          </p>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Merchant, UTR..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          {selectedCategoryFilter && (
            <button
              onClick={onClearFilter}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono flex items-center gap-1 hover:bg-amber-500/20"
            >
              Clear Filter: {selectedCategoryFilter}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {categories.map((cat) => {
          const isActive = (selectedCategoryFilter || selectedCategory) === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => {
                if (selectedCategoryFilter) onClearFilter();
                setSelectedCategory(cat.value);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/40'
              }`}
            >
              <Filter className="w-3 h-3 opacity-60" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Exception Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400 bg-slate-900/40">
              <th className="py-2.5 px-3">Exception ID</th>
              <th className="py-2.5 px-3">Merchant</th>
              <th className="py-2.5 px-3">Payment ₹</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Urgency</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Authorized Decision</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs font-sans">
            {filteredCases.map((c) => {
              const isBlocked = c.authorizedAction === 'BLOCK' || c.status === 'BLOCKED';
              const isRecovery = c.authorizedAction === 'RECOVERY_CASE' || Boolean(c.recoveryAmount);
              const isResolved = c.authorizedAction === 'AUTO_RESOLVE' || c.status === 'RESOLVED';

              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-slate-800/30 transition-all cursor-pointer group"
                >
                  {/* Exception ID */}
                  <td className="py-3 px-3 font-mono font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1.5">
                    <span>{c.id}</span>
                    {isRecovery && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </td>

                  {/* Merchant Name */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{c.merchantName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{c.paymentId}</div>
                  </td>

                  {/* Payment Amount */}
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    ₹{c.paymentAmount.toLocaleString('en-IN')}
                  </td>

                  {/* Category Badge */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
                      {c.category.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Urgency */}
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        c.urgency === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : c.urgency === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      {c.urgency}
                    </span>
                  </td>

                  {/* AI Confidence Bar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            c.aiConfidence >= 95
                              ? 'bg-emerald-400'
                              : c.aiConfidence >= 80
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.aiConfidence}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-300">
                        {c.aiConfidence.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Authorized Decision */}
                  <td className="py-3 px-3">
                    {isResolved && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        AUTO RESOLVED
                      </span>
                    )}

                    {isBlocked && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono font-semibold flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        BLOCKED / REVIEW
                      </span>
                    )}

                    {isRecovery && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1 w-fit">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        RECOVERY CASE
                      </span>
                    )}

                    {!isResolved && !isBlocked && !isRecovery && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-semibold flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        HUMAN REVIEW
                      </span>
                    )}
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-3 text-right">
                    <button className="p-1 rounded-md bg-slate-900 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white transition-all border border-slate-800 group-hover:border-indigo-500">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
