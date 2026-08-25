/**
 * Behavioral Snapshot Witness
 *
 * Deterministic, offline regression gate verifying exact value equality and distribution
 * parity across domain engines (server planetary, live ephemeris, ingredient catalog)
 * over fixed astronomical timestamps before and after refactoring.
 *
 * Usage:
 *   bun scripts/snapshot-witness.ts --record   # Record fixtures/snapshot-witness-baseline.json
 *   bun scripts/snapshot-witness.ts            # Compare and assert 100% parity (exits 0 or 1)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  calculatePositionsWithAstronomyEngine,
  calculateAscendantPosition,
} from "../src/utils/serverPlanetaryCalculations";
import {
  calculateLivePositions,
  getLiveSkySnapshot,
  isDiurnalSect,
} from "../src/utils/liveEphemeris";
import { UnifiedIngredientService } from "../src/services/UnifiedIngredientService";

import {
  calculateFlavorCompatibility,
  calculateCuisineFlavorMatch,
  calculatePlanetaryFlavorMatch,
} from "../src/data/unified/flavorCompatibilityLayer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, "fixtures/snapshot-witness-baseline.json");

export function generateSnapshot() {
  const dates = [
    new Date("2026-03-20T14:46:00Z"), // Vernal Equinox 2026
    new Date("2026-06-21T08:24:00Z"), // Summer Solstice 2026
    new Date("2026-09-22T23:05:00Z"), // Autumnal Equinox 2026
    new Date("2026-12-21T20:50:00Z"), // Winter Solstice 2026
  ];

  // 1. Server Planetary Calculations (Offline astronomy-engine kinematics)
  const serverPlanetary = dates.map((d) => {
    const { positions, usedFallback } = calculatePositionsWithAstronomyEngine(d);
    return {
      usedFallback,
      planets: Object.keys(positions).sort(),
      details: Object.fromEntries(
        Object.entries(positions).map(([name, pos]) => [
          name,
          {
            sign: pos.sign,
            degree: pos.degree,
            minute: pos.minute,
            exactLongitude: Number(pos.exactLongitude.toFixed(6)),
            isRetrograde: pos.isRetrograde,
            longitudeSpeed: Number(pos.longitudeSpeed.toFixed(6)),
          },
        ]),
      ),
    };
  });

  // 2. Ascendant Positions
  const ascendants = dates.map((d) => {
    const pos = calculateAscendantPosition(d, 37.7749, -122.4194);
    return {
      sign: pos.sign,
      degree: pos.degree,
      minute: pos.minute,
      exactLongitude: Number(pos.exactLongitude.toFixed(6)),
    };
  });

  // 3. Live Ephemeris Positions & Sect
  const livePositions = dates.map((d) => {
    const posMap = calculateLivePositions(d);
    return Object.fromEntries(
      Object.entries(posMap).map(([name, pos]) => [
        name,
        {
          sign: pos.sign,
          degree: pos.degree,
          minute: pos.minute,
          exactLongitude: Number(pos.exactLongitude.toFixed(6)),
        },
      ]),
    );
  });

  const skySnapshots = dates.map((d) => {
    const snap = getLiveSkySnapshot(d);
    return {
      isDiurnal: snap.isDiurnal,
      planetCount: snap.planets.length,
      planets: snap.planets.map((p) => ({
        name: p.name,
        sign: p.position.sign,
        signElement: p.signElement,
        sectElement: p.sectElement,
        signQuality: p.signQuality,
        esms: p.esms,
      })),
    };
  });

  const diurnals = dates.map((d) => isDiurnalSect(d, 37.7749, -122.4194));

  // 4. Static Ingredient Catalog Domain Distribution & Rich Sampling
  const ingredientService = UnifiedIngredientService.getInstance();
  const allIngredients = ingredientService.getAllIngredients();
  const categoryCounts: Record<string, number> = {};
  for (const [cat, list] of Object.entries(allIngredients).sort(([a], [b]) => a.localeCompare(b))) {
    categoryCounts[cat] = list.length;
  }

  // Sample 10 canonical ingredients across categories with real varying fields
  const sampleNames = [
    "garlic",
    "ginger",
    "olive oil",
    "tomato",
    "basil",
    "rice",
    "black pepper",
    "salmon",
    "chicken",
    "lemon",
  ];
  const sampleItems = sampleNames.map((name) => {
    const item = ingredientService.getIngredientByName(name);
    return {
      name,
      found: Boolean(item),
      category: item?.category ?? null,
      elementalProperties: item?.elementalProperties ?? null,
      qualities: item?.qualities ?? [],
      tasteProfile: item?.sensoryProfile?.tasteProfile ?? null,
    };
  });

  // 5. Flavor Compatibility & Resonance Engine
  const sampleProfiles = [
    { sweet: 0.8, sour: 0.2, salty: 0.1, bitter: 0.0, umami: 0.3, spicy: 0.0 },
    { sweet: 0.1, sour: 0.1, salty: 0.7, bitter: 0.2, umami: 0.8, spicy: 0.4 },
    { sweet: 0.0, sour: 0.4, salty: 0.2, bitter: 0.5, umami: 0.1, spicy: 0.8 },
  ];

  const flavorCompatibility = {
    pairScores: sampleProfiles.map((p1, idx1) =>
      sampleProfiles.map((p2, idx2) => ({
        pair: `${idx1}-${idx2}`,
        result: calculateFlavorCompatibility(p1, p2),
      })),
    ),
    cuisineMatches: ["Italian", "Mexican", "Japanese", "Indian"].map((cuisine) => ({
      cuisine,
      scores: sampleProfiles.map((p) => calculateCuisineFlavorMatch(p, cuisine)),
    })),
    planetaryMatches: ["Mars", "Venus", "Jupiter", "Saturn"].map((planet) => ({
      planet,
      scores: sampleProfiles.map((p) =>
        calculatePlanetaryFlavorMatch(p, { [planet]: 0.9, Sun: 0.3 }),
      ),
    })),
  };

  return {
    serverPlanetary,
    ascendants,
    livePositions,
    skySnapshots,
    diurnals,
    catalog: {
      categoryCounts,
      totalIngredients: Object.values(categoryCounts).reduce((a, b) => a + b, 0),
      samples: sampleItems,
    },
    flavorCompatibility,
  };
}

// ---------------------------------------------------------------------------
// CLI Execution & Assertion
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isRecordMode = args.includes("--record");

const currentSnapshot = generateSnapshot();
const currentJson = JSON.stringify(currentSnapshot, null, 2);

if (isRecordMode) {
  mkdirSync(dirname(FIXTURE_PATH), { recursive: true });
  writeFileSync(FIXTURE_PATH, currentJson + "\n", "utf8");
  process.stderr.write(`✅ Snapshot baseline recorded to ${FIXTURE_PATH}\n`);
  process.exit(0);
}

if (!existsSync(FIXTURE_PATH)) {
  process.stderr.write(
    `❌ Snapshot baseline fixture not found at ${FIXTURE_PATH}. Run with --record first.\n`,
  );
  process.exit(1);
}

const baselineJson = readFileSync(FIXTURE_PATH, "utf8").trim();

if (currentJson === baselineJson) {
  process.stderr.write("✅ Behavioral snapshot witness: 100% parity with baseline.\n");
  process.exit(0);
} else {
  process.stderr.write("❌ Behavioral snapshot witness mismatch! Domain regressions detected.\n");
  // Simple diff preview
  const baselineObj = JSON.parse(baselineJson);
  for (const key of Object.keys(currentSnapshot) as Array<keyof typeof currentSnapshot>) {
    const curStr = JSON.stringify(currentSnapshot[key]);
    const baseStr = JSON.stringify(baselineObj[key]);
    if (curStr !== baseStr) {
      process.stderr.write(`  Mismatch in section: '${key}'\n`);
    }
  }
  process.exit(1);
}
