'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const AstrologyWarning: React.FC = () => {
  const { state } = useAlchemical();

  if (!state.error) return null;

  return (
    <div className='mb-4 rounded-lg border border-amber-700 bg-amber-900 bg-opacity-90 p-4 text-amber-100 shadow-lg'>
      <div className='flex items-center'>
        <AlertTriangle className='mr-2 h-5 w-5 text-amber-300' />
        <p>
          {state.errorMessage ||
            'Astrological calculations error. Data may be incomplete or inaccurate.'}
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className='mt-2 rounded bg-amber-700 px-3 py-1 text-sm hover:bg-amber-600'
      >
        Retry
      </button>
    </div>
  );
};

export default AstrologyWarning;
