import type { Metadata } from 'next';
import { SCENARIO_CATALOG } from '@stadium/shared';

export const metadata: Metadata = { title: 'Simulation Control Panel' };

// ─── Screen 5: Simulation Control Panel ──────────────────────────────────────
// TODO: Wire up triggerSimulation + resetSimulation callables in Phase 4 UI build.

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

export default function SimulationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
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
              Accelerated timings (0.5× speed) + auto state reset before each scenario
            </p>
          </div>
          <button
            id="toggle-demo-mode"
            role="switch"
            aria-checked="true"
            aria-label="Toggle demo mode"
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-brand-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-[#161b27]"
          >
            <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
          </button>
        </div>

        <button
          id="btn-reset-state"
          className="btn-danger"
          aria-label="Reset all simulation state to baseline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Reset All State
        </button>
      </div>

      {/* Scenario cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Demo Scenarios
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Available simulation scenarios">
          {SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="glass-card-hover p-5"
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
                  ~{Math.round(scenario.durationMs / 1000)}s
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
                className="btn-primary w-full justify-center text-xs py-2"
                aria-label={`Run ${scenario.name} scenario`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                Run Scenario
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active simulation log */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Simulation Log
        </h2>
        <div
          id="simulation-log"
          className="glass-card p-4 h-48 overflow-y-auto font-mono text-xs text-slate-400"
          role="log"
          aria-label="Simulation event log"
          aria-live="polite"
        >
          <p className="text-slate-600">— Simulation log will appear here when a scenario is running —</p>
        </div>
      </div>
    </div>
  );
}
