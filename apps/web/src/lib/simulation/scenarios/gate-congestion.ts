import type { Firestore } from 'firebase-admin/firestore';
import { delay, writeZone, writeIncident, logSimEvent } from '../data-writer';

// ─── Scenario: Gate Congestion (~30s) ─────────────────────────────────────────
// North & East Gates experience severe crowd buildup.
// Crowd Intel detects overflow risk and Routing agent recommends redistribution.

export async function runGateCongestion(
  db: Firestore,
  speedMultiplier: number,
  runId: string
): Promise<void> {
  const t = (ms: number) => ms * speedMultiplier;
  const SCENARIO_ID = 'gate-congestion';

  await logSimEvent(db, runId, 'Gate Congestion scenario started');

  // t+0: North Gate starts filling up
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 2100, occupancyPercent: 70, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-east-gate',
    updates: { currentOccupancy: 2250, occupancyPercent: 75, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'North & East Gates occupancy rising');

  await delay(t(4_000));

  // t+4s: East Gate reaches warning
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 2550, occupancyPercent: 85, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-east-gate',
    updates: { currentOccupancy: 2700, occupancyPercent: 90, status: 'critical' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'East Gate critical — crowd intel agent triggered');

  await delay(t(5_000));

  // t+9s: Incident created
  await writeIncident(db, {
    data: {
      title: 'Gate Congestion — North & East Gates',
      description: 'Severe crowd buildup at North and East entrance gates. Entry throughput significantly reduced.',
      type: 'crowd_surge',
      severity: 'high',
      status: 'open',
      zoneId: 'zone-east-gate',
      zoneName: 'East Gate',
    },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Incident created — Gate congestion reported');

  await delay(t(8_000));

  // t+17s: Gates partially clear after routing intervention
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 2100, occupancyPercent: 70, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-east-gate',
    updates: { currentOccupancy: 2250, occupancyPercent: 75, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Gates clearing after routing guidance applied');

  await delay(t(8_000));

  // t+25s: Resolution
  await writeZone(db, {
    zoneId: 'zone-east-gate',
    updates: { currentOccupancy: 1800, occupancyPercent: 60, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Gate Congestion scenario resolved');
}
