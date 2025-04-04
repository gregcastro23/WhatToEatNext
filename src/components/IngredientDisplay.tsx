import React from 'react';
import { Flame, Droplets } from 'lucide-react';

interface IngredientDisplayProps {
  ingredient: any;
  showDetails?: boolean;
}

export const IngredientDisplay = ({ ingredient, showDetails = false }: IngredientDisplayProps) => {
  // Safe accessor function for nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = 'N/A') => {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj) ?? defaultValue;
  };

  // Safe formatter for numbers
  const formatNumber = (value: any, decimals: number = 2) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value !== 'number') return String(value);
    return value.toFixed(decimals);
  };

  return (
    <div className="ingredient-card p-3 rounded-lg bg-white/5">
      <h3 className="font-medium">{ingredient.name || 'Unknown Ingredient'}</h3>
      
      {showDetails && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Flame className="w-4 h-4 text-red-500 mr-1" />
              <div className="relative w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-red-500 rounded-full" 
                  style={{ width: `${Math.min(100, (safeGet(ingredient, 'heat', 0) * 100) || 0)}%` }}
                ></div>
              </div>
            </div>
            <span className="text-gray-400">{formatNumber(safeGet(ingredient, 'heat', 0))}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Droplets className="w-4 h-4 text-blue-500 mr-1" />
              <div className="relative w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-blue-500 rounded-full" 
                  style={{ width: `${Math.min(100, (safeGet(ingredient, 'moisture', 0) * 100) || 0)}%` }}
                ></div>
              </div>
            </div>
            <span className="text-gray-400">{formatNumber(safeGet(ingredient, 'moisture', 0))}</span>
          </div>
          
          {/* Elemental properties */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            {Object.entries(safeGet(ingredient, 'elementalProperties', {})).map(([element, value]) => (
              <div key={element} className="flex items-center justify-between">
                <span className="text-xs">{element}</span>
                <span className="text-xs text-gray-400">{formatNumber(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 