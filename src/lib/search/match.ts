/**
 * Match tiers (plan §4.2): how well one normalized query matches one
 * normalized candidate string. Lower is better; null = no match.
 */
import { boundedEditDistance, type NormalizedText } from "./text";
import type { MatchTier } from "./types";

/**
 * Length floors, from plan §4.2. Below 4 characters an edit or a mid-word hit
 * matches noise ("in" is inside half the catalog); a second edit is allowed
 * only from 7, where two typos still leave most of the word intact.
 */
const MIN_MIDWORD_LENGTH = 4;
const MIN_FUZZY_LENGTH = 4;
const MIN_DISTANCE_2_LENGTH = 7;

/**
 * Tier 0. Compact equality is allowed only for exact matches ("oatmilk" =
 * "oat milk"), never as a prefix: compact prefixes made "tomatos" a prefix
 * of "tomatosauce".
 */
function isExact(query: NormalizedText, candidate: NormalizedText): boolean {
  return (
    query.folded === candidate.folded ||
    query.compact === candidate.compact ||
    query.stemmed === candidate.stemmed
  );
}

/** Every query word starts some candidate word ("sichuan noodles"). */
function wordsArePrefixes(query: NormalizedText, candidate: NormalizedText): boolean {
  return (
    query.tokens.length > 1 &&
    query.tokens.every((q) => candidate.tokens.some((c) => c.startsWith(q)))
  );
}

function fuzzyTier(query: NormalizedText, candidate: NormalizedText): MatchTier | null {
  const { length } = query.compact;
  if (length < MIN_FUZZY_LENGTH) return null;
  const max = length >= MIN_DISTANCE_2_LENGTH ? 2 : 1;
  // A one-word query may be a typo of any word in the name ("spinich" →
  // "baby spinach"); a multi-word query is compared whole.
  const targets = query.tokens.length === 1 ? [candidate.compact, ...candidate.tokens] : [candidate.compact];
  const distance = Math.min(...targets.map((t) => boundedEditDistance(query.compact, t, max)));
  if (distance <= 1) return 4;
  // boundedEditDistance returns max + 1 for "too far", so under a cap of 1
  // a 2 is that sentinel, not a real distance of 2.
  return max === 2 && distance === 2 ? 5 : null;
}

/** The query's (stemmed) words appear as whole, contiguous words: "egg" in "Scrambled Eggs". */
function containsWholeWords(query: NormalizedText, candidate: NormalizedText): boolean {
  return ` ${candidate.stemmed} `.includes(` ${query.stemmed} `);
}

/**
 * Whole words (tier 1) outrank word prefixes (tier 2): "egg" should reach
 * "Kasha with Egg" before "eggplant", and "dan dan" the Dan Dan Noodles before
 * "dangmyeon". A prefix still catches a word being typed ("spin" → spinach).
 */
export function matchTier(query: NormalizedText, candidate: NormalizedText): MatchTier | null {
  if (!query.folded || !candidate.folded) return null;
  if (isExact(query, candidate)) return 0;
  if (containsWholeWords(query, candidate)) return 1;
  if (` ${candidate.folded}`.includes(` ${query.folded}`) || wordsArePrefixes(query, candidate)) return 2;
  if (query.folded.length >= MIN_MIDWORD_LENGTH && candidate.folded.includes(query.folded)) return 3;
  return fuzzyTier(query, candidate);
}
