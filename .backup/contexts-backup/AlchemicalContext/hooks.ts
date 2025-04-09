import { useContext } from 'react';
import { AlchemicalContext } from './context';

/**
 * Hook to access the AlchemicalContext
 * @returns The AlchemicalContext value
 */
export function useAlchemicalContext() {
  const context = useContext(AlchemicalContext);
  if (!context) {
    throw new Error('useAlchemicalContext must be used within an AlchemicalProvider');
  }
  return context;
}

// Alias for backward compatibility
export const useAlchemical = useAlchemicalContext; 