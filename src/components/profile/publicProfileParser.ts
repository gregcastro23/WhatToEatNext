/**
 * Wire parser for GET /api/users/[userId], consumed by
 * `src/app/(alchm)/profile/[userId]/page.tsx`.
 *
 * Producer: `src/app/api/users/[userId]/route.ts`
 * - 400 / 404 / 500 answer `{ success: false, message }` (:166-169, :281-284, :553-555);
 * - an external ASOL agent answers `{ success: true, profile }` at :229-278
 *   (`tasteGraph: null`, hard-coded `social`, `agentProfile` = the ASOL body);
 * - everything else answers the DB-path profile at :501-545.
 *
 * Which fields are validated: everything the page reads, everything it forwards
 * to children (`AgentProfile`, `ProfileIdentityPanel`, `ProfileStatsPanel`,
 * `LiveAgentFeed`, `CosmicIdentityPanel`) and everything the profile blocks read
 * through `ProfileData` (`blocks/types.ts`). Keys NOT modeled here (`natalChart`,
 * `birthData`, and any key a later producer adds) are not typed and no panel reads
 * them, but they are carried through untouched: the owner's "Export JSON"
 * (`blocks/DataPrivacyBlock.tsx`) serialises this whole object, and a download
 * without the natal chart and the birth data would be a regression. The sections
 * do the same where the producer's shape is open (natal placements, the taste
 * graph and its cuisine rows, `dietary_preferences`; `profileSectionsParser.ts`,
 * helper `unmodeledKeys.ts`). `social` and its `viewer`, `balances` and the activity
 * rows are closed: the route builds exactly those keys (:153-157, :374-381,
 * :532-537, :538-543) and the real-route test (publicProfileParser.test.ts) fails if
 * it ever adds one. The ASOL-fed agent subtrees (`agentProfile`, `vessel`, the three
 * feeds) stay narrowed: an agent WITH an enriched profile (page.tsx `hasEnrichedAgent`)
 * renders `AgentProfile`, which renders no blocks and so no export; an agent without
 * one has no `agentProfile` to lose, and agents are never an owner session.
 *
 * Policy: the identity fields (`userId`, `name`, `isAgent`, `balances`) are
 * required; a response without them THROWS, into the page's existing catch.
 * `createdAt` is only the identity panel's "member since" label and
 * `users.created_at` is nullable in the schema (database/init/01-schema.sql), so a
 * missing one degrades to "" (the panel already treats an unparsable date as "no
 * year") and is reported. Everything else is ancillary: a malformed part degrades
 * and is reported on `issues` (the page logs them), never failing the whole profile.
 * The ASOL-fed agent subtrees have no in-repo producer to mirror
 * (`fetchAgentProfile.ts` only checks "is an object"), so the declared types are
 * the contract.
 */

import { parseAgentActions, parseAgentArtifacts, parseAgentInteractions } from "@/components/profile/agentFeedParser";
import { parseCraftedAgentProfile } from "@/components/profile/agentProfileParser";
import type { AgentVesselData } from "@/components/profile/AgentVesselCard";
import { parseAgentVessel } from "@/components/profile/agentVesselParser";
import type { DietaryPreferencesData, NatalPlacement, TasteGraphData } from "@/components/profile/blocks/types";
import {
  parseBalances,
  parseDietaryPreferences,
  parseNatalPositions,
  parseProfileLayout,
  parseRecentActivity,
  parseSocial,
  parseTasteGraph,
  type ProfileActivityRow,
  type ProfileBalances,
} from "@/components/profile/profileSectionsParser";
import { unmodeledEntries } from "@/components/profile/unmodeledKeys";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import type { AgentAction, AgentArtifact, AgentInteraction } from "@/lib/agents/fetchAgentProfile";
import { isJsonRecord } from "@/lib/api/json";
import type { ProfileSocialBlock } from "@/types/social";

export interface PublicProfile {
  userId: string;
  handle: string | null;
  name: string;
  isAgent: boolean;
  agentSlug: string | null;
  agentProfile: CraftedAgentProfile | null;
  vessel?: AgentVesselData;
  agentInteractions: AgentInteraction[];
  agentActions: AgentAction[];
  agentArtifacts: AgentArtifact[];
  bio: string | null;
  dominantElement: string | null;
  avatarUrl: string | null;
  social: ProfileSocialBlock;
  /** Owner-only: the "post anonymously by default" toggle state. */
  shareIdentity?: boolean;
  natalPositions: NatalPlacement[];
  createdAt: string;
  balances: ProfileBalances;
  recentActivity: ProfileActivityRow[];
  dietary_preferences?: DietaryPreferencesData;
  profile_layout?: string[];
  tasteGraph?: TasteGraphData;
}

export type PublicProfileResponse =
  | { kind: "profile"; profile: PublicProfile; issues: string[] }
  | { kind: "refused"; message: string | null };

/** Every key of PublicProfile: adding a field without listing it here fails the compiler. */
const MODELED: Record<keyof PublicProfile, true> = {
  userId: true, handle: true, name: true, isAgent: true, agentSlug: true, agentProfile: true, vessel: true,
  agentInteractions: true, agentActions: true, agentArtifacts: true, bio: true, dominantElement: true,
  avatarUrl: true, social: true, shareIdentity: true, natalPositions: true, createdAt: true, balances: true,
  recentActivity: true, dietary_preferences: true, profile_layout: true, tasteGraph: true,
};
const MODELED_KEYS = Object.keys(MODELED);

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string") throw new TypeError(`Public profile response had no ${field} string`);
  return value;
}

/** A nullable string the producer always sends; absent is treated as null, a wrong type is reported. */
function nullableText(value: unknown, path: string, issues: string[]): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  issues.push(`${path}: not a string, set to null`);
  return null;
}

/** `users.created_at` is nullable in the schema; the identity panel treats an unparsable date as "no year". */
function createdAtLabel(value: unknown, issues: string[]): string {
  if (typeof value === "string") return value;
  issues.push("createdAt: missing or not a string, set to empty");
  return "";
}

function parseIdentity(profile: Record<string, unknown>): { userId: string; name: string; isAgent: boolean } {
  const { isAgent } = profile;
  if (typeof isAgent !== "boolean") throw new TypeError("Public profile response had no isAgent boolean");
  return {
    userId: requireText(profile.userId, "userId"),
    name: requireText(profile.name, "name"),
    isAgent,
  };
}

function parseProfile(profile: Record<string, unknown>): { profile: PublicProfile; issues: string[] } {
  const issues: string[] = [];
  const identity = parseIdentity(profile);
  const balances = parseBalances(profile.balances);
  if (balances === null) throw new TypeError("Public profile response had no valid balances");
  const vessel = parseAgentVessel(profile.vessel, issues);
  const tasteGraph = parseTasteGraph(profile.tasteGraph, issues);
  const dietary = parseDietaryPreferences(profile.dietary_preferences, issues);
  const layout = parseProfileLayout(profile.profile_layout, issues);
  const { shareIdentity } = profile;
  if (shareIdentity !== undefined && typeof shareIdentity !== "boolean") issues.push("shareIdentity: not a boolean, dropped");
  return {
    issues,
    profile: {
      ...unmodeledEntries(profile, MODELED_KEYS),
      ...identity,
      handle: nullableText(profile.handle, "handle", issues),
      agentSlug: nullableText(profile.agentSlug, "agentSlug", issues),
      agentProfile: parseCraftedAgentProfile(profile.agentProfile, issues),
      agentInteractions: parseAgentInteractions(profile.agentInteractions, issues),
      agentActions: parseAgentActions(profile.agentActions, issues),
      agentArtifacts: parseAgentArtifacts(profile.agentArtifacts, issues),
      bio: nullableText(profile.bio, "bio", issues),
      dominantElement: nullableText(profile.dominantElement, "dominantElement", issues),
      avatarUrl: nullableText(profile.avatarUrl, "avatarUrl", issues),
      createdAt: createdAtLabel(profile.createdAt, issues),
      social: parseSocial(profile.social, issues),
      natalPositions: parseNatalPositions(profile.natalPositions, issues),
      balances,
      recentActivity: parseRecentActivity(profile.recentActivity, issues),
      ...(vessel !== null ? { vessel } : {}),
      ...(typeof shareIdentity === "boolean" ? { shareIdentity } : {}),
      ...(dietary !== null ? { dietary_preferences: dietary } : {}),
      ...(layout !== null ? { profile_layout: layout } : {}),
      ...(tasteGraph !== null ? { tasteGraph } : {}),
    },
  };
}

/**
 * `parse` for `readJson`. A refusal (`success` not true, or no profile object) is
 * an ordinary answer carrying the producer's message; a body that is not even an
 * object throws into the page's catch ("Network error"). The old page read
 * `data.success` off whatever arrived, so only a JSON `null` reached that catch;
 * an array, number or string answered "Profile unavailable".
 */
export function parsePublicProfileResponse(value: unknown): PublicProfileResponse {
  if (!isJsonRecord(value)) throw new TypeError("Public profile response was not a JSON object");
  const { success, message, profile } = value;
  if (success !== true || !isJsonRecord(profile)) {
    return { kind: "refused", message: typeof message === "string" ? message : null };
  }
  return { kind: "profile", ...parseProfile(profile) };
}
