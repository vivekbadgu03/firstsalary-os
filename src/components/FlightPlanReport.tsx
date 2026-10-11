import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  TrendingUp,
  ShieldAlert,
  Webhook,
  Calendar,
  Layers,
  Sparkles,
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
import { triggerFinancialPlanReadyWebhook, WebhookLog } from '../lib/automation';

interface FlightPlanReportProps {
  plan: FinancialPlan;
  onOpenAutomationModal: () => void;
}

export const FlightPlanReport: React.FC<FlightPlanReportProps> = ({
  plan,
  onOpenAutomationModal,
}) => {
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleTriggerWebhook = async () => {
    setIsSending(true);
    setTriggerStatus(null);
    try {
      const res = await triggerFinancialPlanReadyWebhook(plan);
      setTriggerStatus(res.message);
    } catch (e: any) {
      setTriggerStatus(`Failed to trigger: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // 4 Prioritized Action Directives
  const directives = [
    runway.runwayMonths < 3
      ? {
          title: `Build 3-Month Emergency Cushion (${formatINR(plan.essentialExpenses * 3)})`,
          desc: `Current runway is ${runway.runwayMonths.toFixed(1)} months. Channel ${formatINR(allocation.emergencyFundAmount)}/mo into high-yield liquid funds before scaling equity investments.`,
          priority: 'Urgent Defense',
        }
      : {
          title: 'Maintain Emergency Buffer in Liquid Funds',
          desc: `Your ${runway.runwayMonths.toFixed(1)}-month cushion provides strong stability. Keep this capital safe from stock market swings.`,
          priority: 'Defensive Maintenance',
        },
    cashFlow.isDeficit
      ? {
          title: 'Eliminate Monthly Cash Deficit',
          desc: `Expenses exceed take-home pay by ${formatINR(Math.abs(cashFlow.surplusCashFlow))}/mo. Reduce dining or renegotiate rent before taking on loans.`,
          priority: 'Immediate',
        }
      : {
          title: `Automate ${formatINR(plan.sipMonthlyAmount)}/Month Disciplined SIP`,
          desc: `Set up auto-debit on the 1st or 2nd day after salary credit to avoid lifestyle inflation. Target low-cost Nifty 50 or broad market index funds.`,
          priority: 'Wealth Creation',
        },
    {
      title: 'Review Standalone Health Insurance',
      desc: 'Do not rely entirely on corporate employer health insurance. In the event of a sudden layoff, personal health insurance prevents medical bankruptcy.',
      priority: 'Risk Protection',
    },
    {
      title: `Track Goal Milestones (${plan.goals.length} Active Targets)`,
      desc: goalSummary.isOverallAffordable
        ? `All goals are funded by ${formatINR(goalSummary.totalRequiredMonthly)}/mo. Review progress quarterly.`
        : `Goals exceed monthly surplus by ${formatINR(goalSummary.shortfallAmount)}/mo. Prioritize high-urgency goals first.`,
      priority: 'Milestone Execution',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              First-Salary Flight Plan (Executive Report)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            A comprehensive, personalized briefing document summarizing your early-career financial blueprint,
            survival runway, suggested allocation, and immediate action directives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerWebhook}
            disabled={isSending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
          >
            <Webhook className="h-3.5 w-3.5" />
            <span>{isSending ? 'Sending Webhook...' : 'Trigger n8n Webhook'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {triggerStatus && (
        <div className="no-print p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>{triggerStatus}</span>
          </div>
          <button
            onClick={onOpenAutomationModal}
            className="font-bold underline hover:text-teal-950"
          >
            View n8n Webhook Log →
          </button>
        </div>
      )}

      {/* Printable Report Document Surface */}
      <div className="flight-plan-printable bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xl tracking-tight text-slate-900">FirstSalary OS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Official Flight Plan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {plan.planName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Prepared for: <strong className="text-slate-800">{plan.userName || 'First-Time Earner'}</strong>{' '}
              {plan.userEmail && `(${plan.userEmail})`} • Generated on {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Financial Status
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-0.5 ${
                runway.statusColor === 'emerald'
                  ? 'bg-emerald-100 text-emerald-900'
                  : runway.statusColor === 'amber'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-rose-900'
              }`}
            >
              {runway.statusLabel}
            </span>
          </div>
        </div>

        {/* Section 1: Executive Audit Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Monthly Cash Flow & Runway Audit
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Take-Home Pay</span>
              <strong className="text-base text-slate-900 block mt-0.5">
                {formatINR(cashFlow.takeHome)}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Essential Outflow</span>
              <strong className="text-base text-slate-900 block mt-0.5">
                {formatINR(cashFlow.essentialExpenses)}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Monthly Free Cash</span>
              <strong
                className={`text-base block mt-0.5 ${
                  cashFlow.isDeficit ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatINR(cashFlow.surplusCashFlow)}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Emergency Runway</span>
              <strong className="text-base text-slate-900 block mt-0.5">
                {runway.runwayMonths.toFixed(1)} Months
              </strong>
            </div>
          </div>
        </div>

        {/* Section 2: Suggested Allocation Blueprint */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Transparent Suggested Monthly Allocation
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5">Monthly Amount</th>
                  <th className="py-2.5 px-3.5">% of Income</th>
                  <th className="py-2.5 px-3.5">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">Essential Needs & EMIs</td>
                  <td className="py-2.5 px-3.5">{formatINR(allocation.essentialsAmount)}</td>
                  <td className="py-2.5 px-3.5">{allocation.essentialsPct}%</td>
                  <td className="py-2.5 px-3.5 text-slate-500">Rent, groceries, utilities, transit</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">Discretionary Lifestyle</td>
                  <td className="py-2.5 px-3.5">{formatINR(allocation.optionalAmount)}</td>
                  <td className="py-2.5 px-3.5">{allocation.optionalPct}%</td>
                  <td className="py-2.5 px-3.5 text-slate-500">Dining out, OTT, hobbies, travel</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">Emergency Fund Buffer</td>
                  <td className="py-2.5 px-3.5 font-bold text-blue-700">{formatINR(allocation.emergencyFundAmount)}</td>
                  <td className="py-2.5 px-3.5">{allocation.emergencyFundPct}%</td>
                  <td className="py-2.5 px-3.5 text-slate-500">Liquid safety cushion against job loss</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">Goal Savings</td>
                  <td className="py-2.5 px-3.5 font-bold text-indigo-700">{formatINR(allocation.goalsAmount)}</td>
                  <td className="py-2.5 px-3.5">{allocation.goalsPct}%</td>
                  <td className="py-2.5 px-3.5 text-slate-500">Short/medium-term milestones</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">Long-Term Wealth SIP</td>
                  <td className="py-2.5 px-3.5 font-bold text-emerald-700">{formatINR(allocation.investmentsAmount)}</td>
                  <td className="py-2.5 px-3.5">{allocation.investmentsPct}%</td>
                  <td className="py-2.5 px-3.5 text-slate-500">Index equity & debt compounding</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">Unallocated Buffer Cash</td>
                  <td className="py-2.5 px-3.5">{formatINR(allocation.unallocatedCash)}</td>
                  <td className="py-2.5 px-3.5">{allocation.unallocatedPct}%</td>
                  <td className="py-2.5 px-3.5 text-slate-500">Day-to-day cash flexibility</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: SIP Projection Assumptions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            3. Long-Term SIP Compounding Projection
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block">Monthly Contribution:</span>
              <strong className="text-slate-900">{formatINR(plan.sipMonthlyAmount)}/mo</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Assumed Return & Horizon:</span>
              <strong className="text-slate-900">{plan.sipExpectedReturnRate}% p.a. over {plan.sipDurationYears} Years</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Projected Total Wealth:</span>
              <strong className="text-emerald-700 font-bold">{formatINR(sip.projectedWealth)}</strong>
            </div>
          </div>
        </div>

        {/* Section 4: Tactical Action Directives */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            4. Tactical Flight Plan Directives (Your Next Moves)
          </h3>

          <div className="space-y-2.5">
            {directives.map((dir, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3 text-xs"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{dir.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {dir.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{dir.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal & Educational Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-700">Official Educational Disclaimer:</p>
          <p>
            FirstSalary OS is an educational financial-planning companion and prototype built for first-time earners.
            It does not offer SEBI-registered investment advice or guarantee future investment returns.
            Investment projections are hypothetical models based on monthly compounding. Always review your personal
            tax circumstances and consult qualified advisers before purchasing securities or financial products.
          </p>
        </div>
      </div>
    </div>
  );
};
