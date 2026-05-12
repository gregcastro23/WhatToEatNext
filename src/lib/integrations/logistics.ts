export interface DeliveryAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface LogisticsRequest {
  orderId: string;
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  orderValue: number;
  specialInstructions?: string;
  estimatedReadyTime?: string;
}

export type LogisticsStatus =
  | "driver_assigned"
  | "driver_en_route"
  | "picked_up"
  | "delivered";

export interface LogisticsResponse {
  trackingId: string;
  deliveryFeeCents: number;
  status: LogisticsStatus;
  estimatedDeliveryTime?: string;
  driverInfo?: {
    name: string;
    phone: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cents(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function shouldUseMockLogistics(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.LOGISTICS_MOCK_MODE === "true"
  );
}

export class LogisticsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = config?.apiKey ?? process.env.LOGISTICS_API_KEY ?? "";
    this.baseUrl =
      config?.baseUrl ??
      process.env.LOGISTICS_API_URL ??
      "https://api.logistics-provider.com";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.baseUrl);
  }

  public async requestDriver(
    deliveryData: LogisticsRequest,
  ): Promise<LogisticsResponse> {
    if (shouldUseMockLogistics()) {
      const mockDeliveryFee = Math.floor(Math.random() * 500) + 299;
      return {
        trackingId: `track_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        deliveryFeeCents: mockDeliveryFee,
        status: "driver_assigned",
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        driverInfo: {
          name: "Mock Driver",
          phone: "+1234567890",
        },
      };
    }

    if (!this.isConfigured()) {
      throw new Error("Logistics integration is not configured");
    }

    const response = await fetch(`${this.baseUrl}/deliveries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_delivery_id: deliveryData.orderId,
        pickup_address: deliveryData.pickupAddress,
        dropoff_address: deliveryData.deliveryAddress,
        order_value: deliveryData.orderValue,
        pickup_instructions: deliveryData.specialInstructions,
        estimated_pickup_time: deliveryData.estimatedReadyTime,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Logistics API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const result = (await response.json()) as Record<string, unknown>;
    const trackingId = text(result.delivery_id ?? result.tracking_id ?? result.id);
    if (!trackingId) {
      throw new Error("Logistics response did not include a tracking id");
    }

    const fee =
      result.fee && typeof result.fee === "object"
        ? cents((result.fee as Record<string, unknown>).total_fee_cents)
        : cents(result.delivery_fee_cents);

    return {
      trackingId,
      deliveryFeeCents: fee,
      status: "driver_assigned",
      estimatedDeliveryTime: text(result.estimated_dropoff_time) || undefined,
    };
  }
}
