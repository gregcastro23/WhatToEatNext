import { useState, useEffect} from "react";
import { cookingMethods } from "@/data/cooking/cookingMethods";
import { allCookingMethods } from "@/data/cooking/methods";
import { log } from "@/services/LoggingService";
import type { AlchemicalProperties, ElementalProperties } from "@/types/alchemy";

// Snapshot of the fields we actually read off entries from either
// `allCookingMethods` or `cookingMethods` — both sources have inconsistent
// per-entry shapes (some fields missing on some literals), so every field
// here is intentionally optional rather than reusing CookingMethodData's
// required fields. Nested field groups (elementalEffect, duration,
// alchemicalProperties) are kept as full (non-Partial) shapes to match the
// `CookingMethod` return type below, which declares these sub-fields as
// required numbers — the same as the pre-existing `any`-typed behavior,
// which never enforced partial-vs-full at the property level either.
interface RawCookingMethodEntry {
  name?: string;
  description?: string;
  score?: number;
  elementalEffect?: ElementalProperties;
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  alchemicalProperties?: AlchemicalProperties;
}

// Define the interface for cooking methods that the component expects
interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  culturalOrigin?: string;
  variations?: CookingMethod[];
  elementalEffect?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
}

export function useCookingMethods() {
  const [methods, setMethods] = useState<CookingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Convert the cooking methods data to the format expected by CookingMethodsSection
      const convertedMethods: CookingMethod[] = Object.entries(
        allCookingMethods,
      ).map(([key, methodData]) => {
        const data = methodData as unknown as RawCookingMethodEntry;

        return {
          id: key,
          name: data.name || key.replace(/_/g, " "),
          description: data.description || `Cooking method: ${key}`,
          score: data.score || Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1.0,
          elementalEffect: data.elementalEffect || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          },
          duration: data.duration || {
            min: 10,
            max: 60,
          },
          suitable_for: data.suitable_for || ["various ingredients"],
          benefits: data.benefits || ["cooking"],
          alchemicalProperties: data.alchemicalProperties || {
            Spirit: 0.5,
            Essence: 0.5,
            Matter: 0.5,
            Substance: 0.5,
          },
        };
      });

      // Also add methods from the cookingMethods object
      const additionalMethods: CookingMethod[] = Object.entries(
        cookingMethods,
      ).map(([key, methodData]) => {
        const data = methodData as unknown as RawCookingMethodEntry;

        return {
          id: key,
          name: data.name || key.replace(/_/g, " "),
          description: data.description || `Cooking method: ${key}`,
          score: data.score || Math.random() * 0.5 + 0.5,
          elementalEffect: data.elementalEffect || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          },
          duration: data.duration || {
            min: 10,
            max: 60,
          },
          suitable_for: data.suitable_for || ["various ingredients"],
          benefits: data.benefits || ["cooking"],
          alchemicalProperties: data.alchemicalProperties || {
            Spirit: 0.5,
            Essence: 0.5,
            Matter: 0.5,
            Substance: 0.5,
          },
        };
      });

      // Combine and deduplicate methods
      const allMethods = [...convertedMethods, ...additionalMethods];
      const uniqueMethods = allMethods.filter(
        (method, index, self) =>
          index === self.findIndex((m) => m.id === method.id),
      );

      setMethods(uniqueMethods);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load cooking methods",
      );
      setIsLoading(false);
    }
  }, []);

  const selectMethod = (methodId: string) => {
    // This could be used to track selected methods or trigger other actions
    log.info("Selected cooking method: ", { methodId });
  };

  return {
    methods,
    isLoading,
    error,
    selectMethod,
  };
}
