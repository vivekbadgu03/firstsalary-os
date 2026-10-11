import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { FinancialPlan } from '../types';
import { calculateEmergencyRunway, formatINR } from '../lib/calculations';
import { ActiveTab } from './Navbar';

interface JobLossCalculatorProps {
  plan: FinancialPlan;
  onUpdatePlan: (plan: FinancialPlan) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const JobLossCalculator: React.FC<JobLossCalculatorProps> = ({
  plan,
  onUpdatePlan,
  setActiveTab,
}) => {
  const [savings, setSavings] = useState<number>(plan.currentEmergencySavings);
  const [essentialExpense, setEssentialExpense] = useState<number>(plan.essentialExpenses);
  const [oneTimeCost, setOneTimeCost] = useState<number>(plan.emergencyOneTimeShock || 0);

  // Runway calculation using pure contract
  const runway = calculateEmergencyRunway(savings, essentialExpense, oneTimeCost);

  // Normal runway without shock for comparison
  const normalRunway = calculateEmergencyRunway(savings, essentialExpense, 0);

  const handleApplyToPlan = () => {
    onUpdatePlan({
      ...plan,
      currentEmergencySavings: savings,
      essentialExpenses: essentialExpense,
      emergencyOneTimeShock: oneTimeCost,
      updatedAt: new Date().toISOString(),
    });
  };

  // Runway Gauge visual percentage (capped at 12 months for visual scale)
  const gaugePercent = Math.min(100, Math.round((runway.runwayMonths / 6) * 100));

  return (
    <div className="space-y-6">
      {/* Feature Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Job-Loss Survival Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Simulate what happens if your monthly income drops to zero tomorrow. Know exactly how many months and
            days your emergency cash reserves can cover essential rent, food, and bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('emergency_budget')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Enter Emergency Budget Mode →
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-600" />
            <span>Survival Assumptions</span>
          </h3>

          {/* Current Emergency Savings */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Available Liquid Emergency Savings
              </label>
              <span className="text-xs font-bold text-slate-900">{formatINR(savings)}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={savings}
                onChange={(e) => setSavings(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:border-amber-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Liquid funds in your savings account or instant-access fixed deposits.
            </p>
          </div>

          {/* Essential Monthly Expenses Baseline */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Essential Monthly Expenses (Burn Rate)
              </label>
              <span className="text-xs font-bold text-slate-900">{formatINR(essentialExpense)}/mo</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={essentialExpense}
                onChange={(e) => setEssentialExpense(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:border-amber-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Non-negotiable living costs: rent, utilities, food groceries, and medicines.
            </p>
          </div>

          {/* Simulated One-Time Emergency Shock */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Simulated One-Time Shock (e.g. Hospital / Deposit)
              </label>
              <span className="text-xs font-bold text-rose-600">
                {oneTimeCost > 0 ? `-${formatINR(oneTimeCost)}` : '₹0'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={oneTimeCost}
              onChange={(e) => setOneTimeCost(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0 (No Shock)</span>
              <span>₹50,000 (Medical)</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          {/* Preset Buttons for Quick Simulation */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Shock Scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setOneTimeCost(0)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  oneTimeCost === 0
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Zero Shock
              </button>
              <button
                type="button"
                onClick={() => setOneTimeCost(25000)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  oneTimeCost === 25000
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ₹25,000 (Laptop Crash)
              </button>
              <button
                type="button"
                onClick={() => setOneTimeCost(50000)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  oneTimeCost === 50000
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ₹50,000 (Medical Bill)
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={handleApplyToPlan}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            >
              Update Primary Plan with These Numbers
            </button>
          </div>
        </div>

        {/* Right Output & Diagnostics Card (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          {/* Main Runway Indicator Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              runway.statusColor === 'emerald'
                ? 'bg-emerald-50/60 border-emerald-200'
                : runway.statusColor === 'amber'
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-rose-50/60 border-rose-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    runway.statusColor === 'emerald'
                      ? 'bg-emerald-100 text-emerald-800'
                      : runway.statusColor === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {runway.statusLabel}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                  <span>{runway.runwayMonths.toFixed(1)}</span>
                  <span className="text-base font-semibold text-slate-600">Months</span>
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs text-slate-500 font-medium">Approximate Runway:</div>
                <div className="text-2xl font-bold text-slate-800 flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>{runway.runwayDays} Days</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Buffer remaining: <strong>{formatINR(runway.adjustedSavings)}</strong>
                </div>
              </div>
            </div>

            {/* Visual Runway Progress Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>0 Months</span>
                <span>3 Months (Recommended)</span>
                <span>6+ Months (Defensive)</span>
              </div>
              <div className="h-3 w-full bg-white/80 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  style={{ width: `${gaugePercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    runway.statusColor === 'emerald'
                      ? 'bg-emerald-600'
                      : runway.statusColor === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Plain Language Explanation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <span className="font-bold text-slate-900 block text-xs">
              Survival Diagnosis:
            </span>
            <p className="leading-relaxed">{runway.explanation}</p>
          </div>

          {/* Step-by-Step Survival Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Immediate Defensive Steps
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>1. Freeze Discretionary Wants</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Instantly pause dining out, OTT subs, and recreational spending to conserve cash.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>2. Liquid Fund Protection</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Keep emergency savings in instant-redemption liquid funds or sweep-in FDs, never locked stocks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>3. Target 3 Months First</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Reach 3 months ({formatINR(essentialExpense * 3)}) before expanding into volatile equity SIPs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>4. Activate Health Insurance</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Do not rely solely on corporate health cover. Sudden job loss leaves you uninsured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
