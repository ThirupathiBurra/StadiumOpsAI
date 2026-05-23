import React from 'react';
import type { Zone } from '@stadium/shared';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ZoneCardProps {
  zone: Zone;
  previousOccupancy?: number; // Used for trend indicator
}

export function ZoneCard({ zone, previousOccupancy }: ZoneCardProps) {
  // Status styling map
  const statusStyles: Record<string, { bg: string; border: string; text: string; badge: string; pulse?: boolean }> = {
    normal: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500' },
    critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', badge: 'bg-rose-500' },
    evacuating: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'bg-orange-500', pulse: true },
    closed: { bg: 'bg-slate-800/50', border: 'border-slate-700', text: 'text-slate-400', badge: 'bg-slate-600' },
  };

  const style = statusStyles[zone.status] || statusStyles['normal'];
  const percent = Math.min(Math.round(zone.occupancyPercent), 100);

  // Determine trend
  let TrendIcon = Minus;
  let trendColor = 'text-slate-500';
  if (previousOccupancy !== undefined) {
    if (zone.currentOccupancy > previousOccupancy + 50) {
      TrendIcon = TrendingUp;
      trendColor = 'text-rose-400';
    } else if (zone.currentOccupancy < previousOccupancy - 50) {
      TrendIcon = TrendingDown;
      trendColor = 'text-emerald-400';
    }
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className={`glass-card p-4 transition-all duration-300 border ${style.border} ${style.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-surface-raised border border-surface-border">
            <MapPin size={14} className="text-slate-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{zone.name}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{zone.shortCode}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-raised border ${style.border}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${style.badge} ${style.pulse ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-medium uppercase tracking-wider ${style.text}`}>
            {zone.status}
          </span>
        </div>
      </div>

      {/* Occupancy Stats */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-slate-100">{formatNumber(zone.currentOccupancy)}</span>
            <span className="text-xs text-slate-500 mb-1">/ {formatNumber(zone.capacity)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <TrendIcon size={12} className={trendColor} />
            <span className="text-sm font-semibold text-slate-200">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${style.badge}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
