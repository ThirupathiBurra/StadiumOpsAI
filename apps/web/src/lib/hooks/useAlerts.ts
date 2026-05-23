'use client';

import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, query, where, orderBy, limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/client';
import type { Alert, AlertStatus } from '@stadium/shared';

// ─── useAlerts Hook ───────────────────────────────────────────────────────────
// Real-time Firestore subscription to alerts.
// Default: active alerts only, most recent first.

export interface UseAlertsOptions {
  statusFilter?: AlertStatus[];
  limitCount?: number;
}

export interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  const { statusFilter = ['active'], limitCount = 50 } = options;
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      where('status', 'in', statusFilter),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Alert[];
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useAlerts] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [statusFilter.join(','), limitCount]);

  return { alerts, loading, error };
}
