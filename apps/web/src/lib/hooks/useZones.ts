'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/client';
import type { Zone } from '@stadium/shared';

// ─── useZones Hook ────────────────────────────────────────────────────────────
// Real-time Firestore subscription to all stadium zones.
// Updates automatically when any zone document changes.

export interface UseZonesReturn {
  zones: Zone[];
  loading: boolean;
  error: string | null;
}

export function useZones(): UseZonesReturn {
  const [zones, setZones]     = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'zones'), orderBy('name', 'asc'));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Zone[];
        setZones(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useZones] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { zones, loading, error };
}
