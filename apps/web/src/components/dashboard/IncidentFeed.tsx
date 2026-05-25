import React from 'react';
import type { Incident } from '@stadium/shared';

interface IncidentFeedProps {
  incidents: Incident[];
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  // Cyber-Zen severity styling map
  const severityStyles: Record<string, { badge: string; border: string; glow: string; dot: string; pulse: boolean }> = {
    low: {
      badge: 'text-primary bg-primary/10 border-primary/30',
      border: 'border-l-primary',
      glow: '',
      dot: 'bg-primary',
      pulse: false
    },
    medium: {
      badge: 'text-secondary bg-secondary/10 border-secondary/30',
      border: 'border-l-secondary',
      glow: '',
      dot: 'bg-secondary',
      pulse: false
    },
    high: {
      badge: 'text-secondary-container bg-secondary-container/10 border-secondary-container/30',
      border: 'border-l-secondary-container',
      glow: 'glow-box-orange',
      dot: 'bg-secondary-container',
      pulse: true
    },
    critical: {
      badge: 'text-tertiary-container bg-tertiary-container/10 border-tertiary-container/30',
      border: 'border-l-tertiary-container',
      glow: 'glow-box-rose',
      dot: 'bg-tertiary-container',
      pulse: true
    },
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-1 mb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-outline-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">notifications_active</span>
          Live Incident Feed
        </h2>
        {incidents.length > 0 && (
          <div className="pulse-indicator w-2 h-2 rounded-full bg-tertiary-container mr-2" aria-hidden="true" />
        )}
      </div>

      <div
        id="alert-feed"
        className="space-y-3 overflow-y-auto pr-2 flex-1 max-h-[600px] custom-scrollbar"
        role="feed"
        aria-label="Live alert feed"
        aria-live="polite"
      >
        {incidents.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            </div>
            <p className="text-sm text-on-surface font-medium">No active incidents</p>
            <p className="text-xs text-outline-variant mt-1">All zones are operating normally</p>
          </div>
        ) : (
          incidents.map((incident) => {
            const style = severityStyles[incident.severity] || severityStyles['low'];
            
            return (
              <div 
                key={incident.id} 
                className={`glass-panel p-4 rounded-xl animate-slide-in-up border-l-4 ${style.border} ${style.glow}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                    {incident.severity}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-outline-variant font-mono">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {formatTime(incident.createdAt)}
                  </div>
                </div>
                
                <h4 className="text-sm font-semibold text-on-surface mb-1 leading-snug">
                  {incident.title}
                </h4>
                
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                  {incident.description}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border">
                  <span className="text-[10px] font-medium text-outline-variant uppercase tracking-wider">
                    Zone: <span className="text-on-surface ml-1">{incident.zoneName}</span>
                  </span>
                  <span className="text-[10px] font-medium text-primary capitalize">
                    {incident.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
