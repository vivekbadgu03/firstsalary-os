import React, { useState } from 'react';
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Scissors,
  SplitSquareVertical,
} from 'lucide-react';
import { FinancialPlan } from '../types';
import { calculateCashFlow, calculateEmergencyRunway, formatINR } from '../lib/calculations';
import { ActiveTab } from './Navbar';

interface EmergencyBudgetModeProps {
  plan: FinancialPlan;
  onUpdatePlan: (plan: FinancialPlan) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const EmergencyBudgetMode: React.FC<EmergencyBudgetModeProps> = ({
  plan,
  onUpdatePlan,
  setActiveTab,
}) => {
  // Temporary simulation parameters
  const [incomeCutPct, setIncomeCutPct] = useState<number>(plan.emergencyIncomeReductionPct || 100); // 100 = 0 income
  const [discretionaryCutPct, setDiscretionaryCutPct] = useState<number>(plan.emergencyDiscretionaryCutPct || 80);

  // Itemized discretionary cuts
  const [cutDining, setCutDining] = useState<boolean>(true);
  const [cutSubs, setCutSubs] = useState<boolean>(true);
  const [cutShopping, setCutShopping] = useState<boolean>(true);
  const [cutLeisure, setCutLeisure] = useState<boolean>(true);

  // Normal calculations
  const normalCashFlow = calculateCashFlow(
    plan.monthlyTakeHome,
    plan.essentialExpenses,
    plan.optionalExpenses,
    plan.existingCommitments
  );
  const normalRunway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    plan.essentialExpenses,
    0
  );

  // Simulated Emergency calculations
  const simulatedTakeHome = Math.round(plan.monthlyTakeHome * (1 - incomeCutPct / 100));

  // Compute itemized reduced optional expenses
  const origDining = plan.optionalBreakdown?.diningOut || 4000;
  const origSubs = plan.optionalBreakdown?.subscriptions || 1200;
  const origShopping = plan.optionalBreakdown?.shoppingLeisure || 3500;
  const origLeisure = plan.optionalBreakdown?.travelEntertainment || 1500;

  const simDining = cutDining ? Math.round(origDining * 0.2) : origDining; // 80% cut
  const simSubs = cutSubs ? 0 : origSubs; // 100% pause on OTT
  const simShopping = cutShopping ? 0 : origShopping; // 100% freeze on shopping
  const simLeisure = cutLeisure ? 0 : origLeisure;

  const simulatedOptional = simDining + simSubs + simShopping + simLeisure;

  const emergencyCashFlow = calculateCashFlow(
    simulatedTakeHome,
    plan.essentialExpenses,
    simulatedOptional,
    plan.existingCommitments
  );

  // In a true emergency, total burn rate = essentials + simulated trimmed optional + commitments
  const emergencyTotalBurnRate = plan.essentialExpenses + simulatedOptional + plan.existingCommitments;
  const emergencyRunway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    emergencyTotalBurnRate > 0 ? emergencyTotalBurnRate : plan.essentialExpenses,
    0
  );

  // Extra days gained by trimming optional spending
  const runwayWithoutTrimming = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    plan.essentialExpenses + plan.optionalExpenses + plan.existingCommitments,
    0
  );
  const daysGained = Math.max(0, emergencyRunway.runwayDays - runwayWithoutTrimming.runwayDays);

  const handleApplyEmergencyMode = () => {
    onUpdatePlan({
      ...plan,
      emergencyBudgetActive: true,
      emergencyIncomeReductionPct: incomeCutPct,
      emergencyDiscretionaryCutPct: discretionaryCutPct,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleExitEmergencyMode = () => {
    onUpdatePlan({
      ...plan,
      emergencyBudgetActive: false,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60">
              <Flame className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Emergency Budget Mode (Defensive Crisis Planning)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Prepare for income loss, layoffs, or salary cuts. See how freezing non-essential lifestyle
            spending extends your survival runway by weeks or months without high-interest debt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plan.emergencyBudgetActive ? (
            <button
              onClick={handleExitEmergencyMode}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Exit Emergency Mode
            </button>
          ) : (
            <button
              onClick={handleApplyEmergencyMode}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs active:scale-95"
            >
              Activate Emergency Mode in Plan
            </button>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Drop Simulator Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-600" />
            <span>Simulate Income Interruption</span>
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Income Reduction:</span>
              <span className="font-bold text-rose-700">{incomeCutPct}% reduction</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={incomeCutPct}
              onChange={(e) => setIncomeCutPct(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0% (Full Pay)</span>
              <span>50% (Half Salary)</span>
              <span>100% (Complete Layoff)</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Simulated Monthly Take-Home:</span>
              <strong className="text-slate-900 text-sm">{formatINR(simulatedTakeHome)}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Monthly Deficit / Burn:</span>
              <strong className="text-rose-600 text-sm">
                {emergencyCashFlow.isDeficit
                  ? `-${formatINR(Math.abs(emergencyCashFlow.surplusCashFlow))}/mo`
                  : `+${formatINR(emergencyCashFlow.surplusCashFlow)}/mo`}
              </strong>
            </div>
          </div>
        </div>

        {/* Discretionary Spending Defense Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Scissors className="h-4 w-4 text-emerald-600" />
            <span>Freeze Discretionary Lifestyle Wants</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div
              onClick={() => setCutDining(!cutDining)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-800">Dining Out & Swiggy/Zomato</span>
                <p className="text-[11px] text-slate-500">
                  Cut from {formatINR(origDining)} to {formatINR(simDining)} (-80%)
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  cutDining ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cutDining ? 'FROZEN' : 'ACTIVE'}
              </span>
            </div>

            <div
              onClick={() => setCutSubs(!cutSubs)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-800">OTT & Subscriptions</span>
                <p className="text-[11px] text-slate-500">
                  Pause Netflix, Spotify, Gym ({formatINR(origSubs)} → {formatINR(simSubs)})
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  cutSubs ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cutSubs ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>

            <div
              onClick={() => setCutShopping(!cutShopping)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-800">Shopping & Non-essential Purchases</span>
                <p className="text-[11px] text-slate-500">
                  Hold electronics, clothing ({formatINR(origShopping)} → {formatINR(simShopping)})
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  cutShopping ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cutShopping ? 'FROZEN' : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Normal vs Emergency Budget */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <SplitSquareVertical className="h-5 w-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Side-by-Side Comparison: Normal vs Emergency Defense
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Normal Mode Column */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Normal Operating Plan
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Baseline
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Monthly Salary:</span>
                <strong className="text-slate-900">{formatINR(plan.monthlyTakeHome)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Essential Needs:</span>
                <strong className="text-slate-900">{formatINR(plan.essentialExpenses)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discretionary Wants:</span>
                <strong className="text-slate-900">{formatINR(plan.optionalExpenses)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prior Commitments:</span>
                <strong className="text-slate-900">{formatINR(plan.existingCommitments)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                <span>Monthly Cash Flow:</span>
                <span className={normalCashFlow.isDeficit ? 'text-rose-600' : 'text-emerald-700'}>
                  {formatINR(normalCashFlow.surplusCashFlow)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Survival Runway:</span>
                <span className="text-slate-900">
                  {normalRunway.runwayMonths.toFixed(1)} Months ({normalRunway.runwayDays} Days)
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Defense Mode Column */}
          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-800">
                Emergency Defense Plan
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                Defensive
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Simulated Salary:</span>
                <strong className="text-slate-900">{formatINR(simulatedTakeHome)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Essential Needs:</span>
                <strong className="text-slate-900">{formatINR(plan.essentialExpenses)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trimmed Wants:</span>
                <strong className="text-emerald-700 font-bold">{formatINR(simulatedOptional)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prior Commitments:</span>
                <strong className="text-slate-900">{formatINR(plan.existingCommitments)}</strong>
              </div>
              <div className="pt-2 border-t border-rose-200 flex justify-between font-bold">
                <span>Monthly Deficit:</span>
                <span className="text-rose-700 font-bold">
                  {emergencyCashFlow.isDeficit
                    ? `-${formatINR(Math.abs(emergencyCashFlow.surplusCashFlow))}`
                    : `+${formatINR(emergencyCashFlow.surplusCashFlow)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Extended Runway:</span>
                <span className="text-emerald-800">
                  {emergencyRunway.runwayMonths.toFixed(1)} Months ({emergencyRunway.runwayDays} Days)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Life Extension Metric Callout */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <span className="font-bold">Survival Extension Unlocked:</span>
              <p>
                Trimming lifestyle subscriptions and non-essential dining buys you an additional{' '}
                <strong>+{daysGained} days</strong> of living expenses before touching high-cost loans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
