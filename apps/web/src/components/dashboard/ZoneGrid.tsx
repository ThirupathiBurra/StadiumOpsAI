import React from 'react';
import type { Zone } from '@stadium/shared';
import { ZoneCard } from './ZoneCard';

interface ZoneGridProps {
  zones: Zone[];
}

const REQUIRED_SHORT_CODES = [
  'N-GT',   // North Gate
  'S-GT',   // South Gate
  'E-GT',   // East Gate
  'W-GT',   // West Gate
  'N-STD',  // North Stand
  'S-STD',  // South Stand
  'VIP-1',  // VIP Lounge
  'MED-1',  // Medical Zone
];

export function ZoneGrid({ zones }: ZoneGridProps) {
  const displayedZones = REQUIRED_SHORT_CODES
    .map(code => zones.find(z => z.shortCode === code))
    .filter((z): z is Zone => z !== undefined);

  const zonesToRender = displayedZones.length > 0 ? displayedZones : zones.slice(0, 8);

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between px-1 mb-4">
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.3em] text-outline-variant flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          Live Stadium Zones
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-outline-variant/60">
          {zonesToRender.length} zones
        </span>
      </div>

      {/* Zone card grid */}
      <div
        className="grid grid-cols-2 gap-4 flex-1"
        id="zone-grid"
        role="grid"
        aria-label="Stadium zone status grid"
      >
        {zonesToRender.length === 0
          ? /* Loading skeleton */
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="glass-panel rounded-xl p-5 animate-pulse flex flex-col justify-between min-h-[140px]"
                role="gridcell"
                aria-label="Loading zone"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-4 w-24 bg-surface-variant/50 rounded mb-1.5" />
                    <div className="h-2.5 w-12 bg-surface-variant/30 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-surface-variant/30 rounded-full" />
                </div>
                <div>
                  <div className="h-7 w-28 bg-surface-variant/40 rounded mb-3" />
                  <div className="h-px w-full bg-surface-variant/40 rounded-full" />
                </div>
              </div>
            ))
          : zonesToRender.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))
        }
      </div>
    </div>
  );
}
