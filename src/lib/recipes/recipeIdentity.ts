/**
 * Recipe identity — one resolver for the three recipe id forms in circulation.
 *
 * `/recipes/[recipeId]` natively resolves only the live catalog's ids (DB
 * UUIDs, via LocalRecipeService). Two other id forms still reach it:
 *
 *   - static catalog ids from `getServerRecipes()` — the sitemap's historical
 *     URLs: `african-breakfast-all-authentic-east-african-mandazi`
 *   - ingredient-index ids from `src/data/generated/ingredientRecipeIndex.json`
 *     (IngredientDrawer "Used in N recipes" links): `chinese-authentic-sichuan-dan-dan-noodles`
 *
 * Both are bridged to the live catalog by normalized recipe name, with cuisine
 * as the tie-break when names collide. A static recipe with no unique live
 * twin resolves to itself ("static-only") so its page can still render.
 *
 * Pure: no I/O. The loader lives in `./recipeRefResolver`.
 */
import { isInternalCuisineCode } from "@/utils/internalCuisineCodes";

export interface RecipeIdentityRecord {
  id: string;
  name: string;
  cuisine?: string;
}

export type RecipeRefResolution =
  | { kind: "twin"; staticId: string; liveId: string }
  | { kind: "static-only"; staticId: string };

export interface RecipeIdentityStats {
  staticRecipes: number;
  twins: number;
  /** Static recipes whose name matched several live recipes that cuisine could not split. */
  ambiguous: number;
  staticOnly: number;
  indexAliases: number;
  /** Index aliases dropped because two static recipes produced the same one. */
  aliasCollisions: number;
}

export interface RecipeIdentityIndex {
  resolve: (ref: string) => RecipeRefResolution | null;
  /** Static ids with no live twin — the only static ids that are canonical. */
  staticOnlyIds: readonly string[];
  stats: RecipeIdentityStats;
}

/**
 * Exact-name key: lowercase, every non-alphanumeric run collapsed to one space.
 * Accented letters are dropped rather than folded, which keeps "Bún Bò Huế" and
 * "Bun Bo Hue" — two distinct live recipes — apart.
 */
function exactNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Exact-name key after folding diacritics ("Cháo" → "chao"); the fallback match. */
export function normalizeRecipeName(name: string): string {
  return exactNameKey(name.normalize("NFD").replace(/\p{M}/gu, ""));
}

/** Cuisine key for tie-breaking; internal archive codes ("hsca") carry no cuisine. */
function normalizeCuisine(cuisine: string | undefined): string {
  if (cuisine === undefined || isInternalCuisineCode(cuisine)) return "";
  return cuisine.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function slugPart(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeNonAscii(text: string): string {
  return text.replace(
    /[\u0080-￿]/g,
    (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

/**
 * The ingredient-index id(s) `scripts/buildIngredientRecipeIndex.ts` assigns a
 * recipe. The builder slugs raw source text, so a name written with `á`
 * escapes in the cuisine file comes out as `b-u00e1nh`; both spellings are
 * returned so either reaches the recipe.
 */
export function indexRecipeIdAliases(cuisine: string, name: string): string[] {
  const prefix = cuisine.toLowerCase().replace(/\s+/g, "-");
  const plain = `${prefix}-${slugPart(name)}`;
  const escaped = `${prefix}-${slugPart(escapeNonAscii(name))}`;
  return plain === escaped ? [plain] : [plain, escaped];
}

type NameKey = (name: string) => string;

interface LiveNameMaps {
  exact: Map<string, RecipeIdentityRecord[]>;
  folded: Map<string, RecipeIdentityRecord[]>;
}

function groupLiveByName(
  live: readonly RecipeIdentityRecord[],
  keyOf: NameKey,
): Map<string, RecipeIdentityRecord[]> {
  const byName = new Map<string, RecipeIdentityRecord[]>();
  for (const record of live) {
    const key = keyOf(record.name);
    if (!key) continue;
    const bucket = byName.get(key);
    if (bucket) bucket.push(record);
    else byName.set(key, [record]);
  }
  return byName;
}

type TwinPick = RecipeIdentityRecord | "ambiguous" | null;

function pickTwin(record: RecipeIdentityRecord, candidates: readonly RecipeIdentityRecord[]): TwinPick {
  const [only] = candidates;
  if (candidates.length === 1 && only) return only;
  if (candidates.length === 0) return null;
  const cuisine = normalizeCuisine(record.cuisine);
  const sameCuisine = candidates.filter((c) => normalizeCuisine(c.cuisine) === cuisine);
  const [pick] = sameCuisine;
  return sameCuisine.length === 1 && pick ? pick : "ambiguous";
}

/**
 * The unique live twin of a static recipe, `"ambiguous"`, or null when none
 * exists. The folded key is consulted only when the exact key finds nothing:
 * folding can only merge names, so it never resolves an exact-key ambiguity.
 */
function findLiveTwin(record: RecipeIdentityRecord, maps: LiveNameMaps): TwinPick {
  const exact = pickTwin(record, maps.exact.get(exactNameKey(record.name)) ?? []);
  if (exact !== null) return exact;
  return pickTwin(record, maps.folded.get(normalizeRecipeName(record.name)) ?? []);
}

interface AliasCandidate {
  alias: string;
  resolution: RecipeRefResolution;
}

/** The page an id ends up on: the live twin, or the static recipe itself. */
function targetOf(resolution: RecipeRefResolution): string {
  return resolution.kind === "twin" ? `live:${resolution.liveId}` : `static:${resolution.staticId}`;
}

/**
 * Register index aliases that no static id already owns. An alias two static
 * recipes produce is kept only when both land on the same page.
 */
function registerAliases(
  byRef: Map<string, RecipeRefResolution>,
  candidates: readonly AliasCandidate[],
): { registered: number; collisions: number } {
  const owners = new Map<string, RecipeRefResolution | "collision">();
  for (const { alias, resolution } of candidates) {
    if (byRef.has(alias)) continue;
    const existing = owners.get(alias);
    const clash =
      existing !== undefined &&
      (existing === "collision" || targetOf(existing) !== targetOf(resolution));
    owners.set(alias, clash ? "collision" : resolution);
  }
  let registered = 0;
  let collisions = 0;
  for (const [alias, owner] of owners) {
    if (owner === "collision") {
      collisions += 1;
      continue;
    }
    byRef.set(alias, owner);
    registered += 1;
  }
  return { registered, collisions };
}

export function buildRecipeIdentityIndex(
  staticRecipes: readonly RecipeIdentityRecord[],
  liveRecipes: readonly RecipeIdentityRecord[],
): RecipeIdentityIndex {
  const liveByName: LiveNameMaps = {
    exact: groupLiveByName(liveRecipes, exactNameKey),
    folded: groupLiveByName(liveRecipes, normalizeRecipeName),
  };
  const byRef = new Map<string, RecipeRefResolution>();
  const aliasCandidates: AliasCandidate[] = [];
  const staticOnlyIds: string[] = [];
  let twins = 0;
  let ambiguous = 0;

  for (const record of staticRecipes) {
    if (byRef.has(record.id)) continue; // duplicate static id: first wins
    const twin = findLiveTwin(record, liveByName);
    if (twin === "ambiguous") ambiguous += 1;
    const resolution: RecipeRefResolution =
      twin !== null && twin !== "ambiguous"
        ? { kind: "twin", staticId: record.id, liveId: twin.id }
        : { kind: "static-only", staticId: record.id };
    if (resolution.kind === "twin") twins += 1;
    else staticOnlyIds.push(record.id);
    byRef.set(record.id, resolution);
    for (const alias of indexRecipeIdAliases(record.cuisine ?? "", record.name)) {
      aliasCandidates.push({ alias, resolution });
    }
  }

  const { registered, collisions } = registerAliases(byRef, aliasCandidates);
  return {
    resolve: (ref) => byRef.get(ref) ?? null,
    staticOnlyIds,
    stats: {
      staticRecipes: twins + staticOnlyIds.length,
      twins,
      ambiguous,
      staticOnly: staticOnlyIds.length,
      indexAliases: registered,
      aliasCollisions: collisions,
    },
  };
}
