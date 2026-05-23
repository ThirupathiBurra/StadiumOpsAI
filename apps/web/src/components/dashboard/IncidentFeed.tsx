import React from 'react';
import type { Incident } from '@stadium/shared';
import { Clock, AlertCircle } from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  // Severity styling map
  const severityStyles = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Now';
    // Handle Firestore Timestamp or Date object
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="col-span-1 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle size={14} className="text-brand-400" />
          Live Incident Feed
        </h2>
        {incidents.length > 0 && (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
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
          <div className="glass-card p-8 text-center flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm text-slate-300 font-medium">No active incidents</p>
            <p className="text-xs text-slate-500 mt-1">All zones are operating normally</p>
          </div>
        ) : (
          incidents.map((incident) => {
            const style = severityStyles[incident.severity] || severityStyles.low;
            
            return (
              <div 
                key={incident.id} 
                className={`glass-card p-4 animate-slide-in-up border-l-4 ${
                  incident.severity === 'critical' ? 'border-l-rose-500' : 
                  incident.severity === 'high' ? 'border-l-orange-500' :
                  incident.severity === 'medium' ? 'border-l-amber-500' : 'border-l-emerald-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style}`}>
                    {incident.severity}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={10} />
                    {formatTime(incident.createdAt)}
                  </div>
                </div>
                
                <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug">
                  {incident.title}
                </h4>
                
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                  {incident.description}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Zone: <span className="text-slate-300">{incident.zoneName}</span>
                  </span>
                  <span className="text-[10px] font-medium text-brand-400 capitalize">
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
