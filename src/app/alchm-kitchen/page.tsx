'use client';

import { useEffect, useState } from 'react';

import { AstrologicalProvider } from '@/context/AstrologicalContext';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { createLogger } from '@/utils/logger';

import AlchmKitchenTab from '../../../Alchm Kitchen/AlchmKitchenTab';
import SignVectorPanel from './SignVectorPanel';

const logger = createLogger('AlchmKitchenPage');

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    logger.debug('AlchmKitchen page client-side mount complete');
  }, []);

  if (!hasMounted) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center space-y-4'>
        <p>Loading Alchm Kitchen...</p>
        <div className='text-xs text-gray-500'>
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
        <main className='min-h-screen p-4 md:p-8'>
          <ClientOnly>
            <AlchmKitchenTab />
            <div className='mt-6'>
              <SignVectorPanel governing='dominant' />
            </div>
          </ClientOnly>
        </main>
      </AstrologicalProvider>
    </AlchemicalProvider>
  );
}
