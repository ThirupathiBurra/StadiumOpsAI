import type { Firestore } from 'firebase-admin/firestore';
import { delay, writeZone, writeIncident, logSimEvent } from '../data-writer';

// ─── Scenario: Crowd Surge (~45s) ─────────────────────────────────────────────
// North Stand reaches critical density. AI triggers surge alert.
// Routing agent recommends controlled dispersal.

export async function runCrowdSurge(
  db: Firestore,
  speedMultiplier: number,
  runId: string
): Promise<void> {
  const t = (ms: number) => ms * speedMultiplier;
  const SCENARIO_ID = 'crowd-surge';

  await logSimEvent(db, runId, 'Crowd Surge scenario started');

  // t+0: North Stand begins filling rapidly
  await writeZone(db, {
    zoneId: 'zone-north-stand',
    updates: { currentOccupancy: 6375, occupancyPercent: 75, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'North Stand at 75% — warning threshold crossed');

  await delay(t(5_000));

  // t+5s: Surge accelerates
  await writeZone(db, {
    zoneId: 'zone-north-stand',
    updates: { currentOccupancy: 7650, occupancyPercent: 90, status: 'critical' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'North Stand at 90% — CRITICAL — Crowd Intel agent triggered');

  await delay(t(3_000));

  // t+8s: Incident created
  await writeIncident(db, {
    data: {
      title: 'Crowd Surge — North Stand',
      description: 'Dangerous crowd density detected in North Stand. Occupancy at 90% with surging conditions. Crowd flow toward gates is becoming unsafe.',
      type: 'crowd_surge',
      severity: 'critical',
      status: 'open',
      zoneId: 'zone-north-stand',
      zoneName: 'North Stand',
    },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Critical incident raised — Incident Response agent analyzing');

  await delay(t(4_000));

  // t+12s: North Gate fills as people try to exit
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 2550, occupancyPercent: 85, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Crowd dispersing into North Gate — Routing agent activated');

  await delay(t(8_000));

  // t+20s: North Stand peaks
  await writeZone(db, {
    zoneId: 'zone-north-stand',
    updates: { currentOccupancy: 8075, occupancyPercent: 95, status: 'critical' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'North Stand at 95% — evacuation advisory issued by Routing agent');

  await delay(t(8_000));

  // t+28s: Controlled dispersal working
  await writeZone(db, {
    zoneId: 'zone-north-stand',
    updates: { currentOccupancy: 7225, occupancyPercent: 85, status: 'critical' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-east-gate',
    updates: { currentOccupancy: 2400, occupancyPercent: 80, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Dispersal in progress — North Stand density decreasing');

  await delay(t(10_000));

  // t+38s: Resolution
  await writeZone(db, {
    zoneId: 'zone-north-stand',
    updates: { currentOccupancy: 5950, occupancyPercent: 70, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 1500, occupancyPercent: 50, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-east-gate',
    updates: { currentOccupancy: 1500, occupancyPercent: 50, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Crowd Surge scenario resolved — density returning to normal');
}
