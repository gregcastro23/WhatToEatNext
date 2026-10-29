/**
 * scripts/sync-agentic-users.ts
 *
 * Provision and synchronize Canonical Historical Agents as 'Agentic Users'
 * in the WhatToEatNext (alchm.kitchen) PostgreSQL database.
 *
 * Ensures all ~71 historical figures (Leonardo da Vinci, Socrates, Aristotle,
 * Carl Jung, Cleopatra, Hildegard von Bingen, Isaac Newton, Paracelsus, etc.)
 * have:
 *   - users: email = <slug>@agentic.alchm.kitchen, is_agent = true, role = USER, is_active = true
 *   - user_profiles: name, bio, dominant_element, historical_diet (in dietary_preferences),
 *                    birth_data, natal_chart, natal_positions
 *   - token_balances: initialized with active ESMS essence balances
 *   - user_streaks: initialized tracking streaks
 *
 * Usage:
 *   bun run scripts/sync-agentic-users.ts
 */

import crypto from "crypto";
import { executeQuery, closeDatabase } from "../src/lib/database/connection";
import { _logger } from "../src/lib/logger";
import { fullChartMonica } from "../src/utils/fullChartMonica";
import { AGENT_ESMS_SEED_SQL } from "./lib/agentEsmsSeed";

export const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

/**
 * Non-NPC founder/human persona slugs present in `/api/agents` (`HISTORICAL_AGENTS`)
 * that are excluded from the 71 canonical historical NPC roster (`CANONICAL_ROSTER_71`)
 * unless explicitly requested via `--slug` or `--include-non-npc`.
 */
export const NON_NPC_HISTORICAL_SLUGS = new Set(["greg-castro-1991"]);

export interface SyncCliOptions {
  dryRun: boolean;
  onlyMissing: boolean;
  includeNonNpc: boolean;
  slugFilter: Set<string> | null;
}

export function parseSyncCliArgs(argv: readonly string[]): SyncCliOptions {
  let dryRun = false;
  let onlyMissing = false;
  let includeNonNpc = false;
  const slugs: string[] = [];

  for (const arg of argv) {
    if (arg === "--dry-run" || arg === "-n") {
      dryRun = true;
    } else if (arg === "--only-missing") {
      onlyMissing = true;
    } else if (arg === "--include-non-npc") {
      includeNonNpc = true;
    } else if (arg.startsWith("--slug=")) {
      const raw = arg.slice("--slug=".length);
      for (const part of raw.split(",")) {
        const trimmed = part.trim().toLowerCase();
        if (trimmed) slugs.push(trimmed);
      }
    }
  }

  return {
    dryRun,
    onlyMissing,
    includeNonNpc,
    slugFilter: slugs.length > 0 ? new Set(slugs) : null,
  };
}

export function isCanonicalHistoricalNpcSlug(
  slug: string,
  options?: Pick<SyncCliOptions, "includeNonNpc" | "slugFilter">,
): boolean {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return false;
  if (options?.slugFilter && !options.slugFilter.has(normalized)) {
    return false;
  }
  if (
    NON_NPC_HISTORICAL_SLUGS.has(normalized) &&
    !options?.includeNonNpc &&
    !options?.slugFilter?.has(normalized)
  ) {
    return false;
  }
  return true;
}

const AGENTS_UI_URL =
  process.env.NEXT_PUBLIC_AGENTS_UI_URL ||
  process.env.AGENTS_UI_URL ||
  "https://agents.alchm.kitchen";

interface RawBirthLocation {
  lat?: number;
  lon?: number;
  name?: string;
}

interface RawBirthData {
  date?: string;
  time?: string;
  location?: RawBirthLocation | string;
}

interface RawEsmsElements {
  Spirit?: number;
  Essence?: number;
  Matter?: number;
  Substance?: number;
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
}

interface RawConsciousness {
  natalChart?: unknown;
  dominantElement?: string;
  level?: string;
  alchemicalElements?: RawEsmsElements;
}

interface RawDiet {
  staples?: string[];
  favoriteFoods?: string[];
  avoidedFoods?: string[];
  dietaryPhilosophy?: string;
  culturalCuisine?: string;
  beverages?: string[];
  foodLore?: string;
}

interface RawPersonality {
  core?: {
    essence?: string;
  };
}

interface RawAlchemicalState {
  metadata?: {
    dominantElement?: string;
  };
  esms?: RawEsmsElements;
}

interface RawAgent {
  id: string;
  agentId?: string;
  name: string;
  title?: string;
  era?: string;
  historicalEra?: string;
  specialization?: string;
  birthData?: RawBirthData;
  consciousness?: RawConsciousness;
  personality?: RawPersonality;
  abilities?: unknown;
  historicalDiet?: RawDiet;
  alchemicalState?: RawAlchemicalState;
  contextBlueprint?: unknown;
}

interface DietProfileResponse {
  success?: boolean;
  profiles?: Array<{
    agentId: string;
    name: string;
    title?: string;
    era?: string;
    birthData?: RawBirthData;
    historicalDiet?: RawDiet;
    alchemicalState?: RawAlchemicalState;
    contextBlueprint?: unknown;
  }>;
}

interface AgentsListResponse {
  success?: boolean;
  agents?: RawAgent[];
}

export function derivePositionsFromChart(
  chart: unknown,
): Array<{ planet: string; sign: string; degree: number }> {
  if (!chart || typeof chart !== "object") return [];
  const chartObj = chart as { planets?: Record<string, unknown> };
  if (!chartObj.planets || typeof chartObj.planets !== "object") return [];
  const positions: Array<{ planet: string; sign: string; degree: number }> = [];
  for (const [planet, data] of Object.entries(chartObj.planets)) {
    if (data && typeof data === "object") {
      const p = data as { sign?: string; degree?: number };
      if (typeof p.sign === "string") {
        positions.push({
          planet,
          sign: p.sign,
          degree: typeof p.degree === "number" ? Math.round(p.degree) : 0,
        });
      }
    }
  }
  return positions;
}

async function main(): Promise<void> {
  const cli = parseSyncCliArgs(process.argv.slice(2));
  console.log(
    `[sync-agentic-users] Connecting to ASOL UI: ${AGENTS_UI_URL} (mode=${cli.dryRun ? "DRY-RUN" : "APPLY"}${cli.onlyMissing ? ", onlyMissing=true" : ""}${cli.slugFilter ? `, slugs=${[...cli.slugFilter].join(",")}` : ""})`,
  );

  // 1. Fetch agents roster and diet profiles
  const [agentsRes, dietsRes] = await Promise.all([
    fetch(`${AGENTS_UI_URL}/api/agents`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    }).catch((err) => {
      console.warn("Failed to fetch /api/agents:", err);
      return null;
    }),
    fetch(`${AGENTS_UI_URL}/api/agents/diet-profiles`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    }).catch((err) => {
      console.warn("Failed to fetch /api/agents/diet-profiles:", err);
      return null;
    }),
  ]);

  let agentList: RawAgent[] = [];
  if (agentsRes && agentsRes.ok) {
    const data = (await agentsRes.json()) as AgentsListResponse;
    agentList = Array.isArray(data.agents) ? data.agents : [];
  }

  const dietMap = new Map<string, NonNullable<DietProfileResponse["profiles"]>[number]>();
  if (dietsRes && dietsRes.ok) {
    const data = (await dietsRes.json()) as DietProfileResponse;
    if (Array.isArray(data.profiles)) {
      for (const p of data.profiles) {
        dietMap.set(p.agentId, p);
      }
    }
  }

  console.log(`[sync-agentic-users] Retrieved ${agentList.length} canonical agents, ${dietMap.size} diet profiles.`);

  // If agentList is empty (network fallback), query existing agents from database
  if (agentList.length === 0) {
    console.warn(`[sync-agentic-users] Remote agents list unavailable. Querying existing agents from DB...`);
    const existingAgents = await executeQuery<{ email: string; name: string }>(
      `SELECT email, name FROM users WHERE is_agent = true AND email LIKE '%@agentic.alchm.kitchen'`
    );
    agentList = existingAgents.rows.map((row) => ({
      id: row.email.replace("@agentic.alchm.kitchen", ""),
      name: row.name || "Historical Agent",
    }));
  }

  let matchedCount = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedExistingCount = 0;
  let seededLedgerCount = 0;
  let preservedLedgerCount = 0;
  let errorCount = 0;

  for (const raw of agentList) {
    const slug = (raw.id || raw.agentId || "").toLowerCase().trim();
    if (!isCanonicalHistoricalNpcSlug(slug, cli)) continue;
    matchedCount++;

    const email = `${slug}${AGENTIC_EMAIL_DOMAIN}`;
    const dietProfile = dietMap.get(slug);

    // If historicalDiet is missing, attempt to fetch individual agent profile
    let agentData = raw;
    if (!agentData.historicalDiet && !dietProfile?.historicalDiet) {
      try {
        const indRes = await fetch(`${AGENTS_UI_URL}/api/agents/${slug}`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        });
        if (indRes.ok) {
          const indJson = await indRes.json();
          agentData = indJson.agent || indJson || agentData;
        }
      } catch {
        /* fallback to existing data */
      }
    }

    const name = agentData.name || dietProfile?.name || slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const title = agentData.title || dietProfile?.title || "Historical Alchemist";
    const era = agentData.era || agentData.historicalEra || dietProfile?.era || "Historical Era";
    const bio =
      agentData.personality?.core?.essence ||
      (title ? `${title} (${era})` : "Historical Alchemical Intelligence");
    const dominantElement =
      agentData.consciousness?.dominantElement ||
      dietProfile?.alchemicalState?.metadata?.dominantElement ||
      "Spirit";

    const historicalDiet =
      agentData.historicalDiet ||
      dietProfile?.historicalDiet || {
        staples: ["Ancient grains", "Fresh herbs", "Pure spring water"],
        favoriteFoods: ["Seasonal vegetables", "Alchemical tisanes"],
        avoidedFoods: ["Processed ingredients"],
        dietaryPhilosophy: "Harmony with natural elements and moderation.",
        culturalCuisine: "Historical Classical",
      };

    const birthData = agentData.birthData || dietProfile?.birthData || null;
    const natalChart = agentData.consciousness?.natalChart || null;
    const derivedPositions = derivePositionsFromChart(natalChart);
    const fullChart = derivedPositions.length > 0 ? fullChartMonica(derivedPositions) : null;
    const monicaDiurnal = fullChart ? Number(fullChart.diurnal.toFixed(6)) : null;
    const monicaNocturnal = fullChart ? Number(fullChart.nocturnal.toFixed(6)) : null;
    const monicaFullChart =
      monicaDiurnal !== null && monicaNocturnal !== null
        ? Number(((monicaDiurnal + monicaNocturnal) / 2).toFixed(6))
        : null;
    const monicaMethod = monicaFullChart !== null ? "full-chart" : null;

    // Live ESMS Essence balances calculation
    const esmsSource =
      dietProfile?.alchemicalState?.esms ||
      agentData.consciousness?.alchemicalElements ||
      {};
    const spirit = Number(esmsSource.Spirit ?? esmsSource.spirit ?? 5.5).toFixed(4);
    const essence = Number(esmsSource.Essence ?? esmsSource.essence ?? 4.8).toFixed(4);
    const matter = Number(esmsSource.Matter ?? esmsSource.matter ?? 3.9).toFixed(4);
    const substance = Number(esmsSource.Substance ?? esmsSource.substance ?? 3.4).toFixed(4);

    const preferences = {
      dietaryRestrictions: [],
      preferredCuisines: [historicalDiet.culturalCuisine].filter(Boolean),
      spicePreference: "medium",
      complexity: "moderate",
      dislikedIngredients: historicalDiet.avoidedFoods || [],
    };

    const userProfilePayload = {
      name,
      title,
      era,
      bio,
      historicalDiet,
      alchemicalState: dietProfile?.alchemicalState || agentData.alchemicalState || null,
      contextBlueprint: dietProfile?.contextBlueprint || agentData.contextBlueprint || null,
      natalChart: {
        birthData,
        chart: natalChart,
      },
    };

    try {
      for (const amount of [spirit, essence, matter, substance]) {
        if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
          throw new Error("Agent ESMS seed quantities must be finite and nonnegative.");
        }
      }

      // 1. Inspect existing user by canonical agentic email
      const userRes = await executeQuery<{ id: string; is_agent: boolean }>(
        "SELECT id, is_agent FROM users WHERE LOWER(email) = LOWER($1)",
        [email]
      );

      if (userRes.rows.length > 0 && !userRes.rows[0]!.is_agent) {
        throw new Error(
          `Refusing to merge or overwrite non-agent human account ${email} (id=${userRes.rows[0]!.id}).`,
        );
      }

      const existingUserId = userRes.rows[0]?.id ?? null;
      let hasExistingBalance = false;
      let hasExistingLedger = false;

      if (existingUserId) {
        const ledgerCheck = await executeQuery<{
          has_balance: boolean;
          has_ledger: boolean;
        }>(
          `SELECT
             EXISTS (SELECT 1 FROM token_balances WHERE user_id = $1) AS has_balance,
             EXISTS (SELECT 1 FROM token_transactions WHERE user_id = $1) AS has_ledger`,
          [existingUserId],
        );
        hasExistingBalance = Boolean(ledgerCheck.rows[0]?.has_balance);
        hasExistingLedger = Boolean(ledgerCheck.rows[0]?.has_ledger);
      }

      if (existingUserId && cli.onlyMissing && hasExistingBalance) {
        skippedExistingCount++;
        preservedLedgerCount++;
        continue;
      }

      if (cli.dryRun) {
        if (!existingUserId) {
          insertedCount++;
          seededLedgerCount++;
          console.log(
            `[DRY-RUN] WOULD INSERT ${name} (${slug}) -> ${email} | Seed ESMS: ${spirit}/${essence}/${matter}/${substance} | Element: ${dominantElement}`,
          );
        } else {
          updatedCount++;
          if (!hasExistingBalance && !hasExistingLedger) {
            seededLedgerCount++;
            console.log(
              `[DRY-RUN] WOULD UPDATE ${name} (${slug}) -> ${email} (id=${existingUserId}) | Seed missing ESMS: ${spirit}/${essence}/${matter}/${substance}`,
            );
          } else {
            preservedLedgerCount++;
          }
        }
        continue;
      }

      let userId = "";
      if (!existingUserId) {
        userId = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO users (
             id, email, password_hash, role, is_active, is_agent, email_verified,
             name, profile, preferences, login_count, created_at, updated_at
           ) VALUES (
             $1, $2, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true,
             $3, $4::jsonb, $5::jsonb, 0, now(), now()
           )`,
          [
            userId,
            email,
            name,
            JSON.stringify(userProfilePayload),
            JSON.stringify(preferences),
          ]
        );
        insertedCount++;
      } else {
        userId = existingUserId;
        await executeQuery(
          `UPDATE users
              SET name = $1,
                  is_agent = true,
                  role = 'USER'::user_role,
                  is_active = true,
                  email_verified = true,
                  profile = COALESCE(profile, '{}'::jsonb) || $2::jsonb,
                  preferences = $3::jsonb,
                  updated_at = now()
            WHERE id = $4 AND is_agent = true`,
          [
            name,
            JSON.stringify(userProfilePayload),
            JSON.stringify(preferences),
            userId,
          ]
        );
        updatedCount++;
      }

      // 2. Upsert user_profiles table
      await executeQuery(
        `INSERT INTO user_profiles (
           user_id, name, bio, birth_data, natal_chart, natal_positions,
           monica_full_chart, monica_diurnal, monica_nocturnal, monica_method,
           dominant_element, dietary_preferences, updated_at
         ) VALUES (
           $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb,
           $7::numeric, $8::numeric, $9::numeric, $10,
           $11, $12::jsonb, now()
         )
         ON CONFLICT (user_id) DO UPDATE SET
           name = COALESCE(EXCLUDED.name, user_profiles.name),
           bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
           dominant_element = COALESCE(EXCLUDED.dominant_element, user_profiles.dominant_element),
           birth_data = COALESCE(EXCLUDED.birth_data, user_profiles.birth_data),
           natal_chart = COALESCE(EXCLUDED.natal_chart, user_profiles.natal_chart),
           natal_positions = CASE 
             WHEN user_profiles.natal_positions IS NOT NULL AND user_profiles.natal_positions::text NOT IN ('[]', 'null', '{}') 
             THEN user_profiles.natal_positions 
             ELSE EXCLUDED.natal_positions 
           END,
           monica_full_chart = CASE
             WHEN user_profiles.monica_method IS NOT NULL THEN user_profiles.monica_full_chart
             ELSE EXCLUDED.monica_full_chart
           END,
           monica_diurnal = CASE
             WHEN user_profiles.monica_method IS NOT NULL THEN user_profiles.monica_diurnal
             ELSE EXCLUDED.monica_diurnal
           END,
           monica_nocturnal = CASE
             WHEN user_profiles.monica_method IS NOT NULL THEN user_profiles.monica_nocturnal
             ELSE EXCLUDED.monica_nocturnal
           END,
           monica_method = COALESCE(user_profiles.monica_method, EXCLUDED.monica_method),
           dietary_preferences = EXCLUDED.dietary_preferences,
           updated_at = now()`,
        [
          userId,
          name,
          bio,
          birthData ? JSON.stringify(birthData) : null,
          natalChart ? JSON.stringify(natalChart) : null,
          derivedPositions.length > 0 ? JSON.stringify(derivedPositions) : null,
          monicaFullChart,
          monicaDiurnal,
          monicaNocturnal,
          monicaMethod,
          dominantElement,
          JSON.stringify(historicalDiet),
        ]
      );

      // 3. Seed the ESMS balance and all ledger credits atomically.
      const seedResult = await executeQuery<{
        credited_axes: number;
        ledger_without_balance: boolean;
        invalid_quantities: boolean;
      }>(
        AGENT_ESMS_SEED_SQL,
        [userId, spirit, essence, matter, substance],
      );
      if (seedResult.rows[0]?.ledger_without_balance) {
        throw new Error(`Agent ${userId} has ledger entries without a balance; repair that drift before seeding.`);
      }
      if (seedResult.rows[0]?.invalid_quantities) {
        throw new Error("Agent ESMS seed quantities must be finite and nonnegative.");
      }
      if ((seedResult.rows[0]?.credited_axes ?? 0) > 0) {
        seededLedgerCount++;
      } else {
        preservedLedgerCount++;
      }

      // 4. Upsert user_streaks
      await executeQuery(
        `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, updated_at)
         VALUES ($1, 1, 1, now(), now())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      console.log(`✓ [Synced] ${name} (${slug}) -> ${email} | Element: ${dominantElement}`);
    } catch (err) {
      console.error(`✗ Error syncing agent ${slug}:`, err);
      errorCount++;
    }
  }

  console.log(
    `\n[sync-agentic-users] ${cli.dryRun ? "Dry-run summary" : "Complete"}! Matched: ${matchedCount}, Inserted: ${insertedCount}, Updated: ${updatedCount}, SkippedExisting: ${skippedExistingCount}, SeededLedger: ${seededLedgerCount}, PreservedLedger: ${preservedLedgerCount}, Errors: ${errorCount}`
  );
}

if (process.argv[1]?.includes("sync-agentic-users")) {
  main()
    .catch((err) => {
      console.error("Fatal sync error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await closeDatabase();
    });
}
