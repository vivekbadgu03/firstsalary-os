export type RiskCategory = 'conservative' | 'moderate' | 'growth';

export interface RiskAnswer {
  questionId: string;
  selectedOption: number;
}

export interface RiskProfile {
  category: RiskCategory;
  score: number;
  label: string;
  explanation: string;
  suggestedEquityRatio: number; // e.g. 0.3 for conservative, 0.6 for moderate, 0.8 for growth
  answers: RiskAnswer[];
}

export interface Goal {
  id: string;
  title: string;
  category: 'emergency' | 'purchase' | 'education' | 'travel' | 'retirement' | 'other';
  targetAmount: number;
  currentSaved: number;
  targetMonths: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ExpenseBreakdown {
  rentHousing: number;
  groceriesFood: number;
  utilitiesBills: number;
  transportCommute: number;
  insuranceMedical: number;
  otherEssentials: number;
}

export interface OptionalExpenseBreakdown {
  diningOut: number;
  subscriptions: number;
  shoppingLeisure: number;
  travelEntertainment: number;
  otherWants: number;
}

export interface FinancialPlan {
  id: string;
  userId?: string;
  planName: string;
  userName: string;
  userEmail?: string;
  // Income
  monthlyTakeHome: number;
  // Expenses
  essentialExpenses: number;
  essentialBreakdown?: ExpenseBreakdown;
  optionalExpenses: number;
  optionalBreakdown?: OptionalExpenseBreakdown;
  existingCommitments: number; // EMIs, loans, family support
  // Savings & Runway
  currentEmergencySavings: number;
  // Goals
  goals: Goal[];
  // Risk Profile
  riskProfile: RiskProfile;
  // SIP / Investment assumption
  sipMonthlyAmount: number;
  sipExpectedReturnRate: number; // annual percentage e.g. 12
  sipDurationYears: number;
  // Emergency Budget Simulation settings
  emergencyBudgetActive: boolean;
  emergencyIncomeReductionPct: number; // e.g. 100 for 0 income, 50 for 50%
  emergencyDiscretionaryCutPct: number; // e.g. 80 for 80% cut
  emergencyOneTimeShock: number; // e.g. 30000
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowResult {
  takeHome: number;
  totalExpenses: number;
  essentialExpenses: number;
  optionalExpenses: number;
  existingCommitments: number;
  surplusCashFlow: number; // can be negative (shortfall)
  isDeficit: boolean;
  savingsRate: number; // surplus as percentage of income (0 if deficit)
}

export interface RunwayResult {
  currentSavings: number;
  adjustedSavings: number;
  essentialMonthlyExpense: number;
  runwayMonths: number;
  runwayDays: number;
  statusLabel: string;
  statusColor: 'rose' | 'amber' | 'emerald' | 'blue';
  explanation: string;
  recommendedAction: string;
}

export interface GoalContributionResult {
  goalId: string;
  title: string;
  remainingAmount: number;
  requiredMonthly: number;
  isAffordable: boolean;
  monthsToCompleteWithSurplus: number;
}

export interface AllocationSuggestion {
  essentialsAmount: number;
  essentialsPct: number;
  optionalAmount: number;
  optionalPct: number;
  emergencyFundAmount: number;
  emergencyFundPct: number;
  goalsAmount: number;
  goalsPct: number;
  investmentsAmount: number;
  investmentsPct: number;
  unallocatedCash: number;
  unallocatedPct: number;
  totalAllocated: number;
  explanation: string;
  affordabilityNotice?: string;
}

export interface SipProjectionResult {
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  durationYears: number;
  totalMonths: number;
  totalInvested: number;
  projectedWealth: number;
  wealthGain: number;
  yearlyBreakdown: Array<{
    year: number;
    invested: number;
    futureValue: number;
    returns: number;
  }>;
}

export interface LifeScenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  incomeMultiplier: number; // 0 for job loss, 0.75 for 25% cut, 1 for normal
  essentialExpenseDelta: number; // +8000 for rent hike
  oneTimeCost: number; // +50000 for medical
  recommendedActions: string[];
}
