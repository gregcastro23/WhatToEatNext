/**
 * The union catalog (omnibar Phase 2.5a): one card per ingredient, src/data's
 * fields winning, and no two cards that search can't tell apart.
 */
import { allIngredients } from "@/data/ingredients";
import { unifiedIngredients } from "@/data/unified/ingredients";
import { normalizeText } from "@/lib/search/text";
import { catalogRecord, getIngredientCatalog, resolveCatalogIngredient } from "../ingredientCatalog";

const { entries, bySlug } = getIngredientCatalog();

function entry(key: string): (typeof entries)[number] {
  const found = entries.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`no card ${key}`);
  return found;
}

describe("union catalog", () => {
  it("is every key of both catalogs, less the 5 merged into another card", () => {
    const keys = new Set([...Object.keys(allIngredients), ...Object.keys(unifiedIngredients)]);
    // [MEASURED 2026-09-23] 921 + 1,002 cards share 916 keys → 1,007 keys.
    // Merged: bay_leaves, curry_leaves (unified plural fold); soymilk, radish,
    // mam_ruo_c (SAME_CARD).
    expect(keys.size).toBe(1007);
    expect(entries).toHaveLength(1002);
    const merged = [...keys].filter((key) => !entries.some((candidate) => candidate.key === key)).sort();
    expect(merged).toEqual(["bay_leaves", "curry_leaves", "mam_ruo_c", "radish", "soymilk"]);
  });

  it("slugs are unique and URL-safe", () => {
    expect(bySlug.size).toBe(entries.length);
    expect(entries.filter(({ slug }) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))).toEqual([]);
  });

  it("no two cards share a search form (compact or stemmed name or key)", () => {
    const owners = new Map<string, Set<string>>();
    for (const { key, name } of entries) {
      for (const text of [name, key.replace(/_/g, " ")]) {
        const { compact, stemmed } = normalizeText(text);
        for (const form of [`c:${compact}`, `s:${stemmed.replace(/ /g, "")}`]) {
          owners.set(form, (owners.get(form) ?? new Set()).add(key));
        }
      }
    }
    expect([...owners].filter(([, keys]) => keys.size > 1).map(([form, keys]) => `${form}=${[...keys].join("/")}`)).toEqual([]);
  });

  it("merged keys and names are aliases of the surviving card", () => {
    expect(resolveCatalogIngredient("soymilk")?.entry.key).toBe("soy_milk");
    expect(resolveCatalogIngredient("radish")?.entry.key).toBe("radishes");
    expect(resolveCatalogIngredient("mam ruo c")?.entry.key).toBe("mam_ruoc");
    expect(resolveCatalogIngredient("curry leaves")?.entry.key).toBe("curry leaf");
  });
});

describe("catalogRecord: src/data wins field by field", () => {
  it("src/data's name beats the unified card's raw key", () => {
    expect(entry("rice_vinegar").unified?.name).toBe("rice_vinegar");
    expect(catalogRecord(entry("rice_vinegar")).name).toBe("Rice Vinegar");
  });

  it("the unified card fills what src/data lacks", () => {
    const record = catalogRecord(entry("rice_vinegar"));
    expect(record.kalchm).toBe(entry("rice_vinegar").unified?.kalchm);
  });

  it("an undefined src/data field does not erase a unified value", () => {
    const withGap = entries.find(({ source, unified }) => {
      const pairing: unknown = source ? Reflect.get(source, "pairingRecommendations") : null;
      return source && pairing === undefined && unified?.pairingRecommendations !== undefined;
    });
    if (withGap) expect(catalogRecord(withGap).pairingRecommendations).toEqual(withGap.unified?.pairingRecommendations);
  });

  it("a unified-only card is its unified record", () => {
    expect(catalogRecord(entry("chicken_egg"))).toMatchObject({ name: "Chicken Egg", category: "protein" });
  });

  it("serves every image as a URL next/image accepts, never a bare asset path", () => {
    const bad = entries.filter(({ imageUrl }) => imageUrl !== null && !/^(https:\/\/|\/)/.test(imageUrl));
    expect(bad.map(({ key, imageUrl }) => `${key}: ${imageUrl}`)).toEqual([]);
    expect(entry("vanilla").source?.image_url).toBe("ingredients/vanilla.png");
    expect(catalogRecord(entry("vanilla")).image_url).toBe(entry("vanilla").unified?.image_url);
  });

  it("serializes as JSON", () => {
    expect(() => JSON.stringify(entries.map(catalogRecord))).not.toThrow();
  });
});
