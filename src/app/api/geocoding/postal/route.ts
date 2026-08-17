/**
 * Postal-code geocoding route.
 *
 * GET /api/geocoding/postal?code=80202
 *
 * Separate from `/api/geocoding` because the answer is a different kind of
 * thing: that route returns up to five candidate places for a free-text query,
 * this one resolves a single code whose country is fixed by its own pattern. The
 * shapes are kept apart so a caller cannot accidentally read a postal centroid
 * as if it were a verified address match.
 *
 * Shares the `geocoding` rate-limit bucket with the free-text route, so this is
 * not a second budget to spend against the same upstream.
 */

import { NextResponse } from "next/server";
import { parsePostalCode } from "@/lib/location/postalCode";
import { rateLimit } from "@/lib/rateLimit";
import { resolvePostalCode } from "@/services/geocodingService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "geocoding" });
  if (!rl.allowed) return rl.response!;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code?.trim()) {
    return NextResponse.json(
      { success: false, message: "code parameter is required" },
      { status: 400 },
    );
  }

  // The pattern IS the country attribution — there is no `country` parameter to
  // override it with, deliberately. A caller who could pass `country=us` for an
  // arbitrary string could put a cook on the wrong continent with a typo, and
  // the free-text route already handles "code, country name" input properly.
  const parsed = parsePostalCode(code);
  if (!parsed) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Not a recognised postal code. Supported: US ZIP, Canadian postal code, UK postcode. Other places: search by city or address instead.",
      },
      { status: 422 },
    );
  }

  try {
    const result = await resolvePostalCode(parsed);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: `No place found for ${parsed.code}.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Postal geocoding error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resolve postal code" },
      { status: 502 },
    );
  }
}
