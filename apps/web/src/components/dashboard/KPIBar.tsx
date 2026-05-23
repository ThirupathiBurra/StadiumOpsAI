import React from 'react';
import type { Zone, Incident, Alert } from '@stadium/shared';
import { Users, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

interface KPIBarProps {
  zones: Zone[];
  incidents: Incident[];
  alerts: Alert[];
}

export function KPIBar({ zones, incidents, alerts }: KPIBarProps) {
  // Compute metrics
  const totalOccupancy = zones.reduce((sum, z) => sum + (z.currentOccupancy || 0), 0);
  const activeIncidents = incidents.filter(i => ['open', 'acknowledged', 'in_progress'].includes(i.status)).length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const criticalZones = zones.filter(z => ['critical', 'evacuating'].includes(z.status)).length;

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="grid grid-cols-4 gap-4" role="region" aria-label="Stadium metrics">
      {/* Total Occupancy */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Users size={48} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Occupancy</p>
        </div>
        <p className="text-3xl font-bold mt-2 text-slate-100">{formatNumber(totalOccupancy)}</p>
        <p className="text-xs text-slate-600 mt-1">fans currently in stadium</p>
      </div>

      {/* Active Incidents */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-yellow-400">
          <AlertTriangle size={48} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Incidents</p>
          {activeIncidents > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          )}
        </div>
        <p className={`text-3xl font-bold mt-2 ${activeIncidents > 0 ? 'text-yellow-400' : 'text-slate-100'}`}>
          {formatNumber(activeIncidents)}
        </p>
        <p className="text-xs text-slate-600 mt-1">open or in progress</p>
      </div>

      {/* Active Alerts */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-400">
          <ShieldAlert size={48} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Alerts</p>
          {activeAlerts > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </div>
        <p className={`text-3xl font-bold mt-2 ${activeAlerts > 0 ? 'text-red-400' : 'text-slate-100'}`}>
          {formatNumber(activeAlerts)}
        </p>
        <p className="text-xs text-slate-600 mt-1">requiring attention</p>
      </div>

      {/* Critical Zones */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-400">
          <Activity size={48} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Critical Zones</p>
        </div>
        <p className={`text-3xl font-bold mt-2 ${criticalZones > 0 ? 'text-orange-400' : 'text-slate-100'}`}>
          {formatNumber(criticalZones)}
        </p>
        <p className="text-xs text-slate-600 mt-1">high risk or evacuating</p>
      </div>
    </div>
  );
}
