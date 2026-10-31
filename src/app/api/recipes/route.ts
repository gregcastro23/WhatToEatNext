/**
 * GET/POST /api/recipes
 * Returns the whole recipe catalog, with optional filtering by element,
 * cuisine, or search query. Nothing caps it: with no `limit` every recipe
 * comes back, and a caller that sends one gets exactly that page.
 */
import { NextResponse } from "next/server";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { parseCatalogWindow } from "@/lib/recipes/catalogQuery";
import { loadCatalogPage } from "@/lib/recipes/catalogService";
import { RecipesQueryBodySchema } from "@/lib/validation/apiSchemas";
import { createLogger } from "@/utils/logger";

const logger = createLogger("recipes");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const { HONO_API_URL } = process.env;

async function handleGet(request: Request) {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "recipes-list" });
  if (!rl.allowed) return rl.response!;
  try {
    const url = new URL(request.url);

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/recipes${url.search}`);
        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        logger.error("Hono Gateway proxy failed:", err);
      }
    }

    const page = await loadCatalogPage(
      {
        element: url.searchParams.get("element"),
        cuisine: url.searchParams.get("cuisine"),
        search: url.searchParams.get("q") ?? url.searchParams.get("search"),
      },
      parseCatalogWindow(
        url.searchParams.get("limit"),
        url.searchParams.get("offset"),
      ),
    );
    return NextResponse.json(page);
  } catch (error) {
    logger.error("[recipes] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch recipes" }, { status: 500 });
  }
}

async function handlePost(request: Request) {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "recipes-list" });
  if (!rl.allowed) {
    return (
      rl.response ??
      NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 })
    );
  }
  // Allow POST with body params as an alternative to GET query params
  try {
    const rawBody: unknown = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = RecipesQueryBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { element, cuisine, search, limit, offset } = parsed.data;

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });
        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        logger.error("Hono Gateway proxy failed:", err);
      }
    }

    const params = new URLSearchParams();
    if (element) params.set("element", element);
    if (cuisine) params.set("cuisine", cuisine);
    if (search) params.set("q", search);
    if (limit !== undefined) params.set("limit", String(limit));
    params.set("offset", String(offset));

    const syntheticReq = new Request(`${new URL(request.url).origin}/api/recipes?${params}`);
    return handleGet(syntheticReq);
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export const GET = withObservability({ routeName: "/api/recipes" }, handleGet);
export const POST = withObservability({ routeName: "/api/recipes" }, handlePost);
