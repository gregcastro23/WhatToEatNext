// Every copy of a cuisine's elemental profile is COMPUTED from its dishes and
// generated into src/data/cuisines/derivedProfiles.json (deriveProfile.ts).
// These tests recompute it from the cuisine files and compare every copy:
// the metadata, the loaded cuisine, and the backend JSON that main.py serves.
// A failure means a dish profile changed: run `bun run generate:cuisine-profiles`.
import fs from "fs";
import path from "path";
import { deriveCuisineProfile } from "@/data/cuisines/deriveProfile";
import derivedProfiles from "@/data/cuisines/derivedProfiles.json";
import {
  CUISINES_METADATA,
  PRIMARY_CUISINE_KEYS,
  getCuisineData,
  loadRawCuisine,
} from "@/data/cuisines/index";

const BACKEND_JSON = path.resolve(__dirname, "../../backend/alchm_kitchen/data/json");
const derived: Record<string, { recipes: number; elementalProperties: Record<string, number> }> =
  derivedProfiles.cuisines;
const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const dish = (name: string, Fire: number, Water: number, Earth: number, Air?: number) => ({
  name,
  elementalProperties: { Fire, Water, Earth, ...(Air === undefined ? {} : { Air }) },
});

describe("deriveCuisineProfile", () => {
  it("counts a dish once, averages its entries, and drops incomplete entries", () => {
    const cuisine = {
      dishes: {
        dinner: {
          summer: [dish("Stew", 1, 0, 0, 0), dish("Salad", 2, 2, 0, 0)],
          winter: [dish("Stew", 0, 1, 0, 0), dish("Broth", 0, 0, 1)],
        },
      },
    };
    // Stew averages to (.5, .5, 0, 0); Salad normalises to (.5, .5, 0, 0);
    // Broth has no Air, so it is left out.
    expect(deriveCuisineProfile(cuisine)).toEqual({
      recipes: 2,
      elementalProperties: { Fire: 0.5, Water: 0.5, Earth: 0, Air: 0 },
    });
  });

  it("gives no profile when no dish carries a full one", () => {
    expect(deriveCuisineProfile({ dishes: { dinner: { all: [dish("Broth", 0, 0, 1)] } } })).toBeUndefined();
    expect(deriveCuisineProfile({})).toBeUndefined();
  });
});

describe("derivedProfiles.json", () => {
  it("covers every cuisine file", () => {
    expect(Object.keys(derived).sort()).toEqual([...PRIMARY_CUISINE_KEYS].sort());
  });

  it.each(PRIMARY_CUISINE_KEYS)("%s matches a fresh derivation from its dishes", async (key) => {
    expect(deriveCuisineProfile(await loadRawCuisine(key))).toEqual(derived[key]);
  });

  it.each(PRIMARY_CUISINE_KEYS)("%s: the loaded cuisine carries the derived profile", async (key) => {
    expect((await getCuisineData(key))?.elementalProperties).toEqual(derived[key]?.elementalProperties);
  });

  it("every metadata entry carries the derived profile", () => {
    const keys = Object.keys(CUISINES_METADATA);
    expect(keys.length).toBe(15);
    for (const key of keys) {
      expect(CUISINES_METADATA[key]?.elementalProperties).toEqual(derived[key]?.elementalProperties);
    }
  });
});

describe("backend cuisine JSON (served by main.py)", () => {
  const byNorm = new Map(Object.entries(derived).map(([k, p]) => [normKey(k), p]));
  const expectDerived = (label: string, record: { elementalProperties?: unknown; elementalProfileBasis?: unknown }) => {
    const profile = byNorm.get(normKey(label));
    expect(profile).toBeDefined();
    expect(record.elementalProperties).toEqual(profile?.elementalProperties);
    expect(record.elementalProfileBasis).toEqual({ method: "recipe-mean", recipes: profile?.recipes });
  };

  it("cuisines.json carries the derived profiles", () => {
    const combined = JSON.parse(fs.readFileSync(path.join(BACKEND_JSON, "cuisines.json"), "utf8"));
    const keys = Object.keys(combined);
    expect(keys.length).toBeGreaterThanOrEqual(15);
    for (const key of keys) expectDerived(key, combined[key]);
  });

  it("each per-cuisine file carries the derived profile", () => {
    const dir = path.join(BACKEND_JSON, "cuisines");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThanOrEqual(15);
    for (const file of files) {
      expectDerived(path.basename(file, ".json"), JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")));
    }
  });
});
