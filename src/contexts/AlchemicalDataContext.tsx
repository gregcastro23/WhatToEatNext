'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cuisines as staticCuisines } from '@/data/cuisines';
import { allIngredients as staticIngredients } from '@/data/ingredients/index';
import { flattenCuisineRecipes } from '@/data/recipes/index';
import { allSauces as staticSauces } from '@/data/sauces';
import { alchmAPI } from '@/lib/api/alchm-client';
import type { Recipe } from '@/types/recipe';

export interface AlchemicalDataContextType {
  cuisines: typeof staticCuisines | null;
  sauces: typeof staticSauces | null;
  ingredients: typeof staticIngredients | null;
  recipes: Recipe[] | null;
  loading: boolean;
  error: string | null;
}

const defaultStaticRecipes = flattenCuisineRecipes(staticCuisines);

const AlchemicalDataContext = createContext<AlchemicalDataContextType>({
  cuisines: staticCuisines,
  sauces: staticSauces,
  ingredients: staticIngredients,
  recipes: defaultStaticRecipes,
  loading: false,
  error: null,
});

export const useAlchemicalData = (): AlchemicalDataContextType => useContext(AlchemicalDataContext);

export function AlchemicalDataProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [data, setData] = useState<AlchemicalDataContextType>({
    cuisines: staticCuisines,
    sauces: staticSauces,
    ingredients: staticIngredients,
    recipes: defaultStaticRecipes,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (): Promise<void> => {
      try {
        const [cuisines, sauces, ingredients] = await Promise.all([
          alchmAPI.getCuisines() as Promise<typeof staticCuisines | null>,
          alchmAPI.getSauces() as Promise<typeof staticSauces | null>,
          alchmAPI.getIngredients() as Promise<typeof staticIngredients | null>,
        ]);
        
        const effectiveCuisines = cuisines ?? staticCuisines;
        const effectiveSauces = sauces ?? staticSauces;
        const effectiveIngredients = ingredients ?? staticIngredients;
        const recipes = flattenCuisineRecipes(effectiveCuisines);
        
        if (isMounted) {
          setData({
            cuisines: effectiveCuisines,
            sauces: effectiveSauces,
            ingredients: effectiveIngredients,
            recipes,
            loading: false,
            error: null,
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load alchemical data';
        if (isMounted) {
          setData(prev => ({
            ...prev,
            cuisines: prev.cuisines ?? staticCuisines,
            sauces: prev.sauces ?? staticSauces,
            ingredients: prev.ingredients ?? staticIngredients,
            recipes: prev.recipes ?? defaultStaticRecipes,
            loading: false,
            error: errorMsg,
          }));
        }
      }
    };

    fetchData().catch(() => {});
    return (): void => { isMounted = false; };
  }, []);

  return (
    <AlchemicalDataContext.Provider value={data}>
      {children}
    </AlchemicalDataContext.Provider>
  );
}
