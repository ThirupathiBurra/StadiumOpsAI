import React from 'react';
import type { Zone, Incident, Alert } from '@stadium/shared';

interface KPIBarProps {
  zones: Zone[];
  incidents: Incident[];
  alerts: Alert[];
}

interface KPICardProps {
  icon: string;
  value: string | number;
  label: string;
  sublabel: string;
  colorClass: string;
  pulse?: boolean;
  badge?: string;
}

function KPICard({ icon, value, label, sublabel, colorClass, pulse, badge }: KPICardProps) {
  return (
    <div className="glass-panel rounded-xl p-card-padding flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start">
        <div className={`relative ${pulse ? 'pulse-indicator' : ''}`}>
          <span className={`material-symbols-outlined text-[28px] ${colorClass}`}>{icon}</span>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${colorClass}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3
          className={`font-display text-[42px] font-bold tracking-tighter leading-none mb-1 ${colorClass}`}
          style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
        >
          {value}
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-outline-variant">
          {label}
        </p>
        {sublabel && (
          <p className="text-[10px] text-outline-variant/60 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

export function KPIBar({ zones, incidents, alerts }: KPIBarProps) {
  const totalOccupancy    = zones.reduce((sum, z) => sum + (z.currentOccupancy || 0), 0);
  const activeIncidents   = incidents.filter(i => ['open', 'acknowledged', 'in_progress'].includes(i.status)).length;
  const activeAlerts      = alerts.filter(a => a.status === 'active').length;
  const criticalZones     = zones.filter(z => ['critical', 'evacuating'].includes(z.status)).length;
  const formatNum = (n: number) => new Intl.NumberFormat('en-US').format(n);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-base" role="region" aria-label="Stadium metrics">
      <KPICard
        icon="groups"
        value={formatNum(totalOccupancy)}
        label="Fans Currently In Stadium"
        sublabel="Live headcount"
        colorClass="text-on-surface"
        badge="Live Data"
      />
      <KPICard
        icon="warning"
        value={activeIncidents}
        label="Active Incidents"
        sublabel="Open or in progress"
        colorClass={activeIncidents > 0 ? 'text-secondary' : 'text-on-surface'}
        pulse={activeIncidents > 0}
        badge={activeIncidents > 0 ? 'Active' : undefined}
      />
      <KPICard
        icon="shield"
        value={activeAlerts}
        label="Active Alerts"
        sublabel="Requiring action"
        colorClass={activeAlerts > 0 ? 'text-tertiary-container' : 'text-on-surface'}
        pulse={activeAlerts > 0}
        badge={activeAlerts > 0 ? 'Critical' : undefined}
      />
      <KPICard
        icon="dynamic_feed"
        value={criticalZones}
        label="Critical Zones"
        sublabel="High risk or evacuating"
        colorClass={criticalZones > 0 ? 'text-secondary-container' : 'text-on-surface'}
        badge={criticalZones > 0 ? 'Risk Level' : undefined}
      />
    </div>
  );
}
