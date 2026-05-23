import type { Firestore } from 'firebase-admin/firestore';
import { delay, writeZone, writeIncident, logSimEvent } from '../data-writer';

// ─── Scenario: Security Incident (~30s) ───────────────────────────────────────
// Security breach detected in VIP section.
// Incident Response AI analyzes threat. Security perimeter activated.

export async function runSecurityIncident(
  db: Firestore,
  speedMultiplier: number,
  runId: string
): Promise<void> {
  const t = (ms: number) => ms * speedMultiplier;
  const SCENARIO_ID = 'security-incident';

  await logSimEvent(db, runId, 'Security Incident scenario started');

  // t+0: Anomaly detected in VIP
  await writeZone(db, {
    zoneId: 'zone-vip',
    updates: { currentOccupancy: 720, occupancyPercent: 90, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Anomaly detected in VIP section — elevated occupancy');

  await delay(t(3_000));

  // t+3s: Security breach incident raised
  await writeIncident(db, {
    data: {
      title: 'Unauthorised Access — VIP Lounge',
      description: 'Security breach detected in VIP Lounge. Unauthorized individuals identified via access control. North Gate entry point compromised.',
      type: 'security_breach',
      severity: 'critical',
      status: 'open',
      zoneId: 'zone-vip',
      zoneName: 'VIP Lounge',
    },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Security breach incident created — critical severity');

  await delay(t(4_000));

  // t+7s: VIP zone locked down
  await writeZone(db, {
    zoneId: 'zone-vip',
    updates: { currentOccupancy: 720, occupancyPercent: 90, status: 'critical' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 1500, occupancyPercent: 50, status: 'warning' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'VIP zone critical — North Gate placed under enhanced monitoring');

  await delay(t(8_000));

  // t+15s: Security team responds
  await writeZone(db, {
    zoneId: 'zone-vip',
    updates: { status: 'closed' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'VIP zone closed — security team on site, perimeter secured');

  await delay(t(8_000));

  // t+23s: All clear
  await writeZone(db, {
    zoneId: 'zone-vip',
    updates: { currentOccupancy: 600, occupancyPercent: 75, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await writeZone(db, {
    zoneId: 'zone-north-gate',
    updates: { currentOccupancy: 1200, occupancyPercent: 40, status: 'normal' },
    scenarioId: SCENARIO_ID,
  });
  await logSimEvent(db, runId, 'Security Incident resolved — VIP zone cleared and reopened');
}
