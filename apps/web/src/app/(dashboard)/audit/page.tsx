'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '@/lib/hooks/useAuditLogs';
import type { AuditEntityType, AuditActorType } from '@stadium/shared';

export default function AuditPage() {
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | ''>('');
  const [actorFilter, setActorFilter] = useState<AuditActorType | ''>('');

  const { logs, loading } = useAuditLogs({
    entityTypeFilter: entityFilter || undefined,
    actorTypeFilter: actorFilter || undefined,
    limitCount: 200,
  });

  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Audit Logs</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Immutable, real-time record of all system and user actions
          </p>
        </div>
        <button 
          id="btn-export-audit" 
          onClick={handleExport}
          className="btn-ghost" 
          aria-label="Export audit logs as JSON"
          disabled={logs.length === 0}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Audit log filters">
        <select
          id="filter-entity-type"
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value as AuditEntityType | '');
            setActorFilter(''); // Mutual exclusivity simplified for now based on hook
          }}
          className="ops-input w-auto text-xs py-1.5 cursor-pointer appearance-none"
          aria-label="Filter by entity type"
        >
          <option value="">All Entity Types</option>
          <option value="incident">Incidents</option>
          <option value="alert">Alerts</option>
          <option value="zone">Zones</option>
          <option value="user">Users</option>
          <option value="simulation">Simulations</option>
          <option value="system">System</option>
        </select>
        <select
          id="filter-actor-type"
          value={actorFilter}
          onChange={(e) => {
            setActorFilter(e.target.value as AuditActorType | '');
            setEntityFilter(''); // Mutual exclusivity
          }}
          className="ops-input w-auto text-xs py-1.5 cursor-pointer appearance-none"
          aria-label="Filter by actor type"
        >
          <option value="">All Actor Types</option>
          <option value="user">User</option>
          <option value="agent">Agent</option>
          <option value="simulation">Simulation</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Audit log table */}
      <div className="glass-card overflow-hidden" id="audit-log-table">
        <table className="data-table" role="table" aria-label="Audit log table">
          <thead>
            <tr>
              <th scope="col" className="pl-4">Time</th>
              <th scope="col">Action</th>
              <th scope="col">Entity</th>
              <th scope="col">Actor</th>
              <th scope="col">Actor Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-12">
                  <p className="text-sm animate-pulse">Loading audit logs...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-12">
                  <p className="text-sm">No audit logs yet</p>
                  <p className="text-xs mt-1 text-slate-600">
                    All system actions are recorded here automatically
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-overlay/50 transition-colors">
                  <td className="pl-4 text-xs text-slate-400 whitespace-nowrap">
                    {formatTime(log.timestamp)}
                  </td>
                  <td>
                    <span className="text-sm text-slate-200 font-medium">{log.action}</span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-[10px] text-slate-500 max-w-sm truncate font-mono">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-raised border border-surface-border text-slate-300">
                      {log.entityType}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate">{log.entityId}</p>
                  </td>
                  <td>
                    <span className="text-sm text-slate-300 truncate max-w-[150px] inline-block">
                      {log.actorId}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                      log.actorType === 'agent' 
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                        : log.actorType === 'simulation'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : log.actorType === 'user'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-surface-raised border-surface-border text-slate-400'
                    }`}>
                      {log.actorType}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
