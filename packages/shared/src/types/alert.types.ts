import type { Timestamp } from 'firebase/firestore';
import type { DataSource } from './zone.types';

// ─── Alert ────────────────────────────────────────────────────────────────────

export type AlertType =
  | 'crowd'
  | 'security'
  | 'weather'
  | 'routing'
  | 'system'
  | 'medical';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertStatus =
  | 'active'
  | 'acknowledged'
  | 'dismissed'
  | 'expired';

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  sourceAgentId: string;           // e.g. "agent:crowd-intelligence"
  relatedIncidentId?: string;
  affectedZones: string[];         // Zone IDs
  recommendation?: string;         // AI-generated action suggestion
  autoExpireAt?: Timestamp;        // TTL — null = persistent until dismissed
  dataSource: DataSource;
  createdAt: Timestamp;
  acknowledgedBy?: string;
  acknowledgedAt?: Timestamp;
}
