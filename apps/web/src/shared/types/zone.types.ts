import type { Timestamp } from 'firebase/firestore';

// ─── Data Source ──────────────────────────────────────────────────────────────

export interface DataSource {
  type: 'simulated' | 'manual' | 'imported';
  simulationScenarioId?: string;
  importBatchId?: string;
}

// ─── Zone ─────────────────────────────────────────────────────────────────────

export type ZoneSection =
  | 'stand'
  | 'concourse'
  | 'gate'
  | 'vip'
  | 'pitch'
  | 'medical'
  | 'parking';

export type ZoneStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'evacuating'
  | 'closed';

export interface ZoneCoordinates {
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  shortCode: string;               // e.g. "N-STD", "VIP-E"
  section: ZoneSection;
  capacity: number;
  currentOccupancy: number;
  occupancyPercent: number;        // Computed: currentOccupancy / capacity * 100
  status: ZoneStatus;
  connectedGates: string[];        // Zone IDs of connected gate zones
  coordinates: ZoneCoordinates;
  floor: number;                   // 0 = ground, 1 = upper, etc.
  isEvacuationRoute: boolean;
  dataSource: DataSource;
  updatedAt: Timestamp;
  updatedBy: string;               // Agent ID or user UID
}
