import { NutritionalProfile, ElementalProperties } from '../types/alchemy';

export const calculateNutritionalScore = (nutrition: NutritionalProfile): number => {
  if (!nutrition) return 0;
  
  const baseScore = 
    (nutrition.macros.protein || 0) * 0.4 +
    (nutrition.macros.fiber || 0) * 0.3 +
    ((nutrition.vitamins?.vitaminC || 0) * 0.2) +
    ((nutrition.minerals?.iron || 0) * 0.1);
    
  return Math.min(1, Math.max(0, baseScore / 100));
};

export const calculateNutritionalImpact = (
  nutrition: NutritionalProfile,
  elements: ElementalProperties
): ElementalProperties => {
  const score = calculateNutritionalScore(nutrition);
  return {
    Fire: elements.Fire * (1 + score * 0.2),
    Water: elements.Water * (1 + score * 0.15),
    Earth: elements.Earth * (1 + score * 0.25),
    Air: elements.Air * (1 + score * 0.1)
  };
}; 