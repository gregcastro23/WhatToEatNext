export type DeliverectOrderStatus =
  | "received"
  | "accepted"
  | "in_preparation"
  | "ready"
  | "completed"
  | "failed";

export interface DeliverectOrderItem {
  plu: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Array<{
    name: string;
    price: number;
  }>;
}

export interface DeliverectOrder {
  externalId: string;
  channelOrderId: string;
  items: DeliverectOrderItem[];
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  orderType: "pickup" | "delivery";
  preparationTime?: number;
}

export interface DeliverectResponse {
  orderId: string;
  status: DeliverectOrderStatus;
  estimatedReadyTime?: string;
}

export interface DeliverectMenuItem {
  id: string;
  plu: string;
  name: string;
  description?: string;
  priceCents: number;
  available: boolean;
}

export interface DeliverectMenuCategory {
  id: string;
  name: string;
  items: DeliverectMenuItem[];
}

export interface DeliverectMenu {
  restaurantId: string;
  categories: DeliverectMenuCategory[];
  raw?: unknown;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function cents(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Number.isInteger(parsed) ? parsed : Math.round(parsed * 100);
}

function normalizeStatus(value: unknown): DeliverectOrderStatus {
  const status = text(value);
  if (
    status === "received" ||
    status === "accepted" ||
    status === "in_preparation" ||
    status === "ready" ||
    status === "completed" ||
    status === "failed"
  ) {
    return status;
  }
  return "received";
}

function shouldUseMockDeliverect(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.DELIVERECT_MOCK_MODE === "true"
  );
}

export class DeliverectClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = config?.apiKey ?? process.env.DELIVERECT_API_KEY ?? "";
    this.baseUrl =
      config?.baseUrl ??
      process.env.DELIVERECT_API_URL ??
      "https://api.deliverect.com";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.baseUrl);
  }

  public async getMenu(restaurantId: string): Promise<DeliverectMenu> {
    if (shouldUseMockDeliverect()) {
      return {
        restaurantId,
        categories: [
          {
            id: "seasonal",
            name: "Seasonal Signatures",
            items: [
              {
                id: "golden-grain-bowl",
                plu: "golden-grain-bowl",
                name: "Golden Grain Bowl",
                description: "Roasted vegetables, herbed grains, citrus tahini.",
                priceCents: 1595,
                available: true,
              },
              {
                id: "fire-roasted-flatbread",
                plu: "fire-roasted-flatbread",
                name: "Fire Roasted Flatbread",
                description: "Tomato, chile oil, basil, mozzarella.",
                priceCents: 1495,
                available: true,
              },
            ],
          },
          {
            id: "sides",
            name: "Sides",
            items: [
              {
                id: "market-greens",
                plu: "market-greens",
                name: "Market Greens",
                description: "Leafy greens with lemon vinaigrette.",
                priceCents: 895,
                available: true,
              },
            ],
          },
        ],
      };
    }

    if (!this.isConfigured()) {
      throw new Error("Deliverect integration is not configured");
    }

    const response = await fetch(
      `${this.baseUrl}/locations/${encodeURIComponent(restaurantId)}/menu`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Deliverect menu API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const raw = (await response.json()) as Record<string, unknown>;
    const rawCategories = Array.isArray(raw.categories) ? raw.categories : [];

    const categories = rawCategories.flatMap((category, categoryIndex) => {
      const categoryRecord = record(category);
      if (!categoryRecord) return [];

      const rawItems = Array.isArray(categoryRecord.items)
        ? categoryRecord.items
        : [];

      return [
        {
          id: text(categoryRecord.id) || `category_${categoryIndex + 1}`,
          name: text(categoryRecord.name) || "Menu",
          items: rawItems.flatMap((item, itemIndex) => {
            const itemRecord = record(item);
            if (!itemRecord) return [];

            const name = text(itemRecord.name);
            if (!name) return [];

            const id = text(itemRecord.id) || `item_${itemIndex + 1}`;
            return [
              {
                id,
                plu: text(itemRecord.plu) || id,
                name,
                description: text(itemRecord.description) || undefined,
                priceCents: cents(itemRecord.priceCents ?? itemRecord.price),
                available: itemRecord.available === false ? false : true,
              },
            ];
          }),
        },
      ];
    });

    return { restaurantId, categories, raw };
  }

  public async injectOrder(
    restaurantId: string,
    orderData: DeliverectOrder,
  ): Promise<DeliverectResponse> {
    if (shouldUseMockDeliverect()) {
      return {
        orderId: `mock_deliverect_${Date.now()}`,
        status: "accepted",
        estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    }

    if (!this.isConfigured()) {
      throw new Error("Deliverect integration is not configured");
    }

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderData,
        locationId: restaurantId,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Deliverect API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const result = (await response.json()) as Record<string, unknown>;
    const orderId = text(result.orderId ?? result.id);
    if (!orderId) {
      throw new Error("Deliverect response did not include an order id");
    }

    return {
      orderId,
      status: normalizeStatus(result.status),
      estimatedReadyTime: text(result.estimatedReadyTime) || undefined,
    };
  }
}
