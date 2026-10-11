import {
  CashFlowResult,
  Goal,
  GoalContributionResult,
  AllocationSuggestion,
  SipProjectionResult,
  RunwayResult,
  RiskProfile,
} from '../types';

/**
 * Format a number into Indian Rupee string (₹).
 * Supports standard format (₹1,25,000) or compact format (₹1.25 L).
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  if (compact) {
    if (absAmount >= 10000000) {
      const cr = parseFloat((absAmount / 10000000).toFixed(2));
      return `${isNegative ? '-' : ''}₹${cr} Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = parseFloat((absAmount / 100000).toFixed(2));
      return `${isNegative ? '-' : ''}₹${lakh} L`;
    }
    if (absAmount >= 1000) {
      const k = parseFloat((absAmount / 1000).toFixed(1));
      return `${isNegative ? '-' : ''}₹${k} k`;
    }
  }

  // Standard Indian numbering: last 3 digits, then pairs of 2 digits
  const str = absAmount.toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);

  let formatted = '';
  if (otherNumbers !== '') {
    formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    formatted = lastThree;
  }

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Calculate Monthly Cash Flow.
 * Formula: Take-home Income - Essential Expenses - Optional Expenses - Existing Commitments.
 */
export function calculateCashFlow(
  takeHome: number,
  essentialExpenses: number,
  optionalExpenses: number,
  existingCommitments: number
): CashFlowResult {
  const safeTakeHome = Math.max(0, Number(takeHome) || 0);
  const safeEssentials = Math.max(0, Number(essentialExpenses) || 0);
  const safeOptional = Math.max(0, Number(optionalExpenses) || 0);
  const safeCommitments = Math.max(0, Number(existingCommitments) || 0);

  const totalExpenses = safeEssentials + safeOptional + safeCommitments;
  const surplusCashFlow = safeTakeHome - totalExpenses;
  const isDeficit = surplusCashFlow < 0;

  const savingsRate = safeTakeHome > 0 && !isDeficit
    ? Math.round((surplusCashFlow / safeTakeHome) * 100)
    : 0;

  return {
    takeHome: safeTakeHome,
    totalExpenses,
    essentialExpenses: safeEssentials,
    optionalExpenses: safeOptional,
    existingCommitments: safeCommitments,
    surplusCashFlow,
    isDeficit,
    savingsRate,
  };
}

/**
 * Calculate Emergency Runway / Job-Loss Survival.
 * Formula: Adjusted Emergency Savings / Essential Monthly Expenses.
 * Adjusted Savings = max(0, currentSavings - oneTimeCost).
 */
export function calculateEmergencyRunway(
  currentSavings: number,
  essentialMonthlyExpenses: number,
  oneTimeEmergencyCost: number = 0
): RunwayResult {
  const safeSavings = Math.max(0, Number(currentSavings) || 0);
  const safeExpenses = Math.max(0, Number(essentialMonthlyExpenses) || 0);
  const safeOneTime = Math.max(0, Number(oneTimeEmergencyCost) || 0);

  const adjustedSavings = Math.max(0, safeSavings - safeOneTime);

  // Case 1: Zero essential expenses
  if (safeExpenses <= 0) {
    return {
      currentSavings: safeSavings,
      adjustedSavings,
      essentialMonthlyExpense: 0,
      runwayMonths: 0,
      runwayDays: 0,
      statusLabel: 'Baseline Required',
      statusColor: 'amber',
      explanation: 'Essential monthly expenses must be entered to calculate how long your savings will last.',
      recommendedAction: 'Enter your basic rent, food, and essential bills to establish a survival baseline.',
    };
  }

  // Case 2: Zero savings available
  if (adjustedSavings <= 0) {
    return {
      currentSavings: safeSavings,
      adjustedSavings: 0,
      essentialMonthlyExpense: safeExpenses,
      runwayMonths: 0,
      runwayDays: 0,
      statusLabel: 'Zero Emergency Buffer',
      statusColor: 'rose',
      explanation: safeSavings > 0
        ? 'Your simulated one-time emergency cost completely exhausts your emergency savings.'
        : 'You currently have zero liquid emergency savings. Any income interruption could force high-interest borrowing.',
      recommendedAction: 'Direct all available monthly cash flow into a high-yield liquid fund until you have at least 1 month of living costs.',
    };
  }

  const runwayMonths = Math.round((adjustedSavings / safeExpenses) * 10) / 10;
  const runwayDays = Math.round(runwayMonths * 30.4375);

  if (runwayMonths < 1.0) {
    return {
      currentSavings: safeSavings,
      adjustedSavings,
      essentialMonthlyExpense: safeExpenses,
      runwayMonths,
      runwayDays,
      statusLabel: 'Critical Buffer (< 1 Month)',
      statusColor: 'rose',
      explanation: `Your buffer will cover approximately ${runwayDays} days of essential expenses. A sudden job loss would cause immediate financial stress.`,
      recommendedAction: 'Pause discretionary spending and allocate at least ₹5,000–₹10,000/mo to an emergency safety net.',
    };
  }

  if (runwayMonths < 3.0) {
    return {
      currentSavings: safeSavings,
      adjustedSavings,
      essentialMonthlyExpense: safeExpenses,
      runwayMonths,
      runwayDays,
      statusLabel: 'Limited Buffer (1–3 Months)',
      statusColor: 'amber',
      explanation: `You have ${runwayMonths} months of essential runway. This provides basic breathing room, but modern job searches typically take 3 to 6 months.`,
      recommendedAction: 'Target reaching a 3-month safety cushion before aggressively scaling stock market SIPs.',
    };
  }

  if (runwayMonths < 6.0) {
    return {
      currentSavings: safeSavings,
      adjustedSavings,
      essentialMonthlyExpense: safeExpenses,
      runwayMonths,
      runwayDays,
      statusLabel: 'Healthy Cushion (3–6 Months)',
      statusColor: 'emerald',
      explanation: `You have ${runwayMonths} months of protection. You are well-insulated against sudden layoffs or unexpected medical events.`,
      recommendedAction: 'Maintain this balance in liquid FD/funds and direct remaining monthly cash flow to goals and long-term SIPs.',
    };
  }

  return {
    currentSavings: safeSavings,
    adjustedSavings,
    essentialMonthlyExpense: safeExpenses,
    runwayMonths,
    runwayDays,
    statusLabel: 'Strong Runway (6+ Months)',
    statusColor: 'emerald',
    explanation: `Outstanding! You have ${runwayMonths} months of essential coverage. You have achieved professional independence and defensive safety.`,
    recommendedAction: 'Your emergency cushion is solid. Channel 80%+ of monthly surplus into wealth creation (index funds & PPF/EPF).',
  };
}

/**
 * Calculate Monthly Contributions for Financial Goals.
 * Flags unaffordable goals when aggregate monthly target exceeds surplus.
 */
export function calculateGoalContributions(
  goals: Goal[],
  monthlySurplus: number
): {
  results: GoalContributionResult[];
  totalRequiredMonthly: number;
  isOverallAffordable: boolean;
  shortfallAmount: number;
} {
  let totalRequiredMonthly = 0;
  const safeSurplus = Math.max(0, monthlySurplus);

  const results: GoalContributionResult[] = goals.map((goal) => {
    const remainingAmount = Math.max(0, goal.targetAmount - (goal.currentSaved || 0));
    const targetMonths = Math.max(1, goal.targetMonths || 1);
    const requiredMonthly = remainingAmount === 0 ? 0 : Math.ceil(remainingAmount / targetMonths);

    totalRequiredMonthly += requiredMonthly;

    const isAffordable = requiredMonthly <= safeSurplus;
    const monthsToCompleteWithSurplus = safeSurplus > 0
      ? Math.ceil(remainingAmount / safeSurplus)
      : Infinity;

    return {
      goalId: goal.id,
      title: goal.title,
      remainingAmount,
      requiredMonthly,
      isAffordable,
      monthsToCompleteWithSurplus,
    };
  });

  const isOverallAffordable = totalRequiredMonthly <= safeSurplus;
  const shortfallAmount = Math.max(0, totalRequiredMonthly - safeSurplus);

  return {
    results,
    totalRequiredMonthly,
    isOverallAffordable,
    shortfallAmount,
  };
}

/**
 * Transparent Suggested Allocation Engine.
 * Adapts strictly to user's real cash flow. Never manufactures unaffordable investments.
 */
export function calculateSuggestedAllocation(
  takeHome: number,
  essentialExpenses: number,
  optionalExpenses: number,
  existingCommitments: number,
  currentEmergencySavings: number,
  goals: Goal[],
  riskProfile: RiskProfile
): AllocationSuggestion {
  const cashFlow = calculateCashFlow(
    takeHome,
    essentialExpenses,
    optionalExpenses,
    existingCommitments
  );

  // If user has a deficit (expenses > income)
  if (cashFlow.isDeficit || cashFlow.surplusCashFlow <= 0) {
    const deficit = Math.abs(cashFlow.surplusCashFlow);
    return {
      essentialsAmount: cashFlow.essentialExpenses + cashFlow.existingCommitments,
      essentialsPct: takeHome > 0 ? Math.round(((cashFlow.essentialExpenses + cashFlow.existingCommitments) / takeHome) * 100) : 100,
      optionalAmount: cashFlow.optionalExpenses,
      optionalPct: takeHome > 0 ? Math.round((cashFlow.optionalExpenses / takeHome) * 100) : 0,
      emergencyFundAmount: 0,
      emergencyFundPct: 0,
      goalsAmount: 0,
      goalsPct: 0,
      investmentsAmount: 0,
      investmentsPct: 0,
      unallocatedCash: 0,
      unallocatedPct: 0,
      totalAllocated: cashFlow.totalExpenses,
      explanation: `Your expenses exceed your take-home pay by ${formatINR(deficit)}/month. You are operating in a monthly cash deficit.`,
      affordabilityNotice: `No funds can be responsibly allocated to new SIPs or savings until essential expenses are reduced or optional spending is trimmed by at least ${formatINR(deficit)}.`,
    };
  }

  const surplus = cashFlow.surplusCashFlow;
  const runwayMonths = cashFlow.essentialExpenses > 0
    ? currentEmergencySavings / cashFlow.essentialExpenses
    : 0;

  // Smart prioritization based on emergency cushion status:
  let emergencyPct = 0;
  if (runwayMonths < 1.0) {
    emergencyPct = 0.50; // 50% of surplus to build initial 1-month safety fund
  } else if (runwayMonths < 3.0) {
    emergencyPct = 0.35; // 35% of surplus to reach 3 months
  } else if (runwayMonths < 6.0) {
    emergencyPct = 0.15; // 15% maintenance allocation
  } else {
    emergencyPct = 0.05; // 5% small liquid buffer
  }

  const emergencyAmount = Math.round(surplus * emergencyPct);
  const remainingAfterEmergency = surplus - emergencyAmount;

  // Goals allocation: Check goals requirement
  const { totalRequiredMonthly } = calculateGoalContributions(goals, remainingAfterEmergency);
  let goalsAmount = Math.min(remainingAfterEmergency, totalRequiredMonthly);
  // Cap goals at 40% of remaining if user has large long-term horizon
  if (goals.length > 0 && goalsAmount > remainingAfterEmergency * 0.6) {
    goalsAmount = Math.round(remainingAfterEmergency * 0.5);
  }

  const remainingAfterGoals = remainingAfterEmergency - goalsAmount;

  // Investment Allocation (SIP/Equity based on risk profile)
  // Conservative: more debt/liquid; Growth: higher equity
  const investmentRatio = riskProfile.category === 'growth' ? 0.85 : riskProfile.category === 'moderate' ? 0.75 : 0.60;
  const investmentsAmount = Math.round(remainingAfterGoals * investmentRatio);
  const unallocatedCash = Math.max(0, remainingAfterGoals - investmentsAmount);

  const essentialsTotal = cashFlow.essentialExpenses + cashFlow.existingCommitments;

  return {
    essentialsAmount: essentialsTotal,
    essentialsPct: Math.round((essentialsTotal / takeHome) * 100),
    optionalAmount: cashFlow.optionalExpenses,
    optionalPct: Math.round((cashFlow.optionalExpenses / takeHome) * 100),
    emergencyFundAmount: emergencyAmount,
    emergencyFundPct: Math.round((emergencyAmount / takeHome) * 100),
    goalsAmount,
    goalsPct: Math.round((goalsAmount / takeHome) * 100),
    investmentsAmount,
    investmentsPct: Math.round((investmentsAmount / takeHome) * 100),
    unallocatedCash,
    unallocatedPct: Math.round((unallocatedCash / takeHome) * 100),
    totalAllocated: essentialsTotal + cashFlow.optionalExpenses + emergencyAmount + goalsAmount + investmentsAmount + unallocatedCash,
    explanation: runwayMonths < 3
      ? `Priority assigned to Emergency Buffer (${formatINR(emergencyAmount)}/mo) to protect against unexpected shocks, with ${formatINR(investmentsAmount)}/mo channeled into long-term SIPs.`
      : `Solid emergency cushion detected (${runwayMonths.toFixed(1)} mos). Channeling ${formatINR(investmentsAmount)}/mo toward wealth compounding and ${formatINR(goalsAmount)}/mo toward your targets.`,
    affordabilityNotice: undefined,
  };
}

/**
 * Systematic Investment Plan (SIP) Projection Calculator.
 * End-of-month contribution compound formula:
 * FV = P * [ ((1 + r)^n - 1) / r ]
 * Where P = monthly deposit, r = monthly return (annual / 12 / 100), n = total months.
 * For r == 0: FV = P * n.
 */
export function calculateSipProjection(
  monthlyContribution: number,
  expectedAnnualReturn: number,
  durationYears: number
): SipProjectionResult {
  const P = Math.max(0, Number(monthlyContribution) || 0);
  const annualReturn = Number(expectedAnnualReturn) || 0;
  const years = Math.max(1, Math.min(40, Number(durationYears) || 1));
  const totalMonths = years * 12;

  if (P === 0) {
    return {
      monthlyInvestment: 0,
      expectedAnnualReturn: annualReturn,
      durationYears: years,
      totalMonths,
      totalInvested: 0,
      projectedWealth: 0,
      wealthGain: 0,
      yearlyBreakdown: Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        invested: 0,
        futureValue: 0,
        returns: 0,
      })),
    };
  }

  const totalInvested = P * totalMonths;
  const monthlyRate = annualReturn / (12 * 100);

  let projectedWealth = 0;
  if (monthlyRate <= 0) {
    projectedWealth = totalInvested;
  } else {
    // Standard end-of-month SIP formula:
    projectedWealth = P * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  }

  projectedWealth = Math.round(projectedWealth);
  const wealthGain = Math.max(0, projectedWealth - totalInvested);

  // Generate Year-by-Year breakdown for charts
  const yearlyBreakdown = [];
  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const invested = P * months;
    let fv = 0;
    if (monthlyRate <= 0) {
      fv = invested;
    } else {
      fv = Math.round(P * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
    }
    yearlyBreakdown.push({
      year: y,
      invested,
      futureValue: fv,
      returns: Math.max(0, fv - invested),
    });
  }

  return {
    monthlyInvestment: P,
    expectedAnnualReturn: annualReturn,
    durationYears: years,
    totalMonths,
    totalInvested,
    projectedWealth,
    wealthGain,
    yearlyBreakdown,
  };
}

/**
 * Score Beginner Risk Profile Questionnaire (6 questions).
 */
export function evaluateRiskProfile(answers: { questionId: string; selectedOption: number }[]): RiskProfile {
  // Score range: 0 to 18 (each of 6 questions 0-3 points)
  let totalScore = 0;
  answers.forEach((ans) => {
    totalScore += ans.selectedOption || 0;
  });

  if (totalScore <= 6) {
    return {
      category: 'conservative',
      score: totalScore,
      label: 'Conservative / Capital Preservation',
      explanation: 'You prioritize safety of capital, liquidity, and minimal downside volatility. You prefer building strong bank deposits, debt funds, and steady emergency reserves before entering high-volatility markets.',
      suggestedEquityRatio: 0.3,
      answers,
    };
  }

  if (totalScore <= 12) {
    return {
      category: 'moderate',
      score: totalScore,
      label: 'Moderate / Balanced Wealth Builder',
      explanation: 'You are comfortable with normal market fluctuations over a 3–5 year horizon to beat inflation. You balance low-cost broad index funds (Nifty 50) with safe liquid deposits and debt buffers.',
      suggestedEquityRatio: 0.6,
      answers,
    };
  }

  return {
    category: 'growth',
    score: totalScore,
    label: 'Growth-Oriented / Long-Term Wealth Accumulator',
    explanation: 'You have a multi-year horizon and can stomach market drawdowns without panic selling. You seek higher long-term compounding through disciplined equity SIPs while maintaining a defensive emergency cushion.',
    suggestedEquityRatio: 0.8,
    answers,
  };
}
