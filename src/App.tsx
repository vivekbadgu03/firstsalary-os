import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { DashboardOverview } from './components/DashboardOverview';
import { JobLossCalculator } from './components/JobLossCalculator';
import { EmergencyBudgetMode } from './components/EmergencyBudgetMode';
import { SalaryRealitySimulator } from './components/SalaryRealitySimulator';
import { WhatIfScenarios } from './components/WhatIfScenarios';
import { GoalPlanner } from './components/GoalPlanner';
import { SipCalculator } from './components/SipCalculator';
import { FlightPlanReport } from './components/FlightPlanReport';
import { OnboardingModal } from './components/OnboardingModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AutomationModal } from './components/AutomationModal';
import { AiAssistant } from './components/AiAssistant';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { DEFAULT_PLAN } from './data/defaultPlan';
import { FinancialPlan } from './types';
import { loadPlanFromStorage, savePlanToStorage } from './lib/supabase';
import { Sparkles, Bot } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showLandingHero, setShowLandingHero] = useState<boolean>(true);
  const [plan, setPlan] = useState<FinancialPlan>(DEFAULT_PLAN);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Load saved plan on mount
  useEffect(() => {
    loadPlanFromStorage().then(({ plan: loadedPlan }) => {
      setPlan(loadedPlan);
    });
  }, []);

  const handleUpdatePlan = (newPlan: FinancialPlan) => {
    setPlan(newPlan);
    savePlanToStorage(newPlan);
  };

  const handleResetDemo = () => {
    setPlan(DEFAULT_PLAN);
    savePlanToStorage(DEFAULT_PLAN);
    setActiveTab('dashboard');
  };

  const handleStartPlanning = () => {
    setIsOnboardingOpen(true);
  };

  const handleExploreDemo = () => {
    setActiveTab('dashboard');
    setShowLandingHero(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // When switching tabs, minimize hero to show focused workspace
          if (tab !== 'dashboard') {
            setShowLandingHero(false);
          }
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetDemo={handleResetDemo}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAutomationModal={() => setIsAutomationModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        emergencyBudgetActive={plan.emergencyBudgetActive}
      />

      {/* Landing Page Hero Section */}
      {showLandingHero && activeTab === 'dashboard' && (
        <LandingHero
          onStartPlanning={handleStartPlanning}
          onExploreDemo={handleExploreDemo}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          plan={plan}
        />
      )}

      {/* Main Workspace Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toggleable Hero Pill if user wants to review hero again */}
        {!showLandingHero && activeTab === 'dashboard' && (
          <div className="no-print mb-6 flex justify-end">
            <button
              onClick={() => setShowLandingHero(true)}
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Show Product Overview & Feature Highlights ↑
            </button>
          </div>
        )}

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            plan={plan}
            setActiveTab={setActiveTab}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        )}

        {/* Tab 2: Job-Loss Survival Calculator */}
        {activeTab === 'job_loss' && (
          <JobLossCalculator
            plan={plan}
            onUpdatePlan={handleUpdatePlan}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Tab 3: Emergency Budget Mode */}
        {activeTab === 'emergency_budget' && (
          <EmergencyBudgetMode
            plan={plan}
            onUpdatePlan={handleUpdatePlan}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Tab 4: Salary Reality Simulator */}
        {activeTab === 'salary_simulator' && (
          <SalaryRealitySimulator
            plan={plan}
            onUpdatePlan={handleUpdatePlan}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        )}

        {/* Tab 5: Life Scenarios Simulator */}
        {activeTab === 'life_scenarios' && (
          <WhatIfScenarios
            plan={plan}
            setActiveTab={setActiveTab}
            onUpdatePlan={handleUpdatePlan}
          />
        )}

        {/* Tab 6: Goals & SIP Suite */}
        {activeTab === 'goals_sip' && (
          <div className="space-y-8">
            <GoalPlanner
              plan={plan}
              onUpdatePlan={handleUpdatePlan}
            />
            <SipCalculator
              plan={plan}
              onUpdatePlan={handleUpdatePlan}
            />
          </div>
        )}

        {/* Tab 7: First-Salary Flight Plan Report */}
        {activeTab === 'flight_plan' && (
          <FlightPlanReport
            plan={plan}
            onOpenAutomationModal={() => setIsAutomationModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Quick AI Launcher Pill on Bottom-Right */}
      <div className="no-print fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-700/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI Advisor</span>
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        </button>
      </div>

      {/* FinTech Educational Disclaimer Footer */}
      <DisclaimerFooter />

      {/* AI Assistant Drawer */}
      <AiAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        plan={plan}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(newPlan) => {
          handleUpdatePlan(newPlan);
          setActiveTab('flight_plan');
          setShowLandingHero(false);
        }}
        initialPlan={plan}
      />

      {/* Supabase Status Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        plan={plan}
      />

      {/* Automation Status Modal (n8n Ready) */}
      <AutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        plan={plan}
      />
    </div>
  );
}

export default App;
