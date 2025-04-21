/**
 * User profile type definitions for the application
 */

import { ElementalProperties } from '../alchemy';
import { ZodiacSign } from '../astrology';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  name: string;
  birthDate: string; // ISO date string format
  birthTime?: string; // Optional birth time in HH:MM format
  birthLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  preferences?: {
    dietaryRestrictions: DietaryRestriction[];
    favoriteCuisines: string[];
    dislikedIngredients: string[];
    favoriteRecipes: string[];
    cookingMethods: CookingMethod[];
    mealPreferences: MealPreference[];
  };
  nutritionalGoals?: {
    caloriesPerDay?: number;
    proteinPercentage?: number;
    carbsPercentage?: number;
    fatPercentage?: number;
    waterIntakeTarget?: number; // in ml
  };
  astrological?: {
    zodiacSign?: ZodiacSign;
    risingSign?: ZodiacSign;
    moonSign?: ZodiacSign;
    dominantPlanet?: string;
    ascendantDegree?: number;
  };
  tarotProfile?: {
    birthCard?: string;
    birthDecanCard?: string; // Minor arcana card for birth decan
    chartRulerCard?: string; // Major arcana card for chart ruler
    currentCard?: string;
    lastReadingDate?: string;
  };
  chakraEnergies?: {
    root?: number; // 0-100 scale
    sacral?: number;
    solarPlexus?: number;
    heart?: number;
    throat?: number;
    thirdEye?: number;
    crown?: number;
  };
  elementalBalance?: ElementalProperties;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dietary restrictions a user might have
 */
export type DietaryRestriction = 
  | 'vegetarian' 
  | 'vegan' 
  | 'glutenFree' 
  | 'dairyFree' 
  | 'nutFree'
  | 'shellfishFree' 
  | 'kosher' 
  | 'halal';

/**
 * Cooking methods a user might prefer
 */
export type CookingMethod =
  | 'baking'
  | 'grilling'
  | 'airFrying'
  | 'steaming'
  | 'roasting'
  | 'stirFrying'
  | 'slowCooking'
  | 'pressureCooking';

/**
 * Meal preferences a user might have
 */
export type MealPreference =
  | 'quickMeals'
  | 'mealPrep'
  | 'foodVariety'
  | 'comfortFood'
  | 'healthyOptions'
  | 'localIngredients'
  | 'seasonal';

/**
 * UserBirthInfo contains the minimum required information needed
 * to calculate astrological profiles
 */
export interface UserBirthInfo {
  birthDate: string; // ISO date format
  birthTime?: string; // HH:MM format, optional
  birthLocation?: {
    latitude: number;
    longitude: number;
  };
} 