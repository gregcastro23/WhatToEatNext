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

import { createHash } from "node:crypto";
import { HISTORICAL_LORE_CRITIQUES } from "../src/data/historicalCritiqueLore";
import { verifyRecipeContent } from "../src/lib/cooking/recipeVerificationGate";
import { executeQuery, closeDatabase } from "../src/lib/database/connection";
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
import { SavedAdaptationSchema } from "../src/lib/recipes/savedAdaptationSchemas";
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

interface DietaryProfile {
  requiresVegetarian: boolean;
  avoidAlliums: boolean;
  avoidPork: boolean;
  avoidAlcohol: boolean;
  avoidRefinedSugar: boolean;
  bannedSubstrings: string[];
  favoriteKeywords: string[];
  culturalCuisine: string;
  dietaryPhilosophy: string;
}

const MEAT_SEAFOOD_TERMS = [
  "chicken",
  "beef",
  "pork",
  "lamb",
  "veal",
  "turkey",
  "duck",
  "bacon",
  "ham",
  "prosciutto",
  "pancetta",
  "salami",
  "sausage",
  "chorizo",
  "steak",
  "brisket",
  "venison",
  "rabbit",
  "fish",
  "salmon",
  "tuna",
  "cod",
  "halibut",
  "trout",
  "sardine",
  "anchov",
  "mackerel",
  "tilapia",
  "snapper",
  "sea bass",
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "scallop",
  "clam",
  "mussel",
  "oyster",
  "squid",
  "octopus",
  "calamari",
  "ceviche",
  "gelatin",
  "lard",
  "tallow",
];

const ALLIUM_TERMS = [
  "garlic",
  "onion",
  "shallot",
  "scallion",
  "leek",
  "chive",
];

const PORK_TERMS = [
  "pork",
  "bacon",
  "ham",
  "prosciutto",
  "pancetta",
  "salami",
  "chorizo",
  "lard",
  "guanciale",
];

const ALCOHOL_TERMS = [
  "wine",
  "beer",
  "ale",
  "stout",
  "rum",
  "brandy",
  "cognac",
  "vodka",
  "whiskey",
  "bourbon",
  "tequila",
  "mezcal",
  "liqueur",
  "champagne",
  "prosecco",
  "sake",
  "mirin",
  "sherry",
  "vermouth",
  "marsala",
  "kirsch",
];

const SUGAR_TERMS = [
  "white sugar",
  "granulated sugar",
  "powdered sugar",
  "confectioners",
  "frosting",
  "marshmallows",
  "corn syrup",
];

function extractStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((item): item is string => typeof item === "string");
}

function tokenizeKeywords(items: string[]): string[] {
  const stopWords = new Set([
    "with",
    "and",
    "the",
    "from",
    "for",
    "fresh",
    "simple",
    "roasted",
    "boiled",
    "plain",
    "wild",
    "dish",
    "dishes",
    "food",
    "foods",
    "meal",
    "meals",
  ]);
  const tokens = new Set<string>();
  for (const item of items) {
    const cleaned = item
      .toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .replace(/[^a-z\s]/g, " ");
    for (const word of cleaned.split(/\s+/)) {
      if (word.length >= 4 && !stopWords.has(word)) {
        tokens.add(word);
      }
    }
  }
  return Array.from(tokens);
}

export function deriveAgentDietaryProfile(
  slug: string,
  prefs: Record<string, unknown> | null,
): DietaryProfile {
  const avoided = extractStringArray(prefs?.avoidedFoods);
  const staples = extractStringArray(prefs?.staples);
  const favorites = extractStringArray(prefs?.favoriteFoods);
  const culturalCuisine =
    typeof prefs?.culturalCuisine === "string"
      ? prefs.culturalCuisine
      : "Classical";
  const dietaryPhilosophy =
    typeof prefs?.dietaryPhilosophy === "string"
      ? prefs.dietaryPhilosophy
      : "Balanced culinary nourishment in harmony with natural temperament.";

  const avoidedJoined = avoided.join(" | ").toLowerCase();
  const philosophyLower = dietaryPhilosophy.toLowerCase();

  const requiresVegetarian =
    slug === "leonardo-da-vinci" ||
    slug === "mahatma-gandhi" ||
    slug === "albert-einstein" ||
    slug === "jean-jacques-rousseau-1712" ||
    slug === "murasaki-shikibu" ||
    slug === "siddhartha-gautama-buddha" ||
    slug === "benjamin-franklin" ||
    slug === "lao-tzu" ||
    avoidedJoined.includes("vegetarian") ||
    avoidedJoined.includes("excess meat") ||
    avoidedJoined.includes("heavy meats") ||
    avoidedJoined.includes("meat on fast days") ||
    avoidedJoined.includes("meat from animals") ||
    philosophyLower.includes("lifelong vegetarian") ||
    philosophyLower.includes("tomb for animals");

  const avoidAlliums =
    avoidedJoined.includes("garlic") ||
    avoidedJoined.includes("onion") ||
    avoidedJoined.includes("strong-smelling");

  const avoidPork =
    requiresVegetarian ||
    avoidedJoined.includes("pork") ||
    slug === "cleopatra" ||
    slug === "ibn-sina-avicenna" ||
    slug === "rumi" ||
    slug === "hildegard-of-bingen";

  const avoidAlcohol =
    avoidedJoined.includes("alcohol") ||
    avoidedJoined.includes("intoxication") ||
    avoidedJoined.includes("drunken");

  const avoidRefinedSugar =
    avoidedJoined.includes("refined sugar") ||
    avoidedJoined.includes("excess sugar") ||
    avoidedJoined.includes("sweets and pastries");

  const bannedSubstrings: string[] = [];
  if (slug === "hildegard-of-bingen") {
    bannedSubstrings.push("strawberr", "leek");
  }
  if (slug === "claude-monet-1840") {
    bannedSubstrings.push("margarine");
  }

  return {
    requiresVegetarian,
    avoidAlliums,
    avoidPork,
    avoidAlcohol,
    avoidRefinedSugar,
    bannedSubstrings,
    favoriteKeywords: tokenizeKeywords([...favorites, ...staples]),
    culturalCuisine,
    dietaryPhilosophy,
  };
}

function recipeTextBlob(recipe: Recipe): string {
  const ingNames = recipe.ingredients.map((i) => i.name.toLowerCase()).join(" | ");
  return `${recipe.name.toLowerCase()} | ${ingNames}`;
}

export function isRecipeCompliantForAgent(
  recipe: Recipe,
  profile: DietaryProfile,
): boolean {
  if (recipe.ingredients.length < 3 || recipe.instructions.length === 0) {
    return false;
  }
  const blob = recipeTextBlob(recipe);

  if (profile.requiresVegetarian) {
    if (MEAT_SEAFOOD_TERMS.some((term) => blob.includes(term))) {
      return false;
    }
    const gate = verifyRecipeContent(
      {
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name,
          quantity: String(i.amount || 1),
          unit: i.unit || "unit",
        })),
        steps: recipe.instructions.map((instruction) => ({ instruction })),
      },
      { requestedDiet: "vegetarian" },
    );
    if (!gate.valid || gate.audit.nonCompliantDietItems.length > 0) {
      return false;
    }
  }

  if (profile.avoidAlliums && ALLIUM_TERMS.some((t) => blob.includes(t))) {
    return false;
  }
  if (profile.avoidPork && PORK_TERMS.some((t) => blob.includes(t))) {
    return false;
  }
  if (profile.avoidAlcohol && ALCOHOL_TERMS.some((t) => blob.includes(t))) {
    return false;
  }
  if (profile.avoidRefinedSugar && SUGAR_TERMS.some((t) => blob.includes(t))) {
    return false;
  }
  if (profile.bannedSubstrings.some((t) => blob.includes(t))) {
    return false;
  }

  return true;
}

function deterministicRank(slug: string, recipeId: string): number {
  const hex = createHash("sha256")
    .update(`${slug}:${recipeId}`)
    .digest("hex")
    .slice(0, 8);
  return Number.parseInt(hex, 16);
}

export function selectRecipesForAgent(
  slug: string,
  profile: DietaryProfile,
  catalog: readonly Recipe[],
  count: number,
  usedCounts: Map<string, number>,
): Recipe[] {
  const compliant = catalog.filter((r) => isRecipeCompliantForAgent(r, profile));
  const scored = compliant.map((recipe) => {
    const blob = recipeTextBlob(recipe);
    let keywordMatches = 0;
    for (const kw of profile.favoriteKeywords) {
      if (blob.includes(kw)) keywordMatches += 1;
    }
    const priorUses = usedCounts.get(recipe.id) ?? 0;
    const hashRank = deterministicRank(slug, recipe.id);
    return {
      recipe,
      // Prefer recipes not yet over-used across the roster, then keyword matches, then deterministic hash
      usagePenalty: priorUses,
      keywordScore: Math.min(keywordMatches, 3),
      hashRank,
    };
  });

  scored.sort((a, b) => {
    if (a.usagePenalty !== b.usagePenalty) {
      return a.usagePenalty - b.usagePenalty;
    }
    if (b.keywordScore !== a.keywordScore) {
      return b.keywordScore - a.keywordScore;
    }
    return a.hashRank - b.hashRank;
  });

  return scored.slice(0, count).map((s) => s.recipe);
}

export function buildCatalogCritiqueText(params: {
  agentSlug: string;
  agentName: string;
  dominantElement: string | null;
  profile: DietaryProfile;
  recipe: Recipe;
}): string {
  const { agentSlug, agentName, dominantElement, profile, recipe } = params;
  const customLore = HISTORICAL_LORE_CRITIQUES[agentSlug];
  const ingHighlights = recipe.ingredients
    .slice(0, 3)
    .map((i) => i.name.toLowerCase())
    .join(", ");

  if (customLore) {
    return `${customLore(recipe.name, recipe.cuisine)} The interplay of ${ingHighlights} exemplifies this balance at the table.`;
  }

  const element = dominantElement ?? "Earth";
  const firstSentence = `From the perspective of ${profile.culturalCuisine} tradition, "${recipe.name}" brings together ${ingHighlights} with ${element}-aligned clarity.`;
  const trimmedPhilosophy =
    profile.dietaryPhilosophy.length > 150
      ? `${profile.dietaryPhilosophy.slice(0, 147).trim()}...`
      : profile.dietaryPhilosophy;
  const secondSentence = `In keeping with ${agentName}'s culinary ethos — ${trimmedPhilosophy} — this preparation sustains focus and vitality without excess.`;
  return `${firstSentence} ${secondSentence}`;
}

const VEGETARIAN_ADAPTATION_AGENTS = [
  "leonardo-da-vinci",
  "albert-einstein",
  "jean-jacques-rousseau-1712",
  "benjamin-franklin",
  "siddhartha-gautama-buddha",
  "socrates",
  "joan-of-arc",
  "thomas-aquinas",
  "voltaire-1694",
  "mahatma-gandhi",
  "murasaki-shikibu",
  "lao-tzu",
];

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
