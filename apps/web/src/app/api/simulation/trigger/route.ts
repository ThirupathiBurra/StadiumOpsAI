import { NextResponse } from 'next/server';
import { db, Collections, AgentIds } from '@/lib/firebase-admin';
import { STADIUM_ZONES } from '@stadium/shared';
import type { ScenarioId, TriggerSimulationPayload } from '@stadium/shared';

// ── Soft-auth helper (same pattern as ai-console route) ───────────────────────
async function softVerify(request: Request): Promise<{ uid: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  if (!token) return null;

  if (process.env['FIREBASE_CLIENT_EMAIL'] && process.env['FIREBASE_PRIVATE_KEY']) {
    try {
      const { auth } = await import('@/lib/firebase-admin');
      const decoded = await auth.verifyIdToken(token);
      return { uid: decoded.uid };
    } catch {
      return null;
    }
  }
  return { uid: 'anonymous' };
}

// Export Vercel's maxDuration so the function can run longer if needed.
// On the free Hobby plan this is capped at 10s; Pro allows up to 300s.
// We fire-and-forget below so in practice the response returns in <1s.
export const maxDuration = 10;

export async function POST(request: Request) {
  try {
    const principal = await softVerify(request);
    if (!principal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: TriggerSimulationPayload = await request.json();
    const { scenarioId, demoMode } = data;

    console.log('[SimTrigger] Triggering scenario', { scenarioId, demoMode, uid: principal.uid });

    // Create a run document immediately so the client has a runId.
    const runRef = db.collection(Collections.SIMULATIONS).doc();
    await runRef.set({
      id: runRef.id,
      scenarioId,
      status: 'running',
      demoMode,
      startedBy: principal.uid,
      affectedZones: [],
      eventLog: [],
      startedAt: new Date(),
    });

    // ── Fire-and-forget: kick the scenario off without awaiting ───────────────
    // This lets us return the runId immediately, well within Vercel's timeout.
    // The scenario writes propagate to Firestore in the background and the client
    // observes updates via real-time listeners on the Live Dashboard.
    runScenarioInBackground(scenarioId, demoMode, runRef.id, principal.uid).catch((err) => {
      console.error('[SimTrigger] Background scenario failed', err);
      runRef.update({ status: 'aborted', error: String(err), completedAt: new Date() }).catch(() => {});
    });

    return NextResponse.json({ success: true, runId: runRef.id });
  } catch (error) {
    console.error('[SimTrigger] Error', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// ── Inline scenario dispatcher ────────────────────────────────────────────────
// Copied inline to avoid circular imports with the old engine.ts.

async function runScenarioInBackground(
  scenarioId: ScenarioId,
  demoMode: boolean,
  runId: string,
  uid: string
): Promise<void> {
  // Speed: 0.05 in demo (5% of original ms = very fast), 0.1 in normal
  const speedMultiplier = demoMode ? 0.05 : 0.1;

  const { runGateCongestion } = await import('@/lib/simulation/scenarios/gate-congestion');
  const { runCrowdSurge } = await import('@/lib/simulation/scenarios/crowd-surge');
  const { runSecurityIncident } = await import('@/lib/simulation/scenarios/security-incident');
  const { runEmergencyEvacuation } = await import('@/lib/simulation/scenarios/emergency-evacuation');
  const { runWeatherDisruption } = await import('@/lib/simulation/scenarios/weather-disruption');

  const runRef = db.collection(Collections.SIMULATIONS).doc(runId);

  try {
    switch (scenarioId) {
      case 'gate-congestion':       await runGateCongestion(db, speedMultiplier, runId);      break;
      case 'crowd-surge':           await runCrowdSurge(db, speedMultiplier, runId);           break;
      case 'security-incident':     await runSecurityIncident(db, speedMultiplier, runId);     break;
      case 'emergency-evacuation':  await runEmergencyEvacuation(db, speedMultiplier, runId);  break;
      case 'weather-disruption':    await runWeatherDisruption(db, speedMultiplier, runId);    break;
      default: throw new Error(`Unknown scenario: ${scenarioId}`);
    }
    await runRef.update({ status: 'completed', completedAt: new Date() });
  } catch (err) {
    await runRef.update({ status: 'aborted', error: String(err), completedAt: new Date() });
    throw err;
  }
}

// Satisfy TS — STADIUM_ZONES and AgentIds referenced by engine.ts but not here.
void STADIUM_ZONES; void AgentIds;

