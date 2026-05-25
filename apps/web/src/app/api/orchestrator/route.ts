import { NextResponse } from 'next/server';
import { processIncidentCreated, processZoneUpdated, processAlertCreated } from '@/lib/agents/orchestrator';

// ── Soft-auth helper ──────────────────────────────────────────────────────────
async function softVerify(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.split('Bearer ')[1];
  if (!token) return false;

  if (process.env['FIREBASE_CLIENT_EMAIL'] && process.env['FIREBASE_PRIVATE_KEY']) {
    try {
      const { auth } = await import('@/lib/firebase-admin');
      await auth.verifyIdToken(token);
      return true;
    } catch {
      return false;
    }
  }
  // Soft-auth: token present but service account not configured
  return true;
}

export async function POST(request: Request) {
  try {
    const authorized = await softVerify(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventType, entityId, entityData, previousData } = body;

    // Trigger the orchestrator agent based on the event type
    switch (eventType) {
      case 'INCIDENT_CREATED':
        await processIncidentCreated(entityId, entityData);
        break;
      case 'ZONE_STATUS_CHANGED':
        await processZoneUpdated(entityId, previousData, entityData);
        break;
      case 'ALERT_CREATED':
        await processAlertCreated(entityId, entityData);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported eventType' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[OrchestratorAPI] Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
