import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { AlchemicalElementalPropertiesSchema } from "@/lib/validation/alchemicalBackendSchemas";
import {
  AlchemicalThermodynamicsResultSchema,
  AlchemicalTokenRatesResultSchema,
  AlchemicalRuneGuidanceResultSchema,
  AlchemicalPlanetaryHourResultSchema,
  AlchmRecipeRecommendationSchema,
  AlchmCuisinesRecordSchema,
  AlchmCuisineSchema,
  AlchmSaucesRecordSchema,
  AlchmIngredientsRecordSchema,
} from "@/lib/validation/serviceResponseSchemas";
import type {
  ElementalProperties,
  ThermodynamicsResult,
  RecommendationRequest,
  Recipe,
  TokenRatesRequest,
  TokenRatesResult,
  RuneAgentRequest,
  RuneResult,
  PlanetaryHourRequest,
  PlanetaryHourResult,
} from "./alchmClientTypes";

export * from "./alchmClientTypes";

export class AlchmAPIClient {
  private readonly endpoints = {
    alchemical: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
    kitchen: process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL ?? "",
  } as const;

  private async request<TResponse>(
    url: string,
    options: {
      init?: RequestInit;
      parse: (value: unknown) => TResponse;
    },
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
    const response = await fetch(url, options.init);
    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(`API Error: ${response.status} ${statusText}`);
    }
    return readJson<TResponse>(response, { parse: options.parse });
  }

  async calculateElemental(
    ingredients: string[],
  ): Promise<ElementalProperties> {
    const url = `${this.endpoints.alchemical}/calculate/elemental`;
    return this.request<ElementalProperties>(url, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      },
      parse: AlchemicalElementalPropertiesSchema.parse,
    });
  }

  async calculateThermodynamics(
    ingredients: string[],
  ): Promise<ThermodynamicsResult> {
    const url = `${this.endpoints.alchemical}/calculate/thermodynamics`;
    return this.request<ThermodynamicsResult>(url, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      },
      parse: AlchemicalThermodynamicsResultSchema.parse,
    });
  }

  async getRecommendations(request: RecommendationRequest): Promise<Recipe[]> {
    const url = `${this.endpoints.kitchen}/recommend/recipes`;
    return this.request<Recipe[]>(url, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
      parse: (val) => z.array(AlchmRecipeRecommendationSchema).parse(val),
    });
  }

  async calculateTokenRates(
    request: TokenRatesRequest,
  ): Promise<TokenRatesResult> {
    const url = `${this.endpoints.alchemical}/api/tokens/calculate`;
    return this.request<TokenRatesResult>(url, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
      parse: AlchemicalTokenRatesResultSchema.parse,
    });
  }

  async getRuneGuidance(request: RuneAgentRequest): Promise<RuneResult> {
    const url = `${this.endpoints.alchemical}/api/runes/guidance`;
    return this.request<RuneResult>(url, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
      parse: AlchemicalRuneGuidanceResultSchema.parse,
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
      init: {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      parse: AlchemicalPlanetaryHourResultSchema.parse,
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
        init: {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        parse: AlchmCuisinesRecordSchema.parse,
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
        init: {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        parse: AlchmCuisineSchema.parse,
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
        init: {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        parse: AlchmSaucesRecordSchema.parse,
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
        init: {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        parse: AlchmIngredientsRecordSchema.parse,
      }).catch(async () => {
        const { allIngredients } = await import("@/data/ingredients/index");
        return allIngredients;
      });
    }
    return this._cache.ingredients;
  }
}

export const alchmAPI = new AlchmAPIClient();
