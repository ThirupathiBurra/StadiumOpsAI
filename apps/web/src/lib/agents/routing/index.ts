import { db, Collections, AgentIds } from '../../firebase-admin';
import { generateStructuredResponse, SYSTEM_PROMPTS } from '../../gemini';

// ─── Routing Agent ────────────────────────────────────────────────────────────
// Queries current zone states, uses Gemini to compute optimal routing,
// and writes routing alerts back to Firestore.

interface RoutingResult {
  primary_route: string;
  alternate_routes: string[];
  gate_instructions: string[];
  estimated_clearance_minutes: number;
}

/**
 * Action: Fetch zone states → AI routing analysis → write routing alert
 */
export async function computeRouting(alertId: string, alert: any) {

    // Only process critical alerts — skip others
    if (alert['severity'] !== 'critical') return;
    // Don't process our own routing alerts (infinite loop prevention)
    if (alert['type'] === 'routing') return;

    console.log('[Routing] Processing critical alert', {
      alertId,
      type: alert['type'],
      affectedZones: alert['affectedZones'],
    });

    // Fetch current state of all zones
    const zonesSnap = await db.collection(Collections.ZONES).get();
    const zones = zonesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }));

    const affectedZoneNames = zones
      .filter((z) => (alert['affectedZones'] as string[]).includes(z['id'] as string))
      .map((z) => `${z['name']} (${z['occupancyPercent']}% capacity, status: ${z['status']})`)
      .join(', ');

    const allZoneSummary = zones
      .map((z) => `${z['name']}: ${z['status']}, ${z['occupancyPercent']}% full`)
      .join('\n');

    const prompt = `
CRITICAL ALERT: ${alert['title']}
Alert message: ${alert['message']}
Affected zones: ${affectedZoneNames}

All stadium zones status:
${allZoneSummary}

Provide optimal routing and evacuation guidance for this critical situation.
`;

    let routing: RoutingResult;
    try {
      routing = await generateStructuredResponse<RoutingResult>(
        prompt,
        SYSTEM_PROMPTS.ROUTING
      );
    } catch (error) {
      console.error('[Routing] Gemini routing failed', { error, alertId });
      return;
    }

    // Write routing alert
    await db.collection(Collections.ALERTS).add({
      title: `[ROUTING] ${alert['title']}`,
      message: routing.primary_route,
      type: 'routing',
      severity: 'critical',
      status: 'active',
      sourceAgentId: AgentIds.ROUTING,
      relatedIncidentId: alert['relatedIncidentId'],
      affectedZones: alert['affectedZones'],
      recommendation: [
        routing.primary_route,
        ...routing.gate_instructions,
        `Est. clearance: ${routing.estimated_clearance_minutes} min`,
      ].join(' | '),
      dataSource: alert['dataSource'] ?? { type: 'simulated' },
      createdAt: new Date(),
    });

    // Update agent state
    await db.collection(Collections.AGENT_STATE).doc('routing').set({
      lastAlertId: alertId,
      lastPrimaryRoute: routing.primary_route,
      estimatedClearanceMinutes: routing.estimated_clearance_minutes,
      lastProcessedAt: new Date(),
      status: 'active',
    }, { merge: true });
}
