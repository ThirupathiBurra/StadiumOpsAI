'use client';

import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, query, where, orderBy, limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/client';
import type { Incident, IncidentStatus } from '@stadium/shared';

// ─── useIncidents Hook ────────────────────────────────────────────────────────
// Real-time Firestore subscription to incidents.
// Default: all non-closed incidents, newest first.

export interface UseIncidentsOptions {
  statusFilter?: IncidentStatus[];
  limitCount?: number;
  zoneId?: string;
}

export interface UseIncidentsReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
}

export function useIncidents(options: UseIncidentsOptions = {}): UseIncidentsReturn {
  const {
    statusFilter = ['open', 'acknowledged', 'in_progress'],
    limitCount = 50,
    zoneId,
  } = options;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'incidents'),
      where('status', 'in', statusFilter),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (zoneId) {
      q = query(
        collection(db, 'incidents'),
        where('zoneId', '==', zoneId),
        where('status', 'in', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Incident[];
        setIncidents(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useIncidents] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [statusFilter.join(','), limitCount, zoneId]);

  return { incidents, loading, error };
}
