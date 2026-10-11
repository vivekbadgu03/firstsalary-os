import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import { FinancialPlan } from '../types';
import { calculateSipProjection, formatINR } from '../lib/calculations';

interface SipCalculatorProps {
  plan: FinancialPlan;
  onUpdatePlan: (plan: FinancialPlan) => void;
}

export const SipCalculator: React.FC<SipCalculatorProps> = ({ plan, onUpdatePlan }) => {
  const [monthlyAmount, setMonthlyAmount] = useState<number>(plan.sipMonthlyAmount || 8000);
  const [returnRate, setReturnRate] = useState<number>(plan.sipExpectedReturnRate || 12);
  const [durationYears, setDurationYears] = useState<number>(plan.sipDurationYears || 10);

  const sip = calculateSipProjection(monthlyAmount, returnRate, durationYears);

  const handleApplyToPlan = () => {
    onUpdatePlan({
      ...plan,
      sipMonthlyAmount: monthlyAmount,
      sipExpectedReturnRate: returnRate,
      sipDurationYears: durationYears,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              SIP Compounding Wealth Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Understand how disciplined monthly index investing compounds over 5 to 20 years. Powered by
            transparent end-of-month compounding formulas.
          </p>
        </div>

        <button
          onClick={handleApplyToPlan}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors self-start sm:self-auto active:scale-95"
        >
          Update SIP in My Flight Plan
        </button>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm">SIP Assumptions</h3>

          {/* Monthly Investment */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Monthly Contribution:</span>
              <span className="font-bold text-emerald-700">{formatINR(monthlyAmount)}/mo</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹1,000</span>
              <span>₹25,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Expected Annual Return Rate */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Expected Annual Return Rate:</span>
              <span className="font-bold text-slate-900">{returnRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="0"
              max="18"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            {/* Quick Benchmark Chips */}
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setReturnRate(8)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  returnRate === 8
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                8% (Debt/Conservative)
              </button>
              <button
                type="button"
                onClick={() => setReturnRate(12)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  returnRate === 12
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                12% (Nifty 50 Index)
              </button>
              <button
                type="button"
                onClick={() => setReturnRate(15)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  returnRate === 15
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                15% (Aggressive Equity)
              </button>
            </div>
          </div>

          {/* Investment Horizon Years */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Investment Horizon:</span>
              <span className="font-bold text-slate-900">{durationYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Year</span>
              <span>10 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Formula Rationale Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Calculation Method:</span>
            <p>
              Standard end-of-month compounding formula:{' '}
              <code>FV = P × [((1 + r)^n − 1) / r]</code>, where monthly rate <code>r = rate / 1200</code>.
            </p>
          </div>
        </div>

        {/* Projection Outputs Card (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm">Estimated Wealth Trajectory</h3>

          {/* Wealth Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Invested
              </span>
              <div className="text-xl font-bold text-slate-900">
                {formatINR(sip.totalInvested)}
              </div>
              <span className="text-[10px] text-slate-500">Over {durationYears} years</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Estimated Wealth Gain
              </span>
              <div className="text-xl font-black text-emerald-700">
                +{formatINR(sip.wealthGain)}
              </div>
              <span className="text-[10px] text-emerald-700">
                {sip.totalInvested > 0
                  ? `+${Math.round((sip.wealthGain / sip.totalInvested) * 100)}% compound return`
                  : '0%'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Projected Total Value
              </span>
              <div className="text-xl font-black text-emerald-400">
                {formatINR(sip.projectedWealth)}
              </div>
              <span className="text-[10px] text-slate-300">
                {formatINR(sip.projectedWealth, true)}
              </span>
            </div>
          </div>

          {/* Interactive Progression Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Milestone Progression:</span>
              <span className="text-[11px] text-slate-500">Breakdown across key horizons</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Horizon</th>
                    <th className="py-2 px-3">Total Invested</th>
                    <th className="py-2 px-3">Estimated Wealth</th>
                    <th className="py-2 px-3 text-right">Wealth Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sip.yearlyBreakdown
                    .filter((item) => item.year === 1 || item.year === 3 || item.year === 5 || item.year === 10 || item.year === durationYears)
                    .map((item) => (
                      <tr key={item.year} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-semibold text-slate-800">Year {item.year}</td>
                        <td className="py-2 px-3 text-slate-600">{formatINR(item.invested)}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{formatINR(item.futureValue)}</td>
                        <td className="py-2 px-3 font-semibold text-emerald-700 text-right">
                          +{formatINR(item.returns)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Projections are educational mathematical estimates using monthly compounding. Equity returns do not
              grow in a straight line; actual investment performance will fluctuate with market volatility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
