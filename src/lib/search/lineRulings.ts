/**
 * Curated reverse-index tables for false-compound aliases, class heads, and
 * meat cuts without dedicated cards (docs/plans/reverse-index-rulings.md
 * Rulings 5, 7, 8, 15, and 17).
 *
 * Every entry records an explicit `basis`. `lineRulingsCorpus.test.ts` verifies
 * that every non-null card key resolves to a real catalog ingredient and every
 * row is still exercised by the static recipe corpus (no stale rows).
 */
import { normalizeText } from "./text";

export interface FalseCompoundAlias {
  phrase: string;
  target: string | null;
  basis: string;
}

export interface ClassHeadRule {
  modifier: string;
  head: string;
  winner: string;
  basis: string;
}

export interface MeatCutRule {
  cut: string;
  target: string;
  basis: string;
}

export const FALSE_COMPOUND_ALIASES: readonly FalseCompoundAlias[] = [
  {
    phrase: "brown turkey figs",
    target: "fig",
    basis: "Ruling 8: Brown Turkey is a fig cultivar (Ficus carica), not turkey poultry",
  },
  {
    phrase: "mustard greens",
    target: null,
    basis: "Ruling 8: Brassica juncea leafy greens are not yellow mustard condiment; no mustard-greens card exists yet",
  },
  {
    phrase: "water spinach",
    target: null,
    basis: "Ruling 8: Ipomoea aquatica (morning glory / ong choy) is unrelated to Spinacia oleracea spinach; no card exists yet",
  },
  {
    phrase: "white bread flour",
    target: "flour",
    basis: "Ruling 8: white bread flour is high-protein wheat flour for bread baking, not flour milled from white bread",
  },
  {
    phrase: "pomegranate molasses",
    target: "pomegranate",
    basis: "Ruling 8: pomegranate molasses (dibs rumman) is reduced pomegranate juice with no sugarcane molasses",
  },
];

export const CLASS_HEAD_RULES: readonly ClassHeadRule[] = [
  {
    modifier: "jalapeno",
    head: "pepper",
    winner: "jalapenos",
    basis: "Ruling 5: jalapeño is the specific chili; pepper is the class head",
  },
  {
    modifier: "parmesan",
    head: "cheese",
    winner: "parmesan",
    basis: "Ruling 5: parmesan is the specific cheese; cheese is the class head",
  },
  {
    modifier: "semolina",
    head: "flour",
    winner: "semolina",
    basis: "Ruling 5: semolina is already coarse durum wheat flour; flour is a class head (non-derived)",
  },
  {
    modifier: "pistachio",
    head: "nut",
    winner: "pistachios",
    basis: "Ruling 5: pistachio is the specific nut; nuts is the class head",
  },
  {
    modifier: "potato starch",
    head: "flour",
    winner: "potato_starch",
    basis: "Ruling 5: potato starch is the specific card; flour is a redundant class head",
  },
  {
    modifier: "tapioca starch",
    head: "flour",
    winner: "tapioca_starch",
    basis: "Ruling 5: tapioca starch is the specific card; flour is a redundant class head",
  },
  {
    modifier: "strong espresso",
    head: "coffee",
    winner: "strong_espresso",
    basis: "Ruling 5: strong espresso is the specific card; coffee is the class head",
  },
  {
    modifier: "grape",
    head: "tomato",
    winner: "tomato",
    basis: "Ruling 5: grape is a tomato shape/variety descriptor, not grape fruit; tomato head wins",
  },
  {
    modifier: "napa cabbage",
    head: "kimchi",
    winner: "kimchi",
    basis: "Ruling 5: napa cabbage specifies the base vegetable of baechu-kimchi; kimchi head wins",
  },
  {
    modifier: "lemongrass",
    head: "pork",
    winner: "pork",
    basis: "Ruling 5: lemongrass is the marinade flavoring; pork protein head wins",
  },
  {
    modifier: "honey mustard",
    head: "yogurt",
    winner: "yogurt",
    basis: "Ruling 5: honey-mustard is the flavoring; yogurt head wins",
  },
  {
    modifier: "whole milk",
    head: "yogurt",
    winner: "yogurt",
    basis: "Ruling 5: whole-milk specifies fat level of yogurt; yogurt head wins",
  },
  {
    modifier: "barley",
    head: "miso",
    winner: "miso",
    basis: "Ruling 5: barley (mugi) specifies the fermenting grain; miso head wins",
  },
];

export const MEAT_CUT_RULES: readonly MeatCutRule[] = [
  {
    cut: "ribeye",
    target: "beef",
    basis: "Ruling 7: ribeye is a beef primal cut with no dedicated cut card",
  },
  {
    cut: "ox",
    target: "beef",
    basis: "Ruling 7: ox/oxtail bones come from cattle (beef) with no dedicated cut card",
  },
  {
    cut: "cooked ham",
    target: "ham",
    basis: "Ruling 7: cooked ham maps to the dedicated ham cut card (3-letter slug is below 4-char index containment)",
  },
  {
    cut: "salmon",
    target: "atlantic_salmon",
    basis: "Ruling 7: uncarded salmon cuts and preparations (fillet, smoked, sashimi-grade) resolve to the atlantic_salmon (Salmon) card",
  },
];

const CLAUSE_SPLIT = /[,;()/]/;
const PAREN_BLOCK_RE = /\([^)]*\)/g;
const PAREN_CAPTURE_RE = /\(([^)]*)\)/g;

/**
 * Plural-only folding matching `lineAudit.ts`: avoids stripping "-ed" so
 * "salted" never folds to "salt".
 */
export function singularRuleToken(token: string): string {
  if (token.length <= 3 || /(ss|us)$/.test(token)) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (/(oes|ches|shes|xes)$/.test(token)) return token.slice(0, -2);
  return token.endsWith("s") ? token.slice(0, -1) : token;
}

export function foldRuleTokens(text: string): readonly string[] {
  return normalizeText(text).tokens.map(singularRuleToken);
}

export function hasTokenRun(tokens: readonly string[], target: readonly string[]): boolean {
  if (target.length === 0 || tokens.length < target.length) return false;
  for (let i = 0; i <= tokens.length - target.length; i++) {
    let matched = true;
    for (let j = 0; j < target.length; j++) {
      if (tokens[i + j] !== target[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

interface CompiledRule<T> {
  rule: T;
  tokens: readonly string[];
}

const COMPILED_FALSE_COMPOUNDS: ReadonlyArray<CompiledRule<FalseCompoundAlias>> =
  FALSE_COMPOUND_ALIASES.map((rule) => ({
    rule,
    tokens: foldRuleTokens(rule.phrase),
  }));

const COMPILED_CLASS_HEADS: ReadonlyArray<CompiledRule<ClassHeadRule>> =
  CLASS_HEAD_RULES.map((rule) => ({
    rule,
    tokens: [...foldRuleTokens(rule.modifier), ...foldRuleTokens(rule.head)],
  }));

const COMPILED_MEAT_CUTS: ReadonlyArray<CompiledRule<MeatCutRule>> =
  MEAT_CUT_RULES.map((rule) => ({
    rule,
    tokens: foldRuleTokens(rule.cut),
  }));

function matchLongestRule<T>(text: string, compiled: ReadonlyArray<CompiledRule<T>>): T | null {
  let bestLen = 0;
  let bestRule: T | null = null;
  for (const clause of text.split(CLAUSE_SPLIT)) {
    const tokens = foldRuleTokens(clause);
    for (const entry of compiled) {
      if (entry.tokens.length > bestLen && hasTokenRun(tokens, entry.tokens)) {
        bestLen = entry.tokens.length;
        bestRule = entry.rule;
      }
    }
  }
  return bestRule;
}

export function matchFalseCompound(text: string): FalseCompoundAlias | null {
  return matchLongestRule(text, COMPILED_FALSE_COMPOUNDS);
}

export function matchClassHead(text: string): ClassHeadRule | null {
  return matchLongestRule(text, COMPILED_CLASS_HEADS);
}

export function matchMeatCut(text: string): MeatCutRule | null {
  return matchLongestRule(text, COMPILED_MEAT_CUTS);
}

/** Ruling 15: strip parenthetical glosses so outside text decides first. */
export function stripParentheses(text: string): string {
  return text.replace(PAREN_BLOCK_RE, " ").replace(/\s+/g, " ").trim();
}

/** Ruling 15: extract non-empty parenthetical glosses in left-to-right order. */
export function extractParentheses(text: string): string[] {
  const glosses: string[] = [];
  for (const match of text.matchAll(PAREN_CAPTURE_RE)) {
    const inner = match[1]?.trim();
    if (inner) glosses.push(inner);
  }
  return glosses;
}
