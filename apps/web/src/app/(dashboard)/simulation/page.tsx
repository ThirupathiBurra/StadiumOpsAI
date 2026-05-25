'use client';

import React, { useState } from 'react';
import { SCENARIO_CATALOG } from '@stadium/shared';
import { auth } from '@/lib/firebase/auth';
import { Play, Loader2, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

const SCENARIOS = Object.values(SCENARIO_CATALOG);

const SCENARIO_ICONS: Record<string, string> = {
  'gate-congestion':      'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  'crowd-surge':          'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  'security-incident':    'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  'emergency-evacuation': 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  'weather-disruption':   'M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z',
};

const SCENARIO_COLORS: Record<string, string> = {
  'gate-congestion':      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'crowd-surge':          'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'security-incident':    'text-red-400    bg-red-400/10    border-red-400/20',
  'emergency-evacuation': 'text-red-400    bg-red-400/10    border-red-400/20',
  'weather-disruption':   'text-blue-400   bg-blue-400/10   border-blue-400/20',
};

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function SimulationPage() {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog(prev => [{ time, message, type }, ...prev].slice(0, 50));
  };

  const getToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated — please sign in again.');
    return token;
  };

  const runScenario = async (scenarioId: string, scenarioName: string) => {
    if (runningScenario || isResetting) return;
    setRunningScenario(scenarioId);
    addLog(`▶ Starting scenario: ${scenarioName}...`);

    try {
      const token = await getToken();
      const res = await fetch('/api/simulation/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ scenarioId, demoMode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simulation failed');

      addLog(`✓ Scenario "${scenarioName}" started (run: ${data.runId?.slice(0, 8)}...)`, 'success');
      addLog('→ Watch the Live Dashboard & Incident Command — events are streaming live to Firestore.');
    } catch (err: any) {
      addLog(`✗ Error: ${err.message}`, 'error');
    } finally {
      setRunningScenario(null);
    }
  };

  const resetState = async () => {
    if (runningScenario || isResetting) return;
    setIsResetting(true);
    addLog('⟳ Resetting all simulation state to baseline...');

    try {
      const token = await getToken();
      const res = await fetch('/api/simulation/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullReset: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      addLog('✓ State reset complete. All zones restored to baseline occupancy.', 'success');
    } catch (err: any) {
      addLog(`✗ Reset error: ${err.message}`, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const isBusy = !!runningScenario || isResetting;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Simulation Control Panel</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Run demo scenarios to demonstrate live AI agent responses
          </p>
        </div>
      </div>

      {/* Demo mode toggle + reset */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-slate-200">Demo Mode</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {demoMode ? 'Accelerated timings — fast zone updates in the Live Dashboard' : 'Real-time speed — full scenario duration'}
            </p>
          </div>
          <button
            id="toggle-demo-mode"
            role="switch"
            aria-checked={demoMode}
            aria-label="Toggle demo mode"
            onClick={() => setDemoMode(v => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-base ${demoMode ? 'bg-brand-600' : 'bg-surface-border'}`}
          >
            <span className={`${demoMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
          </button>
        </div>

        <button
          id="btn-reset-state"
          onClick={resetState}
          disabled={isBusy}
          className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Reset all simulation state to baseline"
        >
          {isResetting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RotateCcw size={16} />
          )}
          {isResetting ? 'Resetting...' : 'Reset All State'}
        </button>
      </div>

      {/* Scenario cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Demo Scenarios
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Available simulation scenarios">
          {SCENARIOS.map((scenario) => {
            const isRunning = runningScenario === scenario.id;
            return (
              <div
                key={scenario.id}
                className={`glass-card-hover p-5 transition-all duration-200 ${isRunning ? 'ring-1 ring-brand-500/40' : ''}`}
                role="listitem"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${SCENARIO_COLORS[scenario.id] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d={SCENARIO_ICONS[scenario.id] ?? ''} />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    ~{demoMode ? Math.round(scenario.durationMs / 2000) : Math.round(scenario.durationMs / 1000)}s {demoMode ? '(demo)' : ''}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 mb-1">{scenario.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{scenario.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-slate-500">Zones:</span>
                  <div className="flex flex-wrap gap-1">
                    {scenario.primaryZones.slice(0, 3).map((z) => (
                      <span key={z} className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {z.replace('zone-', '')}
                      </span>
                    ))}
                    {scenario.primaryZones.length > 3 && (
                      <span className="text-xs text-slate-600">+{scenario.primaryZones.length - 3}</span>
                    )}
                  </div>
                </div>

                <button
                  id={`btn-run-${scenario.id}`}
                  onClick={() => runScenario(scenario.id, scenario.name)}
                  disabled={isBusy}
                  className="btn-primary w-full justify-center text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Run ${scenario.name} scenario`}
                >
                  {isRunning ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Run Scenario
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active simulation log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Simulation Log
          </h2>
          {log.length > 0 && (
            <button
              onClick={() => setLog([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div
          id="simulation-log"
          className="glass-card p-4 h-48 overflow-y-auto font-mono text-xs space-y-1"
          role="log"
          aria-label="Simulation event log"
          aria-live="polite"
        >
          {log.length === 0 ? (
            <p className="text-slate-600">— Simulation log will appear here when a scenario is running —</p>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-600 flex-shrink-0">{entry.time}</span>
                <span className={
                  entry.type === 'success' ? 'text-emerald-400' :
                  entry.type === 'error' ? 'text-rose-400' :
                  'text-slate-400'
                }>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
