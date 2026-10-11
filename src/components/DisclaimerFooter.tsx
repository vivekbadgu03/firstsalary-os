import React from 'react';
import { Compass, ShieldCheck, Lock, Heart } from 'lucide-react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="no-print bg-white border-t border-slate-200/80 mt-16 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">FirstSalary OS</span>
              <span className="text-[11px] text-slate-500 ml-2">
                Personal Finance Companion for First-Time Earners
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero Bank Credentials Required</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>
        </div>

        {/* Legal & Educational Disclaimer */}
        <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-700">Official Educational & Financial Disclaimer:</p>
          <p>
            FirstSalary OS is an educational personal finance planning system and prototype designed specifically
            to help new professionals structure their salary, simulate job-loss emergency runways, and understand
            long-term SIP compounding. It does not provide SEBI-registered financial advisory services, certified tax advice,
            or portfolio management. Projections shown are mathematical simulations based on user assumptions and do
            not guarantee future performance. Securities and market investments are subject to market risks. Please
            consult a qualified independent financial adviser before making substantial investment commitments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 text-[11px] text-slate-400 gap-2">
          <div>
            Problem Statement: <em>“Help new employees plan savings, SIPs and investment allocation.”</em>
          </div>
          <div>
            Built with modern React, TypeScript & Tailwind CSS • FirstSalary OS by Team Dominion
          </div>
        </div>
      </div>
    </footer>
  );
};
