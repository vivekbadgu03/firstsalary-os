# FIRSTSALARY OS — FINANCIAL CALCULATION RULES & CONTRACTS

This document specifies the exact financial formulas, validation requirements, and edge case handling used across FirstSalary OS.

---

## 1. Monthly Cash Flow Formula

$$\text{Surplus Cash Flow} = \text{Monthly Take-Home} - \text{Essential Needs} - \text{Optional Wants} - \text{Existing Commitments}$$

### Rules & Validation:
- $\text{Monthly Take-Home} \ge 0$
- If $\text{Surplus Cash Flow} < 0$:
  - The plan is in an **active monthly deficit**.
  - Savings Rate is set to $0\%$.
  - The system warns the user that investing during a deficit triggers dangerous debt or emergency buffer depletion.
- If $\text{Monthly Take-Home} > 0$ and $\text{Surplus Cash Flow} \ge 0$:
  $$\text{Savings Rate} = \text{round}\left( \frac{\text{Surplus Cash Flow}}{\text{Monthly Take-Home}} \times 100 \right)$$

---

## 2. Job-Loss Survival Runway Formula

$$\text{Adjusted Savings} = \max(0, \text{Current Liquid Savings} - \text{One-Time Emergency Shock})$$

$$\text{Runway (Months)} = \frac{\text{Adjusted Savings}}{\text{Essential Monthly Expenses}}$$

$$\text{Runway (Days)} = \text{round}(\text{Runway (Months)} \times 30.4375)$$

### Status Thresholds:
| Runway Duration | Classification | Visual Indicator | Guidance |
|---|---|---|---|
| $< 1.0$ Month | Critical Shortfall | Rose (`#f43f5e`) | Immediate spending freeze; build liquid cash. |
| $1.0$ to $2.9$ Months | Limited Buffer | Amber (`#f59e0b`) | Basic breathing room; reach 3 months before aggressive equity. |
| $3.0$ to $5.9$ Months | Healthy Cushion | Blue / Emerald | Solid protection against layoffs. |
| $\ge 6.0$ Months | Strong Runway | Emerald (`#10b981`) | Complete defensive stability; scale wealth investments. |

### Edge Case Handlers:
- **Zero Essential Expenses:** If $\text{Essential Expenses} \le 0$, return $0$ runway with the status `'Baseline Required'` to prevent division by zero.
- **Zero Savings:** Return $0$ runway with status `'Zero Emergency Buffer'` and advice to direct next month's cash flow to a high-yield liquid account.
- **Shock Exceeds Savings:** If $\text{One-Time Shock} > \text{Current Savings}$, $\text{Adjusted Savings}$ clamps cleanly to $0$.

---

## 3. Systematic Investment Plan (SIP) Formula

FirstSalary OS uses an end-of-month compound growth model:

$$FV = P \times \left[ \frac{(1 + r)^n - 1}{r} \right]$$

Where:
- $P$ = Monthly Contribution (₹)
- $r$ = Monthly Return Rate $= \frac{\text{Annual Expected Return Rate (\%)}}{12 \times 100}$
- $n$ = Total Compounding Months $= \text{Duration (Years)} \times 12$
- Total Invested $= P \times n$
- Estimated Wealth Gain $= \max(0, FV - \text{Total Invested})$

### Zero-Return Case:
When $r = 0$ or return rate $\le 0$:
$$FV = P \times n, \quad \text{Wealth Gain} = 0$$

---

## 4. Goal Contribution & Affordability Rules

For each active goal:
$$\text{Remaining Target} = \max(0, \text{Target Amount} - \text{Current Saved})$$
$$\text{Required Monthly} = \left\lceil \frac{\text{Remaining Target}}{\max(1, \text{Target Months})} \right\rceil$$

### Affordability Constraint:
$$\text{Total Required Monthly} = \sum \text{Required Monthly}$$

- If $\text{Total Required Monthly} \le \text{Surplus Cash Flow}$: **Fully Affordable**.
- If $\text{Total Required Monthly} > \text{Surplus Cash Flow}$: **Shortfall Flagged**.
  $$\text{Shortfall} = \text{Total Required Monthly} - \text{Surplus Cash Flow}$$
  The UI displays a clear advisory recommending extending target timelines rather than borrowing.

---

## 5. Transparent Suggested Allocation Rules

Unlike static 50/30/20 templates, FirstSalary OS allocates based on defensive priority:
1. **Deficit Check:** If surplus $\le 0$, allocation to emergency funds, goals, and SIPs is strictly ₹0.
2. **Emergency Cushion Priority:**
   - If runway $< 1$ mo: Allocate $50\%$ of monthly surplus to emergency cash.
   - If runway $< 3$ mos: Allocate $35\%$ of monthly surplus to emergency cash.
   - If runway $< 6$ mos: Allocate $15\%$ of monthly surplus.
   - If runway $\ge 6$ mos: Allocate $5\%$ maintenance buffer.
3. **Goal Funding:** Allocate remaining surplus up to the total required for goals (capped at $50\%$ of surplus).
4. **Long-Term SIP Allocation:** Scaled by risk profile score (Growth: $85\%$ of remaining surplus, Moderate: $75\%$, Conservative: $60\%$).
5. **Cash Buffer:** Any remaining unallocated surplus is preserved as buffer cash.
6. **Total Allocation:** The sum of all allocated categories matches the user's monthly income exactly without manufacturing phantom funds.
