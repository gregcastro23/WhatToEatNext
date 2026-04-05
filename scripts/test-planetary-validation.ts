/**
 * Test Script for Planetary Validation
 *
 * Tests the astronomical validation logic with known-good and known-bad data
 *
 * Run with: npx tsx scripts/test-planetary-validation.ts
 */

import { validatePlanetaryPositions, formatValidationResult } from "../src/utils/astrology/planetaryValidation";
import type { PlanetPosition } from "../src/utils/astrologyUtils";

// Test Case 1: Valid birth chart from May 15, 1990
const test1990Positions: Record<string, PlanetPosition> = {
  Sun: { sign: "taurus", degree: 24, minute: 30, exactLongitude: 54.5, isRetrograde: false },
  Moon: { sign: "leo", degree: 12, minute: 15, exactLongitude: 132.25, isRetrograde: false },
  Mercury: { sign: "taurus", degree: 10, minute: 0, exactLongitude: 40.0, isRetrograde: false }, // Within 1 sign of Sun
  Venus: { sign: "gemini", degree: 5, minute: 0, exactLongitude: 65.0, isRetrograde: false }, // Within 2 signs of Sun
  Mars: { sign: "pisces", degree: 18, minute: 0, exactLongitude: 348.0, isRetrograde: false },
  Jupiter: { sign: "cancer", degree: 5, minute: 0, exactLongitude: 95.0, isRetrograde: false }, // Correct for 1990
  Saturn: { sign: "capricorn", degree: 20, minute: 0, exactLongitude: 290.0, isRetrograde: false }, // Correct for 1990
  Uranus: { sign: "capricorn", degree: 8, minute: 0, exactLongitude: 278.0, isRetrograde: false }, // Correct for 1990
  Neptune: { sign: "capricorn", degree: 12, minute: 0, exactLongitude: 282.0, isRetrograde: false }, // Correct for 1990
  Pluto: { sign: "scorpio", degree: 15, minute: 0, exactLongitude: 225.0, isRetrograde: false }, // Correct for 1990
  Ascendant: { sign: "virgo", degree: 10, minute: 0, exactLongitude: 160.0, isRetrograde: false },
};

// Test Case 2: INVALID - Mercury too far from Sun
const testMercuryTooFar: Record<string, PlanetPosition> = {
  Sun: { sign: "taurus", degree: 15, minute: 0, exactLongitude: 45.0, isRetrograde: false },
  Moon: { sign: "leo", degree: 10, minute: 0, exactLongitude: 130.0, isRetrograde: false },
  Mercury: { sign: "cancer", degree: 20, minute: 0, exactLongitude: 110.0, isRetrograde: false }, // 65° from Sun - INVALID!
  Venus: { sign: "gemini", degree: 5, minute: 0, exactLongitude: 65.0, isRetrograde: false },
  Mars: { sign: "pisces", degree: 18, minute: 0, exactLongitude: 348.0, isRetrograde: false },
  Jupiter: { sign: "cancer", degree: 5, minute: 0, exactLongitude: 95.0, isRetrograde: false },
  Saturn: { sign: "capricorn", degree: 20, minute: 0, exactLongitude: 290.0, isRetrograde: false },
  Uranus: { sign: "capricorn", degree: 8, minute: 0, exactLongitude: 278.0, isRetrograde: false },
  Neptune: { sign: "capricorn", degree: 12, minute: 0, exactLongitude: 282.0, isRetrograde: false },
  Pluto: { sign: "scorpio", degree: 15, minute: 0, exactLongitude: 225.0, isRetrograde: false },
};

// Test Case 3: INVALID - Jupiter in wrong sign for 1990
const testJupiterWrongSign: Record<string, PlanetPosition> = {
  Sun: { sign: "taurus", degree: 24, minute: 30, exactLongitude: 54.5, isRetrograde: false },
  Moon: { sign: "leo", degree: 12, minute: 15, exactLongitude: 132.25, isRetrograde: false },
  Mercury: { sign: "taurus", degree: 10, minute: 0, exactLongitude: 40.0, isRetrograde: false },
  Venus: { sign: "gemini", degree: 5, minute: 0, exactLongitude: 65.0, isRetrograde: false },
  Mars: { sign: "pisces", degree: 18, minute: 0, exactLongitude: 348.0, isRetrograde: false },
  Jupiter: { sign: "aries", degree: 5, minute: 0, exactLongitude: 5.0, isRetrograde: false }, // WRONG for 1990!
  Saturn: { sign: "capricorn", degree: 20, minute: 0, exactLongitude: 290.0, isRetrograde: false },
  Uranus: { sign: "capricorn", degree: 8, minute: 0, exactLongitude: 278.0, isRetrograde: false },
  Neptune: { sign: "capricorn", degree: 12, minute: 0, exactLongitude: 282.0, isRetrograde: false },
  Pluto: { sign: "scorpio", degree: 15, minute: 0, exactLongitude: 225.0, isRetrograde: false },
};

// Test Case 4: INVALID - Birth date is today (common bug)
const testTodayPositions: Record<string, PlanetPosition> = {
  Sun: { sign: "aries", degree: 15, minute: 0, exactLongitude: 15.0, isRetrograde: false }, // Current position
  Moon: { sign: "gemini", degree: 10, minute: 0, exactLongitude: 70.0, isRetrograde: false },
  Mercury: { sign: "aries", degree: 5, minute: 0, exactLongitude: 5.0, isRetrograde: false },
  Venus: { sign: "pisces", degree: 20, minute: 0, exactLongitude: 350.0, isRetrograde: false },
  Mars: { sign: "leo", degree: 18, minute: 0, exactLongitude: 138.0, isRetrograde: false },
  Jupiter: { sign: "taurus", degree: 26, minute: 0, exactLongitude: 56.0, isRetrograde: false }, // 2024 position
  Saturn: { sign: "pisces", degree: 12, minute: 0, exactLongitude: 342.0, isRetrograde: false }, // 2024 position
  Uranus: { sign: "taurus", degree: 27, minute: 0, exactLongitude: 57.0, isRetrograde: false }, // 2024 position
  Neptune: { sign: "pisces", degree: 28, minute: 0, exactLongitude: 358.0, isRetrograde: false }, // 2024 position
  Pluto: { sign: "aquarius", degree: 3, minute: 0, exactLongitude: 303.0, isRetrograde: false }, // 2024 position
};

function runTest(name: string, positions: Record<string, PlanetPosition>, birthDate: Date) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`TEST: ${name}`);
  console.log(`${"=".repeat(80)}`);
  console.log(`Birth Date: ${birthDate.toISOString()}`);
  console.log(`\nPositions:`);
  console.log(JSON.stringify(positions, null, 2));

  const result = validatePlanetaryPositions(positions, birthDate);
  const formatted = formatValidationResult(result);

  console.log(`\n${formatted}`);

  if (result.errors.length > 0) {
    console.log(`\n❌ Expected result: ${name.includes("INVALID") ? "FAIL" : "PASS"}`);
    console.log(`✅ Actual result: FAIL`);
    console.log(`   ${name.includes("INVALID") ? "CORRECT ✅" : "INCORRECT ❌"}`);
  } else {
    console.log(`\n✅ Expected result: ${name.includes("INVALID") ? "FAIL" : "PASS"}`);
    console.log(`✅ Actual result: PASS`);
    console.log(`   ${!name.includes("INVALID") ? "CORRECT ✅" : "INCORRECT ❌"}`);
  }
}

// Run all tests
console.log("\n🧪 PLANETARY VALIDATION TEST SUITE\n");

runTest(
  "Valid 1990 Birth Chart",
  test1990Positions,
  new Date("1990-05-15T14:30:00.000Z")
);

runTest(
  "INVALID - Mercury Too Far from Sun",
  testMercuryTooFar,
  new Date("1990-05-15T14:30:00.000Z")
);

runTest(
  "INVALID - Jupiter in Wrong Sign for 1990",
  testJupiterWrongSign,
  new Date("1990-05-15T14:30:00.000Z")
);

runTest(
  "INVALID - Birth Date is Today",
  testTodayPositions,
  new Date() // Today!
);

console.log(`\n${"=".repeat(80)}`);
console.log("TEST SUITE COMPLETE");
console.log(`${"=".repeat(80)}\n`);
