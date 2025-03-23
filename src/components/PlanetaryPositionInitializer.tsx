'use client';

import { useEffect } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';

export default function PlanetaryPositionInitializer() {
  const { refreshPlanetaryPositions } = useAlchemical();

  useEffect(() => {
    // Refresh planetary positions only when component mounts
    refreshPlanetaryPositions();
    
    // Optional: Set up periodic refresh
    const intervalId = setInterval(() => {
      refreshPlanetaryPositions();
    }, 15 * 60 * 1000); // Every 15 minutes
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array - only runs once on mount

  // This component doesn't render anything
  return null;
} 