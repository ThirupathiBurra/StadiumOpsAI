import { db, Collections, AgentIds } from '../../firebase-admin';
import { analyzeZoneOccupancy } from '../crowd-intelligence';
import { analyzeIncident } from '../incident-response';
import { computeRouting } from '../routing';
import { writeAuditLog } from '../audit';

// ─── Event Routing Logic ──────────────────────────────────────────────────────
// The orchestrator directly invokes downstream agents.
// This replaces the old Firestore trigger queue for the Next.js serverless architecture.

export interface OrchestratorEvent {
  eventType:
    | 'INCIDENT_CREATED'
    | 'INCIDENT_UPDATED'
    | 'ZONE_STATUS_CHANGED'
    | 'ALERT_CREATED';
  entityId: string;
  entityData: Record<string, unknown>;
  previousData?: Record<string, unknown>;
  sourceCollection: string;
}

/**
 * Routes an orchestrator event to the correct downstream agents
 */
export async function routeEvent(event: OrchestratorEvent): Promise<void> {
  const targets = determineTargetAgents(event);

  console.log('[Orchestrator/Router] Routing event', {
    eventType: event.eventType,
    entityId: event.entityId,
    targets,
  });

  const dispatchPromises: Promise<void>[] = [];

  for (const agentId of targets) {
    if (agentId === AgentIds.AUDIT) {
      dispatchPromises.push(writeAuditLog(
        event.entityId,
        event.sourceCollection === Collections.INCIDENTS ? 'incident' :
        event.sourceCollection === Collections.ALERTS ? 'alert' :
        event.sourceCollection === Collections.ZONES ? 'zone' : 'simulation',
        event.previousData ?? null,
        event.entityData
      ));
    } else if (agentId === AgentIds.INCIDENT_RESPONSE) {
      dispatchPromises.push(analyzeIncident(event.entityId, event.entityData));
    } else if (agentId === AgentIds.CROWD_INTELLIGENCE) {
      dispatchPromises.push(analyzeZoneOccupancy(event.entityId, event.entityData));
    } else if (agentId === AgentIds.ROUTING) {
      dispatchPromises.push(computeRouting(event.entityId, event.entityData));
    }
  }

  // Await all agent executions to ensure Vercel doesn't kill the process early
  await Promise.allSettled(dispatchPromises);
}

/**
 * Determines which agents should handle a given event.
 * Returns a list of agent IDs to dispatch to.
 */
function determineTargetAgents(event: OrchestratorEvent): string[] {
  const targets: string[] = [AgentIds.AUDIT]; // Audit always receives everything

  switch (event.eventType) {
    case 'INCIDENT_CREATED':
      targets.push(AgentIds.INCIDENT_RESPONSE);
      // If severity is high/critical, also dispatch routing agent
      if (
        event.entityData['severity'] === 'high' ||
        event.entityData['severity'] === 'critical'
      ) {
        targets.push(AgentIds.ROUTING);
      }
      break;

    case 'ZONE_STATUS_CHANGED':
      targets.push(AgentIds.CROWD_INTELLIGENCE);
      if (
        event.entityData['status'] === 'critical' ||
        event.entityData['status'] === 'evacuating'
      ) {
        targets.push(AgentIds.ROUTING);
      }
      break;

    case 'ALERT_CREATED':
      if (event.entityData['severity'] === 'critical') {
        targets.push(AgentIds.ROUTING);
      }
      break;

    case 'INCIDENT_UPDATED':
      // Re-analyze only when status changes to in_progress
      if (event.entityData['status'] === 'in_progress') {
        targets.push(AgentIds.INCIDENT_RESPONSE);
      }
      break;
  }

  return [...new Set(targets)]; // Deduplicate
}
