import type { EnhancedRecommendationResult } from '@/services/EnhancedRecommendationService';
import type { CuisineType } from '@/types/constants';
import type { Ingredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';

export interface KitchenBackendContext {
  datetime?: Date,
  location?: { latitude: number, longitude: number },
  preferences?: {
    dietaryRestrictions?: string[],
    cuisineTypes?: string[],
    intensity?: 'mild' | 'moderate' | 'intense'
  }
}

/**
 * Env flags (set in .env.local):
 * - NEXT_PUBLIC_KITCHEN_BACKEND_URL: e.g., http://localhost:8100
 * - NEXT_PUBLIC_KITCHEN_BACKEND: 'true' to enable kitchen backend usage
 */
export class KitchenBackendClient {
  private readonly backendUrl: string | undefined;
  private readonly useBackend: boolean;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    this.useBackend = String(process.env.NEXT_PUBLIC_KITCHEN_BACKEND).toLowerCase() === 'true';
  }

  private async post<T>(path: string, body: unknown): Promise<T | null> {
    if (!this.useBackend || !this.backendUrl) return null;
    const url = new URL(path, this.backendUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Kitchen backend error ${res.status}`);
    return (await res.json()) as T;
  }

  async getCuisineRecommendations(
    ctx: KitchenBackendContext,
  ): Promise<EnhancedRecommendationResult<{ name: string, type: CuisineType }> | null> {
    try {
      return await this.post('/api/kitchen/recommendations/cuisines', {
        datetime: ctx.datetime?.toISOString() || new Date().toISOString(),
        location: ctx.location,
        preferences: ctx.preferences
      });
    } catch (_err) {
      return null;
    }
  }

  async getIngredientRecommendations(
    ctx: KitchenBackendContext,
  ): Promise<EnhancedRecommendationResult<Ingredient> | null> {
    try {
      return await this.post('/api/kitchen/recommendations/ingredients', {
        datetime: ctx.datetime?.toISOString() || new Date().toISOString(),
        location: ctx.location,
        preferences: ctx.preferences
      });
    } catch (_err) {
      return null;
    }
  }

  async getRecipeRecommendations(
    ctx: KitchenBackendContext,
  ): Promise<EnhancedRecommendationResult<Recipe> | null> {
    try {
      return await this.post('/api/kitchen/recommendations/recipes', {
        datetime: ctx.datetime?.toISOString() || new Date().toISOString(),
        location: ctx.location,
        preferences: ctx.preferences
      });
    } catch (_err) {
      return null;
    }
  }
}

export const kitchenBackendClient = new KitchenBackendClient();
