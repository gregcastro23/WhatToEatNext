'use client';

import React, { useState } from 'react';
import { getNutritionalData, getAvailableNutritionalIngredients } from '@/utils/nutritionalUtils';
import { NutritionalProfile } from '@/types/alchemy';

interface NutritionalDisplayProps {
  ingredientName?: string;
  compact?: boolean;
  showSearch?: boolean;
}

export default function NutritionalDisplay({
  ingredientName,
  compact = false,
  showSearch = true
}: NutritionalDisplayProps) {
  const [searchTerm, setSearchTerm] = useState(ingredientName || '');
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(ingredientName || null);
  const [nutritionalData, setNutritionalData] = useState<NutritionalProfile | null>(
    ingredientName ? getNutritionalData(ingredientName) : null
  );

  // Get all available ingredients for dropdown
  const availableIngredients = getAvailableNutritionalIngredients();

  // Handle ingredient selection
  const handleIngredientSelect = (ingredient: string) => {
    setSelectedIngredient(ingredient);
    const data = getNutritionalData(ingredient);
    setNutritionalData(data);
  };

  // Format percentage for display
  const formatPercent = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // If no data and no search ability, show message
  if (!nutritionalData && !showSearch) {
    return <div className="text-gray-500">No nutritional data available</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for an ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {searchTerm && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-60 overflow-y-auto">
                {availableIngredients
                  .filter(item => 
                    item.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleIngredientSelect(item);
                        setSearchTerm(item);
                      }}
                    >
                      {item}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {nutritionalData ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">{(nutritionalData as unknown)?.name || selectedIngredient}</h3>
          
          {/* Macronutrients Section */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700">Macronutrients</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm">Calories: {(nutritionalData as unknown)?.calories || 0}</div>
              <div className="text-sm">Protein: {(nutritionalData as unknown)?.macros?.protein || 0}g</div>
              <div className="text-sm">Carbs: {(nutritionalData as unknown)?.macros?.carbs || 0}g</div>
              <div className="text-sm">Fat: {(nutritionalData as unknown)?.macros?.fat || 0}g</div>
              <div className="text-sm">Fiber: {(nutritionalData as unknown)?.macros?.fiber || 0}g</div>
            </div>
          </div>

          {!compact && (
            <>
              {/* Vitamins Section */}
              {(nutritionalData as unknown)?.vitamins && Object.keys((nutritionalData as unknown)?.vitamins || {}).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Vitamins (% Daily Value)</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {Object.entries((nutritionalData as unknown)?.vitamins || {}).map(([vitamin, value]) => (
                      <div key={vitamin} className="text-sm">
                        {vitamin}: {formatPercent(value as number)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minerals Section */}
              {(() => {
                const nutritionData = nutritionalData as Record<string, unknown>;
                const minerals = nutritionData?.minerals as Record<string, unknown> | undefined;
                return minerals && Object.keys(minerals).length > 0 ? (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700">Minerals (% Daily Value)</h4>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.entries(minerals).map(([mineral, value]) => (
                        <div key={mineral} className="text-sm">
                          {mineral}: {formatPercent(value as number)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Data Source */}
              {(() => {
                const nutritionData = nutritionalData as Record<string, unknown>;
                const source = nutritionData?.source;
                const fdcId = nutritionData?.fdcId;
                return source ? (
                  <div className="text-xs text-gray-500 mt-2">
                    Source: {String(source)} 
                    {fdcId ? ` (ID: ${String(fdcId)})` : ''}
                  </div>
                ) : null;
              })()}
            </>
          )}
        </div>
      ) : (
        <div className="text-gray-500">
          {showSearch ? "Search for an ingredient to see nutritional information" : "No nutritional data available"}
        </div>
      )}
    </div>
  );
} 