// ─── Types ────────────────────────────────────────────────────────────────────
export type { DataSource, Zone, ZoneSection, ZoneStatus, ZoneCoordinates } from './types/zone.types';
export type { Incident, IncidentType, IncidentSeverity, IncidentStatus, CreateIncidentInput } from './types/incident.types';
export type { Alert, AlertType, AlertSeverity, AlertStatus } from './types/alert.types';
export type { StadiumUser, UserRole, RolePermissions } from './types/user.types';
export type { AuditLog, AuditAction, AuditEntityType, AuditActorType } from './types/audit.types';
export type {
  ScenarioId,
  SimulationEvent,
  ScenarioDefinition,
  SimulationRun,
  SimulationRunStatus,
  TriggerSimulationPayload,
  ResetSimulationPayload,
} from './types/simulation.types';

// ─── Constants ────────────────────────────────────────────────────────────────
export { STADIUM_ZONES, ZONE_IDS, TOTAL_STADIUM_CAPACITY } from './constants/zones';
export { SCENARIO_CATALOG, SCENARIO_IDS } from './constants/scenarios';
export { ROLE_META, ALL_ROLES } from './constants/roles';
export {
  ZONE_STATUS_META,
  INCIDENT_SEVERITY_META,
  INCIDENT_STATUS_META,
  ALERT_SEVERITY_META,
  ALERT_STATUS_META,
  OCCUPANCY_THRESHOLDS,
} from './constants/severity';
export { ROLE_PERMISSIONS } from './types/user.types';
