import React from 'react';
import {
  Compass,
  ShieldAlert,
  Flame,
  SlidersHorizontal,
  LifeBuoy,
  Target,
  FileText,
  CloudCheck,
  HardDrive,
  Webhook,
  RotateCcw,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { isN8nConfigured } from '../lib/automation';

export type ActiveTab =
  | 'dashboard'
  | 'job_loss'
  | 'emergency_budget'
  | 'salary_simulator'
  | 'life_scenarios'
  | 'goals_sip'
  | 'flight_plan';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenOnboarding: () => void;
  onResetDemo: () => void;
  onOpenSupabaseModal: () => void;
  onOpenAutomationModal: () => void;
  onOpenAiAssistant: () => void;
  emergencyBudgetActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenOnboarding,
  onResetDemo,
  onOpenSupabaseModal,
  onOpenAutomationModal,
  onOpenAiAssistant,
  emergencyBudgetActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">FirstSalary</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 uppercase tracking-wider">
                  OS
                </span>
                <span className="hidden md:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  by Team Dominion
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Personal Finance Companion for First-Time Earners
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('job_loss')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'job_loss'
                  ? 'bg-amber-50 text-amber-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              Job-Loss Runway
            </button>

            <button
              onClick={() => setActiveTab('emergency_budget')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative ${
                activeTab === 'emergency_budget'
                  ? 'bg-rose-50 text-rose-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              Emergency Mode
              {emergencyBudgetActive && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('salary_simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'salary_simulator'
                  ? 'bg-teal-50 text-teal-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
              Reality Simulator
            </button>

            <button
              onClick={() => setActiveTab('life_scenarios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'life_scenarios'
                  ? 'bg-blue-50 text-blue-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LifeBuoy className="h-3.5 w-3.5 text-blue-600" />
              Life Scenarios
            </button>

            <button
              onClick={() => setActiveTab('goals_sip')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'goals_sip'
                  ? 'bg-indigo-50 text-indigo-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Target className="h-3.5 w-3.5 text-indigo-600" />
              Goals & SIP
            </button>

            <button
              onClick={() => setActiveTab('flight_plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'flight_plan'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Flight Plan
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* AI Assistant Launcher Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 animate-pulse"
              title="Open AI Financial Assistant"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Storage indicator */}
            <button
              onClick={onOpenSupabaseModal}
              title={isSupabaseConfigured ? 'Connected to Supabase' : 'Running in Local Storage / Demo Mode'}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {isSupabaseConfigured ? (
                <>
                  <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">Supabase</span>
                </>
              ) : (
                <>
                  <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium">Local Mode</span>
                </>
              )}
            </button>

            {/* n8n Automation Status Button */}
            <button
              onClick={onOpenAutomationModal}
              title="External Automation (n8n Ready)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <Webhook className="h-3.5 w-3.5 text-teal-600" />
              <span className="font-medium">n8n</span>
              <span className={`h-1.5 w-1.5 rounded-full ${isN8nConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>

            {/* Reset Demo button */}
            <button
              onClick={onResetDemo}
              title="Reset to Demo Plan"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Plan Wizard Button */}
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Plan Wizard</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Scroll */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('job_loss')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'job_loss' ? 'bg-amber-500 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Job-Loss Runway
          </button>
          <button
            onClick={() => setActiveTab('emergency_budget')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'emergency_budget' ? 'bg-rose-600 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Emergency Mode
          </button>
          <button
            onClick={() => setActiveTab('salary_simulator')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'salary_simulator' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Reality Simulator
          </button>
          <button
            onClick={() => setActiveTab('life_scenarios')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'life_scenarios' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Life Scenarios
          </button>
          <button
            onClick={() => setActiveTab('goals_sip')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'goals_sip' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Goals & SIP
          </button>
          <button
            onClick={() => setActiveTab('flight_plan')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'flight_plan' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Flight Plan
          </button>
        </div>
      </div>
    </header>
  );
};
