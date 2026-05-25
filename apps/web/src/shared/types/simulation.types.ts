import type { Timestamp } from 'firebase/firestore';

// ─── Scenario IDs ─────────────────────────────────────────────────────────────

export type ScenarioId =
  | 'gate-congestion'
  | 'crowd-surge'
  | 'security-incident'
  | 'emergency-evacuation'
  | 'weather-disruption';

// ─── Simulation Event ─────────────────────────────────────────────────────────

export interface SimulationEvent {
  /** Milliseconds offset from scenario start time */
  delayMs: number;
  /** Target Firestore collection */
  collection: 'zones' | 'incidents' | 'alerts';
  /** Document ID to write */
  documentId: string;
  /** Merge (update) or set (overwrite) */
  operation: 'set' | 'merge';
  /** Data payload to write */
  data: Record<string, unknown>;
}

// ─── Simulation Scenario Definition ──────────────────────────────────────────

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  /** Estimated total duration in milliseconds */
  durationMs: number;
  primaryZones: string[];
  /** Multiplier applied to delayMs when demoMode=true */
  demoSpeedMultiplier: number;
  events: SimulationEvent[];
}

// ─── Simulation Run (Firestore document) ─────────────────────────────────────

export type SimulationRunStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'aborted';

export interface SimulationRun {
  id: string;
  scenarioId: ScenarioId;
  scenarioName: string;
  status: SimulationRunStatus;
  demoMode: boolean;
  startedBy: string;               // User UID
  affectedZones: string[];
  eventLog: string[];              // Human-readable event descriptions
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  error?: string;
}

// ─── Simulation Trigger Payload ───────────────────────────────────────────────

export interface TriggerSimulationPayload {
  scenarioId: ScenarioId;
  demoMode: boolean;
}

export interface ResetSimulationPayload {
  /** If true, also clears incidents, alerts, and resets zone states */
  fullReset: boolean;
}
