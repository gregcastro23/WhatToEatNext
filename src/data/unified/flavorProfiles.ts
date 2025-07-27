import type { // ===== UNIFIED FLAVOR PROFILE SYSTEM =====
// Phase 4 of WhatToEatNext Data Consolidation
// Consolidates flavor profiles from multiple sources with elemental self-reinforcement principles

  Season, 
  Element, 
  ElementalProperties, 
  ZodiacSign, 
  PlanetName,
  CookingMethod,
  AlchemicalValues,
  ThermodynamicProperties } from "@/types/alchemy";

import { createElementalProperties, calculateElementalCompatibility } from '../../utils/elemental/elementalUtils';

import { unifiedCuisineIntegrationSystem } from './cuisineIntegrations';
import { unifiedSeasonalSystem } from './seasonal';





// ===== UNIFIED FLAVOR PROFILE INTERFACES =====

/**
 * Core flavor components on a 0-1 scale
 */
export interface BaseFlavorNotes {
  sweet: number;
  sour: number;
  salty: number;
  bitter: number;
  umami: number;
  spicy: number;
}

/**
 * Describes how flavors are modified by various conditions
 */
export interface FlavorModification {
  intensityMultiplier: number;
  complexityBonus: number;
  harmonicResonance: number;
  temperatureOptimal: number;
}

/**
 * Planetary influence on flavor profiles
 */
export interface PlanetaryFlavorInfluence {
  influence: number;
  flavorModification: FlavorModification;
  seasonalVariation: Record<Season, number>;
  monicaOptimization: number;
  optimalTiming: {
    planetaryHour: boolean;
    dayOfWeek: number;
    lunarPhases: string[];
  };
}

/**
 * Compatibility of a flavor with a specific cuisine
 */
export interface CuisineFlavorCompatibility {
  compatibility: number;
  traditionalUse: boolean;
  modernAdaptations: string[];
  kalchmHarmony: number;
  culturalSignificance: string;
  preparationMethods: string[];
}

/**
 * Comprehensive unified flavor profile
 */
export interface UnifiedFlavorProfile {
  // Core identity
  id: string;
  name: string;
  description: string;
  category: 'cuisine' | 'planetary' | 'ingredient' | 'elemental' | 'fusion';
  
  // Base flavor components
  baseNotes: BaseFlavorNotes;
  
  // Elemental properties (self-reinforcement compliant)
  elementalFlavors: ElementalProperties;
  
  // Planetary influences
  planetaryResonance: Record<PlanetName, PlanetaryFlavorInfluence>;
  
  // Cuisine compatibility
  cuisineCompatibility: { [key: string]: CuisineFlavorCompatibility };
  
  // Alchemical properties
  alchemicalProperties: AlchemicalValues;
  
  // Kalchm value
  kalchm: number;
  
  // Enhanced metadata
  intensity: number;
  complexity: number;
  seasonalPeak: Season[];
  culturalOrigins: string[];
  nutritionalSynergy: number;
  
  // Integration properties
  cookingMethodAffinity: Record<string, number>;
  temperatureRange: { min: number; max: number };
  pairingRecommendations: string[];
  avoidCombinations: string[];
  
  // Dynamic properties
  monicaOptimization: number;
  seasonalModifiers: Record<Season, number>;
}

/**
 * Result of calculating compatibility between flavor profiles
 */
export interface FlavorCompatibilityResult {
  compatibility: number;
  elementalHarmony: number;
  kalchmResonance: number;
  monicaOptimization: number;
  seasonalAlignment: number;
  recommendations: string[];
  warnings: string[];
}

/**
 * Criteria for searching and filtering flavor profiles
 */
export interface FlavorCriteria {
  elementalFocus?: Element;
  intensityRange?: { min: number; max: number };
  complexityRange?: { min: number; max: number };
  seasonalAlignment?: Season;
  cuisineStyle?: string;
  planetaryInfluence?: PlanetName;
  kalchmRange?: { min: number; max: number };
  avoidElements?: Element[];
  culturalPreference?: string[];
}

/**
 * Group of flavor profile recommendations
 */
export interface FlavorRecommendations {
  primary: UnifiedFlavorProfile[];
  complementary: UnifiedFlavorProfile[];
  seasonal: UnifiedFlavorProfile[];
  fusion: UnifiedFlavorProfile[];
  monicaOptimized: UnifiedFlavorProfile[];
  kalchmBalanced: UnifiedFlavorProfile[];
}

/**
 * Environmental conditions that affect flavor optimization
 */
export interface SystemConditions {
  season: Season;
  planetaryHour: PlanetName;
  temperature: number;
  lunarPhase: string;
  gregsEnergy: number;
  reactivity: number;
  kalchm: number;
}

/**
 * Type guard to check if an object is a valid UnifiedFlavorProfile
 */
export function isUnifiedFlavorProfile(obj: unknown): obj is UnifiedFlavorProfile {
  if (!obj || typeof obj !== 'object') return false;
  
  const profile = obj as Partial<UnifiedFlavorProfile>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.description === 'string' &&
    profile.baseNotes !== undefined &&
    profile.elementalFlavors !== undefined &&
    typeof profile.kalchm === 'number'
  );
}

/**
 * Create a default BaseFlavorNotes object
 */
export function createBaseFlavorNotes(props?: Partial<BaseFlavorNotes>): BaseFlavorNotes {
  return {
    sweet: (props?.sweet ?? 0),
    sour: (props?.sour ?? 0),
    salty: (props?.salty ?? 0),
    bitter: (props?.bitter ?? 0),
    umami: (props?.umami ?? 0),
    spicy: (props?.spicy ?? 0)
  };
}

// ===== UNIFIED FLAVOR PROFILE SYSTEM =====

export class UnifiedFlavorProfileSystem {
  private flavorProfiles: { [key: string]: UnifiedFlavorProfile } = {};
  private seasonalSystem: typeof unifiedSeasonalSystem;
  private cuisineSystem: typeof unifiedCuisineIntegrationSystem;
  
  constructor() {
    this.flavorProfiles = this.initializeFlavorProfiles();
    this.seasonalSystem = unifiedSeasonalSystem;
    this.cuisineSystem = unifiedCuisineIntegrationSystem;
  }
  
  /**
   * Get a flavor profile by its identifier and optional type
   */
  getFlavorProfile(identifier: string, type?: 'cuisine' | 'planetary' | 'ingredient' | 'elemental'): UnifiedFlavorProfile | undefined {
    // Direct lookup first
    if (this.flavorProfiles[identifier]) {
      return this.flavorProfiles[identifier];
    }
    
    // Try case-insensitive lookup
    const normalizedId = identifier.toLowerCase();
    const profile = Object.values(this.flavorProfiles).find(
      p => p.id.toLowerCase() === normalizedId || p.name.toLowerCase() === normalizedId
    );
    
    // If type is specified, ensure the profile matches the type
    if (profile && type && profile.category !== type) {
      return undefined;
    }
    
    return profile;
  }
  
  /**
   * Get all flavor profiles of a specific category
   */
  getFlavorProfilesByCategory(category: 'cuisine' | 'planetary' | 'ingredient' | 'elemental' | 'fusion'): UnifiedFlavorProfile[] {
    return Object.values(this.flavorProfiles || {}).filter(profile => profile.category === category
    );
  }
  
  /**
   * Calculate compatibility between two flavor profiles
   */
  calculateFlavorCompatibility(profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile): FlavorCompatibilityResult {
    // Calculate elemental harmony using our self-reinforcement principles
    const elementalHarmony = calculateElementalCompatibility(
      profile1.elementalFlavors, 
      profile2.elementalFlavors
    );
    
    // Calculate Kalchm resonance
    const kalchmDiff = Math.abs(profile1.kalchm - profile2.kalchm);
    const maxKalchm = Math.max(profile1.kalchm, profile2.kalchm, 1);
    const kalchmResonance = 1 - (kalchmDiff / maxKalchm);
    
    // Calculate Monica optimization
    const monicaOptimization = (profile1.monicaOptimization + profile2.monicaOptimization) / 2;
    
    // Calculate seasonal alignment
    const seasonalOverlap = (profile1.seasonalPeak || []).filter(season => (Array.isArray(profile2.seasonalPeak) ? profile2.seasonalPeak.includes(season) : profile2.seasonalPeak === season)
    ).length;
    const seasonalAlignment = Number(seasonalOverlap) > 0 
      ? Number(seasonalOverlap) / Math.max(Number((profile1.seasonalPeak  || []).length), Number((profile2.seasonalPeak  || []).length))
      : 0.5; // Default moderate alignment if no overlap
    
    // Calculate overall compatibility with weighted factors
    const compatibility = (
      elementalHarmony * 0.4 +
      kalchmResonance * 0.3 +
      monicaOptimization * 0.15 +
      seasonalAlignment * 0.15
    );
    
    // Generate recommendations and warnings
    const recommendations: string[] = [];
    const warnings: string[] = [];
    
    if (elementalHarmony > 0.8) {
      recommendations.push(`Strong elemental harmony between ${profile1.name} and ${profile2.name}`);
    }
    
    if (kalchmResonance > 0.8) {
      recommendations.push(`Excellent Kalchm resonance creates balanced flavor energy`);
    }
    
    if (seasonalAlignment < 0.3) {
      warnings.push(`Limited seasonal alignment may affect availability`);
    }
    
    // Return the comprehensive compatibility result
    return {
      compatibility,
      elementalHarmony,
      kalchmResonance,
      monicaOptimization,
      seasonalAlignment,
      recommendations,
      warnings
    };
  }
  
  /**
   * Initialize the flavor profiles from source data
   */
  private initializeFlavorProfiles(): { [key: string]: UnifiedFlavorProfile } {
    // This would normally load from source data, but for now we'll return an empty object
    // In a full implementation, this would load and transform data from various sources
    return {};
  }
}

// ===== INITIALIZE SYSTEM =====

export const unifiedFlavorProfileSystem = new UnifiedFlavorProfileSystem();

// ===== EXPORT INTERFACE =====

/**
 * Get a flavor profile by its identifier
 */
export const getFlavorProfile = (id: string, type?: 'cuisine' | 'planetary' | 'ingredient' | 'elemental'): UnifiedFlavorProfile | undefined => 
  unifiedFlavorProfileSystem.getFlavorProfile(id, type);

/**
 * Get all flavor profiles of a specific category
 */
export const getFlavorProfilesByCategory = (category: 'cuisine' | 'planetary' | 'ingredient' | 'elemental' | 'fusion'): UnifiedFlavorProfile[] => 
  unifiedFlavorProfileSystem.getFlavorProfilesByCategory(category);

/**
 * Calculate compatibility between two flavor profiles
 */
export const calculateFlavorCompatibility = (profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile): FlavorCompatibilityResult => 
  unifiedFlavorProfileSystem.calculateFlavorCompatibility(profile1, profile2);

export default unifiedFlavorProfileSystem; 