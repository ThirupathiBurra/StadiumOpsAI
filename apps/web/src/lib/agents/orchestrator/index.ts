import { db, Collections } from '../../firebase-admin';
import { routeEvent } from './router';

// ─── Orchestrator Agent ───────────────────────────────────────────────────────
// Receives events from API routes and dispatches them to specialized agents.
// For Next.js architecture, this is called synchronously from API routes.

export async function processIncidentCreated(incidentId: string, incident: any) {
  console.log('[Orchestrator] New incident created', {
    incidentId,
    type: incident['type'],
    severity: incident['severity'],
    zoneId: incident['zoneId'],
  });

  await routeEvent({
    eventType: 'INCIDENT_CREATED',
    entityId: incidentId,
    entityData: incident,
    sourceCollection: Collections.INCIDENTS,
  });

  // Update orchestrator agent state
  await db.collection(Collections.AGENT_STATE).doc('orchestrator').set({
    lastEventType: 'INCIDENT_CREATED',
    lastEntityId: incidentId,
    lastProcessedAt: new Date(),
    status: 'active',
  }, { merge: true });
}

export async function processZoneUpdated(zoneId: string, before: any, after: any) {
  // Only react to status changes
  if (before && before['status'] === after['status']) return;

  console.log('[Orchestrator] Zone status changed', {
    zoneId,
    from: before ? before['status'] : undefined,
    to: after['status'],
  });

  await routeEvent({
    eventType: 'ZONE_STATUS_CHANGED',
    entityId: zoneId,
    entityData: after,
    previousData: before,
    sourceCollection: Collections.ZONES,
  });

  await db.collection(Collections.AGENT_STATE).doc('orchestrator').set({
    lastEventType: 'ZONE_STATUS_CHANGED',
    lastEntityId: zoneId,
    lastProcessedAt: new Date(),
    status: 'active',
  }, { merge: true });
}

export async function processAlertCreated(alertId: string, alert: any) {
  console.log('[Orchestrator] Alert created', { alertId, type: alert.type });
  await routeEvent({
    eventType: 'ALERT_CREATED',
    entityId: alertId,
    entityData: alert,
    sourceCollection: Collections.ALERTS,
  });
}
