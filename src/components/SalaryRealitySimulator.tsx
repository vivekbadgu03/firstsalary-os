import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ShieldAlert,
  Target,
  Sparkles,
  AlertTriangle,
  Save,
  Bot,
  Zap,
  Info,
} from 'lucide-react';
import { FinancialPlan } from '../types';
import {
  calculateCashFlow,
  calculateEmergencyRunway,
  calculateGoalContributions,
  calculateSipProjection,
  formatINR,
} from '../lib/calculations';
import { askAiAssistant } from '../lib/aiClient';

interface SalaryRealitySimulatorProps {
  plan: FinancialPlan;
  onUpdatePlan: (plan: FinancialPlan) => void;
  onOpenAiAssistant?: () => void;
}

export const SalaryRealitySimulator: React.FC<SalaryRealitySimulatorProps> = ({
  plan,
  onUpdatePlan,
  onOpenAiAssistant,
}) => {
  // Simulator Dials (Starts at baseline)
  const [simSalary, setSimSalary] = useState<number>(plan.monthlyTakeHome);
  const [simEssentials, setSimEssentials] = useState<number>(plan.essentialExpenses);
  const [simOptional, setSimOptional] = useState<number>(plan.optionalExpenses);
  const [simShock, setSimShock] = useState<number>(0);
  const [simSip, setSimSip] = useState<number>(plan.sipMonthlyAmount);

  // AI Scenario Explanation state
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Baseline Metrics
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
  const baseSip = calculateSipProjection(
    plan.sipMonthlyAmount,
    plan.sipExpectedReturnRate,
    plan.sipDurationYears
  );

  // Simulated Metrics
  const simCashFlow = calculateCashFlow(
    simSalary,
    simEssentials,
    simOptional,
    plan.existingCommitments
  );
  const simRunway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    simEssentials,
    simShock
  );
  const simSipProjection = calculateSipProjection(
    simSip,
    plan.sipExpectedReturnRate,
    plan.sipDurationYears
  );
  const simGoals = calculateGoalContributions(plan.goals, simCashFlow.surplusCashFlow);

  // Deltas
  const cashFlowDelta = simCashFlow.surplusCashFlow - baseCashFlow.surplusCashFlow;
  const runwayDelta = simRunway.runwayMonths - baseRunway.runwayMonths;
  const wealthDelta = simSipProjection.projectedWealth - baseSip.projectedWealth;

  // Trigger AI scenario explanation whenever simulation dials change significantly
  const fetchAiExplanation = async () => {
    setIsAiLoading(true);
    const simContext = {
      simSalary,
      simEssentials,
      simOptional,
      simShock,
      cashFlowDelta,
      runwayDelta,
    };

    const promptText = `Explain the impact of this simulated scenario:
- Salary changed to ₹${simSalary.toLocaleString('en-IN')}/mo (delta: ₹${(simSalary - plan.monthlyTakeHome).toLocaleString('en-IN')})
- Essential expenses changed to ₹${simEssentials.toLocaleString('en-IN')}/mo
- Discretionary spending changed to ₹${simOptional.toLocaleString('en-IN')}/mo
- One-time unexpected expense: ₹${simShock.toLocaleString('en-IN')} (paid once, not monthly)
- Resulting Cash Flow: ₹${simCashFlow.surplusCashFlow.toLocaleString('en-IN')}/mo (delta: ₹${cashFlowDelta.toLocaleString('en-IN')})
- Resulting Runway: ${simRunway.runwayMonths.toFixed(1)} Months (delta: ${runwayDelta.toFixed(1)} months)

Give me a concise analysis of:
1. What changed and why it matters
2. How my emergency buffer is affected
3. Concrete, practical options I have.`;

    try {
      const res = await askAiAssistant(promptText, plan, simContext);
      setAiExplanation(res.text);
    } catch {
      setAiExplanation('Unable to fetch AI scenario analysis right now.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Reset to Baseline Plan
  const handleReset = () => {
    setSimSalary(plan.monthlyTakeHome);
    setSimEssentials(plan.essentialExpenses);
    setSimOptional(plan.optionalExpenses);
    setSimShock(0);
    setSimSip(plan.sipMonthlyAmount);
    setAiExplanation('');
  };

  // Official Preset Requested: ₹30,000 monthly salary, ₹20,000 expenses, ₹8,000 unexpected expense
  const handleLoadOfficialPreset = () => {
    setSimSalary(30000);
    setSimEssentials(15000);
    setSimOptional(5000); // total monthly expenses = 20,000
    setSimShock(8000); // unexpected expense paid once
    setSimSip(2500);
  };

  const handleSaveAsBaseline = () => {
    onUpdatePlan({
      ...plan,
      monthlyTakeHome: simSalary,
      essentialExpenses: simEssentials,
      optionalExpenses: simOptional,
      sipMonthlyAmount: simSip,
      emergencyOneTimeShock: simShock,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/60">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Salary Reality Simulator
              </h2>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                Core Differentiator
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Test life decisions in a risk-free laboratory. Adjust salary, rent hikes, and one-time shocks to
            see instant before-and-after comparisons with real-time AI financial advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadOfficialPreset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
            title="Load Hackathon Test Scenario"
          >
            <Zap className="h-3.5 w-3.5 text-teal-600" />
            <span>Load ₹30k/₹20k Shock Scenario</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSaveAsBaseline}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save as Baseline Plan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Dials on Left, Real-Time Before/After on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulator Dials Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Interactive Variables</h3>
            <span className="text-[10px] text-slate-400">Live Recalculation</span>
          </div>

          {/* Salary Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Monthly Take-Home:</span>
              <span className="font-bold text-emerald-700">{formatINR(simSalary)}</span>
            </div>
            <input
              type="range"
              min="15000"
              max="200000"
              step="2500"
              value={simSalary}
              onChange={(e) => setSimSalary(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹15,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          {/* Rent / Essential Expenses */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Essential Expenses (Rent/Bills):</span>
              <span className="font-bold text-slate-900">{formatINR(simEssentials)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={simEssentials}
              onChange={(e) => setSimEssentials(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹5,000</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Optional Spending */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Optional Spending (Wants/Dining):</span>
              <span className="font-bold text-slate-900">{formatINR(simOptional)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="60000"
              step="1000"
              value={simOptional}
              onChange={(e) => setSimOptional(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>₹30,000</span>
              <span>₹60,000</span>
            </div>
          </div>

          {/* Monthly SIP Contribution */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Monthly SIP Investment:</span>
              <span className="font-bold text-indigo-700">{formatINR(simSip)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="60000"
              step="1000"
              value={simSip}
              onChange={(e) => setSimSip(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹1,000</span>
              <span>₹30,000</span>
              <span>₹60,000</span>
            </div>
          </div>

          {/* Surprise One-Time Shock */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-700">One-Time Emergency Shock:</span>
                <span className="text-[10px] text-slate-400 block">(Paid once from savings, not monthly)</span>
              </div>
              <span className="font-bold text-rose-600">
                {simShock > 0 ? `-${formatINR(simShock)}` : '₹0'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={simShock}
              onChange={(e) => setSimShock(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>₹8,000 (Preset)</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* AI Trigger Button */}
          <div className="pt-2">
            <button
              onClick={fetchAiExplanation}
              disabled={isAiLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAiLoading ? 'Analyzing with AI...' : 'Explain This Scenario with AI'}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Before-and-After Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm">
              Live Before vs After Comparison
            </h3>

            {/* Comparison Strip 1: Monthly Cash Flow */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Monthly Cash Flow</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    cashFlowDelta >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {cashFlowDelta >= 0 ? `+${formatINR(cashFlowDelta)}/mo` : `${formatINR(cashFlowDelta)}/mo`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Baseline Plan:</span>
                  <strong className={baseCashFlow.isDeficit ? 'text-rose-600' : 'text-slate-800'}>
                    {formatINR(baseCashFlow.surplusCashFlow)}/mo
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Simulated Reality:</span>
                  <strong
                    className={`text-sm ${
                      simCashFlow.isDeficit ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'
                    }`}
                  >
                    {formatINR(simCashFlow.surplusCashFlow)}/mo
                  </strong>
                </div>
              </div>
              {simCashFlow.isDeficit && (
                <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1 pt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Simulation triggers an active monthly cash flow deficit!</span>
                </div>
              )}
            </div>

            {/* Comparison Strip 2: Emergency Runway */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Emergency Runway</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    runwayDelta >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {runwayDelta >= 0 ? `+${runwayDelta.toFixed(1)} Mos` : `${runwayDelta.toFixed(1)} Mos`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Baseline Runway:</span>
                  <strong className="text-slate-800">
                    {baseRunway.runwayMonths.toFixed(1)} Months ({baseRunway.runwayDays} days)
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Simulated Runway:</span>
                  <strong className="text-slate-900 text-sm">
                    {simRunway.runwayMonths.toFixed(1)} Months ({simRunway.runwayDays} days)
                  </strong>
                </div>
              </div>
            </div>

            {/* Comparison Strip 3: 10-Year SIP Wealth Creation */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">
                  10-Year SIP Wealth Potential ({plan.sipExpectedReturnRate}%)
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    wealthDelta >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {wealthDelta >= 0 ? `+${formatINR(wealthDelta, true)}` : `${formatINR(wealthDelta, true)}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Baseline Wealth:</span>
                  <strong className="text-slate-800">
                    {formatINR(baseSip.projectedWealth, true)}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Simulated Wealth:</span>
                  <strong className="text-emerald-700 text-sm font-black">
                    {formatINR(simSipProjection.projectedWealth, true)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Goal Affordability Check */}
            <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total Goal Requirement:</span>
                <span className="font-bold text-slate-900">{formatINR(simGoals.totalRequiredMonthly)}/mo</span>
              </div>
              <div className="mt-1 text-[11px]">
                {simGoals.isOverallAffordable ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ Goals remain affordable within simulated monthly cash flow.
                  </span>
                ) : (
                  <span className="text-rose-700 font-semibold">
                    ⚠️ Simulated cash flow cannot afford all goals! Shortfall of {formatINR(simGoals.shortfallAmount)}/mo.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Scenario Impact Analysis Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/60 to-emerald-50/60 border border-teal-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-teal-700" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  AI Scenario Explanation
                </h4>
              </div>
              {aiExplanation && (
                <button
                  onClick={fetchAiExplanation}
                  disabled={isAiLoading}
                  className="text-[11px] text-teal-800 font-semibold underline hover:text-teal-950"
                >
                  Refresh Analysis
                </button>
              )}
            </div>

            {isAiLoading ? (
              <div className="flex items-center gap-2 text-xs text-teal-800 py-3">
                <div className="h-2 w-2 rounded-full bg-teal-600 animate-ping" />
                <span>Generating contextual AI scenario explanation...</span>
              </div>
            ) : aiExplanation ? (
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-white/80 p-3.5 rounded-xl border border-teal-200/60">
                {aiExplanation}
              </div>
            ) : (
              <div className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-slate-200/60">
                <p>
                  Click <strong>“Explain This Scenario with AI”</strong> above to generate an instant, contextual
                  explanation of what this simulation means for your emergency safety, monthly cash flow, and goal timelines.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
