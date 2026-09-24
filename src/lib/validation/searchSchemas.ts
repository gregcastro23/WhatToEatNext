/**
 * Wire contract for GET /api/search (omnibar Phase 2, issue #870).
 *
 * Recipe rows are text-only: name, cuisine, destination (owner decision,
 * 2026-09-23). The hero keeps its facts.
 */
import { z } from "zod";

/**
 * [MEASURED 2026-09-23] The longest catalog name is 84 characters (a recipe
 * title), rounded up so any full title can be pasted as a query.
 */
export const SEARCH_QUERY_MAX_LENGTH = 100;

export const SearchQuerySchema = z.object({
  q: z.string().trim().max(SEARCH_QUERY_MAX_LENGTH),
});

const SearchKindSchema = z.enum(["ingredient", "recipe", "cuisine", "method", "sauce"]);

const EntitySchema = z.object({
  kind: SearchKindSchema,
  key: z.string(),
  name: z.string(),
  href: z.string(),
});

const RecipeRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  cuisine: z.string().nullable(),
});

const ElementalSchema = z.object({
  Fire: z.number(),
  Water: z.number(),
  Earth: z.number(),
  Air: z.number(),
});

const HeroSchema = z.object({
  key: z.string(),
  name: z.string(),
  href: z.string(),
  category: z.string(),
  seasons: z.array(z.string()),
  inSeasonNow: z.boolean(),
  qualities: z.array(z.string()),
  rulingPlanets: z.array(z.string()),
  elemental: ElementalSchema.nullable(),
  imageUrl: z.string().nullable(),
  recipeCount: z.number().int().nonnegative(),
});

const CorrectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  basis: z.enum(["synonym", "mid-word", "edit-distance"]),
});

export const OmnibarResponseSchema = z.object({
  success: z.literal(true),
  query: z.string(),
  /** The best hit of any kind; `exact` (tier 0) lets Enter open it directly. */
  top: EntitySchema.extend({ exact: z.boolean() }).nullable(),
  corrected: CorrectionSchema.nullable(),
  hero: HeroSchema.nullable(),
  recipesContaining: z.array(RecipeRowSchema.extend({ alternative: z.boolean() })),
  recipes: z.array(RecipeRowSchema),
  ingredients: z.array(EntitySchema),
  cuisines: z.array(EntitySchema),
  methods: z.array(EntitySchema),
  sauces: z.array(EntitySchema),
  total: z.object({
    ingredient: z.number().int(),
    recipe: z.number().int(),
    cuisine: z.number().int(),
    method: z.number().int(),
    sauce: z.number().int(),
  }),
});

export type OmnibarResponse = z.infer<typeof OmnibarResponseSchema>;
