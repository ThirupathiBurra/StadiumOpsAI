import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'AI Command Console' };

// ─── Screen 3: AI Command Console ─────────────────────────────────────────────
// TODO: Wire up aiConsoleQuery callable function, streaming response in Phase 4.

const QUICK_PROMPTS = [
  'Summarise current stadium situation',
  'Which zones need immediate attention?',
  'Recommend evacuation route for North Stand',
  'What is the current overall risk level?',
];

export default function AIConsolePage() {
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
        aria-label="Live context loaded"
      >
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
        <p className="text-xs text-slate-400">
          AI has access to live zone status, active incidents, and alert data
        </p>
      </div>

      {/* Response area */}
      <div
        className="glass-card flex-1 p-6 min-h-[300px] overflow-y-auto"
        id="ai-response-area"
        role="log"
        aria-label="AI response area"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
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
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick query suggestions">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            id={`quick-prompt-${i}`}
            className="btn-ghost py-1.5 text-xs"
            aria-label={`Quick query: ${prompt}`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-3" role="search" aria-label="AI query input">
        <input
          type="text"
          id="ai-query-input"
          placeholder="Ask about any zone, incident, or operational decision..."
          className="ops-input flex-1"
          aria-label="Query the AI assistant"
        />
        <button
          id="btn-send-query"
          className="btn-primary flex-shrink-0"
          aria-label="Send query to AI"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
