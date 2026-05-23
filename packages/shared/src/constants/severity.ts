import type { IncidentSeverity, IncidentStatus } from '../types/incident.types';
import type { AlertSeverity, AlertStatus } from '../types/alert.types';
import type { ZoneStatus } from '../types/zone.types';

// ─── Zone Status ──────────────────────────────────────────────────────────────

export interface StatusMeta {
  label: string;
  color: string;             // Tailwind classes
  dot: string;               // Dot indicator color
  occupancyThreshold?: number; // % at which this status triggers
}

export const ZONE_STATUS_META: Record<ZoneStatus, StatusMeta> = {
  normal: {
    label: 'Normal',
    color: 'text-green-400 bg-green-400/10 ring-green-400/20',
    dot: 'bg-green-400',
    occupancyThreshold: 0,
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
    dot: 'bg-yellow-400',
    occupancyThreshold: 75,
  },
  critical: {
    label: 'Critical',
    color: 'text-red-400 bg-red-400/10 ring-red-400/20',
    dot: 'bg-red-400 animate-pulse',
    occupancyThreshold: 90,
  },
  evacuating: {
    label: 'Evacuating',
    color: 'text-orange-400 bg-orange-400/10 ring-orange-400/20',
    dot: 'bg-orange-400 animate-pulse',
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
    dot: 'bg-gray-500',
  },
};

// ─── Incident Severity ────────────────────────────────────────────────────────

export const INCIDENT_SEVERITY_META: Record<IncidentSeverity, StatusMeta> = {
  low: {
    label: 'Low',
    color: 'text-green-400 bg-green-400/10 ring-green-400/20',
    dot: 'bg-green-400',
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  high: {
    label: 'High',
    color: 'text-orange-400 bg-orange-400/10 ring-orange-400/20',
    dot: 'bg-orange-400',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-400 bg-red-400/10 ring-red-400/20',
    dot: 'bg-red-400 animate-pulse',
  },
};

// ─── Incident Status ──────────────────────────────────────────────────────────

export const INCIDENT_STATUS_META: Record<IncidentStatus, StatusMeta> = {
  open: {
    label: 'Open',
    color: 'text-red-400 bg-red-400/10 ring-red-400/20',
    dot: 'bg-red-400',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-400 bg-blue-400/10 ring-blue-400/20',
    dot: 'bg-blue-400 animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-400 bg-green-400/10 ring-green-400/20',
    dot: 'bg-green-400',
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
    dot: 'bg-gray-500',
  },
};

// ─── Alert Severity ───────────────────────────────────────────────────────────

export const ALERT_SEVERITY_META: Record<AlertSeverity, StatusMeta> = {
  info: {
    label: 'Info',
    color: 'text-blue-400 bg-blue-400/10 ring-blue-400/20',
    dot: 'bg-blue-400',
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-400 bg-red-400/10 ring-red-400/20',
    dot: 'bg-red-400 animate-pulse',
  },
};

// ─── Alert Status ─────────────────────────────────────────────────────────────

export const ALERT_STATUS_META: Record<AlertStatus, StatusMeta> = {
  active: {
    label: 'Active',
    color: 'text-red-400 bg-red-400/10 ring-red-400/20',
    dot: 'bg-red-400 animate-pulse',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  dismissed: {
    label: 'Dismissed',
    color: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
    dot: 'bg-gray-500',
  },
  expired: {
    label: 'Expired',
    color: 'text-gray-500 bg-gray-500/10 ring-gray-500/20',
    dot: 'bg-gray-600',
  },
};

// ─── Occupancy Thresholds ─────────────────────────────────────────────────────

export const OCCUPANCY_THRESHOLDS = {
  WARNING: 75,   // %
  CRITICAL: 90,  // %
} as const;
