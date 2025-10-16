import type { ESMSProperties, ThermodynamicsInput, ThermodynamicsResult } from '@/services/ThermodynamicsClient';
import { thermodynamicsClient } from '@/services/ThermodynamicsClient';
import type { ElementalProperties } from '@/types/celestial';
import { useCallback, useMemo, useState } from 'react';

interface UseThermodynamicsOptions {
  elemental?: ElementalProperties,
  esms?: ESMSProperties,
  ingredients?: unknown[],
  planetaryPositions?: ThermodynamicsInput['planetaryPositions']
}

export function useThermodynamics(initial?: UseThermodynamicsOptions) {
  const [result, setResult] = useState<ThermodynamicsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculate = useCallback(async (input?: UseThermodynamicsOptions) => {
    setLoading(true)
    setError(null)
    try {
      const payload: ThermodynamicsInput = {
        elemental: input?.elemental ?? initial?.elemental,
        esms: input?.esms ?? initial?.esms,
        ingredients: input?.ingredients ?? initial?.ingredients,
        planetaryPositions: input?.planetaryPositions ?? initial?.planetaryPositions
}
      const data = await thermodynamicsClient.calculate(payload)
      setResult(data)
      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.elemental, initial?.esms, initial?.ingredients, initial?.planetaryPositions])

  return useMemo(() => ({ result, loading, error, calculate }), [result, loading, error, calculate])
}

export default useThermodynamics;
