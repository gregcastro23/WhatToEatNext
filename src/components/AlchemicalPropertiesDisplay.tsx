'use client';

import React from 'react';
import @/contexts  from 'AlchemicalContext ';

export default function AlchemicalPropertiesDisplay({ showDebug = false }) {
  const { state } = useAlchemical();
  const { alchemicalValues = { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 } } = state || {};

  // Helper function to format values as decimals instead of percentages
  let formatValue = (value: number = 0) => {
    return value.toFixed(2);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Alchemical Properties</h3>
      
      {showDebug && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
          <p>Context state available: {state ? 'Yes' : 'No'}</p>
          <p>Values defined: {alchemicalValues ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-sm">Spirit</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Spirit)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
            <span className="text-sm">Essence</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Essence)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-600 mr-2"></div>
            <span className="text-sm">Matter</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Matter)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
            <span className="text-sm">Substance</span>
          </div>
          <span className="text-sm font-medium">{formatValue(alchemicalValues.Substance)}</span>
        </div>
      </div>
    </div>
  );
} 