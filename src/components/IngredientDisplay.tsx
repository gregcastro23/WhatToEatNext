import React from 'react';
import { Flame, Droplets, Mountain, Wind } from 'lucide-react';

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

  // Get the dominant element to highlight
  const getDominantElement = () => {
    if (!ingredient.elementalProperties) return null;
    
    const elements = Object.entries(ingredient.elementalProperties);
    if (elements.length === 0) return null;
    
    const sorted = [...elements].sort((a, b) => b[1] - a[1]);
    return sorted[0][0]; // Return the name of the dominant element
  };
  
  const dominantElement = getDominantElement();
  
  // Helper function to get icon for element
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Water': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'Earth': return <Mountain className="w-4 h-4 text-green-500" />;
      case 'Air': return <Wind className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className="ingredient-card p-3 rounded-lg bg-white/5">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{ingredient.name || 'Unknown Ingredient'}</h3>
        {dominantElement && (
          <div className="element-badge flex items-center">
            {getElementIcon(dominantElement)}
          </div>
        )}
      </div>
      
      {ingredient.description && (
        <p className="text-sm text-gray-400 mt-1">{ingredient.description}</p>
      )}
      
      {/* Show category if available */}
      {ingredient.type && (
        <div className="mt-1 text-xs text-gray-500">
          Category: {ingredient.type}
        </div>
      )}
      
      {showDetails && (
        <div className="mt-2 space-y-2">
          {/* Elemental Properties Section */}
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Elemental Properties</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(ingredient.elementalProperties || {}).map(([element, value]) => (
                <div key={element} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getElementIcon(element)}
                    <span className="text-xs ml-1">{element}</span>
                  </div>
                  <div className="relative w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full rounded-full ${
                        element === 'Fire' ? 'bg-red-500' :
                        element === 'Water' ? 'bg-blue-500' :
                        element === 'Earth' ? 'bg-green-500' :
                        element === 'Air' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min(100, (value as number * 100) || 0)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Astrological Profile Section */}
          {ingredient.astrologicalProfile && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Astrological Profile</h4>
              <div className="text-xs">
                {ingredient.astrologicalProfile.rulingPlanets?.length > 0 && (
                  <div className="mb-1">
                    <span className="font-medium">Ruling Planets:</span> {ingredient.astrologicalProfile.rulingPlanets.join(', ')}
                  </div>
                )}
                
                {ingredient.astrologicalProfile.signAffinities?.length > 0 && (
                  <div>
                    <span className="font-medium">Sign Affinities:</span> {ingredient.astrologicalProfile.signAffinities.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Sensory Profile Section */}
          {ingredient.sensoryProfile && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Flavor Profile</h4>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(ingredient.sensoryProfile.taste || {}).map(([taste, value]) => (
                  <div key={taste} className="flex items-center justify-between">
                    <span className="text-xs">{taste}</span>
                    <div className="relative w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-yellow-500 rounded-full"
                        style={{ width: `${Math.min(100, (value as number * 100) || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Culinary Uses Section */}
          {ingredient.culinaryUses?.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Culinary Uses</h4>
              <div className="flex flex-wrap gap-1">
                {ingredient.culinaryUses.map((use: string) => (
                  <span key={use} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                    {use}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 