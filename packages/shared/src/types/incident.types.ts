import type { Timestamp } from 'firebase/firestore';
import type { DataSource } from './zone.types';

// ─── Incident ─────────────────────────────────────────────────────────────────

export type IncidentType =
  | 'crowd_surge'
  | 'medical'
  | 'security_breach'
  | 'fire'
  | 'structural'
  | 'weather_disruption'
  | 'technical'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'open'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zoneId: string;
  zoneName: string;
  reportedBy: string;              // UID or agent ID (e.g. "agent:crowd-intelligence")
  assignedTo?: string;             // Staff UID
  // AI-generated fields (populated by incident-response agent)
  aiSummary?: string;
  aiRecommendedActions?: string[];
  aiRiskScore?: number;            // 0-100
  // Resolution
  resolutionNotes?: string;
  dataSource: DataSource;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

// ─── Incident Create Input ─────────────────────────────────────────────────────

export type CreateIncidentInput = Omit<
  Incident,
  'id' | 'aiSummary' | 'aiRecommendedActions' | 'aiRiskScore' | 'createdAt' | 'updatedAt' | 'resolvedAt'
>;
