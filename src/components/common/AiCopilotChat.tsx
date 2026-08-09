import React, { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../../services/aiApi';
import type { ChatResponse } from '../../services/aiApi';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  HelpCircle,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextSummary?: ChatResponse['contextSummary'];
}

interface AiCopilotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  'Why did compliance decrease?',
  'What are the open critical violations?',
  'What active CAPAs require verification?',
  'Give me a daily HACCP audit summary.',
];

export const AiCopilotChat: React.FC<AiCopilotChatProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: "Hello! I am your **SafeKitchen AI Food Safety Copilot**. I have live access to your organization's compliance metrics. How can I assist you with HACCP audits, critical limit breaches, or CAPA resolution today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await aiApi.chat(text);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextSummary: response.contextSummary,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **AI Copilot Error:** ${err.message || 'Failed to analyze tenant metrics. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputPrompt);
  };

  // Helper to format Markdown bolding (**text**) and code blocks into JSX
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-emerald-400 text-sm mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('* ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{line.replace(/^[*|-]\s*/, '')}</span>
              </div>
            );
          }
          // Process bold tags
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-bold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                {t('ai.title', 'Food Safety Copilot')}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('ai.sub', 'AI Assistant trained on authorized tenant metrics')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-bold text-xs'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {renderFormattedText(msg.text)}

                {msg.contextSummary && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Score: {msg.contextSummary.complianceScore}%</span>
                    <span>Open Violations: {msg.contextSummary.openViolationsCount}</span>
                    <span>CAPAs: {msg.contextSummary.activeCapasCount}</span>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 block text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 text-slate-400 p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{t('ai.thinking', 'Analyzing tenant compliance metrics...')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            <span>Suggested Queries:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="whitespace-nowrap bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium px-3 py-1.5 rounded-full transition cursor-pointer"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={t('ai.inputPlaceholder', 'Ask me about compliance, CCPs, or CAPAs...')}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
