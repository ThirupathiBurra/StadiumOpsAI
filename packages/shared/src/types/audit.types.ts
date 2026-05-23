import type { Timestamp } from 'firebase/firestore';

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditEntityType =
  | 'incident'
  | 'alert'
  | 'zone'
  | 'user'
  | 'simulation';

export type AuditActorType = 'user' | 'agent' | 'simulation';

export type AuditAction =
  // Incident actions
  | 'INCIDENT_CREATED'
  | 'INCIDENT_ACKNOWLEDGED'
  | 'INCIDENT_IN_PROGRESS'
  | 'INCIDENT_RESOLVED'
  | 'INCIDENT_CLOSED'
  | 'INCIDENT_AI_ANALYZED'
  // Alert actions
  | 'ALERT_CREATED'
  | 'ALERT_ACKNOWLEDGED'
  | 'ALERT_DISMISSED'
  | 'ALERT_EXPIRED'
  // Zone actions
  | 'ZONE_STATUS_CHANGED'
  | 'ZONE_OCCUPANCY_UPDATED'
  | 'ZONE_CLOSED'
  | 'ZONE_REOPENED'
  // User actions
  | 'USER_LOGGED_IN'
  | 'USER_CREATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_DEACTIVATED'
  // Simulation actions
  | 'SIMULATION_STARTED'
  | 'SIMULATION_COMPLETED'
  | 'SIMULATION_ABORTED'
  | 'SIMULATION_STATE_RESET';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  actorId: string;                 // UID or agent ID (e.g. "agent:orchestrator")
  actorType: AuditActorType;
  actorName: string;               // Display name for UI
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}
