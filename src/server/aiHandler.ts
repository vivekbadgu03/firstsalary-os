export interface FinancialPlanContext {
  userName: string;
  monthlyTakeHome: number;
  essentialExpenses: number;
  optionalExpenses: number;
  existingCommitments: number;
  surplusCashFlow: number;
  isDeficit: boolean;
  savingsRate: number;
  currentEmergencySavings: number;
  emergencyRunwayMonths: number;
  emergencyRunwayDays: number;
  emergencyStatus: string;
  goalsCount: number;
  goalsSummary: string;
  riskProfileCategory: string;
  riskProfileLabel: string;
  sipMonthlyAmount: number;
  sipExpectedReturnRate: number;
  sip10YearProjectedWealth: number;
  simulatedContext?: {
    simSalary: number;
    simEssentials: number;
    simOptional: number;
    simShock: number;
    cashFlowDelta: number;
    runwayDelta: number;
  };
}

/**
 * Construct contextual system prompt embedding user's financial reality
 */
export function buildFinancialSystemPrompt(plan: FinancialPlanContext): string {
  return `You are FirstSalary OS AI — a dedicated FinTech financial planning companion for first-time earners and new employees in India.
Your mission is to help the user understand their first salary, protect against job loss or financial emergencies, and plan disciplined savings, SIPs, and goal allocations.

CURRENT USER FINANCIAL REALITY (Live plan data):
- User Name: ${plan.userName || 'First-Time Earner'}
- Monthly Take-Home Salary: ₹${plan.monthlyTakeHome.toLocaleString('en-IN')}
- Essential Living Needs (Rent, Food, Utilities, Transit): ₹${plan.essentialExpenses.toLocaleString('en-IN')}
- Discretionary Spending (Dining, OTT, Shopping): ₹${plan.optionalExpenses.toLocaleString('en-IN')}
- Prior Monthly Commitments (EMIs, Family Support): ₹${plan.existingCommitments.toLocaleString('en-IN')}
- Free Monthly Cash Flow: ₹${plan.surplusCashFlow.toLocaleString('en-IN')} (${plan.isDeficit ? 'DEFICIT ALERT: Expenses exceed salary!' : `${plan.savingsRate}% savings rate`})
- Current Liquid Emergency Savings: ₹${plan.currentEmergencySavings.toLocaleString('en-IN')}
- Emergency Runway: ${plan.emergencyRunwayMonths.toFixed(1)} Months (~${plan.emergencyRunwayDays} Days) — Status: "${plan.emergencyStatus}"
- Active Financial Goals: ${plan.goalsCount} goals (${plan.goalsSummary})
- Risk Profile: ${plan.riskProfileLabel} (${plan.riskProfileCategory})
- SIP Strategy: ₹${plan.sipMonthlyAmount.toLocaleString('en-IN')}/mo at ${plan.sipExpectedReturnRate}% expected return (10Y projected value: ₹${plan.sip10YearProjectedWealth.toLocaleString('en-IN')})
${plan.simulatedContext ? `
SIMULATED REALITY SCENARIO ACTIVE:
- Simulated Salary: ₹${plan.simulatedContext.simSalary.toLocaleString('en-IN')}
- Simulated Essentials: ₹${plan.simulatedContext.simEssentials.toLocaleString('en-IN')}
- Simulated Optional: ₹${plan.simulatedContext.simOptional.toLocaleString('en-IN')}
- Simulated One-Time Shock: ₹${plan.simulatedContext.simShock.toLocaleString('en-IN')}
- Cash Flow Change: ₹${plan.simulatedContext.cashFlowDelta.toLocaleString('en-IN')}
- Runway Change: ${plan.simulatedContext.runwayDelta.toFixed(1)} Months
` : ''}

CRITICAL ADVISORY RULES:
1. Always base your advice on the user's actual numbers provided above. Never invent random figures or account balances.
2. If cash flow is in a DEFICIT (surplus is negative or zero), strictly warn against starting aggressive equity SIPs until expenses are trimmed or essential costs reduced.
3. If emergency runway is below 3 months, prioritize building the liquid safety buffer before aggressive stock investing.
4. Explain financial terms simply for a beginner (e.g., SIP, compound interest, emergency fund, index fund).
5. State clearly that mutual funds and equity investments carry market risks and projections are educational estimates.
6. Keep your answers concise, practical, and structured with bullet points. Tone: Empathetic, analytical, encouraging, and trustworthy.`;
}

/**
 * High-quality deterministic rule-based analysis for when live AI keys are unconfigured or offline.
 * This guarantees the user receives meaningful, context-aware financial explanations of their exact plan.
 */
export function generateDeterministicFinancialAnalysis(
  userQuery: string,
  plan: FinancialPlanContext
): string {
  const query = userQuery.toLowerCase();

  if (query.includes('explain') && query.includes('salary') || query.includes('plan')) {
    return `### 📊 Breakdown of Your Salary Plan (₹${plan.monthlyTakeHome.toLocaleString('en-IN')}/month)

Here is how your monthly take-home salary is currently distributed:
- **Essential Living Needs:** ₹${plan.essentialExpenses.toLocaleString('en-IN')} (${Math.round((plan.essentialExpenses / (plan.monthlyTakeHome || 1)) * 100)}% of income) — Covers rent, groceries, utilities, and commute.
- **Discretionary Spending:** ₹${plan.optionalExpenses.toLocaleString('en-IN')} (${Math.round((plan.optionalExpenses / (plan.monthlyTakeHome || 1)) * 100)}% of income) — Dining out, OTT, shopping.
- **Prior Commitments:** ₹${plan.existingCommitments.toLocaleString('en-IN')} — EMIs or family remittances.
- **Net Available Cash Flow:** ${plan.isDeficit ? `⚠️ **Deficit of -₹${Math.abs(plan.surplusCashFlow).toLocaleString('en-IN')}/mo**` : `✅ **Surplus of +₹${plan.surplusCashFlow.toLocaleString('en-IN')}/mo** (${plan.savingsRate}% savings rate)`}

**Core Advice for Your Stage:**
${plan.isDeficit
  ? `Your spending currently exceeds your salary. You must freeze discretionary lifestyle spending by at least ₹${Math.abs(plan.surplusCashFlow).toLocaleString('en-IN')} immediately to prevent debt accumulation.`
  : plan.emergencyRunwayMonths < 3
  ? `You have a healthy monthly surplus of ₹${plan.surplusCashFlow.toLocaleString('en-IN')}, but your emergency runway is only **${plan.emergencyRunwayMonths.toFixed(1)} months**. Direct at least 40-50% of your monthly surplus to build an emergency fund to 3 months before expanding long-term equity SIPs.`
  : `Your emergency cushion of **${plan.emergencyRunwayMonths.toFixed(1)} months** is solid! Channel your monthly surplus into disciplined index SIPs and your stated financial goals.`
}`;
  }

  if (query.includes('sip') || query.includes('afford')) {
    if (plan.isDeficit) {
      return `### 🛑 SIP Affordability Assessment

**Verdict:** You currently cannot afford a new SIP.
- Your monthly cash outflow exceeds your salary by **₹${Math.abs(plan.surplusCashFlow).toLocaleString('en-IN')}/month**.
- Starting an automated SIP during an active deficit would cause bank auto-debit bounce charges or force you to borrow on high-interest credit cards (36-42% APR).
- **Recommended Action:** Trim non-essential dining and subscriptions to turn your cash flow positive before committing to a monthly SIP.`;
    }

    if (plan.emergencyRunwayMonths < 1.5) {
      return `### ⚠️ SIP Affordability Assessment

**Verdict:** Feasible, but defensive caution is strongly advised.
- Available surplus: **₹${plan.surplusCashFlow.toLocaleString('en-IN')}/month**.
- Proposed SIP: **₹${plan.sipMonthlyAmount.toLocaleString('en-IN')}/month**.
- **The Risk:** Your emergency buffer is only **${plan.emergencyRunwayMonths.toFixed(1)} months** (~${plan.emergencyRunwayDays} days). If you face an unexpected medical bill or sudden job loss, you would be forced to liquidate your SIP units at a potential short-term loss.
- **Recommended Action:** Split your surplus: Allocate ₹${Math.round(plan.surplusCashFlow * 0.6).toLocaleString('en-IN')} to a high-yield liquid emergency fund and start a conservative starter SIP of ₹${Math.min(plan.sipMonthlyAmount, Math.round(plan.surplusCashFlow * 0.4)).toLocaleString('en-IN')}/month.`;
    }

    return `### ✅ SIP Affordability Assessment

**Verdict:** Yes, you can comfortably afford your planned SIP of **₹${plan.sipMonthlyAmount.toLocaleString('en-IN')}/month**!
- **Available Surplus:** ₹${plan.surplusCashFlow.toLocaleString('en-IN')}/month.
- **Buffer Remaining:** After your ₹${plan.sipMonthlyAmount.toLocaleString('en-IN')} SIP, you still retain **₹${(plan.surplusCashFlow - plan.sipMonthlyAmount).toLocaleString('en-IN')}/month** in unallocated cash flexibility.
- **10-Year Compounding Potential:** At a benchmark 12% annual index return, your ₹${plan.sipMonthlyAmount.toLocaleString('en-IN')}/mo SIP compounds to approximately **₹${plan.sip10YearProjectedWealth.toLocaleString('en-IN')}** in 10 years!`;
  }

  if (query.includes('job') || query.includes('lose') || query.includes('layoff')) {
    return `### 🛡️ Job-Loss Survival Analysis

If your monthly income stops completely tomorrow:
- **Available Liquid Reserves:** ₹${plan.currentEmergencySavings.toLocaleString('en-IN')}
- **Essential Monthly Burn Rate:** ₹${plan.essentialExpenses.toLocaleString('en-IN')}/month (rent, food, electricity, bills)
- **Survival Runway:** **${plan.emergencyRunwayMonths.toFixed(1)} Months (${plan.emergencyRunwayDays} Days)**
- **Status Classification:** ${plan.emergencyStatus}

**Immediate Crisis Playbook:**
1. **Activate Emergency Budget Mode:** Immediately pause all discretionary subscriptions, food deliveries, and shopping. This cuts your monthly burn rate significantly.
2. **Pause Active SIPs:** Halt upcoming SIP auto-debits to preserve cash in your savings account.
3. **Do Not Touch High-Interest Loans:** With ${plan.emergencyRunwayDays} days of basic runway, you have time to pursue job opportunities without taking predatory loans.`;
  }

  if (query.includes('goal') || query.includes('faster')) {
    return `### 🎯 Accelerating Your Financial Goals

You currently have **${plan.goalsCount} active goals** registered in your plan (${plan.goalsSummary}).

**Strategies to Reach Them Faster:**
1. **Prioritize by Deadline & Urgency:** Avoid spreading small amounts across 5 goals simultaneously. Fund your high-priority goals (like your emergency cushion) first.
2. **Capture Incremental Surplus:** If your monthly cash flow is ₹${plan.surplusCashFlow.toLocaleString('en-IN')}, increasing your savings allocation by just ₹2,500/month accelerates your timeline by several months.
3. **Windfall / Bonus Acceleration:** Direct 80% of any quarterly bonuses, tax refunds, or appraisals directly toward goal lump sums.`;
  }

  if (query.includes('allocation') || query.includes('investment')) {
    return `### 📈 Suggested Investment Allocation Rationale

Your recommended allocation is based on your **${plan.riskProfileLabel}** profile and current runway status:
- **Liquid Safety Buffer (Emergency Fund):** ${plan.emergencyRunwayMonths < 3 ? '40-50% of surplus' : '10-15% of surplus'} in liquid savings / sweep-in FDs.
- **Core Equity Compounding (SIP):** ${plan.riskProfileCategory === 'growth' ? '60-70%' : '40-50%'} channeled into low-cost broad market index funds (Nifty 50 / Nifty 500).
- **Short-Term Goal Reserves:** Dedicated recurring deposits or liquid funds to prevent market volatility from disrupting near-term goals.

**Why this matters:** For a first-time earner, asset allocation protects your mental peace during stock market dips so you never panic-sell your investments.`;
  }

  // General contextual response
  return `### 💡 Contextual Financial Advisor Insights

Based on your current financial plan:
- **Salary:** ₹${plan.monthlyTakeHome.toLocaleString('en-IN')}/mo | **Surplus:** ₹${plan.surplusCashFlow.toLocaleString('en-IN')}/mo
- **Emergency Runway:** ${plan.emergencyRunwayMonths.toFixed(1)} Months (${plan.emergencyRunwayDays} Days)
- **Risk Profile:** ${plan.riskProfileLabel}

${plan.isDeficit
  ? '⚠️ **Urgent Priority:** You have an active monthly deficit. Focus on reducing discretionary costs before starting new savings commitments.'
  : plan.emergencyRunwayMonths < 3
  ? '🛡️ **Defensive Priority:** Your primary objective over the next 3 to 6 months should be building a 3-month emergency cushion (₹' + (plan.essentialExpenses * 3).toLocaleString('en-IN') + ') in a liquid account.'
  : '🚀 **Growth Priority:** Your defensive runway is healthy. Focus on disciplined, automated monthly SIP contributions and maintaining your savings rate.'}

*Feel free to ask specific questions about your salary, emergency runway, SIP affordability, or reality simulations!*`;
}

/**
 * Handle server-side AI execution with Gemini, OpenAI, Groq, or graceful fallback
 */
export async function handleAiChatRequest(body: {
  message: string;
  planContext: FinancialPlanContext;
}): Promise<{
  success: boolean;
  isLiveAi: boolean;
  provider: 'gemini' | 'openai' | 'groq' | 'deterministic';
  response: string;
  message?: string;
}> {
  const { message, planContext } = body;
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';

  const systemPrompt = buildFinancialSystemPrompt(planContext);

  // 1. Try Google Gemini if key configured
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${message}` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return {
            success: true,
            isLiveAi: true,
            provider: 'gemini',
            response: candidate,
          };
        }
      } else {
        console.warn(`Gemini API returned status ${res.status}:`, await res.text());
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err);
    }
  }

  // 2. Try OpenAI if key configured
  if (openaiKey && openaiKey.trim() !== '') {
    try {
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            success: true,
            isLiveAi: true,
            provider: 'openai',
            response: content,
          };
        }
      } else {
        console.warn(`OpenAI API returned status ${res.status}`);
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back:', err);
    }
  }

  // 3. Try Groq if key configured
  if (groqKey && groqKey.trim() !== '') {
    try {
      const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            success: true,
            isLiveAi: true,
            provider: 'groq',
            response: content,
          };
        }
      }
    } catch (err) {
      console.warn('Groq API call failed, falling back:', err);
    }
  }

  // 4. Fallback: Contextual deterministic financial rule advisor
  const ruleAnalysis = generateDeterministicFinancialAnalysis(message, planContext);
  return {
    success: true,
    isLiveAi: false,
    provider: 'deterministic',
    response: ruleAnalysis,
    message: 'Live AI API key (GEMINI_API_KEY or OPENAI_API_KEY) not found in environment. Contextual financial analysis generated by deterministic plan advisor.',
  };
}
