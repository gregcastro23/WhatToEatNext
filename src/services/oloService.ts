/**
 * Olo integration scaffold.
 *
 * This service deliberately keeps Olo behind a narrow interface so discovery,
 * menu sync, and order routing can be wired before live Olo credentials exist.
 *
 * @file src/services/oloService.ts
 */

export interface OloRestaurant {
  id: string;
  name: string;
  url?: string;
  phone?: string;
  rating?: number;
  distance?: number;
  cuisineTypes?: string[];
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface OloMenuItem {
  id: string;
  name: string;
  description?: string;
  priceCents?: number;
  available?: boolean;
}

export interface OloMenuCategory {
  id: string;
  name: string;
  items: OloMenuItem[];
}

export interface OloMenu {
  restaurantId: string;
  categories: OloMenuCategory[];
  raw?: unknown;
}

export interface OloOrderRequest {
  restaurantId?: string;
  items?: unknown;
  customer?: unknown;
  metadata?: Record<string, unknown>;
}

export interface OloOrderResult {
  id: string;
  status?: string;
  raw?: unknown;
}

class OloService {
  private readonly baseUrl = process.env.OLO_API_BASE_URL ?? "";
  private readonly apiKey = process.env.OLO_API_KEY ?? "";

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  private async fetchOlo<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T | null> {
    if (!this.isConfigured()) return null;

    const url = new URL(path, this.baseUrl);
    const response = await fetch(url.toString(), {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(
        `[oloService] Olo request failed ${response.status}: ${body.slice(0, 200)}`,
      );
      return null;
    }

    return (await response.json()) as T;
  }

  public async searchRestaurants(params: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    cuisineType?: string;
    limit?: number;
  }): Promise<OloRestaurant[]> {
    const response = await this.fetchOlo<{
      restaurants?: Array<Record<string, unknown>>;
    }>(
      `/restaurants/search?lat=${encodeURIComponent(params.latitude)}&lng=${encodeURIComponent(params.longitude)}&radius=${encodeURIComponent(params.radiusMeters ?? 8000)}&limit=${encodeURIComponent(params.limit ?? 20)}${params.cuisineType ? `&query=${encodeURIComponent(params.cuisineType)}` : ""}`,
    );

    return (response?.restaurants ?? []).flatMap((raw) => {
      const id = stringValue(raw.id ?? raw.restaurantId);
      const name = stringValue(raw.name);
      if (!id || !name) return [];

      const latitude = numberValue(raw.latitude);
      const longitude = numberValue(raw.longitude);

      return [
        {
          id,
          name,
          url: stringValue(raw.url ?? raw.orderUrl),
          phone: stringValue(raw.phone),
          rating: numberValue(raw.rating),
          distance: numberValue(raw.distanceMeters ?? raw.distance),
          cuisineTypes: Array.isArray(raw.cuisineTypes)
            ? raw.cuisineTypes.map(String)
            : [],
          address: {
            line1: stringValue(raw.address1 ?? raw.address),
            city: stringValue(raw.city),
            state: stringValue(raw.state),
            postalCode: stringValue(raw.zip ?? raw.postalCode),
          },
          coordinates:
            latitude !== undefined && longitude !== undefined
              ? { latitude, longitude }
              : undefined,
        },
      ];
    });
  }

  public async getMenu(restaurantId: string): Promise<OloMenu | null> {
    const response = await this.fetchOlo<Record<string, unknown>>(
      `/restaurants/${encodeURIComponent(restaurantId)}/menu`,
    );
    if (!response) return null;

    const categoriesRaw = Array.isArray(response.categories)
      ? response.categories
      : [];

    const categories = categoriesRaw.flatMap((categoryRaw, index) => {
      if (!categoryRaw || typeof categoryRaw !== "object") return [];
      const category = categoryRaw as Record<string, unknown>;
      const itemsRaw = Array.isArray(category.items) ? category.items : [];

      return [
        {
          id: stringValue(category.id) || `category_${index + 1}`,
          name: stringValue(category.name) || "Menu",
          items: itemsRaw.flatMap((itemRaw, itemIndex) => {
            if (!itemRaw || typeof itemRaw !== "object") return [];
            const item = itemRaw as Record<string, unknown>;
            const id = stringValue(item.id) || `item_${itemIndex + 1}`;
            const name = stringValue(item.name);
            if (!name) return [];

            return [
              {
                id,
                name,
                description: stringValue(item.description),
                priceCents: centsValue(item.priceCents ?? item.price),
                available: item.available === false ? false : true,
              },
            ];
          }),
        },
      ];
    });

    return { restaurantId, categories, raw: response };
  }

  public async createOrder(input: OloOrderRequest): Promise<OloOrderResult | null> {
    if (!input.restaurantId) return null;

    const response = await this.fetchOlo<Record<string, unknown>>(
      `/restaurants/${encodeURIComponent(input.restaurantId)}/orders`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    if (!response) return null;

    const id = stringValue(response.id ?? response.orderId);
    if (!id) return null;

    return {
      id,
      status: stringValue(response.status),
      raw: response,
    };
  }

  public async confirmPayment(orderId?: string): Promise<boolean> {
    if (!orderId) return false;

    const response = await this.fetchOlo<Record<string, unknown>>(
      `/orders/${encodeURIComponent(orderId)}/confirm-payment`,
      { method: "POST", body: JSON.stringify({ paid: true }) },
    );

    return Boolean(response);
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function centsValue(value: unknown): number | undefined {
  const parsed = numberValue(value);
  if (parsed === undefined) return undefined;

  return Number.isInteger(parsed) ? parsed : Math.round(parsed * 100);
}

export const oloService = new OloService();
