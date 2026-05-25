'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
    <div className="glass-panel flex flex-col h-full rounded-xl relative overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b border-glass-border flex items-center justify-between bg-surface-base/50 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary glow-emerald">
            <span className="material-symbols-outlined text-[18px]">memory</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>StadiumOps AI Command</h2>
            <p className="text-[10px] text-outline-variant font-mono uppercase tracking-widest mt-0.5">Tactical Intel</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-glass-border bg-black/20">
          <div className="pulse-indicator w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Live</span>
        </div>
      </div>

      {/* Global Command Input (Top) */}
      <div className="p-4 border-b border-glass-border bg-surface-container-low/50 z-10">
        <form onSubmit={handleSubmit} className="relative group/form">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline-variant group-focus-within/form:text-primary transition-colors">terminal</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Issue command to StadiumOps AI..."
            className="ops-input bg-surface-container-lowest"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-full bg-primary text-on-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar z-10 bg-gradient-to-b from-transparent to-surface-base/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mb-4 border border-glass-border">
              <span className="material-symbols-outlined text-primary text-[28px]">graphic_eq</span>
            </div>
            <p className="text-sm font-medium text-on-surface font-mono">AWAITING INSTRUCTIONS</p>
            <p className="text-xs text-outline-variant mt-2 max-w-[220px] leading-relaxed">
              Query zone telemetry, deploy security units, or trigger emergency protocols.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                msg.role === 'user' 
                  ? 'bg-surface-container-highest text-on-surface border-glass-border' 
                  : 'bg-primary/20 text-primary border-primary/30 glow-emerald'
              }`}>
                <span className="material-symbols-outlined text-[16px]">
                  {msg.role === 'user' ? 'person' : 'memory'}
                </span>
              </div>
              
              {/* Message bubble */}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-surface-container border border-glass-border text-on-surface rounded-tr-sm'
                  : 'glass-panel text-on-surface rounded-tl-sm'
              }`}>
                <div className={`text-[13px] leading-relaxed font-sans ${msg.role === 'agent' ? 'prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0' : 'whitespace-pre-wrap'}`}>
                  {msg.role === 'agent' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-[9px] text-outline-variant block mt-2 font-mono tracking-widest uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center glow-emerald">
              <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
            </div>
            <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <span className="text-[12px] text-primary font-mono uppercase tracking-widest">Processing</span>
              <span className="ai-cursor" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
