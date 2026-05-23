'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase/auth';

const QUICK_PROMPTS = [
  'Summarise current stadium situation',
  'Which zones need immediate attention?',
  'Recommend evacuation route for North Stand',
  'What is the current overall risk level?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function AIConsolePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    
    const queryText = (overrideInput || input).trim();
    if (!queryText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/ai-console', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: queryText }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100">AI Command Console</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Query the AI operations assistant with live stadium context
        </p>
      </div>

      {/* Context banner */}
      <div
        className="glass-card p-3 flex items-center gap-3"
        id="ai-context-banner"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <p className="text-xs text-slate-400">
          AI has access to live zone status, active incidents, and alert data
        </p>
      </div>

      {/* Response area */}
      <div
        className="glass-card flex-1 p-6 min-h-[300px] overflow-y-auto space-y-4 custom-scrollbar"
        id="ai-response-area"
      >
        {messages.length === 0 ? (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-400">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-400 mb-1">StadiumOps AI</p>
              <p className="text-sm text-slate-300">
                Hello. I&apos;m your AI operations assistant for the APL Grand Final.
                I have real-time access to all stadium zones, incidents, and alerts.
                How can I help you?
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-slate-300' 
                  : 'bg-brand-600 text-white border border-brand-400'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-surface-base border border-surface-border text-slate-200 rounded-tr-sm'
                  : 'bg-surface-raised border border-surface-border text-slate-200 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[9px] text-slate-500 block mt-2 opacity-60">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white border border-brand-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <div className="bg-surface-raised border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSubmit(undefined, prompt)}
            disabled={isLoading}
            className="btn-ghost py-1.5 text-xs hover:text-brand-400 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask about any zone, incident, or operational decision..."
          className="ops-input flex-1"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Send
            </>
          )}
        </button>
      </form>
    </div>
  );
}
