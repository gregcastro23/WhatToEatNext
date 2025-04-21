import { allCookingMethods } from '../../data/cooking/methods';
import { CookingMethodInfo } from '../../types/cooking';

export default function getMethodData(id: string): CookingMethodInfo | null {
  const method = allCookingMethods.find(m => m.id === id);
  
  if (!method) {
    return null;
  }
  
  // Convert to CookingMethodInfo format
  return {
    ...method,
    elementalEffect: method.elementalEffect || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    duration: method.duration || { min: 10, max: 30 },
    suitable_for: method.suitable_for || [],
    benefits: method.benefits || [],
    instructions: method.instructions || [],
    recommendedFoods: method.recommendedFoods || [],
    thermodynamicProperties: method.thermodynamicProperties || {
      heatTransfer: "medium",
      temperatureRange: "medium"
    }
  } as CookingMethodInfo;
} 