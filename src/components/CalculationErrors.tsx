import React from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const CalculationErrors = () => {
  const { state } = useAlchemical();
  
  // Show component only when there are errors or the main error flag is true
  if ((!state.errors || state.errors.length === 0) && !state.error) return null;

  return (
    <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/50 mb-4">
      <h3 className="text-red-300 font-medium mb-2 flex items-center">
        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
        Calculation Warnings
      </h3>
      
      {/* Show individual errors if available */}
      {state.errors && state.errors.length > 0 && (
        <ul className="text-red-300/80 text-sm space-y-1">
          {state.errors.map((error, index) => (
            <li key={index}>⚠️ {error}</li>
          ))}
        </ul>
      )}
      
      {/* Show the main error message if available */}
      {state.error && (
        <p className="text-red-300/80 text-sm mt-1">
          ⚠️ {state.errorMessage}
        </p>
      )}
    </div>
  );
};

export default CalculationErrors; 