import React, { useState } from 'react';
import {
  X,
  Webhook,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Layers,
  Code2,
} from 'lucide-react';
import {
  isN8nConfigured,
  getWebhookLogs,
  triggerFinancialPlanReadyWebhook,
  WebhookLog,
} from '../lib/automation';
import { FinancialPlan } from '../types';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FinancialPlan;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [logs, setLogs] = useState<WebhookLog[]>(getWebhookLogs());
  const [copied, setCopied] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerTest = async (forceMock: boolean = false) => {
    setIsTriggering(true);
    setStatusMessage(null);
    try {
      const result = await triggerFinancialPlanReadyWebhook(plan, forceMock);
      setLogs(getWebhookLogs());
      setStatusMessage(result.message);
    } catch (e: any) {
      setStatusMessage(`Error triggering webhook: ${e.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  const samplePayload = {
    event: 'financial_plan_ready',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    planId: plan.id,
    user: {
      name: plan.userName,
      email: plan.userEmail || 'user@example.com',
    },
    metrics: {
      monthlyTakeHome: plan.monthlyTakeHome,
      essentialExpenses: plan.essentialExpenses,
      optionalExpenses: plan.optionalExpenses,
      commitments: plan.existingCommitments,
      currentEmergencySavings: plan.currentEmergencySavings,
      riskCategory: plan.riskProfile.category,
      sipMonthly: plan.sipMonthlyAmount,
    },
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Webhook className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                External Automation Integration (n8n Ready)
              </h3>
              <p className="text-xs text-slate-500">
                Secure server-ready event dispatcher for post-plan workflows
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

        {/* Status Pill */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isN8nConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-800">
              {isN8nConfigured ? 'n8n Webhook Configured' : 'Mock / Sandbox Mode Active'}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            {isN8nConfigured ? 'VITE_N8N_WEBHOOK_URL detected' : 'Set VITE_N8N_WEBHOOK_URL in .env'}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Quick Trigger Buttons */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block">Trigger Test Events</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTriggerTest(true)}
                disabled={isTriggering}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>Trigger Mock Event</span>
              </button>

              {isN8nConfigured && (
                <button
                  onClick={() => handleTriggerTest(false)}
                  disabled={isTriggering}
                  className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  <span>Send to Live n8n Endpoint</span>
                </button>
              )}
            </div>

            {statusMessage && (
              <p className="text-[11px] font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Sample JSON Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-slate-600" />
                <span>Validated Event Payload Schema (`financial_plan_ready`)</span>
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-48">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>

          {/* Recent Webhook Trigger History */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">
              Recent In-App Dispatch Logs ({logs.length})
            </span>
            {logs.length === 0 ? (
              <p className="text-slate-400 italic">No events triggered yet in this session.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.event}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'mocked'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{log.responseMessage}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
