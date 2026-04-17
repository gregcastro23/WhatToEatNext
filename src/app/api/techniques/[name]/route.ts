import { NextResponse } from "next/server";
import { allCookingMethods } from "@/data/cooking/methods";

export const dynamic = "force-dynamic";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// Common verb → canonical cooking method name
const VERB_ALIASES: Record<string, string> = {
  roast: "roasting",
  roasted: "roasting",
  bake: "roasting",
  baked: "roasting",
  baking: "roasting",
  saute: "stirfrying",
  sauteed: "stirfrying",
  sear: "stirfrying",
  seared: "stirfrying",
  stirfry: "stirfrying",
  stirfried: "stirfrying",
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
  sousvide: "sousvide",
  pressurecook: "pressurecooking",
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
  _request: Request,
  props: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await props.params;
    const queryRaw = decodeURIComponent(name);
    const query = normalize(queryRaw);

    // Try direct key match first
    const keys = Object.keys(allCookingMethods);
    let match = keys.find((k) => normalize(k) === query);

    // Try alias
    if (!match && VERB_ALIASES[query]) {
      const aliasTarget = VERB_ALIASES[query];
      match = keys.find((k) => normalize(k) === aliasTarget);
    }

    // Try substring
    if (!match) {
      match = keys.find((k) => normalize(k).includes(query) || query.includes(normalize(k)));
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
