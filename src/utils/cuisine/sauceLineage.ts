/**
 * Sauce Lineage Engine
 *
 * Derives a multi-cuisine phylogeny of sauces from explicit data signals
 * (variants / derivatives lists, base type, key ingredients) plus inferred
 * relationships when explicit ones are missing.
 *
 * Output
 *   • forest: roots → expandable children, organized by base family
 *   • lineage: breadcrumb path from any sauce to its root
 *   • divergence: ingredients added or dropped vs. parent
 *   • fusion bridges: cross-cuisine pairs with high ingredient overlap, the
 *     starting points for non-fusion-but-informed cross-tradition cooking
 *
 * Algorithm summary
 *   1. Collect every sauce node from `allSauces` + each cuisine's
 *      `motherSauces` and `traditionalSauces`. Each node retains its origin
 *      (mother / traditional / global) and owning cuisine.
 *   2. Resolve declared parent → child edges using the `derivatives` and
 *      `variants` arrays, normalizing names against the node index.
 *   3. Group nodes into base families (tomato, dairy, egg-emulsion, soy /
 *      fermented, chile, herb, citrus, stock-reduction, nut-seed, other).
 *   4. For nodes without a declared parent, attach them to the highest-
 *      similarity ancestor in the same base family (preferring mother >
 *      traditional > global). Parent must beat a similarity floor.
 *   5. Compute fusion bridges across cuisines using ingredient Jaccard.
 */

import { cuisinesMap } from "@/data/cuisines";
import { allSauces } from "@/data/sauces";
import type { Cuisine } from "@/types/cuisine";

// ============================================================================
// Types
// ============================================================================

export type BaseFamily =
  | "tomato"
  | "dairy"
  | "egg-emulsion"
  | "soy-fermented"
  | "chile"
  | "herb"
  | "citrus"
  | "stock-reduction"
  | "nut-seed"
  | "vinegar"
  | "yogurt"
  | "meat-drippings"
  | "other";

export interface SauceNode {
  id: string;
  name: string;
  /** "mother" | "traditional" | "global" | "variant-only" */
  origin: "mother" | "traditional" | "global" | "variant-only";
  cuisine?: string;
  base?: string;
  baseFamily: BaseFamily;
  description?: string;
  keyIngredients: string[];
  /** Lowercased + light-stemmed token set used for similarity. */
  ingredientTokens: Set<string>;
  declaredVariants: string[];
  declaredDerivatives: string[];
  astrologicalInfluences: string[];
  seasonality?: string;
  difficulty?: string;
  preparationNotes?: string;
  technicalTips?: string;
  dataKey?: string;
}

export interface VariantLeaf {
  /** Stable id, derived from parent + variant name */
  id: string;
  /** Display name from the parent's variants/derivatives string */
  name: string;
  /** Parent sauce id */
  parentId: string;
  /** Cuisine inherited from the parent (best-effort) */
  cuisine?: string;
}

export interface LineageEdge {
  parentId: string;
  childId: string;
  /** "declared" via variants/derivatives, or "inferred" via similarity */
  reason: "declared-variant" | "declared-derivative" | "inferred-similarity";
  /** Jaccard similarity (0-1) between parent and child ingredients */
  similarity: number;
}

export interface FusionBridge {
  fromId: string;
  toId: string;
  similarity: number;
  shared: string[];
  fromUnique: string[];
  toUnique: string[];
}

export interface BaseFamilyTree {
  family: BaseFamily;
  label: string;
  description: string;
  /** Roots in display order (mother sauces first, then most-central). */
  roots: SauceNode[];
  /** Total nodes in the family. */
  size: number;
  /** Distinct cuisines represented. */
  cuisines: string[];
}

export interface SauceForest {
  families: BaseFamilyTree[];
  nodes: Map<string, SauceNode>;
  variantLeaves: Map<string, VariantLeaf[]>; // parentId -> leaves
  childrenOf: Map<string, SauceNode[]>; // parentId -> child nodes
  parentOf: Map<string, string>; // childId -> parentId
  edges: LineageEdge[];
  fusionByNode: Map<string, FusionBridge[]>; // sauceId -> top bridges
}

// ============================================================================
// Normalization
// ============================================================================

const STEM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bsauces\b/g, "sauce"],
  [/\bonions\b/g, "onion"],
  [/\btomatoes\b/g, "tomato"],
  [/\bchiles\b/g, "chile"],
  [/\bchilies\b/g, "chile"],
  [/\bchillies\b/g, "chile"],
  [/\bchilis\b/g, "chile"],
  [/\bchili\b/g, "chile"],
  [/\bpeppers\b/g, "pepper"],
  [/\bnuts\b/g, "nut"],
  [/\bbeans\b/g, "bean"],
  [/\bseeds\b/g, "seed"],
  [/\bcloves\b/g, "clove"],
  [/\bleaves\b/g, "leaf"],
  [/\beggs\b/g, "egg"],
  [/\bgrains\b/g, "grain"],
  [/\bherbs\b/g, "herb"],
  [/\bmushrooms\b/g, "mushroom"],
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  let n = norm(s);
  for (const [re, rep] of STEM_REPLACEMENTS) n = n.replace(re, rep);
  // Drop stop-words and small fragments
  const STOP = new Set([
    "and", "or", "the", "of", "for", "to", "with", "in", "on", "a", "an",
    "fresh", "ground", "minced", "chopped", "sliced", "whole", "raw", "dried",
    "fine", "coarse", "freshly", "extra", "virgin", "sea", "kosher",
    "lightly", "toasted", "small", "large", "medium", "good", "high", "low",
    "quality", "optional", "unsalted", "salted", "hot", "warm", "cold",
    "preferably", "or", "best", "for", "very", "lots", "much",
  ]);
  return n
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

function buildIngredientTokens(keyIngredients: string[]): Set<string> {
  const out = new Set<string>();
  for (const ing of keyIngredients) {
    for (const tok of tokenize(ing)) out.add(tok);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const v of a) if (b.has(v)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ============================================================================
// Base family classification
// ============================================================================

const FAMILY_DEFINITIONS: Array<{
  family: BaseFamily;
  label: string;
  description: string;
  keywords: RegExp;
}> = [
  {
    family: "tomato",
    label: "Tomato",
    description:
      "Acid-bright red sauces built on cooked tomatoes; pasta sauces, salsa rojas, romescos.",
    keywords: /\btomato/,
  },
  {
    family: "dairy",
    label: "Dairy / Roux",
    description:
      "Butter, milk, cream and roux-thickened white and cream sauces — Béchamel and its descendants worldwide.",
    keywords: /\b(milk|dairy|cream|buttermilk|yogurt cream|butter\b)/,
  },
  {
    family: "egg-emulsion",
    label: "Egg Emulsion",
    description:
      "Yolk-bound emulsions: Hollandaise, Béarnaise, mayonnaise, aioli, Carbonara.",
    keywords: /\b(egg|clarified butter|mayonnaise)/,
  },
  {
    family: "soy-fermented",
    label: "Soy / Fermented",
    description:
      "Long-fermented umami sauces: shoyu, miso, doenjang, tamari, fish sauce, oyster.",
    keywords:
      /\b(soy|soybean|fermented|miso|doenjang|gochujang|fish sauce|oyster|black bean|anchovy)/,
  },
  {
    family: "chile",
    label: "Chile",
    description:
      "Dried- and fresh-chile-driven sauces: salsa rojas, mole, harissa, sambal, adobo.",
    keywords: /\b(chile|chili|pepper|hot pepper|gochujang|sambal|harissa)/,
  },
  {
    family: "herb",
    label: "Herb",
    description:
      "Fresh-herb forward sauces: pesto, salsa verde, chimichurri, gremolata.",
    keywords: /\b(basil|herb|cilantro|parsley|mint|fresh herbs|herbs)/,
  },
  {
    family: "citrus",
    label: "Citrus",
    description:
      "Juice-bright citrus emulsions and dressings: ponzu, lemon, yuzu, salmoriglio.",
    keywords: /\b(citrus|lemon|lime|yuzu|sudachi|orange|mandarin|tomatillo)/,
  },
  {
    family: "stock-reduction",
    label: "Stock Reduction",
    description:
      "Stock- and meat-juice-reduced sauces: velouté, espagnole, demi-glace, jus.",
    keywords: /\b(stock|broth|dashi|bone|jus|meat|drip|reduction|brown stock)/,
  },
  {
    family: "nut-seed",
    label: "Nut / Seed",
    description:
      "Nut- and seed-thickened sauces: pipián, romesco, satay, tahini-based, pesto-of-trapani.",
    keywords: /\b(seed|sesame|peanut|almond|pine nut|nut|tahini|chickpea|pumpkin seed)/,
  },
  {
    family: "vinegar",
    label: "Vinegar",
    description:
      "Vinegar-led sweet/sour and cured sauces: agrodolce, mignonette, pickle-base.",
    keywords: /\bvinegar/,
  },
  {
    family: "yogurt",
    label: "Yogurt",
    description:
      "Cultured yogurt sauces: tzatziki, raita, labneh.",
    keywords: /\byogurt/,
  },
  {
    family: "meat-drippings",
    label: "Meat & Drippings",
    description:
      "Meat-rendered, ragù-style and pan-juice sauces.",
    keywords: /\b(meat|drip|gravy|ragu|ragù)/,
  },
];

function classifyBase(base: string | undefined, keyIngredients: string[]): BaseFamily {
  const text = `${base ?? ""} ${keyIngredients.join(" ")}`;
  const lower = norm(text);
  for (const def of FAMILY_DEFINITIONS) {
    if (def.keywords.test(lower)) return def.family;
  }
  return "other";
}

const FAMILY_LABEL: Record<BaseFamily, string> = Object.fromEntries(
  [...FAMILY_DEFINITIONS, { family: "other", label: "Other", description: "Misc.", keywords: /.*/ }].map(
    (d) => [d.family, d.label],
  ),
) as Record<BaseFamily, string>;

const FAMILY_DESCRIPTION: Record<BaseFamily, string> = Object.fromEntries(
  [
    ...FAMILY_DEFINITIONS,
    {
      family: "other",
      label: "Other",
      description: "Sauces whose base does not cleanly match the canonical families.",
      keywords: /.*/,
    },
  ].map((d) => [d.family, d.description]),
) as Record<BaseFamily, string>;

// ============================================================================
// Node collection
// ============================================================================

function makeId(parts: string[]): string {
  return parts.map((p) => norm(p).replace(/\s+/g, "-")).join(":");
}

function buildNode(args: {
  rawId: string;
  name: string;
  origin: SauceNode["origin"];
  cuisine?: string;
  base?: string;
  description?: string;
  keyIngredients?: string[];
  variants?: string[];
  derivatives?: string[];
  astrologicalInfluences?: string[];
  seasonality?: string;
  difficulty?: string;
  preparationNotes?: string;
  technicalTips?: string;
  dataKey?: string;
}): SauceNode {
  const keyIngredients = args.keyIngredients ?? [];
  return {
    id: args.rawId,
    name: args.name,
    origin: args.origin,
    cuisine: args.cuisine,
    base: args.base,
    baseFamily: classifyBase(args.base, keyIngredients),
    description: args.description,
    keyIngredients,
    ingredientTokens: buildIngredientTokens(keyIngredients),
    declaredVariants: args.variants ?? [],
    declaredDerivatives: args.derivatives ?? [],
    astrologicalInfluences: args.astrologicalInfluences ?? [],
    seasonality: args.seasonality,
    difficulty: args.difficulty,
    preparationNotes: args.preparationNotes,
    technicalTips: args.technicalTips,
    dataKey: args.dataKey,
  };
}

function collectNodes(): { nodes: Map<string, SauceNode>; nameIndex: Map<string, SauceNode> } {
  const nodes = new Map<string, SauceNode>();
  const nameIndex = new Map<string, SauceNode>();

  // 1) Per-cuisine mother + traditional sauces
  for (const [cuisineKey, cuisine] of Object.entries(cuisinesMap as Record<string, Cuisine>)) {
    if (!cuisine || typeof cuisine !== "object") continue;

    if (cuisine.motherSauces) {
      for (const [k, raw] of Object.entries(cuisine.motherSauces)) {
        const r: any = raw ?? {};
        const id = makeId([cuisineKey, "mother", k]);
        const node = buildNode({
          rawId: id,
          name: r.name ?? k,
          origin: "mother",
          cuisine: cuisine.name ?? cuisineKey,
          base: r.base,
          description: r.description,
          keyIngredients: r.keyIngredients,
          derivatives: r.derivatives,
          variants: r.variants,
          astrologicalInfluences: r.astrologicalInfluences,
          seasonality: r.seasonality,
          difficulty: r.difficulty,
          preparationNotes: r.preparationNotes,
          technicalTips: r.technicalTips,
        });
        if (!nodes.has(id)) {
          nodes.set(id, node);
          nameIndex.set(norm(node.name), node);
        }
      }
    }

    if (cuisine.traditionalSauces) {
      for (const [k, raw] of Object.entries(cuisine.traditionalSauces)) {
        const r: any = raw ?? {};
        const nameKey = norm(r.name ?? k);
        // Skip if a same-name mother sauce already exists in this cuisine
        if (nameIndex.has(nameKey) && nameIndex.get(nameKey)!.cuisine === (cuisine.name ?? cuisineKey)) {
          continue;
        }
        const id = makeId([cuisineKey, "traditional", k]);
        const node = buildNode({
          rawId: id,
          name: r.name ?? k,
          origin: "traditional",
          cuisine: cuisine.name ?? cuisineKey,
          base: r.base,
          description: r.description,
          keyIngredients: r.keyIngredients,
          variants: r.variants ?? r.derivatives,
          astrologicalInfluences: r.astrologicalInfluences,
          seasonality: r.seasonality,
          difficulty: r.difficulty,
          preparationNotes: r.preparationNotes,
          technicalTips: r.technicalTips,
        });
        nodes.set(id, node);
        if (!nameIndex.has(nameKey)) nameIndex.set(nameKey, node);
      }
    }
  }

  // 2) Global sauces — only add if no node with same normalized name yet
  for (const [key, sauce] of Object.entries(allSauces)) {
    const nameKey = norm(sauce.name);
    if (nameIndex.has(nameKey)) continue;
    const id = makeId(["global", key]);
    const node = buildNode({
      rawId: id,
      name: sauce.name,
      origin: "global",
      cuisine: sauce.cuisine,
      base: sauce.base,
      description: sauce.description,
      keyIngredients: sauce.keyIngredients,
      variants: sauce.variants,
      astrologicalInfluences: sauce.astrologicalInfluences,
      seasonality: sauce.seasonality,
      difficulty: sauce.difficulty,
      preparationNotes: sauce.preparationNotes,
      technicalTips: sauce.technicalTips,
      dataKey: key,
    });
    nodes.set(id, node);
    nameIndex.set(nameKey, node);
  }

  return { nodes, nameIndex };
}

// ============================================================================
// Edge derivation
// ============================================================================

function findNodeByName(name: string, nameIndex: Map<string, SauceNode>): SauceNode | undefined {
  const n = norm(name);
  if (nameIndex.has(n)) return nameIndex.get(n);
  // Loose: substring match
  for (const [k, v] of nameIndex) {
    if (k.includes(n) || n.includes(k)) return v;
  }
  return undefined;
}

interface EdgeDerivation {
  parentOf: Map<string, string>;
  childrenOf: Map<string, SauceNode[]>;
  variantLeaves: Map<string, VariantLeaf[]>;
  edges: LineageEdge[];
}

function deriveEdges(
  nodes: Map<string, SauceNode>,
  nameIndex: Map<string, SauceNode>,
  options: { similarityFloor: number },
): EdgeDerivation {
  const parentOf = new Map<string, string>();
  const childrenOf = new Map<string, SauceNode[]>();
  const variantLeaves = new Map<string, VariantLeaf[]>();
  const edges: LineageEdge[] = [];

  const addChild = (parent: SauceNode, child: SauceNode, edge: LineageEdge) => {
    if (parentOf.has(child.id)) return; // single-parent invariant
    if (parent.id === child.id) return;
    parentOf.set(child.id, parent.id);
    if (!childrenOf.has(parent.id)) childrenOf.set(parent.id, []);
    childrenOf.get(parent.id)!.push(child);
    edges.push(edge);
  };

  // Pass 1 — declared edges
  for (const node of nodes.values()) {
    const declared = [
      ...node.declaredDerivatives.map((s) => ({ s, reason: "declared-derivative" as const })),
      ...node.declaredVariants.map((s) => ({ s, reason: "declared-variant" as const })),
    ];
    for (const { s, reason } of declared) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      const matched = findNodeByName(trimmed, nameIndex);
      if (matched && matched.id !== node.id) {
        const sim = jaccard(node.ingredientTokens, matched.ingredientTokens);
        addChild(node, matched, {
          parentId: node.id,
          childId: matched.id,
          reason,
          similarity: sim,
        });
      } else {
        // Variant-only string leaf
        const leafId = makeId([node.id, "variant", trimmed]);
        if (!variantLeaves.has(node.id)) variantLeaves.set(node.id, []);
        const arr = variantLeaves.get(node.id)!;
        if (!arr.find((v) => v.id === leafId)) {
          arr.push({ id: leafId, name: trimmed, parentId: node.id, cuisine: node.cuisine });
        }
      }
    }
  }

  // Pass 2 — inferred edges by base family + ingredient similarity
  const ORIGIN_RANK: Record<SauceNode["origin"], number> = {
    mother: 3,
    traditional: 2,
    global: 1,
    "variant-only": 0,
  };

  // Group nodes by family for efficient pairwise comparison
  const byFamily = new Map<BaseFamily, SauceNode[]>();
  for (const node of nodes.values()) {
    if (!byFamily.has(node.baseFamily)) byFamily.set(node.baseFamily, []);
    byFamily.get(node.baseFamily)!.push(node);
  }

  for (const [, family] of byFamily) {
    for (const node of family) {
      if (parentOf.has(node.id) || node.origin === "mother") continue;
      // Find best ancestor candidate in the same family
      let best: { parent: SauceNode; sim: number } | null = null;
      for (const candidate of family) {
        if (candidate.id === node.id) continue;
        // Candidate must outrank child in origin so the tree flows mother → traditional → global
        if (ORIGIN_RANK[candidate.origin] < ORIGIN_RANK[node.origin]) continue;
        if (
          ORIGIN_RANK[candidate.origin] === ORIGIN_RANK[node.origin] &&
          candidate.cuisine !== node.cuisine
        ) {
          // same-rank cross-cuisine cannot be parent — bridge instead
          continue;
        }
        const sim = jaccard(node.ingredientTokens, candidate.ingredientTokens);
        if (sim < options.similarityFloor) continue;
        if (!best || sim > best.sim) best = { parent: candidate, sim };
      }
      if (best) {
        // Avoid creating cycles
        let p: string | undefined = best.parent.id;
        const seen = new Set<string>([node.id]);
        while (p) {
          if (seen.has(p)) {
            best = null;
            break;
          }
          seen.add(p);
          p = parentOf.get(p);
        }
        if (best) {
          addChild(best.parent, node, {
            parentId: best.parent.id,
            childId: node.id,
            reason: "inferred-similarity",
            similarity: best.sim,
          });
        }
      }
    }
  }

  return { parentOf, childrenOf, variantLeaves, edges };
}

// ============================================================================
// Fusion bridges
// ============================================================================

function buildFusionBridges(
  nodes: Map<string, SauceNode>,
  options: { similarityFloor: number; perNodeLimit: number },
): Map<string, FusionBridge[]> {
  const bridgesByNode = new Map<string, FusionBridge[]>();
  const arr = Array.from(nodes.values());

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const a = arr[i];
      const b = arr[j];
      if (!a.cuisine || !b.cuisine) continue;
      if (a.cuisine === b.cuisine) continue;
      const sim = jaccard(a.ingredientTokens, b.ingredientTokens);
      if (sim < options.similarityFloor) continue;

      const shared: string[] = [];
      const aOnly: string[] = [];
      const bOnly: string[] = [];
      for (const t of a.ingredientTokens) (b.ingredientTokens.has(t) ? shared : aOnly).push(t);
      for (const t of b.ingredientTokens) if (!a.ingredientTokens.has(t)) bOnly.push(t);

      const fwd: FusionBridge = {
        fromId: a.id,
        toId: b.id,
        similarity: sim,
        shared,
        fromUnique: aOnly,
        toUnique: bOnly,
      };
      const rev: FusionBridge = {
        fromId: b.id,
        toId: a.id,
        similarity: sim,
        shared,
        fromUnique: bOnly,
        toUnique: aOnly,
      };

      if (!bridgesByNode.has(a.id)) bridgesByNode.set(a.id, []);
      if (!bridgesByNode.has(b.id)) bridgesByNode.set(b.id, []);
      bridgesByNode.get(a.id)!.push(fwd);
      bridgesByNode.get(b.id)!.push(rev);
    }
  }

  // Trim each list to top N by similarity
  for (const [k, list] of bridgesByNode) {
    list.sort((x, y) => y.similarity - x.similarity);
    bridgesByNode.set(k, list.slice(0, options.perNodeLimit));
  }
  return bridgesByNode;
}

// ============================================================================
// Forest assembly
// ============================================================================

function assembleForest(
  nodes: Map<string, SauceNode>,
  parentOf: Map<string, string>,
  childrenOf: Map<string, SauceNode[]>,
  bridgesByNode: Map<string, FusionBridge[]>,
  edges: LineageEdge[],
  variantLeaves: Map<string, VariantLeaf[]>,
): SauceForest {
  // Roots = nodes with no parent
  const roots: SauceNode[] = [];
  for (const node of nodes.values()) if (!parentOf.has(node.id)) roots.push(node);

  // Group by family
  const byFamily = new Map<BaseFamily, SauceNode[]>();
  for (const node of nodes.values()) {
    if (!byFamily.has(node.baseFamily)) byFamily.set(node.baseFamily, []);
    byFamily.get(node.baseFamily)!.push(node);
  }

  const families: BaseFamilyTree[] = [];
  const familyOrder: BaseFamily[] = [
    "tomato",
    "dairy",
    "egg-emulsion",
    "stock-reduction",
    "soy-fermented",
    "chile",
    "herb",
    "nut-seed",
    "citrus",
    "yogurt",
    "vinegar",
    "meat-drippings",
    "other",
  ];
  for (const f of familyOrder) {
    const all = byFamily.get(f) ?? [];
    if (all.length === 0) continue;
    const familyRoots = roots.filter((r) => r.baseFamily === f);
    // Order roots: mother sauces first, then by descendant count, then by name
    familyRoots.sort((a, b) => {
      const aMother = a.origin === "mother" ? 1 : 0;
      const bMother = b.origin === "mother" ? 1 : 0;
      if (aMother !== bMother) return bMother - aMother;
      const aKids = (childrenOf.get(a.id) ?? []).length;
      const bKids = (childrenOf.get(b.id) ?? []).length;
      if (aKids !== bKids) return bKids - aKids;
      return a.name.localeCompare(b.name);
    });
    const cuisines = Array.from(new Set(all.map((n) => n.cuisine).filter(Boolean) as string[]));
    families.push({
      family: f,
      label: FAMILY_LABEL[f],
      description: FAMILY_DESCRIPTION[f],
      roots: familyRoots,
      size: all.length,
      cuisines: cuisines.sort(),
    });
  }

  // Sort children alphabetically inside each parent
  for (const [, kids] of childrenOf) kids.sort((a, b) => a.name.localeCompare(b.name));

  return {
    families,
    nodes,
    variantLeaves,
    childrenOf,
    parentOf,
    edges,
    fusionByNode: bridgesByNode,
  };
}

// ============================================================================
// Public API (memoized)
// ============================================================================

let _cached: SauceForest | null = null;

/** Build (or return cached) sauce forest. Idempotent across calls. */
export function getSauceForest(): SauceForest {
  if (_cached) return _cached;
  const { nodes, nameIndex } = collectNodes();
  const { parentOf, childrenOf, variantLeaves, edges } = deriveEdges(nodes, nameIndex, {
    similarityFloor: 0.18,
  });
  const fusionByNode = buildFusionBridges(nodes, {
    similarityFloor: 0.22,
    perNodeLimit: 5,
  });
  _cached = assembleForest(nodes, parentOf, childrenOf, bridgesByNode(fusionByNode), edges, variantLeaves);
  return _cached;
}

function bridgesByNode(m: Map<string, FusionBridge[]>): Map<string, FusionBridge[]> {
  return m;
}

/** Walk parent chain back to a root, ending in [root, ..., node]. */
export function getLineage(forest: SauceForest, nodeId: string): SauceNode[] {
  const out: SauceNode[] = [];
  let id: string | undefined = nodeId;
  const seen = new Set<string>();
  while (id && !seen.has(id)) {
    seen.add(id);
    const node = forest.nodes.get(id);
    if (!node) break;
    out.unshift(node);
    id = forest.parentOf.get(id);
  }
  return out;
}

export interface DivergenceReport {
  inherited: string[]; // tokens shared with parent
  added: string[]; // tokens unique to child
  dropped: string[]; // tokens unique to parent
  similarity: number;
}

export function getDivergence(
  forest: SauceForest,
  nodeId: string,
): DivergenceReport | null {
  const node = forest.nodes.get(nodeId);
  if (!node) return null;
  const parentId = forest.parentOf.get(nodeId);
  if (!parentId) return null;
  const parent = forest.nodes.get(parentId);
  if (!parent) return null;
  const inherited: string[] = [];
  const added: string[] = [];
  const dropped: string[] = [];
  for (const t of node.ingredientTokens) {
    (parent.ingredientTokens.has(t) ? inherited : added).push(t);
  }
  for (const t of parent.ingredientTokens) {
    if (!node.ingredientTokens.has(t)) dropped.push(t);
  }
  return {
    inherited,
    added,
    dropped,
    similarity: jaccard(node.ingredientTokens, parent.ingredientTokens),
  };
}

export function getFusionBridges(forest: SauceForest, nodeId: string): FusionBridge[] {
  return forest.fusionByNode.get(nodeId) ?? [];
}

export function getNode(forest: SauceForest, nodeId: string): SauceNode | undefined {
  return forest.nodes.get(nodeId);
}

export function getChildren(forest: SauceForest, nodeId: string): SauceNode[] {
  return forest.childrenOf.get(nodeId) ?? [];
}

export function getVariantLeaves(forest: SauceForest, nodeId: string): VariantLeaf[] {
  return forest.variantLeaves.get(nodeId) ?? [];
}

/**
 * Search nodes by free text. Matches name, cuisine, base, key ingredients.
 * Returns matches sorted by relevance.
 */
export function searchNodes(forest: SauceForest, query: string): SauceNode[] {
  const q = norm(query).trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const scored: Array<{ node: SauceNode; score: number }> = [];
  for (const node of forest.nodes.values()) {
    const haystack = norm(
      [
        node.name,
        node.cuisine ?? "",
        node.base ?? "",
        ...node.keyIngredients,
        node.description ?? "",
      ].join(" "),
    );
    let score = 0;
    let allHit = true;
    for (const t of tokens) {
      if (haystack.includes(t)) score += 1;
      else allHit = false;
    }
    if (allHit && score > 0) {
      // Exact name match boost
      if (norm(node.name).includes(q)) score += 5;
      scored.push({ node, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20).map((s) => s.node);
}

export const FAMILY_LABELS = FAMILY_LABEL;
export const FAMILY_DESCRIPTIONS = FAMILY_DESCRIPTION;
