import { describe, it, expect } from 'vitest';
import {
  formatINR,
  calculateCashFlow,
  calculateEmergencyRunway,
  calculateGoalContributions,
  calculateSipProjection,
  calculateSuggestedAllocation,
  evaluateRiskProfile,
} from './calculations';
import { Goal, RiskProfile } from '../types';

describe('Financial Calculations - FirstSalary OS Contracts', () => {
  describe('formatINR', () => {
    it('formats numbers in standard Indian Rupee format', () => {
      expect(formatINR(0)).toBe('₹0');
      expect(formatINR(500)).toBe('₹500');
      expect(formatINR(1000)).toBe('₹1,000');
      expect(formatINR(125000)).toBe('₹1,25,000');
      expect(formatINR(1500000)).toBe('₹15,00,000');
      expect(formatINR(-25000)).toBe('-₹25,000');
    });

    it('formats compact INR when requested', () => {
      expect(formatINR(50000, true)).toBe('₹50 k');
      expect(formatINR(150000, true)).toBe('₹1.5 L');
      expect(formatINR(25000000, true)).toBe('₹2.5 Cr');
    });
  });

  describe('calculateCashFlow', () => {
    it('calculates surplus and savings rate correctly', () => {
      const result = calculateCashFlow(65000, 25000, 15000, 5000);
      expect(result.takeHome).toBe(65000);
      expect(result.totalExpenses).toBe(45000);
      expect(result.surplusCashFlow).toBe(20000);
      expect(result.isDeficit).toBe(false);
      expect(result.savingsRate).toBe(31); // 20000/65000 = 30.76% -> 31%
    });

    it('handles deficit when expenses exceed income', () => {
      const result = calculateCashFlow(40000, 30000, 15000, 0);
      expect(result.surplusCashFlow).toBe(-5000);
      expect(result.isDeficit).toBe(true);
      expect(result.savingsRate).toBe(0);
    });

    it('handles zero income and negative inputs gracefully', () => {
      const result = calculateCashFlow(0, 20000, 0, 0);
      expect(result.takeHome).toBe(0);
      expect(result.surplusCashFlow).toBe(-20000);
      expect(result.isDeficit).toBe(true);
      expect(result.savingsRate).toBe(0);
    });
  });

  describe('calculateEmergencyRunway (Job-Loss Survival)', () => {
    it('calculates correct runway with existing savings', () => {
      const result = calculateEmergencyRunway(75000, 25000, 0);
      expect(result.runwayMonths).toBe(3.0);
      expect(result.runwayDays).toBe(91);
      expect(result.statusColor).toBe('emerald');
    });

    it('handles zero essential expenses without division by zero', () => {
      const result = calculateEmergencyRunway(50000, 0, 0);
      expect(result.runwayMonths).toBe(0);
      expect(result.runwayDays).toBe(0);
      expect(result.statusLabel).toBe('Baseline Required');
    });

    it('handles zero savings correctly', () => {
      const result = calculateEmergencyRunway(0, 30000, 0);
      expect(result.runwayMonths).toBe(0);
      expect(result.runwayDays).toBe(0);
      expect(result.statusLabel).toBe('Zero Emergency Buffer');
      expect(result.statusColor).toBe('rose');
    });

    it('subtracts one-time emergency shocks before calculating runway', () => {
      // 1,00,000 savings - 40,000 shock = 60,000 remaining. 60,000 / 30,000 = 2.0 months.
      const result = calculateEmergencyRunway(100000, 30000, 40000);
      expect(result.adjustedSavings).toBe(60000);
      expect(result.runwayMonths).toBe(2.0);
      expect(result.statusColor).toBe('amber');
    });

    it('handles one-time shock exceeding current savings', () => {
      const result = calculateEmergencyRunway(50000, 25000, 80000);
      expect(result.adjustedSavings).toBe(0);
      expect(result.runwayMonths).toBe(0);
      expect(result.statusColor).toBe('rose');
    });

    it('calculates reality scenario: ₹30k salary, ₹20k expenses (₹15k essentials, ₹5k optional), ₹8k unexpected shock', () => {
      // 1. Monthly Cash flow check
      const cashFlow = calculateCashFlow(30000, 15000, 5000, 0);
      expect(cashFlow.takeHome).toBe(30000);
      expect(cashFlow.totalExpenses).toBe(20000);
      expect(cashFlow.surplusCashFlow).toBe(10000);
      expect(cashFlow.savingsRate).toBe(33); // 10000 / 30000 = 33%

      // 2. Emergency runway with ₹30,000 initial savings and ₹8,000 one-time emergency shock
      // Adjusted savings = 30000 - 8000 = 22,000
      // Essential monthly expenses = 15,000
      // Runway = 22000 / 15000 = 1.47 -> 1.5 months
      const runway = calculateEmergencyRunway(30000, 15000, 8000);
      expect(runway.adjustedSavings).toBe(22000);
      expect(runway.runwayMonths).toBe(1.5);
      expect(runway.statusColor).toBe('amber');
    });
  });

  describe('calculateGoalContributions', () => {
    const goals: Goal[] = [
      {
        id: '1',
        title: 'Emergency Fund 3-Month',
        category: 'emergency',
        targetAmount: 90000,
        currentSaved: 30000, // 60,000 remaining over 6 months = 10,000/mo
        targetMonths: 6,
        priority: 'high',
      },
      {
        id: '2',
        title: 'Laptop Workstation',
        category: 'purchase',
        targetAmount: 80000,
        currentSaved: 20000, // 60,000 remaining over 12 months = 5,000/mo
        targetMonths: 12,
        priority: 'medium',
      },
    ];

    it('calculates required monthly savings accurately', () => {
      const check = calculateGoalContributions(goals, 20000);
      expect(check.totalRequiredMonthly).toBe(15000);
      expect(check.isOverallAffordable).toBe(true);
      expect(check.shortfallAmount).toBe(0);
    });

    it('identifies when total goals exceed monthly surplus', () => {
      const check = calculateGoalContributions(goals, 10000); // 15000 needed vs 10000 surplus
      expect(check.isOverallAffordable).toBe(false);
      expect(check.shortfallAmount).toBe(5000);
    });

    it('handles already completed goals gracefully', () => {
      const completedGoals: Goal[] = [
        {
          id: 'c1',
          title: 'Finished Goal',
          category: 'other',
          targetAmount: 50000,
          currentSaved: 50000,
          targetMonths: 5,
          priority: 'low',
        },
      ];
      const check = calculateGoalContributions(completedGoals, 10000);
      expect(check.results[0].remainingAmount).toBe(0);
      expect(check.results[0].requiredMonthly).toBe(0);
      expect(check.totalRequiredMonthly).toBe(0);
    });
  });

  describe('calculateSipProjection', () => {
    it('calculates compound SIP end-of-month correctly for 10 years at 12%', () => {
      const sip = calculateSipProjection(10000, 12, 10);
      expect(sip.totalInvested).toBe(1200000);
      // FV ~ 23,00,387
      expect(sip.projectedWealth).toBeGreaterThan(2290000);
      expect(sip.projectedWealth).toBeLessThan(2320000);
      expect(sip.wealthGain).toBe(sip.projectedWealth - 1200000);
      expect(sip.yearlyBreakdown.length).toBe(10);
    });

    it('handles zero expected return without error', () => {
      const sip = calculateSipProjection(5000, 0, 5);
      expect(sip.totalInvested).toBe(300000);
      expect(sip.projectedWealth).toBe(300000);
      expect(sip.wealthGain).toBe(0);
    });

    it('handles zero monthly investment', () => {
      const sip = calculateSipProjection(0, 12, 5);
      expect(sip.totalInvested).toBe(0);
      expect(sip.projectedWealth).toBe(0);
      expect(sip.wealthGain).toBe(0);
    });
  });

  describe('calculateSuggestedAllocation', () => {
    const dummyRiskProfile: RiskProfile = {
      category: 'moderate',
      score: 10,
      label: 'Moderate',
      explanation: 'Balanced',
      suggestedEquityRatio: 0.6,
      answers: [],
    };

    it('does not allocate savings if cash flow is in deficit', () => {
      const alloc = calculateSuggestedAllocation(50000, 40000, 15000, 0, 10000, [], dummyRiskProfile);
      expect(alloc.emergencyFundAmount).toBe(0);
      expect(alloc.investmentsAmount).toBe(0);
      expect(alloc.affordabilityNotice).toBeDefined();
    });

    it('allocates a higher portion to emergency buffer when runway is low', () => {
      // Runway is 20,000 / 30,000 = 0.67 months (< 1 month)
      const alloc = calculateSuggestedAllocation(70000, 30000, 15000, 0, 20000, [], dummyRiskProfile);
      // Surplus = 25,000. Low runway should allocate 50% to emergency fund = 12,500
      expect(alloc.emergencyFundAmount).toBe(12500);
    });
  });

  describe('evaluateRiskProfile', () => {
    it('assigns conservative for low scores', () => {
      const result = evaluateRiskProfile([{ questionId: 'q1', selectedOption: 0 }, { questionId: 'q2', selectedOption: 1 }]);
      expect(result.category).toBe('conservative');
    });

    it('assigns moderate for medium scores', () => {
      const result = evaluateRiskProfile([
        { questionId: 'q1', selectedOption: 2 },
        { questionId: 'q2', selectedOption: 2 },
        { questionId: 'q3', selectedOption: 2 },
        { questionId: 'q4', selectedOption: 2 },
      ]);
      expect(result.category).toBe('moderate');
    });

    it('assigns growth for high scores', () => {
      const result = evaluateRiskProfile([
        { questionId: 'q1', selectedOption: 3 },
        { questionId: 'q2', selectedOption: 3 },
        { questionId: 'q3', selectedOption: 3 },
        { questionId: 'q4', selectedOption: 3 },
        { questionId: 'q5', selectedOption: 3 },
      ]);
      expect(result.category).toBe('growth');
    });
  });
});
