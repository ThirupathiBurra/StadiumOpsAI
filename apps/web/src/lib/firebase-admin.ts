import * as admin from 'firebase-admin';

// ─── Firebase Admin Singleton ─────────────────────────────────────────────────
// Initialize once; subsequent calls return existing app.

if (!admin.apps.length) {
  try {
    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
    const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[Firebase Admin] Initialized with Service Account');
    } else {
      // Fallback for local ADC or emulator
      admin.initializeApp();
      console.log('[Firebase Admin] Initialized with Default Credentials');
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db: admin.firestore.Firestore = admin.firestore();
export const auth: admin.auth.Auth = admin.auth();
export const storage: admin.storage.Storage = admin.storage();

// ─── Collection References ────────────────────────────────────────────────────

export const Collections = {
  ZONES:       'zones',
  INCIDENTS:   'incidents',
  ALERTS:      'alerts',
  AUDIT_LOGS:  'auditLogs',
  USERS:       'users',
  SIMULATIONS: 'simulations',
  AGENT_STATE: 'agentState',
} as const;

export type CollectionName = typeof Collections[keyof typeof Collections];

// ─── Agent IDs ────────────────────────────────────────────────────────────────

export const AgentIds = {
  ORCHESTRATOR:        'agent:orchestrator',
  CROWD_INTELLIGENCE:  'agent:crowd-intelligence',
  INCIDENT_RESPONSE:   'agent:incident-response',
  ROUTING:             'agent:routing',
  AUDIT:               'agent:audit',
  SIMULATION:          'agent:simulation',
} as const;

export type AgentId = typeof AgentIds[keyof typeof AgentIds];
