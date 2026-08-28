/*
  Centralized API client scaffold.
  Note: Replace placeholder types with generated backend types when available.
*/

export interface ElementalProperties {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

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
  /**
   * NULL when the rate endpoint has no elemental input.
   *
   * monica = −gregsEnergy / (reactivity · ln kalchm), and both gregsEnergy and
   * reactivity are functions of the four ELEMENTS. Elements come from SIGNS,
   * and this endpoint is given only a planetary HOUR — a ruling planet, no
   * sign. So monica is not derivable and the server says so rather than
   * substituting a literal (it used to return 1.0 unconditionally).
   *
   * `kalchm` is not in the same position: it is a function of the ESMS axes
   * alone, which the planetary hour does determine, so it is a real value.
   *
   * Handle the absence at the display layer. Do NOT `?? 1` it.
   */
  monica: number | null;
}

export interface RuneAgentRequest {
  datetime?: string;
  location?: { latitude: number; longitude: number };
  context?: "cuisine" | "recipe" | "ingredient" | "cooking_method";
  preferences?: {
    dietaryRestrictions?: string[];
    cuisineTypes?: string[];
    intensity?: "mild" | "moderate" | "intense";
  };
}

export interface RuneResult {
  symbol: string;
  name: string;
  meaning: string;
  influence: {
    elemental: ElementalProperties;
    energy: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    };
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
    alchemical: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
    kitchen: process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL ?? "",
  } as const;

  private async request<TResponse>(
    url: string,
    init?: RequestInit,
  ): Promise<TResponse> {
    // When NEXT_PUBLIC_BACKEND_URL is unset (typical local dev), URLs end up
    // relative (e.g. "/api/v1/cuisines"). Node's fetch requires absolute URLs
    // and throws ERR_INVALID_URL — surface a clearer error and let callers
    // catch it without leaking the raw TypeError into server-rendered pages.
    if (url.startsWith("/")) {
      throw new Error(
        `AlchmAPIClient: backend endpoint not configured (relative URL: ${url}). ` +
          `Set NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_KITCHEN_BACKEND_URL.`,
      );
    }
    const response = await fetch(url, init);
    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(`API Error: ${response.status} ${statusText}`);
    }
    return response.json() as Promise<TResponse>;
  }

  async calculateElemental(
    ingredients: string[],
  ): Promise<ElementalProperties> {
    const url = `${this.endpoints.alchemical}/calculate/elemental`;
    return this.request<ElementalProperties>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });
  }

  async calculateThermodynamics(
    ingredients: string[],
  ): Promise<ThermodynamicsResult> {
    const url = `${this.endpoints.alchemical}/calculate/thermodynamics`;
    return this.request<ThermodynamicsResult>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });
  }

  async getRecommendations(request: RecommendationRequest): Promise<Recipe[]> {
    const url = `${this.endpoints.kitchen}/recommend/recipes`;
    return this.request<Recipe[]>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  }

  async calculateTokenRates(
    request: TokenRatesRequest,
  ): Promise<TokenRatesResult> {
    const url = `${this.endpoints.alchemical}/api/tokens/calculate`;
    return this.request<TokenRatesResult>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  }

  async getRuneGuidance(request: RuneAgentRequest): Promise<RuneResult> {
    const url = `${this.endpoints.alchemical}/api/runes/guidance`;
    return this.request<RuneResult>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  }

  async getCurrentPlanetaryHour(
    request: PlanetaryHourRequest,
  ): Promise<PlanetaryHourResult> {
    const url = `${this.endpoints.alchemical}/api/planetary/current`;
    const params = new URLSearchParams();
    if (request.datetime) params.set("timestamp", request.datetime);
    if (request.location) {
      params.set("lat", String(request.location.latitude));
      params.set("lon", String(request.location.longitude));
    }

    return this.request<PlanetaryHourResult>(`${url}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- External Data Service Methods with Caching ---

  private readonly _cache: {
    cuisines?: Promise<Record<string, any>>;
    sauces?: Promise<Record<string, any>>;
    ingredients?: Promise<Record<string, any>>;
    cuisineDetails: Record<string, Promise<any>>;
  } = { cuisineDetails: {} };

  async getCuisines(): Promise<Record<string, any>> {
    if (!this._cache.cuisines) {
      if (!this.endpoints.alchemical || typeof window !== "undefined") {
        const { cuisines } = await import("@/data/cuisines");
        return cuisines;
      }
      const url = `${this.endpoints.alchemical}/api/v1/cuisines`;
      this._cache.cuisines = this.request<Record<string, any>>(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(async () => {
        const { cuisines } = await import("@/data/cuisines");
        return cuisines;
      });
    }
    return this._cache.cuisines;
  }

  async getCuisine(id: string): Promise<any> {
    if (this._cache.cuisineDetails[id] === undefined) {
      if (!this.endpoints.alchemical || typeof window !== "undefined") {
        const { cuisines } = await import("@/data/cuisines");
        return cuisines[id];
      }
      const url = `${this.endpoints.alchemical}/api/v1/cuisines/${id}`;
      this._cache.cuisineDetails[id] = this.request<any>(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(async () => {
        const { cuisines } = await import("@/data/cuisines");
        return cuisines[id];
      });
    }
    return this._cache.cuisineDetails[id];
  }

  async getSauces(): Promise<Record<string, any>> {
    if (!this._cache.sauces) {
      if (!this.endpoints.alchemical || typeof window !== "undefined") {
        const { allSauces } = await import("@/data/sauces");
        return allSauces;
      }
      const url = `${this.endpoints.alchemical}/api/v1/sauces`;
      this._cache.sauces = this.request<Record<string, any>>(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(async () => {
        const { allSauces } = await import("@/data/sauces");
        return allSauces;
      });
    }
    return this._cache.sauces;
  }

  async getIngredients(): Promise<Record<string, any>> {
    if (!this._cache.ingredients) {
      if (!this.endpoints.alchemical || typeof window !== "undefined") {
        const { allIngredients } = await import("@/data/ingredients/index");
        return allIngredients;
      }
      const url = `${this.endpoints.alchemical}/api/v1/ingredients`;
      this._cache.ingredients = this.request<Record<string, any>>(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(async () => {
        const { allIngredients } = await import("@/data/ingredients/index");
        return allIngredients;
      });
    }
    return this._cache.ingredients;
  }
}

export const alchmAPI = new AlchmAPIClient();
