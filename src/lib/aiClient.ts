import { FinancialPlanContext } from '../server/aiHandler';
import { FinancialPlan } from '../types';
import {
  calculateCashFlow,
  calculateEmergencyRunway,
  calculateSipProjection,
} from './calculations';

export interface AiStatus {
  isConfigured: boolean;
  provider: 'gemini' | 'openai' | 'groq' | 'none';
  availableModels: string[];
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isLiveAi: boolean;
  provider: string;
}

export async function checkAiServerStatus(): Promise<AiStatus> {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not reach /api/ai/status', err);
  }
  return {
    isConfigured: false,
    provider: 'none',
    availableModels: [],
  };
}

export function buildPlanContextFromPlan(
  plan: FinancialPlan,
  simContext?: {
    simSalary: number;
    simEssentials: number;
    simOptional: number;
    simShock: number;
    cashFlowDelta: number;
    runwayDelta: number;
  }
): FinancialPlanContext {
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

  const sip = calculateSipProjection(
    plan.sipMonthlyAmount,
    plan.sipExpectedReturnRate,
    plan.sipDurationYears
  );

  const goalsSummary = plan.goals.map((g) => `${g.title} (₹${g.targetAmount.toLocaleString('en-IN')})`).join(', ');

  return {
    userName: plan.userName || 'First-Time Earner',
    monthlyTakeHome: plan.monthlyTakeHome,
    essentialExpenses: plan.essentialExpenses,
    optionalExpenses: plan.optionalExpenses,
    existingCommitments: plan.existingCommitments,
    surplusCashFlow: cashFlow.surplusCashFlow,
    isDeficit: cashFlow.isDeficit,
    savingsRate: cashFlow.savingsRate,
    currentEmergencySavings: plan.currentEmergencySavings,
    emergencyRunwayMonths: runway.runwayMonths,
    emergencyRunwayDays: runway.runwayDays,
    emergencyStatus: runway.statusLabel,
    goalsCount: plan.goals.length,
    goalsSummary: goalsSummary || 'No goals registered yet',
    riskProfileCategory: plan.riskProfile.category,
    riskProfileLabel: plan.riskProfile.label,
    sipMonthlyAmount: plan.sipMonthlyAmount,
    sipExpectedReturnRate: plan.sipExpectedReturnRate,
    sip10YearProjectedWealth: sip.projectedWealth,
    simulatedContext: simContext,
  };
}

export async function askAiAssistant(
  message: string,
  plan: FinancialPlan,
  simContext?: {
    simSalary: number;
    simEssentials: number;
    simOptional: number;
    simShock: number;
    cashFlowDelta: number;
    runwayDelta: number;
  }
): Promise<{
  text: string;
  isLiveAi: boolean;
  provider: string;
  statusNote?: string;
}> {
  const planContext = buildPlanContextFromPlan(plan, simContext);

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, planContext }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.response || 'No response generated.',
        isLiveAi: Boolean(data.isLiveAi),
        provider: data.provider || 'system',
        statusNote: data.message,
      };
    }
  } catch (err) {
    console.warn('AI request failed, falling back:', err);
  }

  // Pure client fallback if network fetch fails
  return {
    text: `### 📊 Instant Plan Summary\n- **Take-Home:** ₹${plan.monthlyTakeHome.toLocaleString('en-IN')}\n- **Living Outflows:** ₹${(plan.essentialExpenses + plan.optionalExpenses + plan.existingCommitments).toLocaleString('en-IN')}\n- **Emergency Cushion:** ${planContext.emergencyRunwayMonths.toFixed(1)} Months\n\nEnsure your 3-month safety fund is protected before scaling up equity investments.`,
    isLiveAi: false,
    provider: 'deterministic',
    statusNote: 'Operating in local client fallback mode.',
  };
}
