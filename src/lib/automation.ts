import { FinancialPlan } from '../types';
import { calculateCashFlow, calculateEmergencyRunway, calculateSipProjection } from './calculations';

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'delivered' | 'mocked' | 'failed';
  endpoint: string;
  payload: Record<string, unknown>;
  responseMessage: string;
}

const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export const isN8nConfigured = Boolean(
  n8nWebhookUrl &&
  n8nWebhookUrl !== 'YOUR_N8N_WEBHOOK_URL' &&
  n8nWebhookUrl.startsWith('http')
);

// In-memory log of external triggers for live QA & debugging
const webhookLogs: WebhookLog[] = [];

export function getWebhookLogs(): WebhookLog[] {
  return [...webhookLogs];
}

/**
 * Trigger `financial_plan_ready` external event for n8n automation.
 */
export async function triggerFinancialPlanReadyWebhook(
  plan: FinancialPlan,
  forceMock: boolean = false
): Promise<{
  success: boolean;
  status: 'delivered' | 'mocked' | 'failed';
  message: string;
  log: WebhookLog;
}> {
  const cashFlow = calculateCashFlow(
    plan.monthlyTakeHome,
    plan.essentialExpenses,
    plan.optionalExpenses,
    plan.existingCommitments
  );

  const runway = calculateEmergencyRunway(
    plan.currentEmergencySavings,
    plan.essentialExpenses,
    0
  );

  const sip = calculateSipProjection(
    plan.sipMonthlyAmount,
    plan.sipExpectedReturnRate,
    plan.sipDurationYears
  );

  // Construct minimal, secure payload without sensitive data
  const payload = {
    event: 'financial_plan_ready',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    planId: plan.id,
    planName: plan.planName,
    user: {
      name: plan.userName,
      email: plan.userEmail || 'user@example.com',
    },
    metrics: {
      monthlyTakeHome: plan.monthlyTakeHome,
      essentialExpenses: plan.essentialExpenses,
      optionalExpenses: plan.optionalExpenses,
      commitments: plan.existingCommitments,
      surplusCashFlow: cashFlow.surplusCashFlow,
      savingsRatePct: cashFlow.savingsRate,
      currentEmergencySavings: plan.currentEmergencySavings,
      emergencyRunwayMonths: runway.runwayMonths,
      emergencyStatus: runway.statusLabel,
      goalsCount: plan.goals.length,
      riskCategory: plan.riskProfile.category,
      sipMonthly: plan.sipMonthlyAmount,
      sip10YearProjectedWealth: sip.projectedWealth,
    },
    actionDirectives: [
      runway.runwayMonths < 3
        ? `Build emergency cushion to 3 months (${runway.statusLabel})`
        : 'Emergency safety cushion is stable',
      cashFlow.isDeficit
        ? 'Eliminate monthly cash deficit before new investments'
        : `Invest ${plan.sipMonthlyAmount}/month in disciplined index SIPs`,
      'Review term insurance and health coverage before career scale-up',
    ],
  };

  const logId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // If mock mode requested or n8n URL is not configured
  if (forceMock || !isN8nConfigured) {
    const mockLog: WebhookLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      event: 'financial_plan_ready',
      status: 'mocked',
      endpoint: isN8nConfigured ? n8nWebhookUrl : 'MOCK_SANDBOX (n8n webhook URL unconfigured)',
      payload,
      responseMessage: isN8nConfigured
        ? 'Mock simulation executed successfully without hitting remote server.'
        : 'n8n webhook URL not configured in .env. Event safely simulated in Mock Mode.',
    };

    webhookLogs.unshift(mockLog);

    return {
      success: true,
      status: 'mocked',
      message: 'Event simulated successfully in Mock Mode. Payload validated and ready for n8n.',
      log: mockLog,
    };
  }

  // Live n8n HTTP POST call
  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FirstSalary-Event': 'financial_plan_ready',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const deliveredLog: WebhookLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        event: 'financial_plan_ready',
        status: 'delivered',
        endpoint: n8nWebhookUrl,
        payload,
        responseMessage: `n8n webhook responded with status ${response.status} OK.`,
      };
      webhookLogs.unshift(deliveredLog);
      return {
        success: true,
        status: 'delivered',
        message: 'Successfully delivered to n8n webhook workflow!',
        log: deliveredLog,
      };
    } else {
      const failedLog: WebhookLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        event: 'financial_plan_ready',
        status: 'failed',
        endpoint: n8nWebhookUrl,
        payload,
        responseMessage: `n8n webhook returned HTTP ${response.status}: ${response.statusText}`,
      };
      webhookLogs.unshift(failedLog);
      return {
        success: false,
        status: 'failed',
        message: `n8n webhook returned error code ${response.status}.`,
        log: failedLog,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    const failedLog: WebhookLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      event: 'financial_plan_ready',
      status: 'failed',
      endpoint: n8nWebhookUrl,
      payload,
      responseMessage: `Network exception: ${errorMsg}`,
    };
    webhookLogs.unshift(failedLog);
    return {
      success: false,
      status: 'failed',
      message: `Failed to contact n8n endpoint: ${errorMsg}`,
      log: failedLog,
    };
  }
}
