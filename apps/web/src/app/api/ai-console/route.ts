import { NextResponse } from 'next/server';
import { db, Collections, auth } from '@/lib/firebase-admin';
import { getGeminiModel, SYSTEM_PROMPTS } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    const query = data.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
    }

    console.log('[AIConsole] Query received', { uid: decodedToken.uid, queryLength: query.length });

    // ── Fetch live context ────────────────────────────────────────────────────
    const [zonesSnap, incidentsSnap, alertsSnap] = await Promise.all([
      db.collection(Collections.ZONES).get(),
      db.collection(Collections.INCIDENTS)
        .where('status', 'in', ['open', 'acknowledged', 'in_progress'])
        .limit(10)
        .get(),
      db.collection(Collections.ALERTS)
        .where('status', '==', 'active')
        .limit(10)
        .get(),
    ]);

    const zones = zonesSnap.docs.map((d) => d.data());
    const incidents = incidentsSnap.docs.map((d) => d.data());
    const alerts = alertsSnap.docs.map((d) => d.data());

    // ── Build context summary ─────────────────────────────────────────────────
    const criticalZones = zones.filter((z) => z['status'] === 'critical' || z['status'] === 'evacuating');
    const totalOccupancy = zones.reduce((sum, z) => sum + ((z['currentOccupancy'] as number) ?? 0), 0);

    const contextSummary = [
      `Stadium Status: ${criticalZones.length} critical zones, ${incidents.length} active incidents, ${alerts.length} active alerts`,
      `Total Occupancy: ~${totalOccupancy.toLocaleString()} people`,
      criticalZones.length > 0
        ? `Critical Zones: ${criticalZones.map((z) => `${z['name']} (${z['status']})`).join(', ')}`
        : 'All zones normal',
    ].join('\n');

    // ── Build full context prompt ─────────────────────────────────────────────
    const contextPrompt = `
LIVE STADIUM CONTEXT:
${contextSummary}

Active Incidents:
${incidents.length === 0 ? 'None' : incidents.map((i) =>
  `- [${i['severity']?.toUpperCase()}] ${i['title']} in ${i['zoneName']} (${i['status']})`
).join('\n')}

Active Alerts:
${alerts.length === 0 ? 'None' : alerts.map((a) =>
  `- [${a['severity']?.toUpperCase()}] ${a['title']}`
).join('\n')}

OPERATOR QUERY: ${query}
`;

    // ── Call Gemini ───────────────────────────────────────────────────────────
    const model = getGeminiModel('gemini-2.5-flash', {
      temperature: 0.4,
      maxOutputTokens: 1024,
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPTS.AI_CONSOLE },
      { text: contextPrompt },
    ]);

    const answer = result.response.text();

    console.log('[AIConsole] Response generated', {
      uid: decodedToken.uid,
      answerLength: answer.length,
    });

    return NextResponse.json({ answer, contextSummary });
  } catch (error) {
    console.error('[AIConsole] Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
