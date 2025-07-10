import React, { useState, useEffect, useCallback } from 'react';
import type { 
  ElementalProperties, 
  Element, 
  Recipe,
  ThermodynamicMetrics,
  ZodiacSign
} from '@/types/alchemy';
import type { TimeFactors } from '@/types/time';
import { getTimeFactors } from '@/types/time';

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Slider, 
  Button, 
  Grid, 
  Alert, 
  Chip,
  Divider,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Flame, 
  Droplets, 
  Mountain, 
  Wind, 
  Calculator, 
  Wand2, 
  Sparkles, 
  RotateCcw 
} from 'lucide-react';

// Data and Utils
import { ingredientsMap } from '@/data/ingredients';
import { SIGN_ENERGY_STATES } from '@/constants/signEnergyStates';
import { SEASONAL_MODIFIERS } from '@/constants/seasonalCore';
import { getCurrentSeason } from '@/utils/dateUtils';
import { CHAKRA_NUTRITIONAL_CORRELATIONS, CHAKRA_HERBS } from '@/constants/chakraSymbols';

// Types
type Chakra = 'Root' | 'Sacral' | 'Solar Plexus' | 'Heart' | 'Throat' | 'Third Eye' | 'Crown';
type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

interface SignEnergyState {
  sign: string;
  planetaryModifiers: { [key: string]: number };
  energyValues: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
}

interface ChakraEnergyAccess {
  chakra: Chakra;
  spiritInfluence: number;
  essenceInfluence: number;
  matterInfluence: number;
  substanceInfluence: number;
  primaryFoods: string[];
}

interface CalculationResult {
  resultingProperties: ElementalProperties;
  energyState: {
    heat: number;
    entropy: number;
    pressure: number;
    reactivity: number;
  };
  stability: number;
  potency: number;
  dominantElement: Element;
  warnings: string[];
  alchemicalRecommendations: string[];
  season: string;
  zodiacSign?: ZodiacSign;
  seasonalModifiers: Record<string, unknown>;
}

// Constants
const MAX_TOTAL = 1;
const MIN_ELEMENT_VALUE = 0;
const MAX_ELEMENT_VALUE = 1;

// Helper Functions
const createElementalProperties = (props: Partial<ElementalProperties>): ElementalProperties => ({
  Fire: props.Fire || 0,
  Water: props.Water || 0,
  Earth: props.Earth || 0,
  Air: props.Air || 0
});

const validateElementalProperties = (props: Record<string, unknown>): ElementalProperties => {
  const defaultProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  
  if (!props || typeof props !== 'object') return defaultProps;
  
  return {
    Fire: Math.max(0, Math.min(1, Number(props.Fire) || 0)),
    Water: Math.max(0, Math.min(1, Number(props.Water) || 0)),
    Earth: Math.max(0, Math.min(1, Number(props.Earth) || 0)),
    Air: Math.max(0, Math.min(1, Number(props.Air) || 0))
  };
};

const getCurrentZodiacSign = (): ZodiacSign => {
  // Simplified - in real implementation, this would calculate based on current date
  return 'gemini';
};

const getZodiacElementalInfluence = (zodiacSign: ZodiacSign): ElementalProperties => {
  // Simplified zodiac elemental influences
  const influences: Record<ZodiacSign, ElementalProperties> = {
    aries: { Fire: 1.2, Water: 0.8, Earth: 0.9, Air: 1.0 },
    taurus: { Fire: 0.8, Water: 1.0, Earth: 1.2, Air: 0.9 },
    gemini: { Fire: 1.0, Water: 0.9, Earth: 0.8, Air: 1.2 },
    cancer: { Fire: 0.9, Water: 1.2, Earth: 1.0, Air: 0.8 },
    leo: { Fire: 1.2, Water: 0.8, Earth: 0.9, Air: 1.0 },
    virgo: { Fire: 0.8, Water: 1.0, Earth: 1.2, Air: 0.9 },
    libra: { Fire: 1.0, Water: 0.9, Earth: 0.8, Air: 1.2 },
    scorpio: { Fire: 0.9, Water: 1.2, Earth: 1.0, Air: 0.8 },
    sagittarius: { Fire: 1.2, Water: 0.8, Earth: 0.9, Air: 1.0 },
    capricorn: { Fire: 0.8, Water: 1.0, Earth: 1.2, Air: 0.9 },
    aquarius: { Fire: 1.0, Water: 0.9, Earth: 0.8, Air: 1.2 },
    pisces: { Fire: 0.9, Water: 1.2, Earth: 1.0, Air: 0.8 }
  };
  
  return influences[zodiacSign] || { Fire: 1, Water: 1, Earth: 1, Air: 1 };
};

const determineIngredientModality = (
  elementalProps: ElementalProperties,
  qualities: string[]
): Modality => {
  // Simplified modality determination
  const dominant = Object.entries(elementalProps)
    .sort(([,a], [,b]) => b - a)[0][0] as keyof ElementalProperties;
  
  if (dominant === 'Fire' || dominant === 'Air') return 'Cardinal';
  if (dominant === 'Earth') return 'Fixed';
  return 'Mutable';
};

export default function RecipeBuilder() {
  // State Management
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [recipeModality, setRecipeModality] = useState<Modality>('Mutable');
  const [chakraAccess, setChakraAccess] = useState<ChakraEnergyAccess[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [signEnergyStates, setSignEnergyStates] = useState<SignEnergyState[]>([]);
  
  // Elemental calculation state
  const [elements, setElements] = useState<ElementalProperties>(
    createElementalProperties({ Fire: 0, Water: 0, Air: 0, Earth: 0 })
  );
  const [validationError, setValidationError] = useState<string>('');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Time factors integration
  const [timeFactors, setTimeFactors] = useState<TimeFactors | null>(null);

  useEffect(() => {
    const loadTimeFactors = async () => {
      try {
        const factors = await getTimeFactors();
        setTimeFactors(factors);
      } catch (err) {
        // console.error('Failed to load time factors:', err);
      }
    };
    loadTimeFactors();
  }, []);

  const elementLabels: Record<keyof ElementalProperties, string> = {
    Fire: '🔥 Fire',
    Water: '💧 Water',
    Air: '💨 Air',
    Earth: '🌍 Earth'
  };

  // Apply seasonal influence to elemental properties
  const applySeasonalInfluence = useCallback((
    elements: ElementalProperties,
    season: string
  ): ElementalProperties => {
    const seasonLower = season?.toLowerCase();
    const validSeason = ['spring', 'summer', 'autumn', 'winter'].includes(seasonLower) 
      ? seasonLower as keyof typeof SEASONAL_MODIFIERS
      : 'spring' as keyof typeof SEASONAL_MODIFIERS;

    const modifiers = SEASONAL_MODIFIERS[validSeason];

    return {
      Fire: elements.Fire * (1 + (modifiers.Fire || 0)),
      Water: elements.Water * (1 + (modifiers.Water || 0)),
      Earth: elements.Earth * (1 + (modifiers.Earth || 0)),
      Air: elements.Air * (1 + (modifiers.Air || 0))
    };
  }, []);

  // Validate elemental balance
  const validateElementValue = useCallback((element: keyof ElementalProperties, value: number): number => {
    value = Math.max(MIN_ELEMENT_VALUE, Math.min(value, MAX_ELEMENT_VALUE));

    const otherElementsTotal = Object.entries(elements).reduce(
      (sum, [key, val]) => (key !== element ? sum + (val || 0) : sum),
      0
    );

    if (otherElementsTotal + value > MAX_TOTAL) {
      value = MAX_TOTAL - otherElementsTotal;
      setValidationError(`Total cannot exceed ${MAX_TOTAL * 100}%`);
    } else {
      setValidationError('');
    }

    return value;
  }, [elements]);

  // Handle elemental slider changes
  const handleSliderChange = useCallback((element: keyof ElementalProperties, rawValue: number) => {
    const validatedValue = validateElementValue(element, rawValue);

    setElements((prev) => ({
      ...prev,
      [element]: validatedValue
    }));
  }, [validateElementValue]);

  // Get dominant element from elemental properties
  const getDominantElement = useCallback((elements: ElementalProperties): Element => {
    let max = 0;
    let dominant: Element = 'Fire';

    Object.entries(elements || {}).forEach(([element, value]) => {
      if (value > max) {
        max = value;
        dominant = element as Element;
      }
    });

    return dominant;
  }, []);

  // Calculate recipe with elemental and astrological influences
  const calculateRecipe = useCallback(() => {
    const season = getCurrentSeason();
    const currentZodiacSign = getCurrentZodiacSign();

    const seasonalElements = applySeasonalInfluence(elements, _season);
    const astrologicalElements = getZodiacElementalInfluence(currentZodiacSign);

    const finalElements = {
      Fire: seasonalElements.Fire * astrologicalElements.Fire,
      Water: seasonalElements.Water * astrologicalElements.Water,
      Earth: seasonalElements.Earth * astrologicalElements.Earth,
      Air: seasonalElements.Air * astrologicalElements.Air
    };

    const result: CalculationResult = {
      resultingProperties: finalElements,
      energyState: {
        heat: calculateHeat(finalElements),
        entropy: calculateEntropy(finalElements),
        pressure: calculatePressure(finalElements),
        reactivity: calculateReactivity(finalElements)
      },
      stability: calculateStability(finalElements),
      potency: calculatePotency(finalElements),
      dominantElement: getDominantElement(finalElements),
      warnings: generateWarnings(finalElements),
      alchemicalRecommendations: generateAlchemicalRecommendations(finalElements),
      season,
      zodiacSign: currentZodiacSign,
      seasonalModifiers: SEASONAL_MODIFIERS[season?.toLowerCase() as keyof typeof SEASONAL_MODIFIERS],
    };

    setCalculationResult(result);
    return result;
  }, [elements, applySeasonalInfluence, getDominantElement]);

  // Calculate the dominant modality of the recipe based on selected ingredients
  useEffect(() => {
    if (selectedIngredients.length === 0) {
      setRecipeModality('Mutable');
      return;
    }

    const modalityCounts: Record<Modality, number> = {
      Cardinal: 0,
      Fixed: 0,
      Mutable: 0
    };

    selectedIngredients.forEach((ingredient) => {
      const modality = (ingredient.modality ||
        determineIngredientModality(
          ingredient.elementalProperties || createElementalProperties({}),
          ingredient.qualities || []
        )) as Modality;
      modalityCounts[modality]++;
    });

    // Find the dominant modality
    let dominantModality: Modality = 'Mutable';
    let highestCount = 0;

    (Object.entries(modalityCounts) as [Modality, number][]).forEach(([modality, count]) => {
      if (count > highestCount) {
        highestCount = count;
        dominantModality = modality;
      }
    });

    setRecipeModality(dominantModality);
  }, [selectedIngredients]);

  useEffect(() => {
    if (signEnergyStates && signEnergyStates.length > 0) {
      const chakraAccessPoints = mapChakrasToEnergyStates(signEnergyStates);
      setChakraAccess(chakraAccessPoints);
    }
  }, [signEnergyStates]);

  // Map chakras to access the energy states
  const mapChakrasToEnergyStates = (
    energyStates: SignEnergyState[]
  ): ChakraEnergyAccess[] => {
    const chakras: Chakra[] = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    
    return chakras.map(chakra => {
      const influences = energyStates.reduce((acc, state) => {
        acc.Spirit += state.energyValues.Spirit * 0.14;
        acc.Essence += state.energyValues.Essence * 0.14;
        acc.Matter += state.energyValues.Matter * 0.14;
        acc.Substance += state.energyValues.Substance * 0.14;
        return acc;
      }, { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 });

      return {
        chakra,
        spiritInfluence: influences.Spirit,
        essenceInfluence: influences.Essence,
        matterInfluence: influences.Matter,
        substanceInfluence: influences.Substance,
        primaryFoods: getChakraFoodRecommendations(chakra, influences)
      };
    });
  };

  // Get chakra food recommendations
  const getChakraFoodRecommendations = (
    chakra: Chakra,
    energyInfluence: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    }
  ): string[] => {
    const baseFoods: Record<Chakra, string[]> = {
      'Root': ['root vegetables', 'red foods', 'protein'],
      'Sacral': ['orange foods', 'nuts', 'seeds'],
      'Solar Plexus': ['yellow foods', 'grains', 'dairy'],
      'Heart': ['green foods', 'vegetables', 'tea'],
      'Throat': ['blue foods', 'fruits', 'liquids'],
      'Third Eye': ['purple foods', 'dark berries', 'wine'],
      'Crown': ['white foods', 'fasting', 'light foods']
    };

    return baseFoods[chakra] || [];
  };

  const getModalityDescription = (modality: Modality): string => {
    const descriptions = {
      Cardinal: 'Initiating, active, beginning energy',
      Fixed: 'Stable, persistent, maintaining energy',
      Mutable: 'Adaptable, changing, transforming energy'
    };
    return descriptions[modality];
  };

  const enhanceRecipe = (baseRecipe: Recipe): void => {
    if (!baseRecipe) return;

    const enhancedRecipe = {
      ...baseRecipe,
      modality: recipeModality,
      chakraBalance: chakraAccess,
      elementalProperties: elements,
      recommendations: calculationResult?.alchemicalRecommendations || []
    };

    setRecipe(enhancedRecipe);
  };

  // Calculation functions
  const calculateHeat = (elements: ElementalProperties): number => {
    return elements.Fire * 0.8 + elements.Air * 0.2;
  };

  const calculateEntropy = (elements: ElementalProperties): number => {
    return elements.Air * 0.6 + elements.Fire * 0.4;
  };

  const calculatePressure = (elements: ElementalProperties): number => {
    return elements.Earth * 0.7 + elements.Water * 0.3;
  };

  const calculateReactivity = (elements: ElementalProperties): number => {
    return elements.Fire * 0.5 + elements.Air * 0.3 + elements.Water * 0.2;
  };

  const calculateStability = (elements: ElementalProperties): number => {
    return 0.1 + (elements.Earth * 0.7) + (elements.Water * 0.2);
  };

  const calculatePotency = (elements: ElementalProperties): number => {
    return 0.2 + (elements.Fire * 0.5) + (elements.Earth * 0.3);
  };

  const generateWarnings = (elements: ElementalProperties): string[] => {
    const warnings: string[] = [];
    if (elements.Fire > 0.7) warnings.push('High Fire element may cause excessive heat');
    if (elements.Water > 0.7) warnings.push('High Water element may cause excessive moisture');
    if (elements.Air > 0.7) warnings.push('High Air element may cause instability');
    if (elements.Earth > 0.7) warnings.push('High Earth element may cause heaviness');
    return warnings;
  };

  const generateAlchemicalRecommendations = (elements: ElementalProperties): string[] => {
    const recommendations: string[] = [];
    const dominant = getDominantElement(elements);
    recommendations.push(`Focus on ${dominant}-element cooking methods for best results`);
    return recommendations;
  };

  // Handle user interactions
  const handleReset = () => {
    setElements(createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }));
    setValidationError('');
    setCalculationResult(null);
  };

  const handleCalculate = () => {
    calculateRecipe();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Alchemical Recipe Builder
      </Typography>

      {/* Toggle Calculator View */}
      <FormControlLabel
        control={
          <Switch
            checked={showCalculator}
            onChange={(e) => setShowCalculator(e.target.checked)}
          />
        }
        label="Show Advanced Calculator"
        sx={{ mb: 3 }}
      />

      {showCalculator && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Elemental Calculator
            </Typography>
            
            {validationError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {validationError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {Object.entries(elementLabels).map(([element, label]) => (
                <Grid item xs={12} sm={6} key={element}>
                  <Typography gutterBottom>
                    {label}: {Math.round(elements[element as keyof ElementalProperties] * 100)}%
                  </Typography>
                  <Slider
                    value={elements[element as keyof ElementalProperties]}
                    onChange={(_, value) => handleSliderChange(element as keyof ElementalProperties, value as number)}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleCalculate} startIcon={<Calculator />}>
                Calculate Recipe
              </Button>
              <Button variant="outlined" onClick={handleReset} startIcon={<RotateCcw />}>
                Reset
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Calculation Results */}
      {calculationResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Calculation Results
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Resulting Elemental Properties
                </Typography>
                {Object.entries(calculationResult.resultingProperties || {}).map(([element, value]) => (
                  <Box key={element} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {elementLabels[element as keyof ElementalProperties]}: {Math.round((value as number) * 100)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(value as number) * 100} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Energy State
                </Typography>
                {Object.entries(calculationResult.energyState || {}).map(([property, value]) => (
                  <Typography key={property} variant="body2">
                    {property}: {Math.round((value as number) * 100)}%
                  </Typography>
                ))}
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Dominant Element:</strong> {calculationResult.dominantElement}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Season:</strong> {calculationResult.season}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Stability:</strong> {Math.round(calculationResult.stability * 100)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Potency:</strong> {Math.round(calculationResult.potency * 100)}%
                </Typography>
              </Grid>
            </Grid>

            {calculationResult.warnings && calculationResult.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Warnings:</Typography>
                {calculationResult.warnings.map((warning, index) => (
                  <Typography key={index} variant="body2">• {warning}</Typography>
                ))}
              </Alert>
            )}

            {calculationResult.alchemicalRecommendations && calculationResult.alchemicalRecommendations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                {calculationResult.alchemicalRecommendations.map((rec, index) => (
                  <Chip key={index} label={rec} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Ingredients ({selectedIngredients.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Recipe Modality: <strong>{recipeModality}</strong> - {getModalityDescription(recipeModality)}
            </Typography>

            <Grid container spacing={2}>
              {selectedIngredients.map((ingredient, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Chip 
                    label={ingredient.name || `Ingredient ${index + 1}`}
                    onDelete={() => {
                      setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
                    }}
                    sx={{ mb: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Chakra Balance */}
      {chakraAccess.length > 0 && recipe?.chakraBalance && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Chakra Energy Access
            </Typography>
            <Grid container spacing={2}>
              {chakraAccess.map((access, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {access.chakra}
                      </Typography>
                      <Typography variant="body2">
                        Spirit: {Math.round(access.spiritInfluence * 100)}%
                      </Typography>
                      <Typography variant="body2">
                        Essence: {Math.round(access.essenceInfluence * 100)}%
                      </Typography>
                      <Typography variant="body2">
                        Matter: {Math.round(access.matterInfluence * 100)}%
                      </Typography>
                      <Typography variant="body2">
                        Substance: {Math.round(access.substanceInfluence * 100)}%
                      </Typography>
                      
                      {access.primaryFoods.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption">Primary Foods:</Typography>
                          {access.primaryFoods.map((food, foodIndex) => (
                            <Chip 
                              key={foodIndex} 
                              label={food} 
                              size="small" 
                              sx={{ mr: 0.5, mt: 0.5 }} 
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
