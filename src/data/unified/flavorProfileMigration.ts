// Import needed from ./unifiedFlavorEngine.ts

// Import needed from ./flavorProfiles.ts
import type { ElementalProperties, AlchemicalProperties, AlchemicalValues, Season, PlanetName } from "@/types/alchemy";
import type { CookingMethod } from "@/types/constants";
import { cuisineFlavorProfiles } from '../cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '../planetaryFlavorProfiles';
import { flavorProfiles as integrationFlavorProfiles } from '../integrations/flavorProfiles';
// ingredientFlavorMap import disabled - not exported
// import { ingredientFlavorMap } from '../ingredients/flavorProfiles';
import { Element } from "@/types/alchemy";

// Missing unified system type imports
import type { 
  UnifiedFlavorProfile, 
  BaseFlavorNotes
} from '@/types';

// Import local types (not available in main types)
type PlanetaryFlavorInfluence = any;
type CuisineFlavorCompatibility = any;

// Missing unified data imports
import { unifiedFlavorProfiles } from './data/unifiedFlavorProfiles';
import { getLatestAstrologicalState } from '@/services/AstrologicalService';
import { getCurrentElementalState } from '@/utils/elementalUtils';


// ===== FLAVOR PROFILE MIGRATION UTILITY - PHASE 4 =====
// Consolidates all existing flavor profile data into the unified system
// Preserves backward compatibility while enabling new features

// Import existing systems

// ===== MIGRATION INTERFACES =====

interface MigrationStats {
  totalProfiles: number;
  byCategory: { [key: string]: number };
  migrationTime: number;
  errors: string[];
  warnings: string[];
}

interface LegacyProfile {
  id?: string;
  name?: string;
  [key: string]: any;
}

// Singleton management
let _migrationInstance: FlavorProfileMigration | null = null;
let _cachedProfiles: Map<string, UnifiedFlavorProfile> = new Map();
let _cachedMigrationStats: MigrationStats | null = null;
let _isMigrationRunning = false;
let _isMigrationCompleted = false;

// ===== MIGRATION CLASS =====

export class FlavorProfileMigration {
  private migratedProfiles: Map<string, UnifiedFlavorProfile> = new Map();
  private migrationErrors: string[] = [];
  private migrationWarnings: string[] = [];

  constructor() {
    // Return existing instance if available
    if (_migrationInstance) {
      return _migrationInstance;
    }
    
    // Set this as the singleton instance
    _migrationInstance = this;
    
    // Use cached profiles if migration already completed
    if (_isMigrationCompleted && _cachedProfiles.size > 0) {
      this.migratedProfiles = new Map(_cachedProfiles);
    }
  }

  /**
   * Main migration function - consolidates all existing flavor profile systems
   */
  public async migrateAllSystems(): Promise<MigrationStats> {
    // If migration already completed, return cached stats
    if (_isMigrationCompleted && _cachedMigrationStats) {
      return { ..._cachedMigrationStats };
    }
    
    // If migration is currently running, wait for it to complete
    if (_isMigrationRunning) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!_isMigrationRunning && _cachedMigrationStats) {
            clearInterval(checkInterval);
            resolve({ ..._cachedMigrationStats });
          }
        }, 100);
      });
    }
    
    // Set flag to indicate migration is running
    _isMigrationRunning = true;
    
    const startTime = Date.now();
    
    console.log('🔄 Starting Phase 4 flavor profile migration...');

    try {
      // 1. Migrate unified flavor profiles (main system)
      await this.migrateUnifiedFlavorProfiles();
      
      // 2. Migrate cuisine flavor profiles
      await this.migrateCuisineFlavorProfiles();
      
      // 3. Migrate planetary flavor profiles
      await this.migratePlanetaryFlavorProfiles();
      
      // 4. Migrate integration flavor profiles
      await this.migrateIntegrationFlavorProfiles();
      
      // 5. Migrate ingredient flavor profiles
      await this.migrateIngredientFlavorProfiles();
      
      // 6. Generate missing data and optimize
      await this.generateMissingData();
      
      const migrationTime = Date.now() - startTime;
      
      _cachedMigrationStats = {
        totalProfiles: this.migratedProfiles.size,
        byCategory: this.getCategoryStats(),
        migrationTime,
        errors: [...this.migrationErrors],
        warnings: [...this.migrationWarnings]
      };

      // Cache the profiles for future use
      _cachedProfiles = new Map(this.migratedProfiles);
      _isMigrationCompleted = true;

      console.log('✅ Migration completed successfully!');
      console.log(`📊 Migrated ${_cachedMigrationStats.totalProfiles} profiles in ${migrationTime}ms`);
      
      // Reset migration flag
      _isMigrationRunning = false;
      
      return { ..._cachedMigrationStats };
      
    } catch (error) {
      this.migrationErrors?.push(`Migration failed: ${error}`);
      _isMigrationRunning = false;
      throw error;
    }
  }

  // ===== UNIFIED FLAVOR PROFILES MIGRATION =====
  
  private async migrateUnifiedFlavorProfiles(): Promise<void> {
    console.log('📦 Migrating unified flavor profiles...');
    
    for (const [id, profile] of Object.entries(unifiedFlavorProfiles)) {
      try {
        const migratedProfile = this.convertUnifiedProfile(id, profile);
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors?.push(`Failed to migrate unified profile ${id}: ${error}`);
      }
    }
    
    console.log(`✅ Migrated ${Object.keys(unifiedFlavorProfiles || {}).length} unified profiles`);
  }

  private convertUnifiedProfile(id: string, profile: unknown): UnifiedFlavorProfile {
    return {
      id: profile.id || id,
      name: profile.name || id,
      category: this.mapCategory(profile.category || profile.type),
      
      baseNotes: this.extractBaseNotes(profile),
      elementalFlavors: this.extractElementalFlavors(profile),
      intensity: profile.intensity || 0.5,
      complexity: profile.complexity || 0.5,
      
      kalchm: profile.kalchm || 0,
      monicaOptimization: profile.monicaOptimization || 1.0,
      alchemicalProperties: this.extractAlchemicalProperties(profile),
      
      seasonalPeak: this.extractSeasonalPeak(profile),
      seasonalModifiers: this.extractSeasonalModifiers(profile),
      culturalOrigins: this.extractCulturalOrigins(profile),
      pAiringRecommendations: this.extractPairingRecommendations(profile),
      
      nutritionalSynergy: profile.nutritionalSynergy || 0.7,
      
      description: profile.description || `${profile.name || id} flavor profile`,
      
      // Required properties missing from original interface
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: []
    };
  }

  // ===== CUISINE FLAVOR PROFILES MIGRATION =====
  
  private async migrateCuisineFlavorProfiles(): Promise<void> {
    console.log('🍽️ Migrating cuisine flavor profiles...');
    
    // Check if cuisineFlavorProfiles is available
    if (!cuisineFlavorProfiles || typeof cuisineFlavorProfiles !== 'object') {
      this.migrationWarnings?.push('cuisineFlavorProfiles is not available - skipping cuisine migration');
      console.log('⚠️ Skipping cuisine migration - cuisineFlavorProfiles not available');
      return;
    }
    
    for (const [cuisineName, cuisineData] of Object.entries(cuisineFlavorProfiles)) {
      try {
        const migratedProfile = this.convertCuisineProfile(cuisineName, cuisineData);
        
        // Avoid duplicates - check if already exists from unified system
        if (!this.migratedProfiles.has(migratedProfile.id)) {
          this.migratedProfiles.set(migratedProfile.id, migratedProfile);
        } else {
          // Merge additional data from cuisine profile
          this.mergeCuisineData(migratedProfile.id, cuisineData);
        }
      } catch (error) {
        this.migrationErrors?.push(`Failed to migrate cuisine profile ${cuisineName}: ${error}`);
      }
    }
    
    console.log(`✅ Migrated ${Object.keys(cuisineFlavorProfiles || {}).length} cuisine profiles`);
  }

  private convertCuisineProfile(cuisineName: string, cuisineData: CuisineType): UnifiedFlavorProfile {
    const id = `cuisine-${cuisineName?.toLowerCase()?.replace(/\s+/g, '-')}`;
    
    return {
      id,
      name: cuisineName,
      category: 'cuisine',
      
      baseNotes: this.extractCuisineBaseNotes(cuisineData),
      elementalFlavors: cuisineData.elementalState || getCurrentElementalState(),
      intensity: this.calculateCuisineIntensity(cuisineData),
      complexity: this.calculateCuisineComplexity(cuisineData),
      
      kalchm: 0, // Will be calculated
      monicaOptimization: 1.0,
      alchemicalProperties: this.extractAlchemicalProperties(cuisineData),
      
      seasonalPeak: this.extractCuisineSeasonalPeak(cuisineData),
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: [cuisineName],
      pAiringRecommendations: cuisineData.signatureIngredients || [],
      
      nutritionalSynergy: 0.7,
      
      description: cuisineData.description || `${cuisineName} cuisine flavor profile`,
      
      // Required properties missing from original interface
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: []
    };
  }

  // ===== PLANETARY FLAVOR PROFILES MIGRATION =====
  
  private async migratePlanetaryFlavorProfiles(): Promise<void> {
    console.log('🪐 Migrating planetary flavor profiles...');
    
    // Check if planetaryFlavorProfiles is available
    if (!planetaryFlavorProfiles || typeof planetaryFlavorProfiles !== 'object') {
      this.migrationWarnings?.push('planetaryFlavorProfiles is not available - skipping planetary migration');
      console.log('⚠️ Skipping planetary migration - planetaryFlavorProfiles not available');
      return;
    }
    
    for (const [planetName, planetData] of Object.entries(planetaryFlavorProfiles)) {
      try {
        const migratedProfile = this.convertPlanetaryProfile(planetName, planetData);
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors?.push(`Failed to migrate planetary profile ${planetName}: ${error}`);
      }
    }
    
    console.log(`✅ Migrated ${Object.keys(planetaryFlavorProfiles || {}).length} planetary profiles`);
  }

  private convertPlanetaryProfile(planetName: string, planetData: Planet): UnifiedFlavorProfile {
    const id = `planetary-${planetName?.toLowerCase()}`;
    
    return {
      id,
      name: `${planetName} Influence`,
      category: 'planetary',
      
      baseNotes: this.extractPlanetaryBaseNotes(planetData),
      elementalFlavors: planetData.elementalInfluence || getCurrentElementalState(),
      intensity: planetData.intensity || 0.5,
      complexity: planetData.complexity || 0.5,
      
      kalchm: 0, // Will be calculated
      monicaOptimization: 1.0,
      alchemicalProperties: this.extractAlchemicalProperties(planetData),
      
      seasonalPeak: this.extractPlanetarySeasonalPeak(planetData),
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: ['Universal'],
      pAiringRecommendations: [],
      
      nutritionalSynergy: 0.7,
      
      description: planetData.description || `${planetName} planetary influence on flavor`,
      
      // Required properties missing from original interface
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: []
    };
  }

  // ===== INTEGRATION FLAVOR PROFILES MIGRATION =====
  
  private async migrateIntegrationFlavorProfiles(): Promise<void> {
    console.log('🔗 Migrating integration flavor profiles...');
    
    // Check if integrationFlavorProfiles is available
    if (!integrationFlavorProfiles || typeof integrationFlavorProfiles !== 'object') {
      this.migrationWarnings?.push('integrationFlavorProfiles is not available - skipping integration migration');
      console.log('⚠️ Skipping integration migration - integrationFlavorProfiles not available');
      return;
    }
    
    for (const [flavorName, flavorData] of Object.entries(integrationFlavorProfiles)) {
      try {
        const migratedProfile = this.convertIntegrationProfile(flavorName, flavorData);
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors?.push(`Failed to migrate integration profile ${flavorName}: ${error}`);
      }
    }
    
    console.log(`✅ Migrated ${Object.keys(integrationFlavorProfiles || {}).length} integration profiles`);
  }

  private convertIntegrationProfile(flavorName: string, flavorData: Record<string, unknown>): UnifiedFlavorProfile {
    const id = `elemental-${flavorName?.toLowerCase()}`;
    
    return {
      id,
      name: flavorName,
      category: 'elemental',
      
      baseNotes: this.extractIntegrationBaseNotes(flavorName, flavorData),
      elementalFlavors: flavorData.elementalState || getCurrentElementalState(),
      intensity: flavorData.intensity || 0.5,
      complexity: 0.5,
      
      kalchm: 0, // Will be calculated
      monicaOptimization: 1.0,
      alchemicalProperties: this.getDefaultAlchemicalProperties(),
      
      seasonalPeak: flavorData.seasonalPeak || ['spring', 'summer', 'autumn', 'winter'],
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: ['Universal'],
      pAiringRecommendations: flavorData.pairings || [],
      
      nutritionalSynergy: 0.7,
      
      description: flavorData.description || `${flavorName} elemental flavor profile`,
      
      // Required properties missing from original interface
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: []
    };
  }

  // ===== INGREDIENT FLAVOR PROFILES MIGRATION =====
  
  private async migrateIngredientFlavorProfiles(): Promise<void> {
    console.log('🥬 Migrating ingredient flavor profiles...');
    
    // Check if ingredientFlavorMap is available (currently disabled)
    const ingredientFlavorMap = null; // Disabled due to missing export
    if (!ingredientFlavorMap || typeof ingredientFlavorMap !== 'object') {
      this.migrationWarnings?.push('ingredientFlavorMap is not available - skipping ingredient migration');
      console.log('⚠️ Skipping ingredient migration - ingredientFlavorMap not available');
      return;
    }
    
    for (const [ingredientName, flavorData] of Object.entries(ingredientFlavorMap || {})) {
      try {
        const migratedProfile = this.convertIngredientProfile(ingredientName, flavorData as Record<string, unknown>);
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors?.push(`Failed to migrate ingredient profile ${ingredientName}: ${error}`);
      }
    }
    
    console.log(`✅ Migrated ${Object.keys(ingredientFlavorMap || {}).length} ingredient profiles`);
  }

  private convertIngredientProfile(ingredientName: string, flavorData: Record<string, unknown>): UnifiedFlavorProfile {
    const id = `ingredient-${ingredientName?.toLowerCase()?.replace(/\s+/g, '-')}`;
    
    return {
      id,
      name: ingredientName,
      category: 'ingredient',
      
      baseNotes: this.extractIngredientBaseNotes(flavorData),
      elementalFlavors: getCurrentElementalState(),
      intensity: this.calculateIngredientIntensity(flavorData),
      complexity: this.calculateIngredientComplexity(flavorData),
      
      kalchm: 0, // Will be calculated
      monicaOptimization: 1.0,
      alchemicalProperties: this.getDefaultAlchemicalProperties(),
      
      seasonalPeak: ['spring', 'summer', 'autumn', 'winter'], // Default to all seasons
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: ['Universal'],
      pAiringRecommendations: [],
      
      nutritionalSynergy: 0.7,
      
      description: `${ingredientName} ingredient flavor profile`,
      
      // Required properties missing from original interface
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: []
    };
  }

  // ===== DATA EXTRACTION HELPERS =====
  
  private extractBaseNotes(profile: unknown): BaseFlavorNotes {
    if (profile.baseNotes) return profile.baseNotes;
    
    // Try to extract from various formats
    const baseNotes: BaseFlavorNotes = {
      sweet: profile.sweet || profile.flavorProfiles?.sweet || 0,
      sour: profile.sour || profile.flavorProfiles?.sour || 0,
      salty: profile.salty || profile.flavorProfiles?.salty || 0,
      bitter: profile.bitter || profile.flavorProfiles?.bitter || 0,
      umami: profile.umami || profile.flavorProfiles?.umami || 0,
      spicy: profile.spicy || profile.flavorProfiles?.spicy || 0
    };
    
    return baseNotes;
  }

  private extractElementalFlavors(profile: unknown): ElementalProperties {
    if (profile.elementalFlavors) return profile.elementalFlavors;
    if (profile.elementalState) return profile.elementalState;
    
    return getCurrentElementalState();
  }

  private extractAlchemicalProperties(profile: unknown): AlchemicalProperties {
    if (profile.alchemicalProperties) return profile.alchemicalProperties;
    
    return this.getDefaultAlchemicalProperties();
  }

  private extractSeasonalPeak(profile: unknown): Season[] {
    if (profile.seasonalPeak) return profile.seasonalPeak;
    
    return ['spring', 'summer', 'autumn', 'winter'];
  }

  private extractSeasonalModifiers(profile: unknown): Record<Season, number> {
    return profile.seasonalModifiers || this.getDefaultSeasonalModifiers();
  }

  private extractCulturalOrigins(profile: unknown): string[] {
    if (profile.culturalOrigins) return profile.culturalOrigins;
    if (profile.origins) return profile.origins;
    
    return ['Universal'];
  }

  private extractPairingRecommendations(profile: unknown): string[] {
    if (profile.pairingRecommendations) return profile.pairingRecommendations;
    if (profile.pairings) return profile.pairings;
    
    return [];
  }


  // ===== CUISINE-SPECIFIC HELPERS =====
  
  private extractCuisineBaseNotes(cuisineData: CuisineType): BaseFlavorNotes {
    if (cuisineData.flavorProfiles) {
      return {
        sweet: cuisineData.flavorProfiles.sweet || 0,
        sour: cuisineData.flavorProfiles.sour || 0,
        salty: cuisineData.flavorProfiles.salty || 0,
        bitter: cuisineData.flavorProfiles.bitter || 0,
        umami: cuisineData.flavorProfiles.umami || 0,
        spicy: cuisineData.flavorProfiles.spicy || 0
      };
    }
    
    if (cuisineData.flavorIntensities) {
      return {
        sweet: cuisineData.flavorIntensities.sweet || 0,
        sour: cuisineData.flavorIntensities.sour || 0,
        salty: cuisineData.flavorIntensities.salty || 0,
        bitter: cuisineData.flavorIntensities.bitter || 0,
        umami: cuisineData.flavorIntensities.umami || 0,
        spicy: cuisineData.flavorIntensities.spicy || 0
      };
    }
    
    return this.getDefaultBaseNotes();
  }

  private calculateCuisineIntensity(cuisineData: CuisineType): number {
    if (cuisineData.intensity) return cuisineData.intensity;
    
    // Calculate from flavor intensities
    if (cuisineData.flavorIntensities) {
      const values = Object.values(cuisineData.flavorIntensities) as number[];
      return values.reduce((sum, val) => sum + val, 0) / (values || []).length;
    }
    
    return 0.5;
  }

  private calculateCuisineComplexity(cuisineData: CuisineType): number {
    if (cuisineData.complexity) return cuisineData.complexity;
    
    // Estimate based on number of signature ingredients and techniques
    const ingredientCount = (cuisineData.signatureIngredients || []).length || 0;
    const techniqueCount = (cuisineData.signatureTechniques || []).length || 0;
    
    return Math.min(1, (ingredientCount + techniqueCount) / 20);
  }

  private extractCuisineSeasonalPeak(cuisineData: CuisineType): Season[] {
    if (cuisineData.seasonalPeak) return cuisineData.seasonalPeak;
    
    // Default based on cuisine characteristics
    return ['spring', 'summer', 'autumn', 'winter'];
  }

  // ===== PLANETARY-SPECIFIC HELPERS =====
  
  private extractPlanetaryBaseNotes(planetData: Planet): BaseFlavorNotes {
    if (planetData.flavorProfiles) {
      return {
        sweet: planetData.flavorProfiles.sweet || 0,
        sour: planetData.flavorProfiles.sour || 0,
        salty: planetData.flavorProfiles.salty || 0,
        bitter: planetData.flavorProfiles.bitter || 0,
        umami: planetData.flavorProfiles.umami || 0,
        spicy: planetData.flavorProfiles.spicy || 0
      };
    }
    
    return this.getDefaultBaseNotes();
  }

  private extractPlanetarySeasonalPeak(planetData: Planet): Season[] {
    if (planetData.seasonalPeak) return planetData.seasonalPeak;
    
    return ['spring', 'summer', 'autumn', 'winter'];
  }

  // ===== INTEGRATION-SPECIFIC HELPERS =====
  
  private extractIntegrationBaseNotes(flavorName: string, flavorData: Record<string, unknown>): BaseFlavorNotes {
    const baseNotes = this.getDefaultBaseNotes();
    
    // Map flavor name to base note
    const flavorMap: Record<string, keyof BaseFlavorNotes> = {
      sweet: 'sweet',
      sour: 'sour',
      salty: 'salty',
      bitter: 'bitter',
      umami: 'umami',
      spicy: 'spicy'
    };
    
    const mappedFlavor = flavorMap[flavorName?.toLowerCase()];
    if (mappedFlavor) {
      baseNotes[mappedFlavor] = flavorData.intensity || 0.8;
    }
    
    return baseNotes;
  }

  // ===== INGREDIENT-SPECIFIC HELPERS =====
  
  private extractIngredientBaseNotes(flavorData: Record<string, unknown>): BaseFlavorNotes {
    return {
      sweet: flavorData.sweet || 0,
      sour: flavorData.sour || 0,
      salty: flavorData.salty || 0,
      bitter: flavorData.bitter || 0,
      umami: flavorData.umami || 0,
      spicy: flavorData.spicy || 0
    };
  }

  private calculateIngredientIntensity(flavorData: Record<string, unknown>): number {
    const baseNotes = this.extractIngredientBaseNotes(flavorData);
    const values = Object.values(baseNotes);
    // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
    const numericValues = values.map(val => Number(val) || 0);
    const sum = numericValues.reduce((acc: number, val: number) => acc + val, 0);
    return sum / Math.max(numericValues.length, 1);
  }

  private calculateIngredientComplexity(flavorData: Record<string, unknown>): number {
    const baseNotes = this.extractIngredientBaseNotes(flavorData);
    // Apply Pattern KK-1: Explicit Type Assertion for comparison operations
    const nonZeroFlavors = Object.values(baseNotes || {}).filter(val => Number(val) > 0.1).length;
    return Math.min(1, nonZeroFlavors / 6);
  }

  // ===== DEFAULT VALUES =====
  
  private getDefaultAlchemicalProperties(): AlchemicalValues {
    return { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 };
  }

  private getDefaultPlanetaryResonance(): Record<PlanetName, PlanetaryFlavorInfluence> {
    const planets: PlanetName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const resonance: Record<PlanetName, PlanetaryFlavorInfluence> = {} as Record<PlanetName, PlanetaryFlavorInfluence>;
    
    planets.forEach(planet => {
      resonance[planet] = {
        influence: 0.1,
        flavorModification: {
          intensityMultiplier: 1.0,
          complexityBonus: 0.0,
          harmonicResonance: 0.5,
          temperatureOptimal: 20
        },
        seasonalVariation: {
          spring: 1.0,
          summer: 1.0,
          autumn: 1.0,
          fall: 1.0,
          winter: 1.0,
          all: 1.0
        },
        monicaOptimization: 1.0,
        optimalTiming: {
          planetaryHour: false,
          dayOfWeek: 0,
          lunarPhases: []
        }
      };
    });
    
    return resonance;
  }

  private getDefaultCuisineCompatibility(): { [key: string]: CuisineFlavorCompatibility } {
    return {
      'universal': {
        compatibility: 0.7,
        traditionalUse: false,
        modernAdaptations: [],
        kalchmHarmony: 0.5,
        culturalSignificance: 'Universal appeal',
        preparationMethods: []
      }
    };
  }

  private getDefaultCookingMethodAffinity(): Record<CookingMethod, number> {
    const methods: CookingMethod[] = ['baking', 'grilling', 'sautéing', 'steaming', 'roasting', 'boiling', 'frying', 'braising', 'stewing', 'raw'];
    const affinity: Record<CookingMethod, number> = {} as Record<CookingMethod, number>;
    
    methods.forEach(method => {
      affinity[method] = 0.5; // Default neutral affinity
    });
    
    return affinity;
  }

  private getDefaultBaseNotes(): BaseFlavorNotes {
    return { sweet: 0, sour: 0, salty: 0, bitter: 0, umami: 0, spicy: 0 };
  }

  private getDefaultSeasonalModifiers(): Record<Season, number> {
    return {
      spring: 1.0,
      summer: 1.0,
      fall: 1.0,
      winter: 1.0
    } as Record<Season, number>;
  }

  // ===== UTILITY METHODS =====
  
  private mapCategory(category: string): UnifiedFlavorProfile['category'] {
    const categoryMap: Record<string, UnifiedFlavorProfile['category']> = {
      'cuisine': 'cuisine',
      'planetary': 'planetary',
      'elemental': 'elemental',
      'ingredient': 'ingredient',
      'cooking-method': 'fusion'
    };
    
    return categoryMap[category] || 'elemental';
  }

  private mergeCuisineData(profileId: string, cuisineData: CuisineType): void {
    const existingProfile = this.migratedProfiles.get(profileId);
    if (!existingProfile) return;
    
    // Merge additional cuisine-specific data
    if (cuisineData.signatureIngredients) {
      existingProfile.pAiringRecommendations = [
        ...new Set([...existingProfile.pAiringRecommendations, ...cuisineData.signatureIngredients])
      ];
    }
    
    this.migratedProfiles.set(profileId, existingProfile);
  }

  private async generateMissingData(): Promise<void> {
    console.log('🔧 Generating missing data and optimizing profiles...');
    
    for (const [id, profile] of this.migratedProfiles) {
      // Calculate Kalchm values if missing
      if (profile.kalchm === 0) {
        profile.kalchm = this.calculateKalchm(profile);
      }
      
      // Optimize Monica values
      if (profile.monicaOptimization === 1.0) {
        profile.monicaOptimization = this.calculateMonicaOptimization(profile);
      }
      
      // Update the profile
      this.migratedProfiles.set(id, profile);
    }
    
    console.log('✅ Generated missing data for all profiles');
  }

  private calculateKalchm(profile: UnifiedFlavorProfile): number {
    // Simplified Kalchm calculation based on elemental and alchemical properties
    const { Spirit, Essence, Matter, Substance } = profile.alchemicalProperties;
    
    if (Matter === 0 || Substance === 0) return 1.0; // Default neutral value
    
    return (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
           (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));
  }

  private calculateMonicaOptimization(profile: UnifiedFlavorProfile): number {
    // Estimate Monica optimization based on profile characteristics
    const intensityFactor = 1 - Math.abs(profile.intensity - 0.7); // Optimal around 0.7
    const complexityFactor = profile.complexity; // Higher complexity is better
    // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
    const elementalValues = Object.values(profile.elementalFlavors).map(val => Number(val) || 0);
    const elementalBalance = elementalValues.reduce((acc: number, val: number) => acc + val, 0) / 4;
    return (intensityFactor + complexityFactor + elementalBalance) / 3;
  }

  private getCategoryStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    for (const profile of this.migratedProfiles.values()) {
      stats[profile.category] = (stats[profile.category] || 0) + 1;
    }
    
    return stats;
  }

  // ===== PUBLIC ACCESS METHODS =====
  
  public getMigratedProfiles(): Map<string, UnifiedFlavorProfile> {
    return new Map(this.migratedProfiles);
  }

  public getProfileById(id: string): UnifiedFlavorProfile | undefined {
    return this.migratedProfiles.get(id);
  }

  public getAllProfiles(): UnifiedFlavorProfile[] {
    return Array.from(this.migratedProfiles.values());
  }

  public getProfilesByCategory(category: UnifiedFlavorProfile['category']): UnifiedFlavorProfile[] {
    return this.getAllProfiles().filter(profile => profile.category === category);
  }
}

/**
 * Run the flavor profile migration
 * Returns statistics about the migration
 */
export async function runFlavorProfileMigration(): Promise<MigrationStats> {
  // Use cached instance or create a new one
  if (!_migrationInstance) {
    _migrationInstance = new FlavorProfileMigration();
  }
  
  // Return cached results if available
  if (_cachedMigrationStats && !_isMigrationRunning) {
    return { ..._cachedMigrationStats };
  }
  
  return await _migrationInstance.migrateAllSystems();
}

/**
 * Get all migrated flavor profiles
 */
export function getMigratedFlavorProfiles(): UnifiedFlavorProfile[] {
  if (!_migrationInstance) {
    return [];
  }
  return _migrationInstance.getAllProfiles();
}

/**
 * Get migrated profiles by category
 */
export function getMigratedProfilesByCategory(category: UnifiedFlavorProfile['category']): UnifiedFlavorProfile[] {
  if (!_migrationInstance) {
    return [];
  }
  return _migrationInstance.getProfilesByCategory(category);
}

export default {
  runFlavorProfileMigration,
  getMigratedFlavorProfiles,
  getMigratedProfilesByCategory
}; 