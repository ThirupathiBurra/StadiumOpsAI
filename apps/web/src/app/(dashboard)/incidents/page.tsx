'use client';

import React, { useState } from 'react';
import { useIncidents } from '@/lib/hooks/useIncidents';
import { useZones } from '@/lib/hooks/useZones';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import type { IncidentStatus, IncidentSeverity, IncidentType } from '@stadium/shared';

export default function IncidentsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('low');
  const [type, setType] = useState<IncidentType>('other');
  const [zoneId, setZoneId] = useState('');

  const { zones } = useZones();

  // Dynamic filter
  const filterMap: Record<string, IncidentStatus[]> = {
    'All': ['open', 'acknowledged', 'in_progress', 'resolved', 'closed'],
    'Open': ['open'],
    'In Progress': ['acknowledged', 'in_progress'],
    'Resolved': ['resolved', 'closed'],
  };

  const { incidents, loading } = useIncidents({
    statusFilter: filterMap[activeFilter],
    limitCount: 100,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !zoneId) return;

    try {
      const selectedZone = zones.find(z => z.id === zoneId);
      await addDoc(collection(db, 'incidents'), {
        title,
        description,
        severity,
        type,
        status: 'open',
        zoneId,
        zoneName: selectedZone?.name || 'Unknown Zone',
        reportedBy: auth.currentUser?.uid || 'anonymous',
        dataSource: 'manual',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setSeverity('low');
      setType('other');
      setZoneId('');
    } catch (err) {
      console.error('Failed to create incident:', err);
      alert('Failed to create incident.');
    }
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSeverityChange = async (incidentId: string, newSeverity: IncidentSeverity) => {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        severity: newSeverity,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update severity:', err);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const severityColors = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Incident Command Center</h1>
          <p className="text-sm text-slate-400 mt-0.5">Create, track, and resolve stadium incidents</p>
        </div>
        <button 
          id="btn-create-incident" 
          onClick={() => setShowModal(true)}
          className="btn-primary" 
          aria-label="Create new incident"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Incident
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3" role="group" aria-label="Incident filters">
        {['All', 'Open', 'In Progress', 'Resolved'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            id={`filter-${filter.toLowerCase().replace(' ', '-')}`}
            className={`py-1.5 text-xs px-4 rounded-lg border transition-all duration-200 ${
              activeFilter === filter 
                ? 'bg-surface-overlay border-brand-500/50 text-slate-100' 
                : 'border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-overlay'
            }`}
            aria-label={`Filter by ${filter}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Incident table */}
      <div className="glass-card overflow-hidden" id="incident-table">
        <table className="data-table" role="table" aria-label="Incidents table">
          <thead>
            <tr>
              <th scope="col" className="pl-4">Incident</th>
              <th scope="col">Zone</th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
              <th scope="col">AI Risk Score</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-12">
                  <p className="text-sm animate-pulse">Loading incidents...</p>
                </td>
              </tr>
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-12">
                  <p className="text-sm">No active incidents</p>
                  <p className="text-xs mt-1 text-slate-600">Incidents appear here when reported or simulated</p>
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-surface-overlay/50 transition-colors">
                  <td className="pl-4">
                    <p className="text-sm font-medium text-slate-200">{incident.title}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{incident.description}</p>
                  </td>
                  <td>
                    <span className="text-sm text-slate-300">{incident.zoneName}</span>
                  </td>
                  <td>
                    <select
                      value={incident.severity}
                      onChange={(e) => handleSeverityChange(incident.id, e.target.value as IncidentSeverity)}
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border appearance-none cursor-pointer outline-none ${severityColors[incident.severity]}`}
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MEDIUM</option>
                      <option value="high">HIGH</option>
                      <option value="critical">CRITICAL</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={incident.status}
                      onChange={(e) => handleStatusChange(incident.id, e.target.value as IncidentStatus)}
                      className="bg-surface-base border border-surface-border text-slate-300 text-xs px-2 py-1 rounded appearance-none cursor-pointer outline-none focus:border-brand-500/50"
                    >
                      <option value="open">Open</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    {incident.aiRiskScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-base rounded-full overflow-hidden border border-surface-border">
                          <div 
                            className={`h-full ${incident.aiRiskScore > 75 ? 'bg-rose-500' : incident.aiRiskScore > 40 ? 'bg-amber-500' : 'bg-brand-500'}`}
                            style={{ width: `${incident.aiRiskScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{incident.aiRiskScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Pending AI...</span>
                    )}
                  </td>
                  <td className="text-xs text-slate-400">
                    {formatTime(incident.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Report New Incident</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="ops-input" 
                  placeholder="e.g. Unattended Bag" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="ops-input min-h-[80px] resize-none" 
                  placeholder="Describe the situation..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Zone</label>
                  <select 
                    required
                    value={zoneId}
                    onChange={e => setZoneId(e.target.value)}
                    className="ops-input appearance-none"
                  >
                    <option value="" disabled>Select Zone</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as IncidentType)}
                    className="ops-input appearance-none"
                  >
                    <option value="medical">Medical</option>
                    <option value="security_breach">Security</option>
                    <option value="crowd_surge">Crowd Surge</option>
                    <option value="fire">Fire</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Initial Severity</label>
                <select 
                  value={severity}
                  onChange={e => setSeverity(e.target.value as IncidentSeverity)}
                  className="ops-input appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
