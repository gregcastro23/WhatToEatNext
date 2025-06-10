// TODO: Fix import - was: import from "./calculations/core/kalchmEngine.ts";
// Test script for K_alchm and Monica Constant calculations

import { alchemize } from '../src/calculations/alchemicalEngine';

// Mock planetary positions for testing
const testPositions = {
  Sun: "Gemini",
  Moon: "Leo", 
  Mercury: "Taurus",
  Venus: "Gemini",
  Mars: "Aries",
  Jupiter: "Gemini", 
  Saturn: "Pisces",
  Uranus: "Taurus",
  Neptune: "Aries",
  Pluto: "Aquarius"
};

// Calculate alchemical metrics using the main engine
const metrics = alchemize(testPositions);

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
export function calculateKAlchm(spirit: number, essence: number, matter: number, substance: number): number {
  if (matter === 0 || substance === 0) {
    return 0; // Avoid division by zero
  }
  return (Math.pow(spirit, spirit) * Math.pow(essence, essence)) / 
         (Math.pow(matter, matter) * Math.pow(substance, substance));
}

export function calculateMonicaConstant(energy: number, reactivity: number, kAlchm: number): number {
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

// Sample values
const Spirit = 4;
const Essence = 7;
const Matter = 6;
const Substance = 2;

// Sample thermodynamic values
const Fire = 1.0;
const Water = 0.6;
const Air = 0.6;
const Earth = 0.7;

// Calculate denominator values
const denominator1 = Substance + Essence + Matter + Water + Air + Earth;
const denominator2 = Essence + Matter + Earth + Water;
const denominator3 = Matter + Earth;

// Calculate thermodynamic properties
const heat = (Math.pow(Spirit, 2) + Math.pow(Fire, 2)) / Math.pow(denominator1, 2);
const entropy = (Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2)) / Math.pow(denominator2, 2);
const reactivity = (Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2) + Math.pow(Water, 2)) / Math.pow(denominator3, 2);
const energy = heat - (reactivity * entropy);

// Calculate K_alchm and Monica Constant
const kAlchm = calculateKAlchm(Spirit, Essence, Matter, Substance);
const monicaConstant = calculateMonicaConstant(energy, reactivity, kAlchm);

// Log the results
console.log('Input values:');
console.log(`Spirit: ${Spirit}`);
console.log(`Essence: ${Essence}`);
console.log(`Matter: ${Matter}`);
console.log(`Substance: ${Substance}`);
console.log(`Fire: ${Fire}`);
console.log(`Water: ${Water}`);
console.log(`Air: ${Air}`);
console.log(`Earth: ${Earth}`);
console.log('\nIntermediate calculations:');
console.log(`Heat: ${heat}`);
console.log(`Entropy: ${entropy}`);
console.log(`Reactivity: ${reactivity}`);
console.log(`Energy: ${energy}`);
console.log('\nFinal results:');
console.log(`K_alchm: ${kAlchm}`);
console.log(`Monica Constant: ${monicaConstant}`); 