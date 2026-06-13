'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Mic, X, Sparkles, Calculator, FileText,
  TrendingUp, RefreshCw, Copy, Check, MessageSquare, Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '🏠', label: 'Estimate 1000 sqft house', prompt: 'Calculate material quantity for 1000 sqft G+0 house in Jalgaon' },
  { icon: '🏗️', label: 'G+1 building materials', prompt: 'Material estimate for 1500 sqft G+1 residential building' },
  { icon: '💰', label: 'Current material rates', prompt: 'What are the current rates for cement, steel and sand?' },
  { icon: '⚙️', label: 'Best TMT steel grade', prompt: 'Which TMT steel grade is best for earthquake-prone areas?' },
  { icon: '🌊', label: 'River sand vs M-Sand', prompt: 'What is the difference between river sand and M-Sand? Which is better?' },
  { icon: '📦', label: 'Cement bag calculation', prompt: 'How many cement bags for 2000 sqft slab casting?' },
];

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold text-white mt-4 mb-2">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold text-const-orange mt-3 mb-1">$1</h3>')
    .replace(/^\| (.*) \|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return `<tr class="border-b border-white/5">${cells.map(c => `<td class="px-3 py-1.5 text-xs text-gray-300">${c.trim()}</td>`).join('')}</tr>`;
    })
    .replace(/((?:<tr[^>]*>.*?<\/tr>\n?)+)/gm, '<table class="w-full border border-white/10 rounded-lg overflow-hidden my-3">$1</table>')
    .replace(/^- (.*?)$/gm, '<li class="text-xs text-gray-300 flex items-start gap-1.5 mb-1"><span class="text-const-orange mt-0.5">•</span><span>$1</span></li>')
    .replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/gm, '<ul class="space-y-1 my-2">$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `## 🏗️ Welcome to JSR AI Construction Assistant!

I'm your expert guide for building materials, cost estimation, and construction advice.

**I can help you with:**
- 📐 Material quantity estimates for any house size
- 💰 Current market rates for cement, steel, sand, aggregates
- 🏗️ Construction advice and IS code guidance
- 📋 Auto-generate Request for Quotations
- 🧮 Cost calculations with GST and logistics

**Try asking:**
- "Calculate materials for 2000 sqft G+1 house"
- "What is the rate for UltraTech OPC 53 cement?"
- "Which TMT steel is best for seismic zones?"

I respond in Hindi, Marathi, or English — just type in your preferred language! 🙏`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v2/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), conversationId }),
      });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not process that request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Connection error. Please check your internet and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: "Chat cleared! How can I help you with your construction project?",
      timestamp: new Date(),
    }]);
    setConversationId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] flex flex-col pt-16">
      {/* Header */}
      <div className="border-b border-premium-border/40 bg-[#0d0d14]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-const-orange to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-const-orange/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white font-display">JSR AI Assistant</h1>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-400 font-semibold">Online • Construction Expert</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={clearChat} className="p-2 rounded-xl border border-premium-border/60 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 px-4 sm:px-6 lg:px-8">
        {/* Quick Prompts */}
        <div className="py-4 flex overflow-x-auto gap-2 scrollbar-hide">
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              onClick={() => sendMessage(qp.prompt)}
              disabled={loading}
              className="flex-shrink-0 flex items-center space-x-1.5 bg-white/5 hover:bg-const-orange/10 border border-premium-border hover:border-const-orange/30 text-gray-300 hover:text-const-orange text-[10px] font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-const-orange/20 border border-const-orange/30'
                    : 'bg-gradient-to-br from-const-orange to-amber-600 shadow-lg shadow-const-orange/20'
                }`}>
                  {msg.role === 'user'
                    ? <span className="text-const-orange text-xs font-black">U</span>
                    : <Bot className="w-4 h-4 text-white" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] group relative ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-const-orange text-white rounded-tr-sm'
                      : 'bg-white/5 border border-premium-border/60 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div
                        className="text-sm leading-relaxed prose-dark"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => copyMessage(msg.id, msg.content)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition-colors">
                      {copied === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <span className="text-[10px] text-gray-600">
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-const-orange to-amber-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-premium-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center space-x-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-const-orange rounded-full"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="py-4 border-t border-premium-border/40">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-white/5 border border-premium-border rounded-2xl overflow-hidden focus-within:border-const-orange transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about materials, costs, quantities... (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-white focus:outline-none resize-none max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-const-orange rounded-2xl flex items-center justify-center shadow-lg shadow-const-orange/25 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center">
            Powered by Google Gemini AI • Responds in Hindi, Marathi & English
          </p>
        </div>
      </div>
    </div>
  );
}
