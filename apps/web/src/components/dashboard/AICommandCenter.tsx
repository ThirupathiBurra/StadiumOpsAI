'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2, Command } from 'lucide-react';
import { auth } from '@/lib/firebase/auth';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function AICommandCenter() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
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
        body: JSON.stringify({ query: userMessage.content }),
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
    <div className="glass-card flex flex-col h-full border-brand-500/20 relative overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-base z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-brand-500/20 border border-brand-500/30 text-brand-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Antigravity AI Commander</h2>
            <p className="text-[10px] text-slate-400">Agentic Operations Orchestrator</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-surface-raised border border-surface-border">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">Online</span>
        </div>
      </div>

      {/* Global Command Input (Top) */}
      <div className="p-4 border-b border-surface-border bg-surface-raised/30 z-10">
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Command size={16} className="text-brand-400" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Issue command to StadiumOps AI..."
            className="w-full bg-surface-base border border-surface-border rounded-lg pl-10 pr-12 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10 bg-surface-base/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <Sparkles size={32} className="text-brand-500 mb-3" />
            <p className="text-sm font-medium text-slate-300">Ready for instructions</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Try asking about zone statuses, critical incidents, or direct the AI to handle a situation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-slate-300' 
                  : 'bg-brand-600 text-white border border-brand-400'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>
              
              {/* Message bubble */}
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
    </div>
  );
}
