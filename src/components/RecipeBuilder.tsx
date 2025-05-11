import React, { useState, useEffect } from 'react';
import @/data  from 'ingredients ';
import @/utils  from 'ingredientUtils ';
import @/constants  from 'signEnergyStates ';
import @/constants  from 'chakraMappings ';
import @/types  from 'recipe '; // Import the Recipe type

// Define a type for chakra access points to the energy states
interface ChakraEnergyAccess {
  chakra: Chakra;
  spiritInfluence: number;
  essenceInfluence: number;
  matterInfluence: number;
  substanceInfluence: number;
  primaryFoods: string[];
}

// No longer need to define Recipe interface here

export default function RecipeBuilder() {
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [recipeModality, setRecipeModality] = useState<Modality>('Mutable');
  const [chakraAccess, setChakraAccess] = useState<ChakraEnergyAccess[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [signEnergyStates, setSignEnergyStates] = useState<SignEnergyState[]>(
    []
  );

  // Calculate the dominant modality of the recipe based on selected ingredients
  useEffect(() => {
    if (selectedIngredients.length === 0) {
      setRecipeModality('Mutable');
      return;
    }

    const modalityCounts: Record<Modality, number> = {
      Cardinal: 0,
      Fixed: 0,
      Mutable: 0,
    };

    selectedIngredients.forEach((ingredient) => {
      let modality = (ingredient.modality ||
        determineIngredientModality(
          ingredient.elementalProperties,
          ingredient.qualities || []
        )) as Modality;
      modalityCounts[modality]++;
    });

    // Find the dominant modality
    let dominantModality: Modality = 'Mutable';
    let highestCount = 0;

    (Object.entries(modalityCounts) as [Modality, number][]).forEach(
      ([modality, count]) => {
        if (count > highestCount) {
          highestCount = count;
          dominantModality = modality;
        }
      }
    );

    setRecipeModality(dominantModality);
  }, [selectedIngredients]);

  useEffect(() => {
    if (signEnergyStates && signEnergyStates.length > 0) {
      // Instead of calculating chakra energy states, map chakras to access the energy states
      let chakraAccessPoints = mapChakrasToEnergyStates(signEnergyStates);
      setChakraAccess(chakraAccessPoints);
    }
  }, [signEnergyStates]);

  // Map chakras to access the energy states (Spirit, Essence, Matter, Substance)
  let mapChakrasToEnergyStates = (
    energyStates: SignEnergyState[]
  ): ChakraEnergyAccess[] => {
    const chakras: Chakra[] = [
      'Root',
      'Sacral',
      'Solar Plexus',
      'Heart',
      'Throat',
      'Third Eye',
      'Crown',
    ];

    // Mapping of chakras to their influence on the four energy types
    const chakraInfluenceMap: Record<
      Chakra,
      { spirit: number; essence: number; matter: number; substance: number }
    > = {
      Root: { spirit: 0.2, essence: 0.3, matter: 0.8, substance: 0.7 },
      Sacral: { spirit: 0.3, essence: 0.7, matter: 0.6, substance: 0.4 },
      'Solar Plexus': {
        spirit: 0.4,
        essence: 0.8,
        matter: 0.4,
        substance: 0.3,
      },
      Heart: { spirit: 0.6, essence: 0.7, matter: 0.4, substance: 0.2 },
      Throat: { spirit: 0.7, essence: 0.5, matter: 0.3, substance: 0.4 },
      'Third Eye': { spirit: 0.9, essence: 0.4, matter: 0.2, substance: 0.3 },
      Crown: { spirit: 1.0, essence: 0.3, matter: 0.1, substance: 0.2 },
    };

    // Calculate average energy values across all signs
    let avgSpirit =
      energyStates.reduce(
        (sum, state) =>
          sum +
          (state.planetaryModifiers.Sun || 0) *
            chakraInfluenceMap['Crown'].spirit,
        0
      ) / energyStates.length;

    let avgEssence =
      energyStates.reduce(
        (sum, state) =>
          sum +
          (state.planetaryModifiers.Moon || 0) *
            chakraInfluenceMap['Heart'].essence,
        0
      ) / energyStates.length;

    let avgMatter =
      energyStates.reduce(
        (sum, state) =>
          sum +
          (state.planetaryModifiers.Saturn || 0) *
            chakraInfluenceMap['Root'].matter,
        0
      ) / energyStates.length;

    let avgSubstance =
      energyStates.reduce(
        (sum, state) =>
          sum +
          (state.planetaryModifiers.Mercury || 0) *
            chakraInfluenceMap['Throat'].substance,
        0
      ) / energyStates.length;

    // Generate food recommendations based on energy state influence through chakras
    let chakraAccessPoints = chakras.map((chakra) => {
      const influence = chakraInfluenceMap[chakra];
      // Calculate influence values
      let spiritInfluence = avgSpirit * influence.spirit;
      let essenceInfluence = avgEssence * influence.essence;
      let matterInfluence = avgMatter * influence.matter;
      let substanceInfluence = avgSubstance * influence.substance;

      // Example food recommendations based on the energy balance
      let primaryFoods = getChakraFoodRecommendations(chakra, {
        spirit: spiritInfluence,
        essence: essenceInfluence,
        matter: matterInfluence,
        substance: substanceInfluence,
      });

      return {
        chakra,
        spiritInfluence,
        essenceInfluence,
        matterInfluence,
        substanceInfluence,
        primaryFoods,
      };
    });

    return chakraAccessPoints;
  };

  // Get food recommendations for a chakra based on energy influences
  let getChakraFoodRecommendations = (
    chakra: Chakra,
    energyInfluence: {
      spirit: number;
      essence: number;
      matter: number;
      substance: number;
    }
  ): string[] => {
    // Basic chakra-food mappings
    const chakraFoodMap: Record<Chakra, string[]> = {
      Root: ['Sweet Potatoes', 'Carrots', 'Beets', 'Red Meat', 'Nuts'],
      Sacral: ['Oranges', 'Mangoes', 'Pumpkin', 'Salmon', 'Seeds'],
      'Solar Plexus': ['Corn', 'Bananas', 'Ginger', 'Yellow Peppers', 'Grains'],
      Heart: ['Leafy Greens', 'Broccoli', 'Avocados', 'Green Tea', 'Olive Oil'],
      Throat: ['Blueberries', 'Fruit Juices', 'Herbal Teas', 'Sea Vegetables'],
      'Third Eye': ['Purple Grapes', 'Eggplant', 'Walnuts', 'Dark Chocolate'],
      Crown: ['Mushrooms', 'Garlic', 'Ginger', 'Pure Water'],
    };

    // Determine which energy aspect needs the most balance
    let energyAspects = [
      { type: 'spirit', value: energyInfluence.spirit },
      { type: 'essence', value: energyInfluence.essence },
      { type: 'matter', value: energyInfluence.matter },
      { type: 'substance', value: energyInfluence.substance },
    ];

    // Sort by lowest value (what needs most support)
    energyAspects.sort((a, b) => a.value - b.value);

    // Basic foods for the chakra
    let recommendedFoods = [...chakraFoodMap[chakra]];

    // Add specific foods based on which energy aspect needs most support
    if (energyAspects[0].type === 'spirit') {
      recommendedFoods.push('Light, Aromatic Herbs', 'Subtle Flavors');
    } else if (energyAspects[0].type === 'essence') {
      recommendedFoods.push('Flavorful Broths', 'Aromatic Spices');
    } else if (energyAspects[0].type === 'matter') {
      recommendedFoods.push('Dense, Hearty Foods', 'Root Vegetables');
    } else {
      recommendedFoods.push('Textured Foods', 'Varied Ingredients');
    }

    return recommendedFoods;
  };

  // Get description for the recipe's modality
  let getModalityDescription = (modality: Modality): string => {
    switch (modality) {
      case 'Cardinal':
        return 'This recipe has strong, bold flavors and will be energizing and stimulating.';
      case 'Fixed':
        return 'This recipe is grounding and nourishing, providing substantial satisfaction.';
      case 'Mutable':
        return 'This recipe is versatile and balanced, adapting well to different palates.';
      default:
        return '';
    }
  };

  let enhanceRecipe = (baseRecipe: Recipe): void => {
    if (chakraAccess && chakraAccess.length > 0) {
      // Find the chakras that can best help balance the energy
      const chakrasToFocus = chakraAccess
        .sort(
          (a, b) =>
            a.spiritInfluence +
            a.essenceInfluence -
            (b.spiritInfluence + b.essenceInfluence)
        )
        .slice(0, 3); // Focus on top 3 chakras for energy balance

      // Create a copy of the recipe with the required fields ensured
      let enhancedRecipe = {
        ...baseRecipe,
        // Ensure required fields exist
        id: baseRecipe.id || `recipe-${Date.now()}`,
        name: baseRecipe.name,
        description: baseRecipe.description || '',
        cuisine: baseRecipe.cuisine || 'Various',
        timeToMake: baseRecipe.timeToMake || '30 minutes',
        numberOfServings: baseRecipe.numberOfServings || 4,
        instructions: baseRecipe.instructions || [],
        // Add chakra balance data using the Recipe's allowance for additional properties
        chakraBalance: {
          focusChakras: chakrasToFocus.map((c) => c.chakra),
          suggestedAdditions: chakrasToFocus
            .flatMap((c) => c.primaryFoods)
            .slice(0, 5),
          energyAccessPoints: chakrasToFocus,
        },
        // Add special note on astrologicalInfluences for integration with existing systems
        astrologicalInfluences: [
          ...(baseRecipe.astrologicalInfluences || []),
          ...chakrasToFocus.map((c) => `Chakra: ${c.chakra}`),
        ],
      } as Recipe; // Use type assertion to handle the extended property

      // Use the enhanced recipe
      setRecipe(enhancedRecipe);
    } else {
      // Just set the base recipe if we don't have chakra data
      setRecipe(baseRecipe);
    }
  };

  return (
    <div className="recipe-builder">
      <h2>Recipe Builder</h2>

      {/* Ingredient selector */}
      <div className="ingredient-selector">{/* Ingredient selection UI */}</div>

      {/* Selected ingredients list */}
      <div className="selected-ingredients">
        <h3>Selected Ingredients</h3>
        {selectedIngredients.map((ingredient) => (
          <div key={ingredient.id} className="selected-ingredient">
            <span>{ingredient.name}</span>
            <span
              className={`modality-badge ${
                ingredient.modality?.toLowerCase() || 'mutable'
              }`}
            >
              {ingredient.modality || 'Mutable'}
            </span>
          </div>
        ))}
      </div>

      {/* Recipe modality */}
      <div className="recipe-modality">
        <h3>Recipe Quality</h3>
        <div className={`modality-badge ${recipeModality.toLowerCase()}`}>
          {recipeModality}
        </div>
        <p className="modality-description">
          {getModalityDescription(recipeModality)}
        </p>
      </div>

      {/* Only show if we have chakra access points and a recipe */}
      {chakraAccess?.length > 0 && recipe?.chakraBalance && (
        <div className="chakra-balance">
          <h3>Energy Access through Chakras</h3>
          <div className="focus-chakras">
            <h4>Focus on these chakras for energy balance:</h4>
            <ul>
              {recipe.chakraBalance.focusChakras.map((chakra: Chakra) => (
                <li key={chakra}>{chakra}</li>
              ))}
            </ul>
          </div>
          <div className="suggested-additions">
            <h4>Suggested additions for energy balance:</h4>
            <ul>
              {recipe.chakraBalance.suggestedAdditions.map(
                (food: string, index: number) => (
                  <li key={index}>{food}</li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
