'use client';

import React from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

export default function AlchemicalPropertiesDisplay({ showDebug = false }) {
  const { state } = useAlchemical();
  const { alchemicalValues = { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 } } =
    state || {};

  // Helper function to format values as decimals instead of percentages
  const formatValue = (value: number = 0) => {
    return value.toFixed(2);
  };

  return (
    <div className='rounded-lg bg-white p-4 shadow-md'>
      <h3 className='mb-2 text-lg font-semibold'>Alchemical Properties</h3>

      {showDebug && (
        <div className='mb-2 rounded bg-gray-100 p-2 text-xs'>
          <p>Context state available: {state ? 'Yes' : 'No'}</p>
          <p>Values defined: {alchemicalValues ? 'Yes' : 'No'}</p>
        </div>
      )}

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='mr-2 h-3 w-3 rounded-full bg-indigo-500'></div>
            <span className='text-sm'>Spirit</span>
          </div>
          <span className='text-sm font-medium'>{formatValue(alchemicalValues.Spirit)}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='mr-2 h-3 w-3 rounded-full bg-red-400'></div>
            <span className='text-sm'>Essence</span>
          </div>
          <span className='text-sm font-medium'>{formatValue(alchemicalValues.Essence)}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='mr-2 h-3 w-3 rounded-full bg-amber-600'></div>
            <span className='text-sm'>Matter</span>
          </div>
          <span className='text-sm font-medium'>{formatValue(alchemicalValues.Matter)}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='mr-2 h-3 w-3 rounded-full bg-emerald-500'></div>
            <span className='text-sm'>Substance</span>
          </div>
          <span className='text-sm font-medium'>{formatValue(alchemicalValues.Substance)}</span>
        </div>
      </div>
    </div>
  );
}
