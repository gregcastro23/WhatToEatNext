import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Utensils, 
  Calendar, 
  Sun, 
  Moon, 
  Snowflake, 
  Leaf 
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria 
} from '@/data/unified/recipeBuilding';
import type { 
  Season 
} from '@/types/alchemy';

// Services
import { unifiedSeasonalSystem } from '@/data/integrations/seasonal';

interface ContextSelectorProps {
  criteria: Partial<RecipeBuildingCriteria>;
  onUpdate: (updates: Partial<RecipeBuildingCriteria>) => void;
  previewData?: any;
  isGenerating?: boolean;
}

// Meal type options
const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: Sun, time: 'Morning' },
  { id: 'lunch', label: 'Lunch', icon: Sun, time: 'Midday' },
  { id: 'dinner', label: 'Dinner', icon: Moon, time: 'Evening' },
  { id: 'snack', label: 'Snack', icon: Utensils, time: 'Anytime' },
  { id: 'brunch', label: 'Brunch', icon: Sun, time: 'Late Morning' },
  { id: 'dessert', label: 'Dessert', icon: Utensils, time: 'After Meals' }
];

// Season options with visual icons
const SEASONS = [
  { 
    id: 'spring', 
    label: 'Spring', 
    icon: Leaf, 
    color: 'text-green-600',
    description: 'Fresh, light, and awakening'
  },
  { 
    id: 'summer', 
    label: 'Summer', 
    icon: Sun, 
    color: 'text-yellow-600',
    description: 'Vibrant, cooling, and abundant'
  },
  { 
    id: 'autumn', 
    label: 'Autumn', 
    icon: Leaf, 
    color: 'text-orange-600',
    description: 'Grounding, warming, and harvest'
  },
  { 
    id: 'winter', 
    label: 'Winter', 
    icon: Snowflake, 
    color: 'text-blue-600',
    description: 'Nourishing, warming, and preserving'
  }
];

// Serving size options
const SERVING_SIZES = [
  { value: 1, label: '1 person', description: 'Individual portion' },
  { value: 2, label: '2 people', description: 'Intimate meal' },
  { value: 4, label: '4 people', description: 'Family meal' },
  { value: 6, label: '6 people', description: 'Small gathering' },
  { value: 8, label: '8 people', description: 'Dinner party' },
  { value: 12, label: '12+ people', description: 'Large gathering' }
];

// Time constraints
const TIME_CONSTRAINTS = [
  { value: 15, label: '15 minutes', description: 'Quick meal' },
  { value: 30, label: '30 minutes', description: 'Standard prep' },
  { value: 60, label: '1 hour', description: 'Leisurely cooking' },
  { value: 120, label: '2 hours', description: 'Weekend project' },
  { value: 240, label: '4+ hours', description: 'Slow cooking' }
];

export default function ContextSelector({ 
  criteria, 
  onUpdate, 
  previewData, 
  isGenerating 
}: ContextSelectorProps) {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [detectedTime, setDetectedTime] = useState<string>('');

  useEffect(() => {
    // Get current season
    const season = unifiedSeasonalSystem.getCurrentSeason();
    setCurrentSeason(season);
    
    // Auto-detect current time and suggest meal type
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 11) {
      setDetectedTime('breakfast');
    } else if (hour >= 11 && hour < 15) {
      setDetectedTime('lunch');
    } else if (hour >= 15 && hour < 19) {
      setDetectedTime('dinner');
    } else {
      setDetectedTime('snack');
    }
  }, []);

  const handleSeasonChange = (season: Season) => {
    onUpdate({ 
      season,
      currentSeason: season 
    });
  };

  const handleMealTypeChange = (mealType: string) => {
    const currentMealTypes = criteria.mealType || [];
    const isSelected = currentMealTypes.includes(mealType);
    
    if (isSelected) {
      onUpdate({ 
        mealType: currentMealTypes.filter(type => type !== mealType) 
      });
    } else {
      onUpdate({ 
        mealType: [...currentMealTypes, mealType] 
      });
    }
  };

  const handleServingsChange = (servings: number) => {
    onUpdate({ servings });
  };

  const handleTimeConstraint = (maxTime: number) => {
    onUpdate({ 
      maxPrepTime: maxTime,
      maxCookTime: maxTime 
    });
  };

  const handleAutoDetect = () => {
    onUpdate({
      season: currentSeason,
      currentSeason: currentSeason,
      mealType: [detectedTime]
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto-Detection Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">
                Smart Context Detection
              </h3>
              <p className="text-sm text-amber-700">
                Current season: <strong>{currentSeason}</strong> • 
                Suggested meal: <strong>{detectedTime}</strong>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleAutoDetect}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Auto-Fill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Season Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Seasonal Context
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose the season to align with natural energy cycles
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SEASONS.map((season) => {
              const Icon = season.icon;
              const isSelected = criteria.season === season.id;
              const isCurrent = currentSeason === season.id;
              
              return (
                <button
                  key={season.id}
                  onClick={() => handleSeasonChange(season.id as Season)}
                  className={`p-4 rounded-lg border-2 transition-all text-center relative ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500">
                      Current
                    </Badge>
                  )}
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${season.color}`} />
                  <div className="font-medium">{season.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {season.description}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meal Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Meal Type
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select one or more meal types (multiple selections create versatile recipes)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MEAL_TYPES.map((mealType) => {
              const Icon = mealType.icon;
              const isSelected = criteria.mealType?.includes(mealType.id);
              const isRecommended = mealType.id === detectedTime;
              
              return (
                <button
                  key={mealType.id}
                  onClick={() => handleMealTypeChange(mealType.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isRecommended && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500">
                      Now
                    </Badge>
                  )}
                  <Icon className="w-5 h-5 text-gray-600 mb-2" />
                  <div className="font-medium">{mealType.label}</div>
                  <div className="text-xs text-gray-500">{mealType.time}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Serving Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Serving Size
          </CardTitle>
          <p className="text-sm text-gray-600">
            How many people will this recipe serve?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVING_SIZES.map((size) => {
              const isSelected = criteria.servings === size.value;
              
              return (
                <button
                  key={size.value}
                  onClick={() => handleServingsChange(size.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{size.label}</div>
                  <div className="text-xs text-gray-500">{size.description}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Available
          </CardTitle>
          <p className="text-sm text-gray-600">
            How much time do you have for cooking? (Optional)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TIME_CONSTRAINTS.map((constraint) => {
              const isSelected = criteria.maxPrepTime === constraint.value;
              
              return (
                <button
                  key={constraint.value}
                  onClick={() => handleTimeConstraint(constraint.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{constraint.label}</div>
                  <div className="text-xs text-gray-500">{constraint.description}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {(criteria.season || criteria.mealType?.length || criteria.servings) && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Context Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {criteria.season && (
                <div>
                  <div className="font-medium text-gray-700">Season</div>
                  <div className="capitalize">{criteria.season}</div>
                </div>
              )}
              {criteria.mealType?.length && (
                <div>
                  <div className="font-medium text-gray-700">Meal Type</div>
                  <div className="capitalize">{criteria.mealType.join(', ')}</div>
                </div>
              )}
              {criteria.servings && (
                <div>
                  <div className="font-medium text-gray-700">Servings</div>
                  <div>{criteria.servings} people</div>
                </div>
              )}
              {criteria.maxPrepTime && (
                <div>
                  <div className="font-medium text-gray-700">Max Time</div>
                  <div>{criteria.maxPrepTime} minutes</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}