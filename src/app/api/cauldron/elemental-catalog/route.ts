import { NextResponse } from "next/server";
import { buildIngredientElementalCatalog } from "@/utils/cauldronVesselSimulation";

export const runtime = "nodejs";
// Built only from the bundled ingredient data, which changes per deploy and
// never per request: frozen at build time.
export const dynamic = "force-static";

/**
 * The cauldron simulator's ingredient lookup: name → Fire/Water/Earth/Air.
 *
 * Exists so /kitchen-lab/alchm, a client page, can resolve free-text
 * ingredient names without bundling the whole ingredient catalog.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    { catalog: buildIngredientElementalCatalog() },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
