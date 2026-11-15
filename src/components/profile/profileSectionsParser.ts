/**
 * Section parsers for the public profile response (GET /api/users/[userId],
 * `src/app/api/users/[userId]/route.ts`); `publicProfileParser.ts` assembles them.
 *
 * Producer facts: `social` is built at route.ts:374-381 (external agents :237-244);
 * `balances` is four `parseFloat(...) || 0` numbers (:532-537); `natalPositions`,
 * `profile_layout` and `dietary_preferences` come from `parseJsonField` (:73-83), an
 * UNVALIDATED cast of a DB JSON column, so any JSON value is possible (the agent-sync
 * writer takes `natalPositions` as `z.unknown()`, internal/agent-sync/route.ts:52; the
 * array-expecting reader fullChartMonica.ts:116-119 returns null otherwise);
 * `tasteGraph` is `computeTasteGraph` (`userInteractionsService.ts:231`) or `null`
 * (:362-364; always `null` for external agents :268); `recentActivity` rows are
 * `feed_events` projections (:538-543) with a JSONB `metadata_payload`.
 *
 * Policy: ancillary, so a malformed part degrades (dropped row, empty list, omitted
 * key, zero counts) and is REPORTED on `issues`; it never fails the whole profile.
 * Outputs are plain mutable objects: `DietaryPrefsBlock` assigns into `data.dietary_preferences`.
 *
 * Pass-through: keys a section does not model (a placement's `house`, a taste graph's
 * `score` and `confidence`, a dietary `allergies`...) ride along untouched, because the
 * owner's JSON export serialises the whole profile state (unmodeledKeys.ts).
 */

import type {
  DietaryPreferencesData,
  NatalPlacement,
  TasteGraphData,
} from "@/components/profile/blocks/types";
import { unmodeledEntries } from "@/components/profile/unmodeledKeys";
import { isJsonRecord } from "@/lib/api/json";
import type { ProfileSocialBlock } from "@/types/social";

export interface ProfileBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface ProfileActivityRow {
  id: string;
  eventType: string;
  metadataPayload: Record<string, unknown> | null;
  createdAt: string;
}

/** What the page shows before a profile exists, and what a missing or malformed `social` block becomes. */
export const EMPTY_SOCIAL: ProfileSocialBlock = {
  followers: 0,
  following: 0,
  commensals: 0,
  tablesHosted: null,
  tablesJoined: null,
  viewer: null,
};

/** A fresh copy: the parsed profile is plain mutable state, so it must not alias the shared constant. */
function emptySocial(): ProfileSocialBlock {
  return { ...EMPTY_SOCIAL };
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** The string entries of an array, reporting how many other entries were dropped; `null` when not an array. */
function stringList(value: unknown, path: string, issues: string[]): string[] | null {
  if (!Array.isArray(value)) return null;
  const list: readonly unknown[] = value;
  const strings = list.filter((entry): entry is string => typeof entry === "string");
  if (strings.length < list.length) issues.push(`${path}: ${list.length - strings.length} non-string entries dropped`);
  return strings;
}

export function parseBalances(value: unknown): ProfileBalances | null {
  if (!isJsonRecord(value)) return null;
  const spirit = finite(value.spirit);
  const essence = finite(value.essence);
  const matter = finite(value.matter);
  const substance = finite(value.substance);
  if (spirit === null || essence === null || matter === null || substance === null) return null;
  return { spirit, essence, matter, substance };
}

/** `undefined` means malformed; `null` is the legitimate "no authenticated viewer / viewer is owner". */
function parseViewer(value: unknown): ProfileSocialBlock["viewer"] | undefined {
  if (value === null) return null;
  if (!isJsonRecord(value)) return undefined;
  const { follows, followedBy, isCommensal } = value;
  if (typeof follows !== "boolean" || typeof followedBy !== "boolean" || typeof isCommensal !== "boolean") {
    return undefined;
  }
  return { follows, followedBy, isCommensal };
}

export function parseSocial(value: unknown, issues: string[]): ProfileSocialBlock {
  if (value === undefined || value === null) return emptySocial();
  if (!isJsonRecord(value)) {
    issues.push("social: not an object, zero counts used");
    return emptySocial();
  }
  const followers = finite(value.followers);
  const following = finite(value.following);
  const commensals = finite(value.commensals);
  const tablesHosted = finite(value.tablesHosted);
  const tablesJoined = finite(value.tablesJoined);
  const viewer = parseViewer(value.viewer);
  const countsOk = followers !== null && following !== null && commensals !== null;
  const tablesOk =
    (tablesHosted !== null || value.tablesHosted === null) && (tablesJoined !== null || value.tablesJoined === null);
  if (!countsOk || !tablesOk || viewer === undefined) {
    issues.push("social: malformed, zero counts used");
    return emptySocial();
  }
  return { followers, following, commensals, tablesHosted, tablesJoined, viewer };
}

const PLACEMENT_KEYS = ["planet", "sign", "degree", "minutes"];

function parsePlacement(value: Record<string, unknown>): NatalPlacement {
  const planet = text(value.planet);
  const sign = text(value.sign);
  const degree = finite(value.degree);
  const minutes = finite(value.minutes);
  return {
    ...unmodeledEntries(value, PLACEMENT_KEYS),
    ...(planet !== null ? { planet } : {}),
    ...(sign !== null ? { sign } : {}),
    ...(degree !== null ? { degree } : {}),
    ...(minutes !== null ? { minutes } : {}),
  };
}

export function parseNatalPositions(value: unknown, issues: string[]): NatalPlacement[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    issues.push("natalPositions: not an array, ignored");
    return [];
  }
  const list: readonly unknown[] = value;
  const out: NatalPlacement[] = [];
  list.forEach((item, index) => {
    if (!isJsonRecord(item)) {
      issues.push(`natalPositions[${index}]: not an object, dropped`);
      return;
    }
    const placement = parsePlacement(item);
    const given = PLACEMENT_KEYS.filter((key) => item[key] !== undefined && item[key] !== null).length;
    const kept = PLACEMENT_KEYS.filter((key) => key in placement).length;
    if (kept < given) issues.push(`natalPositions[${index}]: ${given - kept} mistyped field(s) dropped`);
    out.push(placement);
  });
  return out;
}

function parseActivityRow(value: unknown, index: number, issues: string[]): ProfileActivityRow | null {
  if (!isJsonRecord(value)) return null;
  const id = text(value.id);
  const eventType = text(value.eventType);
  const createdAt = text(value.createdAt);
  if (id === null || eventType === null || createdAt === null) return null;
  const payload = value.metadataPayload;
  const metadataPayload = isJsonRecord(payload) ? payload : null;
  if (payload !== null && payload !== undefined && metadataPayload === null) {
    issues.push(`recentActivity[${index}].metadataPayload: not an object, set to null`);
  }
  return { id, eventType, metadataPayload, createdAt };
}

export function parseRecentActivity(value: unknown, issues: string[]): ProfileActivityRow[] {
  if (!Array.isArray(value)) {
    issues.push("recentActivity: not an array, treated as empty");
    return [];
  }
  const list: readonly unknown[] = value;
  const rows: ProfileActivityRow[] = [];
  list.forEach((item, index) => {
    const row = parseActivityRow(item, index, issues);
    if (row === null) issues.push(`recentActivity[${index}]: not a valid row, dropped`);
    else rows.push(row);
  });
  return rows;
}

function parseAffinities(value: unknown, issues: string[]): Record<string, number> | null {
  if (value === undefined) return null;
  if (!isJsonRecord(value)) {
    issues.push("tasteGraph.elementalAffinities: not an object, dropped");
    return null;
  }
  // fromEntries defines OWN properties, so even a literal "__proto__" key survives (assignment would lose it).
  const entries: Array<[string, number]> = [];
  for (const [key, entry] of Object.entries(value)) {
    const n = finite(entry);
    if (n === null) issues.push(`tasteGraph.elementalAffinities.${key}: not a finite number, dropped`);
    else entries.push([key, n]);
  }
  return Object.fromEntries(entries);
}

function parseCuisines(value: unknown, issues: string[]): Array<{ name: string }> | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) {
    issues.push("tasteGraph.cuisines: not an array, dropped");
    return null;
  }
  const list: readonly unknown[] = value;
  const out: Array<{ name: string }> = [];
  list.forEach((item, index) => {
    if (!isJsonRecord(item) || typeof item.name !== "string") issues.push(`tasteGraph.cuisines[${index}]: no string name, dropped`);
    else out.push({ ...unmodeledEntries(item, ["name"]), name: item.name });
  });
  return out;
}

/** `null` (the wire value for external agents or a failed computation) and absent both mean "no taste graph". */
export function parseTasteGraph(value: unknown, issues: string[]): TasteGraphData | null {
  if (value === undefined || value === null) return null;
  if (!isJsonRecord(value)) {
    issues.push("tasteGraph: not an object, dropped");
    return null;
  }
  const elementalAffinities = parseAffinities(value.elementalAffinities, issues);
  const cuisines = parseCuisines(value.cuisines, issues);
  return {
    ...unmodeledEntries(value, ["elementalAffinities", "cuisines"]),
    ...(elementalAffinities !== null ? { elementalAffinities } : {}),
    ...(cuisines !== null ? { cuisines } : {}),
  };
}

export function parseDietaryPreferences(value: unknown, issues: string[]): DietaryPreferencesData | null {
  if (value === undefined || value === null) return null;
  if (!isJsonRecord(value)) {
    issues.push("dietary_preferences: not an object, dropped");
    return null;
  }
  const rest = unmodeledEntries(value, ["restrictions"]);
  if (value.restrictions === undefined) return rest;
  const restrictions = stringList(value.restrictions, "dietary_preferences.restrictions", issues);
  if (restrictions === null) {
    issues.push("dietary_preferences.restrictions: not an array, dropped");
    return rest;
  }
  return { ...rest, restrictions };
}

export function parseProfileLayout(value: unknown, issues: string[]): string[] | null {
  if (value === undefined || value === null) return null;
  const layout = stringList(value, "profile_layout", issues);
  if (layout === null) issues.push("profile_layout: not an array, default layout used");
  return layout;
}
