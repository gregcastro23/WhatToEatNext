import { NextResponse } from "next/server";
import { normalizeSlug } from "@/constants/cookingMethodKeys";
import { allCookingMethods } from "@/data/cooking/methods";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Common verb → CANONICAL COOKING METHOD KEY.
 *
 * The values here are canonical keys, not URL slugs. They used to be written in
 * the stripped slug spelling (`"stirfrying"`, `"sousvide"`, `"pressurecooking"`),
 * which made this a hand-maintained parallel list that drifts the moment a
 * method is added or its key changes.
 *
 * Matching now runs both sides through `normalizeSlug`, which is derived from
 * the canonical key normalizer — so these values stay correct without anyone
 * remembering to restrip them.
 */
const VERB_ALIASES: Record<string, string> = {
  roast: "roasting",
  roasted: "roasting",
  bake: "roasting",
  baked: "roasting",
  baking: "roasting",
  saute: "stir_frying",
  sauteed: "stir_frying",
  sear: "stir_frying",
  seared: "stir_frying",
  stirfry: "stir_frying",
  stirfried: "stir_frying",
  fry: "frying",
  fried: "frying",
  deepfry: "frying",
  grill: "grilling",
  grilled: "grilling",
  broil: "broiling",
  broiled: "broiling",
  boil: "boiling",
  boiled: "boiling",
  simmer: "simmering",
  simmered: "simmering",
  poach: "poaching",
  poached: "poaching",
  steam: "steaming",
  steamed: "steaming",
  braise: "braising",
  braised: "braising",
  stew: "stewing",
  stewed: "stewing",
  sousvide: "sous_vide",
  pressurecook: "pressure_cooking",
  ferment: "fermentation",
  fermented: "fermentation",
  pickle: "pickling",
  pickled: "pickling",
  cure: "curing",
  cured: "curing",
  smoke: "smoking",
  smoked: "smoking",
  dehydrate: "dehydrating",
  dehydrated: "dehydrating",
  marinate: "marinating",
  marinated: "marinating",
  infuse: "infusing",
  infused: "infusing",
  raw: "raw",
};

export async function GET(
  request: Request,
  props: { params: Promise<{ name: string }> },
) {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "techniques-by-name" });
  if (!rl.allowed) return rl.response!;
  try {
    const { name } = await props.params;
    const queryRaw = decodeURIComponent(name);
    const query = normalizeSlug(queryRaw);

    // Both sides go through normalizeSlug, so the registry's own spelling never
    // has to match the URL's. `pressure_cooking`, `Pressure Cooking` and
    // `pressurecooking` all reduce to the same string.
    const keys = Object.keys(allCookingMethods);
    let match = keys.find((k) => normalizeSlug(k) === query);

    // Alias values are canonical keys, so they are slugged the same way rather
    // than being stored pre-stripped.
    if (!match && VERB_ALIASES[query]) {
      const aliasTarget = normalizeSlug(VERB_ALIASES[query]);
      match = keys.find((k) => normalizeSlug(k) === aliasTarget);
    }

    // Substring, last resort.
    if (!match) {
      match = keys.find(
        (k) => normalizeSlug(k).includes(query) || query.includes(normalizeSlug(k)),
      );
    }

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Technique not found", query: queryRaw },
        { status: 404 },
      );
    }

    const method = (allCookingMethods as Record<string, unknown>)[match];
    return NextResponse.json({ success: true, technique: method, canonicalKey: match });
  } catch (error) {
    console.error("[techniques/:name] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch technique" },
      { status: 500 },
    );
  }
}
