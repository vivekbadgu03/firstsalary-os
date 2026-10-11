# FIRSTSALARY OS — QA & TEST PLAN

This document outlines the testing strategy, test cases, and verification results for FirstSalary OS.

---

## 1. Automated Unit Tests (Vitest)

All financial calculations are covered by automated unit tests in `src/lib/calculations.test.ts`.

### Test Suite Execution:
Run with:
```bash
npm test
```

### Verified Test Cases:
| Test Case | Description | Result |
|---|---|---|
| `formatINR` standard | Formats zero, hundreds, thousands, lakhs, and negative numbers with ₹ | ✅ PASS |
| `formatINR` compact | Formats ₹50 k, ₹1.5 L, ₹2.5 Cr without trailing zeroes | ✅ PASS |
| `calculateCashFlow` normal | Verifies take-home ₹65k, outflow ₹45k, surplus ₹20k, savings rate 31% | ✅ PASS |
| `calculateCashFlow` deficit | Verifies expenses exceeding income return negative surplus and 0% savings rate | ✅ PASS |
| `calculateCashFlow` zero income | Handles zero income safely without errors | ✅ PASS |
| `calculateEmergencyRunway` normal | Validates ₹75k savings / ₹25k essentials = 3.0 months, 91 days | ✅ PASS |
| `calculateEmergencyRunway` div by zero | Validates zero essential expenses returns safe baseline warning | ✅ PASS |
| `calculateEmergencyRunway` zero savings | Validates zero savings returns 0 runway and rose warning | ✅ PASS |
| `calculateEmergencyRunway` one-time shock | Subtracts one-time emergency costs from savings prior to dividing | ✅ PASS |
| `calculateEmergencyRunway` shock > savings | Clamps adjusted savings to 0 without negative runway | ✅ PASS |
| `calculateGoalContributions` normal | Accurately calculates remaining targets and monthly requirements | ✅ PASS |
| `calculateGoalContributions` shortfall | Identifies when total goals exceed available monthly surplus | ✅ PASS |
| `calculateGoalContributions` completed | Sets required monthly to 0 for fully funded goals | ✅ PASS |
| `calculateSipProjection` 10Y at 12% | Verifies compound wealth ₹23L+ on ₹10k/mo against mathematical formula | ✅ PASS |
| `calculateSipProjection` zero return | Handles 0% return without division by zero ($FV = P \times n$) | ✅ PASS |
| `calculateSipProjection` zero deposit | Handles ₹0 monthly contribution without errors | ✅ PASS |
| `calculateSuggestedAllocation` deficit | Allocates ₹0 to new investments when cash flow is negative | ✅ PASS |
| `calculateSuggestedAllocation` low runway | Prioritizes emergency fund building (50% of surplus) when cushion < 1 mo | ✅ PASS |
| `evaluateRiskProfile` conservative | Scores $\le 6$ map to capital preservation | ✅ PASS |
| `evaluateRiskProfile` moderate | Scores $7-12$ map to balanced wealth builder | ✅ PASS |
| `evaluateRiskProfile` growth | Scores $13-18$ map to long-term equity compounding | ✅ PASS |

**Total Unit Tests Passing:** 21 / 21 (100% Pass Rate).

---

## 2. Integration & UI Verification Checks

### A. Navigation & Tab Switching
- [x] Dashboard loads default plan figures seamlessly.
- [x] Job-Loss Survival Calculator updates live as sliders move.
- [x] Emergency Budget Mode toggles active state and updates navbar pulse badge.
- [x] Salary Reality Simulator recalculates before-and-after deltas in real-time.
- [x] What If Life Scenarios switches presets and links to Emergency Mode.
- [x] Goal Planner supports adding, editing, and deleting goals.
- [x] SIP Calculator updates milestone tables when duration changes.
- [x] Flight Plan Report formats into clean multi-page document for `window.print()`.

### B. Defensive Failure & Boundary Cases
- [x] Zero income entered: Handled cleanly across cash flow, allocation, and simulator.
- [x] Zero essential expenses: Handled without division-by-zero crashes.
- [x] Negative inputs: Clamped to zero using `Math.max(0, ...)`.
- [x] Unconfigured Supabase credentials: App detects missing credentials and activates local browser storage mode.
- [x] Unconfigured n8n webhook URL: App safely switches to Mock Mode and records simulated events in the in-app Webhook Log.

### C. Responsive Mobile & Tablet Testing
- [x] Top navbar collapses into horizontal touch scrollbar on screens $< 1024px$.
- [x] Multi-column grids collapse to single-column card stacks on mobile viewports.
- [x] Sliders and inputs have generous touch hit targets ($> 44px$).
- [x] Modals scroll gracefully within viewport boundaries with fixed headers and footers.
