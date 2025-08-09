// src/components/recipes/RecipeCard.tsx

'use client';

import { Clock, Users, ChefHat, Star, Heart, Flame, Droplets, Mountain, Wind } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Element } from '@/types/alchemy';
import type { ExtendedRecipe } from '@/types/ExtendedRecipe';
import type { TimeFactors } from '@/types/time';
import { logger } from '@/utils/logger';
import { getTimeFactors } from '@/utils/time';

import styles from './RecipeCard.module.css';

type ViewOption = 'grid' | 'list' | 'compact';
type ElementalFilter = 'Fire' | 'Water' | 'Earth' | 'Air' | 'none';

interface RecipeCardProps {
  recipe: ExtendedRecipe;
  viewMode: ViewOption;
  elementalHighlight: ElementalFilter;
  matchPercentage: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  viewMode,
  elementalHighlight,
  matchPercentage,
  isFavorite = false,
  onToggleFavorite,
  isExpanded = false,
  onToggleExpanded,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [servings, setServings] = useState<number>(
    typeof recipe.numberOfServings === 'number'
      ? recipe.numberOfServings
      : typeof recipe.servings === 'number'
        ? recipe.servings
        : 2,
  );
  const [timeFactors, setTimeFactors] = useState<TimeFactors | null>(null);

  useEffect(() => {
    const loadTimeFactors = async () => {
      try {
        const factors = await getTimeFactors();
        // ✅ Pattern MM-1: Type assertion to match TimeFactors interface
        setTimeFactors(factors as unknown as TimeFactors);
      } catch (err) {
        logger.error('Error loading time factors:', err);
      }
    };

    void loadTimeFactors();
  }, []);

  // Check planetary day influence
  const planetaryDayInfluence = useMemo(() => {
    if (!recipe.planetaryInfluences || !timeFactors?.planetaryDay) return null;

    const { favorable, unfavorable } = recipe.planetaryInfluences;
    const planet = timeFactors.planetaryDay.planet;

    const isFavorable = Array.isArray(favorable)
      ? favorable.includes(planet)
      : favorable === planet;
    const isUnfavorable = Array.isArray(unfavorable)
      ? unfavorable.includes(planet)
      : unfavorable === planet;

    return {
      planet,
      day: timeFactors.planetaryDay.day,
      isFavorable,
      isUnfavorable,
    };
  }, [recipe.planetaryInfluences, timeFactors?.planetaryDay]);

  // Check planetary hour influence
  const planetaryHourInfluence = useMemo(() => {
    if (!recipe.planetaryInfluences || !timeFactors?.planetaryHour) return null;

    const { favorable, unfavorable } = recipe.planetaryInfluences;
    const planet = timeFactors.planetaryHour.planet;

    const isFavorable = Array.isArray(favorable)
      ? favorable.includes(planet)
      : favorable === planet;
    const isUnfavorable = Array.isArray(unfavorable)
      ? unfavorable.includes(planet)
      : unfavorable === planet;

    return {
      planet,
      hourOfDay: timeFactors.planetaryHour.hourOfDay,
      isFavorable,
      isUnfavorable,
    };
  }, [recipe.planetaryInfluences, timeFactors?.planetaryHour]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      setIsLoading(true);

      if (onToggleFavorite) {
        onToggleFavorite();
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustServings = (newServings: number) => {
    if (newServings < 1 || newServings > 12) return;
    setServings(newServings);
  };

  const calculateAdjustedAmount = (amount: number) => {
    const numberOfServings =
      typeof recipe.numberOfServings === 'number'
        ? recipe.numberOfServings
        : typeof recipe.servings === 'number'
          ? recipe.servings
          : 2;
    const ratio = servings / numberOfServings;
    return (amount * ratio).toFixed(1).replace(/\.0$/, '');
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return Flame;
      case 'Water':
        return Droplets;
      case 'Earth':
        return Mountain;
      case 'Air':
        return Wind;
      default:
        return Flame;
    }
  };

  const getElementColor = (element: string): string => {
    switch (element) {
      case 'Fire':
        return 'text-red-500';
      case 'Water':
        return 'text-blue-500';
      case 'Earth':
        return 'text-green-500';
      case 'Air':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderElementalState = () => {
    if (!recipe.elementalState) return null;

    const elements = Object.entries(recipe.elementalState);
    return (
      <div className='mt-4 flex flex-wrap gap-2'>
        {elements.map(([element, value]) => {
          const isHighlighted = elementalHighlight === element;
          const IconComponent = getElementIcon(element);

          return (
            <div
              key={element}
              className={`flex items-center rounded-full px-3 py-1 transition-colors ${
                isHighlighted ? 'border-2 border-blue-300 bg-blue-100' : 'bg-gray-100'
              }`}
              title={`${element}: ${((Number(value) || 0) * 100).toFixed(0)}%`}
            >
              <IconComponent className={`mr-2 h-3 w-3 ${getElementColor(element)}`} />
              <span className='text-sm font-medium'>{element}</span>
              <span className='ml-1 text-xs text-gray-500'>
                {((Number(value) || 0) * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDietaryBadges = () => {
    const badges: { label: string; color: string }[] = [];
    if (recipe.isVegetarian)
      badges.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-800' });
    if (recipe.isVegan) badges.push({ label: 'Vegan', color: 'bg-green-100 text-green-800' });
    if (recipe.isGlutenFree)
      badges.push({ label: 'Gluten-Free', color: 'bg-blue-100 text-blue-800' });
    if (recipe.isDairyFree)
      badges.push({ label: 'Dairy-Free', color: 'bg-purple-100 text-purple-800' });

    return badges.map(badge => (
      <Badge key={badge.label} variant='outline' className={badge.color}>
        {badge.label}
      </Badge>
    ));
  };

  const renderRating = () => {
    if (!recipe.rating) return null;

    return (
      <div className='flex items-center gap-1'>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < (typeof recipe.rating === 'number' ? recipe.rating : 0)
                ? 'fill-current text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className='ml-1 text-sm text-gray-600'>
          ({typeof recipe.rating === 'number' ? recipe.rating : 0})
        </span>
      </div>
    );
  };

  const renderSpiceLevel = () => {
    if (!recipe.spiceLevel) return null;

    if (typeof recipe.spiceLevel === 'number') {
      return (
        <div className='flex items-center gap-1'>
          <span className='text-sm text-gray-600'>Spice:</span>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < (Number(recipe.spiceLevel) || 0) ? 'text-red-500' : 'text-gray-300'}`}
            >
              🌶️
            </span>
          ))}
        </div>
      );
    }

    return (
      <Badge variant='outline' className='bg-red-100 text-red-800'>
        {recipe.spiceLevel}
      </Badge>
    );
  };

  const cardClassName = `${styles.recipeCard || ''} ${isExpanded ? styles.expanded || '' : ''} transition-all duration-300`;

  return (
    <Card className={cardClassName}>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <CardTitle className='line-clamp-2 text-lg font-semibold'>{recipe.name}</CardTitle>
          <div className='flex items-center gap-2'>
            <Badge
              variant='secondary'
              className={` ${
                matchPercentage > 70
                  ? 'bg-green-100 text-green-800'
                  : matchPercentage > 40
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              } `}
            >
              {matchPercentage}% Match
            </Badge>
            {onToggleFavorite && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className={`p-2 ${isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        {recipe.description && (
          <p className='line-clamp-2 text-sm text-gray-600'>{recipe.description}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className='space-y-3'>
          {/* Basic Info */}
          <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
            <div className='flex items-center'>
              <Clock className='mr-1 h-4 w-4' />
              <span>{recipe.timeToMake}</span>
            </div>
            <div className='flex items-center'>
              <Users className='mr-1 h-4 w-4' />
              <span>{servings} servings</span>
            </div>
            <div className='flex items-center'>
              <ChefHat className='mr-1 h-4 w-4' />
              <span>{typeof recipe.cuisine === 'string' ? recipe.cuisine : 'Unknown'}</span>
            </div>
            {Boolean(recipe.difficulty) && (
              <div className='flex items-center'>
                <span className='text-sm text-gray-600'>
                  Difficulty:{' '}
                  {typeof recipe.difficulty === 'number' ? recipe.difficulty : 'Unknown'}/5
                </span>
              </div>
            )}
          </div>

          {/* Rating and Spice Level */}
          <div className='flex items-center gap-4'>
            {renderRating()}
            {renderSpiceLevel()}
          </div>

          {/* Dietary Badges */}
          <div className='flex flex-wrap gap-2'>{renderDietaryBadges()}</div>

          {/* Elemental State */}
          {renderElementalState()}

          {/* Planetary Influences */}
          {(planetaryDayInfluence || planetaryHourInfluence) && (
            <div className='rounded-lg bg-gray-50 p-3'>
              <h4 className='mb-2 text-sm font-medium'>Astrological Timing</h4>
              {planetaryDayInfluence && (
                <div
                  className={`rounded p-2 text-xs ${
                    planetaryDayInfluence.isFavorable
                      ? 'bg-green-100 text-green-800'
                      : planetaryDayInfluence.isUnfavorable
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Day of {planetaryDayInfluence.planet}:{' '}
                  {planetaryDayInfluence.isFavorable
                    ? 'Favorable'
                    : planetaryDayInfluence.isUnfavorable
                      ? 'Challenging'
                      : 'Neutral'}
                </div>
              )}
              {planetaryHourInfluence && (
                <div
                  className={`mt-1 rounded p-2 text-xs ${
                    planetaryHourInfluence.isFavorable
                      ? 'bg-green-100 text-green-800'
                      : planetaryHourInfluence.isUnfavorable
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Hour of {planetaryHourInfluence.planet}:{' '}
                  {planetaryHourInfluence.isFavorable
                    ? 'Favorable'
                    : planetaryHourInfluence.isUnfavorable
                      ? 'Challenging'
                      : 'Neutral'}
                </div>
              )}
            </div>
          )}

          {/* Expandable Content */}
          {isExpanded && (
            <div className='space-y-3 border-t pt-3'>
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div>
                  <h4 className='mb-2 text-sm font-medium'>
                    Ingredients (for {servings} servings):
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    {recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx}>
                        {typeof ingredient === 'string'
                          ? ingredient
                          : `${calculateAdjustedAmount(ingredient.amount)} ${ingredient.unit} ${ingredient.name}`}
                      </li>
                    ))}
                  </ul>

                  {/* Serving Size Adjuster */}
                  <div className='mt-2 flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>Adjust servings:</span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => adjustServings(servings - 1)}
                      disabled={servings <= 1}
                    >
                      -
                    </Button>
                    <span className='px-2 text-sm font-medium'>{servings}</span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => adjustServings(servings + 1)}
                      disabled={servings >= 12}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {recipe.instructions && recipe.instructions.length > 0 && (
                <div>
                  <h4 className='mb-2 text-sm font-medium'>Instructions:</h4>
                  <ol className='list-inside list-decimal space-y-1 text-sm'>
                    {recipe.instructions.slice(0, 3).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                    {recipe.instructions.length > 3 && (
                      <li className='text-gray-500'>
                        +{recipe.instructions.length - 3} more steps
                      </li>
                    )}
                  </ol>
                </div>
              )}

              {/* Nutrition */}
              {recipe.nutrition && (
                <div>
                  <h4 className='mb-2 text-sm font-medium'>Nutrition (per serving):</h4>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    {recipe.nutrition.calories && (
                      <span>
                        Calories:{' '}
                        {Math.round(
                          (recipe.nutrition.calories * servings) /
                            (typeof recipe.numberOfServings === 'number'
                              ? recipe.numberOfServings
                              : servings),
                        )}
                      </span>
                    )}

                    {/* Apply safe type casting for macronutrients access */}
                    {(() => {
                      const nutritionData = recipe.nutrition as any;
                      const protein =
                        nutritionData?.protein || nutritionData?.macronutrients?.protein;
                      const carbs = nutritionData?.carbs || nutritionData?.macronutrients?.carbs;
                      const fat = nutritionData?.fat || nutritionData?.macronutrients?.fat;

                      return (
                        <>
                          {protein && (
                            <span>
                              Protein:{' '}
                              {(
                                (protein * servings) /
                                (typeof recipe.numberOfServings === 'number'
                                  ? recipe.numberOfServings
                                  : servings)
                              ).toFixed(1)}
                              g
                            </span>
                          )}
                          {carbs && (
                            <span>
                              Carbs:{' '}
                              {(
                                (carbs * servings) /
                                (typeof recipe.numberOfServings === 'number'
                                  ? recipe.numberOfServings
                                  : servings)
                              ).toFixed(1)}
                              g
                            </span>
                          )}
                          {fat && (
                            <span>
                              Fat:{' '}
                              {(
                                (fat * servings) /
                                (typeof recipe.numberOfServings === 'number'
                                  ? recipe.numberOfServings
                                  : servings)
                              ).toFixed(1)}
                              g
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expand/Collapse Button */}
          {onToggleExpanded && (
            <Button variant='ghost' size='sm' onClick={onToggleExpanded} className='mt-3 w-full'>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
