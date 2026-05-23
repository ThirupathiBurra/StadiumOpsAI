import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { triggerSimulation } from '@/lib/simulation/engine';
import type { TriggerSimulationPayload } from '@stadium/shared';

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

    const data: TriggerSimulationPayload = await request.json();

    const result = await triggerSimulation(data, decodedToken.uid);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[SimulationTrigger] Error', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
