import React from 'react';
import type { Zone } from '@stadium/shared';

interface ZoneCardProps {
  zone: Zone;
  previousOccupancy?: number;
}

// ── Status config map (Cyber-Zen palette) ─────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  badge: string;       // badge text color
  badgeBg: string;     // badge bg
  badgeBorder: string; // badge border
  dot: string;         // dot color
  bar: string;         // progress bar color
  barGlow: string;     // glow class
  pulse: boolean;
  label: string;
}> = {
  normal: {
    badge: 'text-primary',
    badgeBg: 'bg-primary/10',
    badgeBorder: 'border-primary/30',
    dot: 'bg-primary',
    bar: 'bg-primary',
    barGlow: 'glow-box-emerald',
    pulse: false,
    label: 'Normal',
  },
  warning: {
    badge: 'text-secondary',
    badgeBg: 'bg-secondary/10',
    badgeBorder: 'border-secondary/30',
    dot: 'bg-secondary',
    bar: 'bg-secondary',
    barGlow: 'glow-box-amber',
    pulse: false,
    label: 'Warning',
  },
  critical: {
    badge: 'text-tertiary-container',
    badgeBg: 'bg-tertiary-container/10',
    badgeBorder: 'border-tertiary-container/30',
    dot: 'bg-tertiary-container',
    bar: 'bg-tertiary-container',
    barGlow: 'glow-box-rose',
    pulse: true,
    label: 'Critical',
  },
  evacuating: {
    badge: 'text-secondary-container',
    badgeBg: 'bg-secondary-container/10',
    badgeBorder: 'border-secondary-container/30',
    dot: 'bg-secondary-container',
    bar: 'bg-secondary-container',
    barGlow: 'glow-box-orange',
    pulse: true,
    label: 'Evacuating',
  },
  closed: {
    badge: 'text-outline-variant',
    badgeBg: 'bg-surface-variant/30',
    badgeBorder: 'border-outline-variant/20',
    dot: 'bg-outline-variant',
    bar: 'bg-outline-variant',
    barGlow: '',
    pulse: false,
    label: 'Closed',
  },
};

export function ZoneCard({ zone, previousOccupancy }: ZoneCardProps) {
  const cfg     = STATUS_CONFIG[zone.status] ?? STATUS_CONFIG['normal'];
  const percent = Math.min(Math.round(zone.occupancyPercent ?? 0), 100);
  const formatNum = (n: number) => new Intl.NumberFormat('en-US').format(n);

  // Trend arrow
  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (previousOccupancy !== undefined) {
    if (zone.currentOccupancy > previousOccupancy + 50) trend = 'up';
    else if (zone.currentOccupancy < previousOccupancy - 50) trend = 'down';
  }
  const trendIcon = trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
  const trendColor = trend === 'up' ? 'text-tertiary-container' : trend === 'down' ? 'text-primary' : 'text-outline-variant';

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-white/15 transition-all duration-300">

      {/* Header row */}
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <h4
            className="text-[18px] font-semibold text-on-surface leading-tight truncate"
            style={{ fontFamily: 'Geist, sans-serif', letterSpacing: '-0.01em' }}
          >
            {zone.name}
          </h4>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-outline-variant mt-0.5">
            {zone.shortCode}
          </p>
        </div>

        {/* Status badge */}
        <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.badgeBg} ${cfg.badgeBorder} border ml-2`}>
          <span className={`relative w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0 ${cfg.pulse ? 'pulse-indicator' : ''}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Occupancy row */}
      <div className="flex justify-between items-end mb-3">
        <span className="text-[28px] font-bold text-on-surface leading-none" style={{ fontFamily: 'Geist, sans-serif', letterSpacing: '-0.03em' }}>
          {formatNum(zone.currentOccupancy)}
          <span className="text-base font-normal text-on-surface-variant ml-1">
            / {formatNum(zone.capacity)}
          </span>
        </span>
        <div className="flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${trendColor}`}>{trendIcon}</span>
          <span className={`text-sm font-bold ${cfg.badge}`}>{percent}%</span>
        </div>
      </div>

      {/* Emissive progress bar */}
      <div className="w-full h-px bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${cfg.bar} ${cfg.barGlow}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
