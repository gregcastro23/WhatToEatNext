'use client';

import { useState, useEffect } from 'react';
import { CookingMethodsSection } from '@/components/CookingMethodsSection';
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  rawCookingMethods,
  transformationMethods
} from '@/data/cooking/methods';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import type { CelestialPosition } from '@/types/celestial';
import type { CookingMethodData } from '@/types/cookingMethod';
import { calculateMethodScore } from '@/utils/cookingMethodRecommender';
import { createLogger } from '@/utils/logger';

const logger = createLogger('HomeMethodsComponent');

interface FormattedMethod {
  id: string;
  name: string;
  description: string;
  elementalEffect: { Fire: number; Water: number; Earth: number; Air: number };
  score: number;
  duration: { min: number; max: number };
  suitable_for: string[];
  benefits: string[];
  variations: FormattedMethod[];
}

// The runtime alignment shape from useAstrologicalState uses lowercase planet keys
// (see useAstrologicalState.ts:124-135), which is why we can't rely on the exported
// PlanetaryAlignment type directly — it declares uppercase keys. Narrow locally.
type RuntimePlanetaryAlignment = Record<string, CelestialPosition | undefined>;

const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
const airSigns = ['Gemini', 'Libra', 'Aquarius'];

export default function HomeMethodsComponent() {
  const { currentPlanetaryAlignment, loading } = useAstrologicalState();
  const [methods, setMethods] = useState<FormattedMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<FormattedMethod | null>(null);

  useEffect(() => {
    if (!loading && currentPlanetaryAlignment) {
      const alignment = currentPlanetaryAlignment as unknown as RuntimePlanetaryAlignment;
      const sunSign = alignment.sun?.sign ?? 'Aries';
      const moonPhase = (alignment.moon as (CelestialPosition & { phase?: string }) | undefined)?.phase ?? 'New Moon';

      const astroState = {
        zodiacSign: sunSign,
        lunarPhase: moonPhase,
        elementalState: {
          Fire: fireSigns.includes(sunSign) ? 0.8 : 0.2,
          Water: waterSigns.includes(sunSign) ? 0.8 : 0.2,
          Earth: earthSigns.includes(sunSign) ? 0.8 : 0.2,
          Air: airSigns.includes(sunSign) ? 0.8 : 0.2
        },
        planets: alignment
      };

      const allMethodsObj: Record<string, CookingMethodData> = {
        ...dryCookingMethods,
        ...wetCookingMethods,
        ...molecularCookingMethods,
        ...traditionalCookingMethods,
        ...rawCookingMethods,
        ...transformationMethods
      };

      const formattedMethods: FormattedMethod[] = Object.entries(allMethodsObj).map(
        ([key, method]) => {
          // calculateMethodScore is typed for CookingMethodProfile at the boundary
          // but operates on CookingMethodData at runtime — cast through unknown to match
          // the pattern used throughout cookingMethodRecommender.ts (lines 943, 998, 1053, 1894).
          const score = calculateMethodScore(
            method as unknown as Parameters<typeof calculateMethodScore>[0],
            astroState as unknown as Parameters<typeof calculateMethodScore>[1]
          );

          const name = key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          const elementalEffect = method.elementalEffect ?? method.elementalProperties ?? {
            Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.3
          };

          const duration = method.duration ?? { min: 10, max: 30 };

          const variations: FormattedMethod[] = Array.isArray(method.variations)
            ? method.variations.map((v, i) => ({
                id: `${key}_var_${i}`,
                name: typeof v === 'string' ? v : v.name,
                description: typeof v === 'string'
                  ? `A variation of ${name} with different characteristics.`
                  : (v.description ?? `A variation of ${name}.`),
                elementalEffect,
                score: Math.max(0.1, score - 0.1),
                duration,
                suitable_for: [],
                benefits: [],
                variations: []
              }))
            : [];

          return {
            id: key,
            name,
            description: method.description ?? '',
            elementalEffect,
            score,
            duration,
            suitable_for: method.suitable_for ?? [],
            benefits: method.benefits ?? [],
            variations
          };
        }
      );

      const sortedMethods = formattedMethods.sort((a, b) => b.score - a.score).slice(0, 15);
      setMethods(sortedMethods);
    }
  }, [loading, currentPlanetaryAlignment]);

  const handleSelectMethod = (method: unknown) => {
    const selected = method as FormattedMethod;
    setSelectedMethod(prevSelected =>
      prevSelected && prevSelected.id === selected.id ? null : selected
    );

    if (!selectedMethod || selectedMethod.id !== selected.id) {
      logger.debug('Selected method', { name: selected.name });
    } else {
      logger.debug('Unselected method', { name: selected.name });
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading cooking methods...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Recommended Cooking Methods</h3>
      <p className="text-sm text-gray-600 mb-6">
        Based on current astrological alignments, these cooking methods are most favorable for your food preparation.
      </p>

      {methods.length > 0 ? (
        <CookingMethodsSection
          methods={methods}
          onSelectMethod={handleSelectMethod}
          selectedMethodId={selectedMethod?.id || null}
          initiallyExpanded
        />
      ) : (
        <div className="text-center p-4">No cooking methods found</div>
      )}
    </div>
  );
}
