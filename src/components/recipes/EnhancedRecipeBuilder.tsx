// Created: 2025-01-02T23:35:00.000Z
// Enhanced Recipe Builder with ingredient mapping, auto-complete, drag-and-drop, and validation

'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Alert, 
  Chip,
  LinearProgress,
  Switch,
  Tooltip
} from '@mui/material';

// Drag and drop functionality simplified for better compatibility

import { 
  Restaurant as RestaurantIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  LocalDining as DiningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Types and Data
import type { 
  Ingredient, 
  Recipe, 
  ElementalProperties, 
  Season,
  CuisineType,
  DietaryRestriction,
  CookingMethod
} from '@/types/alchemy';

import { useIngredientSearch } from '@/hooks/useIngredientSearch';
import { useRecipeValidation } from '@/hooks/useRecipeValidation';
import { 
  getAllIngredientsByCategory,
  VALID_CATEGORIES,
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains
} from '@/data/ingredients';
import { 
  generateMonicaOptimizedRecipe as _generateMonicaOptimizedRecipe,
  type RecipeBuildingCriteria,
  type MonicaOptimizedRecipe 
} from '@/data/unified/recipeBuilding';
import IngredientsStep from './steps/IngredientsStep';
import BasicInfoStep from './steps/BasicInfoStep';
import LivePreviewSidebar from './steps/LivePreviewSidebar';


import { allOils } from '@/data/ingredients/oils';
import { cuisinesMap } from '@/data/cuisines';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import type { CuisineFlavorProfile } from '@/data/cuisineFlavorProfiles';
import { generateIngredientRecommendations, getSeasonalIngredients } from '@/data/unified/enhancedIngredients';

// Enhanced Recipe Builder Interfaces
interface RecipeBuilderStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

interface SelectedIngredient extends Ingredient {
  quantity: string;
  unit: string;
  notes?: string;
  preparation?: string;
  substitutes?: string[];
  id: string; // For drag-and-drop
}

interface RecipeInstruction {
  id: string;
  step: number;
  instruction: string;
  timing?: string;
  temperature?: string;
  techniques?: string[];
  tips?: string[];
}

interface RecipeBuilderState {
  // Basic Recipe Info
  name: string;
  description: string;
  cuisine: CuisineType | '';
  mealType: string[];
  servings: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Dietary & Preferences
  dietaryRestrictions: DietaryRestriction[];
  allergens: string[];
  season: Season | '';
  
  // Ingredients
  selectedIngredients: SelectedIngredient[];
  
  // Instructions
  instructions: RecipeInstruction[];
  
  // Timing
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes
  
  // Alchemical Properties
  elementalPreference: Partial<ElementalProperties>;
  targetKalchm?: number;
  targetMonica?: number;
  
  // Advanced Options
  cookingMethods: CookingMethod[];
  equipmentNeeded: string[];
  storageInstructions: string;
  nutritionalNotes: string;
  
  // UI State
  activeStep: number;
  showAdvancedOptions: boolean;
  showLivePreview: boolean;
  validationEnabled: boolean;
}

const RECIPE_STEPS: RecipeBuilderStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Recipe name, cuisine, and basic details',
    completed: false,
    optional: false
  },
  {
    id: 'ingredients',
    title: 'Select Ingredients',
    description: 'Choose and organize your ingredients',
    completed: false,
    optional: false
  },
  {
    id: 'instructions',
    title: 'Cooking Instructions',
    description: 'Step-by-step cooking process',
    completed: false,
    optional: false
  },
  {
    id: 'timing-methods',
    title: 'Timing & Methods',
    description: 'Cooking times and techniques',
    completed: false,
    optional: false
  },
  {
    id: 'alchemical',
    title: 'Alchemical Properties',
    description: 'Elemental balance and optimization',
    completed: false,
    optional: true
  },
  {
    id: 'review',
    title: 'Review & Generate',
    description: 'Final review and recipe generation',
    completed: false,
    optional: false
  }
];

const DEFAULT_STATE: RecipeBuilderState = {
  name: '',
  description: '',
  cuisine: '',
  mealType: [],
  servings: 4,
  difficulty: 'intermediate',
  dietaryRestrictions: [],
  allergens: [],
  season: '',
  selectedIngredients: [],
  instructions: [],
  prepTime: 15,
  cookTime: 30,
  totalTime: 45,
  elementalPreference: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  cookingMethods: [],
  equipmentNeeded: [],
  storageInstructions: '',
  nutritionalNotes: '',
  activeStep: 0,
  showAdvancedOptions: false,
  showLivePreview: true,
  validationEnabled: true
};

export default function EnhancedRecipeBuilder() {
  // State Management
  const [state, setState] = useState<RecipeBuilderState>(DEFAULT_STATE);
  const [generatedRecipe, setGeneratedRecipe] = useState<MonicaOptimizedRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<RecipeBuilderStep[]>(RECIPE_STEPS);
  
  // Hooks
  const ingredientSearchHook = useIngredientSearch() as Record<string, unknown>;
  const searchIngredients = ingredientSearchHook?.searchIngredients;
  const searchResults = ingredientSearchHook?.searchResults;
  const isSearching = ingredientSearchHook?.isSearching;
  const clearSearch = ingredientSearchHook?.clearSearch as Record<string, unknown>;
  
  const recipeValidationHook = useRecipeValidation() as Record<string, unknown>;
  const validateRecipe = recipeValidationHook?.validateRecipe as Record<string, unknown>;
  const validationResult = recipeValidationHook?.validationResult;
  const isValidating = recipeValidationHook?.isValidating;

  // Computed Properties
  const currentStep = useMemo(() => steps[state.activeStep], [steps, state.activeStep]);
  const canProceed = useMemo(() => {
    if (!state.validationEnabled) return true;
    const validationRecord = validationResult as Record<string, unknown>;
    return validationRecord?.isValid ?? true;
  }, [state.validationEnabled, validationResult]);

  const totalIngredients = state.selectedIngredients.length;
  const totalInstructions = state.instructions.length;
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Ingredient Search & Selection
  const handleIngredientSearch = useCallback((searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      if (clearSearch) clearSearch();
      return;
    }
    
    if (searchIngredients) {
      (searchIngredients as Record<string, unknown>)(searchTerm, {
        maxResults: 20,
        elementalPreference: state.elementalPreference,
        season: state.season || undefined,
        dietary: state.dietaryRestrictions
      });
    }
  }, [searchIngredients, clearSearch, state.elementalPreference, state.season, state.dietaryRestrictions]);

  const handleIngredientSelect = useCallback((ingredient: Ingredient) => {
    // Smart quantity and unit defaults based on ingredient type using category functions
    let defaultQuantity = '1';
    let defaultUnit = 'cup';
    
    const ingName = ingredient.name.toLowerCase();
    if (getAllSpices().some(spice => spice.name.toLowerCase() === ingName)) {
      defaultQuantity = '1';
      defaultUnit = 'tsp';
    } else if (getAllHerbs().some(herb => herb.name.toLowerCase() === ingName)) {
      defaultQuantity = '2';
      defaultUnit = 'tbsp';
    } else if (getAllProteins().some(protein => protein.name.toLowerCase() === ingName)) {
      defaultQuantity = '1';
      defaultUnit = 'lb';
    } else if (getAllVegetables().some(veg => veg.name.toLowerCase() === ingName)) {
      defaultQuantity = '2';
      defaultUnit = 'cups';
    } else if (getAllGrains().some(grain => grain.name.toLowerCase() === ingName)) {
      defaultQuantity = '1';
      defaultUnit = 'cup';
    } else if (allOils.some(oil => oil.name.toLowerCase() === ingName)) {
      defaultQuantity = '2';
      defaultUnit = 'tbsp';
    }
    
    const selectedIngredient: SelectedIngredient = {
      ...ingredient,
      quantity: defaultQuantity,
      unit: defaultUnit,
      id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      preparation: getIngredientPreparationSuggestion(ingredient),
      substitutes: getIngredientSubstitutes(ingredient, state.dietaryRestrictions)
    };
    
    setState(prev => ({
      ...prev,
      selectedIngredients: [...prev.selectedIngredients, selectedIngredient]
    }));
    
    if (clearSearch) clearSearch();
  }, [clearSearch]);

  const handleIngredientRemove = useCallback((ingredientId: string) => {
    setState(prev => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.filter(ing => ing.id !== ingredientId)
    }));
  }, []);

  const handleIngredientUpdate = useCallback((ingredientId: string, updates: Partial<SelectedIngredient>) => {
    setState(prev => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.map(ing => 
        ing.id === ingredientId ? { ...ing, ...updates } : ing
      )
    }));
  }, []);

  // Advanced ingredient category suggestions using getAllIngredientsByCategory
  const getSuggestedIngredientsByCategory = useCallback((category: string) => {
    if (!VALID_CATEGORIES.includes(category)) return [];
    try {
      const categoryIngredients = getAllIngredientsByCategory(category);
      return categoryIngredients.filter(ingredient => 
        !state.selectedIngredients.some(selected => selected.name === ingredient.name)
      ).slice(0, 8); // Limit to 8 suggestions per category
    } catch (error) {
      console.warn(`Error getting ingredients for category ${category}:`, error);
      return [];
    }
  }, [state.selectedIngredients]);

  // Smart ingredient recommendations using generateIngredientRecommendations
  const getSmartIngredientRecommendations = useCallback(() => {
    const recommendations: Ingredient[] = [];
    
    if (state.selectedIngredients.length > 0) {
      try {
        const contextualRecommendations = generateIngredientRecommendations({
          existingIngredients: state.selectedIngredients.map(ing => ing.name),
          cuisine: state.cuisine || undefined,
          season: state.season || undefined,
          dietaryRestrictions: state.dietaryRestrictions,
          elementalBalance: state.elementalPreference
        });
        recommendations.push(...contextualRecommendations.slice(0, 6));
      } catch (error) {
        console.warn('Error generating contextual recommendations:', error);
      }
    }
    
    // Add seasonal ingredients using getSeasonalIngredients
    if (state.season && recommendations.length < 10) {
      try {
        const seasonalIngredients = getSeasonalIngredients(state.season)
          .filter(seasonal => !state.selectedIngredients.some(selected => 
            selected.name === seasonal.name
          ))
          .slice(0, 4);
        recommendations.push(...seasonalIngredients);
      } catch (error) {
        console.warn('Error getting seasonal ingredients:', error);
      }
    }
    
    return recommendations;
  }, [state.selectedIngredients, state.cuisine, state.season, state.dietaryRestrictions, state.elementalPreference]);

  // Category-specific ingredient suggestions using imported functions
  const getProteinSuggestions = useCallback(() => {
    return getAllProteins().filter(protein => 
      !state.selectedIngredients.some(selected => selected.name === protein.name)
    ).slice(0, 6);
  }, [state.selectedIngredients]);

  const getVegetableSuggestions = useCallback(() => {
    return getAllVegetables().filter(vegetable => 
      !state.selectedIngredients.some(selected => selected.name === vegetable.name)
    ).slice(0, 8);
  }, [state.selectedIngredients]);

  const getHerbSpiceSuggestions = useCallback(() => {
    const herbs = getAllHerbs().slice(0, 4);
    const spices = getAllSpices().slice(0, 4);
    return [...herbs, ...spices].filter(item => 
      !state.selectedIngredients.some(selected => selected.name === item.name)
    );
  }, [state.selectedIngredients]);

  const getGrainSuggestions = useCallback(() => {
    return getAllGrains().filter(grain => 
      !state.selectedIngredients.some(selected => selected.name === grain.name)
    ).slice(0, 5);
  }, [state.selectedIngredients]);

  const getOilSuggestions = useCallback(() => {
    return allOils.filter(oil => 
      !state.selectedIngredients.some(selected => selected.name === oil.name)
    ).slice(0, 4);
  }, [state.selectedIngredients]);

  // Smart preparation suggestions based on ingredient type
  const getIngredientPreparationSuggestion = useCallback((ingredient: Ingredient): string => {
    const ingName = ingredient.name.toLowerCase();
    
    if (getAllVegetables().some(veg => veg.name.toLowerCase() === ingName)) {
      if (ingName.includes('onion')) return 'diced';
      if (ingName.includes('garlic')) return 'minced';
      if (ingName.includes('carrot')) return 'chopped';
      if (ingName.includes('pepper')) return 'sliced';
      return 'chopped';
    } else if (getAllHerbs().some(herb => herb.name.toLowerCase() === ingName)) {
      return 'chopped fresh';
    } else if (getAllProteins().some(protein => protein.name.toLowerCase() === ingName)) {
      if (ingName.includes('chicken')) return 'cut into pieces';
      if (ingName.includes('beef')) return 'cubed';
      if (ingName.includes('fish')) return 'filleted';
      return 'prepared';
    }
    return '';
  }, []);

  // Smart ingredient substitutes based on dietary restrictions
  const getIngredientSubstitutes = useCallback((ingredient: Ingredient, restrictions: DietaryRestriction[]): string[] => {
    const substitutes: string[] = [];
    const ingName = ingredient.name.toLowerCase();
    
    if (restrictions.includes('vegan')) {
      if (ingName.includes('butter')) substitutes.push('vegan butter', 'coconut oil');
      if (ingName.includes('milk')) substitutes.push('oat milk', 'almond milk');
      if (ingName.includes('cheese')) substitutes.push('nutritional yeast', 'cashew cheese');
      if (ingName.includes('egg')) substitutes.push('flax egg', 'aquafaba');
      if (getAllProteins().some(p => p.name.toLowerCase() === ingName)) {
        substitutes.push('tofu', 'tempeh', 'seitan');
      }
    }
    
    if (restrictions.includes('gluten-free')) {
      if (ingName.includes('flour')) substitutes.push('almond flour', 'rice flour');
      if (ingName.includes('bread')) substitutes.push('gluten-free bread');
      if (getAllGrains().some(g => g.name.toLowerCase() === ingName && ingName.includes('wheat'))) {
        substitutes.push('quinoa', 'rice', 'millet');
      }
    }
    
    return substitutes;
  }, []);

  // Reorder ingredients (simplified drag and drop)
  const handleIngredientDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    const items = Array.from(state.selectedIngredients);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    
    setState(prev => ({
      ...prev,
      selectedIngredients: items
    }));
  }, [state.selectedIngredients]);

  // Instructions Management
  const handleInstructionAdd = useCallback(() => {
    const newInstruction: RecipeInstruction = {
      id: `instruction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      step: state.instructions.length + 1,
      instruction: '',
      timing: '',
      temperature: '',
      techniques: [],
      tips: []
    };
    
    setState(prev => ({
      ...prev,
      instructions: [...prev.instructions, newInstruction]
    }));
  }, [state.instructions.length]);

  const handleInstructionUpdate = useCallback((instructionId: string, updates: Partial<RecipeInstruction>) => {
    setState(prev => ({
      ...prev,
      instructions: prev.instructions.map(inst => 
        inst.id === instructionId ? { ...inst, ...updates } : inst
      )
    }));
  }, []);

  const handleInstructionRemove = useCallback((instructionId: string) => {
    setState(prev => ({
      ...prev,
      instructions: prev.instructions.filter(inst => inst.id !== instructionId)
        .map((inst, index) => ({ ...inst, step: index + 1 }))
    }));
  }, []);

  // Reorder instructions (simplified drag and drop)
  const handleInstructionDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    const items = Array.from(state.instructions);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    
    // Update step numbers
    const reorderedItems = items.map((item, index) => ({
      ...item,
      step: index + 1
    }));
    
    setState(prev => ({
      ...prev,
      instructions: reorderedItems
    }));
  }, [state.instructions]);

  // Step Navigation
  const handleStepChange = useCallback((newStep: number) => {
    if (newStep >= 0 && newStep < steps.length) {
      setState(prev => ({ ...prev, activeStep: newStep }));
    }
  }, [steps.length]);

  const handleStepComplete = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  }, []);

  const handleNext = useCallback(() => {
    if (state.activeStep < steps.length - 1) {
      handleStepComplete(currentStep.id);
      handleStepChange(state.activeStep + 1);
    }
  }, [state.activeStep, steps.length, currentStep.id, handleStepComplete, handleStepChange]);

  const handleBack = useCallback(() => {
    if (state.activeStep > 0) {
      handleStepChange(state.activeStep - 1);
    }
  }, [state.activeStep, handleStepChange]);

  // Recipe Generation
  const handleGenerateRecipe = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      const criteria: RecipeBuildingCriteria = {
        cuisine: state.cuisine || undefined,
        season: state.season || undefined,
        mealType: state.mealType,
        servings: state.servings,
        dietaryRestrictions: state.dietaryRestrictions,
        targetKalchm: state.targetKalchm,
        targetMonica: state.targetMonica,
        elementalPreference: state.elementalPreference,
        cookingMethods: state.cookingMethods as Record<string, unknown>,
        maxPrepTime: state.prepTime,
        maxCookTime: state.cookTime,
        requiredIngredients: state.selectedIngredients.map(ing => ing.name),
        skillLevel: state.difficulty
      };
      
      // Use the imported _generateMonicaOptimizedRecipe for sophisticated recipe generation
      const result = _generateMonicaOptimizedRecipe(criteria);
      setGeneratedRecipe(result.recipe);
      
      // Apply cuisine-specific enhancements if cuisine is selected
      if (state.cuisine && cuisinesMap.has(state.cuisine)) {
        const cuisineData = cuisinesMap.get(state.cuisine);
        if (cuisineData && result.recipe) {
          // Enhance recipe with cuisine-specific flavor profiles
          const flavorProfile = cuisineFlavorProfiles[state.cuisine as keyof typeof cuisineFlavorProfiles] as CuisineFlavorProfile;
          if (flavorProfile) {
            const existingDescription = result.recipe.description || '';
            result.recipe.description = `${existingDescription} This ${state.cuisine} recipe features ${flavorProfile.primaryFlavors?.join(', ')} with ${flavorProfile.cookingTechniques?.join(' and ')} techniques.`;
            
            // Add cuisine-specific cooking tips if available
            if (flavorProfile.tips && result.recipe.instructions) {
              result.recipe.instructions.push(`Chef's Tip: ${flavorProfile.tips[0]}`);
            }
          }
        }
      }
      
      // Mark final step as complete
      handleStepComplete('review');
      
    } catch (error) {
      console.error('Recipe generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [state, handleStepComplete]);

  // Validation
  useEffect(() => {
    if (state.validationEnabled && state.selectedIngredients.length > 0) {
      const mockRecipe: Partial<Recipe> = {
        name: state.name,
        ingredients: state.selectedIngredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })) as Record<string, unknown>,
        instructions: state.instructions.map(inst => inst.instruction),
        elementalProperties: state.elementalPreference as ElementalProperties
      };
      
      if (validateRecipe) validateRecipe(mockRecipe as Recipe);
    }
  }, [state, validateRecipe]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      localStorage.setItem('recipeBuilder_draft', JSON.stringify(state));
    }, 2000);
    
    return () => clearTimeout(autoSave);
  }, [state]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('recipeBuilder_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setState(prev => ({ ...prev, ...parsedDraft }));
      } catch (error) {
        console.warn('Failed to load draft:', error);
      }
    }
  }, []);

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'basic-info':
        return (
          <BasicInfoStep 
            state={state} 
            setState={setState}
            onComplete={() => handleStepComplete('basic-info')}
          />
        );
      
      case 'ingredients':
        return (
          <IngredientsStep 
            state={state}
            setState={setState}
            searchResults={searchResults as Record<string, unknown>}
            isSearching={isSearching as boolean}
            onSearch={handleIngredientSearch}
            onSelect={handleIngredientSelect}
            onRemove={handleIngredientRemove}
            onUpdate={handleIngredientUpdate}
            onDragEnd={handleIngredientDragEnd}
            onComplete={() => handleStepComplete('ingredients')}
          />
        );
      
      case 'instructions':
        return (
          <InstructionsStep 
            state={state}
            setState={setState}
            onAdd={handleInstructionAdd}
            onUpdate={handleInstructionUpdate}
            onRemove={handleInstructionRemove}
            onDragEnd={handleInstructionDragEnd}
            onComplete={() => handleStepComplete('instructions')}
          />
        );
      
      case 'timing-methods':
        return (
          <TimingMethodsStep 
            state={state}
            setState={setState}
            onComplete={() => handleStepComplete('timing-methods')}
          />
        );
      
      case 'alchemical':
        return (
          <AlchemicalStep 
            state={state}
            setState={setState}
            onComplete={() => handleStepComplete('alchemical')}
          />
        );
      
      case 'review':
        return (
          <ReviewStep 
            state={state}
            generatedRecipe={generatedRecipe}
            isGenerating={isGenerating}
            onGenerate={handleGenerateRecipe}
            onComplete={() => handleStepComplete('review')}
          />
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Enhanced Recipe Builder
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Toggle Advanced Options">
                <Switch
                  checked={state.showAdvancedOptions}
                  onChange={(e) => setState(prev => ({ ...prev, showAdvancedOptions: e.target.checked }))}
                />
              </Tooltip>
              <Tooltip title="Toggle Live Preview">
                <Switch
                  checked={state.showLivePreview}
                  onChange={(e) => setState(prev => ({ ...prev, showLivePreview: e.target.checked }))}
                />
              </Tooltip>
              <Tooltip title="Toggle Validation">
                <Switch
                  checked={state.validationEnabled}
                  onChange={(e) => setState(prev => ({ ...prev, validationEnabled: e.target.checked }))}
                />
              </Tooltip>
            </Box>
          </Box>
          
          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progress: {completedSteps}/{steps.length} steps completed ({Math.round(progressPercentage)}%)
            </Typography>
            <LinearProgress variant="determinate" value={progressPercentage} />
          </Box>
          
          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<RestaurantIcon />} 
              label={`${totalIngredients} ingredients`} 
              variant="outlined" 
            />
            <Chip 
              icon={<DiningIcon />} 
              label={`${totalInstructions} steps`} 
              variant="outlined" 
            />
            <Chip 
              icon={<TimerIcon />} 
              label={`${state.totalTime} min total`} 
              variant="outlined" 
            />
            <Chip 
              icon={<PeopleIcon />} 
              label={`${state.servings} servings`} 
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={state.showLivePreview ? 8 : 12}>
          <Card>
            <CardContent>
              {/* Step Navigation */}
              <Stepper activeStep={state.activeStep} orientation="horizontal" sx={{ mb: 3 }}>
                {steps.map((step, index) => (
                  <Step key={step.id} completed={step.completed}>
                    <StepLabel 
                      optional={step.optional ? <Typography variant="caption">Optional</Typography> : null}
                      onClick={() => handleStepChange(index)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {step.title}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Validation Alerts */}
              {state.validationEnabled && validationResult && (() => {
                const validationRecord = validationResult as Record<string, unknown>;
                const errors = validationRecord?.errors as unknown[] || [];
                const warnings = validationRecord?.warnings as unknown[] || [];
                const suggestions = validationRecord?.suggestions as unknown[] || [];
                
                return (
                  <Box sx={{ mb: 3 }}>
                    {errors.length > 0 && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">Errors:</Typography>
                        {errors.map((error, index) => {
                          const errorRecord = error as Record<string, unknown>;
                          return (
                            <Typography key={index} variant="body2">• {errorRecord?.message}</Typography>
                          );
                        })}
                      </Alert>
                    )}
                    
                    {warnings.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">Warnings:</Typography>
                        {warnings.map((warning, index) => {
                          const warningRecord = warning as Record<string, unknown>;
                          return (
                            <Typography key={index} variant="body2">• {warningRecord?.message}</Typography>
                          );
                        })}
                      </Alert>
                    )}
                    
                    {suggestions.length > 0 && (
                      <Alert severity="info" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">Suggestions:</Typography>
                        {suggestions.map((suggestion, index) => {
                          const suggestionRecord = suggestion as Record<string, unknown>;
                          return (
                            <Typography key={index} variant="body2">• {suggestionRecord?.message}</Typography>
                          );
                        })}
                      </Alert>
                    )}
                  </Box>
                );
              })()}

              {/* Step Content */}
              <Box sx={{ minHeight: '400px' }}>
                {renderStepContent()}
              </Box>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  onClick={handleBack} 
                  disabled={state.activeStep === 0}
                  variant="outlined"
                >
                  Back
                </Button>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {state.activeStep === steps.length - 1 ? (
                    <Button 
                      onClick={handleGenerateRecipe}
                      disabled={!canProceed || isGenerating}
                      variant="contained"
                      color="primary"
                      startIcon={isGenerating ? <RefreshIcon /> : <RestaurantIcon />}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Recipe'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      disabled={!canProceed}
                      variant="contained"
                      color="primary"
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview Sidebar */}
        {state.showLivePreview && (
          <Grid item xs={12} md={4}>
            <LivePreviewSidebar 
              state={state}
              validationResult={validationResult as Record<string, unknown>}
              generatedRecipe={generatedRecipe}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

// Step Components will be defined in separate files for better organization
// For now, we'll create placeholder components

// BasicInfoStep component is now imported from separate file

// IngredientsStep component is now imported from separate file

const InstructionsStep = ({ state, setState, onAdd, onUpdate, onRemove, onDragEnd, onComplete }: any) => (
  <div>Instructions Step - To be implemented</div>
);

const TimingMethodsStep = ({ state, setState, onComplete }: any) => (
  <div>Timing Methods Step - To be implemented</div>
);

const AlchemicalStep = ({ state, setState, onComplete }: any) => (
  <div>Alchemical Step - To be implemented</div>
);

const ReviewStep = ({ state, generatedRecipe, isGenerating, onGenerate, onComplete }: any) => (
  <div>Review Step - To be implemented</div>
);

// LivePreviewSidebar component is now imported from separate file 