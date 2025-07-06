/**
 * Thermodynamic Engine - Core calculations for thermal dynamics
 */
import { useEffect, useState } from 'react';
import type { ElementalProperties } from '@/types/alchemy';

export interface ThermodynamicState {
  temperature: number;
  entropy: number;
  energy: number;
  phase: 'solid' | 'liquid' | 'gas' | 'plasma';
}

export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  stability: number;
}

export function calculateThermodynamicMetrics(
  elementalProps: ElementalProperties
): ThermodynamicMetrics {
  const { Fire, Water, Earth, Air } = elementalProps;
  
  return {
    heat: Fire * 0.8 + Air * 0.4 - Water * 0.3 - Earth * 0.2,
    entropy: Air * 0.6 + Fire * 0.4 - Earth * 0.5 - Water * 0.1,
    reactivity: Fire * 0.7 + Air * 0.5 - Water * 0.2 - Earth * 0.4,
    stability: Earth * 0.8 + Water * 0.6 - Fire * 0.3 - Air * 0.4
  };
}

export function useThermodynamicEngine() {
  const [state, setState] = useState<ThermodynamicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const thermodynamicState: ThermodynamicState = {
        temperature: 298.15, // Room temperature in Kelvin
        entropy: 0.5,
        energy: 1.0,
        phase: 'liquid'
      };
      setState(thermodynamicState);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize thermodynamic engine');
      setLoading(false);
    }
  }, []);

  const calculateMetrics = (elementalProps: ElementalProperties) => {
    return calculateThermodynamicMetrics(elementalProps);
  };

  return {
    state,
    loading,
    error,
    calculateMetrics,
    refreshState: () => {
      setLoading(true);
      setError(null);
      try {
        const thermodynamicState: ThermodynamicState = {
          temperature: 298.15 + Math.random() * 10,
          entropy: 0.4 + Math.random() * 0.2,
          energy: 0.8 + Math.random() * 0.4,
          phase: 'liquid'
        };
        setState(thermodynamicState);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh thermodynamic state');
        setLoading(false);
      }
    }
  };
}