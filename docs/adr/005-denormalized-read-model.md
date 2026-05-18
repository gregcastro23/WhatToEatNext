# ADR-005: Denormalized `read_model` JSONB for Recipe Loads

**Status**: Accepted  
**Date**: 2026-04-15  
**Deciders**: Greg Castro  

---

## Context

Recipe pages were performing 8–12 queries per load:
1. Fetch recipe base row
2. Fetch elemental properties (JOIN)
3. Fetch ingredients (JOIN + N lookups)
4. Fetch cooking methods (JOIN)
5. Fetch cuisine metadata (JOIN)
6. Fetch tags (JOIN)
7. Fetch related recipes (subquery)
8. Fetch user save status (if auth'd)

With 500+ recipes and growing, this created N+1 patterns in the recommendation engine and page load times of 200–400ms even on Railway internal networking.

## Decision

Add a `read_model JSONB` column to the `recipes` table. This column stores the complete pre-joined representation of the recipe including elemental properties, ingredients with their properties, cuisine metadata, and tags.

```sql
ALTER TABLE recipes ADD COLUMN read_model JSONB;
```

The `read_model` is populated:
- At recipe creation/update via a DB trigger or service-layer write
- On-demand for recipes missing the column via `getServerRecipes()` with fallback to multi-query path

`getServerRecipes()` in `src/actions/recipes.ts` reads from `read_model` when available, falling back to the join path. The recommendation engine calls `getServerRecipes()` and benefits automatically.

**Result**: Sub-100ms recipe loads. Railway internal networking latency is sub-1ms for the single-column read.

## Consequences

**Positive:**
- Recipe page load: 200–400ms → <100ms
- Recommendation engine: eliminates N+1 on ingredient property lookup
- Simple to maintain — `read_model` is the authoritative denormalized view

**Negative:**
- `read_model` can become stale if a recipe's ingredients are updated without regenerating the model
- Must remember to update `read_model` in all recipe mutation paths
- JSONB column adds ~2–5KB per recipe row — negligible at current scale but worth monitoring at 10k+ recipes
- Schema validation on the JSONB shape is loose; a malformed `read_model` silently falls back to the join path

**Mitigation**: A `read_model_updated_at` timestamp column tracks staleness. Background job to regenerate stale models is planned but not yet implemented.
