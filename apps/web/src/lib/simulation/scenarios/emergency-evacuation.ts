import type { Firestore } from 'firebase-admin/firestore';
import { delay, writeZone, writeIncident, logSimEvent } from '../data-writer';

// ─── Scenario: Emergency Evacuation (~60s) ──────────────────────────────────
// Fire alert triggers full stadium evacuation.
// Routing agent computes optimal exit flows across all zones.

export async function runEmergencyEvacuation(
  db: Firestore,
  speedMultiplier: number,
  runId: string
): Promise<void> {
  const t = (ms: number) => ms * speedMultiplier;
  const SCENARIO_ID = 'emergency-evacuation';

  await logSimEvent(db, runId, 'Emergency Evacuation scenario started');

  // t+0: Fire incident reported
  await writeIncident(db, {
    data: {
      title: 'Fire Detected — North Stand',
      description: 'Multiple smoke detectors triggered in North Stand concessions area. Visual confirmation of fire. Immediate evacuation required.',
      type: 'fire',
      severity: 'critical',
      status: 'open',
      zoneId: 'zone-north-stand',
      zoneName: 'North Stand',
    },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Critical Incident created — Fire in North Stand');

  await delay(t(5_000));

  // t+5s: North Stand goes critical
  await writeZone(db, {
    zoneId: 'zone-north-stand',
    updates: { status: 'critical', occupancyPercent: 100 },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'North Stand critical — evacuation initiated');

  await delay(t(5_000));

  // t+10s: Entire stadium put in warning
  const allStands = ['zone-north-stand', 'zone-south-stand'];
  const allGates = ['zone-north-gate', 'zone-south-gate', 'zone-east-gate', 'zone-west-gate'];

  for (const stand of allStands) {
    if (stand !== 'zone-north-stand') {
      await writeZone(db, { zoneId: stand, updates: { status: 'warning' }, scenarioId: SCENARIO_ID });
    }
  }
  for (const gate of allGates) {
    await writeZone(db, { zoneId: gate, updates: { status: 'warning', occupancyPercent: 80 }, scenarioId: SCENARIO_ID });
  }
  await logSimEvent(db, runId, 'Stadium-wide evacuation advisory issued — all gates at warning');

  await delay(t(10_000));

  // t+20s: Gates become critical as crowd hits concourses
  for (const gate of allGates) {
    await writeZone(db, { zoneId: gate, updates: { status: 'critical', occupancyPercent: 95 }, scenarioId: SCENARIO_ID });
  }
  await logSimEvent(db, runId, 'All gates critical — Routing agent balancing egress flow');

  await delay(t(15_000));

  // t+35s: Stands begin to clear
  for (const stand of allStands) {
    await writeZone(db, { zoneId: stand, updates: { status: 'normal', occupancyPercent: 30, currentOccupancy: 2550 }, scenarioId: SCENARIO_ID });
  }
  await logSimEvent(db, runId, 'Stands significantly cleared — crowds moving through gates');

  await delay(t(15_000));

  // t+50s: Gates begin to clear
  for (const gate of allGates) {
    await writeZone(db, { zoneId: gate, updates: { status: 'normal', occupancyPercent: 40, currentOccupancy: 1200 }, scenarioId: SCENARIO_ID });
  }
  await logSimEvent(db, runId, 'Gates clearing — evacuation progressing smoothly');

  await delay(t(10_000));

  // t+60s: Fully evacuated
  for (const stand of allStands) {
    await writeZone(db, { zoneId: stand, updates: { status: 'closed', occupancyPercent: 0, currentOccupancy: 0 }, scenarioId: SCENARIO_ID });
  }
  for (const gate of allGates) {
    await writeZone(db, { zoneId: gate, updates: { status: 'closed', occupancyPercent: 0, currentOccupancy: 0 }, scenarioId: SCENARIO_ID });
  }
  await writeZone(db, { zoneId: 'zone-vip', updates: { status: 'closed', occupancyPercent: 0, currentOccupancy: 0 }, scenarioId: SCENARIO_ID });
  await writeZone(db, { zoneId: 'zone-medical', updates: { status: 'closed', occupancyPercent: 0, currentOccupancy: 0 }, scenarioId: SCENARIO_ID });

  await logSimEvent(db, runId, 'Emergency Evacuation scenario complete — Stadium cleared');
}
