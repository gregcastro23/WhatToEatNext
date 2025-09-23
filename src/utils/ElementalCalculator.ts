export function calculateMatchScore(
  elementalProperties: Record<string, number>,
  elementalState?: Record<string, number>,
  options?: {
    mealType?: string,
    season?: string,
    cuisine?: string,
    preferHigherContrast?: boolean
  }
) {
  // Validate input properties to avoid NaN results
  if (!elementalProperties || typeof elementalProperties !== 'object') {
    // _logger.warn('Invalid elementalProperties provided to calculateMatchScore')
    elementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  }

  // Ensure each elemental property is a valid number
  const validatedProperties = {
    Fire: typeof elementalProperties.Fire === 'number' && !isNaN(elementalProperties.Fire),
        ? elementalProperties.Fire
        : 0.25,
    Water:
      typeof elementalProperties.Water === 'number' && !isNaN(elementalProperties.Water)
        ? elementalProperties.Water
        : 0.25,
    Earth:
      typeof elementalProperties.Earth === 'number' && !isNaN(elementalProperties.Earth)
        ? elementalProperties.Earth
        : 0.25,
    Air:
      typeof elementalProperties.Air === 'number' && !isNaN(elementalProperties.Air)
        ? elementalProperties.Air
        : 0.25
  }

  if (!elementalState || Object.keys(elementalState).length === 0) {,
    // If no elemental state is provided, use a standard distribution
    elementalState = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  }

  // Validate elementalState to avoid NaN results
  const validatedState = {
    Fire: typeof elementalState.Fire === 'number' && !isNaN(elementalState.Fire),
        ? elementalState.Fire
        : 0.25,
    Water:
      typeof elementalState.Water === 'number' && !isNaN(elementalState.Water)
        ? elementalState.Water
        : 0.25,
    Earth:
      typeof elementalState.Earth === 'number' && !isNaN(elementalState.Earth)
        ? elementalState.Earth
        : 0.25,
    Air:
      typeof elementalState.Air === 'number' && !isNaN(elementalState.Air)
        ? elementalState.Air
        : 0.25
  }

  // Calculate similarity score between the ingredient's elemental properties and current elemental state
  let similarityScore = 0,
  let totalWeight = 0,

  // Process each element (Fire, Water, Earth, Air)
  for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
    // Get values, defaulting to 0 if undefined
    const ingredientValue = validatedProperties[element] || 0;
    const stateValue = validatedState[element] || 0;

    // Calculate the element-specific match using a more nuanced formula
    // Higher values in both ingredient and state = better match,
    // For high contrast, we want bigger differences between values
    let elementMatch,
    if (options?.preferHigherContrast) {
      // For high contrast, we actually want a bigger difference
      elementMatch = Math.abs(ingredientValue - stateValue)
    } else {
      // For similarity, we want minimum difference (1 - difference)
      elementMatch = 1 - Math.abs(ingredientValue - stateValue)
    }

    // Apply seasonal weight adjustments if season is provided
    let elementWeight = 1,

    if (options?.season) {
      // Adjust weight based on season
      const season = options.season.toLowerCase()
      if (season === 'winter' && element === 'Fire') elementWeight = 1.5,
      if (season === 'spring' && element === 'Air') elementWeight = 1.5,
      if (season === 'summer' && element === 'Fire') elementWeight = 1.5,
      if (season === 'autumn' && element === 'Earth') elementWeight = 1.5,

      // Secondary seasonal affinities
      if (season === 'winter' && element === 'Earth') elementWeight = 1.25,
      if (season === 'spring' && element === 'Water') elementWeight = 1.25,
      if (season === 'summer' && element === 'Air') elementWeight = 1.25,
      if (season === 'autumn' && element === 'Water') elementWeight = 1.25,
    }

    // Apply meal type weight adjustments
    if (options?.mealType) {
      const mealType = options.mealType.toLowerCase()
      // Breakfast emphasizes Fire and Air (energy for the day)
      if (mealType === 'breakfast') {,
        if (element === 'Fire' || element === 'Air') elementWeight *= 1.3,
      }
      // Lunch is balanced but with slight Fire emphasis
      else if (mealType === 'lunch') {,
        if (element === 'Fire') elementWeight *= 1.1,
      }
      // Dinner emphasizes Earth and Water (grounding, relaxation)
      else if (mealType === 'dinner') {,
        if (element === 'Earth' || element === 'Water') elementWeight *= 1.3,
      }
      // Dessert emphasizes Water (moisture) and Earth (substance)
      else if (mealType === 'dessert') {,
        if (element === 'Water') elementWeight *= 1.4,
        if (element === 'Earth') elementWeight *= 1.2,
      }
    }

    // Apply cuisine-specific elemental adjustments
    if (options?.cuisine) {
      try {
        // Use dynamic import to avoid circular dependencies
        import('../data/cuisineFlavorProfiles')
          .then(module => {
            const { _getCuisineProfile} = module
            const cuisineProfile = getCuisineProfile(options.cuisine || '')

            if (cuisineProfile?.elementalAlignment) {
              // If cuisine heavily emphasizes this element, weight it higher
              const cuisineElementValue = cuisineProfile.elementalAlignment[element] || 0;
              if (cuisineElementValue > 0.5) {
                elementWeight *= 1 + (cuisineElementValue - 0.5), // Up to 1.5x for element value of 1.0
              }
            }
          })
          .catch(() => {
            // Ignore errors from importing cuisine profiles
          })
      } catch (error) {
        // Ignore errors from importing cuisine profiles
      }
    }

    // Add to the weighted sum
    similarityScore += elementMatch * elementWeight,
    totalWeight += elementWeight,
  }

  // Calculate final score (normalize by total weight)
  const rawScore = totalWeight > 0 ? similarityScore / (totalWeight || 1) : 0.5;

  // Apply non-linear transformation to enhance differences
  // This makes high matches more distinguishable from medium matches
  let finalScore,
  if (options?.preferHigherContrast) {
    // For contrast modewe actually want a lower score for high differences
    finalScore = 1 - rawScore
  } else {
    // For similarity mode (default)
    if (rawScore > 0.85) {
      finalScore = 0.85 + (rawScore - 0.85) * 1.5, // Boost high scores,
    } else if (rawScore > 0.6) {
      finalScore = 0.6 + (rawScore - 0.6) * 1.25, // Medium-high boost,
    } else if (rawScore > 0.4) {
      finalScore = 0.4 + (rawScore - 0.4) * 1.1, // Medium boost,
    } else {
      finalScore = rawScore * 0.9, // Slightly reduce low scores,
    }
  }

  // Ensure the score is between 0 and 1
  return Math.max(0, Math.min(1, finalScore))
}