/**
 * What the site's method records say about a technique, for any food. Its
 * temperatures are left out: the records mix units and name no source
 * (cooking-methods data), so a number there would be advice without a basis.
 */
import { allCookingMethods } from "@/data/cooking/methods";
import { getAlchemicalProfile } from "@/data/cooking/profiles";
import type { GuideMethodId } from "@/lib/cooking/foodGuides/schema";
import type { GeneralMethod } from "@/lib/validation/methodSearchSchemas";

/**
 * Guide methods with a record on /cooking-methods. Oven baking and pan frying
 * have none: the nearest records are roasting (trussing, whole poultry) and
 * deep frying, which would be wrong advice.
 */
const RECORD_FOR: Readonly<Partial<Record<GuideMethodId, keyof typeof allCookingMethods>>> = {
  roast: "roasting",
  saute: "stir_frying",
  stir_fry: "stir_frying",
  deep_fry: "frying",
  grill: "grilling",
  broil: "broiling",
  boil: "boiling",
  simmer: "simmering",
  steam: "steaming",
  poach: "poaching",
  braise: "braising",
  pressure_cook: "pressure_cooking",
  sous_vide: "sous_vide",
  smoke: "smoking",
};

const LIMIT = 6;

export function generalMethodFor(method: GuideMethodId): GeneralMethod | null {
  const key = RECORD_FOR[method];
  if (key === undefined) return null;
  const record = allCookingMethods[key];
  const name = getAlchemicalProfile(key)?.displayName ?? record.name;
  return {
    id: key,
    name,
    href: `/cooking-methods/${key}`,
    description: record.description,
    equipment: [...(record.toolsRequired ?? [])].slice(0, LIMIT),
    tips: [...(record.expertTips ?? [])].slice(0, LIMIT),
    mistakes: [...(record.commonMistakes ?? [])].slice(0, LIMIT),
  };
}
