'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Activity, ShieldAlert, HeartPulse, Flame, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase/auth';

export function SimulationControl() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const triggerScenario = async (scenarioId: string) => {
    setIsSimulating(true);
    setActiveScenario(scenarioId);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      await fetch('/api/simulation/trigger', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scenarioId }),
      });
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    } finally {
      setIsSimulating(false);
      setActiveScenario(null);
    }
  };

  const resetSimulation = async () => {
    setIsSimulating(true);
    setActiveScenario('reset');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      await fetch('/api/simulation/reset', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Failed to reset simulation:', err);
    } finally {
      setIsSimulating(false);
      setActiveScenario(null);
    }
  };

  const scenarios = [
    { id: 'gate-congestion', label: 'Gate Congestion', icon: Activity, color: 'text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 border-orange-400/30' },
    { id: 'crowd-surge', label: 'Crowd Surge', icon: Activity, color: 'text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 border-rose-400/30' },
    { id: 'security-breach', label: 'Security Breach', icon: ShieldAlert, color: 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/30' },
    { id: 'medical-emergency', label: 'Medical Emergency', icon: HeartPulse, color: 'text-red-400 bg-red-400/10 hover:bg-red-400/20 border-red-400/30' },
    { id: 'emergency-evacuation', label: 'Evacuation', icon: Flame, color: 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30' },
  ];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Play size={14} className="text-emerald-400" />
          Simulation Engine
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-surface-raised hover:bg-surface-overlay border border-surface-border rounded-md transition-colors disabled:opacity-50"
          >
            {activeScenario === 'reset' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RotateCcw size={12} />
            )}
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {scenarios.map((s) => {
          const Icon = s.icon;
          const isActive = activeScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => triggerScenario(s.id)}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${s.color}`}
            >
              {isActive ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Icon size={14} />
              )}
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
