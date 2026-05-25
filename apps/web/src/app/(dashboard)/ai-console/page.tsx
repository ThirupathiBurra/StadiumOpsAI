'use client';

import React from 'react';
import { AICommandCenter } from '@/components/dashboard/AICommandCenter';

export default function AIConsolePage() {
  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] animate-fade-in max-w-5xl mx-auto">
      <AICommandCenter />
    </div>
  );
}
