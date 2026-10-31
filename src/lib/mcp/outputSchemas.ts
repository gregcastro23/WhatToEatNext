import type { JsonSchema } from "./inputSchemas";

/**
 * Published result contracts (tools/list `outputSchema`). Every response,
 * success or `isError`, carries structuredContent and MCP clients validate it
 * against these schemas, so each one accepts the tool's success payload or the
 * shared error envelope. Objects stay open to additive fields; `required` lists
 * only fields every result carries.
 */

/** Stable `errorCode` values; ToolResult derives its union from this list. */
export const TOOL_ERROR_CODES = [
  "INVALID_ARGS",
  "QUOTA",
  "INTERNAL",
  "NOT_FOUND",
  "RATE_LIMIT",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "UNAVAILABLE",
  "BUSY",
  "CANCELLED",
  "CONFLICT",
] as const;

export type ToolErrorCode = (typeof TOOL_ERROR_CODES)[number];

/** What a paid tool did about payment for this response. */
export const BILLING_STATUSES = ["charged", "replayed", "not_charged"] as const;

export type BillingStatus = (typeof BILLING_STATUSES)[number];

const string: JsonSchema = { type: "string" };
const number: JsonSchema = { type: "number" };
const integer: JsonSchema = { type: "integer" };
const boolean: JsonSchema = { type: "boolean" };
const object: JsonSchema = { type: "object" };
const array: JsonSchema = { type: "array" };
const timestamp: JsonSchema = { type: "string", format: "date-time" };
const nullable = (schema: JsonSchema): JsonSchema => ({
  anyOf: [schema, { type: "null" }],
});
const shape = (
  properties: Record<string, JsonSchema>,
  required: string[] = Object.keys(properties),
): JsonSchema & { type: "object" } => ({ type: "object", properties, required });

const basket = shape({
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
});

const billing = shape(
  {
    status: { type: "string", enum: [...BILLING_STATUSES] },
    reason: string,
    amounts: nullable(basket),
    idempotencyKey: nullable(string),
  },
  ["status", "amounts", "idempotencyKey"],
);

const errorEnvelope = shape(
  {
    errorCode: { type: "string", enum: [...TOOL_ERROR_CODES] },
    message: string,
    correlationId: string,
    // Partial evidence a failed call still produced (e.g. a partial snapshot).
    data: {},
    retryAfterSec: number,
    billing,
  },
  ["errorCode", "message", "correlationId"],
);

function result(
  success: JsonSchema & { type: "object" },
  paid = false,
): JsonSchema & { type: "object" } {
  const properties = {
    ...success.properties,
    correlationId: string,
    ...(paid ? { billing } : {}),
  };
  return {
    type: "object",
    anyOf: [
      {
        ...success,
        properties,
        required: [...(success.required ?? []), "correlationId"],
      },
      errorEnvelope,
    ],
  };
}

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

export const TOOL_OUTPUT_SCHEMAS = {
  get_live_sky_transits: result(sky),
  alchemize_ingredients: result(ingredientAnalysis),
  generate_cosmic_recipe: result(recipeSearch, true),
  compute_synastry_overlay: result(synastry),
  get_transit_natal_overlay: result(transitOverlay),
  compute_triplicate_synastry: result(triplicate),
  create_evidence_snapshot: result(evidenceSnapshot, true),
  submit_recipe_reflection: result(reflection, true),
};
