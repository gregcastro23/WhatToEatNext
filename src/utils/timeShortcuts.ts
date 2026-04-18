import type { Recipe } from "@/types/recipe";

export type TimeBudget = 15 | 30 | 60 | "all";

export interface StepAnalysis {
  index: number;
  skippable: boolean;
  parallelizable: boolean;
  timeConsuming: boolean;
  reason?: string;
}

export interface TimeShortcutResult {
  budget: TimeBudget;
  totalRecipeMinutes: number;
  fitsBudget: boolean;
  stepAnalyses: StepAnalysis[];
  makeAheadTips: string[];
  equipmentSwaps: string[];
  shortcutTips: string[];
}

const BUDGET_MINUTES: Record<Exclude<TimeBudget, "all">, number> = {
  15: 15,
  30: 30,
  60: 60,
};

const SKIPPABLE_KEYWORDS = [
  "optional", "garnish", "to taste", "if desired", "you may", "you can also",
  "preheat the oven", // technically required but can parallelize with other prep
];
const PARALLELIZABLE_KEYWORDS = [
  "while", "meanwhile", "at the same time", "in parallel", "as the",
  "preheat", "heat the oven", "bring", "boil",
];
const TIME_CONSUMING_KEYWORDS = [
  "marinate", "marinade", "rest", "chill", "refrigerate", "overnight",
  "set aside for", "let sit", "proof", "ferment", "cool completely",
  "simmer for 1", "simmer for 2", "braise", "slow cook", "reduce",
];

const MAKE_AHEAD_KEYWORDS = [
  "overnight", "ahead", "day before", "refrigerate", "store", "keeps", "freeze", "prepare in advance", "can be made",
];

const EQUIPMENT_SHORTCUT_RULES: Array<{ match: RegExp; swap: string }> = [
  { match: /\bbraise\b|\bslow[\s-]?cook\b|\bstew\b/i, swap: "Use a pressure cooker: reduces braising from hours to 30–40 min" },
  { match: /\bovernight\b|\bmarinate.*(hour|hr)s?/i,    swap: "Use a vacuum marinator or inject marinade to cut marinating time ~75%" },
  { match: /\bboil.*potato\b|\bcook.*potato\b/i,       swap: "Microwave-steam potatoes: 5–8 min vs. 20+ min boiling" },
  { match: /\bwhip\b|\bfold\b|\bbeat/i,                swap: "Use a stand mixer to parallelize hands-free" },
  { match: /\broast|\bbake\b/i,                        swap: "Air fryer: 25–35% faster than conventional oven for roasting" },
  { match: /\bsimmer\b.*\b(1|2|3)\s*hour/i,            swap: "Pressure cooker: 15–25 min vs. 1–3 hours simmering" },
];

function parseMinutesFromString(s: string | undefined): number {
  if (!s) return 0;
  let total = 0;
  const hourMatch = s.match(/(\d+)\s*(?:hour|hr|h\b)/i);
  if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
  const minMatch = s.match(/(\d+)\s*(?:minute|min|m\b)/i);
  if (minMatch) total += parseInt(minMatch[1], 10);
  if (total === 0) {
    const bare = s.match(/\d+/);
    if (bare) total = parseInt(bare[0], 10);
  }
  return total;
}

function getTotalMinutes(recipe: Recipe): number {
  const details = (recipe as { details?: { prepTimeMinutes?: number; cookTimeMinutes?: number } }).details;
  if (details?.prepTimeMinutes != null) {
    return details.prepTimeMinutes + (details.cookTimeMinutes ?? 0);
  }
  return parseMinutesFromString(recipe.prepTime) + parseMinutesFromString(recipe.cookTime);
}

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function analyzeStep(instruction: string, index: number): StepAnalysis {
  const skippable = matchesAny(instruction, SKIPPABLE_KEYWORDS);
  const parallelizable = matchesAny(instruction, PARALLELIZABLE_KEYWORDS);
  const timeConsuming = matchesAny(instruction, TIME_CONSUMING_KEYWORDS);

  let reason: string | undefined;
  if (timeConsuming) reason = "Long idle time — prep other steps or skip if pressed";
  else if (parallelizable) reason = "Can run alongside another step";
  else if (skippable) reason = "Optional — safe to skip under time pressure";

  return { index, skippable, parallelizable, timeConsuming, reason };
}

function extractMakeAheadTips(recipe: Recipe): string[] {
  const buckets = [recipe.tips, recipe.chefNotes, recipe.technicalTips, recipe.variations].filter(Boolean) as string[][];
  const flat = buckets.flat();
  return flat.filter((tip) => matchesAny(tip, MAKE_AHEAD_KEYWORDS));
}

function extractEquipmentSwaps(recipe: Recipe): string[] {
  const joined = [...recipe.instructions, recipe.prepTime ?? "", recipe.cookTime ?? ""].join(" ");
  const hits: string[] = [];
  for (const { match, swap } of EQUIPMENT_SHORTCUT_RULES) {
    if (match.test(joined) && !hits.includes(swap)) hits.push(swap);
  }
  return hits;
}

export function analyzeTimeShortcuts(recipe: Recipe, budget: TimeBudget): TimeShortcutResult {
  const totalRecipeMinutes = getTotalMinutes(recipe);
  const fitsBudget = budget === "all" ? true : totalRecipeMinutes > 0 && totalRecipeMinutes <= BUDGET_MINUTES[budget];

  const stepAnalyses = recipe.instructions.map((inst, i) => analyzeStep(inst, i));

  const makeAheadTips = extractMakeAheadTips(recipe);
  const equipmentSwaps = budget === "all" ? [] : extractEquipmentSwaps(recipe);

  const shortcutTips: string[] = [];
  if (budget !== "all" && !fitsBudget) {
    const longSteps = stepAnalyses.filter((s) => s.timeConsuming).length;
    const parallelSteps = stepAnalyses.filter((s) => s.parallelizable).length;
    if (longSteps > 0) {
      shortcutTips.push(`${longSteps} step${longSteps === 1 ? "" : "s"} involve long idle time. Consider doing those ahead.`);
    }
    if (parallelSteps > 0) {
      shortcutTips.push(`${parallelSteps} step${parallelSteps === 1 ? "" : "s"} can run in parallel to save wall-clock time.`);
    }
    if (makeAheadTips.length > 0) {
      shortcutTips.push(`${makeAheadTips.length} tip${makeAheadTips.length === 1 ? "" : "s"} suggest make-ahead prep.`);
    }
    if (equipmentSwaps.length > 0) {
      shortcutTips.push(`${equipmentSwaps.length} equipment shortcut${equipmentSwaps.length === 1 ? "" : "s"} available.`);
    }
  }

  return {
    budget,
    totalRecipeMinutes,
    fitsBudget,
    stepAnalyses,
    makeAheadTips,
    equipmentSwaps,
    shortcutTips,
  };
}
