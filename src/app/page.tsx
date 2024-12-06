'use client';

import { useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import RecipeGrid from '@/components/Recipe/RecipeGrid';
import { cuisines } from '@/data/cuisines';
import type { Cuisine } from '@/types/cuisine';
import { Sun, Moon, Star, Clock, Flame, Droplet, Wind, Mountain } from 'lucide-react';
import { ZODIAC_ELEMENTS, ELEMENT_AFFINITIES } from '@/constants/elementalConstants';
import type { AstrologicalState, ZodiacSign, ElementalProperties } from '@/types/alchemy';
import type { Recipe, ScoredRecipe } from '@/types/recipe';

export default function Home() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [astrologicalInfluence] = useState<number>(0);
  const { state } = useAlchemical();

  // Enhanced recipe calculation with astrological influences
  const allRecipes: ScoredRecipe[] = Object.values(cuisines as Record<string, Cuisine>).flatMap(cuisine => {
    if (!cuisine?.dishes) return [];
    
    return Object.entries(cuisine.dishes).flatMap(([mealType, seasonDishes]) => {
      if (!seasonDishes) return [];
      
      return Object.values(seasonDishes).flat().map((recipe) => {
        const typedRecipe = recipe as Recipe;
        
        const astroPower = calculateAstrologicalPower(typedRecipe, state.astrologicalState);
        const elementalHarmony = calculateElementalHarmony(
          typedRecipe.elementalProperties,
          state.elementalBalance
        );

        const totalScore = astroPower + elementalHarmony + astrologicalInfluence;
        
        return {
          ...typedRecipe,
          mealType,
          astroPower,
          elementalHarmony,
          totalScore
        };
      });
    });
  }).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  // Filter recipes based on selected cuisine
  const filteredRecipes = selectedCuisine
    ? allRecipes.filter(recipe => 
        recipe.cuisine && recipe.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
      )
    : allRecipes;

  // Get zodiac-based color theme
  const themeColors = getZodiacColors(state.astrologicalState.sunSign);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Astrological Banner */}
      <div 
        className="p-6 text-white"
        style={{ background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Time and Sign Info */}
            <div className="flex items-center space-x-4">
              {getCurrentMealType(new Date().getHours()) === 'dinner' ? (
                <Moon className="h-8 w-8" />
              ) : (
                <Sun className="h-8 w-8" />
              )}
              <div>
                <h1 className="text-2xl font-bold font-playfair">
                  {getTimeBasedGreeting()}
                </h1>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  <Clock className="h-4 w-4" />
                  <span>{getCurrentMealType(new Date().getHours())} Time</span>
                </div>
              </div>
            </div>

            {/* Astrological State */}
            <div className="flex items-center space-x-6 bg-white/10 rounded-lg p-3">
              <div className="text-sm">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <span>Sun in {state.astrologicalState.sunSign}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4" />
                  <span>Moon in {state.astrologicalState.moonSign}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>{state.astrologicalState.lunarPhase}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Elemental Balance */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(state.elementalBalance).map(([element, value]) => (
              <div 
                key={element}
                className="bg-white/20 rounded-lg p-3 flex items-center justify-between"
              >
                {getElementIcon(element)}
                <div className="ml-3">
                  <div className="text-sm font-semibold">{element}</div>
                  <div className="text-xs opacity-90">{(value * 100).toFixed(0)}%</div>
                </div>
                <div 
                  className="w-24 h-2 bg-white/20 rounded-full overflow-hidden ml-2"
                >
                  <div 
                    className="h-full bg-white"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Navigation and Grid Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Cuisine Navigation */}
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex gap-3">
              {Object.keys(cuisines).map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine === selectedCuisine ? null : cuisine)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCuisine === cuisine 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Grid */}
          <RecipeGrid 
            recipes={filteredRecipes}
            selectedCuisine={selectedCuisine}
            mealType={getCurrentMealType(new Date().getHours())}
          />
        </div>
      </div>
    </main>
  );
}

// Helper Functions
function getCurrentMealType(hour: number): string {
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 22) return 'Good Evening';
  return 'Good Night';
}

function calculateAstrologicalPower(recipe: Recipe, astroState: AstrologicalState): number {
  const recipeSunElement = ZODIAC_ELEMENTS[recipe.sunSign as ZodiacSign];
  const stateSunElement = ZODIAC_ELEMENTS[astroState.sunSign];
  const stateMoonElement = ZODIAC_ELEMENTS[astroState.moonSign];

  let power = 0;
  
  // Element compatibility
  if (recipeSunElement === stateSunElement) power += 0.4;
  if (ELEMENT_AFFINITIES[recipeSunElement]?.includes(stateMoonElement)) power += 0.3;
  
  // Lunar phase bonus
  if (astroState.lunarPhase === 'full_moon') power += 0.2;
  if (astroState.lunarPhase === 'new_moon') power += 0.1;

  return Math.min(power, 1);
}

function calculateElementalHarmony(
  recipeElements: ElementalProperties | undefined,
  elementalBalance: ElementalProperties
): number {
  // Early return if recipeElements is undefined
  if (!recipeElements) return 0;

  let totalHarmony = 0;
  let totalElements = 0;

  Object.entries(recipeElements).forEach(([element, value]) => {
    if (element in elementalBalance) {  // Type-safe check
      const difference = Math.abs(value - elementalBalance[element as keyof ElementalProperties]);
      totalHarmony += 1 - difference;
      totalElements += 1;
    }
  });

  return totalElements > 0 ? totalHarmony / totalElements : 0;
}

function getZodiacColors(sign: ZodiacSign): { primary: string; secondary: string } {
  const colorMap = {
    aries: { primary: '#FF3B3B', secondary: '#FF8071' },
    taurus: { primary: '#43A047', secondary: '#81C784' },
    gemini: { primary: '#FFB300', secondary: '#FDD835' },
    cancer: { primary: '#4B89FF', secondary: '#64B5F6' },
    leo: { primary: '#FF9100', secondary: '#FFB74D' },
    virgo: { primary: '#558B2F', secondary: '#9CCC65' },
    libra: { primary: '#EC407A', secondary: '#F06292' },
    scorpio: { primary: '#7B1FA2', secondary: '#AB47BC' },
    sagittarius: { primary: '#FF5722', secondary: '#FF7043' },
    capricorn: { primary: '#455A64', secondary: '#607D8B' },
    aquarius: { primary: '#1976D2', secondary: '#42A5F5' },
    pisces: { primary: '#5E35B1', secondary: '#7E57C2' }
  };

  return colorMap[sign] || { primary: '#3B82F6', secondary: '#60A5FA' };
}

function getElementIcon(element: string) {
  switch (element) {
    case 'Fire': return <Flame className="h-5 w-5" />;
    case 'Water': return <Droplet className="h-5 w-5" />;
    case 'Air': return <Wind className="h-5 w-5" />;
    case 'Earth': return <Mountain className="h-5 w-5" />;
    default: return null;
  }
}