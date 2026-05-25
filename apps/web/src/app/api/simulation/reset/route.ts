import { NextResponse } from 'next/server';
import { resetSimulation } from '@/lib/simulation/engine';
import type { ResetSimulationPayload } from '@stadium/shared';

// ── Soft-auth helper ──────────────────────────────────────────────────────────
async function softVerify(request: Request): Promise<{ uid: string; name?: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  if (!token) return null;

  if (process.env['FIREBASE_CLIENT_EMAIL'] && process.env['FIREBASE_PRIVATE_KEY']) {
    try {
      const { auth } = await import('@/lib/firebase-admin');
      const decoded = await auth.verifyIdToken(token);
      return { uid: decoded.uid, name: decoded['name'] as string | undefined };
    } catch {
      return null;
    }
  }
  return { uid: 'anonymous' };
}

export async function POST(request: Request) {
  try {
    const principal = await softVerify(request);
    if (!principal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: ResetSimulationPayload = await request.json();

    const result = await resetSimulation(data, principal.uid, principal.name);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[SimulationReset] Error', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

