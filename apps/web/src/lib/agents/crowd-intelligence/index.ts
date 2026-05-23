import { db, Collections, AgentIds } from '../../firebase-admin';
import { generateStructuredResponse, SYSTEM_PROMPTS } from '../../gemini';

// ─── Crowd Intelligence Agent ─────────────────────────────────────────────────
// Analyzes zone occupancy levels and issues proactive crowd safety alerts
// using Gemini to assess structural and crowd risk.

const OCCUPANCY_THRESHOLDS = {
  WARNING: 80,
  CRITICAL: 95,
};

interface CrowdAnalysisResult {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
  recommended_actions: string[];
}

/**
 * Action: Analyze occupancy → if risk detected → write alert to Firestore
 */
export async function analyzeZoneOccupancy(zoneId: string, zone: any) {
  const occupancyPercent: number = zone['occupancyPercent'] ?? 0;

  // Only analyze if occupancy is above warning threshold
  if (occupancyPercent < OCCUPANCY_THRESHOLDS.WARNING) {
    console.log('[CrowdIntel] Zone below threshold, skipping', {
      zoneId,
      occupancyPercent,
    });
    return;
  }

  console.log('[CrowdIntel] Analyzing zone', {
    zoneId,
    occupancyPercent,
    status: zone['status'],
  });

  const prompt = `
Zone: ${zone['name']} (${zoneId})
Current occupancy: ${occupancyPercent.toFixed(1)}%
Capacity: ${zone['capacity']}
Current occupancy count: ${zone['currentOccupancy']}
Zone status: ${zone['status']}
Section type: ${zone['section']}
Connected gates: ${JSON.stringify(zone['connectedGates'])}

Analyze the crowd safety risk for this zone and provide recommendations.
`;

  let analysis: CrowdAnalysisResult;
  try {
    analysis = await generateStructuredResponse<CrowdAnalysisResult>(
      prompt,
      SYSTEM_PROMPTS.CROWD_INTELLIGENCE
    );
  } catch (error) {
    console.error('[CrowdIntel] Gemini analysis failed', { error, zoneId });
    return;
  }

  // Only create alert if risk is medium or above
  if (analysis.risk_level === 'low') return;

  const alertSeverity =
    analysis.risk_level === 'critical' ? 'critical'
    : analysis.risk_level === 'high'   ? 'critical'
    :                                    'warning';

  await db.collection(Collections.ALERTS).add({
    title: `Crowd Risk — ${zone['name']}`,
    message: analysis.analysis,
    type: 'crowd',
    severity: alertSeverity,
    status: 'active',
    sourceAgentId: AgentIds.CROWD_INTELLIGENCE,
    affectedZones: [zoneId],
    recommendation: analysis.recommended_actions.join(' | '),
    dataSource: { type: 'simulated' },
    createdAt: new Date(),
  });

  // Update agent state
  await db.collection(Collections.AGENT_STATE).doc('crowd-intelligence').set({
    lastAnalyzedZone: zoneId,
    lastRiskLevel: analysis.risk_level,
    lastProcessedAt: new Date(),
    status: 'active',
  }, { merge: true });

  console.log('[CrowdIntel] Alert created', {
    zoneId,
    riskLevel: analysis.risk_level,
  });
}
