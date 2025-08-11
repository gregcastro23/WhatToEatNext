/**
 * Domain-Specific Testing
 * Tests for astrological code analysis and preservation, recipe/ingredient type suggestions,
 * campaign system flexibility preservation, and service layer interface suggestions
 */

import { AnyTypeClassifier } from '../AnyTypeClassifier';
import { DomainContextAnalyzer } from '../DomainContextAnalyzer';
import { SafeTypeReplacer } from '../SafeTypeReplacer';
import {
    AnyTypeCategory,
    ClassificationContext,
    CodeDomain,
    TypeReplacement
} from '../types';

describe('Domain-Specific Testing', () => {
  let classifier: AnyTypeClassifier;
  let analyzer: DomainContextAnalyzer;
  let replacer: SafeTypeReplacer;

  beforeEach(() => {
    classifier = new AnyTypeClassifier();
    analyzer = new DomainContextAnalyzer();
    replacer = new SafeTypeReplacer();
  });

  const createDomainContext = (
    codeSnippet: string,
    filePath: string,
    domain: CodeDomain,
    surroundingLines: string[] = [],
    hasComment = false,
    comment?: string
  ): ClassificationContext => ({
    filePath,
    lineNumber: 1,
    codeSnippet,
    surroundingLines,
    hasExistingComment: hasComment,
    existingComment: comment,
    isInTestFile: filePath.includes('.test.') || filePath.includes('.spec.'),
    domainContext: {
      domain,
      intentionalityHints: [],
      suggestedTypes: [],
      preservationReasons: []
    }
  });

  describe('Astrological Code Analysis and Preservation', () => {
    describe('Planetary Position Data Preservation', () => {
      test('should preserve planetary position API responses', async () => {
        const context = createDomainContext(
          'const planetaryPositions: any = await getReliablePlanetaryPositions();',
          'src/calculations/planetary/positions.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'import { getReliablePlanetaryPositions } from "@/utils/reliableAstronomy";',
            'export async function calculateCurrentPositions() {'
          ]
        );

        const domainAnalysis = await analyzer.analyzeDomain(context);
        expect(domainAnalysis.domain).toBe(CodeDomain.ASTROLOGICAL);
        expect(domainAnalysis.preservationReasons).toContain(
          'Astrological calculations require compatibility with external astronomical libraries'
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.category).toBe(AnyTypeCategory.EXTERNAL_API);
        expect(classification.reasoning).toContain('planetary position data');
      });

      test('should preserve ephemeris data from external sources', async () => {
        const context = createDomainContext(
          'const ephemerisData: any = astronomyEngine.getEphemeris(date);',
          'src/calculations/ephemeris/calculator.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'import { astronomyEngine } from "astronomy-engine";',
            'function calculateTransits(startDate: Date, endDate: Date) {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('external astronomical data');
        expect(classification.requiresDocumentation).toBe(true);
      });

      test('should preserve Swiss Ephemeris compatibility', async () => {
        const context = createDomainContext(
          'const swissData: any = swisseph.calc_ut(julianDay, planet);',
          'src/calculations/swiss-ephemeris/wrapper.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'import * as swisseph from "swisseph";',
            'export function calculatePlanetPosition(planet: number, date: Date): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.category).toBe(AnyTypeCategory.EXTERNAL_API);
        expect(classification.reasoning).toContain('Swiss Ephemeris');
      });

      test('should preserve NASA JPL Horizons API responses', async () => {
        const context = createDomainContext(
          'const horizonsResponse: any = await nasaJplApi.getHorizonsData(params);',
          'src/services/astronomy/nasa-jpl.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'class NasaJplService {',
            '  async fetchPlanetaryData(params: HorizonsParams): Promise<any> {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('NASA JPL');
        expect(classification.category).toBe(AnyTypeCategory.EXTERNAL_API);
      });
    });

    describe('Elemental Properties Preservation', () => {
      test('should preserve dynamic elemental calculations', async () => {
        const context = createDomainContext(
          'const elementalBalance: any = calculateElementalHarmony(ingredients);',
          'src/calculations/elemental/harmony.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'import { ElementalProperties } from "@/types";',
            'function calculateCompatibility(source: ElementalProperties, target: ElementalProperties): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('elemental');
      });

      test('should suggest specific types for elemental properties when possible', async () => {
        const context = createDomainContext(
          'const fireValue: any = ingredient.fire;',
          'src/calculations/elemental/properties.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'interface ElementalProperties {',
            '  fire: number;',
            '  water: number;'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('number');
      });

      test('should preserve complex elemental compatibility matrices', async () => {
        const context = createDomainContext(
          'const compatibilityMatrix: Record<string, unknown> = buildElementalMatrix();',
          'src/calculations/elemental/compatibility.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'function buildElementalMatrix(): Record<string, unknown> {',
            '  return { Fire: { Fire: 0.9, Water: 0.7 } };'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('dynamic');
      });
    });

    describe('Transit and Timing Calculations', () => {
      test('should preserve transit date validation logic', async () => {
        const context = createDomainContext(
          'const transitData: any = validateTransitDate(planet, date, sign);',
          'src/utils/planetaryConsistencyCheck.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'export function validateTransitDate(planet: string, date: Date, sign: string): any {',
            '  const planetData = require(`@/data/planets/${planet.toLowerCase()}`);'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('transit date');
      });

      test('should preserve retrograde motion calculations', async () => {
        const context = createDomainContext(
          'const retrogradeData: any = calculateRetrogradePhases(planet, year);',
          'src/calculations/retrograde/motion.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'function calculateRetrogradePhases(planet: string, year: number): any {',
            '  const phases = getRetrogradePhases(planet, year);'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('retrograde');
      });
    });

    describe('Astrological Chart Calculations', () => {
      test('should preserve house system calculations', async () => {
        const context = createDomainContext(
          'const houseData: any = calculateHouses(latitude, longitude, time);',
          'src/calculations/houses/systems.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'import { HouseSystem } from "@/types/astrology";',
            'export function calculateHouses(lat: number, lon: number, time: Date): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('house');
      });

      test('should preserve aspect calculations', async () => {
        const context = createDomainContext(
          'const aspects: any[] = calculateAspects(planetPositions);',
          'src/calculations/aspects/calculator.ts',
          CodeDomain.ASTROLOGICAL,
          [
            'function calculateAspects(positions: PlanetaryPosition[]): unknown[] {',
            '  const aspects = [];'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.category).toBe(AnyTypeCategory.ARRAY_TYPE);
      });
    });
  });

  describe('Recipe/Ingredient Type Suggestions', () => {
    describe('Ingredient Data Type Suggestions', () => {
      test('should suggest Ingredient interface for ingredient data', async () => {
        const context = createDomainContext(
          'const ingredient: any = getIngredientData(name);',
          'src/data/ingredients/processor.ts',
          CodeDomain.RECIPE,
          [
            'import { Ingredient } from "@/types";',
            'export function processIngredient(name: string): Ingredient {'
          ]
        );

        const domainAnalysis = await analyzer.analyzeDomain(context);
        expect(domainAnalysis.suggestedTypes).toContain('Ingredient');

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('Ingredient');
      });

      test('should suggest specific ingredient subtypes', async () => {
        const contexts = [
          createDomainContext(
            'const spice: any = getSpiceProperties(name);',
            'src/data/ingredients/spices.ts',
            CodeDomain.RECIPE
          ),
          createDomainContext(
            'const herb: any = getHerbData(name);',
            'src/data/ingredients/herbs.ts',
            CodeDomain.RECIPE
          ),
          createDomainContext(
            'const vegetable: any = getVegetableInfo(name);',
            'src/data/ingredients/vegetables.ts',
            CodeDomain.RECIPE
          )
        ];

        for (const context of contexts) {
          const domainAnalysis = await analyzer.analyzeDomain(context);
          const classification = await classifier.classify(context);

          expect(classification.isIntentional).toBe(false);
          expect(domainAnalysis.suggestedTypes.length).toBeGreaterThan(0);

          if (context.filePath.includes('spices')) {
            expect(domainAnalysis.suggestedTypes).toContain('Spice');
          } else if (context.filePath.includes('herbs')) {
            expect(domainAnalysis.suggestedTypes).toContain('Herb');
          } else if (context.filePath.includes('vegetables')) {
            expect(domainAnalysis.suggestedTypes).toContain('Vegetable');
          }
        }
      });

      test('should suggest array types for ingredient collections', async () => {
        const context = createDomainContext(
          'const ingredients: any[] = getAllIngredients();',
          'src/data/ingredients/collection.ts',
          CodeDomain.RECIPE,
          [
            'export function getAllIngredients(): Ingredient[] {',
            '  return ingredientDatabase.getAll();'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.category).toBe(AnyTypeCategory.ARRAY_TYPE);
        expect(classification.suggestedReplacement).toBe('Ingredient[]');
      });

      test('should suggest nutritional info types', async () => {
        const context = createDomainContext(
          'const nutrition: any = getNutritionalData(ingredient);',
          'src/data/nutrition/calculator.ts',
          CodeDomain.RECIPE,
          [
            'import { NutritionalInfo } from "@/types";',
            'function calculateNutrition(ingredient: Ingredient): NutritionalInfo {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('NutritionalInfo');
      });
    });

    describe('Recipe Data Type Suggestions', () => {
      test('should suggest Recipe interface for recipe data', async () => {
        const context = createDomainContext(
          'const recipe: any = buildRecipe(ingredients, instructions);',
          'src/data/recipes/builder.ts',
          CodeDomain.RECIPE,
          [
            'import { Recipe, Ingredient, CookingInstruction } from "@/types";',
            'export function buildRecipe(ingredients: Ingredient[], instructions: CookingInstruction[]): Recipe {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('Recipe');
      });

      test('should suggest cooking method types', async () => {
        const context = createDomainContext(
          'const method: any = selectCookingMethod(ingredients);',
          'src/data/cooking/methods.ts',
          CodeDomain.RECIPE,
          [
            'import { CookingMethod } from "@/types";',
            'export function selectOptimalMethod(ingredients: Ingredient[]): CookingMethod {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('CookingMethod');
      });

      test('should suggest cuisine type for cultural data', async () => {
        const context = createDomainContext(
          'const cuisine: any = identifyCuisineType(recipe);',
          'src/data/cuisines/classifier.ts',
          CodeDomain.RECIPE,
          [
            'import { CuisineType } from "@/types";',
            'function classifyCuisine(recipe: Recipe): CuisineType {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('CuisineType');
      });
    });

    describe('External Food API Preservation', () => {
      test('should preserve Spoonacular API responses', async () => {
        const context = createDomainContext(
          'const spoonacularData: any = await spoonacularApi.getRecipe(id);',
          'src/services/external/spoonacular.ts',
          CodeDomain.RECIPE,
          [
            'class SpoonacularService {',
            '  async fetchRecipeData(recipeId: number): Promise<any> {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.category).toBe(AnyTypeCategory.EXTERNAL_API);
        expect(classification.reasoning).toContain('API');
      });

      test('should preserve USDA Food Data Central responses', async () => {
        const context = createDomainContext(
          'const usdaResponse: any = await usdaApi.getFoodData(fdcId);',
          'src/services/external/usda.ts',
          CodeDomain.RECIPE,
          [
            'async function fetchNutritionalData(fdcId: string): Promise<any> {',
            '  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}`);'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('USDA');
      });
    });

    describe('Elemental Properties in Recipe Context', () => {
      test('should suggest ElementalProperties for ingredient elements', async () => {
        const context = createDomainContext(
          'const elements: any = ingredient.elementalProperties;',
          'src/data/ingredients/elemental.ts',
          CodeDomain.RECIPE,
          [
            'interface Ingredient {',
            '  elementalProperties: ElementalProperties;',
            '}'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('ElementalProperties');
      });

      test('should preserve dynamic elemental calculations in recipes', async () => {
        const context = createDomainContext(
          'const harmony: any = calculateRecipeHarmony(recipe);',
          'src/calculations/recipe/harmony.ts',
          CodeDomain.RECIPE,
          [
            'function calculateRecipeHarmony(recipe: Recipe): any {',
            '  return recipe.ingredients.reduce((harmony, ingredient) => {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('harmony');
      });
    });
  });

  describe('Campaign System Flexibility Preservation', () => {
    describe('Dynamic Configuration Preservation', () => {
      test('should preserve campaign configuration flexibility', async () => {
        const context = createDomainContext(
          'const campaignConfig: any = loadDynamicConfig(environment);',
          'src/services/campaign/ConfigLoader.ts',
          CodeDomain.CAMPAIGN,
          [
            'export class ConfigLoader {',
            '  loadDynamicConfig(env: string): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.category).toBe(AnyTypeCategory.DYNAMIC_CONFIG);
        expect(classification.reasoning).toContain('dynamic');
      });

      test('should preserve adaptive strategy configurations', async () => {
        const context = createDomainContext(
          'const adaptiveSettings: any = calculateOptimalSettings(metrics);',
          'src/services/campaign/AdaptiveStrategy.ts',
          CodeDomain.CAMPAIGN,
          [
            'class AdaptiveStrategy {',
            '  calculateOptimalSettings(metrics: ProgressMetrics): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('adaptive');
      });

      test('should preserve intelligence system configurations', async () => {
        const context = createDomainContext(
          'const intelligenceConfig: any = buildIntelligenceSystem(params);',
          'src/services/campaign/IntelligenceSystem.ts',
          CodeDomain.CAMPAIGN,
          [
            'export class IntelligenceSystem {',
            '  buildIntelligenceSystem(params: IntelligenceParams): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('intelligence');
      });
    });

    describe('Metrics and Progress Tracking', () => {
      test('should suggest specific types for well-defined metrics', async () => {
        const context = createDomainContext(
          'const progress: any = calculateProgress();',
          'src/services/campaign/ProgressTracker.ts',
          CodeDomain.CAMPAIGN,
          [
            'import { ProgressMetrics } from "@/types";',
            'function calculateProgress(): ProgressMetrics {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('ProgressMetrics');
      });

      test('should preserve dynamic metrics calculations', async () => {
        const context = createDomainContext(
          'const dynamicMetrics: any = aggregateMetrics(sources);',
          'src/services/campaign/MetricsAggregator.ts',
          CodeDomain.CAMPAIGN,
          [
            'function aggregateMetrics(sources: MetricsSource[]): any {',
            '  return sources.reduce((agg, source) => ({ ...agg, ...source.getMetrics() }), {});'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('dynamic');
      });

      test('should suggest TypeScriptError for error analysis', async () => {
        const context = createDomainContext(
          'const errors: any[] = analyzeTypeScriptErrors();',
          'src/services/campaign/TypeScriptErrorAnalyzer.ts',
          CodeDomain.CAMPAIGN,
          [
            'import { TypeScriptError } from "@/types";',
            'function analyzeTypeScriptErrors(): TypeScriptError[] {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('TypeScriptError[]');
      });
    });

    describe('Tool Integration Flexibility', () => {
      test('should preserve tool integration configurations', async () => {
        const context = createDomainContext(
          'const toolConfig: any = integrateExternalTool(toolName, settings);',
          'src/services/campaign/ToolIntegration.ts',
          CodeDomain.CAMPAIGN,
          [
            'class ToolIntegration {',
            '  integrateExternalTool(name: string, settings: unknown): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('tool integration');
      });

      test('should preserve validation framework flexibility', async () => {
        const context = createDomainContext(
          'const validationResult: any = runValidation(rules, data);',
          'src/services/campaign/ValidationFramework.ts',
          CodeDomain.CAMPAIGN,
          [
            'export class ValidationFramework {',
            '  runValidation(rules: ValidationRule[], data: unknown): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('validation');
      });
    });

    describe('Safety Protocol Flexibility', () => {
      test('should preserve safety event handling', async () => {
        const context = createDomainContext(
          'const safetyEvent: any = createSafetyEvent(type, data);',
          'src/services/campaign/SafetyProtocol.ts',
          CodeDomain.CAMPAIGN,
          [
            'class SafetyProtocol {',
            '  createSafetyEvent(type: SafetyEventType, data: unknown): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('safety');
      });

      test('should preserve rollback mechanism flexibility', async () => {
        const context = createDomainContext(
          'const rollbackData: any = prepareRollback(changes);',
          'src/services/campaign/RollbackManager.ts',
          CodeDomain.CAMPAIGN,
          [
            'export class RollbackManager {',
            '  prepareRollback(changes: FileChange[]): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('rollback');
      });
    });
  });

  describe('Service Layer Interface Suggestions', () => {
    describe('API Service Interface Suggestions', () => {
      test('should suggest ApiResponse for API service responses', async () => {
        const context = createDomainContext(
          'const response: any = await this.httpClient.get(endpoint);',
          'src/services/api/BaseApiService.ts',
          CodeDomain.SERVICE,
          [
            'export class BaseApiService {',
            '  async get<T>(endpoint: string): Promise<ApiResponse<T>> {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('ApiResponse<T>');
      });

      test('should suggest specific service interfaces', async () => {
        const contexts = [
          createDomainContext(
            'const service: any = new RecommendationService();',
            'src/services/RecommendationService.ts',
            CodeDomain.SERVICE
          ),
          createDomainContext(
            'const astroService: any = new AstrologicalService();',
            'src/services/AstrologicalService.ts',
            CodeDomain.SERVICE
          ),
          createDomainContext(
            'const recipeService: any = new RecipeService();',
            'src/services/RecipeService.ts',
            CodeDomain.SERVICE
          )
        ];

        for (const context of contexts) {
          const classification = await classifier.classify(context);
          expect(classification.isIntentional).toBe(false);

          if (context.filePath.includes('Recommendation')) {
            expect(classification.suggestedReplacement).toBe('RecommendationService');
          } else if (context.filePath.includes('Astrological')) {
            expect(classification.suggestedReplacement).toBe('AstrologicalService');
          } else if (context.filePath.includes('Recipe')) {
            expect(classification.suggestedReplacement).toBe('RecipeService');
          }
        }
      });

      test('should preserve external service integration flexibility', async () => {
        const context = createDomainContext(
          'const externalService: any = createExternalServiceClient(config);',
          'src/services/external/ExternalServiceFactory.ts',
          CodeDomain.SERVICE,
          [
            'export class ExternalServiceFactory {',
            '  createExternalServiceClient(config: ServiceConfig): any {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('external service');
      });
    });

    describe('Data Transformation Service Suggestions', () => {
      test('should suggest specific transformer interfaces', async () => {
        const context = createDomainContext(
          'const transformer: any = new DataTransformer();',
          'src/services/data/DataTransformer.ts',
          CodeDomain.SERVICE,
          [
            'export class DataTransformer {',
            '  transform<T, U>(data: T): U {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('DataTransformer');
      });

      test('should suggest mapper interfaces for data mapping', async () => {
        const context = createDomainContext(
          'const mapper: any = createMapper(sourceSchema, targetSchema);',
          'src/services/data/SchemaMapper.ts',
          CodeDomain.SERVICE,
          [
            'export function createMapper(source: Schema, target: Schema): any {',
            '  return new SchemaMapper(source, target);'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('SchemaMapper');
      });
    });

    describe('Caching Service Interface Suggestions', () => {
      test('should suggest cache interface types', async () => {
        const context = createDomainContext(
          'const cache: any = new CacheService();',
          'src/services/cache/CacheService.ts',
          CodeDomain.SERVICE,
          [
            'export class CacheService {',
            '  get<T>(key: string): Promise<T | null> {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('CacheService');
      });

      test('should suggest cache entry types', async () => {
        const context = createDomainContext(
          'const entry: any = cache.get(key);',
          'src/services/cache/CacheManager.ts',
          CodeDomain.SERVICE,
          [
            'class CacheManager {',
            '  async getCacheEntry(key: string): Promise<CacheEntry | null> {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('CacheEntry | null');
      });
    });

    describe('Validation Service Interface Suggestions', () => {
      test('should suggest validation result interfaces', async () => {
        const context = createDomainContext(
          'const result: any = validator.validate(data);',
          'src/services/validation/ValidationService.ts',
          CodeDomain.SERVICE,
          [
            'export class ValidationService {',
            '  validate(data: unknown): ValidationResult {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('ValidationResult');
      });

      test('should suggest schema validation interfaces', async () => {
        const context = createDomainContext(
          'const schema: any = buildValidationSchema(rules);',
          'src/services/validation/SchemaBuilder.ts',
          CodeDomain.SERVICE,
          [
            'import { ValidationSchema } from "@/types";',
            'function buildValidationSchema(rules: ValidationRule[]): ValidationSchema {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('ValidationSchema');
      });
    });

    describe('Service Error Handling', () => {
      test('should preserve service error handling flexibility', async () => {
        const context = createDomainContext(
          'const error: any = new ServiceError(message, code);',
          'src/services/errors/ServiceError.ts',
          CodeDomain.SERVICE,
          [
            'export class ServiceError extends Error {',
            '  constructor(message: string, code: string, details?: unknown) {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(true);
        expect(classification.reasoning).toContain('error');
      });

      test('should suggest specific error types when available', async () => {
        const context = createDomainContext(
          'const apiError: any = handleApiError(response);',
          'src/services/errors/ApiErrorHandler.ts',
          CodeDomain.SERVICE,
          [
            'import { ApiError } from "@/types";',
            'function handleApiError(response: Response): ApiError {'
          ]
        );

        const classification = await classifier.classify(context);
        expect(classification.isIntentional).toBe(false);
        expect(classification.suggestedReplacement).toBe('ApiError');
      });
    });
  });

  describe('Cross-Domain Integration', () => {
    test('should handle mixed domain contexts appropriately', async () => {
      // Test a service that integrates astrological calculations with recipe recommendations
      const context = createDomainContext(
        'const recommendation: any = await astroRecipeService.getRecommendation(userChart, preferences);',
        'src/services/AstrologicalRecipeService.ts',
        CodeDomain.SERVICE,
        [
          'export class AstrologicalRecipeService {',
          '  async getRecommendation(chart: AstrologyChart, prefs: UserPreferences): Promise<RecipeRecommendation> {'
        ]
      );

      const classification = await classifier.classify(context);
      expect(classification.isIntentional).toBe(false);
      expect(classification.suggestedReplacement).toBe('RecipeRecommendation');
    });

    test('should preserve campaign system integration with domain services', async () => {
      const context = createDomainContext(
        'const campaignData: any = integrateDomainServices(services);',
        'src/services/campaign/DomainIntegration.ts',
        CodeDomain.CAMPAIGN,
        [
          'class DomainIntegration {',
          '  integrateDomainServices(services: DomainService[]): any {'
        ]
      );

      const classification = await classifier.classify(context);
      expect(classification.isIntentional).toBe(true);
      expect(classification.reasoning).toContain('integration');
    });
  });

  describe('Type Replacement Integration', () => {
    test('should apply domain-specific replacements correctly', async () => {
      const replacements: TypeReplacement[] = [
        {
          original: 'any',
          replacement: 'Ingredient',
          filePath: 'src/data/ingredients/processor.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        },
        {
          original: 'any',
          replacement: 'PlanetaryPosition',
          filePath: 'src/calculations/planetary/positions.ts',
          lineNumber: 1,
          confidence: 0.8,
          validationRequired: true
        },
        {
          original: 'any',
          replacement: 'ProgressMetrics',
          filePath: 'src/services/campaign/ProgressTracker.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        }
      ];

      // Mock file system for domain-specific content
      jest.spyOn(require('fs'), 'readFileSync').mockImplementation((path: unknown) => {
        if (path.includes('ingredients')) return 'const ingredient: any = getData();';
        if (path.includes('planetary')) return 'const position: any = calculate();';
        if (path.includes('campaign')) return 'const metrics: unknown = getProgress();';
        return 'backup content';
      });

      jest.spyOn(require('fs'), 'writeFileSync').mockImplementation(() => undefined);
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);

      // Mock successful compilation
      jest.spyOn(require('child_process'), 'execSync').mockReturnValue('');

      const results = await Promise.all(
        replacements.map(replacement => replacer.applyReplacement(replacement))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.appliedReplacements).toHaveLength(1);
      });
    });
  });
});
