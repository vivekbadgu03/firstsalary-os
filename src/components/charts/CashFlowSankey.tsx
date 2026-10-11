import React from 'react';
import { formatINR } from '../../lib/calculations';

interface CashFlowSankeyProps {
  takeHome: number;
  essentials: number;
  optional: number;
  commitments: number;
  surplus: number;
  isDeficit: boolean;
}

export const CashFlowSankey: React.FC<CashFlowSankeyProps> = ({
  takeHome,
  essentials,
  optional,
  commitments,
  surplus,
  isDeficit,
}) => {
  const safeTakeHome = Math.max(1, takeHome);
  const totalOutflow = essentials + optional + commitments;

  const essentialsPct = Math.round((essentials / safeTakeHome) * 100);
  const optionalPct = Math.round((optional / safeTakeHome) * 100);
  const commitmentsPct = Math.round((commitments / safeTakeHome) * 100);
  const surplusPct = isDeficit ? 0 : Math.round((surplus / safeTakeHome) * 100);

  return (
    <div className="space-y-4">
      {/* Stream Flow Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          <span>Income Inflow: {formatINR(takeHome)}</span>
          <span className={isDeficit ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
            {isDeficit ? `Deficit: -${formatINR(Math.abs(surplus))}` : `Free Cash: +${formatINR(surplus)}`}
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="h-5 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner border border-slate-200/60 p-0.5">
          <div
            style={{ width: `${Math.min(100, essentialsPct)}%` }}
            className="h-full bg-slate-800 rounded-l-lg transition-all"
            title={`Needs (Essentials): ${formatINR(essentials)} (${essentialsPct}%)`}
          />
          <div
            style={{ width: `${Math.min(100, optionalPct)}%` }}
            className="h-full bg-amber-400 transition-all"
            title={`Wants (Discretionary): ${formatINR(optional)} (${optionalPct}%)`}
          />
          {commitments > 0 && (
            <div
              style={{ width: `${Math.min(100, commitmentsPct)}%` }}
              className="h-full bg-indigo-400 transition-all"
              title={`Commitments (EMIs): ${formatINR(commitments)} (${commitmentsPct}%)`}
            />
          )}
          {!isDeficit && surplusPct > 0 && (
            <div
              style={{ width: `${Math.min(100, surplusPct)}%` }}
              className="h-full bg-emerald-500 rounded-r-lg transition-all"
              title={`Surplus Cash Flow: ${formatINR(surplus)} (${surplusPct}%)`}
            />
          )}
        </div>
      </div>

      {/* Itemized Legend Stream Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
            <span className="font-semibold text-[11px]">Living Needs</span>
          </div>
          <div className="mt-1 font-bold text-slate-900">{formatINR(essentials)}</div>
          <span className="text-[10px] text-slate-500">{essentialsPct}% of salary</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="font-semibold text-[11px]">Lifestyle Wants</span>
          </div>
          <div className="mt-1 font-bold text-slate-900">{formatINR(optional)}</div>
          <span className="text-[10px] text-slate-500">{optionalPct}% of salary</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
            <span className="font-semibold text-[11px]">Commitments</span>
          </div>
          <div className="mt-1 font-bold text-slate-900">{formatINR(commitments)}</div>
          <span className="text-[10px] text-slate-500">{commitmentsPct}% of salary</span>
        </div>

        <div className={`p-2.5 rounded-xl border ${isDeficit ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isDeficit ? 'bg-rose-600' : 'bg-emerald-500'}`} />
            <span className={`font-semibold text-[11px] ${isDeficit ? 'text-rose-800' : 'text-emerald-800'}`}>
              {isDeficit ? 'Monthly Deficit' : 'Free Surplus'}
            </span>
          </div>
          <div className={`mt-1 font-bold ${isDeficit ? 'text-rose-700' : 'text-emerald-700'}`}>
            {formatINR(surplus)}
          </div>
          <span className={`text-[10px] ${isDeficit ? 'text-rose-600 font-semibold' : 'text-emerald-600'}`}>
            {isDeficit ? 'Action Required' : `${surplusPct}% savings rate`}
          </span>
        </div>
      </div>
    </div>
  );
};
