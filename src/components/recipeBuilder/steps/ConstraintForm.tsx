import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  Plus, 
  X, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria 
} from '@/data/unified/recipeBuilding';

interface ConstraintFormProps {
  criteria: Partial<RecipeBuildingCriteria>;
  onUpdate: (updates: Partial<RecipeBuildingCriteria>) => void;
  previewData?: any;
  isGenerating?: boolean;
}

// Dietary restrictions
const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🌱', description: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', icon: '🌿', description: 'No animal products' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾', description: 'No wheat, barley, rye' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛', description: 'No milk products' },
  { id: 'keto', label: 'Keto', icon: '🥑', description: 'Very low carb, high fat' },
  { id: 'paleo', label: 'Paleo', icon: '🦴', description: 'Whole foods, no processed' },
  { id: 'low-sodium', label: 'Low Sodium', icon: '🧂', description: 'Reduced salt content' },
  { id: 'low-sugar', label: 'Low Sugar', icon: '🍯', description: 'Minimal added sugars' }
];

// Common allergens
const ALLERGENS = [
  { id: 'nuts', label: 'Tree Nuts', severity: 'high' },
  { id: 'peanuts', label: 'Peanuts', severity: 'high' },
  { id: 'shellfish', label: 'Shellfish', severity: 'high' },
  { id: 'fish', label: 'Fish', severity: 'medium' },
  { id: 'eggs', label: 'Eggs', severity: 'medium' },
  { id: 'soy', label: 'Soy', severity: 'medium' },
  { id: 'sesame', label: 'Sesame', severity: 'low' }
];

// Skill levels
const SKILL_LEVELS = [
  { 
    id: 'beginner', 
    label: 'Beginner', 
    description: 'Simple techniques, basic equipment',
    maxTime: 30,
    techniques: ['Boiling', 'Steaming', 'Simple sautéing']
  },
  { 
    id: 'intermediate', 
    label: 'Intermediate', 
    description: 'Multiple techniques, moderate complexity',
    maxTime: 60,
    techniques: ['Roasting', 'Braising', 'Sauce making']
  },
  { 
    id: 'advanced', 
    label: 'Advanced', 
    description: 'Complex techniques, professional methods',
    maxTime: 120,
    techniques: ['Sous vide', 'Fermentation', 'Advanced pastry']
  },
  { 
    id: 'expert', 
    label: 'Expert', 
    description: 'Master-level techniques, unlimited time',
    maxTime: 240,
    techniques: ['Molecular gastronomy', 'Multi-day preparations']
  }
];

export default function ConstraintForm({ 
  criteria, 
  onUpdate, 
  previewData, 
  isGenerating 
}: ConstraintFormProps) {
  
  const [customIngredient, setCustomIngredient] = useState('');
  const [customAllergen, setCustomAllergen] = useState('');

  // Handle dietary restrictions
  const toggleDietaryRestriction = useCallback((restriction: string) => {
    const current = criteria.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    
    onUpdate({ dietaryRestrictions: updated });
  }, [criteria.dietaryRestrictions, onUpdate]);

  // Handle allergens
  const toggleAllergen = useCallback((allergen: string) => {
    const current = criteria.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
    
    onUpdate({ allergens: updated });
  }, [criteria.allergens, onUpdate]);

  // Handle skill level
  const setSkillLevel = useCallback((level: string) => {
    const skillData = SKILL_LEVELS.find(s => s.id === level);
    onUpdate({ 
      skillLevel: level as any,
      maxCookTime: skillData?.maxTime 
    });
  }, [onUpdate]);

  // Handle required ingredients
  const addRequiredIngredient = useCallback((ingredient: string) => {
    if (!ingredient.trim()) return;
    
    const current = criteria.requiredIngredients || [];
    if (!current.includes(ingredient)) {
      onUpdate({ requiredIngredients: [...current, ingredient] });
    }
    setCustomIngredient('');
  }, [criteria.requiredIngredients, onUpdate]);

  const removeRequiredIngredient = useCallback((ingredient: string) => {
    const current = criteria.requiredIngredients || [];
    onUpdate({ requiredIngredients: current.filter(i => i !== ingredient) });
  }, [criteria.requiredIngredients, onUpdate]);

  // Handle excluded ingredients
  const addExcludedIngredient = useCallback((ingredient: string) => {
    if (!ingredient.trim()) return;
    
    const current = criteria.excludedIngredients || [];
    if (!current.includes(ingredient)) {
      onUpdate({ excludedIngredients: [...current, ingredient] });
    }
  }, [criteria.excludedIngredients, onUpdate]);

  const removeExcludedIngredient = useCallback((ingredient: string) => {
    const current = criteria.excludedIngredients || [];
    onUpdate({ excludedIngredients: current.filter(i => i !== ingredient) });
  }, [criteria.excludedIngredients, onUpdate]);

  const currentSkill = SKILL_LEVELS.find(s => s.id === criteria.skillLevel);

  return (
    <div className="space-y-6">
      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Dietary Restrictions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select any dietary requirements or preferences
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIETARY_RESTRICTIONS.map((restriction) => {
              const isSelected = criteria.dietaryRestrictions?.includes(restriction.id);
              
              return (
                <button
                  key={restriction.id}
                  onClick={() => toggleDietaryRestriction(restriction.id)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{restriction.icon}</span>
                    <span className="font-medium text-sm">{restriction.label}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                  </div>
                  <div className="text-xs text-gray-600">{restriction.description}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Allergens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Allergen Restrictions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select allergens to avoid (recipes will exclude these completely)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALLERGENS.map((allergen) => {
              const isSelected = criteria.allergens?.includes(allergen.id);
              const severityColor = {
                high: 'border-red-500 bg-red-50',
                medium: 'border-yellow-500 bg-yellow-50',
                low: 'border-blue-500 bg-blue-50'
              }[allergen.severity];
              
              return (
                <button
                  key={allergen.id}
                  onClick={() => toggleAllergen(allergen.id)}
                  className={`p-3 text-center border-2 rounded-lg transition-all ${
                    isSelected ? severityColor : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{allergen.label}</div>
                  {isSelected && <X className="w-4 h-4 text-red-600 mx-auto mt-1" />}
                </button>
              );
            })}
          </div>
          
          {/* Custom allergen input */}
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom allergen..."
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    toggleAllergen(customAllergen);
                    setCustomAllergen('');
                  }
                }}
              />
              <Button 
                onClick={() => {
                  toggleAllergen(customAllergen);
                  setCustomAllergen('');
                }}
                disabled={!customAllergen.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cooking Skill Level
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose your comfort level with cooking techniques
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SKILL_LEVELS.map((level) => {
              const isSelected = criteria.skillLevel === level.id;
              
              return (
                <button
                  key={level.id}
                  onClick={() => setSkillLevel(level.id)}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-2">{level.label}</div>
                  <div className="text-sm text-gray-600 mb-3">{level.description}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Up to {level.maxTime} minutes
                    </div>
                    <div className="text-xs text-gray-500">
                      Techniques: {level.techniques.slice(0, 2).join(', ')}
                      {level.techniques.length > 2 && '...'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {currentSkill && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-900">Selected: {currentSkill.label}</div>
              <div className="text-sm text-blue-700 mt-1">
                Available techniques: {currentSkill.techniques.join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Required Ingredients
          </CardTitle>
          <p className="text-sm text-gray-600">
            Ingredients that must be included in the recipe
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add required ingredient..."
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addRequiredIngredient(customIngredient);
                }
              }}
            />
            <Button 
              onClick={() => addRequiredIngredient(customIngredient)}
              disabled={!customIngredient.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {criteria.requiredIngredients?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {criteria.requiredIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                  onClick={() => removeRequiredIngredient(ingredient)}
                >
                  {ingredient}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excluded Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-600" />
            Excluded Ingredients
          </CardTitle>
          <p className="text-sm text-gray-600">
            Ingredients to avoid in the recipe
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add ingredient to exclude..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addExcludedIngredient(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button 
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                addExcludedIngredient(input.value);
                input.value = '';
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {criteria.excludedIngredients?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {criteria.excludedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer"
                  onClick={() => removeExcludedIngredient(ingredient)}
                >
                  {ingredient}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {(criteria.dietaryRestrictions?.length || criteria.allergens?.length || criteria.skillLevel) && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Constraint Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {criteria.dietaryRestrictions?.length > 0 && (
                <div>
                  <div className="font-medium text-gray-700">Dietary</div>
                  <div>{criteria.dietaryRestrictions.length} restrictions</div>
                </div>
              )}
              {criteria.allergens?.length > 0 && (
                <div>
                  <div className="font-medium text-gray-700">Allergens</div>
                  <div>{criteria.allergens.length} to avoid</div>
                </div>
              )}
              {criteria.skillLevel && (
                <div>
                  <div className="font-medium text-gray-700">Skill Level</div>
                  <div className="capitalize">{criteria.skillLevel}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}