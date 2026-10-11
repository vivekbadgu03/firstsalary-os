import React, { useState } from 'react';
import {
  X,
  Database,
  CloudCheck,
  HardDrive,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Code2,
} from 'lucide-react';
import { isSupabaseConfigured, savePlanToStorage } from '../lib/supabase';
import { FinancialPlan } from '../types';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FinancialPlan;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestSave = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await savePlanToStorage(plan);
      setTestResult(`${res.message} (${res.source.toUpperCase()})`);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const schemaSnippet = `-- Copy into Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.financial_plans (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT,
  plan_name TEXT NOT NULL,
  monthly_take_home NUMERIC NOT NULL,
  essential_expenses NUMERIC NOT NULL,
  optional_expenses NUMERIC NOT NULL,
  existing_commitments NUMERIC NOT NULL DEFAULT 0,
  current_emergency_savings NUMERIC NOT NULL DEFAULT 0,
  sip_monthly_amount NUMERIC NOT NULL DEFAULT 0,
  sip_expected_return_rate NUMERIC NOT NULL DEFAULT 12,
  sip_duration_years INTEGER NOT NULL DEFAULT 10,
  risk_profile JSONB,
  goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public demo insert and select"
  ON public.financial_plans FOR ALL
  USING (true)
  WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(schemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Supabase Backend & Database Status
              </h3>
              <p className="text-xs text-slate-500">
                Cloud persistence and local storage fallback management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            {isSupabaseConfigured ? (
              <CloudCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <HardDrive className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 text-sm">
                {isSupabaseConfigured
                  ? 'Connected to Supabase Project'
                  : 'Running in Browser Local Storage (Demo Mode)'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isSupabaseConfigured
                  ? 'Your financial plans and goals are securely synchronizing with your configured Supabase PostgreSQL database.'
                  : 'No Supabase credentials were found in .env. FirstSalary OS is operating in standalone offline Demo Mode with 100% full functionality and persistent browser storage.'}
              </p>
            </div>
          </div>

          {/* Test Save Button */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Test Storage Operations</span>
              <button
                onClick={handleTestSave}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isTesting ? 'Testing Save...' : 'Test Save Active Plan'}
              </button>
            </div>
            {testResult && (
              <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {testResult}
              </p>
            )}
          </div>

          {/* Quick Setup Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-slate-600" />
                <span>Quick Supabase Schema Migration (SQL)</span>
              </span>
              <button
                onClick={copySql}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-48">
              {schemaSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
