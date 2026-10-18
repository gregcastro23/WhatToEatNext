import { TOOL_INPUT_SCHEMAS, type JsonSchema } from "./inputSchemas";

export type { JsonSchema } from "./inputSchemas";

/** Shared, dependency-free MCP discovery and input contract. */
export const MCP_SERVER_VERSION = "1.3.0";

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

export interface ToolDefinition {
  name: ToolName;
  description: string;
  inputSchema: JsonSchema & { type: "object" };
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

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "get_live_sky_transits",
    description: `Calculate live planetary positions and elemental balance for an observer. Requires the chart backend. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.get_live_sky_transits,
    annotations: annotations(true, true),
  },
  {
    name: "alchemize_ingredients",
    description: `Analyze up to 100 ingredients using curated elemental and ESMS data. Missing curated ESMS quantities are reported as null. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.alchemize_ingredients,
    annotations: annotations(true, false),
  },
  {
    name: "generate_cosmic_recipe",
    description: `Search the local recipe catalog by keywords, cuisine, diet and element. Authenticated calls debit 2.5 of each ESMS token (10 total); repeated calls may charge again. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.generate_cosmic_recipe,
    annotations: annotations(false, false, false),
  },
  {
    name: "compute_synastry_overlay",
    description: `Compute inter-chart aspects, tension, harmony, intensification and recommended stance. cacheStrategy=write updates the optional database cache; bypass computes locally. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.compute_synastry_overlay,
    annotations: annotations(false, false),
  },
  {
    name: "get_transit_natal_overlay",
    description: `Compute sky-to-natal aspects and per-element transit boosts for one agent. Requires the chart backend. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.get_transit_natal_overlay,
    annotations: annotations(true, true),
  },
  {
    name: "compute_triplicate_synastry",
    description: `Evaluate two natal charts against the current sky for resonance, potential rebates and a cooldown window key. This quotes pricing; it does not execute a trade or pay a rebate. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.compute_triplicate_synastry,
    annotations: annotations(true, true),
  },
  {
    name: "create_evidence_snapshot",
    description: `Bundle live transits, optional ingredient analysis and recipe candidates in one request. Authenticated calls debit 2.5 of each ESMS token (10 total); repeated calls may charge again. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.create_evidence_snapshot,
    annotations: annotations(false, true, false),
  },
  {
    name: "submit_recipe_reflection",
    description: `Publish a culinary reflection, record a recipe interaction and attempt feed publication. Requires an authenticated non-synthetic caller; debits 0.1 of each ESMS token (0.4 total). Repeating the call creates another reflection and may charge again. ${AUTH_DOC}`,
    inputSchema: TOOL_INPUT_SCHEMAS.submit_recipe_reflection,
    annotations: annotations(false, true, false),
  },
];
