'use client';

import React from 'react';
import { useZones } from '@/lib/hooks/useZones';
import { useIncidents } from '@/lib/hooks/useIncidents';
import { useAlerts } from '@/lib/hooks/useAlerts';

import { KPIBar } from '@/components/dashboard/KPIBar';
import { ZoneGrid } from '@/components/dashboard/ZoneGrid';
import { IncidentFeed } from '@/components/dashboard/IncidentFeed';
import { AICommandCenter } from '@/components/dashboard/AICommandCenter';
import { SimulationControl } from '@/components/dashboard/SimulationControl';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  // Centralized Data Fetching
  const { zones, loading: zonesLoading } = useZones();
  const { incidents, loading: incidentsLoading } = useIncidents({ limitCount: 20 });
  const { alerts } = useAlerts({ limitCount: 10 });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            Live Operations Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time stadium telemetry and AI command</p>
        </div>
        <div className="flex items-center gap-3">
          {(zonesLoading || incidentsLoading) ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-surface-raised px-3 py-1.5 rounded-full border border-surface-border">
              <Activity size={12} className="animate-spin text-brand-400" />
              Syncing...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live System Active
            </div>
          )}
        </div>
      </div>

      {/* KPI Top Bar */}
      <KPIBar zones={zones} incidents={incidents} alerts={alerts} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Center Column: Zones & Simulation (2/3 width on xl) */}
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          {/* Zone Grid */}
          <div className="flex-1">
            <ZoneGrid zones={zones} />
          </div>

          {/* Simulation Controls */}
          <div>
            <SimulationControl />
          </div>
        </div>

        {/* Right Column: AI & Incident Feed (1/3 width on xl) */}
        <div className="xl:col-span-1 space-y-6 flex flex-col h-[800px]">
          {/* AI Command Center (takes top half) */}
          <div className="h-1/2">
            <AICommandCenter />
          </div>

          {/* Incident Feed (takes bottom half) */}
          <div className="h-1/2 overflow-hidden flex flex-col">
            <IncidentFeed incidents={incidents} />
          </div>
        </div>
        
      </div>
    </div>
  );
}
