import type { ScenarioDefinition } from '../types/simulation.types';

// ─── Demo Scenario Catalog ────────────────────────────────────────────────────

export const SCENARIO_CATALOG: Record<string, Omit<ScenarioDefinition, 'events'>> = {
  'gate-congestion': {
    id: 'gate-congestion',
    name: 'Gate Congestion',
    description: 'North and East gates experience severe crowd buildup. Crowd Intel detects overflow risk and Routing agent recommends gate redistribution.',
    durationMs: 30_000,
    primaryZones: ['zone-north-gate', 'zone-east-gate'],
    demoSpeedMultiplier: 0.5,
  },
  'crowd-surge': {
    id: 'crowd-surge',
    name: 'Crowd Surge',
    description: 'North Stand reaches critical density. AI triggers surge alert and recommends controlled dispersal.',
    durationMs: 45_000,
    primaryZones: ['zone-north-stand', 'zone-north-gate', 'zone-east-gate'],
    demoSpeedMultiplier: 0.5,
  },
  'security-incident': {
    id: 'security-incident',
    name: 'Security Incident',
    description: 'Security breach detected in VIP section. Security officer is auto-assigned. AI analyzes threat level and recommends perimeter response.',
    durationMs: 30_000,
    primaryZones: ['zone-vip', 'zone-north-gate'],
    demoSpeedMultiplier: 0.5,
  },
  'emergency-evacuation': {
    id: 'emergency-evacuation',
    name: 'Emergency Evacuation',
    description: 'Fire alert triggers full stadium evacuation. Routing agent computes optimal exit flows across all zones simultaneously.',
    durationMs: 60_000,
    primaryZones: ['zone-north-stand', 'zone-south-stand', 'zone-north-gate', 'zone-south-gate', 'zone-east-gate', 'zone-west-gate'],
    demoSpeedMultiplier: 0.5,
  },
  'weather-disruption': {
    id: 'weather-disruption',
    name: 'Weather Disruption',
    description: 'Severe weather forces pitch closure and South Stand partial evacuation. Simulated as event source without external API dependency.',
    durationMs: 30_000,
    primaryZones: ['zone-south-stand', 'zone-south-gate', 'zone-west-gate'],
    demoSpeedMultiplier: 0.5,
  },
};

export const SCENARIO_IDS = Object.keys(SCENARIO_CATALOG);
