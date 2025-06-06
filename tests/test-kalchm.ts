// TODO: Fix import - was: import from "./calculations/core/kalchmEngine.ts";
// Test script for K_alchm and Monica Constant calculations


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