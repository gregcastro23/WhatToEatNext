/** The JSON Schema subset enforced by validation.ts; no SDK dependency. */
export interface JsonSchema {
  [key: string]: unknown;
  type?: "object" | "array" | "string" | "number" | "integer" | "boolean";
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minProperties?: number;
  maxProperties?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  format?: "date-time";
  pattern?: string;
}

const text = (maxLength: number, description?: string): JsonSchema => ({
  type: "string",
  minLength: 1,
  maxLength,
  ...(description ? { description } : {}),
});
const identifier = text(200);
const credential = text(512);
const meta: JsonSchema = {
  type: "object",
  properties: {
    apiKey: credential,
    authKey: credential,
    caller: text(64),
    correlationId: text(128),
    requestId: text(128),
    traceId: text(128),
    evidenceSnapshotId: text(128),
    internalSecret: credential,
  },
  additionalProperties: false,
};
const coordinates: Record<string, JsonSchema> = {
  latitude: {
    type: "number",
    minimum: -90,
    maximum: 90,
    description: "Observer latitude; default 40.7498 (NYC).",
  },
  longitude: {
    type: "number",
    minimum: -180,
    maximum: 180,
    description: "Observer longitude; default -73.7976 (NYC).",
  },
};
const ingredients: JsonSchema = {
  type: "array",
  minItems: 1,
  maxItems: 100,
  items: text(200),
};
const focusPlanets: JsonSchema = {
  type: "array",
  minItems: 1,
  maxItems: 32,
  items: text(64),
};
const transitTime: JsonSchema = {
  type: "string",
  format: "date-time",
  maxLength: 64,
  description: "ISO 8601 timestamp with timezone; default now.",
};
const element: JsonSchema = {
  type: "string",
  enum: ["Fire", "Water", "Earth", "Air"],
};
const zodiac: JsonSchema = {
  type: "string",
  pattern: `^(${[
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ]
    .map((sign) =>
      Array.from(sign, (letter) => `[${letter}${letter.toUpperCase()}]`).join(
        "",
      ),
    )
    .join("|")})$`,
};
const search: Record<string, JsonSchema> = {
  prompt: text(2000, "Recipe keywords or culinary intention."),
  cuisine: text(100),
  dietary: { type: "array", maxItems: 20, items: text(100) },
  dominantElement: element,
};
const planet: JsonSchema = {
  type: "object",
  required: ["sign", "degree"],
  properties: {
    sign: zodiac,
    degree: { type: "number", minimum: 0, maximum: 30 },
    retrograde: { type: "boolean" },
    house: { type: "integer", minimum: 1, maximum: 12 },
  },
  additionalProperties: false,
};
const chart: JsonSchema = {
  type: "object",
  required: ["planets"],
  properties: {
    planets: {
      type: "object",
      minProperties: 1,
      maxProperties: 32,
      additionalProperties: planet,
    },
    ascendant: {
      anyOf: [{ type: "number", minimum: 0, maximum: 360 }, planet],
    },
    midheaven: {
      anyOf: [{ type: "number", minimum: 0, maximum: 360 }, planet],
    },
  },
  additionalProperties: false,
};
const agent: JsonSchema = {
  type: "object",
  required: ["id", "natalChart"],
  properties: { id: identifier, natalChart: chart },
  additionalProperties: false,
};
const placement: JsonSchema = {
  type: "object",
  required: ["sign"],
  properties: {
    planet: text(64),
    sign: zodiac,
    degree: { type: "number", minimum: 0, maximum: 30 },
    exactLongitude: { type: "number", minimum: 0, maximum: 360 },
  },
  additionalProperties: false,
};
const natal: JsonSchema = {
  description:
    "Natal placements keyed by planet, or an array of placements with planet and sign.",
  anyOf: [
    {
      type: "object",
      minProperties: 1,
      maxProperties: 32,
      additionalProperties: placement,
    },
    {
      type: "array",
      minItems: 1,
      maxItems: 32,
      items: { ...placement, required: ["planet", "sign"] },
    },
  ],
};
const token: JsonSchema = {
  type: "string",
  enum: ["Spirit", "Essence", "Matter", "Substance"],
};
const positiveAmount: JsonSchema = {
  type: "number",
  exclusiveMinimum: 0,
  maximum: 1_000_000_000,
};

function input(
  properties: Record<string, JsonSchema>,
  required: string[] = [],
): JsonSchema & { type: "object" } {
  return {
    type: "object",
    properties: {
      ...properties,
      _meta: meta,
      _authKey: credential,
      _apiKey: credential,
    },
    required,
    additionalProperties: false,
  };
}

/** Complete transport input contracts; shared by discovery and validation. */
export const TOOL_INPUT_SCHEMAS = {
  get_live_sky_transits: input(coordinates),
  alchemize_ingredients: input({ ingredients }, ["ingredients"]),
  generate_cosmic_recipe: input(search),
  compute_synastry_overlay: input(
    {
      agentA: agent,
      agentB: agent,
      focusPlanets,
      cacheStrategy: { type: "string", enum: ["read", "write", "bypass"] },
    },
    ["agentA", "agentB"],
  ),
  get_transit_natal_overlay: input({ agent, transitTime, ...coordinates, focusPlanets }, [
    "agent",
  ]),
  compute_triplicate_synastry: input(
    {
      makerId: identifier,
      takerId: identifier,
      makerNatal: natal,
      takerNatal: natal,
      giveToken: token,
      giveAmount: positiveAmount,
      wantToken: token,
      wantAmount: positiveAmount,
      transitTime,
    },
    [
      "makerId",
      "takerId",
      "makerNatal",
      "takerNatal",
      "giveToken",
      "giveAmount",
      "wantToken",
      "wantAmount",
    ],
  ),
  create_evidence_snapshot: input({ ...coordinates, ingredients, ...search }),
  submit_recipe_reflection: input(
    {
      recipeId: identifier,
      recipeName: text(300),
      reflection: text(10000),
      agentSlug: text(100),
      agentName: text(200),
      dominantElement: element,
      source: text(100),
    },
    ["recipeId", "reflection"],
  ),
};
