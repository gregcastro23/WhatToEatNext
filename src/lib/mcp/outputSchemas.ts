import { CULINARY_OUTPUT_SCHEMAS } from "./culinaryOutputSchemas";
import {
  array,
  basket,
  boolean,
  integer,
  nullable,
  number,
  object,
  result,
  shape,
  string,
  timestamp,
} from "./outputSchemaHelpers";

export {
  BILLING_STATUSES,
  TOOL_ERROR_CODES,
  type BillingStatus,
  type ToolErrorCode,
} from "./outputSchemaHelpers";

const sky = shape({
  timestamp,
  coordinates: shape({ latitude: number, longitude: number }),
  elementalBalance: { type: "object", additionalProperties: number },
  dominantElement: string,
  planetaryPositions: object,
});

const esmsValues = basket;

const ingredientAnalysis = shape(
  {
    ingredientCount: integer,
    ingredients: {
      type: "array",
      items: shape(
        {
          name: string,
          resolvedName: string,
          category: string,
          esms: nullable(esmsValues),
          esmsSource: nullable({ type: "string", enum: ["ingredient-data"] }),
          elementalProperties: object,
          planetaryRuler: {},
        },
        ["name", "resolvedName", "esms", "esmsSource", "elementalProperties"],
      ),
    },
    aggregateBalances: nullable(esmsValues),
    esmsCoverage: shape({ withQuantities: integer, total: integer }),
    overallHarmony: nullable(number),
    dominantElement: string,
    thermodynamics: object,
    recommendations: array,
  },
  [
    "ingredientCount",
    "ingredients",
    "aggregateBalances",
    "esmsCoverage",
    "dominantElement",
  ],
);

const recipeSearch = shape({
  totalMatching: integer,
  returnedCount: integer,
  offset: integer,
  appliedProfileFilters: object,
  recipes: {
    type: "array",
    items: shape(
      {
        id: {},
        name: string,
        description: {},
        cuisine: {},
        prepTime: {},
        servings: {},
        // Recipes carry no curated quantities; see generateCosmicRecipe.
        esms: { type: "null" },
        esmsSource: { type: "null" },
        elementalProperties: object,
        ingredients: { type: "array", items: string },
        instructions: {},
        resourceUri: string,
      },
      ["name", "esms", "esmsSource", "ingredients"],
    ),
  },
});

const synastry = shape({
  pair: shape({
    agentA: string,
    agentB: string,
    computedAt: timestamp,
    cacheHit: boolean,
  }),
  interchartAspects: { type: "array", items: object },
  scores: shape({
    tension: number,
    harmony: number,
    intensification: number,
    aspectCount: number,
  }),
  dominantStance: { type: "string", enum: ["clash", "absorb", "mirror"] },
});

const transitOverlay = shape({
  agentId: string,
  transitTime: string,
  coordinates: shape({ latitude: number, longitude: number }),
  activations: { type: "array", items: object },
  boostElement: nullable({
    type: "string",
    enum: ["fire", "earth", "air", "water"],
  }),
  boostMagnitude: number,
  stressNotes: { type: "array", items: string },
  summary: string,
});

const triplicate = shape({
  qualifies: boolean,
  resonanceBonusPct: number,
  aspectDescription: string,
  transitCatalyst: string,
  primaryTransitPlanet: string,
  aspectType: string,
  elementalConcentration: number,
  windowKey: string,
  makerRebateAmount: number,
  takerRebateAmount: number,
  beta: number,
});

const evidenceComponent = shape(
  {
    status: { type: "string", enum: ["success", "failed", "skipped"] },
    required: boolean,
    source: string,
    error: nullable(shape({ code: string, message: string })),
    reason: string,
  },
  ["status", "required", "source", "error"],
);

const evidenceSnapshot = shape({
  schemaVersion: { type: "string", enum: ["1.0"] },
  snapshotId: string,
  contentHash: { type: "string", pattern: "^[0-9a-f]{64}$" },
  generatedAt: timestamp,
  timestamp,
  createdAt: timestamp,
  liveSky: nullable(sky),
  skyTransits: nullable(sky),
  alchemicalScan: nullable(ingredientAnalysis),
  candidateRecipes: nullable(recipeSearch),
  recipeCandidates: nullable(recipeSearch),
  status: { type: "string", enum: ["complete", "partial", "failed"] },
  provenance: shape({
    schemaVersion: { type: "string", enum: ["1.0"] },
    generatedAt: timestamp,
    sources: object,
    components: shape({
      liveSky: evidenceComponent,
      alchemicalScan: evidenceComponent,
      candidateRecipes: evidenceComponent,
    }),
  }),
});

const reflection = shape(
  {
    reflectionId: string,
    recipeId: string,
    authorId: string,
    agentSlug: nullable(string),
    agentName: nullable(string),
    reflection: string,
    // New reflections are "proposed"; a replay reports the stored state.
    contentState: { type: "string", enum: ["proposed", "verified", "rejected"] },
    published: boolean,
    publicationReceipt: shape(
      {
        feedPublished: boolean,
        feedEventId: nullable(string),
        legacyInteractionStatus: string,
        error: string,
      },
      ["feedPublished", "feedEventId", "legacyInteractionStatus"],
    ),
    replayed: boolean,
    timestamp: string,
  },
  [
    "reflectionId",
    "recipeId",
    "authorId",
    "reflection",
    "contentState",
    "published",
    "publicationReceipt",
    "replayed",
    "timestamp",
  ],
);

const hermeticCauldron = shape(
  {
    vessel: shape({
      setpointC: number,
      pressureKpa: number,
      humidityPct: number,
      headspaceC: number,
      surfaceWet: boolean,
    }),
    saturation: shape({
      tsatC: number,
      boilingState: string,
      aboveCeiling: boolean,
      wetSurfaceC: number,
      surfaceVaporKpa: number,
      headspaceVaporKpa: number,
      latentVsSeaLevel: number,
    }),
    deficit: shape({
      vaporDeficitKpa: number,
      transfer: string,
      headspaceVaporCapped: boolean,
    }),
    regimes: array,
    profile: shape({
      fields: object,
      mappings: array,
      power: number,
    }),
    circuit: nullable(object),
  },
  ["vessel", "saturation", "deficit", "regimes", "profile"],
);

export const TOOL_OUTPUT_SCHEMAS = {
  get_live_sky_transits: result(sky),
  alchemize_ingredients: result(ingredientAnalysis),
  generate_cosmic_recipe: result(recipeSearch, true),
  compute_synastry_overlay: result(synastry),
  get_transit_natal_overlay: result(transitOverlay),
  compute_triplicate_synastry: result(triplicate),
  create_evidence_snapshot: result(evidenceSnapshot, true),
  submit_recipe_reflection: result(reflection, true),
  simulate_hermetic_cauldron: result(hermeticCauldron),
  ...CULINARY_OUTPUT_SCHEMAS,
};
