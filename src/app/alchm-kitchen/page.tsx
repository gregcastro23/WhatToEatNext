'use client';

import { useState, useEffect } from 'react';
import AlchmKitchen from '@/components/AlchmKitchen';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { createLogger } from '@/utils/logger';

const _logger = createLogger('AlchmKitchenPage');

export default function AlchmKitchenPage() {
  const [mounted, setMounted] = useState(false);
  const alchemicalContext = useAlchemical();
  const planetaryPositions = alchemicalContext?.planetaryPositions;
  const elementalState = alchemicalContext?.state && typeof alchemicalContext.state === 'object' && 'elementalProperties' in alchemicalContext.state 
    ? (alchemicalContext.state as Record<string, unknown>).elementalProperties 
    : undefined;
  const alchemicalValues = alchemicalContext?.state && typeof alchemicalContext.state === 'object' && 'alchemicalProperties' in alchemicalContext.state 
    ? (alchemicalContext.state as Record<string, unknown>).alchemicalProperties 
    : undefined;
  const astrologicalState = alchemicalContext?.state;
  
  // Ensure component mounts after client-side hydration
  useEffect(() => {
    setMounted(true);
    _logger.debug('AlchmKitchen page mounted');
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
        <p>Loading Alchm Kitchen...</p>
        <div className="text-xs text-gray-500">
          <p>Debug Info</p>
          <p>Mounted: false</p>
          <p>Renders: 0</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <AlchmKitchen />
    </main>
  );
} 