/**
 * Browser-safe classification, normalization, and parameter sanitization for
 * first-party telemetry interactions and referral tags.
 *
 * Kept free of Node built-ins (`node:crypto`, `pg`) so both client components
 * (PageViewTracker, RecentVisits, TrafficSections) and server modules can
 * import directly without pulling Node modules into client bundles.
 *
 * @file src/lib/analytics/interactionClassify.ts
 */

export const INTERACTIVE_ROUTE_PREFIXES = [
  "/menu-planner",
  "/meal-plan",
  "/baking-lab",
  "/kitchen-lab",
  "/celestial-lab",
  "/recipe-builder",
  "/quantities",
  "/commensal",
  "/food-tracking",
] as const;

export function isInteractiveRoute(path: string): boolean {
  return INTERACTIVE_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

const POLLUTED_REF_VALUES = new Set([
  "vessel",
  "prep",
  "cosmic",
  "taste",
  "budget",
  "guests",
  "formula",
  "italian",
  "mexican",
  "japanese",
  "mediterranean",
  "chinese",
  "indian",
  "french",
  "thai",
  "korean",
  "greek",
  "spanish",
  "american",
  "vietnamese",
  "middle-eastern",
  "balanced",
  "vegetarian",
  "vegan",
  "pescatarian",
  "high-protein",
  "all",
  "live",
  "engaged",
  "stuck",
  "error",
  "ref",
  "returning",
]);

const UI_STATE_PARAM_KEYS = ["tab", "cuisine", "meal", "element", "sort"] as const;

/**
 * Sanitize a lightweight share/attribution tag (?ref=, ?via=, ?source=,
 * ?utm_source=, ?utm_campaign=).
 * Rejects UI state values, emails, and long hex/JWT tokens so secrets, PII,
 * and UI filter state never pollute campaign rollups or trigger false
 * Active Reviewer alerts.
 */
export function cleanRefTag(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 80) return null;
  if (trimmed.includes("@") || /^[0-9a-f]{32,}$/i.test(trimmed)) return null;
  if (!/^[a-z0-9:_./-]+$/.test(trimmed)) return null;
  if (POLLUTED_REF_VALUES.has(trimmed)) return null;
  if (/^(tab|cuisine|sort|page|filter|preset|q|session|view|meal|element)[:=]/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Normalize dynamic UUIDs, long hex hashes, and numeric IDs inside an
 * interaction segment or tag so tallies group cleanly instead of fragmenting.
 */
export function normalizeInteractionTag(raw: string): string {
  return raw
    .trim()
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
    .replace(/\b[0-9a-f]{12,}\b/gi, ":id")
    .replace(/\/[0-9]{2,}(?=\/|$|:)/g, "/:id")
    .replace(/[_-][0-9]{4,}(?=[_:=-]|$)/g, ":id")
    .replace(/:[0-9]{4,}(?=:|$)/g, ":id")
    .slice(0, 80);
}

/**
 * Extract structured UI state filter interaction tags (`filter:param:<k>=<v>`)
 * from a query string so UI parameters like `?tab=prep&cuisine=italian` are
 * tallied as interactions rather than polluting `ref_tag`.
 */
export function extractUiQueryParamTags(search: string | URLSearchParams): string[] {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const tags: string[] = [];
  for (const key of UI_STATE_PARAM_KEYS) {
    const rawVal = params.get(key);
    if (!rawVal) continue;
    const cleanVal = rawVal
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 32);
    if (cleanVal) {
      tags.push(`filter:param:${key}=${cleanVal}`);
    }
  }
  return tags;
}

/**
 * Validate, normalize, and deduplicate a bounded list of in-page interaction
 * labels (e.g. "planner:fast-start", "filter:param:cuisine=mediterranean").
 */
export function cleanInteractions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const normalized = normalizeInteractionTag(item);
    if (!normalized || !/^[A-Za-z0-9:_./=>-]+$/.test(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
    if (out.length >= 50) break;
  }
  return out;
}

export type InteractionTone = "conversion" | "friction" | "error" | "feature";

export interface ClassifiedInteraction {
  raw: string;
  category: string;
  action: string;
  meta: string | null;
  tone: InteractionTone;
  label: string;
}

const INTERACTION_LABELS: Readonly<Record<string, string>> = {
  "friction:rage_click": "Rage Click",
  "friction:dead_click": "Dead Click",
  "friction:quick_back": "Quick Back",
  "perf:slow_inp": "Slow INP",
  "perf:slow_lcp": "Slow LCP",
  "search:zero_results": "Zero-Result Search",
};

function parseVariantSpec(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const sepMatch = /^([a-z0-9_-]{1,24})[:=]([a-z0-9_-]{1,28})$/.exec(trimmed);
  if (sepMatch?.[1] && sepMatch[2]) {
    return `variant:${sepMatch[1]}=${sepMatch[2]}`;
  }
  const cleanVal = trimmed
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);
  return cleanVal ? `variant:ui=${cleanVal}` : null;
}

/**
 * Extract active UI experiment variant tags (`?variant=`, `?exp=`, `?ab=`) or a
 * persisted session variant into normalized `variant:<exp>=<arm>` interaction tags.
 */
export function extractVariantTags(
  search: string | URLSearchParams,
  storedVariant?: string | null,
): string[] {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const out: string[] = [];
  const seen = new Set<string>();
  const pushSpec = (raw: string | null): void => {
    if (!raw) return;
    for (const part of raw.split(",")) {
      const tag = parseVariantSpec(part);
      if (tag && !seen.has(tag)) {
        seen.add(tag);
        out.push(tag);
      }
    }
  };
  for (const key of ["variant", "exp", "ab"] as const) {
    pushSpec(params.get(key));
  }
  if (out.length === 0 && storedVariant) {
    pushSpec(storedVariant);
  }
  return out;
}

export function isFrustrationOrPerfTag(tag: string): boolean {
  return (
    tag.startsWith("friction:") ||
    tag.startsWith("perf:slow_") ||
    tag.startsWith("error:")
  );
}

export function isCoreActivationTag(tag: string): boolean {
  return (
    tag.startsWith("plan:") ||
    tag.startsWith("patch:solve:") ||
    tag.startsWith("conversion:") ||
    tag.startsWith("search:query:") ||
    tag.startsWith("tab:cauldron_step_")
  );
}

const FRICTION_CATEGORIES = new Set(["friction", "perf"]);
const CONVERSION_ACTIONS = ["cart", "export", "save", "checkout", "feedback"];
const FRICTION_ACTIONS = ["stuck", "empty", "fail"];

function resolveInteractionTone(category: string, action: string): InteractionTone {
  if (category === "error" || action.startsWith("error") || action.startsWith("api_5")) {
    return "error";
  }
  if (
    FRICTION_CATEGORIES.has(category) ||
    action === "zero_results" ||
    FRICTION_ACTIONS.some((k) => action.includes(k))
  ) {
    return "friction";
  }
  if (
    category === "conversion" ||
    CONVERSION_ACTIONS.some((k) => action.includes(k))
  ) {
    return "conversion";
  }
  return "feature";
}

/**
 * Parse a structured `category:action[:meta]` interaction tag and assign a
 * semantic tone and human-readable label so the UI can color-code conversions,
 * behavioral friction, slow CWV frames, and errors.
 */
export function classifyInteractionTag(tag: string): ClassifiedInteraction {
  const parts = tag.split(":");
  const category = (parts[0] ?? "event").toLowerCase();
  const action = (parts[1] ?? tag).toLowerCase();
  const meta = parts.length > 2 ? parts.slice(2).join(":") : null;
  const tone = resolveInteractionTone(category, action);
  const compound = `${category}:${action}`;
  const label = category === "variant" ? "UI Variant" : (INTERACTION_LABELS[compound] ?? compound);
  return { raw: tag, category, action, meta, tone, label };
}
