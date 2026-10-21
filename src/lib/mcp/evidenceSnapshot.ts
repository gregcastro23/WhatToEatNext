import { createHash, randomUUID } from "node:crypto";

type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
interface JsonObject {
  [key: string]: JsonValue;
}

interface ComponentResult {
  ok: boolean;
  data: unknown;
  errorCode?: string;
  errorMessage?: string;
}

export interface EvidenceComponent {
  status: "success" | "failed" | "skipped";
  required: boolean;
  source: string;
  error: { code: string; message: string } | null;
  reason?: "ingredients-not-provided";
}

interface CapturedComponent {
  data: JsonValue;
  provenance: EvidenceComponent;
}

const SOURCES = {
  liveSky: "natalChartService.calculateNatalChart",
  alchemicalScan: "IngredientService.catalog+AlchemicalService",
  candidateRecipes: "RecipeService.searchRecipes",
} as const;

export interface EvidenceSnapshot {
  schemaVersion: "1.0";
  snapshotId: string;
  contentHash: string;
  generatedAt: string;
  timestamp: string;
  /** Aliases consumed by the Planetary Agents evidence hydrator. */
  createdAt: string;
  skyTransits: JsonValue;
  recipeCandidates: JsonValue;
  liveSky: JsonValue;
  alchemicalScan: JsonValue;
  candidateRecipes: JsonValue;
  status: "complete" | "partial" | "failed";
  provenance: {
    schemaVersion: "1.0";
    generatedAt: string;
    sources: typeof SOURCES;
    components: {
      liveSky: EvidenceComponent;
      alchemicalScan: EvidenceComponent;
      candidateRecipes: EvidenceComponent;
    };
  };
}

/** Detach service data, preserving JSON semantics without accepting cycles or NaN. */
function normalizeJson(value: unknown, ancestors = new Set<object>()): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value !== "object" || ancestors.has(value)) {
    throw new Error("Evidence must contain finite, acyclic JSON values");
  }

  const nextAncestors = new Set(ancestors).add(value);
  if (Array.isArray(value)) {
    return value.map((item: unknown) =>
      item === undefined ? null : normalizeJson(item, nextAncestors),
    );
  }
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    throw new Error("Evidence must contain plain JSON objects");
  }

  // Sorting at every level makes the hash independent of source key order.
  const normalized: JsonObject = {};
  for (const [key, item] of Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    if (item !== undefined) {
      Object.defineProperty(normalized, key, {
        value: normalizeJson(item, nextAncestors),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }
  return normalized;
}

function freezeEvidence(value: unknown): void {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return;
  for (const child of Object.values(value)) freezeEvidence(child);
  Object.freeze(value);
}

function failedComponent(
  source: string,
  required: boolean,
  code: string,
  message: string,
): CapturedComponent {
  return {
    data: null,
    provenance: { status: "failed", required, source, error: { code, message } },
  };
}

function captureComponent(
  result: PromiseSettledResult<ComponentResult | null>,
  source: string,
  required: boolean,
): CapturedComponent {
  if (!required) {
    return {
      data: null,
      provenance: {
        status: "skipped",
        required: false,
        source,
        error: null,
        reason: "ingredients-not-provided",
      },
    };
  }
  if (result.status === "rejected") {
    // Service exceptions can contain connection details; expose a stable error.
    return failedComponent(source, required, "COMPONENT_FAILED", "Evidence source failed");
  }
  if (result.value === null) {
    return failedComponent(source, required, "EMPTY_EVIDENCE", "Evidence source returned no data");
  }
  if (!result.value.ok) {
    return failedComponent(
      source,
      required,
      result.value.errorCode ?? "COMPONENT_FAILED",
      result.value.errorMessage ?? "Evidence source reported a failure",
    );
  }
  if (result.value.data === null || result.value.data === undefined) {
    return failedComponent(source, required, "EMPTY_EVIDENCE", "Evidence source returned no data");
  }
  try {
    return {
      data: normalizeJson(result.value.data),
      provenance: { status: "success", required, source, error: null },
    };
  } catch {
    return failedComponent(source, required, "INVALID_EVIDENCE", "Evidence source returned invalid JSON data");
  }
}

/** One invocation produces a detached, immutable snapshot; no user data is cached. */
export function buildEvidenceSnapshot(
  generatedAt: string,
  results: {
    liveSky: PromiseSettledResult<ComponentResult>;
    alchemicalScan: PromiseSettledResult<ComponentResult | null>;
    candidateRecipes: PromiseSettledResult<ComponentResult>;
  },
  ingredientsRequested: boolean,
): EvidenceSnapshot {
  const sky = captureComponent(results.liveSky, SOURCES.liveSky, true);
  const ingredients = captureComponent(results.alchemicalScan, SOURCES.alchemicalScan, ingredientsRequested);
  const recipes = captureComponent(results.candidateRecipes, SOURCES.candidateRecipes, true);
  const components = {
    liveSky: sky.provenance,
    alchemicalScan: ingredients.provenance,
    candidateRecipes: recipes.provenance,
  };
  const required = Object.values(components).filter((component) => component.required);
  const successfulCount = required.filter((component) => component.status === "success").length;
  const status = successfulCount === required.length
    ? "complete" as const
    : successfulCount > 0 ? "partial" as const : "failed" as const;
  const content = {
    schemaVersion: "1.0" as const,
    generatedAt,
    timestamp: generatedAt,
    createdAt: generatedAt,
    liveSky: sky.data,
    skyTransits: sky.data,
    alchemicalScan: ingredients.data,
    candidateRecipes: recipes.data,
    recipeCandidates: recipes.data,
    status,
    provenance: { schemaVersion: "1.0" as const, generatedAt, sources: { ...SOURCES }, components },
  };
  // Identity is intentionally excluded: equivalent captures have equal hashes
  // while every invocation retains its own UUID.
  const contentHash = createHash("sha256")
    .update(JSON.stringify(normalizeJson(content)))
    .digest("hex");
  const snapshot: EvidenceSnapshot = { ...content, snapshotId: randomUUID(), contentHash };
  freezeEvidence(snapshot);
  return snapshot;
}
