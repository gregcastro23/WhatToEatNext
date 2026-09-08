/**
 * Coverage for the request schemas that `apiSchemas.test.ts` does not reach,
 * plus one structural invariant over EVERY exported schema.
 *
 * Written after PR #835, where `RestaurantOrderBodySchema` — the only schema in
 * the file with no test — 400'd every realistic payload on the ESMS
 * restaurant-settlement route. 28 of 67 exported schemas had no test at all.
 *
 * The shape that would have caught it in one line is the "minimal payload"
 * test: parse the smallest realistic body with EVERY optional field omitted.
 * Per-field valid/invalid cases do not catch an optionality regression, because
 * they always send the field.
 */

import { z } from "zod";

import * as schemas from "../apiSchemas";

// ─── Structural invariant: no bare z.unknown()/z.any() object key ────────────

// Narrowing is done with `typeof` / `in` rather than casts, so this file adds
// no assertion sites to the tracked baseline.
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** A zod schema, structurally: anything carrying a `def` with a string `type`. */
function defOf(v: unknown): Record<string, unknown> | undefined {
  if (!isRecord(v) || !("def" in v)) return undefined;
  const def = v.def;
  if (!isRecord(def) || typeof def.type !== "string") return undefined;
  return def;
}

function isZodNode(v: unknown): boolean {
  return defOf(v) !== undefined;
}

/**
 * Walks a schema tree and reports every object key whose value is a BARE
 * `z.unknown()` / `z.any()` — i.e. not wrapped in `.optional()`.
 *
 * ⚠️ Under zod 4 such a key is REQUIRED: `z.object({ a: z.unknown() })`
 * rejects `{}` with `expected: "nonoptional"`. Under zod 3 it was implicitly
 * optional. Porting a `field?: unknown` interface to `field: z.unknown()`
 * therefore silently turns an optional field into a mandatory one, and every
 * caller that omits it starts getting a 400.
 */
function findBareUnknownKeys(root: unknown, rootName: string): string[] {
  const found: string[] = [];
  const seen = new Set<unknown>();

  function walk(node: unknown, path: string): void {
    const def = defOf(node);
    if (def === undefined || seen.has(node)) return;
    seen.add(node);

    switch (def.type) {
      case "object": {
        // `.shape` is a getter on the schema, not on `.def`.
        const shape =
          isRecord(node) && "shape" in node && isRecord(node.shape) ? node.shape : {};
        for (const [key, child] of Object.entries(shape)) {
          const childType = defOf(child)?.type;
          if (childType === "unknown" || childType === "any") {
            found.push(`${path}.${key}`);
          }
          walk(child, `${path}.${key}`);
        }
        break;
      }
      case "optional":
      case "nullable":
      case "default":
      case "catch":
      case "nonoptional":
      case "readonly":
        walk(def.innerType, path);
        break;
      case "array":
        walk(def.element, `${path}[]`);
        break;
      case "record":
        walk(def.valueType, `${path}{}`);
        break;
      case "union":
        if (Array.isArray(def.options)) {
          for (const [i, opt] of def.options.entries()) walk(opt, `${path}|${i}`);
        }
        break;
      case "pipe":
        walk(def.in, path);
        walk(def.out, path);
        break;
      default:
        break;
    }
  }

  walk(root, rootName);
  return found;
}

describe("apiSchemas structural invariants", () => {
  const exported = Object.entries(schemas).filter(([, v]) => isZodNode(v));

  it("exports schemas to check (guard-on-the-guard)", () => {
    // Without this the suite below passes vacuously if the import shape changes.
    expect(exported.length).toBeGreaterThan(50);
  });

  it("has no bare z.unknown()/z.any() object key anywhere", () => {
    const offenders = exported.flatMap(([name, schema]) =>
      findBareUnknownKeys(schema, name),
    );
    expect(offenders).toEqual([]);
  });

  it("the walker actually detects the defect it exists to catch (red-proof)", () => {
    const bad = z.object({
      ok: z.unknown().optional(),
      broken: z.unknown(),
      nested: z.object({ alsoBroken: z.any() }).optional(),
    });
    expect(findBareUnknownKeys(bad, "bad").sort()).toEqual([
      "bad.broken",
      "bad.nested.alsoBroken",
    ]);
    // …and stays quiet on the corrected form.
    const good = z.object({
      ok: z.unknown().optional(),
      broken: z.unknown().optional(),
      nested: z.object({ alsoBroken: z.any().optional() }).optional(),
    });
    expect(findBareUnknownKeys(good, "good")).toEqual([]);
  });
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const birthData = {
  dateTime: "1990-01-01T12:00:00Z",
  latitude: 37.7749,
  longitude: -122.4194,
};

const natalChart = {
  dominantElement: "Fire",
  elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
};

const elemental = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

// ─── The regression that motivated this file ─────────────────────────────────

describe("RestaurantOrderBodySchema", () => {
  it("parses the minimal realistic order — every optional field omitted", () => {
    // This is the exact body the route test posts. Before the fix all 17 keys
    // were bare `z.unknown()`, so this returned 400 and the handler never
    // reached the crypto flag check, the ESMS branch, or the rate limiter.
    const res = schemas.RestaurantOrderBodySchema.safeParse({
      cuisineType: "Restaurant",
      provider: "deliverect",
      restaurant: { id: "rest_123", name: "Test Kitchen", url: "https://example.com/menu" },
      order: { amountCents: 2000, currency: "usd", paymentMethod: "crypto" },
    });
    expect(res.success).toBe(true);
  });

  it("parses a completely empty body — every field is optional by contract", () => {
    expect(schemas.RestaurantOrderBodySchema.safeParse({}).success).toBe(true);
  });

  it("preserves unknown top-level keys (passthrough)", () => {
    const res = schemas.RestaurantOrderBodySchema.safeParse({ tipCents: 500 });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toMatchObject({ tipCents: 500 });
  });

  it("rejects a non-object body", () => {
    expect(schemas.RestaurantOrderBodySchema.safeParse("nope").success).toBe(false);
  });
});

// ─── Leaf / enum schemas ─────────────────────────────────────────────────────

describe("leaf and enum schemas", () => {
  it("ElementalPropertiesSchema requires all four elements in [0,1]", () => {
    expect(schemas.ElementalPropertiesSchema.safeParse(elemental).success).toBe(true);
    expect(
      schemas.ElementalPropertiesSchema.safeParse({ Fire: 0.5, Water: 0.5, Earth: 0.5 })
        .success,
    ).toBe(false);
    expect(
      schemas.ElementalPropertiesSchema.safeParse({ ...elemental, Fire: 1.5 }).success,
    ).toBe(false);
  });

  it("ServingSizeSchema requires amount/unit/grams and leaves description optional", () => {
    expect(
      schemas.ServingSizeSchema.safeParse({ amount: 1, unit: "cup", grams: 240 }).success,
    ).toBe(true);
    expect(schemas.ServingSizeSchema.safeParse({ amount: 1, unit: "cup" }).success).toBe(
      false,
    );
  });

  it("NatalPlanetInputSchema requires sign and degree", () => {
    expect(schemas.NatalPlanetInputSchema.safeParse({ sign: "Aries", degree: 12 }).success).toBe(
      true,
    );
    expect(schemas.NatalPlanetInputSchema.safeParse({ sign: "Aries" }).success).toBe(false);
  });

  it("TokenTypeSchema accepts the four capitalised axes only", () => {
    for (const t of ["Spirit", "Essence", "Matter", "Substance"]) {
      expect(schemas.TokenTypeSchema.safeParse(t).success).toBe(true);
    }
    expect(schemas.TokenTypeSchema.safeParse("spirit").success).toBe(false);
  });

  it("TokenAmountValueSchema accepts the wire's number-or-string amounts", () => {
    expect(schemas.TokenAmountValueSchema.safeParse(5).success).toBe(true);
    expect(schemas.TokenAmountValueSchema.safeParse("5").success).toBe(true);
    expect(schemas.TokenAmountValueSchema.safeParse(null).success).toBe(false);
  });

  it("SyncTokenAmountsSchema treats every axis as optional", () => {
    expect(schemas.SyncTokenAmountsSchema.safeParse({}).success).toBe(true);
    expect(schemas.SyncTokenAmountsSchema.safeParse({ spirit: "3" }).success).toBe(true);
  });

  it("TransactionSourceTypeSchema pins the canonical 22-member source set", () => {
    // The PA -> alchm sync-credit bridge sends `source`. Before this schema the
    // field was never validated, so an unlisted value passed straight through
    // to the DB; now it 400s. Pin the membership so drift is visible here
    // rather than as a cross-repo outage.
    expect(schemas.TransactionSourceTypeSchema.options.slice().sort()).toEqual(
      [
        "admin",
        "agents_operation",
        "agents_yield",
        "alchemical_log",
        "cosmic_recipe_refund",
        "daily_yield",
        "group_chat_quest",
        "mcp_top_up",
        "mint_refund",
        "onchain_claim",
        "onchain_claim_refund",
        "practice_reward",
        "premium_purchase",
        "purchase",
        "quest_reward",
        "recipe_ingestion",
        "restaurant_order",
        "restaurant_refund",
        "signup_grant",
        "streak_bonus",
        "transit_attunement",
        "transmutation",
      ].sort(),
    );
    expect(schemas.TransactionSourceTypeSchema.safeParse("not_a_source").success).toBe(false);
  });

  it("FeedReactionKindSchema and FeedShareTypeSchema pin their members", () => {
    expect(schemas.FeedReactionKindSchema.options.slice().sort()).toEqual(
      ["air", "earth", "fire", "spark", "water"].sort(),
    );
    expect(schemas.FeedShareTypeSchema.options.slice().sort()).toEqual(
      ["cooked", "menu", "preferences", "recipe"].sort(),
    );
  });

  it("CommensalRelationshipSchema pins its members", () => {
    expect(schemas.CommensalRelationshipSchema.options.slice().sort()).toEqual(
      ["colleague", "family", "friend", "other", "partner", "self"].sort(),
    );
  });
});

// ─── Request schemas ─────────────────────────────────────────────────────────

describe("request schemas — minimal payloads", () => {
  it("BirthDataSchema parses with only dateTime/latitude/longitude", () => {
    expect(schemas.BirthDataSchema.safeParse(birthData).success).toBe(true);
    expect(
      schemas.BirthDataSchema.safeParse({ dateTime: "1990-01-01T12:00:00Z" }).success,
    ).toBe(false);
  });

  it("OnboardingRequestSchema needs birthData but not name", () => {
    expect(schemas.OnboardingRequestSchema.safeParse({ birthData }).success).toBe(true);
    expect(schemas.OnboardingRequestSchema.safeParse({ name: "Ada" }).success).toBe(false);
  });

  it("CommensalRequestSchema requires targetUserId OR email", () => {
    expect(schemas.CommensalRequestSchema.safeParse({ targetUserId: "u1" }).success).toBe(true);
    expect(schemas.CommensalRequestSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(schemas.CommensalRequestSchema.safeParse({}).success).toBe(false);
  });

  it("CreateFoodDiaryEntrySchema parses with every optional field omitted", () => {
    const res = schemas.CreateFoodDiaryEntrySchema.safeParse({
      foodName: "Congee",
      foodSource: "custom",
      date: "2026-09-08",
      mealType: "breakfast",
      time: "08:30",
      serving: { amount: 1, unit: "bowl", grams: 300 },
      quantity: 1,
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.date).toBeInstanceOf(Date);
  });

  it("CreateFoodDiaryEntrySchema rejects a non-positive quantity and an unknown mealType", () => {
    const base = {
      foodName: "Congee",
      foodSource: "custom",
      date: "2026-09-08",
      mealType: "breakfast",
      time: "08:30",
      serving: { amount: 1, unit: "bowl", grams: 300 },
      quantity: 1,
    };
    expect(schemas.CreateFoodDiaryEntrySchema.safeParse({ ...base, quantity: 0 }).success).toBe(
      false,
    );
    expect(
      schemas.CreateFoodDiaryEntrySchema.safeParse({ ...base, mealType: "brunch" }).success,
    ).toBe(false);
  });

  it("SaveGuestSchema requires a name, birthData and a shaped natalChart", () => {
    expect(
      schemas.SaveGuestSchema.safeParse({ name: "Hypatia", birthData, natalChart }).success,
    ).toBe(true);
    expect(
      schemas.SaveGuestSchema.safeParse({ name: "Hypatia", birthData, natalChart: {} }).success,
    ).toBe(false);
    expect(schemas.SaveGuestSchema.safeParse({ name: "", birthData, natalChart }).success).toBe(
      false,
    );
  });

  it("CommensalSaveGroupRequestSchema enforces the 1..12 seat range", () => {
    const guest = { name: "Hypatia", birthData, natalChart };
    expect(
      schemas.CommensalSaveGroupRequestSchema.safeParse({
        groupName: "Symposium",
        guests: [guest],
      }).success,
    ).toBe(true);
    expect(
      schemas.CommensalSaveGroupRequestSchema.safeParse({ groupName: "Symposium", guests: [] })
        .success,
    ).toBe(false);
    expect(
      schemas.CommensalSaveGroupRequestSchema.safeParse({
        groupName: "Symposium",
        guests: Array.from({ length: 13 }, () => guest),
      }).success,
    ).toBe(false);
    expect(
      schemas.CommensalSaveGroupRequestSchema.safeParse({ groupName: "   ", guests: [guest] })
        .success,
    ).toBe(false);
  });

  it("GroupBackendProxyRequestSchema needs 2+ members and passes extra keys through", () => {
    const res = schemas.GroupBackendProxyRequestSchema.safeParse({
      members: [{ id: "a" }, { id: "b" }],
      strategy: "average",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toMatchObject({ strategy: "average" });
    }
    expect(
      schemas.GroupBackendProxyRequestSchema.safeParse({ members: [{ id: "a" }] }).success,
    ).toBe(false);
  });

  it("GroupRecommendationsRequestSchema fills its defaults from an empty body", () => {
    const res = schemas.GroupRecommendationsRequestSchema.safeParse({});
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.commensalIds).toEqual([]);
      expect(res.data.linkedUserIds).toEqual([]);
      expect(res.data.strategy).toBe("average");
    }
  });

  it("PushUnsubscribeRequestSchema requires a non-empty endpoint", () => {
    expect(
      schemas.PushUnsubscribeRequestSchema.safeParse({ endpoint: "https://push.example/x" })
        .success,
    ).toBe(true);
    expect(schemas.PushUnsubscribeRequestSchema.safeParse({ endpoint: "" }).success).toBe(false);
  });

  it("UserProfileUpdateSchema accepts an empty body and preserves extra keys", () => {
    const res = schemas.UserProfileUpdateSchema.safeParse({ locale: "en-GB" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toMatchObject({ locale: "en-GB" });
    expect(schemas.UserProfileUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("BulkImportMealPlanEntrySchema defaults servings to 1", () => {
    const res = schemas.BulkImportMealPlanEntrySchema.safeParse({
      recipeId: "r1",
      date: "2026-09-08",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.servings).toBe(1);
    expect(
      schemas.BulkImportMealPlanEntrySchema.safeParse({ recipeId: "", date: "2026-09-08" })
        .success,
    ).toBe(false);
  });

  it("InstacartPriceEstimateItemSchema accepts a bare string or a named object", () => {
    expect(schemas.InstacartPriceEstimateItemSchema.safeParse("2 cups rice").success).toBe(true);
    expect(schemas.InstacartPriceEstimateItemSchema.safeParse({ name: "rice" }).success).toBe(
      true,
    );
    expect(schemas.InstacartPriceEstimateItemSchema.safeParse("").success).toBe(false);
    expect(schemas.InstacartPriceEstimateItemSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

// ─── Recipe / response schemas ───────────────────────────────────────────────

describe("recipe and response schemas", () => {
  const ingredient = { name: "rice", amount: 2, unit: "cups" };
  const recipe = {
    id: "r1",
    name: "Congee",
    ingredients: [ingredient],
    instructions: ["simmer"],
    elementalProperties: elemental,
  };

  it("RecipeIngredientSchema needs name/amount/unit and passes extra fields through", () => {
    const res = schemas.RecipeIngredientSchema.safeParse({ ...ingredient, kalchm: 1.2 });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toMatchObject({ kalchm: 1.2 });
    expect(schemas.RecipeIngredientSchema.safeParse({ name: "rice", amount: 2 }).success).toBe(
      false,
    );
  });

  it("RecipeSchema parses the minimal recipe with every optional field omitted", () => {
    expect(schemas.RecipeSchema.safeParse(recipe).success).toBe(true);
    expect(schemas.RecipeSchema.safeParse({ ...recipe, name: "" }).success).toBe(false);
    const { elementalProperties: _dropped, ...noElemental } = recipe;
    expect(schemas.RecipeSchema.safeParse(noElemental).success).toBe(false);
  });

  it("RecipeDetailResponseSchema requires success: true and a recipe", () => {
    expect(schemas.RecipeDetailResponseSchema.safeParse({ success: true, recipe }).success).toBe(
      true,
    );
    expect(
      schemas.RecipeDetailResponseSchema.safeParse({ success: false, recipe }).success,
    ).toBe(false);
  });

  it("ApiErrorSchema requires success: false and an error string", () => {
    expect(schemas.ApiErrorSchema.safeParse({ success: false, error: "boom" }).success).toBe(
      true,
    );
    expect(schemas.ApiErrorSchema.safeParse({ success: true, error: "boom" }).success).toBe(
      false,
    );
  });

  it("AlchmQuantitiesApiResponseSchema rejects a payload missing its live blocks", () => {
    // A full valid fixture for this response is ~60 fields and lives with the
    // /api/alchm-quantities tests; here we only pin that the schema is not
    // vacuous — it must reject a plausible-looking partial.
    expect(
      schemas.AlchmQuantitiesApiResponseSchema.safeParse({
        success: true,
        timestamp: "2026-09-08T00:00:00Z",
        dominantElement: "Fire",
      }).success,
    ).toBe(false);
  });
});
