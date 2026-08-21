import { log } from "@/services/LoggingService";
import type {
  AlchemicalProperties,
  ElementalProperties,
  PlanetName,
  Season,
} from "@/types/alchemy";
import type { CookingMethod } from "@/types/constants";
import {
  cuisineFlavorProfiles,
  type CuisineFlavorProfile,
} from "../cuisineFlavorProfiles";
import { flavorProfiles as integrationFlavorProfiles } from "../integrations/flavorProfiles";
import {
  planetaryFlavorProfiles,
} from "../planetaryFlavorProfiles";
import { calculateKalchm as canonicalCalculateKalchm } from "./alchemicalCalculations";
import { unifiedFlavorProfiles } from "./data/unifiedFlavorProfiles";
import type { BaseFlavorNotes, UnifiedFlavorProfile } from "./unifiedTypes";

type PlanetaryFlavorInfluence = unknown;
type CuisineFlavorCompatibility = unknown;

interface RawProfileInput {
  id?: string;
  name?: string;
  category?: string;
  type?: string;
  intensity?: number | string;
  complexity?: number | string;
  kalchm?: number | string;
  monicaOptimization?: number | string;
  nutritionalSynergy?: number | string;
  description?: string;
  baseNotes?: BaseFlavorNotes;
  flavorProfiles?: Record<string, number | undefined>;
  flavorIntensities?: Record<string, number | undefined>;
  elementalFlavors?: ElementalProperties;
  elementalState?: ElementalProperties;
  elementalInfluence?: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
  seasonalPeak?: Season[] | string[];
  seasonalModifiers?: Record<Season, number>;
  culturalOrigins?: string[];
  origins?: string[];
  pairingRecommendations?: string[];
  pairings?: string[];
  signatureIngredients?: string[];
  signatureTechniques?: string[];
  sweet?: number;
  sour?: number;
  salty?: number;
  bitter?: number;
  umami?: number;
  spicy?: number;
}

// ===== FLAVOR PROFILE MIGRATION UTILITY - PHASE 4 =====
// Consolidates all existing flavor profile data into the unified system
// Preserves backward compatibility while enabling new features

// ===== MIGRATION INTERFACES =====
interface MigrationStats {
  totalProfiles: number;
  byCategory: Record<string, number>;
  migrationTime: number;
  errors: string[];
  warnings: string[];
}

// Singleton management
let _migrationInstance: FlavorProfileMigration | null = null;
let _cachedProfiles: Map<string, UnifiedFlavorProfile> = new Map();
let _cachedMigrationStats: MigrationStats | null = null;
let _isMigrationRunning = false;
let _isMigrationCompleted = false;

// ===== MIGRATION CLASS =====
export class FlavorProfileMigration {
  private readonly migratedProfiles: Map<string, UnifiedFlavorProfile> =
    new Map();
  private readonly migrationErrors: string[] = [];
  private readonly migrationWarnings: string[] = [];

  constructor() {
    if (_migrationInstance) {
      return _migrationInstance;
    }
    _migrationInstance = this;
    if (_isMigrationCompleted && _cachedProfiles.size > 0) {
      this.migratedProfiles = new Map(_cachedProfiles);
    }
  }

  /**
   * Main migration function - consolidates all existing flavor profile systems
   */
  public async migrateAllSystems(): Promise<MigrationStats> {
    if (_isMigrationCompleted && _cachedMigrationStats) {
      return { ..._cachedMigrationStats };
    }
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

    _isMigrationRunning = true;
    const startTime = Date.now();
    log.info("🔄 Starting Phase 4 flavor profile migration...");

    try {
      this.migrateUnifiedFlavorProfiles();
      this.migrateCuisineFlavorProfiles();
      this.migratePlanetaryFlavorProfiles();
      this.migrateIntegrationFlavorProfiles();
      this.migrateIngredientFlavorProfiles();
      this.generateMissingData();

      const migrationTime = Date.now() - startTime;
      _cachedMigrationStats = {
        totalProfiles: this.migratedProfiles.size,
        byCategory: this.getCategoryStats(),
        migrationTime,
        errors: [...this.migrationErrors],
        warnings: [...this.migrationWarnings],
      };

      _cachedProfiles = new Map(this.migratedProfiles);
      _isMigrationCompleted = true;
      log.info("✅ Migration completed successfully!");
      log.info(
        `📊 Migrated ${_cachedMigrationStats.totalProfiles} profiles in ${migrationTime}ms`,
      );
      _isMigrationRunning = false;
      return await Promise.resolve({ ..._cachedMigrationStats });
    } catch (error) {
      this.migrationErrors.push(`Migration failed: ${String(error)}`);
      _isMigrationRunning = false;
      throw error;
    }
  }

  // ===== UNIFIED FLAVOR PROFILES MIGRATION =====
  private migrateUnifiedFlavorProfiles(): void {
    log.info("📦 Migrating unified flavor profiles...");
    for (const [id, profile] of Object.entries(unifiedFlavorProfiles)) {
      try {
        const migratedProfile = this.convertUnifiedProfile(id, profile);
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors.push(
          `Failed to migrate unified profile ${id}: ${String(error)}`,
        );
      }
    }
    log.info(
      `✅ Migrated ${Object.keys(unifiedFlavorProfiles).length} unified profiles`,
    );
  }

  private convertUnifiedProfile(
    profileId: string,
    profileData: RawProfileInput,
  ): UnifiedFlavorProfile {
    const rawData = profileData;
    const baseNotes = this.extractBaseNotes(rawData);
    const elementalFlavors =
      rawData.elementalFlavors ??
      rawData.elementalState ?? {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };
    const alchemicalProperties =
      rawData.alchemicalProperties ?? this.getDefaultAlchemicalProperties();
    const kalchm =
      typeof rawData.kalchm === "number"
        ? rawData.kalchm
        : canonicalCalculateKalchm(alchemicalProperties);
    const monicaOptimization =
      typeof rawData.monicaOptimization === "number"
        ? rawData.monicaOptimization
        : 1.0;
    return {
      id: profileId,
      name: String(rawData.name ?? profileId),
      category: this.mapCategory(String(rawData.category ?? "elemental")),
      baseNotes,
      elementalFlavors,
      intensity: Number(rawData.intensity ?? 0.5),
      complexity: Number(rawData.complexity ?? 0.5),
      kalchm,
      monicaOptimization,
      alchemicalProperties,
      seasonalPeak: this.extractSeasonalPeak(rawData),
      seasonalModifiers: this.extractSeasonalModifiers(rawData),
      culturalOrigins: this.extractCulturalOrigins(rawData),
      pairingRecommendations: this.extractPairingRecommendations(rawData),
      nutritionalSynergy: Number(rawData.nutritionalSynergy ?? 0.7),
      description: String(
        rawData.description ?? `${profileId} flavor profile`,
      ),
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: [],
    };
  }

  // ===== CUISINE FLAVOR PROFILES MIGRATION =====
  private migrateCuisineFlavorProfiles(): void {
    log.info("🍳 Migrating cuisine flavor profiles...");
    for (const [cuisineName, cuisineData] of Object.entries(
      cuisineFlavorProfiles,
    )) {
      try {
        const migratedProfile = this.convertCuisineProfile(
          cuisineName,
          cuisineData,
        );
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors.push(
          `Failed to migrate cuisine profile ${cuisineName}: ${String(error)}`,
        );
      }
    }
    log.info(
      `✅ Migrated ${Object.keys(cuisineFlavorProfiles).length} cuisine profiles`,
    );
  }

  private convertCuisineProfile(
    cuisineName: string,
    cuisineData: CuisineFlavorProfile,
  ): UnifiedFlavorProfile {
    const id = `cuisine-${cuisineName.toLowerCase().replace(/\s+/g, "-")}`;
    const rawData = cuisineData as unknown as RawProfileInput;
    return {
      id,
      name: cuisineName,
      category: "cuisine",
      baseNotes: this.extractCuisineBaseNotes(cuisineData),
      elementalFlavors: rawData.elementalState ?? {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      intensity: this.calculateCuisineIntensity(cuisineData),
      complexity: this.calculateCuisineComplexity(cuisineData),
      kalchm: 0,
      monicaOptimization: 1.0,
      alchemicalProperties: this.extractAlchemicalProperties(rawData),
      seasonalPeak: this.extractCuisineSeasonalPeak(cuisineData),
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: [cuisineName],
      pairingRecommendations: cuisineData.signatureIngredients ?? [],
      nutritionalSynergy: 0.7,
      description:
        cuisineData.description ?? `${cuisineName} cuisine flavor profile`,
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: [],
    };
  }

  // ===== PLANETARY FLAVOR PROFILES MIGRATION =====
  private migratePlanetaryFlavorProfiles(): void {
    log.info("🪐 Migrating planetary flavor profiles...");
    for (const [planetName, planetData] of Object.entries(
      planetaryFlavorProfiles,
    )) {
      try {
        const migratedProfile = this.convertPlanetaryProfile(
          planetName,
          planetData,
        );
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors.push(
          `Failed to migrate planetary profile ${planetName}: ${String(error)}`,
        );
      }
    }
    log.info(
      `✅ Migrated ${Object.keys(planetaryFlavorProfiles).length} planetary profiles`,
    );
  }

  private convertPlanetaryProfile(
    planetName: string,
    planetData: RawProfileInput,
  ): UnifiedFlavorProfile {
    const id = `planetary-${planetName.toLowerCase()}`;
    return {
      id,
      name: `${planetName} Influence`,
      category: "planetary",
      baseNotes: this.extractBaseNotes(planetData),
      elementalFlavors:
        planetData.elementalInfluence ?? {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
      intensity: Number(planetData.intensity ?? 0.5),
      complexity: Number(planetData.complexity ?? 0.5),
      kalchm: 0,
      monicaOptimization: 1.0,
      alchemicalProperties: this.extractAlchemicalProperties(planetData),
      seasonalPeak: this.extractSeasonalPeak(planetData),
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: ["Universal"],
      pairingRecommendations: [],
      nutritionalSynergy: 0.7,
      description: String(
        planetData.description ?? `${planetName} planetary influence on flavor`,
      ),
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: [],
    };
  }

  // ===== INTEGRATION FLAVOR PROFILES MIGRATION =====
  private migrateIntegrationFlavorProfiles(): void {
    log.info("🔗 Migrating integration flavor profiles...");
    for (const [flavorName, flavorData] of Object.entries(
      integrationFlavorProfiles,
    )) {
      try {
        const migratedProfile = this.convertIntegrationProfile(
          flavorName,
          flavorData,
        );
        this.migratedProfiles.set(migratedProfile.id, migratedProfile);
      } catch (error) {
        this.migrationErrors.push(
          `Failed to migrate integration profile ${flavorName}: ${String(error)}`,
        );
      }
    }
    log.info(
      `✅ Migrated ${Object.keys(integrationFlavorProfiles).length} integration profiles`,
    );
  }

  private convertIntegrationProfile(
    flavorName: string,
    flavorData: RawProfileInput,
  ): UnifiedFlavorProfile {
    const id = `elemental-${flavorName.toLowerCase()}`;
    return {
      id,
      name: flavorName,
      category: "elemental",
      baseNotes: this.extractIntegrationBaseNotes(flavorName, flavorData),
      elementalFlavors: flavorData.elementalState ?? {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      intensity: Number(flavorData.intensity ?? 0.5),
      complexity: 0.5,
      kalchm: 0,
      monicaOptimization: 1.0,
      alchemicalProperties: this.getDefaultAlchemicalProperties(),
      seasonalPeak: (flavorData.seasonalPeak as Season[] | undefined) ?? [
        "spring",
        "summer",
        "autumn",
        "winter",
      ],
      seasonalModifiers: this.getDefaultSeasonalModifiers(),
      culturalOrigins: ["Universal"],
      pairingRecommendations: flavorData.pairings ?? [],
      nutritionalSynergy: 0.7,
      description: String(
        flavorData.description ?? `${flavorName} elemental flavor profile`,
      ),
      planetaryResonance: this.getDefaultPlanetaryResonance(),
      cuisineCompatibility: this.getDefaultCuisineCompatibility(),
      cookingMethodAffinity: this.getDefaultCookingMethodAffinity(),
      temperatureRange: { min: 10, max: 30 },
      avoidCombinations: [],
    };
  }

  // ===== INGREDIENT FLAVOR PROFILES MIGRATION =====
  private migrateIngredientFlavorProfiles(): void {
    log.info("🥬 Migrating ingredient flavor profiles...");
    const ingredientFlavorMap: Record<string, RawProfileInput> | null = null;
    if (!ingredientFlavorMap) {
      this.migrationWarnings.push(
        "ingredientFlavorMap is not available - skipping ingredient migration",
      );
      log.info(
        "⚠️ Skipping ingredient migration - ingredientFlavorMap not available",
      );
      return;
    }
  }

  // ===== DATA EXTRACTION HELPERS =====
  private extractBaseNotes(profile: RawProfileInput): BaseFlavorNotes {
    if (profile.baseNotes) return profile.baseNotes;
    const flavorProfiles = profile.flavorProfiles ?? {};
    return {
      sweet: Number(profile.sweet ?? flavorProfiles.sweet ?? 0),
      sour: Number(profile.sour ?? flavorProfiles.sour ?? 0),
      salty: Number(profile.salty ?? flavorProfiles.salty ?? 0),
      bitter: Number(profile.bitter ?? flavorProfiles.bitter ?? 0),
      umami: Number(profile.umami ?? flavorProfiles.umami ?? 0),
      spicy: Number(profile.spicy ?? flavorProfiles.spicy ?? 0),
    };
  }

  private extractElementalFlavors(profile: RawProfileInput): ElementalProperties {
    if (profile.elementalFlavors) return profile.elementalFlavors;
    if (profile.elementalState) return profile.elementalState;
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  private extractAlchemicalProperties(profile: RawProfileInput): AlchemicalProperties {
    if (profile.alchemicalProperties) return profile.alchemicalProperties;
    return this.getDefaultAlchemicalProperties();
  }

  private extractSeasonalPeak(profile: RawProfileInput): Season[] {
    if (profile.seasonalPeak) return profile.seasonalPeak as Season[];
    return ["spring", "summer", "autumn", "winter"];
  }

  private extractSeasonalModifiers(profile: RawProfileInput): Record<Season, number> {
    return (
      profile.seasonalModifiers ??
      this.getDefaultSeasonalModifiers()
    );
  }

  private extractCulturalOrigins(profile: RawProfileInput): string[] {
    if (profile.culturalOrigins) return profile.culturalOrigins;
    if (profile.origins) return profile.origins;
    return ["Universal"];
  }

  private extractPairingRecommendations(profile: RawProfileInput): string[] {
    if (profile.pairingRecommendations) return profile.pairingRecommendations;
    if (profile.pairings) return profile.pairings;
    return [];
  }

  // ===== CUISINE-SPECIFIC HELPERS =====
  private extractCuisineBaseNotes(
    cuisineData: CuisineFlavorProfile,
  ): BaseFlavorNotes {
    if (cuisineData.flavorProfiles) {
      return {
        sweet: cuisineData.flavorProfiles.sweet ?? 0,
        sour: cuisineData.flavorProfiles.sour ?? 0,
        salty: cuisineData.flavorProfiles.salty ?? 0,
        bitter: cuisineData.flavorProfiles.bitter ?? 0,
        umami: cuisineData.flavorProfiles.umami ?? 0,
        spicy: cuisineData.flavorProfiles.spicy ?? 0,
      };
    }
    if (cuisineData.flavorIntensities) {
      return {
        sweet: cuisineData.flavorIntensities.sweet ?? 0,
        sour: cuisineData.flavorIntensities.sour ?? 0,
        salty: cuisineData.flavorIntensities.salty ?? 0,
        bitter: cuisineData.flavorIntensities.bitter ?? 0,
        umami: cuisineData.flavorIntensities.umami ?? 0,
        spicy: cuisineData.flavorIntensities.spicy ?? 0,
      };
    }
    return this.getDefaultBaseNotes();
  }

  private calculateCuisineIntensity(cuisineData: CuisineFlavorProfile): number {
    const rawData = cuisineData as unknown as RawProfileInput;
    if (typeof rawData.intensity === "number") return rawData.intensity;
    if (cuisineData.flavorIntensities) {
      const values = Object.values(cuisineData.flavorIntensities);
      if (values.length > 0) {
        return values.reduce((sum, val) => sum + (val ?? 0), 0) / values.length;
      }
    }
    return 0.5;
  }

  private calculateCuisineComplexity(
    cuisineData: CuisineFlavorProfile,
  ): number {
    const rawData = cuisineData as unknown as RawProfileInput;
    if (typeof rawData.complexity === "number") return rawData.complexity;
    const ingredientCount = cuisineData.signatureIngredients?.length ?? 0;
    const techniqueCount = cuisineData.signatureTechniques?.length ?? 0;
    return Math.min(1, (ingredientCount + techniqueCount) / 20);
  }

  private extractCuisineSeasonalPeak(
    cuisineData: CuisineFlavorProfile,
  ): Season[] {
    const rawData = cuisineData as unknown as RawProfileInput;
    if (Array.isArray(rawData.seasonalPeak)) return rawData.seasonalPeak as Season[];
    return ["spring", "summer", "autumn", "winter"];
  }

  // ===== INTEGRATION-SPECIFIC HELPERS =====
  private extractIntegrationBaseNotes(
    flavorName: string,
    flavorData: RawProfileInput,
  ): BaseFlavorNotes {
    const baseNotes = this.getDefaultBaseNotes();
    const flavorMap: Record<string, keyof BaseFlavorNotes> = {
      sweet: "sweet",
      sour: "sour",
      salty: "salty",
      bitter: "bitter",
      umami: "umami",
      spicy: "spicy",
    };
    const mappedFlavor = flavorMap[flavorName.toLowerCase()];
    if (mappedFlavor) {
      baseNotes[mappedFlavor] = Number(flavorData.intensity ?? 0.8);
    }
    return baseNotes;
  }

  // ===== DEFAULT VALUES =====
  private getDefaultAlchemicalProperties(): AlchemicalProperties {
    return { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 };
  }

  private getDefaultPlanetaryResonance(): Record<
    PlanetName,
    PlanetaryFlavorInfluence
  > {
    const planets: PlanetName[] = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
    ];
    const resonance: Record<PlanetName, PlanetaryFlavorInfluence> =
      {} as Record<PlanetName, PlanetaryFlavorInfluence>;
    planets.forEach((planet) => {
      resonance[planet] = {
        influence: 0.1,
        flavorModification: {
          intensityMultiplier: 1.0,
          complexityBonus: 0.0,
          harmonicResonance: 0.5,
          temperatureOptimal: 20,
        },
        seasonalVariation: {
          spring: 1.0,
          summer: 1.0,
          autumn: 1.0,
          fall: 1.0,
          winter: 1.0,
          all: 1.0,
        },
        monicaOptimization: 1.0,
        optimalTiming: {
          planetaryHour: false,
          dayOfWeek: 0,
          lunarPhases: [],
        },
      };
    });
    return resonance;
  }

  private getDefaultCuisineCompatibility(): Record<string, CuisineFlavorCompatibility> {
    return {
      universal: {
        compatibility: 0.7,
        traditionalUse: false,
        modernAdaptations: [],
        kalchmHarmony: 0.5,
        culturalSignificance: "Universal appeal",
        preparationMethods: [],
      },
    };
  }

  private getDefaultCookingMethodAffinity(): Record<CookingMethod, number> {
    const methods: CookingMethod[] = [
      "baking",
      "grilling",
      "sautéing",
      "steaming",
      "roasting",
      "boiling",
      "frying",
      "braising",
      "stewing",
      "raw",
    ];
    const affinity = {} as Record<CookingMethod, number>;
    methods.forEach((method) => {
      affinity[method] = 0.5;
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
      autumn: 1.0,
      fall: 1.0,
      winter: 1.0,
      all: 1.0,
    };
  }

  // ===== UTILITY METHODS =====
  private mapCategory(category: string): UnifiedFlavorProfile["category"] {
    const categoryMap: Record<string, UnifiedFlavorProfile["category"]> = {
      cuisine: "cuisine",
      planetary: "planetary",
      elemental: "elemental",
      ingredient: "ingredient",
      "cooking-method": "fusion",
    };
    return categoryMap[category] ?? "elemental";
  }

  private mergeCuisineData(
    profileId: string,
    cuisineData: CuisineFlavorProfile,
  ): void {
    const existingProfile = this.migratedProfiles.get(profileId);
    if (!existingProfile) return;
    if (cuisineData.signatureIngredients) {
      existingProfile.pairingRecommendations = [
        ...new Set([
          ...existingProfile.pairingRecommendations,
          ...cuisineData.signatureIngredients,
        ]),
      ];
    }
    this.migratedProfiles.set(profileId, existingProfile);
  }

  private generateMissingData(): void {
    log.info("🔧 Generating missing data and optimizing profiles...");
    for (const [id, profile] of this.migratedProfiles) {
      if (profile.kalchm === 0) {
        profile.kalchm = this.calculateKalchm(profile);
      }
      if (profile.monicaOptimization === 1.0) {
        profile.monicaOptimization = this.calculateMonicaOptimization(profile);
      }
      this.migratedProfiles.set(id, profile);
    }
    log.info("✅ Generated missing data for all profiles");
  }

  private calculateKalchm(profile: UnifiedFlavorProfile): number {
    return canonicalCalculateKalchm(profile.alchemicalProperties);
  }

  private calculateMonicaOptimization(profile: UnifiedFlavorProfile): number {
    const intensityFactor = 1 - Math.abs(profile.intensity - 0.7);
    const complexityFactor = profile.complexity;
    const elementalValues = Object.values(profile.elementalFlavors).map(
      (val) => Number(val) || 0,
    );
    const elementalBalance =
      elementalValues.reduce((acc: number, val: number) => acc + val, 0) / 4;
    return (intensityFactor + complexityFactor + elementalBalance) / 3;
  }

  private getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const profile of this.migratedProfiles.values()) {
      stats[profile.category] = (stats[profile.category] ?? 0) + 1;
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

  public getProfilesByCategory(
    category: UnifiedFlavorProfile["category"],
  ): UnifiedFlavorProfile[] {
    return this.getAllProfiles().filter(
      (profile) => profile.category === category,
    );
  }
}

/**
 * Run the flavor profile migration
 * Returns statistics about the migration
 */
export async function runFlavorProfileMigration(): Promise<MigrationStats> {
  if (!_migrationInstance) {
    _migrationInstance = new FlavorProfileMigration();
  }
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
export function getMigratedProfilesByCategory(
  category: UnifiedFlavorProfile["category"],
): UnifiedFlavorProfile[] {
  if (!_migrationInstance) {
    return [];
  }
  return _migrationInstance.getProfilesByCategory(category);
}

const flavorProfileMigrationDefault = {
  runFlavorProfileMigration,
  getMigratedFlavorProfiles,
  getMigratedProfilesByCategory,
};

export default flavorProfileMigrationDefault;
