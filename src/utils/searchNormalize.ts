/**
 * Shared search-normalization helpers.
 *
 * Every user-facing search bar in the app routes its string matching through
 * this module so the same query — "oat_milk", "oat-milk", "oatmilk", or
 * "Oat Milk!" — produces consistent results regardless of which surface the
 * user is searching (ingredients, recipes, cuisines, sauces, pantry, admin).
 *
 * @file src/utils/searchNormalize.ts
 */

/**
 * Lowercases, collapses separators (`_`, `-`) and runs of whitespace,
 * strips non-alphanumerics, and trims. Preserves single spaces between tokens.
 *
 *   "Oat Milk!"  -> "oat milk"
 *   "oat_milk"   -> "oat milk"
 *   "oat-milk"   -> "oat milk"
 */
export function normalizeForMatch(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Same as `normalizeForMatch` but strips spaces as well — useful when a query
 * like "oatmilk" should hit an item stored as "oat milk".
 */
export function compactNormalize(s: string | null | undefined): string {
  return normalizeForMatch(s).replace(/\s+/g, "");
}

/**
 * Separator-tolerant `includes`: returns true when `query` appears anywhere
 * in `target`, regardless of whether either side uses spaces, hyphens, or
 * underscores. Empty queries return true so callers can short-circuit.
 */
export function looseIncludes(
  target: string | null | undefined,
  query: string | null | undefined,
): boolean {
  const q = normalizeForMatch(query);
  if (!q) return true;
  const t = normalizeForMatch(target);
  if (!t) return false;
  if (t.includes(q)) return true;
  const qc = q.replace(/\s+/g, "");
  const tc = t.replace(/\s+/g, "");
  return tc.includes(qc);
}

/**
 * Fuzzy score against a list of candidate strings. Lower is a better match;
 * -1 means no match. Useful when callers want to sort: pass any number of
 * fields (name, id, aliases, tags) and the function returns the best score.
 *
 * Score tiers:
 *   0     exact match (normalized)
 *   0     startsWith match
 *   1     contains match
 *   2+n   character-subsequence match with `n` gaps
 *   -1    no match
 */
export function fuzzyScore(
  query: string,
  candidates: ReadonlyArray<string | null | undefined>,
): number {
  const qNorm = normalizeForMatch(query);
  if (!qNorm) return -1;
  const qCompact = qNorm.replace(/\s+/g, "");

  let best = -1;
  for (const cand of candidates) {
    if (!cand) continue;
    const tNorm = normalizeForMatch(cand);
    if (!tNorm) continue;
    const tCompact = tNorm.replace(/\s+/g, "");

    let score = -1;
    if (tNorm === qNorm || tCompact === qCompact) {
      score = 0;
    } else if (tNorm.startsWith(qNorm) || tCompact.startsWith(qCompact)) {
      score = 0;
    } else if (tNorm.includes(qNorm) || tCompact.includes(qCompact)) {
      score = 1;
    } else {
      // Character-subsequence on the compact form
      let qi = 0;
      let gaps = 0;
      for (let ti = 0; ti < tCompact.length && qi < qCompact.length; ti++) {
        if (tCompact[ti] === qCompact[qi]) qi++;
        else if (qi > 0) gaps++;
      }
      if (qi === qCompact.length) score = 2 + gaps;
    }

    if (score !== -1 && (best === -1 || score < best)) best = score;
  }
  return best;
}

/**
 * Normalized 0..1 score (higher = better) version of `fuzzyScore`.
 * Returns 0 when nothing matches.
 *
 *   exact / startsWith  -> 0.9 - 1.0
 *   contains            -> 0.7
 *   subsequence         -> 0.1 - 0.5 (decays with gaps)
 */
export function fuzzyScoreNormalized(
  query: string,
  candidates: ReadonlyArray<string | null | undefined>,
): number {
  const qNorm = normalizeForMatch(query);
  if (!qNorm) return 0;
  const qCompact = qNorm.replace(/\s+/g, "");

  let best = 0;
  for (const cand of candidates) {
    if (!cand) continue;
    const tNorm = normalizeForMatch(cand);
    if (!tNorm) continue;
    const tCompact = tNorm.replace(/\s+/g, "");

    let score = 0;
    if (tNorm === qNorm || tCompact === qCompact) score = 1.0;
    else if (tNorm.startsWith(qNorm) || tCompact.startsWith(qCompact)) score = 0.9;
    else if (tNorm.includes(qNorm) || tCompact.includes(qCompact)) score = 0.7;
    else {
      let qi = 0;
      let matches = 0;
      for (let i = 0; i < tCompact.length && qi < qCompact.length; i++) {
        if (tCompact[i] === qCompact[qi]) {
          matches++;
          qi++;
        }
      }
      if (qi === qCompact.length && tCompact.length > 0) {
        score = (matches / tCompact.length) * 0.5;
      }
    }
    if (score > best) best = score;
  }
  return best;
}

/**
 * Tokenize a normalized string into words for set-based comparisons
 * (e.g. Jaccard). Filters out empty tokens.
 */
export function tokenize(s: string | null | undefined): string[] {
  const norm = normalizeForMatch(s);
  if (!norm) return [];
  return norm.split(" ").filter(Boolean);
}

/**
 * Jaccard similarity (0..1) over normalized token sets. Stable for short
 * search queries vs. long target strings.
 */
export function jaccardSimilarity(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 && bTokens.size === 0) return 0;
  let intersect = 0;
  for (const t of aTokens) if (bTokens.has(t)) intersect++;
  const union = aTokens.size + bTokens.size - intersect;
  return union > 0 ? intersect / union : 0;
}
