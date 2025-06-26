

// Types
export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
  minerals?: string[];
}

// Mock Data
export const defaultElementalProps: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
};

export const mockIngredients = {
  'Oils & Fats': [
    {
      name: 'sesame oil',
      elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2
      }
    }
  ],
  'Herbs': [
    {
      name: 'basil',
      elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2
      }
    }
  ],
  'Spices': [
    {
      name: 'star anise',
      elementalProperties: { Fire: 0.35, Water: 0.25, Earth: 0.2, Air: 0.2
      }
    }
  ]
};

// IngredientRecommendations Component
import type { AstrologicalState, ElementalProperties, ThermodynamicMetrics } from "@/types/alchemy";
import React, { useMemo } from 'react';
import { getTopIngredientMatches } from '../../utils/recommendation/foodRecommendation';


import { _Element } from "@/types/alchemy";


interface IngredientRecommendationsProps {
  astrologicalState: AstrologicalState;
}

export const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
  astrologicalState
}) => {
  const [recommendedIngredients, setRecommendedIngredients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const result = await getTopIngredientMatches(astrologicalState, 5);
        setRecommendedIngredients(Array.isArray(result) ? result : []);
      } catch (error) {
        // console.error('Error fetching recommendations:', error);
        setRecommendedIngredients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [astrologicalState]);

  if (isLoading) {
    return React.createElement("div", { className: "text-gray-500 text-center py-4" }, "Loading recommendations...");
  }

  if ((recommendedIngredients || []).length === 0) {
    return React.createElement("div", { className: "text-gray-500 text-center py-4" }, "No recommended ingredients found");
  }

  return React.createElement(
    "div", 
    { className: "p-4 bg-white rounded-lg shadow-md" },
    React.createElement("h3", { className: "text-lg font-semibold mb-3" }, "Recommended Ingredients"),
    React.createElement(
      "ul", 
      { className: "space-y-2" },
      (recommendedIngredients || []).map(ingredient => 
        React.createElement(
          "li", 
          { 
            key: ingredient.name,
            className: "p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          },
          React.createElement("div", { className: "font-medium text-gray-900" }, ingredient.name),
          React.createElement(
            "div",
            { className: "text-sm text-gray-600 space-y-1" },
            React.createElement("div", {}, "Element: ", 
              typeof ingredient.astrologicalPropertiesProfile?.elementalAffinity === 'object' 
                ? ingredient?.astrologicalPropertiesProfile?.elementalAffinity?.base 
                : (typeof ingredient.astrologicalPropertiesProfile?.elementalAffinity === 'string' 
                  ? ingredient?.astrologicalPropertiesProfile?.elementalAffinity?.base 
                  : 'Unknown')
            ),
            React.createElement("div", {}, "Planets: ", 
              Array.isArray(ingredient.astrologicalPropertiesProfile?.rulingPlanets) 
                ? ingredient?.astrologicalPropertiesProfile?.rulingPlanets?.join(', ') 
                : 'Unknown'
            )
          )
        )
      )
    )
  );
}; 