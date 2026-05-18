/**
 * Zod contracts for the Laboratory Dashboard "Modern Alchemist" redesign.
 *
 * These document the endpoint + read-model shapes the Dashboard page expects
 * from the backend. They serve as the authoritative source for parsing
 * responses on the frontend and as the contract backend should ship to.
 *
 * Items marked `// AWAITING BACKEND` are not yet implemented server-side.
 * Frontend uses these schemas as runtime guards (parse() throws on missing
 * fields, surfacing the gap as a UI error state) per locked-in decision #8.
 */

import { z } from "zod";

/* ─── Elemental + Alchemical primitives ───────────────────────────────────── */

export const ElementalAffinitySchema = z.enum(["fire", "water", "earth", "air"]);
export type ElementalAffinity = z.infer<typeof ElementalAffinitySchema>;

export const ElementalBalanceSchema = z.object({
  fire: z.number().min(0).max(1),
  water: z.number().min(0).max(1),
  earth: z.number().min(0).max(1),
  air: z.number().min(0).max(1),
});
export type ElementalBalance = z.infer<typeof ElementalBalanceSchema>;

export const ThermoSignatureSchema = z.object({
  spirit: z.number().min(0).max(1),
  essence: z.number().min(0).max(1),
  matter: z.number().min(0).max(1),
  substance: z.number().min(0).max(1),
});
export type ThermoSignature = z.infer<typeof ThermoSignatureSchema>;

/* ─── Recommended ingredients (Tier-I) ────────────────────────────────────── */
// AWAITING BACKEND: no `/api/recommendations/ingredients` endpoint exists yet.
// Today match_score is computed on-the-fly in RecommendationBridge.ts but
// not exposed as a standalone ranked list against the current sky × natal.
export const RecommendedIngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  category: z.string(),
  elemental_affinity: ElementalAffinitySchema,
  planet: z.string(),
  /** Hue 0-360 for card backdrop tint; deterministic per ingredient. */
  hue: z.number().min(0).max(360),
  /** 0-1 match score: f(transit_position, user.natal). */
  match_score: z.number().min(0).max(1),
  thermo: ThermoSignatureSchema,
});
export type RecommendedIngredient = z.infer<typeof RecommendedIngredientSchema>;

export const RecommendedIngredientsResponseSchema = z.object({
  generated_at: z.string(),
  hour_ruler: z.string(),
  ingredients: z.array(RecommendedIngredientSchema).min(1),
});
export type RecommendedIngredientsResponse = z.infer<typeof RecommendedIngredientsResponseSchema>;

/* ─── Cuisine signatures (Tier-III) ───────────────────────────────────────── */
// AWAITING BACKEND: data exists in backend/alchm_kitchen/data/json/cuisines.json
// but no HTTP endpoint serves it. Expected endpoint: GET /api/cuisines/signatures.
export const CuisineSignatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string(),
  match: z.number().min(0).max(1),
  /** Four-element signature [fire, water, earth, air] each 0-1. */
  signature: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});
export type CuisineSignature = z.infer<typeof CuisineSignatureSchema>;

export const CuisineSignaturesResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  cuisines: z.array(CuisineSignatureSchema),
});
export type CuisineSignaturesResponse = z.infer<typeof CuisineSignaturesResponseSchema>;

/* ─── Sauce lineage graph ─────────────────────────────────────────────────── */
// AWAITING BACKEND: data exists in sauces.json but no /api/sauces/lineage endpoint.
export const SauceLineageNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  /** Depth from root (0 = mother). */
  depth: z.number().int().nonnegative(),
});
export const SauceLineageEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});
export const SauceLineageResponseSchema = z.object({
  root: z.string(),
  nodes: z.array(SauceLineageNodeSchema),
  edges: z.array(SauceLineageEdgeSchema),
  stats: z.object({
    depth: z.number().int().nonnegative(),
    nodes: z.number().int().nonnegative(),
    variants: z.number().int().nonnegative(),
  }),
});
export type SauceLineageResponse = z.infer<typeof SauceLineageResponseSchema>;

/* ─── Tonight's composition ───────────────────────────────────────────────── */
// AWAITING BACKEND: planetary_agents composes this but there is no single
// endpoint returning the bundle. Expected: GET /api/composition/tonight.
export const TonightCompositionResponseSchema = z.object({
  recipe_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  elements: z.array(ElementalAffinitySchema).min(1),
  rulers: z.array(z.string()),
  cook_time_min: z.number().int().positive(),
  image_url: z.string().url().nullable(),
  procurement: z.object({
    item_count: z.number().int().positive(),
    total: z.string(), // "84.20"
    currency: z.string().default("USD"),
  }),
});
export type TonightCompositionResponse = z.infer<typeof TonightCompositionResponseSchema>;

/* ─── Service health (telemetry strip) ────────────────────────────────────── */
// Wirable today against `/api/health`, but the response shape is currently
// status-only and lacks per-service latency numbers. The Dashboard
// PipelinePanel ideally consumes the extended shape below.
export const HealthServiceSchema = z.object({
  name: z.string(),
  /** Round-trip latency string, e.g. "0.42ms" or "1.8s". */
  latency: z.string(),
  status: z.enum(["healthy", "degraded", "down"]),
  /** Whether this service is agent-backed (planetary_agents / Galileo). */
  agent: z.boolean().optional(),
});
export const HealthResponseExtendedSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  services: z.array(HealthServiceSchema).optional(),
  timestamp: z.string(),
});
export type HealthResponseExtended = z.infer<typeof HealthResponseExtendedSchema>;
