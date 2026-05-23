import type { Firestore } from 'firebase-admin/firestore';
import { Collections, AgentIds } from '../firebase-admin';

// ─── Simulation Data Writer ────────────────────────────────────────────────────
// Utility for writing simulation events to Firestore with consistent
// metadata tagging (dataSource: 'simulated').

export interface WriteZoneOptions {
  zoneId: string;
  updates: Record<string, unknown>;
  scenarioId: string;
}

export interface WriteIncidentOptions {
  incidentId?: string;
  data: Record<string, unknown>;
  scenarioId: string;
}

export interface WriteAlertOptions {
  data: Record<string, unknown>;
  scenarioId: string;
}

/** Delay utility — awaitable setTimeout */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Write or merge a zone update with simulation metadata */
export async function writeZone(
  db: Firestore,
  opts: WriteZoneOptions
): Promise<void> {
  await db.collection(Collections.ZONES).doc(opts.zoneId).set(
    {
      ...opts.updates,
      dataSource: { type: 'simulated', simulationScenarioId: opts.scenarioId },
      updatedAt: new Date(),
      updatedBy: AgentIds.SIMULATION,
    },
    { merge: true }
  );
}

/** Create an incident document with simulation metadata */
export async function writeIncident(
  db: Firestore,
  opts: WriteIncidentOptions
): Promise<string> {
  const ref = opts.incidentId
    ? db.collection(Collections.INCIDENTS).doc(opts.incidentId)
    : db.collection(Collections.INCIDENTS).doc();

  await ref.set({
    id: ref.id,
    ...opts.data,
    dataSource: { type: 'simulated', simulationScenarioId: opts.scenarioId },
    createdAt: new Date(),
    updatedAt: new Date(),
    reportedBy: AgentIds.SIMULATION,
  });

  return ref.id;
}

/** Append an event description to the simulation run log */
export async function logSimEvent(
  db: Firestore,
  runId: string,
  message: string
): Promise<void> {
  const { FieldValue } = await import('firebase-admin/firestore');
  await db.collection(Collections.SIMULATIONS).doc(runId).update({
    eventLog: FieldValue.arrayUnion(`[${new Date().toISOString()}] ${message}`),
  });
}
