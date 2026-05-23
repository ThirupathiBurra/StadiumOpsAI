import type { Firestore } from 'firebase-admin/firestore';
import { delay, writeZone, writeIncident, logSimEvent } from '../data-writer';

// ─── Scenario: Weather Disruption (~30s) ────────────────────────────────────
// Severe weather forces pitch closure and South Stand partial evacuation.

export async function runWeatherDisruption(
  db: Firestore,
  speedMultiplier: number,
  runId: string
): Promise<void> {
  const t = (ms: number) => ms * speedMultiplier;
  const SCENARIO_ID = 'weather-disruption';

  await logSimEvent(db, runId, 'Weather Disruption scenario started');

  // t+0: Severe storm warning
  await writeIncident(db, {
    data: {
      title: 'Severe Lightning Storm Approaching',
      description: 'Bureau of Meteorology advises severe lightning cell within 5km. South Stand roof does not provide adequate coverage. Evacuation to concourse required.',
      type: 'weather',
      severity: 'high',
      status: 'open',
      zoneId: 'zone-south-stand',
      zoneName: 'South Stand',
    },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'High severity weather incident created');

  await delay(t(5_000));

  // t+5s: South stand goes warning
  await writeZone(db, {
    zoneId: 'zone-south-stand',
    updates: { status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'South Stand placed in warning state — dispersal ordered');

  await delay(t(8_000));

  // t+13s: South and West gates fill
  await writeZone(db, {
    zoneId: 'zone-south-gate',
    updates: { currentOccupancy: 2700, occupancyPercent: 90, status: 'critical' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-west-gate',
    updates: { currentOccupancy: 2550, occupancyPercent: 85, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'South & West Gates critical as crowd seeks shelter');

  await delay(t(8_000));

  // t+21s: Dispersal
  await writeZone(db, {
    zoneId: 'zone-south-stand',
    updates: { currentOccupancy: 1700, occupancyPercent: 20, status: 'closed' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'South Stand cleared and closed for duration of storm');

  await delay(t(8_000));

  // t+29s: Resolution
  await writeZone(db, {
    zoneId: 'zone-south-gate',
    updates: { currentOccupancy: 1500, occupancyPercent: 50, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-west-gate',
    updates: { currentOccupancy: 1200, occupancyPercent: 40, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Weather Disruption scenario complete — crowd safely relocated');
}
