import { db, Collections, AgentIds } from '../firebase-admin';
import { STADIUM_ZONES } from '@stadium/shared';
import type { ScenarioId, TriggerSimulationPayload, ResetSimulationPayload } from '@stadium/shared';
import { runGateCongestion } from './scenarios/gate-congestion';
import { runCrowdSurge } from './scenarios/crowd-surge';
import { runSecurityIncident } from './scenarios/security-incident';
import { runEmergencyEvacuation } from './scenarios/emergency-evacuation';
import { runWeatherDisruption } from './scenarios/weather-disruption';

// ─── Simulation Engine ────────────────────────────────────────────────────────
// Functions for triggering demo scenarios and resetting state.
// Each scenario is a time-sequenced set of Firestore writes that cause
// real agent triggers to fire, creating a fully realistic demo.

export async function triggerSimulation(data: TriggerSimulationPayload, uid: string) {
  const { scenarioId, demoMode } = data;

  console.log('[SimEngine] Triggering scenario', { scenarioId, demoMode });

  // Create simulation run document
  const runRef = db.collection(Collections.SIMULATIONS).doc();
  await runRef.set({
    id: runRef.id,
    scenarioId,
    scenarioName: scenarioId,
    status: 'running',
    demoMode,
    startedBy: uid,
    affectedZones: [],
    eventLog: [],
    startedAt: new Date(),
  });

  try {
    // In Vercel serverless, this should run without awaiting if we want to return immediately,
    // but Vercel limits background execution. For a demo, it's fine to await or it will timeout
    // if the scenario takes longer than the route timeout. Next.js limits to 15s-60s on free tier.
    // For long running scenarios, they might get cut off on Vercel unless triggered asynchronously.
    await runScenario(scenarioId, demoMode, runRef.id);

    await runRef.update({
      status: 'completed',
      completedAt: new Date(),
    });

    return { success: true, runId: runRef.id };
  } catch (error) {
    await runRef.update({
      status: 'aborted',
      error: String(error),
      completedAt: new Date(),
    });
    throw new Error(`Scenario failed: ${error}`);
  }
}

export async function resetSimulation(data: ResetSimulationPayload, uid: string, userName?: string) {
  console.log('[SimEngine] Resetting simulation state', data);

  const batch = db.batch();

  if (data.fullReset) {
    // Clear incidents
    const incidents = await db.collection(Collections.INCIDENTS).get();
    incidents.docs.forEach((d: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(d.ref));

    // Clear alerts
    const alerts = await db.collection(Collections.ALERTS).get();
    alerts.docs.forEach((d: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(d.ref));
  }

  // Reset all zones to baseline
  for (const zone of STADIUM_ZONES) {
    const baseOccupancy = Math.floor(zone.capacity * (0.40 + Math.random() * 0.20));
    const ref = db.collection(Collections.ZONES).doc(zone.id);
    batch.set(ref, {
      ...zone,
      currentOccupancy: baseOccupancy,
      occupancyPercent: parseFloat(((baseOccupancy / zone.capacity) * 100).toFixed(1)),
      status: 'normal',
      dataSource: { type: 'imported' },
      updatedAt: new Date(),
      updatedBy: AgentIds.SIMULATION,
    });
  }

  await batch.commit();

  // Log reset action
  await db.collection(Collections.AUDIT_LOGS).add({
    action: 'SIMULATION_STATE_RESET',
    entityType: 'simulation',
    entityId: 'global',
    actorId: uid,
    actorType: 'user',
    actorName: userName ?? uid,
    timestamp: new Date(),
  });

  console.log('[SimEngine] State reset complete');
  return { success: true };
}

// ─── Scenario Dispatcher ──────────────────────────────────────────────────────

async function runScenario(
  scenarioId: ScenarioId,
  demoMode: boolean,
  runId: string
): Promise<void> {
  const speedMultiplier = demoMode ? 0.5 : 1.0;

  switch (scenarioId) {
    case 'gate-congestion':
      return runGateCongestion(db, speedMultiplier, runId);
    case 'crowd-surge':
      return runCrowdSurge(db, speedMultiplier, runId);
    case 'security-incident':
      return runSecurityIncident(db, speedMultiplier, runId);
    case 'emergency-evacuation':
      return runEmergencyEvacuation(db, speedMultiplier, runId);
    case 'weather-disruption':
      return runWeatherDisruption(db, speedMultiplier, runId);
    default:
      throw new Error(`Unknown scenario: ${scenarioId}`);
  }
}
