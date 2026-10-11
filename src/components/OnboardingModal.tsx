import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinancialPlan, Goal } from '../types';
import { calculateCashFlow, evaluateRiskProfile, formatINR } from '../lib/calculations';
import { RISK_QUESTIONS } from '../data/defaultPlan';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newPlan: FinancialPlan) => void;
  initialPlan: FinancialPlan;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialPlan,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [userName, setUserName] = useState(initialPlan.userName || '');
  const [userEmail, setUserEmail] = useState(initialPlan.userEmail || '');
  const [monthlyTakeHome, setMonthlyTakeHome] = useState<number>(initialPlan.monthlyTakeHome || 60000);

  // Essentials breakdown
  const [rent, setRent] = useState<number>(initialPlan.essentialBreakdown?.rentHousing || 15000);
  const [groceries, setGroceries] = useState<number>(initialPlan.essentialBreakdown?.groceriesFood || 6000);
  const [utilities, setUtilities] = useState<number>(initialPlan.essentialBreakdown?.utilitiesBills || 2500);
  const [transport, setTransport] = useState<number>(initialPlan.essentialBreakdown?.transportCommute || 2500);
  const [insurance, setInsurance] = useState<number>(initialPlan.essentialBreakdown?.insuranceMedical || 1000);

  // Discretionary breakdown
  const [diningOut, setDiningOut] = useState<number>(initialPlan.optionalBreakdown?.diningOut || 4000);
  const [subscriptions, setSubscriptions] = useState<number>(initialPlan.optionalBreakdown?.subscriptions || 1200);
  const [shopping, setShopping] = useState<number>(initialPlan.optionalBreakdown?.shoppingLeisure || 3500);
  const [leisure, setLeisure] = useState<number>(initialPlan.optionalBreakdown?.travelEntertainment || 1500);

  // Commitments & Emergency Savings
  const [commitments, setCommitments] = useState<number>(initialPlan.existingCommitments || 0);
  const [emergencySavings, setEmergencySavings] = useState<number>(initialPlan.currentEmergencySavings || 30000);

  // Goals
  const [goals, setGoals] = useState<Goal[]>(
    initialPlan.goals && initialPlan.goals.length > 0
      ? initialPlan.goals
      : [
          {
            id: 'g1',
            title: '3-Month Emergency Cushion',
            category: 'emergency',
            targetAmount: 75000,
            currentSaved: 30000,
            targetMonths: 6,
            priority: 'high',
          },
          {
            id: 'g2',
            title: 'First Work Laptop',
            category: 'purchase',
            targetAmount: 60000,
            currentSaved: 10000,
            targetMonths: 8,
            priority: 'medium',
          },
        ]
  );

  // Risk profile answers
  const [riskAnswers, setRiskAnswers] = useState<{ questionId: string; selectedOption: number }[]>(
    initialPlan.riskProfile?.answers || [
      { questionId: 'horizon', selectedOption: 2 },
      { questionId: 'volatility', selectedOption: 2 },
      { questionId: 'loss_reaction', selectedOption: 1 },
      { questionId: 'emergency_ready', selectedOption: 1 },
      { questionId: 'knowledge', selectedOption: 2 },
      { questionId: 'dependents', selectedOption: 2 },
    ]
  );

  if (!isOpen) return null;

  // Real-time calculations for live preview
  const totalEssentials = rent + groceries + utilities + transport + insurance;
  const totalOptional = diningOut + subscriptions + shopping + leisure;
  const cashFlow = calculateCashFlow(monthlyTakeHome, totalEssentials, totalOptional, commitments);

  const handleGoalChange = (index: number, field: keyof Goal, val: any) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: val };
    setGoals(updated);
  };

  const addGoal = () => {
    const newG: Goal = {
      id: `g_${Date.now()}`,
      title: 'New Financial Goal',
      category: 'purchase',
      targetAmount: 50000,
      currentSaved: 0,
      targetMonths: 6,
      priority: 'medium',
    };
    setGoals([...goals, newG]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleSelectRiskOption = (questionId: string, optionIndex: number) => {
    const updated = riskAnswers.filter((a) => a.questionId !== questionId);
    updated.push({ questionId, selectedOption: optionIndex });
    setRiskAnswers(updated);
  };

  const handleSubmit = () => {
    const evaluatedRisk = evaluateRiskProfile(riskAnswers);

    // Default SIP: 50% of available surplus if positive, else ₹1,000 baseline
    const initialSip = cashFlow.surplusCashFlow > 5000
      ? Math.round(cashFlow.surplusCashFlow * 0.45)
      : Math.max(1000, Math.round(cashFlow.surplusCashFlow * 0.2));

    const updatedPlan: FinancialPlan = {
      ...initialPlan,
      id: `plan_${Date.now()}`,
      userName: userName.trim() || 'First-Time Earner',
      userEmail: userEmail.trim() || undefined,
      planName: `${userName ? userName.trim() + "'s" : 'My'} First Salary Flight Plan`,
      monthlyTakeHome,
      essentialExpenses: totalEssentials,
      essentialBreakdown: {
        rentHousing: rent,
        groceriesFood: groceries,
        utilitiesBills: utilities,
        transportCommute: transport,
        insuranceMedical: insurance,
        otherEssentials: 0,
      },
      optionalExpenses: totalOptional,
      optionalBreakdown: {
        diningOut,
        subscriptions,
        shoppingLeisure: shopping,
        travelEntertainment: leisure,
        otherWants: 0,
      },
      existingCommitments: commitments,
      currentEmergencySavings: emergencySavings,
      goals,
      riskProfile: evaluatedRisk,
      sipMonthlyAmount: initialSip > 0 ? initialSip : 2000,
      sipExpectedReturnRate: evaluatedRisk.category === 'growth' ? 13 : evaluatedRisk.category === 'moderate' ? 12 : 9,
      sipDurationYears: 10,
      emergencyBudgetActive: false,
      updatedAt: new Date().toISOString(),
    };

    // Trigger celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback if confetti unsupported
    }

    onComplete(updatedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {step}/5
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {step === 1 && 'Step 1: Your First Salary & Living Essentials'}
                {step === 2 && 'Step 2: Discretionary Spending & Commitments'}
                {step === 3 && 'Step 3: Emergency Savings & Safety Buffer'}
                {step === 4 && 'Step 4: Your Target Goals'}
                {step === 5 && 'Step 5: Investment Risk Profile Questionnaire'}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 1 && 'Enter your take-home pay and core survival expenses.'}
                {step === 2 && 'Track wants, lifestyle spending, and family support.'}
                {step === 3 && 'Assess your initial defense against sudden job loss.'}
                {step === 4 && 'Specify what you are saving for in your early career.'}
                {step === 5 && '6 quick questions to recommend a transparent allocation.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Real-time cash flow barometer bar */}
        <div className="bg-slate-100/80 px-6 py-2 border-b border-slate-200/60 flex items-center justify-between text-xs">
          <span className="text-slate-600">Live Monthly Cash Flow Barometer:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Income: {formatINR(monthlyTakeHome)}</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-700">Total Outflow: {formatINR(totalEssentials + totalOptional + commitments)}</span>
            <span className="text-slate-400">|</span>
            <span
              className={`font-bold ${
                cashFlow.isDeficit ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              Surplus: {formatINR(cashFlow.surplusCashFlow)}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Salary & Essentials */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email for Flight Plan (Optional)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. aarav@company.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Take-Home Salary (In-Hand after EPF & TDS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={monthlyTakeHome}
                    onChange={(e) => setMonthlyTakeHome(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use your actual credited monthly amount, not your yearly CTC.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Essential Monthly Expenses (Needs)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Rent / PG / Maintenance</label>
                    <input
                      type="number"
                      min="0"
                      value={rent}
                      onChange={(e) => setRent(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Groceries & Daily Food</label>
                    <input
                      type="number"
                      min="0"
                      value={groceries}
                      onChange={(e) => setGroceries(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Utilities (Electricity, Wi-Fi, Gas)</label>
                    <input
                      type="number"
                      min="0"
                      value={utilities}
                      onChange={(e) => setUtilities(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Metro / Fuel / Commute</label>
                    <input
                      type="number"
                      min="0"
                      value={transport}
                      onChange={(e) => setTransport(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Health Insurance / Mandatory Meds</label>
                    <input
                      type="number"
                      min="0"
                      value={insurance}
                      onChange={(e) => setInsurance(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Optional Expenses & Commitments */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Discretionary Lifestyle Spending (Wants)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Dining Out & Food Delivery (Swiggy/Zomato)</label>
                    <input
                      type="number"
                      min="0"
                      value={diningOut}
                      onChange={(e) => setDiningOut(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">OTT & Subscriptions (Netflix, Spotify, Gym)</label>
                    <input
                      type="number"
                      min="0"
                      value={subscriptions}
                      onChange={(e) => setSubscriptions(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Shopping & Hobbies</label>
                    <input
                      type="number"
                      min="0"
                      value={shopping}
                      onChange={(e) => setShopping(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Weekend Trips & Entertainment</label>
                    <input
                      type="number"
                      min="0"
                      value={leisure}
                      onChange={(e) => setLeisure(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Existing Monthly Financial Commitments (EMIs, Student Loans, Family Remittance)
                </label>
                <input
                  type="number"
                  min="0"
                  value={commitments}
                  onChange={(e) => setCommitments(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                  placeholder="0 if none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Do not double-count rent or living expenses already listed in Step 1.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Emergency Savings */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-semibold">Why Emergency Savings Come First</p>
                    <p>
                      Before investing in high-risk equity markets or locked-in schemes, first-time earners need
                      a liquid safety buffer. This prevents panic-selling investments at a loss when rent or medical bills arrive.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Liquid Emergency Funds (Savings Bank + Liquid FDs)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={emergencySavings}
                    onChange={(e) => setEmergencySavings(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600">Calculated Job-Loss Runway:</span>
                  <span className="font-bold text-slate-900">
                    {totalEssentials > 0
                      ? `${(emergencySavings / totalEssentials).toFixed(1)} Months`
                      : 'N/A'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {emergencySavings / (totalEssentials || 1) < 3 ? (
                    <span className="text-amber-700 font-medium">
                      ⚠️ Below recommended 3-month buffer. FirstSalary OS will prioritize emergency fund building in your plan.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      ✓ Good initial cushion! You can balance goal savings and SIP wealth allocation.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Target Goals */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Your Early Career Goals
                  </h4>
                  <p className="text-[11px] text-slate-500">Define what you want to achieve in the next 6 to 24 months.</p>
                </div>
                <button
                  type="button"
                  onClick={addGoal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Goal
                </button>
              </div>

              <div className="space-y-3">
                {goals.map((g, idx) => (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 relative space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={g.title}
                        onChange={(e) => handleGoalChange(idx, 'title', e.target.value)}
                        placeholder="Goal Title (e.g. Workstation)"
                        className="font-semibold text-xs text-slate-800 bg-transparent border-b border-dashed border-slate-300 pb-0.5 outline-none flex-1"
                      />
                      {goals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGoal(g.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500">Target (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={g.targetAmount}
                          onChange={(e) =>
                            handleGoalChange(idx, 'targetAmount', Math.max(0, Number(e.target.value) || 0))
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Saved (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={g.currentSaved}
                          onChange={(e) =>
                            handleGoalChange(idx, 'currentSaved', Math.max(0, Number(e.target.value) || 0))
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Months</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={g.targetMonths}
                          onChange={(e) =>
                            handleGoalChange(idx, 'targetMonths', Math.max(1, Number(e.target.value) || 1))
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Risk Profile Quiz */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                Answer these 6 quick questions. We will use them to suggest an educational allocation between
                liquid buffer, low-risk debt, and equity SIPs.
              </div>

              <div className="space-y-4">
                {RISK_QUESTIONS.map((q, qIndex) => {
                  const currentAnswer = riskAnswers.find((a) => a.questionId === q.id)?.selectedOption ?? 1;
                  return (
                    <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        {qIndex + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectRiskOption(q.id, oIdx)}
                            className={`p-2 rounded-lg text-left text-xs transition-all border ${
                              currentAnswer === oIdx
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="inline-block mr-1.5 font-bold">
                              {['A', 'B', 'C', 'D'][oIdx]}.
                            </span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-all active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate My Flight Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
