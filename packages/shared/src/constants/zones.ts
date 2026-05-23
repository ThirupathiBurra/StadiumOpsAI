import type { Zone } from '../types/zone.types';

// ─── APL Grand Final Stadium — 8 Zone Definitions ───────────────────────────
// Layout: Generic APL stadium — 2 stands, 4 gates, 1 VIP, 1 medical

export const STADIUM_ZONES: Omit<Zone, 'currentOccupancy' | 'occupancyPercent' | 'status' | 'dataSource' | 'updatedAt' | 'updatedBy'>[] = [
  // ── Stands ──────────────────────────────────────────────────────────────────
  {
    id: 'zone-north-stand',
    name: 'North Stand',
    shortCode: 'N-STD',
    section: 'stand',
    capacity: 8500,
    connectedGates: ['zone-north-gate', 'zone-east-gate', 'zone-west-gate'],
    coordinates: { lat: -37.8199, lng: 144.9830 },
    floor: 1,
    isEvacuationRoute: false,
  },
  {
    id: 'zone-south-stand',
    name: 'South Stand',
    shortCode: 'S-STD',
    section: 'stand',
    capacity: 8500,
    connectedGates: ['zone-south-gate', 'zone-east-gate', 'zone-west-gate'],
    coordinates: { lat: -37.8221, lng: 144.9830 },
    floor: 1,
    isEvacuationRoute: false,
  },
  // ── Gates ───────────────────────────────────────────────────────────────────
  {
    id: 'zone-north-gate',
    name: 'North Gate',
    shortCode: 'N-GATE',
    section: 'gate',
    capacity: 3000,
    connectedGates: ['zone-north-stand'],
    coordinates: { lat: -37.8195, lng: 144.9830 },
    floor: 0,
    isEvacuationRoute: true,
  },
  {
    id: 'zone-south-gate',
    name: 'South Gate',
    shortCode: 'S-GATE',
    section: 'gate',
    capacity: 3000,
    connectedGates: ['zone-south-stand'],
    coordinates: { lat: -37.8225, lng: 144.9830 },
    floor: 0,
    isEvacuationRoute: true,
  },
  {
    id: 'zone-east-gate',
    name: 'East Gate',
    shortCode: 'E-GATE',
    section: 'gate',
    capacity: 3000,
    connectedGates: ['zone-north-stand', 'zone-south-stand'],
    coordinates: { lat: -37.8210, lng: 144.9845 },
    floor: 0,
    isEvacuationRoute: true,
  },
  {
    id: 'zone-west-gate',
    name: 'West Gate',
    shortCode: 'W-GATE',
    section: 'gate',
    capacity: 3000,
    connectedGates: ['zone-north-stand', 'zone-south-stand'],
    coordinates: { lat: -37.8210, lng: 144.9815 },
    floor: 0,
    isEvacuationRoute: true,
  },
  // ── VIP ─────────────────────────────────────────────────────────────────────
  {
    id: 'zone-vip',
    name: 'VIP Lounge',
    shortCode: 'VIP',
    section: 'vip',
    capacity: 800,
    connectedGates: ['zone-north-gate'],
    coordinates: { lat: -37.8205, lng: 144.9820 },
    floor: 2,
    isEvacuationRoute: false,
  },
  // ── Medical ─────────────────────────────────────────────────────────────────
  {
    id: 'zone-medical',
    name: 'Medical Zone',
    shortCode: 'MED',
    section: 'medical',
    capacity: 100,
    connectedGates: ['zone-south-gate'],
    coordinates: { lat: -37.8215, lng: 144.9818 },
    floor: 0,
    isEvacuationRoute: false,
  },
];

export const ZONE_IDS = STADIUM_ZONES.map((z) => z.id);

export const TOTAL_STADIUM_CAPACITY = STADIUM_ZONES
  .filter((z) => z.section === 'stand' || z.section === 'vip')
  .reduce((sum, z) => sum + z.capacity, 0);
