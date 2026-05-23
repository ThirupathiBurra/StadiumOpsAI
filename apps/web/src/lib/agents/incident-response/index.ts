import { db, Collections, AgentIds } from '../../firebase-admin';
import { generateStructuredResponse, SYSTEM_PROMPTS } from '../../gemini';

// ─── Incident Response Agent ──────────────────────────────────────────────────
// Uses Gemini to analyze the incident, assess severity, and generate
// recommended actions. Writes results back to the incident document.

interface IncidentAnalysisResult {
  summary: string;
  severity_assessment: string;
  recommended_actions: string[];
  risk_score: number; // 0-100
}

/**
 * Action: AI analysis → write aiSummary + aiRecommendedActions to incident
 */
export async function analyzeIncident(incidentId: string, incident: any) {

    console.log('[IncidentResponse] Analyzing incident', {
      incidentId,
      type: incident['type'],
      severity: incident['severity'],
    });

    const prompt = `
Incident Report:
- ID: ${incidentId}
- Type: ${incident['type']}
- Title: ${incident['title']}
- Description: ${incident['description']}
- Severity: ${incident['severity']}
- Zone: ${incident['zoneName']} (${incident['zoneId']})
- Reported at: ${new Date().toISOString()}
- Reported by: ${incident['reportedBy']}

Provide an operational analysis of this stadium incident.
`;

    let analysis: IncidentAnalysisResult;
    try {
      analysis = await generateStructuredResponse<IncidentAnalysisResult>(
        prompt,
        SYSTEM_PROMPTS.INCIDENT_ANALYSIS
      );
    } catch (error) {
      console.error('[IncidentResponse] Gemini analysis failed', {
        error,
        incidentId,
      });
      return;
    }

    // Write AI results back to the incident document
    await db.collection(Collections.INCIDENTS).doc(incidentId).update({
      aiSummary: analysis.summary,
      aiRecommendedActions: analysis.recommended_actions,
      aiRiskScore: analysis.risk_score,
      updatedAt: new Date(),
    });

    // Create a linked alert for high/critical incidents
    if (incident['severity'] === 'high' || incident['severity'] === 'critical') {
      await db.collection(Collections.ALERTS).add({
        title: `[AI] ${incident['title']}`,
        message: analysis.summary,
        type: incident['type'] === 'security_breach' ? 'security' : 'system',
        severity: incident['severity'] === 'critical' ? 'critical' : 'warning',
        status: 'active',
        sourceAgentId: AgentIds.INCIDENT_RESPONSE,
        relatedIncidentId: incidentId,
        affectedZones: [incident['zoneId']],
        recommendation: analysis.recommended_actions[0] ?? '',
        dataSource: incident['dataSource'] ?? { type: 'manual' },
        createdAt: new Date(),
      });
    }

    // Update agent state
    await db.collection(Collections.AGENT_STATE).doc('incident-response').set({
      lastIncidentId: incidentId,
      lastRiskScore: analysis.risk_score,
      lastProcessedAt: new Date(),
      status: 'active',
    }, { merge: true });
}
