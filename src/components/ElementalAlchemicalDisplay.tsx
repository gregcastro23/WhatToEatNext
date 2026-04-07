// @ts-nocheck
'use client';

import React from 'react';
import { 
  calculateGregsEnergy 
} from '@/calculations/gregsEnergy';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

export default function ElementalAlchemicalDisplay() {
  const { state } = useAlchemical();
  
  // Get values from the correct location (state.alchemicalValues) with fallbacks
  const alchemicalValues = state?.alchemicalValues || { 
    Spirit: 0.25, 
    Essence: 0.25, 
    Matter: 0.25, 
    Substance: 0.25 
  };
  
  // Get elemental balance values from elementalState instead of elementalPreference
  const elementalState = state?.elementalState || { 
    Fire: 0.25, 
    Water: 0.25, 
    Earth: 0.25, 
    Air: 0.25 
  };
  
  const elementalAlchemicalCounts = {
    Spirit: alchemicalValues.Spirit || 0.25,
    Essence: alchemicalValues.Essence || 0.25,
    Matter: alchemicalValues.Matter || 0.25,
    Substance: alchemicalValues.Substance || 0.25,
    Fire: elementalState.Fire || 0.25,
    Water: elementalState.Water || 0.25,
    Earth: elementalState.Earth || 0.25,
    Air: elementalState.Air || 0.25,
  };

  const celestialEnergy = calculateGregsEnergy(elementalAlchemicalCounts);
  const { heat, entropy, reactivity, gregsEnergy } = celestialEnergy;
  
  // Helper function to format values as decimals
  const formatValue = (value: number = 0) => {
    return value.toFixed(2);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Elemental & Alchemical Properties</h3>
      
      {/* Alchemical Properties */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Alchemical Properties</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2" />
              <span className="text-sm">Spirit</span>
            </div>
            <span className="text-sm font-medium">{formatValue(alchemicalValues.Spirit)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-2" />
              <span className="text-sm">Essence</span>
            </div>
            <span className="text-sm font-medium">{formatValue(alchemicalValues.Essence)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-600 mr-2" />
              <span className="text-sm">Matter</span>
            </div>
            <span className="text-sm font-medium">{formatValue(alchemicalValues.Matter)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
              <span className="text-sm">Substance</span>
            </div>
            <span className="text-sm font-medium">{formatValue(alchemicalValues.Substance)}</span>
          </div>
          
          {/* New thermodynamic metrics */}
          <div className="mt-4 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-600 mr-2" />
                <span className="text-sm">Heat</span>
              </div>
              <span className="text-sm font-medium">{formatValue(heat)}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-600 mr-2" />
                <span className="text-sm">Entropy</span>
              </div>
              <span className="text-sm font-medium">{formatValue(entropy)}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <span className="text-sm">Reactivity</span>
              </div>
              <span className="text-sm font-medium">{formatValue(reactivity)}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                <span className="text-sm">Celestial Energy</span>
              </div>
              <span className="text-sm font-medium">{formatValue(gregsEnergy)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
