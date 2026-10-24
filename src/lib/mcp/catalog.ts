import { TOOL_INPUT_SCHEMAS, type JsonSchema } from "./inputSchemas";
import { TOOL_OUTPUT_SCHEMAS } from "./outputSchemas";

export type { JsonSchema } from "./inputSchemas";

/** Shared, dependency-free MCP discovery, input and output contract. */
export const MCP_SERVER_VERSION = "1.4.0";

export const TOOL_NAMES = [
  "get_live_sky_transits",
  "alchemize_ingredients",
  "generate_cosmic_recipe",
  "compute_synastry_overlay",
  "get_transit_natal_overlay",
  "compute_triplicate_synastry",
  "create_evidence_snapshot",
  "submit_recipe_reflection",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export function isToolName(name: unknown): name is ToolName {
  return (
    typeof name === "string" &&
    TOOL_NAMES.some((candidate) => candidate === name)
  );
}

export interface EsmsCost {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

const perAxis = (amount: number): EsmsCost => ({
  spirit: amount,
  essence: amount,
  matter: amount,
  substance: amount,
});

/**
 * Per-axis ESMS cost for one MCP tool call. Recipe search matches the
 * shop_items rate for `unlock-cosmic-recipe` (database/init/90): 2.5 of each
 * axis = 10 total. Evidence snapshots include the same priced recipe search;
 * reflections cost 0.1 per axis (0.4 total); the remaining calculations are
 * free. Tool descriptions quote these prices, so change both together.
 */
export const TOOL_COSTS: Record<ToolName, EsmsCost | null> = {
  get_live_sky_transits: null,
  alchemize_ingredients: null,
  generate_cosmic_recipe: perAxis(2.5),
  compute_synastry_overlay: null,
  get_transit_natal_overlay: null,
  compute_triplicate_synastry: null,
  create_evidence_snapshot: perAxis(2.5),
  submit_recipe_reflection: perAxis(0.1),
};

export interface ToolDefinition {
  name: ToolName;
  title: string;
  description: string;
  inputSchema: JsonSchema & { type: "object" };
  outputSchema: JsonSchema & { type: "object" };
  annotations: {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  };
}

function annotations(
  readOnlyHint: boolean,
  openWorldHint: boolean,
  idempotentHint = true,
): ToolDefinition["annotations"] {
  return {
    readOnlyHint,
    destructiveHint: false,
    idempotentHint,
    openWorldHint,
  };
}

const AUTH_DOC =
  "Optional arguments._meta.apiKey or MCP_USER_API_KEY (or ALCHM_MCP_USER_API_KEY) authenticates a caller; arguments._meta.caller identifies the client. Anonymous reads use demo mode. Credentials are validated only with the operator's DATABASE_URL configured.";

const RETRY_DOC =
  "Pass arguments._meta.idempotencyKey to retry safely: identical arguments replay the original settlement instead of charging again, and the result's billing field reports what happened.";

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "get_live_sky_transits",
    title: "Live sky transits",
    description: `Calculate live planetary positions and elemental balance for an observer. Requires the chart backend. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.get_live_sky_transits,
    outputSchema: TOOL_OUTPUT_SCHEMAS.get_live_sky_transits,
    annotations: annotations(true, true),
  },
  {
    name: "alchemize_ingredients",
    title: "Alchemize ingredients",
    description: `Analyze up to 100 ingredients using curated elemental and ESMS data. Missing curated ESMS quantities are reported as null. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.alchemize_ingredients,
    outputSchema: TOOL_OUTPUT_SCHEMAS.alchemize_ingredients,
    annotations: annotations(true, false),
  },
  {
    name: "generate_cosmic_recipe",
    title: "Cosmic recipe search",
    description: `Search the local recipe catalog by keywords, cuisine, diet and element. Authenticated calls debit 2.5 of each ESMS token (10 total), settled only when the search succeeds; without an idempotency key every call charges. ${RETRY_DOC} ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.generate_cosmic_recipe,
    outputSchema: TOOL_OUTPUT_SCHEMAS.generate_cosmic_recipe,
    annotations: annotations(false, false, false),
  },
  {
    name: "compute_synastry_overlay",
    title: "Synastry overlay",
    description: `Compute inter-chart aspects, tension, harmony, intensification and recommended stance. cacheStrategy=write updates the optional database cache; bypass computes locally. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.compute_synastry_overlay,
    outputSchema: TOOL_OUTPUT_SCHEMAS.compute_synastry_overlay,
    annotations: annotations(false, false),
  },
  {
    name: "get_transit_natal_overlay",
    title: "Transit-to-natal overlay",
    description: `Compute sky-to-natal aspects and per-element transit boosts for one agent. Requires the chart backend. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.get_transit_natal_overlay,
    outputSchema: TOOL_OUTPUT_SCHEMAS.get_transit_natal_overlay,
    annotations: annotations(true, true),
  },
  {
    name: "compute_triplicate_synastry",
    title: "Triplicate synastry quote",
    description: `Evaluate two natal charts against the current sky for resonance, potential rebates and a cooldown window key. This quotes pricing; it does not execute a trade or pay a rebate. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.compute_triplicate_synastry,
    outputSchema: TOOL_OUTPUT_SCHEMAS.compute_triplicate_synastry,
    annotations: annotations(true, true),
  },
  {
    name: "create_evidence_snapshot",
    title: "Evidence snapshot",
    description: `Bundle live transits, optional ingredient analysis and recipe candidates in one request. Authenticated calls debit 2.5 of each ESMS token (10 total), settled only for a complete snapshot (a partial snapshot is an error and is not charged); without an idempotency key every call charges. ${RETRY_DOC} ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.create_evidence_snapshot,
    outputSchema: TOOL_OUTPUT_SCHEMAS.create_evidence_snapshot,
    annotations: annotations(false, true, false),
  },
  {
    name: "submit_recipe_reflection",
    title: "Submit recipe reflection",
    description: `Save a culinary reflection (content state "proposed"), then attempt feed publication. Requires an authenticated non-synthetic caller; debits 0.1 of each ESMS token (0.4 total) in the same transaction that saves the reflection. Without an idempotency key every call creates another reflection and charges again; with one, a retry returns the original reflection and re-attempts a failed feed publication. ${RETRY_DOC} ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.submit_recipe_reflection,
    outputSchema: TOOL_OUTPUT_SCHEMAS.submit_recipe_reflection,
    annotations: annotations(false, true, false),
  },
];
