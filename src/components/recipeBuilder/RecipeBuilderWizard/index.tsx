import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChefHat, 
  Sparkles, 
  Wand2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Clock,
  Users,
  Target,
  Star
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria, 
  RecipeGenerationResult, 
  MonicaOptimizedRecipe 
} from '@/data/unified/recipeBuilding';
import type { 
  ElementalProperties, 
  Season, 
  ZodiacSign, 
  PlanetName, 
  LunarPhase 
} from '@/types/alchemy';

// Backend Services
import { 
  unifiedRecipeBuildingSystem, 
  generateMonicaOptimizedRecipe 
} from '@/data/unified/recipeBuilding';
import { unifiedSeasonalSystem } from '@/data/integrations/seasonal';
import { unifiedIngredients } from '@/data/unified/ingredients';

// Step Components
import ContextSelector from '../steps/ContextSelector';
import ElementalBalanceWheel from '../controls/ElementalBalanceWheel';
import PreferenceMatrix from '../steps/PreferenceMatrix';
import ConstraintForm from '../steps/ConstraintForm';
import AdvancedTuning from '../steps/AdvancedTuning';
import LivePreview from '../preview/LivePreview';
import RecipeDisplay from '../results/RecipeDisplay';

// State Management
interface RecipeBuilderState {
  currentStep: number;
  criteria: Partial<RecipeBuildingCriteria>;
  generatedRecipe?: RecipeGenerationResult;
  previewData?: PreviewData;
  isGenerating: boolean;
  errors: string[];
  hasChanges: boolean;
}

interface PreviewData {
  confidence: number;
  ingredientSuggestions: string[];
  methodSuggestions: string[];
  estimatedTime: string;
  kalchmRange: [number, number];
  monicaTarget: number;
}

// Wizard Steps Configuration
const WIZARD_STEPS = [
  {
    id: 'context',
    title: 'Context & Timing',
    description: 'Set the foundation for your recipe',
    icon: Clock,
    component: ContextSelector
  },
  {
    id: 'elements',
    title: 'Elemental Balance',
    description: 'Fine-tune the four elements',
    icon: Sparkles,
    component: ElementalBalanceWheel
  },
  {
    id: 'preferences',
    title: 'Culinary Preferences',
    description: 'Choose cuisines and flavors',
    icon: Target,
    component: PreferenceMatrix
  },
  {
    id: 'constraints',
    title: 'Dietary Constraints',
    description: 'Set restrictions and requirements',
    icon: Users,
    component: ConstraintForm
  },
  {
    id: 'advanced',
    title: 'Advanced Tuning',
    description: 'Monica & Kalchm optimization',
    icon: Wand2,
    component: AdvancedTuning
  },
  {
    id: 'results',
    title: 'Generated Recipe',
    description: 'Your alchemical creation',
    icon: Star,
    component: RecipeDisplay
  }
];

export default function RecipeBuilderWizard() {
  // State management
  const [state, setState] = useState<RecipeBuilderState>({
    currentStep: 0,
    criteria: {
      // Default values
      season: unifiedSeasonalSystem.getCurrentSeason(),
      servings: 4,
      skillLevel: 'intermediate',
      targetMonica: 1.0,
      targetKalchm: 1.5,
      kalchmTolerance: 0.3,
      elementalPreference: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    },
    isGenerating: false,
    errors: [],
    hasChanges: false
  });

  // Memoized current step info
  const currentStepInfo = useMemo(() => 
    WIZARD_STEPS[state.currentStep], [state.currentStep]
  );

  // Debounced preview generation
  const generatePreview = useCallback(async (criteria: Partial<RecipeBuildingCriteria>) => {
    if (!isValidCriteria(criteria)) return;
    
    try {
      // Calculate generation confidence
      const confidence = calculateGenerationConfidence(criteria);
      
      // Get ingredient suggestions based on criteria
      const ingredientSuggestions = getIngredientSuggestions(criteria);
      
      // Get cooking method suggestions
      const methodSuggestions = getCookingMethodSuggestions(criteria);
      
      // Estimate cooking time
      const estimatedTime = estimateRecipeTime(criteria);
      
      // Calculate Kalchm range
      const kalchmRange = calculateKalchmRange(criteria);
      
      // Get Monica target
      const monicaTarget = criteria.targetMonica || 1.0;
      
      const previewData: PreviewData = {
        confidence,
        ingredientSuggestions,
        methodSuggestions,
        estimatedTime,
        kalchmRange,
        monicaTarget
      };
      
      setState(prev => ({ ...prev, previewData }));
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  }, []);

  // Debounced effect for preview updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview(state.criteria);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [state.criteria, generatePreview]);

  // Update criteria
  const updateCriteria = useCallback((updates: Partial<RecipeBuildingCriteria>) => {
    setState(prev => ({
      ...prev,
      criteria: { ...prev.criteria, ...updates },
      hasChanges: true
    }));
  }, []);

  // Generate final recipe
  const generateRecipe = useCallback(async () => {
    if (!isValidCriteria(state.criteria)) {
      setState(prev => ({ 
        ...prev, 
        errors: ['Please complete all required fields before generating recipe'] 
      }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, errors: [] }));

    try {
      const result = await generateMonicaOptimizedRecipe(state.criteria as RecipeBuildingCriteria);
      
      setState(prev => ({
        ...prev,
        generatedRecipe: result,
        isGenerating: false,
        currentStep: WIZARD_STEPS.length - 1, // Go to results step
        hasChanges: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        errors: [`Recipe generation failed: ${error.message}`]
      }));
    }
  }, [state.criteria]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setState({
      currentStep: 0,
      criteria: {
        season: unifiedSeasonalSystem.getCurrentSeason(),
        servings: 4,
        skillLevel: 'intermediate',
        targetMonica: 1.0,
        targetKalchm: 1.5,
        kalchmTolerance: 0.3,
        elementalPreference: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
      },
      isGenerating: false,
      errors: [],
      hasChanges: false
    });
  }, []);

  // Navigation
  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < WIZARD_STEPS.length - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  // Determine if we can proceed to next step
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 0: // Context
        return state.criteria.season && state.criteria.servings;
      case 1: // Elements
        return state.criteria.elementalPreference;
      case 2: // Preferences
        return true; // Optional step
      case 3: // Constraints
        return true; // Optional step
      case 4: // Advanced
        return state.criteria.targetMonica && state.criteria.targetKalchm;
      default:
        return true;
    }
  }, [state.currentStep, state.criteria]);

  // Render current step component
  const renderCurrentStep = () => {
    const StepComponent = currentStepInfo.component;
    
    const commonProps = {
      criteria: state.criteria,
      onUpdate: updateCriteria,
      previewData: state.previewData,
      isGenerating: state.isGenerating
    };

    switch (state.currentStep) {
      case 0:
        return <ContextSelector {...commonProps} />;
      case 1:
        return <ElementalBalanceWheel {...commonProps} />;
      case 2:
        return <PreferenceMatrix {...commonProps} />;
      case 3:
        return <ConstraintForm {...commonProps} />;
      case 4:
        return <AdvancedTuning {...commonProps} />;
      case 5:
        return <RecipeDisplay recipe={state.generatedRecipe} onRegenerate={generateRecipe} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="w-8 h-8 text-amber-600" />
          <h1 className="text-4xl font-bold text-amber-900">
            Alchemical Recipe Builder
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Craft culinary masterpieces through the ancient art of alchemical cooking, 
          harmonizing the four elements with cosmic timing and personal preferences.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Step {state.currentStep + 1} of {WIZARD_STEPS.length}
            </h3>
            <Badge variant={state.hasChanges ? "default" : "secondary"}>
              {state.hasChanges ? "Modified" : "Saved"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === state.currentStep;
              const isCompleted = index < state.currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    isActive 
                      ? 'text-amber-600 scale-110' 
                      : isCompleted 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                  }`}
                  onClick={() => goToStep(index)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive 
                      ? 'bg-amber-100 border-2 border-amber-600' 
                      : isCompleted 
                        ? 'bg-green-100 border-2 border-green-600' 
                        : 'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-center font-medium">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentStepInfo.icon className="w-5 h-5" />
                {currentStepInfo.title}
              </CardTitle>
              <p className="text-gray-600">{currentStepInfo.description}</p>
            </CardHeader>
            <CardContent>
              {state.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {state.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1">
          <LivePreview 
            criteria={state.criteria}
            previewData={state.previewData}
            isGenerating={state.isGenerating}
            onGenerate={generateRecipe}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={state.currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                onClick={resetWizard}
                disabled={state.isGenerating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex gap-2">
              {state.currentStep < WIZARD_STEPS.length - 2 && (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {state.currentStep === WIZARD_STEPS.length - 2 && (
                <Button
                  onClick={generateRecipe}
                  disabled={!canProceed || state.isGenerating}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {state.isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Recipe
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function isValidCriteria(criteria: Partial<RecipeBuildingCriteria>): boolean {
  return !!(criteria.season && criteria.servings);
}

function calculateGenerationConfidence(criteria: Partial<RecipeBuildingCriteria>): number {
  let confidence = 0.5;
  
  if (criteria.season) confidence += 0.1;
  if (criteria.cuisine) confidence += 0.1;
  if (criteria.elementalPreference) confidence += 0.1;
  if (criteria.targetMonica) confidence += 0.1;
  if (criteria.targetKalchm) confidence += 0.1;
  if (criteria.mealType?.length) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function getIngredientSuggestions(criteria: Partial<RecipeBuildingCriteria>): string[] {
  const suggestions = [];
  
  if (criteria.elementalPreference) {
    const dominantElement = Object.entries(criteria.elementalPreference)
      .sort(([,a], [,b]) => b - a)[0][0];
    suggestions.push(`${dominantElement}-dominant ingredients`);
  }
  
  if (criteria.season) {
    suggestions.push(`Seasonal ${criteria.season} ingredients`);
  }
  
  return suggestions.slice(0, 5);
}

function getCookingMethodSuggestions(criteria: Partial<RecipeBuildingCriteria>): string[] {
  const suggestions = [];
  
  if (criteria.targetMonica && criteria.targetMonica > 1.2) {
    suggestions.push('High-precision cooking methods');
  }
  
  if (criteria.skillLevel) {
    suggestions.push(`${criteria.skillLevel}-level techniques`);
  }
  
  return suggestions.slice(0, 3);
}

function estimateRecipeTime(criteria: Partial<RecipeBuildingCriteria>): string {
  let baseTime = 30;
  
  if (criteria.skillLevel === 'advanced') baseTime += 15;
  if (criteria.skillLevel === 'beginner') baseTime -= 10;
  
  return `${baseTime}-${baseTime + 20} minutes`;
}

function calculateKalchmRange(criteria: Partial<RecipeBuildingCriteria>): [number, number] {
  const target = criteria.targetKalchm || 1.5;
  const tolerance = criteria.kalchmTolerance || 0.3;
  
  return [target - tolerance, target + tolerance];
}