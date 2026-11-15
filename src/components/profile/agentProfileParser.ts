/**
 * Wire parser for `profile.agentProfile` of GET /api/users/[userId]
 * (`CraftedAgentProfile`, src/lib/agents/craftedAgentTypes.ts).
 *
 * PRODUCER. There is NO in-repo producer to cite: the rich profile is JSON from an
 * external service (ASOL), fetched by src/lib/agents/fetchAgentProfile.ts, whose
 * `z.custom` only checks that the body is an object. So every field is parsed
 * against the DECLARED type and optionality mirrors it. What the lead route,
 * src/app/api/users/[userId]/route.ts, does around it:
 *  - external-agent path, 229-278: `agentProfile: externalAgent` (246) goes out as it
 *    came, and the route itself falls back around `.consciousness?.dominantElement`
 *    (to Fire: a quantity such as "Spirit" is never an element), `.consciousness?.natalChart`,
 *    `.birthData` and `.historicalDiet`;
 *  - DB path, 396-447: the ASOL fetch is a `Promise.allSettled`, so a failed or
 *    missing profile is SYNTHESIZED at 418-446: name, title, era, appearance
 *    {color, symbol}, consciousness {dominantElement, level, natalChart}, an
 *    optional historicalDiet and personality.core {essence, expression, emotion}
 *    (the object is 422-443); 444-445 also sets `historicalDiet` from the DB JSON
 *    onto an ASOL profile that has none.
 * `null` / `undefined` (a non-agent, or ASOL down) is a normal answer, not drift.
 *
 * CONSUMER. src/app/(alchm)/profile/[userId]/AgentProfile.tsx needs only `name`
 * (`.split` at 120, `.charAt` at 183); every other field is read through `?.`:
 * appearance 110/183, consciousness.dominantElement/natalChart/level 116/124/625-627,
 * title/era 220-222, personality.core 328-337, abilities.specialty 340, synthesis
 * 346, historicalDiet 381-474, quotes 491. So `name` is the one field whose
 * absence returns `null`.
 *
 * TWO READINGS, never conflated (CONTEXT.md: quantities and elements are orthogonal).
 * `dominantElement` is Fire, Water, Earth or Air; `dominantAlchemicalQuantity` is
 * Spirit, Essence, Matter or Substance. scripts/sync-agentic-users.ts:120-123
 * (`RawConsciousness`) types the element optional and the route already falls back
 * around it, so a block that lacks it, or names something that is not an element
 * ("Spirit" is a quantity), KEEPS its natalChart and level: the element defaults to
 * Fire and the report names the field, so production reports will show whether
 * ASOL really omits it. No in-repo producer or typed consumer names the quantity (ASOL
 * payloads were not inspected); it defaults to Spirit silently when absent and with a
 * report when present but not a quantity.
 * Each reading is defaulted on its own, nothing is derived from the other
 * (consciousnessAxes.ts holds the basis of both defaults).
 *
 * The profile is ancillary, so anything malformed degrades (the field or block is
 * omitted) and is REPORTED through `issues`; it never fails the page. Unknown keys
 * are not copied. `natalChart` is typed `unknown`, so any JSON value passes through.
 * Numbers must be finite; nothing stricter is enforced (the type declares no range).
 */

import {
  finite,
  pickLists,
  pickNumbers,
  pickText,
  report,
  rowsOf,
  scopeAt,
  section,
} from "@/components/profile/agentParsePrimitives";
import type { RecordParser, Scope } from "@/components/profile/agentParsePrimitives";
import { isAlchemicalQuantity, isClassicalElement, toAlchemicalQuantity, toClassicalElement } from "@/lib/agents/consciousnessAxes";
import type { CraftedAgentProfile, HistoricalDiet } from "@/lib/agents/craftedAgentTypes";
import { isJsonRecord } from "@/lib/api/json";

type Appearance = NonNullable<CraftedAgentProfile["appearance"]>;
type Consciousness = NonNullable<CraftedAgentProfile["consciousness"]>;
type Personality = NonNullable<CraftedAgentProfile["personality"]>;
type Abilities = NonNullable<CraftedAgentProfile["abilities"]>;
type BirthData = NonNullable<CraftedAgentProfile["birthData"]>;
/** The wire key `alchemicalElements` holds the ESMS QUANTITIES (spirit, essence, matter, substance): a pre-existing misnomer (CONTEXT.md reserves "elements" for Fire, Water, Earth, Air), kept because it is the wire name. */
type AlchemicalElements = NonNullable<Consciousness["alchemicalElements"]>;
type Core = NonNullable<Personality["core"]>;
type BirthLocation = NonNullable<BirthData["location"]>;

/** Gift, Shadow and Challenge share these two required strings and differ in one optional string. */
interface TitledRow {
  type: string;
  description: string;
}

function parseAppearance(record: Record<string, unknown>, at: Scope): Appearance {
  return pickText(record, ["symbol", "color"], at);
}

function parseElements(record: Record<string, unknown>, at: Scope): AlchemicalElements | null {
  const spirit = finite(record.spirit);
  const essence = finite(record.essence);
  const matter = finite(record.matter);
  const substance = finite(record.substance);
  if (spirit === null || essence === null || matter === null || substance === null) {
    report(at, "spirit, essence, matter and substance must all be finite numbers, omitted");
    return null;
  }
  return { spirit, essence, matter, substance };
}

function parseConsciousness(record: Record<string, unknown>, at: Scope): Consciousness {
  const { dominantElement, dominantAlchemicalQuantity, natalChart } = record;
  if (!isClassicalElement(dominantElement)) {
    const detail = dominantElement === undefined ? "missing" : "not Fire, Water, Earth or Air";
    report(scopeAt(at, "dominantElement"), `${detail}, defaulted to Fire`);
  }
  if (dominantAlchemicalQuantity !== undefined && !isAlchemicalQuantity(dominantAlchemicalQuantity)) {
    report(scopeAt(at, "dominantAlchemicalQuantity"), "not Spirit, Essence, Matter or Substance, defaulted to Spirit");
  }
  const alchemicalElements = section(record, "alchemicalElements", at, parseElements);
  return {
    dominantElement: toClassicalElement(dominantElement),
    dominantAlchemicalQuantity: toAlchemicalQuantity(dominantAlchemicalQuantity),
    ...pickText(record, ["dominantModality", "level", "strength", "emotion", "signature"], at),
    ...(natalChart !== undefined ? { natalChart } : {}),
    ...(alchemicalElements !== null ? { alchemicalElements } : {}),
  };
}

function parseCore(record: Record<string, unknown>, at: Scope): Core | null {
  const { essence, expression, emotion } = record;
  if (typeof essence !== "string" || typeof expression !== "string" || typeof emotion !== "string") {
    report(at, "essence, expression and emotion must all be strings, omitted");
    return null;
  }
  return { essence, expression, emotion };
}

function titledRow<K extends string>(optionalKey: K): RecordParser<TitledRow & Partial<Record<K, string>>> {
  return (row, at) => {
    const { type, description } = row;
    if (typeof type !== "string" || typeof description !== "string") return null;
    return { type, description, ...pickText(row, [optionalKey], at) };
  };
}

function parsePersonality(record: Record<string, unknown>, at: Scope): Personality {
  const core = section(record, "core", at, parseCore);
  const gifts = rowsOf(record.gifts, scopeAt(at, "gifts"), titledRow("expression"));
  const shadows = rowsOf(record.shadows, scopeAt(at, "shadows"), titledRow("transformationPath"));
  const challenges = rowsOf(record.challenges, scopeAt(at, "challenges"), titledRow("growthOpportunity"));
  return {
    ...(core !== null ? { core } : {}),
    ...pickLists(record, ["traits"], at),
    ...pickText(record, ["currentMood"], at),
    ...(gifts !== null ? { gifts } : {}),
    ...(shadows !== null ? { shadows } : {}),
    ...(challenges !== null ? { challenges } : {}),
  };
}

function parseAbilities(record: Record<string, unknown>, at: Scope): Abilities {
  return {
    ...pickText(record, ["specialty", "teachingStyle", "resonanceType", "uniquePower"], at),
    ...pickLists(record, ["wisdomDomains"], at),
  };
}

function parseDiet(record: Record<string, unknown>, at: Scope): HistoricalDiet {
  return {
    ...pickText(record, ["culturalCuisine", "dietaryPhilosophy", "foodLore"], at),
    ...pickLists(record, ["staples", "favoriteFoods", "avoidedFoods", "beverages"], at),
  };
}

function parseLocation(record: Record<string, unknown>, at: Scope): BirthLocation {
  return {
    ...pickText(record, ["name"], at),
    ...pickNumbers(record, ["latitude", "longitude"], at),
  };
}

function parseBirthData(record: Record<string, unknown>, at: Scope): BirthData {
  const location = section(record, "location", at, parseLocation);
  return {
    ...pickText(record, ["date", "time"], at),
    ...(location !== null ? { location } : {}),
  };
}

/**
 * `null` when there is no profile (normal for non-agents) or when `name` is
 * missing; the second case, and every omitted field or block, also pushes a
 * reason onto `issues`.
 */
export function parseCraftedAgentProfile(value: unknown, issues: string[]): CraftedAgentProfile | null {
  if (value === undefined || value === null) return null;
  const at: Scope = { path: "agentProfile", issues };
  if (!isJsonRecord(value)) {
    report(at, "not an object");
    return null;
  }
  const { name } = value;
  if (typeof name !== "string") {
    report(scopeAt(at, "name"), "missing or not a string");
    return null;
  }
  const appearance = section(value, "appearance", at, parseAppearance);
  const consciousness = section(value, "consciousness", at, parseConsciousness);
  const personality = section(value, "personality", at, parsePersonality);
  const abilities = section(value, "abilities", at, parseAbilities);
  const historicalDiet = section(value, "historicalDiet", at, parseDiet);
  const birthData = section(value, "birthData", at, parseBirthData);
  return {
    name,
    ...pickText(value, ["title", "era", "specialization", "synthesis", "monicaCreationStory"], at),
    ...pickLists(value, ["quotes", "coreBeliefs"], at),
    ...(appearance !== null ? { appearance } : {}),
    ...(consciousness !== null ? { consciousness } : {}),
    ...(personality !== null ? { personality } : {}),
    ...(abilities !== null ? { abilities } : {}),
    ...(historicalDiet !== null ? { historicalDiet } : {}),
    ...(birthData !== null ? { birthData } : {}),
  };
}
