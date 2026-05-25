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

export default function DashboardPage() {
  const { zones, loading: zonesLoading } = useZones();
  const { incidents, loading: incidentsLoading } = useIncidents({ limitCount: 20 });
  const { alerts } = useAlerts({ limitCount: 10 });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2" style={{ fontFamily: 'Geist, sans-serif' }}>
            Live Operations Dashboard
          </h1>
          <p className="text-sm text-outline-variant mt-0.5">Real-time stadium telemetry and AI command</p>
        </div>
        <div className="flex items-center gap-3">
          {(zonesLoading || incidentsLoading) ? (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-outline-variant bg-surface-container px-3 py-1.5 rounded-full border border-glass-border">
              <span className="material-symbols-outlined text-[14px] animate-spin text-primary">refresh</span>
              Syncing...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 glow-emerald">
              <div className="pulse-indicator w-1.5 h-1.5 rounded-full bg-primary" />
              Live System Active
            </div>
          )}
        </div>
      </div>

      {/* KPI Top Bar */}
      <KPIBar zones={zones} incidents={incidents} alerts={alerts} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left/Center Column: Zones & Simulation (8 cols on xl) */}
        <div className="xl:col-span-8 space-y-6 flex flex-col">
          <div className="flex-1">
            <ZoneGrid zones={zones} />
          </div>
          <div>
            <SimulationControl />
          </div>
        </div>

        {/* Right Column: AI & Incident Feed (4 cols on xl) */}
        <div className="xl:col-span-4 space-y-6 flex flex-col xl:h-[calc(100vh-280px)] min-h-[800px]">
          <div className="h-1/2 min-h-[400px]">
            <AICommandCenter />
          </div>
          <div className="h-1/2 min-h-[400px] overflow-hidden flex flex-col">
            <IncidentFeed incidents={incidents} />
          </div>
        </div>
        
      </div>
    </div>
  );
}
