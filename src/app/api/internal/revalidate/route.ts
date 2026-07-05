/**
 * POST /api/internal/revalidate — on-demand ISR cache invalidation.
 *
 * Recipe detail pages are statically cached with hourly revalidation
 * (src/app/recipes/[recipeId]/page.tsx). After a bulk data change — e.g. a
 * description backfill — call this to refresh the prerendered HTML
 * immediately instead of waiting out the revalidate window or redeploying.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` — the same guard as
 * /api/cron/*, so no extra env var needs provisioning.
 *
 * Body (optional JSON): `{ "paths": ["/recipes/abc", "/recipes/[recipeId]"] }`
 * Each path must start with "/". A path containing a dynamic segment
 * ("[recipeId]") is revalidated with type "page", which busts every cached
 * page under that route. With no body, the default set below refreshes all
 * recipe detail pages plus the sitemap.
 *
 * Example:
 *   curl -X POST https://alchm.kitchen/api/internal/revalidate \
 *        -H "Authorization: Bearer $CRON_SECRET"
 *
 * @file src/app/api/internal/revalidate/route.ts
 */

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";

export const dynamic = "force-dynamic";

const DEFAULT_PATHS = ["/recipes/[recipeId]", "/sitemap.xml"];

export async function POST(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    paths?: unknown;
  } | null;

  let paths = DEFAULT_PATHS;
  if (Array.isArray(body?.paths) && body.paths.length > 0) {
    paths = body.paths.filter(
      (p): p is string => typeof p === "string" && p.startsWith("/"),
    );
    if (paths.length === 0) {
      return NextResponse.json(
        { error: "paths must be strings starting with '/'" },
        { status: 400 },
      );
    }
  }

  for (const path of paths) {
    if (path.includes("[")) {
      revalidatePath(path, "page");
    } else {
      revalidatePath(path);
    }
  }

  return NextResponse.json({ revalidated: paths });
}
