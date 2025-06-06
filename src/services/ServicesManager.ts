import { Recipe } from '@/types/recipe';
import { createLogger } from '../utils/logger';
import { Element } from "@/types/alchemy";
import { PlanetaryPosition } from "@/types/celestial";

// Initialize logger
const logger = createLogger('ServicesManager');

// Define initialization states
export enum InitializationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Define service initialization result
export interface ServiceInitializationResult {
  success: boolean;
  serviceName: string;
  message?: string;
  error?: Error;
  timestamp: number;
}

/**
 * ServicesManager
 * 
 * A central point for initializing and accessing all services.
 * This class follows the singleton pattern and ensures all services
 * are properly initialized before use.
 */
export class ServicesManager {
  private static instance: ServicesManager;
  private _isInitialized: boolean = false;
  private _initializationError: Error | null = null;
  private _initializationStatus: InitializationStatus = InitializationStatus.NOT_STARTED;
  private _serviceResults: ServiceInitializationResult[] = [];
  
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ServicesManager {
    if (!ServicesManager.instance) {
      ServicesManager.instance = new ServicesManager();
    }
    return ServicesManager.instance;
  }
  
  /**
   * Check if services are initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }
  
  /**
   * Get initialization error, if any
   */
  get initializationError(): Error | null {
    return this._initializationError;
  }
  
  /**
   * Get current initialization status
   */
  get initializationStatus(): InitializationStatus {
    return this._initializationStatus;
  }
  
  /**
   * Get detailed initialization results
   */
  get serviceResults(): ServiceInitializationResult[] {
    return [...this._serviceResults];
  }
  
  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      logger.info('Services already initialized');
      return;
    }
    
    if (this._initializationStatus === InitializationStatus.IN_PROGRESS) {
      logger.warn('Services initialization already in progress');
      return;
    }
    
    try {
      this._initializationStatus = InitializationStatus.IN_PROGRESS;
      this._serviceResults = [];
      logger.info('Initializing services...');
      
      // Initialize AlchemicalEngine first
      await this.initializeAlchemicalEngine();
      
      // Initialize AstrologyService next since others may depend on it
      await this.initializeAstrologyService();
      
      // Then initialize other services
      await this.initializeIngredientService();
      await this.initializeRecipeService();
      await this.initializeRecommendationService();
      await this.initializeAlchemicalRecommendationService();
      
      this._isInitialized = true;
      this._initializationStatus = InitializationStatus.COMPLETED;
      logger.info('All services initialized successfully');
    } catch (error) {
      this._initializationError = error instanceof Error ? error : new Error(String(error));
      this._initializationStatus = InitializationStatus.FAILED;
      logger.error('Error initializing services:', this._initializationError);
      throw this._initializationError;
    }
  }
  
  /**
   * Initialize the AlchemicalEngine
   */
  private async initializeAlchemicalEngine(): Promise<void> {
    try {
      logger.info('Initializing AlchemicalEngine...');
      
      // The engine is already initialized through its singleton instance
      // Just perform a simple operation to verify it's working
      const dummyPositions = {
        Sun: 'aries',
        moon: 'taurus',
        Mercury: 'gemini',
        Venus: 'cancer',
        Mars: 'leo',
        Jupiter: 'virgo',
        Saturn: 'libra',
        Uranus: 'scorpio',
        Neptune: 'sagittarius',
        Pluto: 'capricorn',
        Ascendant: 'aquarius'
      };
      
      const result = alchemicalEngine.alchemize(dummyPositions);
      logger.info('AlchemicalEngine test calculation completed');
      
      this._serviceResults?.push({
        success: true,
        serviceName: 'AlchemicalEngine',
        message: 'Engine initialized successfully',
        timestamp: Date.now()
      });
      
      logger.info('AlchemicalEngine initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error initializing AlchemicalEngine:', errorMessage);
      
      this._serviceResults?.push({
        success: false,
        serviceName: 'AlchemicalEngine',
        message: 'Failed to initialize engine',
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Initialize the AstrologyService
   */
  private async initializeAstrologyService(): Promise<void> {
    try {
      logger.info('Initializing AstrologyService...');
      
      // The astrologyService is already initialized through its singleton instance
      // Just perform any additional setup if needed
      const positions = await astrologyService.getCurrentPlanetaryPositions();
      logger.info(`AstrologyService loaded positions for ${Object.keys(positions || {}).length} celestial bodies`);
      
      this._serviceResults?.push({
        success: true,
        serviceName: 'AstrologyService',
        message: 'Service initialized successfully',
        timestamp: Date.now()
      });
      
      logger.info('AstrologyService initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error initializing AstrologyService:', errorMessage);
      
      this._serviceResults?.push({
        success: false,
        serviceName: 'AstrologyService',
        message: 'Failed to initialize service',
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Initialize the IngredientService
   */
  private async initializeIngredientService(): Promise<void> {
    try {
      logger.info('Initializing IngredientService...');
      
      // The unifiedIngredientService is already initialized through its singleton instance
      // We just need to ensure it's used
      const ingredients = unifiedIngredientService.getAllIngredientsFlat();
      logger.info(`IngredientService loaded (${(ingredients  || []).length} ingredients`);
      
      this._serviceResults?.push({
        success: true,
        serviceName: 'IngredientService',
        message: `Loaded (${(ingredients  || []).length} ingredients`,
        timestamp: Date.now()
      });
      
      logger.info('IngredientService initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error initializing IngredientService:', errorMessage);
      
      this._serviceResults?.push({
        success: false,
        serviceName: 'IngredientService',
        message: 'Failed to initialize service',
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Initialize the RecipeService
   */
  private async initializeRecipeService(): Promise<void> {
    try {
      logger.info('Initializing RecipeService...');
      
      // The unifiedRecipeService is already initialized through its singleton instance
      // We just need to ensure it's used
      const recipes = await unifiedRecipeService.getAllRecipes();
      logger.info(`RecipeService loaded (${(recipes  || []).length} recipes`);
      
      this._serviceResults?.push({
        success: true,
        serviceName: 'RecipeService',
        message: `Loaded (${(recipes  || []).length} recipes`,
        timestamp: Date.now()
      });
      
      logger.info('RecipeService initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error initializing RecipeService:', errorMessage);
      
      this._serviceResults?.push({
        success: false,
        serviceName: 'RecipeService',
        message: 'Failed to initialize service',
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Initialize the RecommendationService
   */
  private async initializeRecommendationService(): Promise<void> {
    try {
      logger.info('Initializing RecommendationService...');
      
      // The unifiedRecommendationService is already initialized through its singleton instance
      // Just verify that it's ready by performing a simple operation
      const elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
      };
      
      // Just calculate compatibility as a simple test
      const compatibility = unifiedRecommendationService.calculateElementalCompatibility(
        elementalProperties,
        elementalProperties
      );
      
      logger.info(`RecommendationService verification: ${compatibility}`);
      
      this._serviceResults?.push({
        success: true,
        serviceName: 'RecommendationService',
        message: 'Service initialized successfully',
        timestamp: Date.now()
      });
      
      logger.info('RecommendationService initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error initializing RecommendationService:', errorMessage);
      
      this._serviceResults?.push({
        success: false,
        serviceName: 'RecommendationService',
        message: 'Failed to initialize service',
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Initialize the AlchemicalRecommendationService
   */
  private async initializeAlchemicalRecommendationService(): Promise<void> {
    try {
      logger.info('Initializing AlchemicalRecommendationService...');
      
      // Ensure the service is initialized
      // Just verify with a simple test operation
      const dummyPositions = {
        Sun: 'aries',
        moon: 'taurus',
        Mercury: 'gemini',
        Venus: 'cancer',
        Mars: 'leo',
        Jupiter: 'virgo',
        Saturn: 'libra',
        Uranus: 'scorpio',
        Neptune: 'sagittarius',
        Pluto: 'capricorn',
        Ascendant: 'aquarius'
      };
      
      // If service is working, this won't throw an error
      const recipeRecommendations = alchemicalRecommendationService.getRecipeRecommendations(
        { id: 'test', name: 'Test Recipe', ingredients: [], instructions: [] },
        dummyPositions
      );
      
      logger.info('AlchemicalRecommendationService test completed');
      
      this._serviceResults?.push({
        success: true,
        serviceName: 'AlchemicalRecommendationService',
        message: 'Service initialized successfully',
        timestamp: Date.now()
      });
      
      logger.info('AlchemicalRecommendationService initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error initializing AlchemicalRecommendationService:', errorMessage);
      
      this._serviceResults?.push({
        success: false,
        serviceName: 'AlchemicalRecommendationService',
        message: 'Failed to initialize service',
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Get all services
   */
  getServices() {
    if (!this._isInitialized) {
      throw new Error('ServicesManager not initialized. Call initialize() first.');
    }
    
    return {
      alchemicalEngine,
      astrologyService,
      ingredientService: unifiedIngredientService,
      recipeService: unifiedRecipeService,
      recommendationService: unifiedRecommendationService,
      alchemicalRecommendationService
    };
  }
  
  /**
   * Reset initialization state (primarily for testing)
   */
  reset(): void {
    this._isInitialized = false;
    this._initializationError = null;
    this._initializationStatus = InitializationStatus.NOT_STARTED;
    this._serviceResults = [];
    logger.info('ServicesManager reset completed');
  }
}

// Export singleton instance
export const servicesManager = ServicesManager.getInstance();

// Export default for compatibility with existing code
export default servicesManager; 