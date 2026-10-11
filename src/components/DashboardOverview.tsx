import React from 'react';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Flame,
  SlidersHorizontal,
  Target,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  ArrowUpRight,
  Bot,
} from 'lucide-react';
import { FinancialPlan } from '../types';
import {
  calculateCashFlow,
  calculateEmergencyRunway,
  calculateSuggestedAllocation,
  calculateSipProjection,
  calculateGoalContributions,
  formatINR,
} from '../lib/calculations';
import { ActiveTab } from './Navbar';
import { CashFlowSankey } from './charts/CashFlowSankey';
import { RunwayGauge } from './charts/RunwayGauge';
import { SipGrowthChart } from './charts/SipGrowthChart';

interface DashboardOverviewProps {
  plan: FinancialPlan;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenOnboarding: () => void;
  onOpenAiAssistant?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  plan,
  setActiveTab,
  onOpenOnboarding,
  onOpenAiAssistant,
}) => {
  const cashFlow = calculateCashFlow(
    plan.monthlyTakeHome,
    plan.essentialExpenses,
    plan.optionalExpenses,
    plan.existingCommitments
  );

  const runway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    plan.essentialExpenses,
    plan.emergencyOneTimeShock || 0
  );

  const allocation = calculateSuggestedAllocation(
    plan.monthlyTakeHome,
    plan.essentialExpenses,
    plan.optionalExpenses,
    plan.existingCommitments,
    plan.currentEmergencySavings,
    plan.goals,
    plan.riskProfile
  );

  const sip = calculateSipProjection(
    plan.sipMonthlyAmount,
    plan.sipExpectedReturnRate,
    plan.sipDurationYears
  );

  const goalSummary = calculateGoalContributions(plan.goals, cashFlow.surplusCashFlow);

  return (
    <div className="space-y-6">
      {/* Top Banner if Emergency Budget is Active */}
      {plan.emergencyBudgetActive && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm">
                Emergency Budget Mode Is Currently Active
              </h4>
              <p className="text-xs text-rose-700">
                You are testing a crisis defensive budget with reduced income and frozen discretionary subscriptions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('emergency_budget')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs shrink-0"
          >
            Review Emergency Mode
          </button>
        </div>
      )}

      {/* Cash Deficit Warning if expenses > income */}
      {cashFlow.isDeficit && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold text-sm">Cash Flow Deficit Alert</span>
            <p>
              Your entered living expenses exceed your monthly take-home salary by{' '}
              <strong className="text-amber-950">{formatINR(Math.abs(cashFlow.surplusCashFlow))}</strong>.
              Investing in SIPs during an active monthly deficit will deplete your emergency buffer or cause high-interest debt.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setActiveTab('salary_simulator')}
                className="font-semibold text-amber-900 underline hover:text-amber-950"
              >
                Use the Reality Simulator to balance your budget →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Quick Diagnosis Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-emerald-50/80 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">
                AI Financial Plan Analysis
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Context Loaded
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {cashFlow.isDeficit
                ? 'Action Needed: Your monthly expenses exceed income. Ask AI for immediate trimming options.'
                : runway.runwayMonths < 3
                ? `Defensive Alert: You have ${runway.runwayMonths.toFixed(1)} months of emergency buffer. AI recommends reaching 3 months before aggressive equity investing.`
                : `Healthy Foundation: You have a ${runway.runwayMonths.toFixed(1)}-month cushion and +${formatINR(cashFlow.surplusCashFlow)}/mo surplus. AI recommends automating your index SIPs.`}
            </p>
          </div>
        </div>

        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Consult AI Advisor</span>
          </button>
        )}
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Take-Home Income */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Take-Home Salary</span>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(cashFlow.takeHome)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Essential Outflow: {formatINR(cashFlow.essentialExpenses)}</span>
            <span className="font-medium text-slate-700">
              {cashFlow.takeHome > 0
                ? `${Math.round((cashFlow.essentialExpenses / cashFlow.takeHome) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* KPI 2: Free Cash Flow (Surplus) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Cash Flow</span>
            <TrendingUp
              className={`h-4 w-4 ${cashFlow.isDeficit ? 'text-rose-500' : 'text-emerald-600'}`}
            />
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              cashFlow.isDeficit ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {formatINR(cashFlow.surplusCashFlow)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Savings Rate:</span>
            <span
              className={`font-bold ${
                cashFlow.savingsRate >= 20 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {cashFlow.savingsRate}% of Take-Home
            </span>
          </div>
        </div>

        {/* KPI 3: Emergency Runway */}
        <div
          onClick={() => setActiveTab('job_loss')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Emergency Runway</span>
            <ShieldAlert className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{runway.runwayMonths.toFixed(1)}</span>
            <span className="text-sm font-medium text-slate-500">Months</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{formatINR(runway.adjustedSavings)} liquid</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                runway.statusColor === 'emerald'
                  ? 'bg-emerald-50 text-emerald-800'
                  : runway.statusColor === 'amber'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {runway.statusLabel}
            </span>
          </div>
        </div>

        {/* KPI 4: 10-Year SIP Projection */}
        <div
          onClick={() => setActiveTab('goals_sip')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {plan.sipDurationYears}Y SIP Projection
            </span>
            <Target className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(sip.projectedWealth, true)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>At {formatINR(plan.sipMonthlyAmount)}/mo</span>
            <span className="font-semibold text-emerald-700">
              +{formatINR(sip.wealthGain, true)} gain
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid: Cash Flow Stream & Runway Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Visual Cash Flow Stream (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Cash Flow Stream & Outflow Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Visual proportional distribution of your monthly take-home salary
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Salary: {formatINR(cashFlow.takeHome)}/mo
            </span>
          </div>

          <CashFlowSankey
            takeHome={cashFlow.takeHome}
            essentials={cashFlow.essentialExpenses}
            optional={cashFlow.optionalExpenses}
            commitments={cashFlow.existingCommitments}
            surplus={cashFlow.surplusCashFlow}
            isDeficit={cashFlow.isDeficit}
          />
        </div>

        {/* Right: Job-Loss Runway Gauge (4 Cols) */}
        <div
          onClick={() => setActiveTab('job_loss')}
          className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Job-Loss Runway Gauge
              </h3>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Exact days of coverage against your ₹{cashFlow.essentialExpenses.toLocaleString('en-IN')}/mo living burn rate
            </p>

            <RunwayGauge
              runwayMonths={runway.runwayMonths}
              runwayDays={runway.runwayDays}
              statusLabel={runway.statusLabel}
              statusColor={runway.statusColor}
            />
          </div>

          <div className="pt-2 text-center">
            <span className="text-xs font-semibold text-amber-800 hover:underline">
              Test Layoff & Medical Shocks →
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Transparent Suggested Allocation + Risk Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transparent Allocation Engine */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Transparent Suggested Allocation
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic allocation tailored to your take-home pay, emergency cushion, and risk tolerance.
              </p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
              Total: {formatINR(allocation.totalAllocated)}/mo
            </div>
          </div>

          {/* Allocation Bar Visualization */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.min(100, allocation.essentialsPct)}%` }}
                className="bg-slate-700 transition-all"
                title={`Essentials: ${formatINR(allocation.essentialsAmount)} (${allocation.essentialsPct}%)`}
              />
              <div
                style={{ width: `${Math.min(100, allocation.optionalPct)}%` }}
                className="bg-amber-400 transition-all"
                title={`Optional: ${formatINR(allocation.optionalAmount)} (${allocation.optionalPct}%)`}
              />
              <div
                style={{ width: `${Math.min(100, allocation.emergencyFundPct)}%` }}
                className="bg-blue-500 transition-all"
                title={`Emergency Buffer: ${formatINR(allocation.emergencyFundAmount)} (${allocation.emergencyFundPct}%)`}
              />
              <div
                style={{ width: `${Math.min(100, allocation.goalsPct)}%` }}
                className="bg-indigo-500 transition-all"
                title={`Goals: ${formatINR(allocation.goalsAmount)} (${allocation.goalsPct}%)`}
              />
              <div
                style={{ width: `${Math.min(100, allocation.investmentsPct)}%` }}
                className="bg-emerald-500 transition-all"
                title={`Long-Term SIP: ${formatINR(allocation.investmentsAmount)} (${allocation.investmentsPct}%)`}
              />
              {allocation.unallocatedPct > 0 && (
                <div
                  style={{ width: `${Math.min(100, allocation.unallocatedPct)}%` }}
                  className="bg-teal-300 transition-all"
                  title={`Buffer Cash: ${formatINR(allocation.unallocatedCash)} (${allocation.unallocatedPct}%)`}
                />
              )}
            </div>

            {/* Legend & Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                  <span>Essentials</span>
                </div>
                <div className="mt-1 font-bold text-xs text-slate-900">
                  {formatINR(allocation.essentialsAmount)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    ({allocation.essentialsPct}%)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Wants / Leisure</span>
                </div>
                <div className="mt-1 font-bold text-xs text-slate-900">
                  {formatINR(allocation.optionalAmount)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    ({allocation.optionalPct}%)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Emergency Fund</span>
                </div>
                <div className="mt-1 font-bold text-xs text-slate-900">
                  {formatINR(allocation.emergencyFundAmount)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    ({allocation.emergencyFundPct}%)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span>Goal Savings</span>
                </div>
                <div className="mt-1 font-bold text-xs text-slate-900">
                  {formatINR(allocation.goalsAmount)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    ({allocation.goalsPct}%)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>SIP Wealth</span>
                </div>
                <div className="mt-1 font-bold text-xs text-slate-900">
                  {formatINR(allocation.investmentsAmount)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    ({allocation.investmentsPct}%)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-teal-300" />
                  <span>Cash Buffer</span>
                </div>
                <div className="mt-1 font-bold text-xs text-slate-900">
                  {formatINR(allocation.unallocatedCash)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    ({allocation.unallocatedPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Rationale Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Allocation Rationale</span>
              <p className="leading-relaxed">{allocation.explanation}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Risk Profile & Distinctive Fast Actions */}
        <div className="space-y-6">
          {/* Risk Profile Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Risk Profile
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Score: {plan.riskProfile.score}/18
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {plan.riskProfile.label}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {plan.riskProfile.explanation}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Suggested Equity Ratio:</span>
              <span className="font-bold text-slate-800">
                {Math.round(plan.riskProfile.suggestedEquityRatio * 100)}% Equity / {100 - Math.round(plan.riskProfile.suggestedEquityRatio * 100)}% Debt & Cash
              </span>
            </div>
          </div>

          {/* Distinctive Feature Quick-Jump Grid */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Distinctive Simulators
            </h4>

            <button
              onClick={() => setActiveTab('job_loss')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Job-Loss Survival Test</div>
                  <div className="text-[10px] text-slate-500">Test unexpected layoff scenarios</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700" />
            </button>

            <button
              onClick={() => setActiveTab('emergency_budget')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Flame className="h-4 w-4 text-rose-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Emergency Budget Mode</div>
                  <div className="text-[10px] text-slate-500">Simulate 0% salary & trim wants</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-700" />
            </button>

            <button
              onClick={() => setActiveTab('salary_simulator')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Salary Reality Lab</div>
                  <div className="text-[10px] text-slate-500">What-if rent hike & appraisal sliders</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-700" />
            </button>

            <button
              onClick={() => setActiveTab('flight_plan')}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-900 text-white hover:bg-slate-800 text-left transition-all flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold">First-Salary Flight Plan</div>
                  <div className="text-[10px] text-slate-300">Generate executive summary & print</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* SIP Compounding Progression Preview */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              SIP Compounding Wealth Trajectory ({plan.sipDurationYears} Years)
            </h3>
            <p className="text-xs text-slate-500">
              Interactive timeline model at {plan.sipExpectedReturnRate}% benchmark return ({formatINR(plan.sipMonthlyAmount)}/mo)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('goals_sip')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Adjust SIP Parameters <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <SipGrowthChart
          yearlyData={sip.yearlyBreakdown}
          monthlyInvestment={plan.sipMonthlyAmount}
        />
      </div>

      {/* Goals Quick Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Active Financial Goals</h3>
            <p className="text-xs text-slate-500">
              Monthly target requirement:{' '}
              <strong className="text-slate-800">{formatINR(goalSummary.totalRequiredMonthly)}/mo</strong>{' '}
              ({goalSummary.isOverallAffordable ? 'Fully Affordable' : 'Exceeds Surplus'})
            </p>
          </div>
          <button
            onClick={() => setActiveTab('goals_sip')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Manage Goals & SIP <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {plan.goals.map((goal) => {
            const pct = Math.min(100, Math.round(((goal.currentSaved || 0) / (goal.targetAmount || 1)) * 100));
            const remaining = Math.max(0, goal.targetAmount - (goal.currentSaved || 0));
            const requiredMo = Math.ceil(remaining / Math.max(1, goal.targetMonths));

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">{goal.title}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-emerald-600 rounded-full transition-all"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-600">
                  <span>Saved: {formatINR(goal.currentSaved)}</span>
                  <span>Target: {formatINR(goal.targetAmount)}</span>
                </div>
                <div className="pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 flex justify-between">
                  <span>{goal.targetMonths} months remaining</span>
                  <span className="font-semibold text-slate-700">{formatINR(requiredMo)}/mo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
