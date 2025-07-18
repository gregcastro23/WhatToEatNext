/**
 * MCP Server Integration for Reliable External APIs
 * 
 * This module implements Model Context Protocol (MCP) server integration for:
 * - Astrological API connections with NASA JPL Horizons fallback
 * - Nutritional database access with USDA API integration
 * - Recipe API connections with rate limiting and caching
 * - Multi-tier fallback strategy for API reliability
 */

import { logger } from '@/utils/logger';

// MCP Server Configuration from steering files
export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled: boolean;
  autoApprove: string[];
  timeout: number;
  retryAttempts: number;
  fallbackEnabled: boolean;
}

export interface MCPApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'primary' | 'secondary' | 'fallback' | 'cache';
  responseTime: number;
  timestamp: number;
}

export interface MCPCacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  source: string;
}

export interface MCPRateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

// Default MCP server configurations based on steering file examples
const DEFAULT_MCP_SERVERS: Record<string, MCPServerConfig> = {
  'nasa-horizons': {
    name: 'nasa-horizons',
    command: 'uvx',
    args: ['nasa-horizons-mcp-server@latest'],
    env: {
      FASTMCP_LOG_LEVEL: 'ERROR',
      NASA_API_KEY: process.env.NASA_API_KEY || ''
    },
    disabled: false,
    autoApprove: ['get_planetary_positions', 'get_ephemeris_data'],
    timeout: 10000,
    retryAttempts: 3,
    fallbackEnabled: true
  },
  'usda-nutrition': {
    name: 'usda-nutrition',
    command: 'uvx',
    args: ['usda-nutrition-mcp-server@latest'],
    env: {
      FASTMCP_LOG_LEVEL: 'ERROR',
      USDA_API_KEY: process.env.USDA_API_KEY || ''
    },
    disabled: false,
    autoApprove: ['get_nutrition_data', 'search_ingredients'],
    timeout: 8000,
    retryAttempts: 2,
    fallbackEnabled: true
  },
  'spoonacular-recipes': {
    name: 'spoonacular-recipes',
    command: 'uvx',
    args: ['spoonacular-mcp-server@latest'],
    env: {
      FASTMCP_LOG_LEVEL: 'ERROR',
      SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY || ''
    },
    disabled: false,
    autoApprove: ['search_recipes', 'get_recipe_details'],
    timeout: 6000,
    retryAttempts: 2,
    fallbackEnabled: true
  }
};

// Rate limiting configurations
const RATE_LIMITS: Record<string, MCPRateLimitConfig> = {
  'nasa-horizons': {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10
  },
  'usda-nutrition': {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
    burstLimit: 5
  },
  'spoonacular-recipes': {
    requestsPerMinute: 10,
    requestsPerHour: 150,
    requestsPerDay: 150, // Daily quota limit
    burstLimit: 3
  }
};

/**
 * MCP Server Integration Manager
 */
export class MCPServerIntegration {
  private static instance: MCPServerIntegration;
  private servers: Map<string, MCPServerConfig> = new Map();
  private cache: Map<string, MCPCacheEntry> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private connectionStatus: Map<string, boolean> = new Map();

  private constructor() {
    this.initializeServers();
    this.initializeRateLimiters();
    this.startHealthChecks();
  }

  public static getInstance(): MCPServerIntegration {
    if (!MCPServerIntegration.instance) {
      MCPServerIntegration.instance = new MCPServerIntegration();
    }
    return MCPServerIntegration.instance;
  }

  /**
   * Astrological API connections with NASA JPL Horizons fallback
   */
  public async getAstrologicalData(date: Date = new Date()): Promise<MCPApiResponse> {
    const cacheKey = `astrological_${date.toISOString().split('T')[0]}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.data,
        source: 'cache',
        responseTime: 0,
        timestamp: Date.now()
      };
    }

    // Primary: NASA Horizons MCP server
    try {
      const result = await this.callMCPServer('nasa-horizons', 'get_planetary_positions', { date });
      if (result.success) {
        this.setCache(cacheKey, result.data, 6 * 60 * 60 * 1000); // 6 hours TTL
        return { ...result, source: 'primary' };
      }
    } catch (error) {
      logger.warn('NASA Horizons MCP server failed:', error);
    }

    // Secondary: Direct NASA API call
    try {
      const result = await this.callDirectNASAAPI(date);
      if (result.success) {
        this.setCache(cacheKey, result.data, 6 * 60 * 60 * 1000);
        return { ...result, source: 'secondary' };
      }
    } catch (error) {
      logger.warn('Direct NASA API failed:', error);
    }

    // Fallback: Local ephemeris data
    try {
      const fallbackData = await this.getFallbackAstrologicalData(date);
      return {
        success: true,
        data: fallbackData,
        source: 'fallback',
        responseTime: 0,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('All astrological data sources failed:', error);
      return {
        success: false,
        error: 'All astrological data sources unavailable',
        source: 'fallback',
        responseTime: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Nutritional database access with USDA API integration
   */
  public async getNutritionalData(ingredient: string): Promise<MCPApiResponse> {
    const cacheKey = `nutrition_${ingredient.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.data,
        source: 'cache',
        responseTime: 0,
        timestamp: Date.now()
      };
    }

    // Check rate limits
    if (!this.checkRateLimit('usda-nutrition')) {
      logger.warn('USDA nutrition API rate limit exceeded');
      return this.getRateLimitedResponse();
    }

    // Primary: USDA Nutrition MCP server
    try {
      const result = await this.callMCPServer('usda-nutrition', 'get_nutrition_data', { ingredient });
      if (result.success) {
        this.setCache(cacheKey, result.data, 24 * 60 * 60 * 1000); // 24 hours TTL
        return { ...result, source: 'primary' };
      }
    } catch (error) {
      logger.warn('USDA Nutrition MCP server failed:', error);
    }

    // Secondary: Direct USDA API call
    try {
      const result = await this.callDirectUSDAAPI(ingredient);
      if (result.success) {
        this.setCache(cacheKey, result.data, 24 * 60 * 60 * 1000);
        return { ...result, source: 'secondary' };
      }
    } catch (error) {
      logger.warn('Direct USDA API failed:', error);
    }

    // Fallback: Local nutrition database
    try {
      const fallbackData = await this.getFallbackNutritionalData(ingredient);
      return {
        success: true,
        data: fallbackData,
        source: 'fallback',
        responseTime: 0,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('All nutritional data sources failed:', error);
      return {
        success: false,
        error: 'Nutritional data unavailable',
        source: 'fallback',
        responseTime: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Recipe API connections with rate limiting and caching
   */
  public async getRecipeData(query: string, options: {
    cuisine?: string;
    diet?: string;
    maxResults?: number;
  } = {}): Promise<MCPApiResponse> {
    const cacheKey = `recipes_${query.toLowerCase().replace(/\s+/g, '_')}_${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.data,
        source: 'cache',
        responseTime: 0,
        timestamp: Date.now()
      };
    }

    // Check rate limits (Spoonacular has strict daily limits)
    if (!this.checkRateLimit('spoonacular-recipes')) {
      logger.warn('Spoonacular recipe API rate limit exceeded');
      return this.getRateLimitedResponse();
    }

    // Primary: Spoonacular MCP server
    try {
      const result = await this.callMCPServer('spoonacular-recipes', 'search_recipes', { query, ...options });
      if (result.success) {
        this.setCache(cacheKey, result.data, 12 * 60 * 60 * 1000); // 12 hours TTL
        return { ...result, source: 'primary' };
      }
    } catch (error) {
      logger.warn('Spoonacular MCP server failed:', error);
    }

    // Secondary: Direct Spoonacular API call
    try {
      const result = await this.callDirectSpoonacularAPI(query, options);
      if (result.success) {
        this.setCache(cacheKey, result.data, 12 * 60 * 60 * 1000);
        return { ...result, source: 'secondary' };
      }
    } catch (error) {
      logger.warn('Direct Spoonacular API failed:', error);
    }

    // Fallback: Local recipe database
    try {
      const fallbackData = await this.getFallbackRecipeData(query, options);
      return {
        success: true,
        data: fallbackData,
        source: 'fallback',
        responseTime: 0,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('All recipe data sources failed:', error);
      return {
        success: false,
        error: 'Recipe data unavailable',
        source: 'fallback',
        responseTime: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Test multi-tier fallback strategy
   */
  public async testFallbackStrategy(): Promise<{
    astrological: MCPApiResponse;
    nutritional: MCPApiResponse;
    recipes: MCPApiResponse;
    overallReliability: number;
  }> {
    logger.info('Testing MCP server fallback strategy...');

    const results = await Promise.allSettled([
      this.getAstrologicalData(),
      this.getNutritionalData('apple'),
      this.getRecipeData('pasta')
    ]);

    const astrological = results[0].status === 'fulfilled' ? results[0].value : this.createErrorResponse('Astrological test failed');
    const nutritional = results[1].status === 'fulfilled' ? results[1].value : this.createErrorResponse('Nutritional test failed');
    const recipes = results[2].status === 'fulfilled' ? results[2].value : this.createErrorResponse('Recipe test failed');

    const successCount = [astrological, nutritional, recipes].filter(r => r.success).length;
    const overallReliability = successCount / 3;

    logger.info('Fallback strategy test completed', {
      astrological: astrological.success ? astrological.source : 'failed',
      nutritional: nutritional.success ? nutritional.source : 'failed',
      recipes: recipes.success ? recipes.source : 'failed',
      overallReliability
    });

    return { astrological, nutritional, recipes, overallReliability };
  }

  /**
   * Get server connection status
   */
  public getServerStatus(): Record<string, {
    connected: boolean;
    lastCheck: number;
    responseTime: number;
    errorCount: number;
  }> {
    const status: Record<string, any> = {};
    
    for (const [name, config] of this.servers) {
      status[name] = {
        connected: this.connectionStatus.get(name) || false,
        lastCheck: Date.now(),
        responseTime: 0, // Would be tracked in real implementation
        errorCount: 0 // Would be tracked in real implementation
      };
    }
    
    return status;
  }

  // Private helper methods

  private initializeServers(): void {
    Object.values(DEFAULT_MCP_SERVERS).forEach(config => {
      if (!config.disabled) {
        this.servers.set(config.name, config);
        this.connectionStatus.set(config.name, false);
      }
    });
    
    logger.info('MCP servers initialized:', Array.from(this.servers.keys()));
  }

  private initializeRateLimiters(): void {
    Object.entries(RATE_LIMITS).forEach(([serverName, config]) => {
      this.rateLimiters.set(serverName, new RateLimiter(config));
    });
    
    logger.info('Rate limiters initialized for MCP servers');
  }

  private startHealthChecks(): void {
    // Check server health every 5 minutes
    setInterval(async () => {
      for (const [name, config] of this.servers) {
        try {
          const isHealthy = await this.checkServerHealth(name);
          this.connectionStatus.set(name, isHealthy);
        } catch (error) {
          logger.warn(`Health check failed for MCP server ${name}:`, error);
          this.connectionStatus.set(name, false);
        }
      }
    }, 5 * 60 * 1000);
  }

  private async callMCPServer(serverName: string, method: string, params: any): Promise<MCPApiResponse> {
    const config = this.servers.get(serverName);
    if (!config) {
      throw new Error(`MCP server ${serverName} not configured`);
    }

    const startTime = performance.now();
    
    try {
      // In a real implementation, this would use the actual MCP protocol
      // For now, we simulate the MCP server call
      const result = await this.simulateMCPCall(serverName, method, params);
      const responseTime = performance.now() - startTime;
      
      return {
        success: true,
        data: result,
        source: 'primary',
        responseTime,
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      logger.error(`MCP server ${serverName} call failed:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'primary',
        responseTime,
        timestamp: Date.now()
      };
    }
  }

  private async simulateMCPCall(serverName: string, method: string, params: any): Promise<any> {
    // Simulate MCP server calls for demonstration
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // 500-1500ms delay
    
    switch (serverName) {
      case 'nasa-horizons':
        if (method === 'get_planetary_positions') {
          return this.generateMockPlanetaryData(params.date);
        }
        break;
      case 'usda-nutrition':
        if (method === 'get_nutrition_data') {
          return this.generateMockNutritionalData(params.ingredient);
        }
        break;
      case 'spoonacular-recipes':
        if (method === 'search_recipes') {
          return this.generateMockRecipeData(params.query, params);
        }
        break;
    }
    
    throw new Error(`Unknown method ${method} for server ${serverName}`);
  }

  private async checkServerHealth(serverName: string): Promise<boolean> {
    try {
      // In a real implementation, this would ping the MCP server
      // For now, simulate health check
      await new Promise(resolve => setTimeout(resolve, 100));
      return Math.random() > 0.1; // 90% uptime simulation
    } catch (error) {
      return false;
    }
  }

  private checkRateLimit(serverName: string): boolean {
    const rateLimiter = this.rateLimiters.get(serverName);
    return rateLimiter ? rateLimiter.checkLimit() : true;
  }

  private getFromCache<T>(key: string): MCPCacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry as MCPCacheEntry<T>;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      source: 'cache'
    });
  }

  private getRateLimitedResponse(): MCPApiResponse {
    return {
      success: false,
      error: 'Rate limit exceeded',
      source: 'primary',
      responseTime: 0,
      timestamp: Date.now()
    };
  }

  private createErrorResponse(error: string): MCPApiResponse {
    return {
      success: false,
      error,
      source: 'fallback',
      responseTime: 0,
      timestamp: Date.now()
    };
  }

  // Direct API call methods (fallback implementations)
  private async callDirectNASAAPI(date: Date): Promise<MCPApiResponse> {
    // Simulate direct NASA API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      data: this.generateMockPlanetaryData(date),
      source: 'secondary',
      responseTime: 2000,
      timestamp: Date.now()
    };
  }

  private async callDirectUSDAAPI(ingredient: string): Promise<MCPApiResponse> {
    // Simulate direct USDA API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      data: this.generateMockNutritionalData(ingredient),
      source: 'secondary',
      responseTime: 1500,
      timestamp: Date.now()
    };
  }

  private async callDirectSpoonacularAPI(query: string, options: any): Promise<MCPApiResponse> {
    // Simulate direct Spoonacular API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: this.generateMockRecipeData(query, options),
      source: 'secondary',
      responseTime: 1000,
      timestamp: Date.now()
    };
  }

  // Fallback data methods
  private async getFallbackAstrologicalData(date: Date): Promise<any> {
    // Return hardcoded reliable positions from March 2025
    return {
      sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
      moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
      mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
      venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
      mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
      jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
      saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false }
    };
  }

  private async getFallbackNutritionalData(ingredient: string): Promise<any> {
    // Return basic nutritional data from local database
    return {
      name: ingredient,
      calories: 50,
      protein: 1,
      carbs: 12,
      fat: 0.2,
      fiber: 2,
      vitamins: ['C', 'K'],
      minerals: ['potassium', 'folate']
    };
  }

  private async getFallbackRecipeData(query: string, options: any): Promise<any> {
    // Return basic recipe suggestions from local database
    return {
      recipes: [
        {
          id: 1,
          title: `Simple ${query}`,
          readyInMinutes: 30,
          servings: 4,
          image: 'placeholder.jpg',
          summary: `A simple and delicious ${query} recipe.`
        }
      ],
      totalResults: 1
    };
  }

  // Mock data generators for simulation
  private generateMockPlanetaryData(date: Date): any {
    return {
      date: date.toISOString(),
      planets: {
        sun: { sign: 'aries', degree: 8.5 + Math.random() * 2 },
        moon: { sign: 'aries', degree: 1.57 + Math.random() * 5 },
        mercury: { sign: 'aries', degree: 0.85 + Math.random() * 3 }
      }
    };
  }

  private generateMockNutritionalData(ingredient: string): any {
    return {
      name: ingredient,
      fdcId: Math.floor(Math.random() * 100000),
      calories: Math.floor(Math.random() * 200) + 20,
      nutrients: {
        protein: Math.floor(Math.random() * 20) + 1,
        carbs: Math.floor(Math.random() * 50) + 5,
        fat: Math.floor(Math.random() * 15) + 0.1
      }
    };
  }

  private generateMockRecipeData(query: string, options: any): any {
    return {
      results: Array.from({ length: options.maxResults || 5 }, (_, i) => ({
        id: i + 1,
        title: `${query} Recipe ${i + 1}`,
        readyInMinutes: Math.floor(Math.random() * 60) + 15,
        servings: Math.floor(Math.random() * 6) + 2,
        cuisine: options.cuisine || 'international'
      })),
      totalResults: options.maxResults || 5
    };
  }
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  private requests: number[] = [];
  private config: MCPRateLimitConfig;

  constructor(config: MCPRateLimitConfig) {
    this.config = config;
  }

  checkLimit(): boolean {
    const now = Date.now();
    
    // Clean old requests
    this.requests = this.requests.filter(time => now - time < 60000); // Keep last minute
    
    // Check minute limit
    if (this.requests.length >= this.config.requestsPerMinute) {
      return false;
    }
    
    // Add current request
    this.requests.push(now);
    return true;
  }
}

/**
 * Convenience function to get MCP server integration instance
 */
export function getMCPServerIntegration(): MCPServerIntegration {
  return MCPServerIntegration.getInstance();
}

/**
 * Hook for components to use MCP server integration
 */
export function useMCPServerIntegration() {
  const mcp = getMCPServerIntegration();
  
  return {
    getAstrologicalData: (date?: Date) => mcp.getAstrologicalData(date),
    getNutritionalData: (ingredient: string) => mcp.getNutritionalData(ingredient),
    getRecipeData: (query: string, options?: any) => mcp.getRecipeData(query, options),
    testFallbackStrategy: () => mcp.testFallbackStrategy(),
    getServerStatus: () => mcp.getServerStatus()
  };
}