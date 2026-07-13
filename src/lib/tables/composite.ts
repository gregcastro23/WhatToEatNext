/**
 * Table composite bridge (docs/plans/pr2-table-entity-plan.md §4). Server-only.
 *
 * Resolves a table's JOINED members to full natal charts, computes the
 * composite bundle (composite chart + cuisine recs + cooking-method recs +
 * top recipes), and persists it to `tables.composite_snapshot`.
 *
 * Every call site — RSVP-to-joined, joined-member removal, manual-companion
 * attach, and the host recompute endpoint — awaits this in-request. It is
 * intentionally failure-tolerant: nothing here ever throws past its own
 * boundary, so a chart-resolution or recommendation-scoring hiccup can never
 * block the RSVP/removal/attach it was triggered from. A prior snapshot is
 * left in place on failure; staleness is visible via
 * `tables.composite_updated_at`.
 *
 * `computeCompositeBundle` is factored out on purpose: it is the exact same
 * math `/api/commensal/guest-recommendations` already does inline (composite
 * chart -> cuisine recs -> cooking-method recs). That route is NOT rewired to
 * use it in this PR, but nothing here is Tables-specific, so it could be.
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { EnhancedRecommendationService } from "@/services/EnhancedRecommendationService";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import type { ElementalProperties as AlchemyElementalProperties } from "@/types/alchemy";
import type {
  BirthData,
  CompositeNatalChart,
  GroupMember,
  NatalChart,
} from "@/types/natalChart";
import type {
  CompositeCookingMethod,
  CompositeCuisineRec,
  CompositeRecipeRec,
  CompositeSnapshot,
} from "@/types/table";
import { getCuisineRecommendations } from "@/utils/cuisineRecommender";
import { getRecommendedCookingMethods } from "@/utils/recommendation/methodRecommendation";
import { safeJsonParse } from "@/utils/typeGuards";

/** First N chart-bearing joined members (by rsvp_at) enter the composite;
 * the rest are dropped with `truncated: true` (party size caps at 24 via
 * table_members, composite caps at 12 — plan doc §8 risk 2). */
const MAX_COMPOSITE_MEMBERS = 12;

/** Skip recompute when the last snapshot is fresher than this — protects
 * against RSVP-burst thrash while staying well under any human-perceptible
 * staleness (plan doc §8 risk 4). The host recompute endpoint bypasses this
 * via `{ force: true }`. */
const DEBOUNCE_MS = 30_000;

function readJsonColumn<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") return safeJsonParse<T>(value, fallback) ?? fallback;
  return (value as T) ?? fallback;
}

function isCompleteBirthData(value: unknown): value is BirthData {
  if (!value || typeof value !== "object") return false;
  const b = value as Partial<BirthData>;
  return (
    typeof b.dateTime === "string" &&
    b.dateTime.length > 0 &&
    typeof b.latitude === "number" &&
    Number.isFinite(b.latitude) &&
    typeof b.longitude === "number" &&
    Number.isFinite(b.longitude)
  );
}

/**
 * Mirrors `isUsableNatalChart` in
 * src/app/api/commensal/guest-recommendations/route.ts — a chart is only
 * usable for compositing when it carries the exact fields
 * `calculateCompositeNatalChart` (src/services/groupNatalChartService.ts)
 * reads: `elementalBalance`, `alchemicalProperties`, `dominantElement`,
 * `dominantModality`.
 */
function isUsableNatalChart(value: unknown): value is NatalChart {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<NatalChart>;
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  const alchemical = ["Spirit", "Essence", "Matter", "Substance"] as const;
  return (
    typeof c.dominantElement === "string" &&
    (elements as readonly string[]).includes(c.dominantElement) &&
    typeof c.dominantModality === "string" &&
    ["Cardinal", "Fixed", "Mutable"].includes(c.dominantModality) &&
    !!c.elementalBalance &&
    elements.every((key) => Number.isFinite(c.elementalBalance?.[key])) &&
    !!c.alchemicalProperties &&
    alchemical.every((key) => Number.isFinite(c.alchemicalProperties?.[key]))
  );
}

function buildMemberFromColumns(
  memberId: string,
  natalChartRaw: unknown,
  birthDataRaw: unknown,
  name: unknown,
): GroupMember | null {
  const natalChart = readJsonColumn<Partial<NatalChart> | null>(natalChartRaw, null);
  const birthData = readJsonColumn<Partial<BirthData> | null>(birthDataRaw, null);
  if (!isUsableNatalChart(natalChart) || !isCompleteBirthData(birthData)) return null;
  return {
    id: memberId,
    name: typeof name === "string" && name.trim() ? name.trim() : "A guest",
    relationship: "friend",
    birthData,
    natalChart,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Resolve a registered user's full natal chart via the PR 1-fixed sequential
 * fallback chain — each step isolated in its own try/catch so a failure
 * (e.g. schema drift) in one source can never mask the next:
 *   1. `user_profiles.natal_chart` / `birth_data` columns — the canonical
 *      write target (`userDatabaseService.updateUserProfile` dual-writes
 *      here).
 *   2. `users.profile` JSONB `natalChart`/`birthData` — legacy write path;
 *      heals users whose chart only ever landed in the profile blob.
 *   3. Give up -> null.
 *
 * `is_agent` users (historical/planetary agents) resolve identically — the
 * agent-sync endpoint (src/app/api/internal/agent-sync/route.ts) dual-writes
 * into the same columns as human onboarding, so no agent-specific branch is
 * needed here (owner directive: agents participate via `table_members.user_id`
 * exactly like humans).
 */
export async function loadUserChartMember(userId: string): Promise<GroupMember | null> {
  // 1. Canonical: user_profiles structured columns.
  try {
    const result = await executeQuery(
      `SELECT natal_chart, birth_data, name FROM user_profiles WHERE user_id = $1::uuid`,
      [userId],
    );
    if (result.rows.length > 0) {
      const member = buildMemberFromColumns(
        userId,
        result.rows[0].natal_chart,
        result.rows[0].birth_data,
        result.rows[0].name,
      );
      if (member) return member;
    }
  } catch (error) {
    _logger.warn(
      "loadUserChartMember: user_profiles read failed, falling back to users.profile JSONB:",
      error,
    );
  }

  // 2. Legacy: users.profile JSONB.
  try {
    const result = await executeQuery(
      `SELECT profile, name FROM users WHERE id = $1::uuid`,
      [userId],
    );
    if (result.rows.length > 0) {
      const profile = readJsonColumn<Record<string, unknown>>(result.rows[0].profile, {});
      const natalChart = profile?.natalChart ?? profile?.natal_chart;
      const birthData = profile?.birthData ?? profile?.birth_data;
      const member = buildMemberFromColumns(userId, natalChart, birthData, result.rows[0].name);
      if (member) return member;
    }
  } catch (error) {
    _logger.warn("loadUserChartMember: users.profile JSONB fallback failed:", error);
  }

  // 3. Nothing usable on file.
  _logger.warn(`loadUserChartMember: no usable natal chart found for user ${userId}`);
  return null;
}

/**
 * Pure composite math shared by Tables and (potentially) guest-recommendations:
 * composite chart -> cuisine recs -> cooking-method recs. No I/O.
 */
export function computeCompositeBundle(members: GroupMember[]): {
  compositeChart: CompositeNatalChart;
  cuisineRecs: CompositeCuisineRec[];
  cookingMethods: CompositeCookingMethod[];
} {
  const compositeChart = calculateCompositeNatalChart(members, "table-composite");

  // Reconstruct the elemental balance into the alchemy.ts shape (celestial.ts
  // and alchemy.ts are structurally identical for the four base elements) so
  // it satisfies the recommender signatures without a cast on the composite.
  const elementalForCuisines: AlchemyElementalProperties = {
    Fire: compositeChart.elementalBalance.Fire,
    Water: compositeChart.elementalBalance.Water,
    Earth: compositeChart.elementalBalance.Earth,
    Air: compositeChart.elementalBalance.Air,
  };

  const cuisineRecs = getCuisineRecommendations(
    elementalForCuisines,
  ) as unknown as CompositeCuisineRec[];

  const rawMethods = getRecommendedCookingMethods(elementalForCuisines);
  const cookingMethods: CompositeCookingMethod[] = rawMethods.slice(0, 5).map((m) => ({
    method: m.name,
    score: Math.max(0, Math.min(1, m.score)),
    reasons: m.reasons,
  }));

  return { compositeChart, cuisineRecs, cookingMethods };
}

interface TableMemberChartRow {
  user_id?: string | null;
  manual_companion_chart_id?: string | null;
  manual_name?: string | null;
  manual_birth_data?: unknown;
  manual_natal_chart?: unknown;
}

async function resolveJoinedMembers(tableId: string): Promise<GroupMember[]> {
  const membersResult = await executeQuery<TableMemberChartRow>(
    `SELECT tm.user_id, tm.manual_companion_chart_id,
            mcc.name AS manual_name, mcc.birth_data AS manual_birth_data,
            mcc.natal_chart AS manual_natal_chart
       FROM table_members tm
       LEFT JOIN manual_companion_charts mcc ON tm.manual_companion_chart_id = mcc.id
      WHERE tm.table_id = $1 AND tm.rsvp_status = 'joined'
      ORDER BY tm.rsvp_at ASC NULLS LAST, tm.created_at ASC`,
    [tableId],
  );

  const resolved: GroupMember[] = [];
  for (const row of membersResult.rows) {
    if (row.user_id) {
      const member = await loadUserChartMember(String(row.user_id));
      if (member) resolved.push(member);
    } else if (row.manual_companion_chart_id) {
      const member = buildMemberFromColumns(
        String(row.manual_companion_chart_id),
        row.manual_natal_chart,
        row.manual_birth_data,
        row.manual_name,
      );
      if (member) resolved.push(member);
    }
  }
  return resolved;
}

/**
 * Compute and persist the composite snapshot for a table's currently JOINED
 * members. Never throws. Silently no-ops (leaving any prior snapshot intact)
 * when: the table has zero chart-bearing joined members, the debounce window
 * hasn't elapsed (unless `force`), or any step errors.
 */
export async function computeAndStoreTableComposite(
  tableId: string,
  options: { force?: boolean } = {},
): Promise<void> {
  try {
    if (!options.force) {
      const staleCheck = await executeQuery(
        `SELECT composite_updated_at FROM tables WHERE id = $1`,
        [tableId],
      );
      const lastComputed = staleCheck.rows[0]?.composite_updated_at;
      if (lastComputed) {
        const ageMs = Date.now() - new Date(lastComputed).getTime();
        if (ageMs >= 0 && ageMs < DEBOUNCE_MS) return;
      }
    }

    const resolved = await resolveJoinedMembers(tableId);
    if (resolved.length === 0) {
      _logger.debug(
        `computeAndStoreTableComposite: no chart-bearing joined members for table ${tableId} — skipping (never blocks the triggering action)`,
      );
      return;
    }

    const truncated = resolved.length > MAX_COMPOSITE_MEMBERS;
    const included = resolved.slice(0, MAX_COMPOSITE_MEMBERS);
    const bundle = computeCompositeBundle(included);

    let topRecipes: CompositeRecipeRec[] = [];
    try {
      const recipeResult = await EnhancedRecommendationService.getRecommendationsForComposite(
        bundle.compositeChart,
        5,
      );
      topRecipes = recipeResult.recommendations.map((r) => ({
        recipe: {
          id: (r.recipe as { id?: string })?.id,
          name: (r.recipe as { name?: string })?.name,
        },
        score: r.score,
        reason: r.reason,
      }));
    } catch (error) {
      _logger.warn(
        `computeAndStoreTableComposite: recipe scoring failed for table ${tableId}, persisting without topRecipes:`,
        error,
      );
    }

    const snapshot: CompositeSnapshot = {
      version: 1,
      computedAt: new Date().toISOString(),
      memberCount: included.length,
      includedMemberIds: included.map((m) => m.id),
      truncated,
      compositeChart: bundle.compositeChart,
      cookingMethods: bundle.cookingMethods,
      cuisineRecs: bundle.cuisineRecs,
      topRecipes,
    };

    await executeQuery(
      `UPDATE tables SET composite_snapshot = $2, composite_updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [tableId, JSON.stringify(snapshot)],
    );
  } catch (error) {
    _logger.error(
      `computeAndStoreTableComposite failed for table ${tableId} (keeping any prior snapshot):`,
      error,
    );
  }
}
