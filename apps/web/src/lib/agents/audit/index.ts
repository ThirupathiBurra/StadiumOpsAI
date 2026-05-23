import { db, Collections, AgentIds } from '../../firebase-admin';
import type { AuditAction, AuditEntityType, AuditActorType } from '@stadium/shared';

// ─── Audit Agent ──────────────────────────────────────────────────────────────
// A purely passive agent that monitors all system state changes and builds
// a chronological, tamper-evident audit log for post-event analysis.

export async function writeAuditLog(
  entityId: string,
  entityType: AuditEntityType,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): Promise<void> {
  if (!after && !before) return; // Skip empty changes

  const actorId: string = (after?.['updatedBy'] as string | undefined)
    ?? (after?.['reportedBy'] as string | undefined)
    ?? AgentIds.AUDIT;
  const actorType: AuditActorType = actorId.startsWith('agent:') ? 'agent'
    : actorId === 'simulation' ? 'simulation'
    : 'user';

  const action = resolveAction(entityType, before, after);

  await db.collection(Collections.AUDIT_LOGS).add({
    action,
    entityType,
    entityId,
    actorId,
    actorType,
    actorName: actorId,
    previousState: before ?? {},
    newState: after ?? {},
    timestamp: new Date(),
  });

  console.log('[Audit] Log entry created', { action, entityType, entityId });
}

function resolveAction(
  entityType: AuditEntityType,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): AuditAction {
  if (!before) {
    // Create
    if (entityType === 'incident') return 'INCIDENT_CREATED';
    if (entityType === 'alert')    return 'ALERT_CREATED';
    if (entityType === 'zone')     return 'ZONE_STATUS_CHANGED';
    if (entityType === 'simulation') return 'SIMULATION_STARTED';
  }
  if (!after) {
    return 'INCIDENT_CLOSED'; // Deletions are rare; treat as close
  }
  // Update — resolve from new status
  if (entityType === 'incident') {
    const status = after['status'];
    if (status === 'acknowledged') return 'INCIDENT_ACKNOWLEDGED';
    if (status === 'in_progress')  return 'INCIDENT_IN_PROGRESS';
    if (status === 'resolved')     return 'INCIDENT_RESOLVED';
    if (status === 'closed')       return 'INCIDENT_CLOSED';
    return 'INCIDENT_AI_ANALYZED';
  }
  if (entityType === 'alert') {
    const status = after['status'];
    if (status === 'acknowledged') return 'ALERT_ACKNOWLEDGED';
    if (status === 'dismissed')    return 'ALERT_DISMISSED';
    if (status === 'expired')      return 'ALERT_EXPIRED';
  }
  if (entityType === 'zone') {
    return before?.['status'] !== after['status']
      ? 'ZONE_STATUS_CHANGED'
      : 'ZONE_OCCUPANCY_UPDATED';
  }
  if (entityType === 'simulation') {
    const status = after['status'];
    if (status === 'completed') return 'SIMULATION_COMPLETED';
    if (status === 'aborted')   return 'SIMULATION_ABORTED';
  }
  return 'ZONE_STATUS_CHANGED'; // Fallback
}
