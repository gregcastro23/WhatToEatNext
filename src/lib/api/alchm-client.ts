/*
  Centralized API client scaffold.
  Note: Replace placeholder types with generated backend types when available.
*/

export type ElementalProperties = {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
};

export interface ThermodynamicsResult {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number | null;
}

export interface RecommendationRequest {
  ingredients: string[];
  dietaryRestrictions?: string[];
  cuisinePreferences?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  url?: string;
}

export class AlchmAPIClient {
  private readonly endpoints = {
    alchemical: process.env.NEXT_PUBLIC_BACKEND_URL ?? '',
    kitchen: process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL ?? '',
  } as const;

  private async request<TResponse>(url: string, init?: RequestInit): Promise<TResponse> {
    const response = await fetch(url, init);
    if (!response.ok) {
      const statusText = response.statusText || 'Unknown Error';
      throw new Error(`API Error: ${response.status} ${statusText}`);
    }
    return response.json() as Promise<TResponse>;
  }

  async calculateElemental(ingredients: string[]): Promise<ElementalProperties> {
    const url = `${this.endpoints.alchemical}/calculate/elemental`;
    return this.request<ElementalProperties>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });
  }

  async calculateThermodynamics(ingredients: string[]): Promise<ThermodynamicsResult> {
    const url = `${this.endpoints.alchemical}/calculate/thermodynamics`;
    return this.request<ThermodynamicsResult>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });
  }

  async getRecommendations(request: RecommendationRequest): Promise<Recipe[]> {
    const url = `${this.endpoints.kitchen}/recommend/recipes`;
    return this.request<Recipe[]>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }
}

export const alchmAPI = new AlchmAPIClient();


