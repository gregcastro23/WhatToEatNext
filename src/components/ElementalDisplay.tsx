'use client';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

import AlchemicalPropertiesDisplay from './AlchemicalPropertiesDisplay';

export default function ElementalDisplay() {
  const { state } = useAlchemical();
  const { elementalState } = state;

  // Helper function to format values as decimals
  const formatValue = (value: number) => {
    return value.toFixed(2);
  };

  return (
    <div className='space-y-4'>
      {/* Elemental Display */}
      <div className='rounded-lg bg-white p-4 shadow-md'>
        <h3 className='mb-2 text-lg font-semibold'>Elemental Balance</h3>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='mr-2 h-3 w-3 rounded-full bg-red-500'></div>
              <span className='text-sm'>Fire</span>
            </div>
            <span className='text-sm font-medium'>{formatValue(elementalState.Fire)}</span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='mr-2 h-3 w-3 rounded-full bg-blue-500'></div>
              <span className='text-sm'>Water</span>
            </div>
            <span className='text-sm font-medium'>{formatValue(elementalState.Water)}</span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='mr-2 h-3 w-3 rounded-full bg-green-500'></div>
              <span className='text-sm'>Earth</span>
            </div>
            <span className='text-sm font-medium'>{formatValue(elementalState.Earth)}</span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='mr-2 h-3 w-3 rounded-full bg-yellow-300'></div>
              <span className='text-sm'>Air</span>
            </div>
            <span className='text-sm font-medium'>{formatValue(elementalState.Air)}</span>
          </div>
        </div>
      </div>

      {/* Alchemical Properties Display */}
      <AlchemicalPropertiesDisplay />
    </div>
  );
}
