import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  SlidersHorizontal,
  FileText,
  Lock,
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { formatINR } from '../lib/calculations';
import { FinancialPlan } from '../types';

interface LandingHeroProps {
  onStartPlanning: () => void;
  onExploreDemo: () => void;
  onOpenAiAssistant: () => void;
  plan: FinancialPlan;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartPlanning,
  onExploreDemo,
  onOpenAiAssistant,
  plan,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'salary' | 'runway' | 'sip'>('salary');

  const surplus = plan.monthlyTakeHome - (plan.essentialExpenses + plan.optionalExpenses + plan.existingCommitments);
  const runwayMonths = plan.essentialExpenses > 0 ? (plan.currentEmergencySavings / plan.essentialExpenses).toFixed(1) : '0';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-[#fbfbf9] to-slate-50/50 pt-8 pb-16 border-b border-slate-200/70">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-teal-100 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Team Dominion & Official Problem Statement Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-bold shadow-2xs mb-5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Team Dominion Presents</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-700">Official Problem Statement: Help new employees plan savings, SIPs and investment allocation.</span>
          </div>

          {/* Main Headline & Value Proposition */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.12]">
            Know your salary.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Protect your future.
            </span>{' '}
            Plan your next move.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
            The personal finance operating system tailored specifically for your first paycheck.
            Master take-home cash flow, calculate job-loss survival runways, simulate life curveballs,
            and build disciplined wealth through automated SIPs.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
            <button
              onClick={onStartPlanning}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <span>Build My Salary Plan</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300/80 shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Explore Interactive Demo ({formatINR(plan.monthlyTakeHome)}/mo)</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm border border-teal-200 transition-all active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Ask AI Advisor</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>No bank passwords or OTPs required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Transparent mathematical formulas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              <span>Printable First-Salary Flight Plan report</span>
            </div>
          </div>
        </div>

        {/* Premium Interactive Product Preview Card */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden">
          {/* Card Top Bar with Interactive Toggle Tabs */}
          <div className="bg-slate-50/90 px-6 py-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-slate-700 ml-2">Live Plan Engine Preview</span>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setActivePreviewTab('salary')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activePreviewTab === 'salary'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Salary Cash Flow
              </button>
              <button
                onClick={() => setActivePreviewTab('runway')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activePreviewTab === 'runway'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Job-Loss Runway
              </button>
              <button
                onClick={() => setActivePreviewTab('sip')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activePreviewTab === 'sip'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SIP Compounding
              </button>
            </div>
          </div>

          {/* Card Dynamic Content */}
          <div className="p-6">
            {activePreviewTab === 'salary' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Take-Home Inflow
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(plan.monthlyTakeHome)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">In-hand credited after EPF & TDS</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Living Outflows
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(plan.essentialExpenses + plan.optionalExpenses)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Needs: {formatINR(plan.essentialExpenses)} • Wants: {formatINR(plan.optionalExpenses)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                    Monthly Free Surplus
                  </span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    +{formatINR(surplus)}
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">
                    {Math.round((surplus / plan.monthlyTakeHome) * 100)}% available savings rate
                  </span>
                </div>
              </div>
            )}

            {activePreviewTab === 'runway' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Liquid Buffer
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(plan.currentEmergencySavings)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Instant-access savings & FDs</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Essential Burn Rate
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(plan.essentialExpenses)}/mo
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Survival costs if salary drops to zero</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">
                    Calculated Runway
                  </span>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {runwayMonths} Months
                  </div>
                  <span className="text-[11px] text-amber-800 mt-1 block font-semibold">
                    ~{Math.round(Number(runwayMonths) * 30.4)} days of coverage
                  </span>
                </div>
              </div>
            )}

            {activePreviewTab === 'sip' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Monthly Contribution
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(plan.sipMonthlyAmount)}/mo
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Automated index investment</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    10-Year Invested
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(plan.sipMonthlyAmount * 120)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Total principal deposited</span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider block">
                    10Y Projected Wealth
                  </span>
                  <div className="text-2xl font-black text-indigo-900 mt-1">
                    {formatINR(2300387, true)}
                  </div>
                  <span className="text-[11px] text-indigo-700 mt-1 block font-semibold">
                    At 12% benchmark index compounding
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How FirstSalary OS Works (3 Step Pipeline) */}
        <div className="mt-14 max-w-4xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              How FirstSalary OS Works
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              A 3-step structured system built for your first career years
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-800 font-black flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Structure Take-Home Pay</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Separate essential survival needs (rent, groceries) from lifestyle spending (dining out, OTT)
                and uncover your real free cash flow.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-800 font-black flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Stress-Test Emergencies</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simulate layoffs, probation salary cuts, and surprise ₹8,000 to ₹50,000 shocks before they occur.
                Know your exact days of runway.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-800 font-black flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Execute Your Flight Plan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive transparent allocation guidelines, launch SIP projections, get AI guidance, and generate
                a printable executive financial roadmap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
