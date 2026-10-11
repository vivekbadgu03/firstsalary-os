import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  Layers,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { FinancialPlan } from '../types';
import {
  askAiAssistant,
  checkAiServerStatus,
  AiChatMessage,
  AiStatus,
} from '../lib/aiClient';
import { formatINR } from '../lib/calculations';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FinancialPlan;
}

const DEFAULT_PROMPTS = [
  'Explain my salary plan.',
  'Can I afford to start a SIP?',
  'What happens if I lose my job?',
  'How can I reach my savings goal faster?',
  'Explain my investment allocation.',
];

export const AiAssistant: React.FC<AiAssistantProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${plan.userName ? plan.userName.split(' ')[0] : 'there'}! 👋 I am your **FirstSalary OS AI Financial Companion**.\n\nI have loaded your active plan (Take-Home: **${formatINR(plan.monthlyTakeHome)}/mo**, Runway: **${(plan.essentialExpenses > 0 ? (plan.currentEmergencySavings / plan.essentialExpenses).toFixed(1) : '0')} months**).\n\nAsk me anything about your salary distribution, SIP affordability, job-loss survival, or reality scenarios!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLiveAi: false,
      provider: 'FirstSalary AI',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>({
    isConfigured: false,
    provider: 'none',
    availableModels: [],
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      checkAiServerStatus().then(setAiStatus);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLiveAi: false,
      provider: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAiAssistant(text, plan);
      const assistantMsg: AiChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: response.isLiveAi,
        provider: response.provider,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: AiChatMessage = {
        id: `e_${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Unable to process query right now. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: false,
        provider: 'system',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. I am ready with your live plan data (**${formatINR(plan.monthlyTakeHome)}/mo** salary). How can I assist you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: false,
        provider: 'FirstSalary AI',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-lg bg-[#fbfbf9] h-full shadow-2xl border-l border-slate-200/90 flex flex-col z-50 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">AI Financial Assistant</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    aiStatus.isConfigured
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                  title={
                    aiStatus.isConfigured
                      ? `Connected to ${aiStatus.availableModels.join(', ')}`
                      : 'Live AI key not configured. Contextual deterministic plan advisor active.'
                  }
                >
                  {aiStatus.isConfigured ? '● Live AI' : '○ Context Advisor'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Contextual advisory grounded in your exact salary data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfigHelp(!showConfigHelp)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="AI Integration Info"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Integration Notice / Help Banner */}
        {showConfigHelp && (
          <div className="p-3 bg-slate-100/90 border-b border-slate-200 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Live AI Integration Status</span>
              <button
                onClick={() => setShowConfigHelp(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              {aiStatus.isConfigured
                ? `Active Models: ${aiStatus.availableModels.join(', ')}. API keys are securely managed server-side.`
                : 'To enable live cloud LLM inference, add `GEMINI_API_KEY` or `OPENAI_API_KEY` to your root `.env` file and restart. Currently operating in deterministic plan analysis mode with exact financial context.'}
            </p>
          </div>
        )}

        {/* Live Plan Snapshot Strip */}
        <div className="bg-slate-50/90 px-4 py-2 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
          <span>
            Salary: <strong className="text-slate-900">{formatINR(plan.monthlyTakeHome)}</strong>
          </span>
          <span>•</span>
          <span>
            Surplus:{' '}
            <strong className="text-emerald-700">
              {formatINR(plan.monthlyTakeHome - (plan.essentialExpenses + plan.optionalExpenses + plan.existingCommitments))}
            </strong>
          </span>
          <span>•</span>
          <span>
            Runway:{' '}
            <strong className="text-slate-900">
              {plan.essentialExpenses > 0 ? (plan.currentEmergencySavings / plan.essentialExpenses).toFixed(1) : '0'}m
            </strong>
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-1.5 ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 mb-1">
                    <span className="font-semibold">
                      {isUser ? 'You' : msg.isLiveAi ? `FirstSalary AI (${msg.provider})` : 'Plan Advisor'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="hover:opacity-100 p-0.5"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-500 font-medium ml-1">
                  Analyzing your financial plan...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 border-t border-slate-200/60 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Prompts
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DEFAULT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/60 whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Field */}
        <div className="p-3 bg-white border-t border-slate-200/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your salary, SIP, or emergency runway..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-[#fbfbf9]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            AI explanations are educational and grounded in your plan calculations. Not SEBI advice.
          </p>
        </div>
      </div>
    </div>
  );
};
