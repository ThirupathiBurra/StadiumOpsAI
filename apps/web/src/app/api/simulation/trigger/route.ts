import { NextResponse } from 'next/server';
import { db, Collections, AgentIds } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { TriggerSimulationPayload } from '@stadium/shared';

// ── Soft-auth helper ──────────────────────────────────────────────────────────
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

export const maxDuration = 10;

export async function POST(request: Request) {
  try {
    const principal = await softVerify(request);
    if (!principal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: TriggerSimulationPayload = await request.json();
    const { scenarioId, demoMode } = data;

    console.log('[SimTrigger] Running scenario', { scenarioId, demoMode, uid: principal.uid });

    // Create run document
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

    // ── Run the scenario synchronously (all writes in one pass, no delays) ────
    // Vercel serverless functions get killed after the response is sent,
    // so we write ALL zone/incident states atomically before returning.
    const log = await runScenarioInstant(scenarioId, runRef.id);

    await runRef.update({
      status: 'completed',
      completedAt: new Date(),
      eventLog: log,
    });

    return NextResponse.json({ success: true, runId: runRef.id, log });
  } catch (error) {
    console.error('[SimTrigger] Error', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function simMeta(scenarioId: string) {
  return {
    dataSource: { type: 'simulated', simulationScenarioId: scenarioId },
    updatedAt: new Date(),
    updatedBy: AgentIds.SIMULATION,
  };
}

function ts(msg: string) {
  return `[${new Date().toISOString()}] ${msg}`;
}

async function writeZoneBatch(
  scenarioId: string,
  updates: Array<{ zoneId: string; fields: Record<string, unknown> }>
) {
  const batch = db.batch();
  for (const { zoneId, fields } of updates) {
    const ref = db.collection(Collections.ZONES).doc(zoneId);
    batch.set(ref, { ...fields, ...simMeta(scenarioId) }, { merge: true });
  }
  await batch.commit();
}

async function writeIncidentDoc(scenarioId: string, data: Record<string, unknown>) {
  const ref = db.collection(Collections.INCIDENTS).doc();
  await ref.set({
    id: ref.id,
    ...data,
    dataSource: { type: 'simulated', simulationScenarioId: scenarioId },
    createdAt: new Date(),
    updatedAt: new Date(),
    reportedBy: AgentIds.SIMULATION,
  });
  return ref.id;
}

// ── Scenario definitions (instant — final state written in one go) ─────────────

async function runScenarioInstant(scenarioId: string, runId: string): Promise<string[]> {
  const log: string[] = [];
  const L = (msg: string) => { log.push(ts(msg)); return msg; };

  switch (scenarioId) {

    // ── Gate Congestion ──────────────────────────────────────────────────────
    case 'gate-congestion': {
      L('Gate Congestion scenario triggered');
      await writeZoneBatch(scenarioId, [
        { zoneId: 'zone-north-gate', fields: { currentOccupancy: 2100, occupancyPercent: 70, status: 'warning' } },
        { zoneId: 'zone-east-gate',  fields: { currentOccupancy: 2700, occupancyPercent: 90, status: 'critical' } },
      ]);
      L('North Gate at 70% warning — East Gate at 90% CRITICAL');
      await writeIncidentDoc(scenarioId, {
        title: 'Gate Congestion — North & East Gates',
        description: 'Severe crowd buildup at North and East entrance gates. Entry throughput significantly reduced.',
        type: 'crowd_surge',
        severity: 'high',
        status: 'open',
        zoneId: 'zone-east-gate',
        zoneName: 'East Gate',
      });
      L('Incident raised — Gate congestion reported');
      L('Crowd Intelligence agent activated — Routing agent computing redistributions');
      break;
    }

    // ── Crowd Surge ──────────────────────────────────────────────────────────
    case 'crowd-surge': {
      L('Crowd Surge scenario triggered');
      await writeZoneBatch(scenarioId, [
        { zoneId: 'zone-north-stand', fields: { currentOccupancy: 8075, occupancyPercent: 95, status: 'critical' } },
        { zoneId: 'zone-north-gate',  fields: { currentOccupancy: 2550, occupancyPercent: 85, status: 'warning' } },
        { zoneId: 'zone-east-gate',   fields: { currentOccupancy: 2400, occupancyPercent: 80, status: 'warning' } },
      ]);
      L('North Stand at 95% CRITICAL — crowd pushing toward exits');
      await writeIncidentDoc(scenarioId, {
        title: 'Crowd Surge — North Stand',
        description: 'Dangerous crowd density in North Stand. Occupancy at 95% with surging conditions toward gates.',
        type: 'crowd_surge',
        severity: 'critical',
        status: 'open',
        zoneId: 'zone-north-stand',
        zoneName: 'North Stand',
      });
      L('Critical incident raised — Incident Response & Routing agents activated');
      break;
    }

    // ── Security Incident ─────────────────────────────────────────────────────
    case 'security-incident': {
      L('Security Incident scenario triggered');
      await writeZoneBatch(scenarioId, [
        { zoneId: 'zone-south-stand', fields: { status: 'critical' } },
        { zoneId: 'zone-south-gate',  fields: { status: 'warning', occupancyPercent: 85 } },
      ]);
      L('South Stand locked down — security personnel responding');
      await writeIncidentDoc(scenarioId, {
        title: 'Security Breach — South Stand',
        description: 'Unauthorised access detected in South Stand restricted area. Security teams deployed. Zone under active control.',
        type: 'security',
        severity: 'high',
        status: 'open',
        zoneId: 'zone-south-stand',
        zoneName: 'South Stand',
      });
      L('Incident raised — Incident Response agent coordinating security teams');
      break;
    }

    // ── Emergency Evacuation ─────────────────────────────────────────────────
    case 'emergency-evacuation': {
      L('Emergency Evacuation scenario triggered');
      await writeIncidentDoc(scenarioId, {
        title: 'Fire Detected — North Stand',
        description: 'Multiple smoke detectors triggered in North Stand concessions area. Immediate evacuation required.',
        type: 'fire',
        severity: 'critical',
        status: 'open',
        zoneId: 'zone-north-stand',
        zoneName: 'North Stand',
      });
      L('Critical fire incident created — full stadium evacuation initiated');
      await writeZoneBatch(scenarioId, [
        { zoneId: 'zone-north-stand', fields: { status: 'evacuating', occupancyPercent: 100, currentOccupancy: 8500 } },
        { zoneId: 'zone-south-stand', fields: { status: 'warning',    occupancyPercent: 80 } },
        { zoneId: 'zone-north-gate',  fields: { status: 'critical',   occupancyPercent: 95 } },
        { zoneId: 'zone-south-gate',  fields: { status: 'critical',   occupancyPercent: 95 } },
        { zoneId: 'zone-east-gate',   fields: { status: 'critical',   occupancyPercent: 90 } },
        { zoneId: 'zone-west-gate',   fields: { status: 'critical',   occupancyPercent: 90 } },
      ]);
      L('All gates critical — Routing agent computing optimal egress flows');
      break;
    }

    // ── Weather Disruption ───────────────────────────────────────────────────
    case 'weather-disruption': {
      L('Weather Disruption scenario triggered');
      await writeZoneBatch(scenarioId, [
        { zoneId: 'zone-north-stand', fields: { status: 'warning', occupancyPercent: 55 } },
        { zoneId: 'zone-south-stand', fields: { status: 'warning', occupancyPercent: 60 } },
        { zoneId: 'zone-north-gate',  fields: { status: 'warning', occupancyPercent: 75 } },
        { zoneId: 'zone-east-gate',   fields: { status: 'warning', occupancyPercent: 80 } },
      ]);
      L('Severe weather alert — reduced outdoor zone capacity enforced');
      await writeIncidentDoc(scenarioId, {
        title: 'Severe Weather Alert — Stadium Grounds',
        description: 'Lightning and high winds reported nearby. Outdoor zones reduced to safe capacity. Cover areas opening for shelter.',
        type: 'weather',
        severity: 'medium',
        status: 'open',
        zoneId: 'zone-north-stand',
        zoneName: 'North Stand',
      });
      L('Weather incident raised — Operations team notified');
      break;
    }

    default:
      throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  return log;
}

// Suppress unused import warning
void FieldValue;
