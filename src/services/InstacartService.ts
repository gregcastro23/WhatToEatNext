/**
 * Instacart Developer Platform Service
 *
 * Production-grade singleton that orchestrates all IDP API calls
 * through our server-side Next.js routes:
 *
 *   /api/instacart/shopping-list  → POST /idp/v1/products/products_link
 *   /api/instacart/recipe         → POST /idp/v1/products/recipe
 *   /api/instacart/retailers      → GET  /idp/v1/retailers
 *
 * The API key lives server-side only (INSTACART_API_KEY) — never exposed
 * to the client. This service calls our own API routes which proxy to IDP.
 */

import type { GroceryItem } from "@/types/menuPlanner";
import type {
  InstacartShoppingListResponse,
  InstacartRecipeResponse,
  InstacartRetailer,
  InstacartRetailersResponse,
} from "@/types/instacart";
import { createLogger } from "@/utils/logger";

const logger = createLogger("InstacartService");

// ─── Analytics Event Types ─────────────────────────────────────────────────

type InstacartEventType =
  | "instacart_shopping_list_created"
  | "instacart_recipe_page_created"
  | "instacart_retailers_fetched"
  | "instacart_handoff_error";

interface InstacartEvent {
  type: InstacartEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

// ─── Service ───────────────────────────────────────────────────────────────

class InstacartService {
  private static instance: InstacartService;

  /** In-memory retailer cache to avoid redundant API calls */
  private retailerCache: Map<string, { retailers: InstacartRetailer[]; expiresAt: number }> = new Map();
  private static readonly RETAILER_CACHE_TTL = 30 * 60 * 1000; // 30 min client-side

  /** In-memory recipe URL cache (per Instacart best practice: reuse URLs) */
  private recipeUrlCache: Map<string, { url: string; expiresAt: number }> = new Map();
  private static readonly RECIPE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    logger.info("InstacartService initialized");
  }

  public static getInstance(): InstacartService {
    if (!InstacartService.instance) {
      InstacartService.instance = new InstacartService();
    }
    return InstacartService.instance;
  }

  // ─── Shopping List ─────────────────────────────────────────────────────

  /**
   * Creates a shoppable shopping list page on Instacart via our API route.
   * Returns the Instacart URL that the user should be directed to.
   */
  public async createShoppingList(
    items: GroceryItem[],
    title?: string,
  ): Promise<string> {
    const activeItems = items.filter((item) => !item.purchased && !item.inPantry);

    if (activeItems.length === 0) {
      throw new Error("No items to order — all items are purchased or in pantry.");
    }

    const lineItems = activeItems.map((item) => ({
      name: item.ingredient,
      display_text: `${item.quantity} ${item.unit} ${item.ingredient}`,
      line_item_measurements: [
        {
          quantity: String(item.quantity),
          unit: this.mapToIdpUnit(item.unit),
        },
      ],
    }));

    const response = await fetch("/api/instacart/shopping-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Grocery List from Alchm Kitchen",
        link_type: "shopping_list",
        line_items: lineItems,
        landing_page_configuration: {
          partner_linkback_url: "https://alchm.kitchen/menu-planner",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = (errorData as Record<string, string>).details || (errorData as Record<string, string>).error || `HTTP ${response.status}`;
      this.trackEvent("instacart_handoff_error", {
        endpoint: "shopping-list",
        status: response.status,
        detail,
      });
      throw new Error(`Instacart shopping list creation failed: ${detail}`);
    }

    const data = (await response.json()) as InstacartShoppingListResponse & { url?: string };
    const url = data.url || data.products_link_url;

    this.trackEvent("instacart_shopping_list_created", {
      itemCount: activeItems.length,
      title: title || "Grocery List from Alchm Kitchen",
    });

    logger.info("Shopping list created successfully", { itemCount: activeItems.length, url });
    return url;
  }

  // ─── Recipe Page ───────────────────────────────────────────────────────

  /**
   * Creates a recipe page on Instacart via our API route.
   * Caches the URL by recipeId per Instacart best practices.
   */
  public async createRecipePage(recipe: {
    id: string;
    name: string;
    ingredients: Array<{ name: string; amount?: number; unit?: string }>;
    instructions?: string[];
    servings?: number;
    cookingTime?: number;
    imageUrl?: string;
    dietaryFlags?: string[];
  }): Promise<string> {
    // Check cache first
    const cached = this.recipeUrlCache.get(recipe.id);
    if (cached && cached.expiresAt > Date.now()) {
      logger.info("Using cached recipe URL", { recipeId: recipe.id });
      return cached.url;
    }

    const lineItems = recipe.ingredients.map((ing) => {
      const item: Record<string, unknown> = {
        name: ing.name,
        display_text: ing.amount
          ? `${ing.amount} ${ing.unit || "each"} ${ing.name}`
          : ing.name,
      };

      if (ing.amount) {
        item.measurements = [
          {
            quantity: ing.amount,
            unit: this.mapToIdpUnit(ing.unit || "each"),
          },
        ];
      }

      // Apply health filters from recipe dietary flags
      if (recipe.dietaryFlags && recipe.dietaryFlags.length > 0) {
        const healthFilters = this.mapDietaryToHealthFilters(recipe.dietaryFlags);
        if (healthFilters.length > 0) {
          item.filters = { health_filters: healthFilters };
        }
      }

      return item;
    });

    const response = await fetch("/api/instacart/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: recipe.name,
        image_url: recipe.imageUrl,
        author: "Alchm Kitchen",
        servings: recipe.servings || 4,
        cooking_time: recipe.cookingTime,
        external_reference_id: recipe.id,
        content_creator_credit_info: "Recipe by Alchm Kitchen — alchm.kitchen",
        expires_in: 365,
        instructions: recipe.instructions,
        ingredients: lineItems,
        landing_page_configuration: {
          partner_linkback_url: "https://alchm.kitchen/menu-planner",
          enable_pantry_items: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = (errorData as Record<string, string>).details || (errorData as Record<string, string>).error || `HTTP ${response.status}`;
      this.trackEvent("instacart_handoff_error", {
        endpoint: "recipe",
        recipeId: recipe.id,
        status: response.status,
        detail,
      });
      throw new Error(`Instacart recipe page creation failed: ${detail}`);
    }

    const data = (await response.json()) as InstacartRecipeResponse & { url?: string };
    const url = data.url || data.products_link_url;

    // Cache the URL
    this.recipeUrlCache.set(recipe.id, {
      url,
      expiresAt: Date.now() + InstacartService.RECIPE_CACHE_TTL,
    });

    this.trackEvent("instacart_recipe_page_created", {
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredientCount: recipe.ingredients.length,
    });

    logger.info("Recipe page created successfully", { recipeId: recipe.id, url });
    return url;
  }

  // ─── Retailers ─────────────────────────────────────────────────────────

  /**
   * Fetches nearby retailers from the IDP via our API route.
   * Results are cached client-side for 30 minutes.
   */
  public async fetchNearbyRetailers(
    postalCode: string = "11375",
    countryCode: string = "US",
  ): Promise<InstacartRetailer[]> {
    const cacheKey = `${postalCode}-${countryCode}`;
    const cached = this.retailerCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.retailers;
    }

    const response = await fetch(
      `/api/instacart/retailers?postal_code=${encodeURIComponent(postalCode)}&country_code=${encodeURIComponent(countryCode)}`,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = (errorData as Record<string, string>).error || `HTTP ${response.status}`;
      this.trackEvent("instacart_handoff_error", {
        endpoint: "retailers",
        postalCode,
        status: response.status,
        detail,
      });
      logger.warn("Failed to fetch retailers from API, returning empty", { postalCode, status: response.status });
      return [];
    }

    const data = (await response.json()) as InstacartRetailersResponse;
    const retailers = data.retailers || [];

    // Cache the results
    this.retailerCache.set(cacheKey, {
      retailers,
      expiresAt: Date.now() + InstacartService.RETAILER_CACHE_TTL,
    });

    this.trackEvent("instacart_retailers_fetched", {
      postalCode,
      retailerCount: retailers.length,
      retailers: retailers.map((r) => r.name),
    });

    logger.info("Retailers fetched successfully", { postalCode, count: retailers.length });
    return retailers;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  /**
   * Maps common unit abbreviations to IDP-supported units.
   * See: https://docs.instacart.com/developer_platform_api/api/units_of_measurement
   */
  private mapToIdpUnit(unit: string): string {
    const map: Record<string, string> = {
      oz: "ounce",
      ounces: "ounce",
      "fl oz": "fluid_ounce",
      "fluid ounce": "fluid_ounce",
      lb: "pound",
      lbs: "pound",
      pound: "pound",
      pounds: "pound",
      pt: "pint",
      pints: "pint",
      qt: "quart",
      quarts: "quart",
      gal: "gallon",
      gallons: "gallon",
      ml: "milliliter",
      l: "liter",
      liters: "liter",
      g: "gram",
      grams: "gram",
      kg: "kilogram",
      kgs: "kilogram",
      tbsp: "tablespoon",
      tablespoons: "tablespoon",
      tsp: "teaspoon",
      teaspoons: "teaspoon",
      pkg: "package",
      pack: "package",
      ea: "each",
      piece: "each",
      pieces: "each",
    };

    const lower = unit.toLowerCase().trim();
    return map[lower] || lower;
  }

  /**
   * Maps our recipe dietary flags to Instacart health_filters enum values.
   */
  private mapDietaryToHealthFilters(flags: string[]): string[] {
    const mapping: Record<string, string> = {
      organic: "ORGANIC",
      "gluten-free": "GLUTEN_FREE",
      glutenfree: "GLUTEN_FREE",
      vegan: "VEGAN",
      kosher: "KOSHER",
      "sugar-free": "SUGAR_FREE",
      "low-fat": "LOW_FAT",
      "fat-free": "FAT_FREE",
    };

    return flags
      .map((flag) => mapping[flag.toLowerCase()])
      .filter((f): f is string => !!f);
  }

  // ─── Analytics ─────────────────────────────────────────────────────────

  /**
   * Tracks structured events for Instacart partnership performance audits.
   * Logs locally; can be extended to send to an analytics endpoint.
   */
  private trackEvent(type: InstacartEventType, data: Record<string, unknown>): void {
    const event: InstacartEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    logger.info(`[Analytics] ${type}`, event.data);

    // Store in sessionStorage for debugging/demo purposes
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(sessionStorage.getItem("instacart_events") || "[]") as InstacartEvent[];
        existing.push(event);
        // Keep last 50 events
        if (existing.length > 50) existing.splice(0, existing.length - 50);
        sessionStorage.setItem("instacart_events", JSON.stringify(existing));
      } catch {
        // sessionStorage not available
      }
    }
  }

  /**
   * Returns all tracked events for this session (for debugging/analytics dashboard).
   */
  public getSessionEvents(): InstacartEvent[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem("instacart_events") || "[]") as InstacartEvent[];
    } catch {
      return [];
    }
  }
}

export const instacartService = InstacartService.getInstance();
