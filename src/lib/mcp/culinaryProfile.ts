/**
 * @file src/lib/mcp/culinaryProfile.ts
 *
 * User culinary profile management and allergen gating for MCP.
 */
import { normalizeDisallowedKey } from "@/lib/cooking/recipeGateAllergens";
import { executeQuery } from "@/lib/database/connection";
import { toolFailure, toStringArray, type ToolResult } from "./culinaryCommon";
import type { ResolvedCaller } from "./auth";

export {
  isRecipeSafeForProfile,
  profileSafeRecipeFilter,
} from "./culinarySafety";

export interface CallerCulinaryProfile {
  authenticated: boolean;
  userId: string | null;
  allergens: string[];
  dietaryFrameworks: string[];
  dislikedIngredients: string[];
  spiceTolerance: string | null;
  householdSize: number | null;
  kitchenEquipment: string[];
  dominantElement: string | null;
}

interface UserProfileRow {
  dietary_preferences: Record<string, unknown> | null;
  kitchen_settings: Record<string, unknown> | null;
  dominant_element: string | null;
}

function populateProfileFromRow(profile: CallerCulinaryProfile, row: UserProfileRow): void {
  const prefs = row.dietary_preferences ?? {};
  const kitchen = row.kitchen_settings ?? {};
  profile.allergens = toStringArray(prefs.allergens).map(normalizeDisallowedKey);
  profile.dietaryFrameworks = toStringArray(prefs.restrictions);
  profile.dislikedIngredients = toStringArray(prefs.dislikes);
  profile.kitchenEquipment = toStringArray(kitchen.appliances);
  profile.spiceTolerance = typeof prefs.spiceTolerance === "string" ? prefs.spiceTolerance : null;
  profile.householdSize = typeof prefs.householdSize === "number" ? prefs.householdSize : null;
  profile.dominantElement = row.dominant_element ?? null;
}

export async function getUserCulinaryProfile(
  caller?: ResolvedCaller,
): Promise<CallerCulinaryProfile> {
  const profile: CallerCulinaryProfile = {
    authenticated: Boolean(caller?.userId),
    userId: caller?.userId ?? null,
    allergens: [],
    dietaryFrameworks: [],
    dislikedIngredients: [],
    spiceTolerance: null,
    householdSize: null,
    kitchenEquipment: [],
    dominantElement: null,
  };

  if (caller?.userId && process.env.DATABASE_URL) {
    try {
      const res = await executeQuery<UserProfileRow>(
        `SELECT dietary_preferences, kitchen_settings, dominant_element
           FROM user_profiles
          WHERE user_id = $1
          LIMIT 1`,
        [caller.userId],
      );
      const [row] = res.rows;
      if (row) {
        populateProfileFromRow(profile, row);
      }
    } catch (err) {
      process.stderr.write(`[mcp/culinary-profile] query error: ${String(err)}\n`);
    }
  }

  return profile;
}

interface ProfileUpdatePayload {
  addAllergens: string[];
  removeAllergens: string[];
  addDislikes: string[];
  removeDislikes: string[];
  dietaryFrameworks?: string[];
  kitchenEquipment?: string[];
  setDiet?: string;
  spiceTolerance?: string;
  householdSize?: number;
}

interface MergedProfileResult {
  updatedPrefs: Record<string, unknown>;
  updatedKitchen: Record<string, unknown>;
  activeAllergens: string[];
  frameworks: string[];
  dislikes: string[];
  equipment: string[];
}

interface CollectionSetsResult {
  allergensSet: Set<string>;
  dislikesSet: Set<string>;
  frameworksSet: Set<string>;
  equipmentSet: Set<string>;
}

function updateCollectionSets(
  existingPrefs: Record<string, unknown>,
  existingKitchen: Record<string, unknown>,
  payload: ProfileUpdatePayload,
): CollectionSetsResult {
  const allergensSet = new Set<string>(toStringArray(existingPrefs.allergens).map(normalizeDisallowedKey));
  for (const a of payload.addAllergens) {
    if (a.trim()) allergensSet.add(normalizeDisallowedKey(a));
  }
  for (const a of payload.removeAllergens) {
    allergensSet.delete(normalizeDisallowedKey(a));
  }

  const dislikesSet = new Set<string>(toStringArray(existingPrefs.dislikes));
  for (const d of payload.addDislikes) {
    if (d.trim()) dislikesSet.add(d.toLowerCase().trim());
  }
  for (const d of payload.removeDislikes) {
    dislikesSet.delete(d.toLowerCase().trim());
  }

  const frameworksSet = new Set<string>(toStringArray(existingPrefs.restrictions));
  for (const f of payload.dietaryFrameworks ?? []) {
    if (f.trim()) frameworksSet.add(f.trim().toLowerCase());
  }

  const equipmentSet = new Set<string>(toStringArray(existingKitchen.appliances));
  for (const eq of payload.kitchenEquipment ?? []) {
    if (eq.trim()) equipmentSet.add(eq.trim().toLowerCase());
  }

  return { allergensSet, dislikesSet, frameworksSet, equipmentSet };
}

function mergeProfileSets(
  existingPrefs: Record<string, unknown>,
  existingKitchen: Record<string, unknown>,
  payload: ProfileUpdatePayload,
): MergedProfileResult {
  const { allergensSet, dislikesSet, frameworksSet, equipmentSet } =
    updateCollectionSets(existingPrefs, existingKitchen, payload);

  const updatedPrefs = {
    ...existingPrefs,
    allergens: Array.from(allergensSet),
    dislikes: Array.from(dislikesSet),
    restrictions: Array.from(frameworksSet),
    ...(payload.setDiet !== undefined ? { diet: payload.setDiet } : {}),
    ...(payload.spiceTolerance !== undefined ? { spiceTolerance: payload.spiceTolerance } : {}),
    ...(payload.householdSize !== undefined ? { householdSize: payload.householdSize } : {}),
  };

  const updatedKitchen = {
    ...existingKitchen,
    appliances: Array.from(equipmentSet),
  };

  return {
    updatedPrefs,
    updatedKitchen,
    activeAllergens: Array.from(allergensSet),
    frameworks: Array.from(frameworksSet),
    dislikes: Array.from(dislikesSet),
    equipment: Array.from(equipmentSet),
  };
}

async function persistProfileUpdate(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<MergedProfileResult> {
  const res = await executeQuery<{
    dietary_preferences: Record<string, unknown> | null;
    kitchen_settings: Record<string, unknown> | null;
  }>(
    `SELECT dietary_preferences, kitchen_settings FROM user_profiles WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  const [row] = res.rows;
  const merged = mergeProfileSets(row?.dietary_preferences ?? {}, row?.kitchen_settings ?? {}, payload);

  await executeQuery(
    `INSERT INTO user_profiles (user_id, dietary_preferences, kitchen_settings, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       dietary_preferences = EXCLUDED.dietary_preferences,
       kitchen_settings = EXCLUDED.kitchen_settings,
       updated_at = NOW()`,
    [userId, JSON.stringify(merged.updatedPrefs), JSON.stringify(merged.updatedKitchen)],
  );

  return merged;
}

function parseProfileUpdatePayload(args: Record<string, unknown>): ProfileUpdatePayload {
  const payload: ProfileUpdatePayload = {
    addAllergens: toStringArray(args.addAllergens),
    removeAllergens: toStringArray(args.removeAllergens),
    addDislikes: toStringArray(args.addDislikes),
    removeDislikes: toStringArray(args.removeDislikes),
  };
  if (Array.isArray(args.dietaryFrameworks)) {
    payload.dietaryFrameworks = toStringArray(args.dietaryFrameworks);
  }
  if (Array.isArray(args.kitchenEquipment)) {
    payload.kitchenEquipment = toStringArray(args.kitchenEquipment);
  }
  if (typeof args.setDiet === "string") {
    payload.setDiet = args.setDiet;
  }
  if (typeof args.spiceTolerance === "string") {
    payload.spiceTolerance = args.spiceTolerance;
  }
  if (typeof args.householdSize === "number") {
    payload.householdSize = args.householdSize;
  }
  return payload;
}

function formatProfileToolResult(
  activeAllergens: string[],
  frameworks: string[],
  dislikes: string[],
  equipment: string[],
  payload: ProfileUpdatePayload,
): ToolResult {
  return {
    ok: true,
    data: {
      success: true,
      activeAllergens,
      dietaryFrameworks: frameworks,
      dislikedIngredients: dislikes,
      kitchenEquipment: equipment,
      spiceTolerance: payload.spiceTolerance ?? null,
      householdSize: payload.householdSize ?? null,
      appliedGateCount: activeAllergens.length,
    },
    summary: {
      success: true,
      activeAllergensCount: activeAllergens.length,
      dietaryFrameworksCount: frameworks.length,
      dislikedCount: dislikes.length,
    },
  };
}

export async function updateCulinaryProfileHandler(
  args: Record<string, unknown>,
  caller: ResolvedCaller,
): Promise<ToolResult> {
  if (!caller.userId) {
    return toolFailure(
      "UNAUTHORIZED",
      "Updating culinary profile requires an authenticated caller",
      "Pass an API key via 'Authorization: Bearer <sk_alchm_...>' or '_meta.apiKey' minted at https://alchm.kitchen/profile/api-keys.",
    );
  }

  const payload = parseProfileUpdatePayload(args);
  let activeAllergens: string[];
  let frameworks: string[];
  let dislikes: string[];
  let equipment: string[];

  if (process.env.DATABASE_URL) {
    try {
      const merged = await persistProfileUpdate(caller.userId, payload);
      ({ activeAllergens, frameworks, dislikes, equipment } = merged);
    } catch (err) {
      process.stderr.write(`[mcp/update-profile] DB error: ${String(err)}\n`);
      return toolFailure("INTERNAL", "Database error updating culinary profile");
    }
  } else {
    activeAllergens = payload.addAllergens.map(normalizeDisallowedKey);
    frameworks = payload.dietaryFrameworks ?? [];
    dislikes = payload.addDislikes.map((d) => d.toLowerCase().trim());
    equipment = payload.kitchenEquipment ?? [];
  }

  return formatProfileToolResult(activeAllergens, frameworks, dislikes, equipment, payload);
}
