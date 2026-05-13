import { NextResponse } from "next/server";
import { getStandardizedQuantity, AMAZON_ASSOCIATE_TAG } from "@/data/amazon";
import { auth } from "@/lib/auth/auth";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import type {
  CheckoutPreflightItem,
  CheckoutPreflightRequest,
  CheckoutPreflightResponse,
  CheckoutPreflightSource,
} from "@/types/checkout";

const AMAZON_CART_URL = "https://www.amazon.com/gp/aws/cart/add.html";
const MAX_CART_ITEMS = 50;
const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const CHECKOUT_SOURCES = new Set<CheckoutPreflightSource>([
  "ingredients_storefront",
  "grocery_drawer",
  "recipe_detail",
  "menu_planner",
  "unknown",
]);

let dbModule: typeof import("@/lib/database") | null = null;

async function getDb() {
  if (!dbModule && typeof window === "undefined" && process.env.DATABASE_URL) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      return null;
    }
  }
  return dbModule;
}

interface NormalizedCartItem {
  asin: string;
  quantity: number;
  names: string[];
  chakras: string[];
  categories: string[];
  priceTotal: number | null;
}

function parseQuantity(item: CheckoutPreflightItem): number {
  const raw = item.qty ?? item.quantity ?? 1;
  const numeric = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

function parsePrice(price: CheckoutPreflightItem["price"]): number | null {
  if (typeof price === "number") return Number.isFinite(price) ? price : null;
  if (!price) return null;
  const match = price.replace(/,/g, "").match(/\d+(\.\d{1,2})?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeItems(items: unknown): {
  droppedCount: number;
  items: NormalizedCartItem[];
} {
  if (!Array.isArray(items)) return { droppedCount: 0, items: [] };

  let droppedCount = 0;
  const byAsin = new Map<string, NormalizedCartItem>();

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") {
      droppedCount += 1;
      continue;
    }

    const item = rawItem as CheckoutPreflightItem;
    const asin = String(item.asin || "").trim().toUpperCase();
    if (!ASIN_PATTERN.test(asin)) {
      droppedCount += 1;
      continue;
    }

    const name = String(item.name || item.ingredientName || asin).trim();
    const rawQuantity = parseQuantity(item);
    const quantity = getStandardizedQuantity(name, rawQuantity);
    const price = parsePrice(item.price);
    const existing = byAsin.get(asin);

    if (existing) {
      existing.quantity += quantity;
      if (name && !existing.names.includes(name)) existing.names.push(name);
      if (item.chakra && !existing.chakras.includes(item.chakra)) {
        existing.chakras.push(item.chakra);
      }
      if (item.category && !existing.categories.includes(item.category)) {
        existing.categories.push(item.category);
      }
      if (price !== null) {
        existing.priceTotal = (existing.priceTotal ?? 0) + price * quantity;
      }
      continue;
    }

    byAsin.set(asin, {
      asin,
      quantity,
      names: name ? [name] : [],
      chakras: item.chakra ? [item.chakra] : [],
      categories: item.category ? [item.category] : [],
      priceTotal: price === null ? null : price * quantity,
    });
  }

  const mergedItems = Array.from(byAsin.values());
  const overflowCount = Math.max(0, mergedItems.length - MAX_CART_ITEMS);

  return {
    droppedCount: droppedCount + overflowCount,
    items: mergedItems.slice(0, MAX_CART_ITEMS),
  };
}

function normalizeSource(source: unknown): CheckoutPreflightSource {
  if (typeof source !== "string") return "unknown";
  return CHECKOUT_SOURCES.has(source as CheckoutPreflightSource)
    ? (source as CheckoutPreflightSource)
    : "unknown";
}

function buildAmazonPayload(items: NormalizedCartItem[]): Record<string, string> {
  const payload: Record<string, string> = {
    AssociateTag: AMAZON_ASSOCIATE_TAG,
    "cart-type": "fresh",
    add: "add",
    "submit.add": "1",
  };

  items.forEach((item, index) => {
    const position = index + 1;
    payload[`ASIN.${position}`] = item.asin;
    payload[`Quantity.${position}`] = String(item.quantity);
  });

  return payload;
}

function buildChakraCounts(items: NormalizedCartItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    item.chakras.forEach((chakra) => {
      acc[chakra] = (acc[chakra] ?? 0) + item.quantity;
    });
    return acc;
  }, {});
}

async function logCartHandoffIntent({
  handoffId,
  source,
  items,
  droppedCount,
  payload,
  metadata,
  userId,
  request,
}: {
  handoffId: string;
  source: CheckoutPreflightSource;
  items: NormalizedCartItem[];
  droppedCount: number;
  payload: Record<string, string>;
  metadata?: Record<string, unknown>;
  userId: string | null;
  request: Request;
}) {
  const db = await getDb();
  if (!db) return;
  const estimatedTotal = items.reduce(
    (sum, item) => sum + (item.priceTotal ?? 0),
    0,
  );

  try {
    await db.executeQuery(
      `INSERT INTO cart_handoff_intents
        (id, user_id, source, item_count, dropped_count, estimated_total,
         chakra_counts, ingredient_names, asin_payload, metadata, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11)`,
      [
        handoffId,
        userId,
        source,
        items.length,
        droppedCount,
        estimatedTotal,
        JSON.stringify(buildChakraCounts(items)),
        JSON.stringify(items.flatMap((item) => item.names)),
        JSON.stringify(payload),
        JSON.stringify(metadata ?? {}),
        request.headers.get("user-agent"),
      ],
    );
  } catch (error) {
    console.warn("[api/checkout/preflight] telemetry insert failed:", error);
  }
}

export async function POST(request: Request) {
  let body: CheckoutPreflightRequest;
  try {
    body = (await request.json()) as CheckoutPreflightRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items, droppedCount } = normalizeItems(body.items);
  if (items.length === 0) {
    return NextResponse.json(
      { error: "No valid ASINs supplied", droppedCount },
      { status: 400 },
    );
  }

  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const source = normalizeSource(body.source);
  const payload = buildAmazonPayload(items);

  await logCartHandoffIntent({
    handoffId,
    source,
    items,
    droppedCount,
    payload,
    metadata: body.metadata,
    userId,
    request,
  });

  if (userId) {
    void reportQuestEventBestEffort(userId, "amazon_cart_send");
  }

  const response: CheckoutPreflightResponse = {
    success: true,
    handoffId,
    formAction: AMAZON_CART_URL,
    method: "POST",
    target: "_blank",
    itemCount: items.length,
    droppedCount,
    payload,
    items: items.map((item) => ({
      asin: item.asin,
      quantity: item.quantity,
      names: item.names,
    })),
  };

  return NextResponse.json(response);
}
