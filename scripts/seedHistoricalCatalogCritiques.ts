/**
 * scripts/seedHistoricalCatalogCritiques.ts
 *
 * Idempotently populates authentic catalog critiques (`recipe_review` with
 * `source: "catalog_critique"`, `contentState: "curated"`, no star rating or
 * `madeIt` claim) across all 71 canonical historical NPC agents, plus saved
 * vegetarian adaptations (`user_custom_recipes` + `recipe_adapted` feed events)
 * for historical vegetarian personas.
 *
 * Strictly enforces each agent's `dietary_preferences.avoidedFoods` and
 * `dietaryPhilosophy` through `verifyRecipeContent` and ingredient screening.
 *
 * Usage:
 *   bun scripts/seedHistoricalCatalogCritiques.ts --dry-run
 *   bun scripts/seedHistoricalCatalogCritiques.ts
 *   bun scripts/seedHistoricalCatalogCritiques.ts --slug=leonardo-da-vinci,socrates
 */

import { verifyRecipeContent } from "../src/lib/cooking/recipeVerificationGate";
import { executeQuery, closeDatabase } from "../src/lib/database/connection";
import { buildCatalogCritiqueText } from "../src/lib/recipes/historicalAgentCopy";
import {
  deriveAgentDietaryProfile,
  isRecipeCompliantForAgent,
  selectRecipesForAgent,
  type DietaryProfile,
} from "../src/lib/recipes/historicalAgentPersona";

export {
  buildCatalogCritiqueText,
  deriveAgentDietaryProfile,
  isRecipeCompliantForAgent,
  selectRecipesForAgent,
  type DietaryProfile,
};
import {
  contentHash,
  loadAdaptationAgent,
  type AdaptationAgentBasis,
} from "../src/lib/recipes/adaptationAgentBasis";
import {
  applyAdaptationProposal,
  prepareAdaptationSource,
  type PreparedAdaptationSource,
} from "../src/lib/recipes/adaptationCandidates";
import { editedChickenInstructions } from "../src/lib/recipes/adaptationInstructions";
import {
  adaptationVersionId,
  loadSavedAdaptation,
  publishSavedAdaptation,
  saveAdaptation,
} from "../src/lib/recipes/savedAdaptationPersistence";
import {
  SUPPORTED_ADAPTATION_AGENTS,
  SavedAdaptationSchema,
} from "../src/lib/recipes/savedAdaptationSchemas";
import { feedDatabase } from "../src/services/feedDatabaseService";
import { LocalRecipeService } from "../src/services/LocalRecipeService";
import type { Recipe } from "../src/types/recipe";

export interface SeedCritiquesCliOptions {
  dryRun: boolean;
  critiquesPerAgent: number;
  slugFilter: Set<string> | null;
}

export function parseSeedCritiquesArgs(
  argv: readonly string[],
): SeedCritiquesCliOptions {
  let dryRun = false;
  let critiquesPerAgent = 2;
  const slugs: string[] = [];

  for (const arg of argv) {
    if (arg === "--dry-run" || arg === "-n") {
      dryRun = true;
    } else if (arg.startsWith("--per-agent=")) {
      const parsed = Number.parseInt(arg.slice("--per-agent=".length), 10);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 5) {
        critiquesPerAgent = parsed;
      }
    } else if (arg.startsWith("--slug=")) {
      for (const part of arg.slice("--slug=".length).split(",")) {
        const trimmed = part.trim().toLowerCase();
        if (trimmed) slugs.push(trimmed);
      }
    }
  }

  return {
    dryRun,
    critiquesPerAgent,
    slugFilter: slugs.length > 0 ? new Set(slugs) : null,
  };
}

interface HistoricalAgentRow {
  id: string;
  email: string;
  name: string;
  dominant_element: string | null;
  dietary_preferences: Record<string, unknown> | null;
}

const VEGETARIAN_ADAPTATION_AGENTS: readonly string[] =
  SUPPORTED_ADAPTATION_AGENTS;

interface AdaptableCandidate {
  recipe: Recipe;
  source: PreparedAdaptationSource;
}

function findGatePassingAdaptableCandidates(
  catalog: readonly Recipe[],
  basis: AdaptationAgentBasis,
  profile: DietaryProfile,
): AdaptableCandidate[] {
  const candidates: AdaptableCandidate[] = [];
  for (const recipe of catalog) {
    try {
      const source = prepareAdaptationSource(recipe);
      const instructions = editedChickenInstructions(
        source.original.instructions,
        source.candidateSwaps,
      );
      const proposal = JSON.stringify({
        selectedSwapIndices: source.candidateSwaps.map((_, idx) => idx),
        instructions,
        usedPlacementIndices: [0],
        usedPreferenceKeys: ["dietaryPhilosophy"],
        explanation: "Vegetarian tofu substitution verification check.",
      });
      const edited = applyAdaptationProposal(proposal, source, basis);
      const editedAsRecipe: Recipe = {
        ...recipe,
        ingredients: edited.recipe.ingredients.map((i) => ({
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          ...(i.optional !== undefined ? { optional: i.optional } : {}),
        })),
        instructions: edited.recipe.instructions,
      };
      if (!isRecipeCompliantForAgent(editedAsRecipe, profile)) {
        continue;
      }
      const gate = verifyRecipeContent(
        {
          ingredients: edited.recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: String(i.amount),
            unit: i.unit,
            ...(i.optional !== undefined ? { optional: i.optional } : {}),
          })),
          steps: edited.recipe.instructions.map((instruction) => ({
            instruction,
          })),
        },
        {
          requestedDiet: "vegetarian",
          ...(basis.preferences.values.avoidedFoods
            ? { disallowedIngredients: basis.preferences.values.avoidedFoods }
            : {}),
        },
      );
      if (gate.valid) {
        candidates.push({ recipe, source });
      }
    } catch {
      // Recipe does not have a supported chicken-to-tofu swap
    }
  }
  return candidates;
}

async function seedSavedAdaptationForAgent(params: {
  slug: string;
  candidate: AdaptableCandidate;
  basis: AdaptationAgentBasis;
  dryRun: boolean;
}): Promise<{ status: "created" | "existing" | "dry-run"; versionId: string; recipeName: string }> {
  const { slug, candidate, basis, dryRun } = params;
  const { recipe, source } = candidate;
  const clientRequestId = adaptationVersionId(
    basis.actor.id,
    `canonical-seed-v1:${slug}:${recipe.id}`,
  );
  const versionId = adaptationVersionId(basis.actor.id, clientRequestId);
  const requestFingerprint = contentHash({
    recipeId: recipe.id,
    agentSlug: slug,
    mode: "vegetarian",
  });

  const existing = await loadSavedAdaptation(versionId);
  if (existing) {
    return { status: "existing", versionId, recipeName: existing.recipe.name };
  }

  const instructions = editedChickenInstructions(
    source.original.instructions,
    source.candidateSwaps,
  );
  const primaryPlacement = basis.chart.placements[0];
  const placementDesc = primaryPlacement
    ? `${primaryPlacement.planet} in ${primaryPlacement.sign}`
    : "saved natal chart";
  const explanation = `Guided by ${basis.actor.name}'s natal ${placementDesc} and vegetarian dietary philosophy, animal poultry is replaced with firm tofu while preserving the dish's aromatic structure.`;

  const proposalJson = JSON.stringify({
    selectedSwapIndices: source.candidateSwaps.map((_, idx) => idx),
    instructions,
    usedPlacementIndices: [0],
    usedPreferenceKeys: ["dietaryPhilosophy"],
    explanation,
  });

  const edited = applyAdaptationProposal(proposalJson, source, basis);
  const gate = verifyRecipeContent(
    {
      ingredients: edited.recipe.ingredients.map((i) => ({
        name: i.name,
        quantity: String(i.amount),
        unit: i.unit,
        ...(i.optional !== undefined ? { optional: i.optional } : {}),
      })),
      steps: edited.recipe.instructions.map((instruction) => ({ instruction })),
    },
    {
      requestedDiet: "vegetarian",
      ...(basis.preferences.values.avoidedFoods
        ? { disallowedIngredients: basis.preferences.values.avoidedFoods }
        : {}),
    },
  );

  const adaptedRecipe = {
    ...edited.recipe,
    name: `${source.original.name} — ${basis.actor.name}'s vegetarian version`,
  };

  const version = SavedAdaptationSchema.parse({
    kind: "saved-adaptation",
    schemaVersion: 1,
    id: versionId,
    requestFingerprint,
    recipe: adaptedRecipe,
    receipt: {
      mode: "vegetarian",
      original: {
        id: recipe.id,
        name: source.original.name,
        contentHash: source.originalHash,
      },
      actor: basis.actor,
      basis: {
        chart: basis.chart,
        preferences: basis.preferences,
        usedPlacementIndices: edited.usedPlacementIndices,
        usedPreferenceKeys: edited.usedPreferenceKeys,
      },
      changes: edited.changes,
      contentHash: contentHash(adaptedRecipe),
      explanation: edited.explanation,
      verification: {
        valid: true,
        verified: gate.verified,
        ...gate.audit,
        notChecked: gate.notChecked,
        advisoryFindings: gate.advisoryFindings,
      },
      readingsUnavailable: ["nutrition", "elemental", "esms", "planetary"],
    },
  });

  if (dryRun) {
    return { status: "dry-run", versionId, recipeName: version.recipe.name };
  }

  const saved = await saveAdaptation(version);
  if (saved.inserted) {
    await publishSavedAdaptation(saved.version);
  }
  return {
    status: saved.inserted ? "created" : "existing",
    versionId: saved.version.id,
    recipeName: saved.version.recipe.name,
  };
}

export async function runSeedHistoricalCatalogCritiques(
  options: SeedCritiquesCliOptions,
): Promise<void> {
  const agentsRes = await executeQuery<HistoricalAgentRow>(
    `SELECT u.id, u.email, COALESCE(up.name, u.name) AS name,
            up.dominant_element, up.dietary_preferences
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
      WHERE u.is_agent = true
        AND u.email LIKE '%@agentic.alchm.kitchen'
        AND u.email <> 'greg-castro-1991@agentic.alchm.kitchen'
        AND up.natal_positions IS NOT NULL
        AND up.natal_positions::text NOT IN ('[]', 'null', '{}')
      ORDER BY u.email ASC`,
  );

  const existingReviewsRes = await executeQuery<{
    actor_id: string;
    recipe_id: string;
  }>(
    `SELECT actor_id, COALESCE(metadata_payload->>'recipeId', metadata_payload->>'recipe_id') AS recipe_id
       FROM feed_events
      WHERE event_type = 'recipe_review'
        AND COALESCE(metadata_payload->>'source', '') IN ('catalog_critique', 'catalog_review')`,
  );

  const existingByAgent = new Map<string, Set<string>>();
  const usedCounts = new Map<string, number>();
  for (const row of existingReviewsRes.rows) {
    if (!row.recipe_id) continue;
    const set = existingByAgent.get(row.actor_id) ?? new Set<string>();
    set.add(row.recipe_id);
    existingByAgent.set(row.actor_id, set);
    usedCounts.set(row.recipe_id, (usedCounts.get(row.recipe_id) ?? 0) + 1);
  }

  const catalog = await LocalRecipeService.getAllRecipes();
  console.log(
    `[seed-critiques] Loaded ${catalog.length} catalog recipes and ${agentsRes.rows.length} historical NPC agents (dryRun=${options.dryRun}).`,
  );

  let createdCritiques = 0;
  let skippedCritiques = 0;

  for (const agent of agentsRes.rows) {
    const [rawSlug] = agent.email.split("@");
    const slug = (rawSlug ?? "").toLowerCase();
    if (!slug) continue;
    if (options.slugFilter && !options.slugFilter.has(slug)) continue;

    const existingSet = existingByAgent.get(agent.id) ?? new Set<string>();
    if (existingSet.size >= options.critiquesPerAgent) {
      skippedCritiques += existingSet.size;
      continue;
    }

    const profile = deriveAgentDietaryProfile(slug, agent.dietary_preferences);
    const needed = options.critiquesPerAgent - existingSet.size;
    const candidates = selectRecipesForAgent(
      slug,
      profile,
      catalog.filter((r) => !existingSet.has(r.id)),
      needed,
      usedCounts,
    );

    for (const recipe of candidates) {
      const reviewText = buildCatalogCritiqueText({
        agentSlug: slug,
        agentName: agent.name,
        dominantElement: agent.dominant_element,
        profile,
        recipe,
      });

      usedCounts.set(recipe.id, (usedCounts.get(recipe.id) ?? 0) + 1);

      if (options.dryRun) {
        console.log(
          `  [dry-run critique] ${slug} -> "${recipe.name}" (${recipe.id})`,
        );
        createdCritiques += 1;
        continue;
      }

      const pub = await feedDatabase.publishFeedEvent({
        actorId: agent.id,
        eventType: "recipe_review",
        deliveryId: `catalog-critique:${slug}:${recipe.id}`,
        skipWebhook: true,
        identity: { share: true, explicit: true },
        metadataPayload: {
          recipeId: recipe.id,
          recipeName: recipe.name,
          review: reviewText,
          source: "catalog_critique",
          agentSlug: slug,
          agentName: agent.name,
          dominantElement: agent.dominant_element ?? "Earth",
          contentState: "curated",
          mcpCatalog: true,
          skipEconomyCharge: true,
        },
      });

      if (pub.feedPublished) {
        createdCritiques += 1;
      }
    }
  }

  let createdAdaptations = 0;
  let existingAdaptations = 0;
  for (let i = 0; i < VEGETARIAN_ADAPTATION_AGENTS.length; i += 1) {
    const slug = VEGETARIAN_ADAPTATION_AGENTS[i];
    if (!slug) continue;
    if (options.slugFilter && !options.slugFilter.has(slug)) continue;

    const basis = await loadAdaptationAgent(slug);
    const profile = deriveAgentDietaryProfile(slug, basis.preferences.values);
    const adaptableCandidates = findGatePassingAdaptableCandidates(
      catalog,
      basis,
      profile,
    );
    if (adaptableCandidates.length === 0) continue;
    const chosen = adaptableCandidates[i % adaptableCandidates.length];
    if (!chosen) continue;

    const result = await seedSavedAdaptationForAgent({
      slug,
      candidate: chosen,
      basis,
      dryRun: options.dryRun,
    });
    if (result.status === "created" || result.status === "dry-run") {
      createdAdaptations += 1;
      console.log(
        `  [${result.status} adaptation] ${slug} -> "${result.recipeName}" (/recipes/versions/${result.versionId})`,
      );
    } else {
      existingAdaptations += 1;
    }
  }

  console.log(
    `[seed-critiques] Complete: critiques created=${createdCritiques}, skipped=${skippedCritiques}; adaptations created=${createdAdaptations}, existing=${existingAdaptations}.`,
  );
}

if (process.argv[1]?.includes("seedHistoricalCatalogCritiques")) {
  const cliOptions = parseSeedCritiquesArgs(process.argv.slice(2));
  runSeedHistoricalCatalogCritiques(cliOptions)
    .then(async () => {
      await closeDatabase();
    })
    .catch(async (err: unknown) => {
      console.error("[seed-critiques] Fatal error:", err);
      await closeDatabase();
      process.exit(1);
    });
}
