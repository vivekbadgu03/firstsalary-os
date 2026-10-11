import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FinancialPlan } from '../types';
import { DEFAULT_PLAN } from '../data/defaultPlan';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = 'firstsalary_os_active_plan';
const LOCAL_STORAGE_PLANS_KEY = 'firstsalary_os_saved_plans';

/**
 * Save Financial Plan to Supabase or Local Storage fallback.
 */
export async function savePlanToStorage(plan: FinancialPlan): Promise<{
  success: boolean;
  source: 'supabase' | 'local';
  message: string;
}> {
  const planWithTimestamp = {
    ...plan,
    updatedAt: new Date().toISOString(),
  };

  // 1. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('financial_plans')
        .upsert({
          id: plan.id,
          user_id: plan.userId || null,
          user_name: plan.userName,
          user_email: plan.userEmail,
          plan_name: plan.planName,
          monthly_take_home: plan.monthlyTakeHome,
          essential_expenses: plan.essentialExpenses,
          optional_expenses: plan.optionalExpenses,
          existing_commitments: plan.existingCommitments,
          current_emergency_savings: plan.currentEmergencySavings,
          sip_monthly_amount: plan.sipMonthlyAmount,
          sip_expected_return_rate: plan.sipExpectedReturnRate,
          sip_duration_years: plan.sipDurationYears,
          risk_profile: plan.riskProfile,
          goals: plan.goals,
          updated_at: planWithTimestamp.updatedAt,
        }, { onConflict: 'id' });

      if (!error) {
        // Also sync local storage as cache
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planWithTimestamp));
        return {
          success: true,
          source: 'supabase',
          message: 'Saved securely to Supabase database with RLS.',
        };
      } else {
        console.warn('Supabase upsert returned error, falling back to local storage:', error.message);
      }
    } catch (err: unknown) {
      console.warn('Supabase network exception, falling back to local storage:', err);
    }
  }

  // 2. Safe Local Storage Fallback
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planWithTimestamp));

    // Also maintain saved list
    const existingStr = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
    let plansList: FinancialPlan[] = existingStr ? JSON.parse(existingStr) : [];
    const index = plansList.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plansList[index] = planWithTimestamp;
    } else {
      plansList.push(planWithTimestamp);
    }
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plansList));

    return {
      success: true,
      source: 'local',
      message: 'Saved locally in browser storage (Development / Demo Mode).',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown storage error';
    return {
      success: false,
      source: 'local',
      message: `Failed to save plan locally: ${errorMsg}`,
    };
  }
}

/**
 * Load Active Plan from Supabase or Local Storage.
 */
export async function loadPlanFromStorage(): Promise<{
  plan: FinancialPlan;
  source: 'supabase' | 'local' | 'default';
}> {
  // Check local storage first for quick restore
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return { plan: parsed, source: 'local' };
    }
  } catch (e) {
    console.error('Error reading local storage', e);
  }

  // If Supabase configured, attempt remote fetch
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('financial_plans')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const reconstructed: FinancialPlan = {
          id: data.id,
          userId: data.user_id,
          userName: data.user_name || 'User',
          userEmail: data.user_email,
          planName: data.plan_name || 'My Salary Plan',
          monthlyTakeHome: Number(data.monthly_take_home) || 0,
          essentialExpenses: Number(data.essential_expenses) || 0,
          optionalExpenses: Number(data.optional_expenses) || 0,
          existingCommitments: Number(data.existing_commitments) || 0,
          currentEmergencySavings: Number(data.current_emergency_savings) || 0,
          goals: data.goals || [],
          riskProfile: data.risk_profile || DEFAULT_PLAN.riskProfile,
          sipMonthlyAmount: Number(data.sip_monthly_amount) || 5000,
          sipExpectedReturnRate: Number(data.sip_expected_return_rate) || 12,
          sipDurationYears: Number(data.sip_duration_years) || 10,
          emergencyBudgetActive: false,
          emergencyIncomeReductionPct: 100,
          emergencyDiscretionaryCutPct: 75,
          emergencyOneTimeShock: 0,
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
        };
        return { plan: reconstructed, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Error fetching from Supabase, using default plan', err);
    }
  }

  return { plan: DEFAULT_PLAN, source: 'default' };
}
