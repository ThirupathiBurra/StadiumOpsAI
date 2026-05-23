'use client';

import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, query, orderBy, limit, where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/client';
import type { AuditLog, AuditEntityType, AuditActorType } from '@stadium/shared';

// ─── useAuditLogs Hook ────────────────────────────────────────────────────────
// Real-time Firestore subscription to audit logs.
// Filters by entity type or actor type if provided.

export interface UseAuditLogsOptions {
  entityTypeFilter?: AuditEntityType;
  actorTypeFilter?: AuditActorType;
  limitCount?: number;
}

export interface UseAuditLogsReturn {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}): UseAuditLogsReturn {
  const { entityTypeFilter, actorTypeFilter, limitCount = 100 } = options;

  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (entityTypeFilter) {
      q = query(
        collection(db, 'auditLogs'),
        where('entityType', '==', entityTypeFilter),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    } else if (actorTypeFilter) {
      q = query(
        collection(db, 'auditLogs'),
        where('actorType', '==', actorTypeFilter),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditLog[];
        setLogs(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useAuditLogs] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [entityTypeFilter, actorTypeFilter, limitCount]);

  return { logs, loading, error };
}
