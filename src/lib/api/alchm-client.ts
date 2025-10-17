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

export interface TokenRatesRequest {
  datetime?: string;
  location?: { latitude: number; longitude: number };
  elemental?: ElementalProperties;
  esms?: { Spirit: number; Essence: number; Matter: number; Substance: number };
}

export interface TokenRatesResult {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  kalchm: number;
  monica: number;
}

export interface RuneAgentRequest {
  datetime?: string;
  location?: { latitude: number; longitude: number };
  context?: 'cuisine' | 'recipe' | 'ingredient' | 'cooking_method';
  preferences?: {
    dietaryRestrictions?: string[];
    cuisineTypes?: string[];
    intensity?: 'mild' | 'moderate' | 'intense';
  };
}

export interface RuneResult {
  symbol: string;
  name: string;
  meaning: string;
  influence: {
    elemental: ElementalProperties;
    energy: { Spirit: number; Essence: number; Matter: number; Substance: number };
    guidance: string;
  };
}

export interface PlanetaryHourRequest {
  datetime?: string;
  location?: { latitude: number; longitude: number };
}

export interface PlanetaryHourResult {
  planet: string;
  hourNumber?: number;
  isDaytime: boolean;
  start?: string;
  end?: string;
}

export class AlchmAPIClient {
  private readonly endpoints = {
    alchemical: process.env.NEXT_PUBLIC_BACKEND_URL ?? '',
    kitchen: process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL ?? ''
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
      body: JSON.stringify({ ingredients })
    });
  }

  async calculateThermodynamics(ingredients: string[]): Promise<ThermodynamicsResult> {
    const url = `${this.endpoints.alchemical}/calculate/thermodynamics`;
    return this.request<ThermodynamicsResult>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients })
    });
  }

  async getRecommendations(request: RecommendationRequest): Promise<Recipe[]> {
    const url = `${this.endpoints.kitchen}/recommend/recipes`;
    return this.request<Recipe[]>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }

  async calculateTokenRates(request: TokenRatesRequest): Promise<TokenRatesResult> {
    const url = `${this.endpoints.alchemical}/api/tokens/calculate`;
    return this.request<TokenRatesResult>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }

  async getRuneGuidance(request: RuneAgentRequest): Promise<RuneResult> {
    const url = `${this.endpoints.alchemical}/api/runes/guidance`;
    return this.request<RuneResult>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }

  async getCurrentPlanetaryHour(request: PlanetaryHourRequest): Promise<PlanetaryHourResult> {
    const url = `${this.endpoints.alchemical}/api/planetary/current`;
    const params = new URLSearchParams();
    if (request.datetime) params.set('timestamp', request.datetime);
    if (request.location) {
      params.set('lat', String(request.location.latitude));
      params.set('lon', String(request.location.longitude));
    }

    return this.request<PlanetaryHourResult>(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const alchmAPI = new AlchmAPIClient();