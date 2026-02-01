#!/usr/bin/env ts-node
/**
 * Write Enriched Recipe Data Script
 *
 * This script reads cuisine files, enriches recipes with calculated elemental
 * properties, planetary influences, seasonal alignment, and nutrition data,
 * then writes the enriched data back to the source files.
 *
 * Usage:
 *   npx ts-node scripts/writeEnrichedData.ts [--dry-run]
 *
 * Options:
 *   --dry-run  Show what would be changed without writing files
 *
 * @file scripts/writeEnrichedData.ts
 * @created 2026-02-01
 */

import * as fs from "fs";
import * as path from "path";

// Types
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface RecipeIngredient {
  name: string;
  amount: string | number;
  unit: string;
  category?: string;
}

// Ingredient elemental mappings (same as in RecipeDataEnricher)
const INGREDIENT_ELEMENTAL_MAP: Record<string, ElementalProperties> = {
  // Spicy/Hot ingredients - Fire dominant
  chili: { Fire: 0.7, Water: 0.0, Earth: 0.1, Air: 0.2 },
  pepper: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
  cayenne: { Fire: 0.8, Water: 0.0, Earth: 0.1, Air: 0.1 },
  jalapeno: { Fire: 0.65, Water: 0.1, Earth: 0.15, Air: 0.1 },
  ginger: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
  garlic: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
  onion: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
  mustard: { Fire: 0.55, Water: 0.1, Earth: 0.25, Air: 0.1 },
  curry: { Fire: 0.55, Water: 0.1, Earth: 0.25, Air: 0.1 },
  paprika: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
  cinnamon: { Fire: 0.45, Water: 0.1, Earth: 0.35, Air: 0.1 },
  clove: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
  turmeric: { Fire: 0.45, Water: 0.15, Earth: 0.3, Air: 0.1 },
  cumin: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },

  // Watery/Hydrating ingredients - Water dominant
  water: { Fire: 0.0, Water: 0.9, Earth: 0.0, Air: 0.1 },
  broth: { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
  stock: { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
  milk: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  cream: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  yogurt: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  coconut: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  cucumber: { Fire: 0.0, Water: 0.7, Earth: 0.2, Air: 0.1 },
  tomato: { Fire: 0.3, Water: 0.5, Earth: 0.1, Air: 0.1 },
  wine: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  vinegar: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  lemon: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  lime: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  orange: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  fish: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  seafood: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  shrimp: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  salmon: { Fire: 0.15, Water: 0.5, Earth: 0.25, Air: 0.1 },
  tuna: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  soup: { Fire: 0.15, Water: 0.65, Earth: 0.1, Air: 0.1 },
  sauce: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },

  // Grounding/Heavy ingredients - Earth dominant
  potato: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  rice: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
  bread: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  pasta: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  noodle: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  flour: { Fire: 0.1, Water: 0.1, Earth: 0.6, Air: 0.2 },
  wheat: { Fire: 0.1, Water: 0.1, Earth: 0.6, Air: 0.2 },
  oat: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  corn: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  bean: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  lentil: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  chickpea: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  mushroom: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
  carrot: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  cheese: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  beef: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  pork: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  lamb: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  meat: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  tofu: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
  nut: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  egg: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  butter: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  chicken: { Fire: 0.25, Water: 0.25, Earth: 0.35, Air: 0.15 },
  duck: { Fire: 0.3, Water: 0.25, Earth: 0.35, Air: 0.1 },

  // Light/Aromatic ingredients - Air dominant
  herb: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
  basil: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  mint: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  cilantro: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
  parsley: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
  dill: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  thyme: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  rosemary: { Fire: 0.3, Water: 0.1, Earth: 0.1, Air: 0.5 },
  oregano: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  sage: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  lemongrass: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  scallion: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  spinach: { Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.4 },
  kale: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  cabbage: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  broccoli: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  lettuce: { Fire: 0.05, Water: 0.6, Earth: 0.15, Air: 0.2 },

  // Oils and fats
  oil: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  olive: { Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2 },
  sesame: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  ghee: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },

  // Sweeteners
  sugar: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
  honey: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
  maple: { Fire: 0.25, Water: 0.25, Earth: 0.4, Air: 0.1 },
  chocolate: { Fire: 0.25, Water: 0.2, Earth: 0.45, Air: 0.1 },

  // Sauces and condiments
  soy: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
  miso: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  tahini: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },

  // Coffee and tea
  coffee: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
  espresso: { Fire: 0.5, Water: 0.3, Earth: 0.15, Air: 0.05 },
  tea: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  matcha: { Fire: 0.25, Water: 0.4, Earth: 0.15, Air: 0.2 },

  // Fruits
  apple: { Fire: 0.15, Water: 0.5, Earth: 0.2, Air: 0.15 },
  banana: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
  berry: { Fire: 0.2, Water: 0.5, Earth: 0.15, Air: 0.15 },
  mango: { Fire: 0.25, Water: 0.5, Earth: 0.15, Air: 0.1 },
  papaya: { Fire: 0.2, Water: 0.55, Earth: 0.15, Air: 0.1 },
  pineapple: { Fire: 0.25, Water: 0.55, Earth: 0.1, Air: 0.1 },

  // Thai/Southeast Asian ingredients
  galangal: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
  pandan: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  shallot: { Fire: 0.35, Water: 0.25, Earth: 0.3, Air: 0.1 },
  tamarind: { Fire: 0.15, Water: 0.5, Earth: 0.25, Air: 0.1 },
  "nam prik pao": { Fire: 0.55, Water: 0.2, Earth: 0.15, Air: 0.1 },
  "morning glory": { Fire: 0.1, Water: 0.35, Earth: 0.15, Air: 0.4 },
  jackfruit: { Fire: 0.15, Water: 0.45, Earth: 0.3, Air: 0.1 },
  "palm sugar": { Fire: 0.25, Water: 0.25, Earth: 0.4, Air: 0.1 },
  "star anise": { Fire: 0.45, Water: 0.1, Earth: 0.3, Air: 0.15 },
  "five spice": { Fire: 0.45, Water: 0.1, Earth: 0.3, Air: 0.15 },
  cardamom: { Fire: 0.4, Water: 0.15, Earth: 0.25, Air: 0.2 },
  kabocha: { Fire: 0.15, Water: 0.3, Earth: 0.45, Air: 0.1 },
  pumpkin: { Fire: 0.15, Water: 0.3, Earth: 0.45, Air: 0.1 },
  squash: { Fire: 0.15, Water: 0.3, Earth: 0.45, Air: 0.1 },

  // French ingredients
  shallots: { Fire: 0.35, Water: 0.25, Earth: 0.3, Air: 0.1 },
  "crème fraîche": { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  brioche: { Fire: 0.2, Water: 0.15, Earth: 0.5, Air: 0.15 },
  baguette: { Fire: 0.2, Water: 0.1, Earth: 0.55, Air: 0.15 },
  croissant: { Fire: 0.2, Water: 0.15, Earth: 0.5, Air: 0.15 },
  anchovy: { Fire: 0.2, Water: 0.55, Earth: 0.2, Air: 0.05 },
  anchovies: { Fire: 0.2, Water: 0.55, Earth: 0.2, Air: 0.05 },
  cognac: { Fire: 0.35, Water: 0.4, Earth: 0.15, Air: 0.1 },
  brandy: { Fire: 0.35, Water: 0.4, Earth: 0.15, Air: 0.1 },
  sole: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
  "sea bass": { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
  bacon: { Fire: 0.35, Water: 0.15, Earth: 0.45, Air: 0.05 },
  pancetta: { Fire: 0.35, Water: 0.15, Earth: 0.45, Air: 0.05 },
  lardons: { Fire: 0.35, Water: 0.15, Earth: 0.45, Air: 0.05 },
  ham: { Fire: 0.2, Water: 0.25, Earth: 0.5, Air: 0.05 },
  pastry: { Fire: 0.15, Water: 0.1, Earth: 0.55, Air: 0.2 },
  "choux pastry": { Fire: 0.2, Water: 0.15, Earth: 0.5, Air: 0.15 },
  "shortcrust": { Fire: 0.15, Water: 0.1, Earth: 0.6, Air: 0.15 },
  "bay leaf": { Fire: 0.15, Water: 0.15, Earth: 0.2, Air: 0.5 },
  "bouquet garni": { Fire: 0.15, Water: 0.15, Earth: 0.15, Air: 0.55 },
  yeast: { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.4 },

  // Common seasonings
  salt: { Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 },
  "sea salt": { Fire: 0.1, Water: 0.15, Earth: 0.65, Air: 0.1 },

  // Ice/frozen ingredients
  ice: { Fire: 0.0, Water: 0.85, Earth: 0.05, Air: 0.1 },
  "shaved ice": { Fire: 0.0, Water: 0.85, Earth: 0.05, Air: 0.1 },
  "crushed ice": { Fire: 0.0, Water: 0.85, Earth: 0.05, Air: 0.1 },

  // Syrups and jellies
  syrup: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
  "grass jelly": { Fire: 0.05, Water: 0.55, Earth: 0.3, Air: 0.1 },

  // Additional seafood
  prawn: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  prawns: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  "tiger prawns": { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  crab: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  lobster: { Fire: 0.15, Water: 0.55, Earth: 0.2, Air: 0.1 },
  mussel: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  mussels: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  clam: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  oyster: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  scallop: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },

  // Vinaigrettes and dressings
  vinaigrette: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  dressing: { Fire: 0.2, Water: 0.45, Earth: 0.2, Air: 0.15 },
};

// Cooking method elemental mappings (extracted from src/data/cooking/cookingMethods.ts)
const METHOD_ELEMENTAL_MAP: Record<string, ElementalProperties> = {
  // High heat methods - Fire dominant
  roasting: { Fire: 0.8, Water: 0.1, Earth: 0.3, Air: 0.5 },
  roast: { Fire: 0.8, Water: 0.1, Earth: 0.3, Air: 0.5 },
  grilling: { Fire: 0.9, Water: 0.1, Earth: 0.2, Air: 0.6 },
  grill: { Fire: 0.9, Water: 0.1, Earth: 0.2, Air: 0.6 },
  grilled: { Fire: 0.9, Water: 0.1, Earth: 0.2, Air: 0.6 },
  charring: { Fire: 0.95, Water: 0.05, Earth: 0.2, Air: 0.6 },
  broiling: { Fire: 0.85, Water: 0.1, Earth: 0.2, Air: 0.55 },
  searing: { Fire: 0.9, Water: 0.1, Earth: 0.2, Air: 0.5 },

  // Pan/Oil cooking - Fire with Earth
  frying: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  fry: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  fried: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  "deep-frying": { Fire: 0.75, Water: 0.1, Earth: 0.35, Air: 0.45 },
  "deep-fried": { Fire: 0.75, Water: 0.1, Earth: 0.35, Air: 0.45 },
  sauteing: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  saute: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  sautéing: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  sauté: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.5 },
  "stir-frying": { Fire: 0.75, Water: 0.15, Earth: 0.25, Air: 0.55 },
  "stir-fry": { Fire: 0.75, Water: 0.15, Earth: 0.25, Air: 0.55 },
  "pan-frying": { Fire: 0.7, Water: 0.15, Earth: 0.35, Air: 0.45 },
  toasting: { Fire: 0.65, Water: 0.1, Earth: 0.4, Air: 0.45 },

  // Oven methods - Fire with Air
  baking: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.7 },
  bake: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.7 },
  baked: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.7 },

  // Wet cooking methods - Water dominant
  boiling: { Fire: 0.4, Water: 1.0, Earth: 0.2, Air: 0.1 },
  boil: { Fire: 0.4, Water: 1.0, Earth: 0.2, Air: 0.1 },
  boiled: { Fire: 0.4, Water: 1.0, Earth: 0.2, Air: 0.1 },
  steaming: { Fire: 0.1, Water: 0.9, Earth: 0.2, Air: 0.4 },
  steam: { Fire: 0.1, Water: 0.9, Earth: 0.2, Air: 0.4 },
  steamed: { Fire: 0.1, Water: 0.9, Earth: 0.2, Air: 0.4 },
  simmering: { Fire: 0.3, Water: 0.8, Earth: 0.25, Air: 0.15 },
  simmer: { Fire: 0.3, Water: 0.8, Earth: 0.25, Air: 0.15 },
  simmered: { Fire: 0.3, Water: 0.8, Earth: 0.25, Air: 0.15 },
  poaching: { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.3 },
  poach: { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.3 },
  poached: { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.3 },
  blanching: { Fire: 0.35, Water: 0.85, Earth: 0.15, Air: 0.2 },
  blanch: { Fire: 0.35, Water: 0.85, Earth: 0.15, Air: 0.2 },
  "water bath": { Fire: 0.2, Water: 0.9, Earth: 0.2, Air: 0.2 },

  // Mixed methods - Water and Fire
  braising: { Fire: 0.5, Water: 0.7, Earth: 0.6, Air: 0.2 },
  braise: { Fire: 0.5, Water: 0.7, Earth: 0.6, Air: 0.2 },
  braised: { Fire: 0.5, Water: 0.7, Earth: 0.6, Air: 0.2 },
  stewing: { Fire: 0.4, Water: 0.75, Earth: 0.55, Air: 0.15 },
  stew: { Fire: 0.4, Water: 0.75, Earth: 0.55, Air: 0.15 },

  // Pressure/Slow cooking
  pressure_cooking: { Fire: 0.5, Water: 0.7, Earth: 0.6, Air: 0.3 },
  "pressure cooking": { Fire: 0.5, Water: 0.7, Earth: 0.6, Air: 0.3 },
  sous_vide: { Fire: 0.2, Water: 0.8, Earth: 0.4, Air: 0.2 },
  "sous vide": { Fire: 0.2, Water: 0.8, Earth: 0.4, Air: 0.2 },
  "slow-cooking": { Fire: 0.35, Water: 0.7, Earth: 0.6, Air: 0.15 },

  // Smoking/Curing - Air and Fire
  smoking: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.8 },
  smoke: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.8 },
  smoked: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.8 },
  curing: { Fire: 0.2, Water: 0.3, Earth: 0.7, Air: 0.4 },
  cured: { Fire: 0.2, Water: 0.3, Earth: 0.7, Air: 0.4 },
  drying: { Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.9 },
  dehydrating: { Fire: 0.4, Water: 0.1, Earth: 0.5, Air: 0.9 },

  // Fermentation - Earth and Water
  fermenting: { Fire: 0.1, Water: 0.6, Earth: 0.7, Air: 0.4 },
  ferment: { Fire: 0.1, Water: 0.6, Earth: 0.7, Air: 0.4 },
  fermented: { Fire: 0.1, Water: 0.6, Earth: 0.7, Air: 0.4 },
  pickling: { Fire: 0.1, Water: 0.7, Earth: 0.5, Air: 0.3 },
  pickled: { Fire: 0.1, Water: 0.7, Earth: 0.5, Air: 0.3 },

  // Raw/Cold methods - Water and Air
  raw: { Fire: 0.0, Water: 0.5, Earth: 0.3, Air: 0.6 },
  chilling: { Fire: 0.0, Water: 0.7, Earth: 0.2, Air: 0.4 },
  freezing: { Fire: 0.0, Water: 0.9, Earth: 0.3, Air: 0.2 },
  marinating: { Fire: 0.2, Water: 0.7, Earth: 0.3, Air: 0.4 },
  marinate: { Fire: 0.2, Water: 0.7, Earth: 0.3, Air: 0.4 },

  // Mixing/Preparation - Air dominant
  whipping: { Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.9 },
  whip: { Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.9 },
  mixing: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.7 },
  blending: { Fire: 0.15, Water: 0.4, Earth: 0.25, Air: 0.75 },
  folding: { Fire: 0.05, Water: 0.25, Earth: 0.25, Air: 0.85 },
  kneading: { Fire: 0.2, Water: 0.2, Earth: 0.6, Air: 0.4 },
  whisking: { Fire: 0.1, Water: 0.35, Earth: 0.15, Air: 0.85 },

  // Specialty methods
  caramelizing: { Fire: 0.8, Water: 0.1, Earth: 0.4, Air: 0.3 },
  reducing: { Fire: 0.5, Water: 0.6, Earth: 0.3, Air: 0.35 },
  deglazing: { Fire: 0.5, Water: 0.7, Earth: 0.2, Air: 0.3 },
  infusing: { Fire: 0.2, Water: 0.6, Earth: 0.3, Air: 0.5 },
  brewing: { Fire: 0.4, Water: 0.7, Earth: 0.2, Air: 0.4 },
  warming: { Fire: 0.4, Water: 0.3, Earth: 0.3, Air: 0.3 },
  reheating: { Fire: 0.5, Water: 0.3, Earth: 0.3, Air: 0.3 },

  // Cutting/Prep - Earth dominant
  chopping: { Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.4 },
  slicing: { Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.4 },
  dicing: { Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.4 },
  mincing: { Fire: 0.15, Water: 0.15, Earth: 0.65, Air: 0.45 },
  grinding: { Fire: 0.2, Water: 0.1, Earth: 0.8, Air: 0.3 },
  pureeing: { Fire: 0.15, Water: 0.5, Earth: 0.4, Air: 0.45 },
  mashing: { Fire: 0.15, Water: 0.3, Earth: 0.7, Air: 0.25 },

  // Additional culinary methods
  "sauce-making": { Fire: 0.4, Water: 0.5, Earth: 0.3, Air: 0.3 },
  soaking: { Fire: 0.0, Water: 0.9, Earth: 0.2, Air: 0.1 },
  assembling: { Fire: 0.05, Water: 0.2, Earth: 0.5, Air: 0.5 },
  "pastry-making": { Fire: 0.3, Water: 0.2, Earth: 0.6, Air: 0.5 },
  piping: { Fire: 0.05, Water: 0.3, Earth: 0.3, Air: 0.7 },
  glazing: { Fire: 0.4, Water: 0.3, Earth: 0.3, Air: 0.4 },
  coating: { Fire: 0.2, Water: 0.3, Earth: 0.5, Air: 0.4 },
  stuffing: { Fire: 0.1, Water: 0.2, Earth: 0.7, Air: 0.3 },
  layering: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.4 },
  resting: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.4 },
  tempering: { Fire: 0.4, Water: 0.3, Earth: 0.4, Air: 0.3 },
  emulsifying: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.6 },
};

// Cuisine elemental modifiers
const CUISINE_MODIFIERS: Record<string, ElementalProperties> = {
  italian: { Fire: 1.0, Water: 1.0, Earth: 1.2, Air: 1.0 },
  thai: { Fire: 1.3, Water: 1.0, Earth: 0.9, Air: 1.1 },
  indian: { Fire: 1.3, Water: 0.9, Earth: 1.1, Air: 1.0 },
  mexican: { Fire: 1.25, Water: 0.9, Earth: 1.1, Air: 0.95 },
  japanese: { Fire: 0.9, Water: 1.3, Earth: 1.0, Air: 1.0 },
  chinese: { Fire: 1.1, Water: 1.1, Earth: 1.0, Air: 0.95 },
  vietnamese: { Fire: 1.0, Water: 1.2, Earth: 0.9, Air: 1.1 },
  french: { Fire: 0.95, Water: 1.1, Earth: 1.2, Air: 0.95 },
  greek: { Fire: 1.0, Water: 1.0, Earth: 1.1, Air: 1.1 },
  korean: { Fire: 1.2, Water: 1.0, Earth: 1.0, Air: 1.0 },
  american: { Fire: 1.1, Water: 0.95, Earth: 1.15, Air: 0.95 },
  russian: { Fire: 0.9, Water: 1.0, Earth: 1.3, Air: 0.9 },
  african: { Fire: 1.2, Water: 0.9, Earth: 1.1, Air: 1.0 },
  "middle-eastern": { Fire: 1.15, Water: 0.9, Earth: 1.1, Air: 1.05 },
};

// Cooking method modifiers
const COOKING_METHOD_MODIFIERS: Record<string, ElementalProperties> = {
  grilling: { Fire: 1.4, Water: 0.8, Earth: 1.0, Air: 1.1 },
  grill: { Fire: 1.4, Water: 0.8, Earth: 1.0, Air: 1.1 },
  baking: { Fire: 1.2, Water: 0.9, Earth: 1.2, Air: 1.0 },
  bake: { Fire: 1.2, Water: 0.9, Earth: 1.2, Air: 1.0 },
  frying: { Fire: 1.3, Water: 0.7, Earth: 1.0, Air: 1.1 },
  fry: { Fire: 1.3, Water: 0.7, Earth: 1.0, Air: 1.1 },
  "deep-frying": { Fire: 1.35, Water: 0.65, Earth: 1.05, Air: 1.1 },
  steaming: { Fire: 0.8, Water: 1.4, Earth: 0.9, Air: 1.1 },
  steam: { Fire: 0.8, Water: 1.4, Earth: 0.9, Air: 1.1 },
  boiling: { Fire: 0.9, Water: 1.3, Earth: 0.9, Air: 1.0 },
  boil: { Fire: 0.9, Water: 1.3, Earth: 0.9, Air: 1.0 },
  simmering: { Fire: 0.95, Water: 1.25, Earth: 1.0, Air: 0.95 },
  simmer: { Fire: 0.95, Water: 1.25, Earth: 1.0, Air: 0.95 },
  roasting: { Fire: 1.3, Water: 0.8, Earth: 1.1, Air: 1.0 },
  roast: { Fire: 1.3, Water: 0.8, Earth: 1.1, Air: 1.0 },
  sauteing: { Fire: 1.2, Water: 0.9, Earth: 1.0, Air: 1.1 },
  saute: { Fire: 1.2, Water: 0.9, Earth: 1.0, Air: 1.1 },
  "stir-frying": { Fire: 1.35, Water: 0.85, Earth: 0.95, Air: 1.1 },
  "stir-fry": { Fire: 1.35, Water: 0.85, Earth: 0.95, Air: 1.1 },
  braising: { Fire: 1.1, Water: 1.2, Earth: 1.1, Air: 0.9 },
  braise: { Fire: 1.1, Water: 1.2, Earth: 1.1, Air: 0.9 },
  poaching: { Fire: 0.8, Water: 1.35, Earth: 0.9, Air: 1.0 },
  poach: { Fire: 0.8, Water: 1.35, Earth: 0.9, Air: 1.0 },
  fermenting: { Fire: 0.8, Water: 1.1, Earth: 1.3, Air: 1.0 },
  ferment: { Fire: 0.8, Water: 1.1, Earth: 1.3, Air: 1.0 },
  smoking: { Fire: 1.2, Water: 0.8, Earth: 1.0, Air: 1.2 },
  smoke: { Fire: 1.2, Water: 0.8, Earth: 1.0, Air: 1.2 },
  raw: { Fire: 0.7, Water: 1.2, Earth: 0.9, Air: 1.2 },
  marinating: { Fire: 0.9, Water: 1.2, Earth: 1.0, Air: 1.1 },
  marinate: { Fire: 0.9, Water: 1.2, Earth: 1.0, Air: 1.1 },
  whipping: { Fire: 0.8, Water: 1.0, Earth: 0.8, Air: 1.4 },
  mixing: { Fire: 0.9, Water: 1.0, Earth: 1.0, Air: 1.1 },
  toasting: { Fire: 1.25, Water: 0.85, Earth: 1.1, Air: 1.0 },
};

// Planetary keywords
const PLANETARY_KEYWORDS: Record<string, string[]> = {
  Sun: ["bright", "vital", "energizing", "golden", "citrus", "saffron", "honey", "breakfast", "morning"],
  Moon: ["comfort", "nurturing", "mild", "soft", "cream", "milk", "dairy", "soup", "porridge", "soothing"],
  Mercury: ["quick", "light", "varied", "diverse", "snack", "appetizer", "small"],
  Venus: ["elegant", "sweet", "beautiful", "dessert", "romantic", "chocolate", "fruit", "cake", "pastry"],
  Mars: ["spicy", "bold", "hot", "pepper", "chili", "grilled", "red", "meat", "steak", "bbq"],
  Jupiter: ["feast", "abundant", "rich", "celebration", "holiday", "traditional", "hearty"],
  Saturn: ["traditional", "slow", "aged", "fermented", "preserved", "cured", "classic"],
};

// Seasonal ingredients
const SEASONAL_INGREDIENTS: Record<string, string[]> = {
  spring: ["asparagus", "pea", "artichoke", "ramp", "radish", "spinach", "arugula", "mint", "lamb", "strawberry", "rhubarb"],
  summer: ["tomato", "corn", "zucchini", "eggplant", "pepper", "cucumber", "basil", "watermelon", "berry", "peach", "melon"],
  autumn: ["pumpkin", "squash", "apple", "pear", "mushroom", "cranberry", "sweet potato", "brussels", "sage", "cinnamon"],
  winter: ["potato", "carrot", "turnip", "citrus", "kale", "cabbage", "leek", "onion", "garlic", "nut", "root"],
};

/**
 * Find matching elemental properties for an ingredient
 */
function findIngredientElementals(ingredientName: string): ElementalProperties | null {
  const name = ingredientName.toLowerCase();

  // Direct match
  if (INGREDIENT_ELEMENTAL_MAP[name]) {
    return INGREDIENT_ELEMENTAL_MAP[name];
  }

  // Partial match
  for (const [key, mapping] of Object.entries(INGREDIENT_ELEMENTAL_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return mapping;
    }
  }

  return null;
}

/**
 * Find matching elemental properties for a cooking method
 */
function findMethodElementals(methodName: string): ElementalProperties | null {
  const name = methodName.toLowerCase().trim();

  // Direct match
  if (METHOD_ELEMENTAL_MAP[name]) {
    return METHOD_ELEMENTAL_MAP[name];
  }

  // Try with hyphen replacement
  const hyphenated = name.replace(/\s+/g, "-");
  if (METHOD_ELEMENTAL_MAP[hyphenated]) {
    return METHOD_ELEMENTAL_MAP[hyphenated];
  }

  // Partial match
  for (const [key, mapping] of Object.entries(METHOD_ELEMENTAL_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return mapping;
    }
  }

  return null;
}

/**
 * Normalize elemental properties to sum to 1.0
 */
function normalizeElementals(props: ElementalProperties): ElementalProperties {
  const total = props.Fire + props.Water + props.Earth + props.Air;
  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  return {
    Fire: Math.round((props.Fire / total) * 100) / 100,
    Water: Math.round((props.Water / total) * 100) / 100,
    Earth: Math.round((props.Earth / total) * 100) / 100,
    Air: Math.round((props.Air / total) * 100) / 100,
  };
}

/**
 * Enrich individual ingredients in an ingredients array block
 * Adds elementalProperties to each ingredient object
 */
function enrichIngredientsInBlock(block: string): { enrichedBlock: string; enrichedCount: number } {
  let enrichedBlock = block;
  let enrichedCount = 0;

  // Find the ingredients array
  const ingredientsMatch = block.match(/ingredients:\s*\[([\s\S]*?)\]/);
  if (!ingredientsMatch) {
    return { enrichedBlock, enrichedCount: 0 };
  }

  const ingredientsArrayContent = ingredientsMatch[1];
  let newIngredientsContent = ingredientsArrayContent;

  // Find each ingredient object and add elementalProperties if not present
  const ingredientObjectPattern = /\{([^{}]*?name:\s*["']([^"']+)["'][^{}]*?)\}/g;
  let ingredientMatch;
  const replacements: Array<{ original: string; replacement: string }> = [];

  while ((ingredientMatch = ingredientObjectPattern.exec(ingredientsArrayContent)) !== null) {
    const fullMatch = ingredientMatch[0];
    const ingredientContent = ingredientMatch[1];
    const ingredientName = ingredientMatch[2];

    // Skip if already has elementalProperties
    if (ingredientContent.includes("elementalProperties")) {
      continue;
    }

    const elementals = findIngredientElementals(ingredientName);
    if (elementals) {
      const normalized = normalizeElementals(elementals);
      // Insert elementalProperties before the closing brace
      const newContent = fullMatch.slice(0, -1).trimEnd();
      const needsComma = !newContent.endsWith(",");
      const replacement = `${newContent}${needsComma ? "," : ""}
              elementalProperties: {
                Fire: ${normalized.Fire},
                Water: ${normalized.Water},
                Earth: ${normalized.Earth},
                Air: ${normalized.Air},
              },
            }`;
      replacements.push({ original: fullMatch, replacement });
      enrichedCount++;
    }
  }

  // Apply replacements in reverse order to preserve indices
  for (const { original, replacement } of replacements.reverse()) {
    newIngredientsContent = newIngredientsContent.replace(original, replacement);
  }

  if (enrichedCount > 0) {
    enrichedBlock = block.replace(ingredientsArrayContent, newIngredientsContent);
  }

  return { enrichedBlock, enrichedCount };
}

/**
 * Enrich cooking methods in a cookingMethods array block
 * Converts string methods to objects with elementalProperties
 */
function enrichCookingMethodsInBlock(block: string): { enrichedBlock: string; enrichedCount: number } {
  let enrichedBlock = block;
  let enrichedCount = 0;

  // Find the cookingMethods array - handle both string arrays and object arrays
  const methodsMatch = block.match(/cookingMethods:\s*\[([\s\S]*?)\]/);
  if (!methodsMatch) {
    return { enrichedBlock, enrichedCount: 0 };
  }

  const methodsArrayContent = methodsMatch[1];

  // Check if methods are already objects (contain { and name:)
  if (methodsArrayContent.includes("{") && methodsArrayContent.includes("name:")) {
    // Already enriched as objects, skip
    return { enrichedBlock, enrichedCount: 0 };
  }

  // Parse string methods
  const methodStrings: string[] = [];
  const stringMethodPattern = /["']([^"']+)["']/g;
  let methodMatch;

  while ((methodMatch = stringMethodPattern.exec(methodsArrayContent)) !== null) {
    methodStrings.push(methodMatch[1]);
  }

  if (methodStrings.length === 0) {
    return { enrichedBlock, enrichedCount: 0 };
  }

  // Build new methods array with objects
  const enrichedMethods: string[] = [];

  for (const methodName of methodStrings) {
    const elementals = findMethodElementals(methodName);
    if (elementals) {
      const normalized = normalizeElementals(elementals);
      enrichedMethods.push(`{
            name: "${methodName}",
            elementalProperties: {
              Fire: ${normalized.Fire},
              Water: ${normalized.Water},
              Earth: ${normalized.Earth},
              Air: ${normalized.Air},
            },
          }`);
      enrichedCount++;
    } else {
      // Keep as string if no mapping found
      enrichedMethods.push(`"${methodName}"`);
    }
  }

  if (enrichedCount > 0) {
    const newMethodsArray = `cookingMethods: [
          ${enrichedMethods.join(",\n          ")}
        ]`;
    enrichedBlock = block.replace(/cookingMethods:\s*\[[^\]]*\]/, newMethodsArray);
  }

  return { enrichedBlock, enrichedCount };
}

/**
 * Calculate elemental properties from ingredients
 */
function calculateElementals(
  ingredients: RecipeIngredient[],
  cookingMethods: string[] = [],
  cuisine: string = ""
): ElementalProperties {
  if (!ingredients || ingredients.length === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let matchCount = 0;

  for (const ingredient of ingredients) {
    const mapping = findIngredientElementals(ingredient.name);
    if (mapping) {
      const amount = typeof ingredient.amount === "number" ? ingredient.amount : parseFloat(String(ingredient.amount)) || 1;
      const weight = Math.log(1 + amount / 10);

      totals.Fire += mapping.Fire * weight;
      totals.Water += mapping.Water * weight;
      totals.Earth += mapping.Earth * weight;
      totals.Air += mapping.Air * weight;
      matchCount++;
    }
  }

  if (matchCount === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Apply cooking method modifiers
  for (const method of cookingMethods) {
    const methodKey = method.toLowerCase().replace(/\s+/g, "-");
    const modifier = COOKING_METHOD_MODIFIERS[methodKey] || COOKING_METHOD_MODIFIERS[method.toLowerCase()];
    if (modifier) {
      totals.Fire *= modifier.Fire;
      totals.Water *= modifier.Water;
      totals.Earth *= modifier.Earth;
      totals.Air *= modifier.Air;
    }
  }

  // Apply cuisine modifiers
  const cuisineKey = cuisine.toLowerCase().replace(/\s+/g, "-");
  const cuisineModifier = CUISINE_MODIFIERS[cuisineKey];
  if (cuisineModifier) {
    totals.Fire *= cuisineModifier.Fire;
    totals.Water *= cuisineModifier.Water;
    totals.Earth *= cuisineModifier.Earth;
    totals.Air *= cuisineModifier.Air;
  }

  // Normalize
  const total = totals.Fire + totals.Water + totals.Earth + totals.Air;
  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: Math.round((totals.Fire / total) * 100) / 100,
    Water: Math.round((totals.Water / total) * 100) / 100,
    Earth: Math.round((totals.Earth / total) * 100) / 100,
    Air: Math.round((totals.Air / total) * 100) / 100,
  };
}

/**
 * Determine planetary influences from dish text
 */
function determinePlanetaryInfluences(name: string, description: string, ingredients: RecipeIngredient[]): string[] {
  const influences: Set<string> = new Set();
  const combinedText = `${name} ${description || ""} ${ingredients?.map((i) => i.name).join(" ") || ""}`.toLowerCase();

  for (const [planet, keywords] of Object.entries(PLANETARY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        influences.add(planet);
        break;
      }
    }
  }

  if (influences.size === 0) {
    influences.add("Sun");
  }

  return Array.from(influences).slice(0, 3);
}

/**
 * Calculate seasonal alignment
 */
function calculateSeasonalAlignment(ingredients: RecipeIngredient[]): string[] {
  const scores: Record<string, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };

  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase();
    for (const [season, items] of Object.entries(SEASONAL_INGREDIENTS)) {
      for (const item of items) {
        if (name.includes(item) || item.includes(name)) {
          scores[season]++;
          break;
        }
      }
    }
  }

  const matched = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([season]) => season);

  return matched.length > 0 ? matched : ["all"];
}

/**
 * Check if a dish already has good elemental properties (not default)
 */
function hasGoodElementalProperties(content: string, dishName: string): boolean {
  // Find the dish block
  const dishPattern = new RegExp(`name:\\s*["']${escapeRegex(dishName)}["'][^}]*elementalProperties:\\s*{([^}]+)}`, "s");
  const match = content.match(dishPattern);

  if (!match) return false;

  const propsText = match[1];
  // Check if it's not the default 0.25 values
  const fireMatch = propsText.match(/Fire:\s*([\d.]+)/);
  const waterMatch = propsText.match(/Water:\s*([\d.]+)/);
  const earthMatch = propsText.match(/Earth:\s*([\d.]+)/);
  const airMatch = propsText.match(/Air:\s*([\d.]+)/);

  if (!fireMatch || !waterMatch || !earthMatch || !airMatch) return false;

  const fire = parseFloat(fireMatch[1]);
  const water = parseFloat(waterMatch[1]);
  const earth = parseFloat(earthMatch[1]);
  const air = parseFloat(airMatch[1]);

  // Consider it "good" if not all values are 0.25
  return !(fire === 0.25 && water === 0.25 && earth === 0.25 && air === 0.25);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse ingredients from a dish block in file content
 */
function parseIngredientsFromBlock(block: string): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];

  // Find ingredients array
  const ingredientsMatch = block.match(/ingredients:\s*\[([\s\S]*?)\]/);
  if (!ingredientsMatch) return ingredients;

  // Parse individual ingredient objects
  const ingredientPattern = /{\s*name:\s*["']([^"']+)["'][^}]*?(?:amount:\s*["']?([^"',}]+)["']?)?[^}]*?(?:unit:\s*["']([^"']+)["'])?/g;
  let match;

  while ((match = ingredientPattern.exec(ingredientsMatch[1])) !== null) {
    ingredients.push({
      name: match[1],
      amount: match[2] || "1",
      unit: match[3] || "unit",
    });
  }

  return ingredients;
}

/**
 * Parse cooking methods from a dish block
 */
function parseCookingMethodsFromBlock(block: string): string[] {
  const methodsMatch = block.match(/cookingMethods:\s*\[([\s\S]*?)\]/);
  if (!methodsMatch) return [];

  const methods: string[] = [];
  const methodPattern = /["']([^"']+)["']/g;
  let match;

  while ((match = methodPattern.exec(methodsMatch[1])) !== null) {
    methods.push(match[1]);
  }

  return methods;
}

/**
 * Add elemental properties to a dish block
 */
function addElementalPropertiesToBlock(block: string, elementals: ElementalProperties, planetaryInfluences: string[]): string {
  // Check if elementalProperties already exists
  if (block.includes("elementalProperties:")) {
    // Replace existing elemental properties
    return block.replace(
      /elementalProperties:\s*{[^}]+}/,
      `elementalProperties: {
            Fire: ${elementals.Fire},
            Water: ${elementals.Water},
            Earth: ${elementals.Earth},
            Air: ${elementals.Air},
          }`
    );
  }

  // Add elementalProperties before the closing brace of the dish object
  // Find a good insertion point (after nutrition or after the last property)
  const insertionPatterns = [
    /(season:\s*\[[^\]]+\],?\s*)/,
    /(mealType:\s*\[[^\]]+\],?\s*)/,
    /(nutrition:\s*{[^}]+},?\s*)/,
    /(spiceLevel:\s*[^,}]+,?\s*)/,
    /(dietaryInfo:\s*\[[^\]]+\],?\s*)/,
  ];

  for (const pattern of insertionPatterns) {
    const match = block.match(pattern);
    if (match) {
      const insertion = `${match[0]}
          elementalProperties: {
            Fire: ${elementals.Fire},
            Water: ${elementals.Water},
            Earth: ${elementals.Earth},
            Air: ${elementals.Air},
          },`;

      return block.replace(pattern, insertion);
    }
  }

  // Fallback: insert before the last closing brace
  const lastBraceIndex = block.lastIndexOf("}");
  if (lastBraceIndex > 0) {
    const before = block.substring(0, lastBraceIndex);
    const after = block.substring(lastBraceIndex);

    // Ensure there's a comma before our new property
    const needsComma = !before.trimEnd().endsWith(",");

    return `${before}${needsComma ? "," : ""}
          elementalProperties: {
            Fire: ${elementals.Fire},
            Water: ${elementals.Water},
            Earth: ${elementals.Earth},
            Air: ${elementals.Air},
          },
        ${after}`;
  }

  return block;
}

/**
 * Process a cuisine file and enrich recipes with deep enrichment
 * - Recipe-level elemental properties
 * - Individual ingredient elemental properties
 * - Cooking method elemental properties (converts strings to objects)
 */
function processCuisineFile(filePath: string, dryRun: boolean): {
  modified: boolean;
  enrichedCount: number;
  skippedCount: number;
  ingredientsEnriched: number;
  methodsEnriched: number;
} {
  const content = fs.readFileSync(filePath, "utf-8");
  let modifiedContent = content;
  let enrichedCount = 0;
  let skippedCount = 0;
  let totalIngredientsEnriched = 0;
  let totalMethodsEnriched = 0;

  const cuisineName = path.basename(filePath, ".ts");
  console.log(`\nProcessing: ${cuisineName}`);

  // Find all dish objects (looking for objects with a 'name' property)
  // We need to be careful to match complete dish objects
  const dishPattern = /{\s*(?:id:\s*["'][^"']+["'],?\s*)?name:\s*["']([^"']+)["'][^]*?(?={\s*(?:id:\s*["'][^"']+["'],?\s*)?name:|$|]\s*,?\s*})/g;

  // Alternative approach: find dishes by searching for name patterns and extracting blocks
  const namePattern = /name:\s*["']([^"']+)["']/g;
  let nameMatch;
  const dishNames: string[] = [];

  while ((nameMatch = namePattern.exec(content)) !== null) {
    // Skip if it's the cuisine name definition
    if (content.substring(nameMatch.index - 50, nameMatch.index).includes("export const") ||
        content.substring(nameMatch.index - 20, nameMatch.index).includes("id:")) {
      // This might be the main cuisine object, check if name is capitalized (cuisine name)
      const name = nameMatch[1];
      if (name[0] === name[0].toUpperCase() && name.length < 20) {
        continue; // Skip cuisine name
      }
    }
    dishNames.push(nameMatch[1]);
  }

  console.log(`  Found ${dishNames.length} potential dishes`);

  for (const dishName of dishNames) {
    // Skip duplicates
    if (dishNames.filter((n) => n === dishName).length > 1) {
      continue;
    }

    // Check if already has good elemental properties
    if (hasGoodElementalProperties(content, dishName)) {
      skippedCount++;
      continue;
    }

    // Find the dish block - look for the complete object containing this dish name
    const escapedName = escapeRegex(dishName);
    const blockStartPattern = new RegExp(`{[^{}]*name:\\s*["']${escapedName}["']`, "g");
    const blockMatch = blockStartPattern.exec(modifiedContent);

    if (!blockMatch) continue;

    const startIndex = blockMatch.index;

    // Find the matching closing brace
    let braceCount = 1;
    let endIndex = startIndex + blockMatch[0].length;

    while (braceCount > 0 && endIndex < modifiedContent.length) {
      const char = modifiedContent[endIndex];
      if (char === "{") braceCount++;
      if (char === "}") braceCount--;
      endIndex++;
    }

    const dishBlock = modifiedContent.substring(startIndex, endIndex);

    // Parse ingredients and cooking methods
    const ingredients = parseIngredientsFromBlock(dishBlock);
    const cookingMethods = parseCookingMethodsFromBlock(dishBlock);

    if (ingredients.length === 0) {
      console.log(`    Skipping "${dishName}" - no ingredients found`);
      skippedCount++;
      continue;
    }

    // Calculate elemental properties
    const elementals = calculateElementals(ingredients, cookingMethods, cuisineName);
    const planetaryInfluences = determinePlanetaryInfluences(dishName, "", ingredients);

    // Check if this produces non-default values
    if (elementals.Fire === 0.25 && elementals.Water === 0.25 && elementals.Earth === 0.25 && elementals.Air === 0.25) {
      console.log(`    Skipping "${dishName}" - calculated values are default (no ingredient matches)`);
      skippedCount++;
      continue;
    }

    // Add elemental properties to the block
    let enrichedBlock = addElementalPropertiesToBlock(dishBlock, elementals, planetaryInfluences);

    // DEEP ENRICHMENT: Enrich individual ingredients with elementalProperties
    const ingredientEnrichmentResult = enrichIngredientsInBlock(enrichedBlock);
    enrichedBlock = ingredientEnrichmentResult.enrichedBlock;
    totalIngredientsEnriched += ingredientEnrichmentResult.enrichedCount;

    // DEEP ENRICHMENT: Enrich cooking methods with elementalProperties
    const methodEnrichmentResult = enrichCookingMethodsInBlock(enrichedBlock);
    enrichedBlock = methodEnrichmentResult.enrichedBlock;
    totalMethodsEnriched += methodEnrichmentResult.enrichedCount;

    if (enrichedBlock !== dishBlock) {
      modifiedContent = modifiedContent.substring(0, startIndex) + enrichedBlock + modifiedContent.substring(endIndex);
      console.log(`    Enriched: "${dishName}" -> Fire: ${elementals.Fire}, Water: ${elementals.Water}, Earth: ${elementals.Earth}, Air: ${elementals.Air}`);
      if (ingredientEnrichmentResult.enrichedCount > 0) {
        console.log(`      + ${ingredientEnrichmentResult.enrichedCount} ingredients enriched`);
      }
      if (methodEnrichmentResult.enrichedCount > 0) {
        console.log(`      + ${methodEnrichmentResult.enrichedCount} cooking methods enriched`);
      }
      enrichedCount++;
    }
  }

  // Write the modified content if not dry run
  if (!dryRun && (enrichedCount > 0 || totalIngredientsEnriched > 0 || totalMethodsEnriched > 0)) {
    fs.writeFileSync(filePath, modifiedContent, "utf-8");
    console.log(`  Wrote changes to ${cuisineName}.ts:`);
    console.log(`    - ${enrichedCount} recipes enriched`);
    console.log(`    - ${totalIngredientsEnriched} ingredients enriched (deep)`);
    console.log(`    - ${totalMethodsEnriched} cooking methods enriched (deep)`);
  }

  return {
    modified: enrichedCount > 0 || totalIngredientsEnriched > 0 || totalMethodsEnriched > 0,
    enrichedCount,
    skippedCount,
    ingredientsEnriched: totalIngredientsEnriched,
    methodsEnriched: totalMethodsEnriched,
  };
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  // Parse --cuisine flag to filter by single cuisine
  const cuisineIndex = args.findIndex(a => a === "--cuisine");
  const filterCuisine = cuisineIndex !== -1 && args[cuisineIndex + 1] ? args[cuisineIndex + 1] : null;

  console.log("=" .repeat(80));
  console.log("RECIPE DATA ENRICHMENT - WRITE SCRIPT");
  console.log("=".repeat(80));
  console.log(`Mode: ${dryRun ? "DRY RUN (no files will be modified)" : "WRITE MODE"}`);
  if (filterCuisine) {
    console.log(`Filtering to: ${filterCuisine} cuisine only`);
  }

  const cuisinesDir = path.join(process.cwd(), "src", "data", "cuisines");

  if (!fs.existsSync(cuisinesDir)) {
    console.error(`Error: Cuisines directory not found at ${cuisinesDir}`);
    process.exit(1);
  }

  let cuisineFiles = fs.readdirSync(cuisinesDir).filter((f) =>
    f.endsWith(".ts") && f !== "index.ts" && f !== "template.ts" && f !== "culinaryTraditions.ts"
  );

  // Filter to single cuisine if specified
  if (filterCuisine) {
    cuisineFiles = cuisineFiles.filter(f => f.toLowerCase().includes(filterCuisine.toLowerCase()));
  }

  console.log(`\nFound ${cuisineFiles.length} cuisine files to process`);

  let totalEnriched = 0;
  let totalSkipped = 0;
  let filesModified = 0;
  let totalIngredientsEnriched = 0;
  let totalMethodsEnriched = 0;

  for (const file of cuisineFiles) {
    const filePath = path.join(cuisinesDir, file);
    const result = processCuisineFile(filePath, dryRun);

    totalEnriched += result.enrichedCount;
    totalSkipped += result.skippedCount;
    totalIngredientsEnriched += result.ingredientsEnriched;
    totalMethodsEnriched += result.methodsEnriched;
    if (result.modified) filesModified++;
  }

  console.log("\n" + "=".repeat(80));
  console.log("DEEP ENRICHMENT SUMMARY");
  console.log("=".repeat(80));
  console.log(`Files processed: ${cuisineFiles.length}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`\nRecipe-Level Enrichment:`);
  console.log(`  Recipes enriched: ${totalEnriched}`);
  console.log(`  Recipes skipped: ${totalSkipped}`);
  console.log(`\nDeep Grain Enrichment:`);
  console.log(`  Ingredients enriched: ${totalIngredientsEnriched}`);
  console.log(`  Cooking methods enriched: ${totalMethodsEnriched}`);

  if (dryRun) {
    console.log("\nThis was a dry run. Run without --dry-run to write changes.");
  } else if (totalEnriched > 0 || totalIngredientsEnriched > 0 || totalMethodsEnriched > 0) {
    console.log("\nDeep enrichment complete! Run 'yarn build' to verify no TypeScript errors.");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
