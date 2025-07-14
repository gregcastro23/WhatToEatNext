import { createContext, useState, ReactNode } from 'react';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type Flavor = 'spicy' | 'sweet' | 'savory';

type RecipeQueueState = {
  mealType: MealType | null;
  flavors: Flavor[];
  dietaryPreferences: string[];
  allergies: string[];
  selectedCuisines: string[];
  selectedIngredients: string[];
  selectedCookingMethods: string[];
};

type RecipeQueueContextType = {
  queue: RecipeQueueState;
  addCuisine: (cuisine: string) => void;
  removeCuisine: (cuisine: string) => void;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  addCookingMethod: (method: string) => void;
  removeCookingMethod: (method: string) => void;
  setMealType: (type: MealType) => void;
  addFlavor: (flavor: Flavor) => void;
  removeFlavor: (flavor: Flavor) => void;
  addDietaryPreference: (pref: string) => void;
  removeDietaryPreference: (pref: string) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  clearQueue: () => void;
};

export const RecipeQueueContext = createContext<RecipeQueueContextType | null>(null);

export function RecipeQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<RecipeQueueState>({
    mealType: null,
    flavors: [],
    dietaryPreferences: [],
    allergies: [],
    selectedCuisines: [],
    selectedIngredients: [],
    selectedCookingMethods: [],
  });

  const addCuisine = (cuisine: string) => {
    setQueue(prev => ({ ...prev, selectedCuisines: [...prev.selectedCuisines, cuisine] }));
  };

  const removeCuisine = (cuisine: string) => {
    setQueue(prev => ({ ...prev, selectedCuisines: prev.selectedCuisines.filter(c => c !== cuisine) }));
  };

  const addIngredient = (ingredient: string) => {
    setQueue(prev => ({ ...prev, selectedIngredients: [...prev.selectedIngredients, ingredient] }));
  };

  const removeIngredient = (ingredient: string) => {
    setQueue(prev => ({ ...prev, selectedIngredients: prev.selectedIngredients.filter(i => i !== ingredient) }));
  };

  const addCookingMethod = (method: string) => {
    setQueue(prev => ({ ...prev, selectedCookingMethods: [...prev.selectedCookingMethods, method] }));
  };

  const removeCookingMethod = (method: string) => {
    setQueue(prev => ({ ...prev, selectedCookingMethods: prev.selectedCookingMethods.filter(m => m !== method) }));
  };

  const setMealType = (type: MealType) => {
    setQueue(prev => ({ ...prev, mealType: type }));
  };

  const addFlavor = (flavor: Flavor) => {
    setQueue(prev => ({ ...prev, flavors: [...prev.flavors, flavor] }));
  };

  const removeFlavor = (flavor: Flavor) => {
    setQueue(prev => ({ ...prev, flavors: prev.flavors.filter(f => f !== flavor) }));
  };

  const addDietaryPreference = (pref: string) => {
    setQueue(prev => ({ ...prev, dietaryPreferences: [...prev.dietaryPreferences, pref] }));
  };

  const removeDietaryPreference = (pref: string) => {
    setQueue(prev => ({ ...prev, dietaryPreferences: prev.dietaryPreferences.filter(p => p !== pref) }));
  };

  const addAllergy = (allergy: string) => {
    setQueue(prev => ({ ...prev, allergies: [...prev.allergies, allergy] }));
  };

  const removeAllergy = (allergy: string) => {
    setQueue(prev => ({ ...prev, allergies: prev.allergies.filter(a => a !== allergy) }));
  };

  const clearQueue = () => {
    setQueue({
      mealType: null,
      flavors: [],
      dietaryPreferences: [],
      allergies: [],
      selectedCuisines: [],
      selectedIngredients: [],
      selectedCookingMethods: [],
    });
  };

  return (
    <RecipeQueueContext.Provider value={{ queue, addCuisine, removeCuisine, addIngredient, removeIngredient, addCookingMethod, removeCookingMethod, setMealType, addFlavor, removeFlavor, addDietaryPreference, removeDietaryPreference, addAllergy, removeAllergy, clearQueue }}>
      {children}
    </RecipeQueueContext.Provider>
  );
} 