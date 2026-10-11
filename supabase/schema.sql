-- ==============================================================================
-- FIRSTSALARY OS — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Financial Plans Table
CREATE TABLE IF NOT EXISTS public.financial_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  plan_name TEXT NOT NULL DEFAULT 'My First Salary Plan',
  monthly_take_home NUMERIC NOT NULL CHECK (monthly_take_home >= 0),
  essential_expenses NUMERIC NOT NULL CHECK (essential_expenses >= 0),
  optional_expenses NUMERIC NOT NULL CHECK (optional_expenses >= 0),
  existing_commitments NUMERIC NOT NULL DEFAULT 0 CHECK (existing_commitments >= 0),
  current_emergency_savings NUMERIC NOT NULL DEFAULT 0 CHECK (current_emergency_savings >= 0),
  sip_monthly_amount NUMERIC NOT NULL DEFAULT 0 CHECK (sip_monthly_amount >= 0),
  sip_expected_return_rate NUMERIC NOT NULL DEFAULT 12,
  sip_duration_years INTEGER NOT NULL DEFAULT 10 CHECK (sip_duration_years > 0),
  risk_profile JSONB,
  goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Financial Plans
ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see and manipulate their own plans
-- (or demo plans with NULL user_id for public sandbox reading)
CREATE POLICY "Users can manage their own plans"
  ON public.financial_plans FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_plans_modtime
  BEFORE UPDATE ON public.financial_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
