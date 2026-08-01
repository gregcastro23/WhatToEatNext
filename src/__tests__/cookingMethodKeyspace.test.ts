/**
 * Registry totality and normalization guards for the cooking-method key space.
 *
 * `[MEASURED 2026-07-31]` an audit found at least 27 registries and alias maps
 * keying cooking methods, four distinct types named `CookingMethod`, and five
 * different normalization rules. Six of the 27 servable methods resolved no
 * pillar and therefore rendered with untransformed ESMS.
 *
 * The fix deliberately renames NOTHING. Method keys are persisted in three
 * Postgres surfaces read by exact string equality — most sharply
 * `user_profiles.taste_corrections.methods`, where a stored
 * `{"stir-frying": "block"}` is a user saying *never this*, applied by exact key
 * match with no normalization and no backfill hook anywhere in database/init/.
 * Renaming that key silently revokes the user's choice.
 *
 * So every guard here is written against BOTH old and new spellings: the point
 * is that both resolve, permanently.
 *
 * These are runtime tests by necessity. Both registries are read through
 * `Record<string, …>` index signatures, so TypeScript cannot see a missing key.
 *
 * @file src/__tests__/cookingMethodKeyspace.test.ts
 */

import { getCookingMethodPillar } from "@/constants/alchemicalPillars";
import {
  CANONICAL_COOKING_METHOD_KEYS,
  REGISTRY_ONLY_COOKING_METHOD_KEYS,
  SERVABLE_COOKING_METHOD_KEYS,
  normalizeCookingMethodKey,
  normalizeSlug,
  resolveRegistryKey,
  toCanonicalCookingMethodKey,
} from "@/constants/cookingMethodKeys";
import { allCookingMethods } from "@/data/cooking/methods";
import { METHOD_PHYSICAL_REFERENCE } from "@/data/cooking/physicalReference";
import { getKineticProfile } from "@/utils/cookingMethodKinetics";

describe("the canonical list matches the live registry", () => {
  it("lists exactly the ids allCookingMethods serves", () => {
    expect([...SERVABLE_COOKING_METHOD_KEYS].sort()).toEqual(
      Object.keys(allCookingMethods).sort(),
    );
  });

  it("keeps registry-only keys separate from servable ones", () => {
    // `baking` has a pillar entry AND a kinetic profile but no data file — a
    // real catalog gap. Naming it here keeps "no profile" distinct from
    // "no method".
    for (const key of REGISTRY_ONLY_COOKING_METHOD_KEYS) {
      expect(Object.keys(allCookingMethods)).not.toContain(key);
    }
    expect(REGISTRY_ONLY_COOKING_METHOD_KEYS).toContain("baking");
  });

  it("unions both sets into the canonical vocabulary", () => {
    expect(CANONICAL_COOKING_METHOD_KEYS).toHaveLength(
      SERVABLE_COOKING_METHOD_KEYS.length + REGISTRY_ONLY_COOKING_METHOD_KEYS.length,
    );
  });
});

describe("every servable method resolves in every registry", () => {
  it.each([...SERVABLE_COOKING_METHOD_KEYS])("%s resolves a pillar", (id) => {
    expect(getCookingMethodPillar(id)).toBeDefined();
  });

  it.each([...SERVABLE_COOKING_METHOD_KEYS])("%s resolves a kinetic profile", (id) => {
    // getKineticProfile now returns null rather than six fabricated 0.50s, so a
    // null here is a genuine registry gap.
    expect(getKineticProfile(id)).not.toBeNull();
  });

  it.each([...SERVABLE_COOKING_METHOD_KEYS])("%s resolves a physical reference", (id) => {
    const physical: Record<string, unknown> = METHOD_PHYSICAL_REFERENCE;
    expect(resolveRegistryKey(id, Object.keys(physical))).not.toBeNull();
  });
});

describe("every declared method name resolves — the data/registry seam", () => {
  // This is the seam the registry-only tests cannot see: a registry can be
  // perfectly total over its own keys while the strings the data files actually
  // declare miss every one of them.
  it.each(Object.entries(allCookingMethods).map(([id, m]) => [id, String((m as { name?: string }).name ?? "")]))(
    "%s declares name %p, which normalizes onto its record key",
    (id, declaredName) => {
      if (!declaredName) return;
      expect(normalizeCookingMethodKey(declaredName)).toBe(normalizeCookingMethodKey(id));
    },
  );

  it.each(Object.values(allCookingMethods).map((m) => String((m as { name?: string }).name ?? "")))(
    "the declared name %p resolves a pillar",
    (declaredName) => {
      if (!declaredName) return;
      expect(getCookingMethodPillar(declaredName)).toBeDefined();
    },
  );
});

describe("old spellings keep resolving — nothing was renamed", () => {
  // Each pair is (legacy spelling still stored somewhere, modern spelling).
  const PAIRS: Array<[string, string]> = [
    ["fermenting", "fermentation"],
    ["drying", "dehydrating"],
    ["stir-frying", "stir_frying"],
  ];

  it.each(PAIRS)("%s and %s both resolve a pillar", (legacy, modern) => {
    expect(getCookingMethodPillar(legacy)).toBeDefined();
    expect(getCookingMethodPillar(modern)).toBeDefined();
  });

  it.each(PAIRS)("%s and %s resolve to the SAME pillar", (legacy, modern) => {
    expect(getCookingMethodPillar(legacy)?.id).toBe(getCookingMethodPillar(modern)?.id);
  });
});

describe("normalization tolerates every spelling in the data", () => {
  it("collapses separators and case", () => {
    for (const input of ["Pressure Cooking", "pressure-cooking", "PRESSURE_COOKING"]) {
      expect(getCookingMethodPillar(input)).toBeDefined();
    }
  });

  it("folds accents", () => {
    // "Sautéing" is a persisted picker option in FoodLabBook and appears in
    // several cuisine files; without folding it never meets the key `sauteing`.
    expect(normalizeCookingMethodKey("Sautéing")).toBe("sauteing");
    expect(getCookingMethodPillar("Sautéing")).toBeDefined();
  });

  it("returns undefined for a genuine non-method rather than guessing", () => {
    expect(getCookingMethodPillar("not_a_cooking_method_xyz")).toBeUndefined();
    expect(toCanonicalCookingMethodKey("not_a_cooking_method_xyz")).toBeNull();
  });
});

describe("the slug rule is derived from the key rule", () => {
  it("composes: slug = strip(normalizeCookingMethodKey(x))", () => {
    for (const key of CANONICAL_COOKING_METHOD_KEYS) {
      expect(normalizeSlug(key)).toBe(
        normalizeCookingMethodKey(key).replace(/[^a-z0-9]/g, ""),
      );
    }
  });

  it("maps every URL spelling the techniques route used to accept", () => {
    const cases: Array<[string, string]> = [
      ["stirfrying", "stir_frying"],
      ["stir-frying", "stir_frying"],
      ["sousvide", "sous_vide"],
      ["pressurecooking", "pressure_cooking"],
      ["Pressure Cooking", "pressure_cooking"],
      ["cryocooking", "cryo_cooking"],
    ];
    const ids = Object.keys(allCookingMethods);
    for (const [url, expected] of cases) {
      const q = normalizeSlug(url);
      expect(ids.find((k) => normalizeSlug(k) === q)).toBe(expected);
    }
  });

  it("produces a collision-free slug space across all canonical keys", () => {
    const slugs = CANONICAL_COOKING_METHOD_KEYS.map(normalizeSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("the kinetic fallback no longer fabricates", () => {
  it("returns null for an unregistered method instead of six 0.50s", () => {
    const result = getKineticProfile("a_method_that_does_not_exist");
    expect(result).toBeNull();
  });

  it("still honours an explicitly supplied data profile", () => {
    const supplied = {
      voltage: 0.1,
      current: 0.2,
      resistance: 0.3,
      velocityFactor: 0.4,
      momentumRetention: 0.5,
      forceImpact: 0.6,
    };
    expect(getKineticProfile("a_method_that_does_not_exist", supplied)).toBe(supplied);
  });
});
