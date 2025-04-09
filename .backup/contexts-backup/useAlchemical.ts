'use client';

import { useContext } from 'react';
import { AlchemicalContext } from './AlchemicalContext/context';

export const useAlchemical = () => {
  const context = useContext(AlchemicalContext);
  
  if (!context) {
    throw new Error('useAlchemical must be used within an AlchemicalProvider');
  }
  
  return context;
}; 