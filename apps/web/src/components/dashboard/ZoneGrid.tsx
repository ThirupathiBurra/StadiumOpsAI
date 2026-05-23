import React from 'react';
import type { Zone } from '@stadium/shared';
import { ZoneCard } from './ZoneCard';

interface ZoneGridProps {
  zones: Zone[];
}

export function ZoneGrid({ zones }: ZoneGridProps) {
  // We want to ensure these exact 8 zones are shown, in this order if possible
  const requiredShortCodes = [
    'N-GT', // North Gate
    'S-GT', // South Gate
    'E-GT', // East Gate
    'W-GT', // West Gate
    'N-STD', // North Stand
    'S-STD', // South Stand
    'VIP-1', // VIP Lounge
    'MED-1', // Medical Zone
  ];

  // Map by shortCode or name fallback to align with the required 8
  const displayedZones = requiredShortCodes.map(code => {
    return zones.find(z => z.shortCode === code);
  }).filter((z): z is Zone => z !== undefined);

  // If the database doesn't exactly match the shortCodes (e.g. fresh init), 
  // we just show the first 8 zones available
  const zonesToRender = displayedZones.length > 0 ? displayedZones : zones.slice(0, 8);

  return (
    <div className="col-span-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
          Stadium Zones
        </h2>
        <span className="text-xs text-slate-500">{zonesToRender.length} core zones monitored</span>
      </div>
      
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1"
        id="zone-grid"
        role="grid"
        aria-label="Stadium zone status grid"
      >
        {zonesToRender.length === 0 ? (
          // Loading / Empty state
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="glass-card p-4 animate-pulse flex flex-col justify-between min-h-[120px]"
              role="gridcell"
              aria-label="Loading zone"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded bg-surface-raised" />
                <div className="h-4 bg-surface-raised rounded w-20" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <div className="h-6 bg-surface-raised rounded w-16" />
                  <div className="h-4 bg-surface-raised rounded w-8" />
                </div>
                <div className="h-1.5 bg-surface-raised rounded w-full" />
              </div>
            </div>
          ))
        ) : (
          zonesToRender.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))
        )}
      </div>
    </div>
  );
}
