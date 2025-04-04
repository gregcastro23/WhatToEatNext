import { useContext } from 'react';
import { AlchemicalContext } from './context';

export function useAlchemical() {
  const context = useContext(AlchemicalContext);
  if (!context) {
    throw new Error('useAlchemical must be used within an AlchemicalProvider');
  }
  return context;
} 