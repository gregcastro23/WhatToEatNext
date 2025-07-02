'use client';

import { useState, useEffect } from 'react';
import AlchmKitchen from '@/components/AlchmKitchen';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { AstrologicalProvider } from '@/context/AstrologicalContext';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AlchmKitchenPage');

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
    logger.debug('AlchmKitchen page client-side mount complete');
  }, []);
  
  if (!hasMounted) {
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
  
  return <>{children}</>;
}

export default function AlchmKitchenPage() {
  return (
    <AlchemicalProvider>
      <AstrologicalProvider>
        <main className="min-h-screen p-4 md:p-8">
          <ClientOnly>
            <AlchmKitchen />
          </ClientOnly>
        </main>
      </AstrologicalProvider>
    </AlchemicalProvider>
  );
} 