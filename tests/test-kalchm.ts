// TODO: Fix import - was: import from "./calculations/core/kalchmEngine.ts";
// Test script for K_alchm and Monica Constant calculations

import { alchemize } from '../src/calculations/alchemicalEngine';

// Mock planetary positions for testing
const testPositions = {
  Sun: 'Gemini',
  Moon: 'Leo',
  Mercury: 'Taurus',
  Venus: 'Gemini',
  Mars: 'Aries',
  Jupiter: 'Gemini',
  Saturn: 'Pisces',
  Uranus: 'Taurus',
  Neptune: 'Aries',
  Pluto: 'Aquarius',
};

// Calculate alchemical metrics using the main engine
const metrics = (alchemize as any)(testPositions, {});

// Apply safe type casting for metrics access
const metricsData = metrics as any;
const heat = metricsData?.heat || 0;
const entropy = metricsData?.entropy || 0;
const reactivity = metricsData?.reactivity || 0;
const gregsEnergy = metricsData?.gregsEnergy || 0;
const kalchm = metricsData?.kalchm || 0;
const monica = metricsData?.monica || 0;

console.log('🧙‍♂️ ALCHEMICAL METRICS:');
console.log(`  Heat: ${heat.toFixed(4)}`);
console.log(`  Entropy: ${entropy.toFixed(4)}`);
console.log(`  Reactivity: ${reactivity.toFixed(4)}`);
console.log(`  Greg's Energy: ${gregsEnergy.toFixed(4)}`);
console.log(`  K_alchm: ${kalchm.toFixed(4)}`);
console.log(`  Monica Constant: ${monica.toFixed(4)}`);

// Legacy functions for backward compatibility
export function calculateKAlchm(
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
): number {
  if (matter === 0 || substance === 0) {
    return 0; // Avoid division by zero
  }
  return (
    (Math.pow(spirit, spirit) * Math.pow(essence, essence)) /
    (Math.pow(matter, matter) * Math.pow(substance, substance))
  );
}

export function calculateMonicaConstant(
  energy: number,
  reactivity: number,
  kAlchm: number,
): number {
  if (reactivity === 0 || kAlchm <= 0) {
    return NaN; // Invalid parameters
  }
  const lnK = Math.log(kAlchm);
  if (lnK === 0) {
    return NaN;
  }
  return -energy / (reactivity * lnK);
}

// Test the legacy functions
const Spirit = 5;
const Essence = 3;
const Matter = 2;
const Substance = 1;
const energy = gregsEnergy;
const reactivityValue = reactivity;

const kAlchm = calculateKAlchm(Spirit, Essence, Matter, Substance);
const monicaConstant = calculateMonicaConstant(energy, reactivityValue, kAlchm);

console.log('\n🔮 LEGACY CALCULATION TEST:');
console.log(`  Legacy K_alchm: ${kAlchm.toFixed(4)}`);
console.log(`  Legacy Monica: ${monicaConstant.toFixed(4)}`);

// Sample values for separate test
const testSpirit = 4;
const testEssence = 7;
const testMatter = 6;
const testSubstance = 2;

// Sample thermodynamic values
const testFire = 1.0;
const testWater = 0.6;
const testAir = 0.6;
const testEarth = 0.7;

// Calculate denominator values
const denominator1 = testSubstance + testEssence + testMatter + testWater + testAir + testEarth;
const denominator2 = testEssence + testMatter + testEarth + testWater;
const denominator3 = testMatter + testEarth;

// Calculate thermodynamic properties
const testHeat = (Math.pow(testSpirit, 2) + Math.pow(testFire, 2)) / Math.pow(denominator1, 2);
const testEntropy =
  (Math.pow(testSpirit, 2) +
    Math.pow(testSubstance, 2) +
    Math.pow(testFire, 2) +
    Math.pow(testAir, 2)) /
  Math.pow(denominator2, 2);
const testReactivity =
  (Math.pow(testSpirit, 2) +
    Math.pow(testSubstance, 2) +
    Math.pow(testEssence, 2) +
    Math.pow(testFire, 2) +
    Math.pow(testAir, 2) +
    Math.pow(testWater, 2)) /
  Math.pow(denominator3, 2);
const testEnergy = testHeat - testReactivity * testEntropy;

// Calculate K_alchm and Monica Constant
const testKAlchm = calculateKAlchm(testSpirit, testEssence, testMatter, testSubstance);
const testMonicaConstant = calculateMonicaConstant(testEnergy, testReactivity, testKAlchm);

// Log the results
console.log('\n📊 SAMPLE CALCULATION TEST:');
console.log(`  Spirit: ${testSpirit}`);
console.log(`  Essence: ${testEssence}`);
console.log(`  Matter: ${testMatter}`);
console.log(`  Substance: ${testSubstance}`);
console.log(`  Fire: ${testFire}`);
console.log(`  Water: ${testWater}`);
console.log(`  Air: ${testAir}`);
console.log(`  Earth: ${testEarth}`);
console.log('\n  Final Results:');
console.log(`  K_alchm: ${testKAlchm.toFixed(4)}`);
console.log(`  Monica Constant: ${testMonicaConstant.toFixed(4)}`);
