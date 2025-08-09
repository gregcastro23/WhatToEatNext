'use client';

import React from 'react';

import {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
} from '@/calculations/gregsEnergy';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

export default function ElementalAlchemicalDisplay() {
  const { state } = useAlchemical();

  // Get values from the correct location (state.alchemicalValues) with fallbacks
  const alchemicalValues = state.alchemicalValues || {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25,
  };

  // Get elemental balance values from elementalState instead of elementalPreference
  const elementalState = state.elementalState || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Calculate thermodynamic properties using the actual calculation functions
  const heat = calculateHeat(
    elementalState.Fire || 0.25,
    elementalState.Earth || 0.25,
    elementalState.Air || 0.25,
    elementalState.Water || 0.25,
  );

  const entropy = calculateEntropy(
    elementalState.Fire || 0.25,
    elementalState.Earth || 0.25,
    elementalState.Air || 0.25,
    elementalState.Water || 0.25,
  );

  const reactivity = calculateReactivity(
    elementalState.Fire || 0.25,
    elementalState.Earth || 0.25,
    elementalState.Air || 0.25,
    elementalState.Water || 0.25,
  );

  const celestialEnergy = calculateGregsEnergy(heat, entropy, reactivity);

  // Helper function to format values as decimals
  const formatValue = (value: number = 0) => {
    return value.toFixed(2);
  };

  return (
    <div className='rounded-lg bg-white p-4 shadow-md'>
      <h3 className='mb-3 text-lg font-semibold'>Elemental &amp; Alchemical Properties</h3>

      {/* Alchemical Properties */}
      <div>
        <h4 className='mb-2 text-sm font-medium text-gray-500'>Alchemical Properties</h4>
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

          {/* New thermodynamic metrics */}
          <div className='mt-4 border-t border-gray-200 pt-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='mr-2 h-3 w-3 rounded-full bg-red-600'></div>
                <span className='text-sm'>Heat</span>
              </div>
              <span className='text-sm font-medium'>{formatValue(heat)}</span>
            </div>

            <div className='mt-2 flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='mr-2 h-3 w-3 rounded-full bg-purple-600'></div>
                <span className='text-sm'>Entropy</span>
              </div>
              <span className='text-sm font-medium'>{formatValue(entropy)}</span>
            </div>

            <div className='mt-2 flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='mr-2 h-3 w-3 rounded-full bg-blue-500'></div>
                <span className='text-sm'>Reactivity</span>
              </div>
              <span className='text-sm font-medium'>{formatValue(reactivity)}</span>
            </div>

            <div className='mt-2 flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='mr-2 h-3 w-3 rounded-full bg-yellow-500'></div>
                <span className='text-sm'>Celestial Energy</span>
              </div>
              <span className='text-sm font-medium'>{formatValue(celestialEnergy)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
