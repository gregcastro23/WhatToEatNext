import { executeQuery } from "@/lib/database/connection";
import {
  DeliverectClient,
  type DeliverectOrderItem,
  type DeliverectResponse,
} from "@/lib/integrations/deliverect";
import {
  LogisticsClient,
  type DeliveryAddress,
  type LogisticsResponse,
} from "@/lib/integrations/logistics";

interface RestaurantOrderIntentRow {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  currency: string;
  total_cents: number;
  order_type: string | null;
  customer_info: Record<string, unknown> | null;
  delivery_address: Record<string, unknown> | null;
  line_items: unknown;
  metadata: Record<string, unknown> | null;
}

interface RestaurantFulfillmentRow {
  id: string;
  name: string;
  address: Record<string, unknown> | null;
  deliverect_location_id: string | null;
}

interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

type OrderType = "pickup" | "delivery";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeCustomer(value: unknown): CustomerInfo {
  const raw = record(value);
  if (!raw) return { name: "Guest" };

  return {
    name: text(raw.name) || "Guest",
    phone: text(raw.phone) || undefined,
    email: text(raw.email) || undefined,
  };
}

function normalizeAddress(value: unknown): DeliveryAddress | null {
  const raw = record(value);
  if (!raw) return null;

  const street = text(raw.street ?? raw.address1 ?? raw.line1);
  const city = text(raw.city);
  const postalCode = text(raw.postalCode ?? raw.postal_code ?? raw.zip);
  const country = text(raw.country) || "US";

  if (!street || !city || !postalCode) return null;

  return {
    street,
    city,
    state: text(raw.state) || undefined,
    postalCode,
    country,
    latitude: numberValue(raw.latitude) ?? undefined,
    longitude: numberValue(raw.longitude) ?? undefined,
  };
}

function normalizeOrderType(value: unknown): OrderType {
  return text(value) === "delivery" ? "delivery" : "pickup";
}

function normalizeLineItems(items: unknown, fallbackTotalCents: number): DeliverectOrderItem[] {
  const rawItems = Array.isArray(items) ? items : [];
  const normalized = rawItems.flatMap((item, index) => {
    const raw = record(item);
    if (!raw) return [];

    const name = text(raw.name) || `Item ${index + 1}`;
    const quantity = Math.max(Math.trunc(numberValue(raw.quantity) ?? 1), 1);
    const unitPriceCents =
      numberValue(raw.unitPriceCents) ??
      numberValue(raw.unit_price_cents) ??
      numberValue(raw.priceCents) ??
      numberValue(raw.price_cents) ??
      0;

    return [
      {
        plu: text(raw.plu ?? raw.id) || `item_${index + 1}`,
        name,
        quantity,
        price: Math.max(unitPriceCents, 0) / 100,
      },
    ];
  });

  if (normalized.length > 0) return normalized;

  return [
    {
      plu: "order_total",
      name: "Restaurant order",
      quantity: 1,
      price: Math.max(fallbackTotalCents, 0) / 100,
    },
  ];
}

async function claimOrderForFulfillment(
  orderId: string,
): Promise<RestaurantOrderIntentRow | null> {
  const result = await executeQuery<RestaurantOrderIntentRow>(
    `UPDATE restaurant_order_intents
     SET pos_status = 'submitting',
         fulfillment_attempt_count = fulfillment_attempt_count + 1,
         fulfillment_last_error = NULL,
         updated_at = NOW()
     WHERE id = $1
       AND status = 'paid'
       AND deliverect_order_id IS NULL
       AND COALESCE(pos_status, 'pending') IN ('pending', 'failed')
     RETURNING id, restaurant_id, restaurant_name, currency, total_cents,
               order_type, customer_info, delivery_address, line_items, metadata`,
    [orderId],
  );

  return result.rows[0] ?? null;
}

async function getRestaurantFulfillmentData(
  restaurantId: string,
): Promise<RestaurantFulfillmentRow | null> {
  const result = await executeQuery<RestaurantFulfillmentRow>(
    `SELECT id, name, address, deliverect_location_id
     FROM restaurants
     WHERE id = $1
     LIMIT 1`,
    [restaurantId],
  );

  return result.rows[0] ?? null;
}

async function markFulfillmentFailed(orderId: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown fulfillment error";
  await executeQuery(
    `UPDATE restaurant_order_intents
     SET pos_status = 'failed',
         fulfillment_last_error = $2,
         metadata = metadata || $3::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [
      orderId,
      message.slice(0, 1000),
      JSON.stringify({ fulfillmentError: message.slice(0, 1000) }),
    ],
  );
}

async function recordFulfillmentSuccess(input: {
  orderId: string;
  posOrder: DeliverectResponse;
  delivery: LogisticsResponse | null;
  deliveryProvider: string | null;
}) {
  await executeQuery(
    `UPDATE restaurant_order_intents
     SET deliverect_order_id = $2,
         pos_status = $3,
         delivery_provider = $4,
         delivery_tracking_id = $5,
         delivery_status = $6,
         delivery_fee_cents = COALESCE($7, delivery_fee_cents),
         estimated_ready_time = $8,
         estimated_delivery_time = $9,
         fulfillment_last_error = NULL,
         metadata = metadata || $10::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [
      input.orderId,
      input.posOrder.orderId,
      input.posOrder.status,
      input.deliveryProvider,
      input.delivery?.trackingId ?? null,
      input.delivery?.status ?? null,
      input.delivery?.deliveryFeeCents ?? null,
      input.posOrder.estimatedReadyTime ?? null,
      input.delivery?.estimatedDeliveryTime ?? null,
      JSON.stringify({
        fulfillment: {
          deliverectOrderId: input.posOrder.orderId,
          posStatus: input.posOrder.status,
          deliveryTrackingId: input.delivery?.trackingId ?? null,
          deliveryStatus: input.delivery?.status ?? null,
        },
      }),
    ],
  );
}

export async function triggerOrderFulfillment(orderId: string): Promise<void> {
  const order = await claimOrderForFulfillment(orderId);
  if (!order) return;

  try {
    const metadata = order.metadata ?? {};
    const restaurant = await getRestaurantFulfillmentData(order.restaurant_id);
    const deliverectLocationId =
      restaurant?.deliverect_location_id || order.restaurant_id;
    const customer = normalizeCustomer(order.customer_info ?? metadata.customer);
    const orderType = normalizeOrderType(order.order_type ?? metadata.orderType);
    const deliveryAddress = normalizeAddress(
      order.delivery_address ?? metadata.deliveryAddress,
    );
    const pickupAddress = normalizeAddress(restaurant?.address);
    const items = normalizeLineItems(order.line_items, order.total_cents);

    const deliverectClient = new DeliverectClient();
    const posOrder = await deliverectClient.injectOrder(deliverectLocationId, {
      externalId: order.id,
      channelOrderId: order.id,
      items,
      customer,
      deliveryAddress: deliveryAddress ?? undefined,
      orderType,
      preparationTime: numberValue(metadata.preparationTime) ?? undefined,
    });

    let delivery: LogisticsResponse | null = null;
    let deliveryProvider: string | null = null;

    if (orderType === "delivery" && deliveryAddress && pickupAddress) {
      const logisticsClient = new LogisticsClient();
      deliveryProvider = process.env.LOGISTICS_PROVIDER || "doordash_drive";
      delivery = await logisticsClient.requestDriver({
        orderId: order.id,
        pickupAddress,
        deliveryAddress,
        orderValue: order.total_cents,
        specialInstructions: text(metadata.specialInstructions) || undefined,
        estimatedReadyTime: posOrder.estimatedReadyTime,
      });
    }

    await recordFulfillmentSuccess({
      orderId: order.id,
      posOrder,
      delivery,
      deliveryProvider,
    });

    console.log(
      `[fulfillment] Restaurant order fulfilled: order=${order.id} pos=${posOrder.orderId} delivery=${delivery?.trackingId ?? "none"}`,
    );
  } catch (error) {
    await markFulfillmentFailed(order.id, error);
    console.error(`[fulfillment] Failed for restaurant order ${order.id}:`, error);
    throw error;
  }
}
