import React, { useState } from 'react';
import {
  LifeBuoy,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building2,
  Stethoscope,
  Briefcase,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { FinancialPlan, LifeScenario } from '../types';
import { calculateCashFlow, calculateEmergencyRunway, formatINR } from '../lib/calculations';
import { ActiveTab } from './Navbar';

interface WhatIfScenariosProps {
  plan: FinancialPlan;
  setActiveTab: (tab: ActiveTab) => void;
  onUpdatePlan: (plan: FinancialPlan) => void;
}

export const SCENARIOS: LifeScenario[] = [
  {
    id: 'layoff',
    title: '🛑 Sudden Layoff / Zero Income',
    icon: 'Briefcase',
    description: 'Company downsizing or probation termination leaves you with ₹0 monthly salary for 3 to 6 months.',
    incomeMultiplier: 0,
    essentialExpenseDelta: 0,
    oneTimeCost: 0,
    recommendedActions: [
      'Immediately freeze all optional lifestyle spending (Swiggy, OTT, shopping).',
      'Pause all active equity SIPs to preserve bank balance liquidity.',
      'Rely strictly on your emergency fund for essential rent and food.',
      'File for EPF non-employment advance only as a secondary resort after 2 months.',
    ],
  },
  {
    id: 'salary_cut',
    title: '📉 25% Salary Reduction',
    icon: 'TrendingDown',
    description: 'Macroeconomic downturn or startup restructuring enforces an immediate 25% pay cut for the next 6 months.',
    incomeMultiplier: 0.75,
    essentialExpenseDelta: 0,
    oneTimeCost: 0,
    recommendedActions: [
      'Trim discretionary lifestyle budget by at least 50% to maintain positive cash flow.',
      'Reduce monthly SIP amount proportionally instead of stopping it entirely.',
      'Postpone luxury purchase goals (e.g. expensive gadgets or international trips).',
      'Keep essential emergency buffer intact.',
    ],
  },
  {
    id: 'medical_shock',
    title: '🏥 Surprise Medical Emergency (₹60,000)',
    icon: 'Stethoscope',
    description: 'Unplanned hospitalization or medical procedure requires an immediate out-of-pocket ₹60,000 deposit.',
    incomeMultiplier: 1,
    essentialExpenseDelta: 0,
    oneTimeCost: 60000,
    recommendedActions: [
      'Pay from liquid emergency savings rather than revolving credit card debt at 42% APR.',
      'Check if corporate or family health policy allows retroactive reimbursement claims.',
      'Redirect all surplus cash flow for the next 3 months to replenish your safety buffer.',
      'Halt non-essential goal savings until the emergency cushion is restored.',
    ],
  },
  {
    id: 'rent_hike',
    title: '🏙️ Relocating to High-Rent Metro (+₹10,000/mo)',
    icon: 'Building2',
    description: 'Job location shift from hometown/tier-2 to Bengaluru or Mumbai raises monthly rent & commute by ₹10,000.',
    incomeMultiplier: 1,
    essentialExpenseDelta: 10000,
    oneTimeCost: 25000, // Security deposit shortfall
    recommendedActions: [
      'Recalculate your baseline burn rate: higher rent permanently reduces monthly surplus.',
      'Aim to negotiate higher house rent allowance (HRA) or tax benefits with employer.',
      'Adjust SIP amounts down by ₹5,000–₹8,000 until salary increments absorb the cost.',
      'Target a higher absolute emergency fund (e.g. ₹1,20,000 instead of ₹80,000).',
    ],
  },
  {
    id: 'family_support',
    title: '🤝 Monthly Family Support Commitment (+₹8,000/mo)',
    icon: 'HeartHandshake',
    description: 'A parent retires or medical needs arise, requiring regular monthly remittance back home.',
    incomeMultiplier: 1,
    essentialExpenseDelta: 8000,
    oneTimeCost: 0,
    recommendedActions: [
      'Treat family remittance as a non-negotiable essential expense, not a discretionary want.',
      'Prioritize personal emergency fund so you can honor the commitment during your own job transitions.',
      'Review whether parents have dedicated senior health insurance or Ayushman Bharat eligibility.',
      'Rebalance personal discretionary spending to prevent a cash deficit.',
    ],
  },
];

export const WhatIfScenarios: React.FC<WhatIfScenariosProps> = ({
  plan,
  setActiveTab,
  onUpdatePlan,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('layoff');

  const selected = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  // Base plan metrics
  const baseCashFlow = calculateCashFlow(
    plan.monthlyTakeHome,
    plan.essentialExpenses,
    plan.optionalExpenses,
    plan.existingCommitments
  );
  const baseRunway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    plan.essentialExpenses,
    0
  );

  // Scenario metrics
  const scenarioSalary = Math.round(plan.monthlyTakeHome * selected.incomeMultiplier);
  const scenarioEssentials = plan.essentialExpenses + selected.essentialExpenseDelta;
  const scenarioCashFlow = calculateCashFlow(
    scenarioSalary,
    scenarioEssentials,
    plan.optionalExpenses,
    plan.existingCommitments
  );
  const scenarioRunway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    scenarioEssentials,
    selected.oneTimeCost
  );

  const cashFlowDiff = scenarioCashFlow.surplusCashFlow - baseCashFlow.surplusCashFlow;
  const runwayDiff = scenarioRunway.runwayMonths - baseRunway.runwayMonths;

  const handleTestInEmergencyMode = () => {
    onUpdatePlan({
      ...plan,
      emergencyBudgetActive: true,
      emergencyIncomeReductionPct: selected.incomeMultiplier === 0 ? 100 : selected.incomeMultiplier === 0.75 ? 25 : 0,
      emergencyOneTimeShock: selected.oneTimeCost,
      updatedAt: new Date().toISOString(),
    });
    setActiveTab('emergency_budget');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              “What If Life Happens?” Scenario Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Stress-test your financial foundation against realistic life curveballs before they occur.
            Evaluate cash flow disruption, emergency buffer depletion, and clear action steps.
          </p>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => setSelectedScenarioId(sc.id)}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              selectedScenarioId === sc.id
                ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="font-bold text-xs text-slate-900 line-clamp-1">{sc.title}</div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sc.description}</p>
          </button>
        ))}
      </div>

      {/* Selected Scenario Deep-Dive Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{selected.title}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{selected.description}</p>
          </div>
          <button
            onClick={handleTestInEmergencyMode}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            Simulate in Emergency Budget Mode →
          </button>
        </div>

        {/* Impact Barometer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Monthly Cash Flow Impact */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Monthly Cash Flow Impact
            </span>
            <div className="text-2xl font-black text-slate-900">
              {formatINR(scenarioCashFlow.surplusCashFlow)}
            </div>
            <div
              className={`text-xs font-bold ${
                cashFlowDiff < 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {cashFlowDiff < 0 ? `${formatINR(cashFlowDiff)}/mo` : `+${formatINR(cashFlowDiff)}/mo`} vs baseline
            </div>
          </div>

          {/* Box 2: Emergency Runway Remaining */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Emergency Runway Remaining
            </span>
            <div className="text-2xl font-black text-slate-900">
              {scenarioRunway.runwayMonths.toFixed(1)} Months
            </div>
            <div
              className={`text-xs font-bold ${
                runwayDiff < 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {runwayDiff < 0 ? `${runwayDiff.toFixed(1)} Mos` : `+${runwayDiff.toFixed(1)} Mos`} ({scenarioRunway.runwayDays} days)
            </div>
          </div>

          {/* Box 3: Liquid Cushion Remaining */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Liquid Cash After Shock
            </span>
            <div className="text-2xl font-black text-slate-900">
              {formatINR(scenarioRunway.adjustedSavings)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {selected.oneTimeCost > 0
                ? `After paying ${formatINR(selected.oneTimeCost)} one-time cost`
                : 'No one-time capital deduction'}
            </div>
          </div>
        </div>

        {/* Actionable Survival Roadmap */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Practical Action Roadmap for this Scenario
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selected.recommendedActions.map((act, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 text-xs"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed">{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
