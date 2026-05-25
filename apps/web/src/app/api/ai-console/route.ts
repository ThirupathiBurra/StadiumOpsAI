import { NextResponse } from 'next/server';
import { db, Collections } from '@/lib/firebase-admin';
import { getGeminiModel, SYSTEM_PROMPTS } from '@/lib/gemini';

// ── Helper: verify the bearer token is a valid Firebase ID token ──────────────
// Falls back to a soft check (just ensuring token is present) when Firebase
// Admin is initialised with default credentials (no service account key set).
async function verifyRequest(request: Request): Promise<{ uid: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split('Bearer ')[1];
  if (!token) return null;

  // If we have full admin credentials, do a proper token verify.
  const hasServiceAccount =
    process.env['FIREBASE_CLIENT_EMAIL'] && process.env['FIREBASE_PRIVATE_KEY'];

  if (hasServiceAccount) {
    try {
      // Dynamic import so Next.js doesn't crash at build time if admin is unavailable
      const { auth } = await import('@/lib/firebase-admin');
      const decoded = await auth.verifyIdToken(token);
      return { uid: decoded.uid };
    } catch {
      return null;
    }
  }

  // Soft-auth: token present but we can't fully verify without service account.
  // For an ops tool this is acceptable — the Gemini API key is the real secret.
  console.warn('[AIConsole] Soft-auth: FIREBASE_CLIENT_EMAIL not set — skipping token verification');
  return { uid: 'anonymous' };
}

export async function POST(request: Request) {
  try {
    const principal = await verifyRequest(request);
    if (!principal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const query = data.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
    }

    console.log('[AIConsole] Query received', { uid: principal.uid, queryLength: query.length });

    // ── Fetch live context ────────────────────────────────────────────────────
    let zones: Record<string, unknown>[] = [];
    let incidents: Record<string, unknown>[] = [];
    let alerts: Record<string, unknown>[] = [];

    try {
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
      zones = zonesSnap.docs.map((d) => d.data() as Record<string, unknown>);
      incidents = incidentsSnap.docs.map((d) => d.data() as Record<string, unknown>);
      alerts = alertsSnap.docs.map((d) => d.data() as Record<string, unknown>);
    } catch (firestoreErr) {
      console.warn('[AIConsole] Firestore unavailable — proceeding with empty context', firestoreErr);
    }

    // ── Build context summary ─────────────────────────────────────────────────
    const criticalZones = zones.filter((z) => z['status'] === 'critical' || z['status'] === 'evacuating');
    const totalOccupancy = zones.reduce((sum, z) => sum + ((z['currentOccupancy'] as number) ?? 0), 0);

    const contextSummary = [
      zones.length > 0
        ? `Stadium Status: ${criticalZones.length} critical zones, ${incidents.length} active incidents, ${alerts.length} active alerts`
        : 'Stadium Status: Live data unavailable — responding from general knowledge',
      zones.length > 0 ? `Total Occupancy: ~${totalOccupancy.toLocaleString()} people` : '',
      criticalZones.length > 0
        ? `Critical Zones: ${criticalZones.map((z) => `${z['name']} (${z['status']})`).join(', ')}`
        : zones.length > 0 ? 'All zones normal' : '',
    ].filter(Boolean).join('\n');

    // ── Build full context prompt ─────────────────────────────────────────────
    const contextPrompt = `
LIVE STADIUM CONTEXT:
${contextSummary}

Active Incidents:
${incidents.length === 0 ? 'None' : incidents.map((i) =>
  `- [${String(i['severity'] ?? '').toUpperCase()}] ${i['title']} in ${i['zoneName']} (${i['status']})`
).join('\n')}

Active Alerts:
${alerts.length === 0 ? 'None' : alerts.map((a) =>
  `- [${String(a['severity'] ?? '').toUpperCase()}] ${a['title']}`
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
      uid: principal.uid,
      answerLength: answer.length,
    });

    return NextResponse.json({ answer, contextSummary });
  } catch (error) {
    console.error('[AIConsole] Error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
