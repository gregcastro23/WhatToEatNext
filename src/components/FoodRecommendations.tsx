import React, { useState, useEffect } from 'react';
import type { ElementalProperties } from '@/types/alchemy';

// Define FoodRecommendationsProps interface
interface FoodRecommendationsProps {
  elementalProfile?: ElementalProperties;
  onRecommendationSelect?: (recommendation: any) => void;
  maxRecommendations?: number;
}

import { testCookingMethodRecommendations } from '../utils/testRecommendations';

const FoodRecommendations = ({ ingredient, options = {} }: FoodRecommendationsProps) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const runDebugTest = () => {
    console.log("Running cooking method recommendations test...");
    testCookingMethodRecommendations();
  };
  
  return (
    <div className="food-recommendations">
      {/* ... existing component content ... */}
      
      {/* Add debug section - visible only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 border border-gray-300 rounded">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Developer Tools</h3>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDebug ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showDebug && (
            <div className="mt-4">
              <button
                onClick={runDebugTest}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Test Cooking Method Recommendations
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Check browser console for detailed logs
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 