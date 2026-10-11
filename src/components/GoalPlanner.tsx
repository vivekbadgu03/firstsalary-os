import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { FinancialPlan, Goal } from '../types';
import { calculateGoalContributions, calculateCashFlow, formatINR } from '../lib/calculations';

interface GoalPlannerProps {
  plan: FinancialPlan;
  onUpdatePlan: (plan: FinancialPlan) => void;
}

export const GoalPlanner: React.FC<GoalPlannerProps> = ({ plan, onUpdatePlan }) => {
  const [goals, setGoals] = useState<Goal[]>(plan.goals);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Goal form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Goal['category']>('purchase');
  const [newTarget, setNewTarget] = useState<number>(50000);
  const [newSaved, setNewSaved] = useState<number>(5000);
  const [newMonths, setNewMonths] = useState<number>(6);
  const [newPriority, setNewPriority] = useState<Goal['priority']>('medium');

  const cashFlow = calculateCashFlow(
    plan.monthlyTakeHome,
    plan.essentialExpenses,
    plan.optionalExpenses,
    plan.existingCommitments
  );

  const goalSummary = calculateGoalContributions(goals, cashFlow.surplusCashFlow);

  const handleSaveGoal = () => {
    if (!newTitle.trim()) return;

    const created: Goal = {
      id: `goal_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetAmount: Math.max(1000, Number(newTarget) || 1000),
      currentSaved: Math.max(0, Number(newSaved) || 0),
      targetMonths: Math.max(1, Number(newMonths) || 1),
      priority: newPriority,
    };

    const updated = [...goals, created];
    setGoals(updated);
    onUpdatePlan({ ...plan, goals: updated, updatedAt: new Date().toISOString() });

    // Reset
    setNewTitle('');
    setNewTarget(50000);
    setNewSaved(5000);
    setNewMonths(6);
    setShowAddModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    onUpdatePlan({ ...plan, goals: updated, updatedAt: new Date().toISOString() });
  };

  const handleUpdateGoalField = (id: string, field: keyof Goal, value: any) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, [field]: value } : g));
    setGoals(updated);
    onUpdatePlan({ ...plan, goals: updated, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Financial Goal Planner & Affordability Radar
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Track early career goals. FirstSalary OS validates whether your required monthly goal contributions
            fit within your available monthly cash flow.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors self-start sm:self-auto active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Affordability Banner */}
      {!goalSummary.isOverallAffordable ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold text-sm">Goal Affordability Shortfall</span>
            <p>
              Your goals demand a total of{' '}
              <strong>{formatINR(goalSummary.totalRequiredMonthly)}/month</strong>, but your available
              monthly surplus cash flow is only{' '}
              <strong>{formatINR(cashFlow.surplusCashFlow)}/month</strong>.
              You have a monthly shortfall of{' '}
              <strong className="text-rose-700">{formatINR(goalSummary.shortfallAmount)}/month</strong>.
            </p>
            <p className="text-[11px] text-amber-800">
              💡 Recommendation: Do not stretch into unsustainable debt. Extend the target timeline on lower-priority goals
              or prioritize your emergency fund first.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>
              All goals are currently affordable within your monthly surplus of{' '}
              <strong>{formatINR(cashFlow.surplusCashFlow)}/mo</strong>. Total required:{' '}
              <strong>{formatINR(goalSummary.totalRequiredMonthly)}/mo</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
          const reqMonthly = remaining === 0 ? 0 : Math.ceil(remaining / Math.max(1, goal.targetMonths));
          const pct = Math.min(100, Math.round((goal.currentSaved / (goal.targetAmount || 1)) * 100));

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                      {goal.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{goal.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>{pct}% Funded</span>
                    <span>Target: {formatINR(goal.targetAmount)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-indigo-600 rounded-full transition-all"
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Already Saved</span>
                    <strong className="text-slate-900">{formatINR(goal.currentSaved)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Required Monthly</span>
                    <strong className="text-indigo-700">{formatINR(reqMonthly)}/mo</strong>
                  </div>
                </div>
              </div>

              {/* Editable Timeline Slider */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Timeline:</span>
                  <span className="font-semibold text-slate-900">{goal.targetMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  value={goal.targetMonths}
                  onChange={(e) =>
                    handleUpdateGoalField(goal.id, 'targetMonths', Math.max(1, Number(e.target.value)))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Financial Goal</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Electric Scooter, First Vacation"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="purchase">Purchase</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel</option>
                    <option value="retirement">Retirement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Already Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newSaved}
                    onChange={(e) => setNewSaved(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Horizon (Months): {newMonths} Months
                </label>
                <input
                  type="range"
                  min="1"
                  max="36"
                  value={newMonths}
                  onChange={(e) => setNewMonths(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
