import { FinancialPlan } from '../types';

export const DEFAULT_PLAN: FinancialPlan = {
  id: 'plan_demo_aarav_01',
  userName: 'Aarav Sharma',
  userEmail: 'aarav.sharma@example.com',
  planName: 'First Salary Launch Plan',
  monthlyTakeHome: 65000,
  essentialExpenses: 28000,
  essentialBreakdown: {
    rentHousing: 16000,
    groceriesFood: 6000,
    utilitiesBills: 2500,
    transportCommute: 2500,
    insuranceMedical: 1000,
    otherEssentials: 0,
  },
  optionalExpenses: 12000,
  optionalBreakdown: {
    diningOut: 5000,
    subscriptions: 1500,
    shoppingLeisure: 4000,
    travelEntertainment: 1500,
    otherWants: 0,
  },
  existingCommitments: 0,
  currentEmergencySavings: 45000,
  goals: [
    {
      id: 'goal_emergency_01',
      title: '3-Month Emergency Cushion',
      category: 'emergency',
      targetAmount: 84000,
      currentSaved: 45000,
      targetMonths: 6,
      priority: 'high',
    },
    {
      id: 'goal_workstation_02',
      title: 'MacBook / Workstation Setup',
      category: 'purchase',
      targetAmount: 75000,
      currentSaved: 15000,
      targetMonths: 10,
      priority: 'medium',
    },
    {
      id: 'goal_travel_03',
      title: 'First Solo Travel Trip',
      category: 'travel',
      targetAmount: 30000,
      currentSaved: 6000,
      targetMonths: 6,
      priority: 'low',
    },
  ],
  riskProfile: {
    category: 'moderate',
    score: 10,
    label: 'Moderate / Balanced Wealth Builder',
    explanation: 'Comfortable with normal market movements over 3-5 years. Balances broad-market equity index funds with defensive emergency bank buffers.',
    suggestedEquityRatio: 0.6,
    answers: [
      { questionId: 'horizon', selectedOption: 2 },
      { questionId: 'volatility', selectedOption: 2 },
      { questionId: 'loss_reaction', selectedOption: 1 },
      { questionId: 'emergency_ready', selectedOption: 1 },
      { questionId: 'knowledge', selectedOption: 2 },
      { questionId: 'dependents', selectedOption: 2 },
    ],
  },
  sipMonthlyAmount: 10000,
  sipExpectedReturnRate: 12,
  sipDurationYears: 10,
  emergencyBudgetActive: false,
  emergencyIncomeReductionPct: 100, // 0 income if job lost
  emergencyDiscretionaryCutPct: 75, // 75% cut on dining & shopping
  emergencyOneTimeShock: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const RISK_QUESTIONS = [
  {
    id: 'horizon',
    question: 'How long do you intend to keep your invested money untouched?',
    options: [
      { label: 'Less than 1 year (Need liquid safety)', points: 0 },
      { label: '1 to 3 years (Short to medium-term goals)', points: 1 },
      { label: '3 to 5 years (Medium term, some volatility OK)', points: 2 },
      { label: '5+ to 10+ years (Long-term compounding)', points: 3 },
    ],
  },
  {
    id: 'volatility',
    question: 'If the stock market drops 15% in a single month, what is your initial reaction?',
    options: [
      { label: 'Panic and exit all investments immediately', points: 0 },
      { label: 'Feel anxious and halt future monthly SIPs', points: 1 },
      { label: 'Stay calm and continue monthly SIPs as scheduled', points: 2 },
      { label: 'See it as a discount and invest extra surplus cash', points: 3 },
    ],
  },
  {
    id: 'emergency_ready',
    question: 'How many months of basic living expenses do you currently hold in liquid cash/savings?',
    options: [
      { label: 'Less than 1 month or living paycheck-to-paycheck', points: 0 },
      { label: '1 to 2 months of basic expenses', points: 1 },
      { label: '3 to 5 months of basic expenses', points: 2 },
      { label: '6+ months fully funded in liquid accounts', points: 3 },
    ],
  },
  {
    id: 'knowledge',
    question: 'What is your familiarity with investment products (Mutual Funds, SIPs, Index Funds)?',
    options: [
      { label: 'Complete beginner (only know bank Savings & FDs)', points: 0 },
      { label: 'Basic understanding of SIPs and mutual funds', points: 1 },
      { label: 'Familiar with index funds, debt vs equity, and compounding', points: 2 },
      { label: 'Experienced with asset allocation, direct equity & tax implications', points: 3 },
    ],
  },
  {
    id: 'dependents',
    question: 'Do you have financial dependents or mandatory monthly family commitments?',
    options: [
      { label: 'Heavy financial dependents & non-negotiable monthly family support', points: 0 },
      { label: 'Moderate monthly contributions to household expenses', points: 1 },
      { label: 'Self-sufficient with occasional gifts or support', points: 2 },
      { label: 'Solely financially responsible for myself right now', points: 3 },
    ],
  },
  {
    id: 'loss_reaction',
    question: 'What matters more to you at this stage of your early career?',
    options: [
      { label: '100% Capital safety — cannot tolerate any loss of capital', points: 0 },
      { label: 'Beating inflation with minimal downside risk', points: 1 },
      { label: 'Balanced wealth creation with moderate calculated risk', points: 2 },
      { label: 'Maximizing long-term growth even if year-to-year swings are high', points: 3 },
    ],
  },
];
