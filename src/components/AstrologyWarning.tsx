'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const AstrologyWarning: React.FC = () => {
  const { state } = useAlchemical();
  
  if (!state.error) return null;
  
  return (
    <div className="bg-amber-900 bg-opacity-90 rounded-lg p-4 mb-4 shadow-lg border border-amber-700 text-amber-100">
      <div className="flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-amber-300" />
        <p>{state.errorMessage || 'Astrological calculations error. Data may be incomplete or inaccurate.'}</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 bg-amber-700 hover:bg-amber-600 rounded text-sm"
      >
        Retry
      </button>
    </div>
  );
};

export default AstrologyWarning; 