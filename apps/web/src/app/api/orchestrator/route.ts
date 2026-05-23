import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { processIncidentCreated, processZoneUpdated, processAlertCreated } from '@/lib/agents/orchestrator';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      await auth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
