/**
 * Rank every entity against a query (plan §4.2, D4). Each ordering key is a
 * named rule; ties end in name order, so results are deterministic.
 */
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import { matchTier } from "./match";
import type { IndexedEntity, SearchIndex } from "./searchIndex";
import type { NormalizedText } from "./text";
import type { MatchVia, SearchEntity, SearchHit, SearchKind } from "./types";

const VIA_ORDER: Record<MatchVia, number> = { name: 0, term: 1, synonym: 2 };

/**
 * On equal tiers, destinations people navigate to (an ingredient, a cuisine, a
 * method) come before individual recipes, which are the most numerous kind.
 */
const KIND_ORDER: Record<SearchKind, number> = {
  ingredient: 0,
  cuisine: 1,
  method: 2,
  sauce: 3,
  recipe: 4,
};

type Match = Pick<SearchHit, "tier" | "via" | "matched">;

function bestMatch(entity: IndexedEntity, query: NormalizedText): Match | null {
  let best: Match | null = null;
  for (const { text, via, label } of entity.texts) {
    const tier = matchTier(query, text);
    if (tier === null) continue;
    if (best === null || tier < best.tier || (tier === best.tier && VIA_ORDER[via] < VIA_ORDER[best.via])) {
      best = { tier, via, matched: label };
    }
  }
  return best;
}

export function compareHits(a: SearchHit, b: SearchHit): number {
  return (
    a.tier - b.tier ||
    VIA_ORDER[a.via] - VIA_ORDER[b.via] ||
    KIND_ORDER[a.entity.kind] - KIND_ORDER[b.entity.kind] ||
    a.entity.name.length - b.entity.name.length ||
    a.entity.name.localeCompare(b.entity.name)
  );
}

function hitKey(hit: SearchHit): string {
  return `${hit.entity.kind}:${hit.entity.key}`;
}

/** A synonym match surfaces its canonical ingredient, marked via "synonym". */
function synonymHits(index: SearchIndex, query: NormalizedText): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const { text, canonical, term } of index.synonyms) {
    const tier = matchTier(query, text);
    const record = index.ingredients.get(canonical);
    if (tier === null || !record) continue;
    const entity: SearchEntity = { kind: "ingredient", key: record.key, name: record.name, href: ingredientHref(record.slug) };
    hits.push({ entity, tier, via: "synonym", matched: term });
  }
  return hits;
}

export function rankEntities(index: SearchIndex, query: NormalizedText): SearchHit[] {
  const best = new Map<string, SearchHit>();
  const consider = (hit: SearchHit): void => {
    const prior = best.get(hitKey(hit));
    if (!prior || compareHits(hit, prior) < 0) best.set(hitKey(hit), hit);
  };
  for (const entity of index.entities) {
    const match = bestMatch(entity, query);
    if (match) consider({ entity: entity.entity, ...match });
  }
  synonymHits(index, query).forEach(consider);
  return [...best.values()].sort(compareHits);
}
