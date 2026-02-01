#!/usr/bin/env ts-node
/**
 * Analyze unmapped ingredients hitting the default fallback
 */

import * as fs from "fs";
import * as path from "path";

const INGREDIENT_ELEMENTAL_MAP: Record<string, boolean> = {
  chili: true, pepper: true, cayenne: true, jalapeno: true, sriracha: true, ginger: true, garlic: true,
  onion: true, mustard: true, horseradish: true, wasabi: true, curry: true, paprika: true, cinnamon: true,
  clove: true, water: true, broth: true, stock: true, milk: true, cream: true, yogurt: true, coconut: true,
  cucumber: true, watermelon: true, melon: true, lettuce: true, celery: true, zucchini: true, tomato: true,
  wine: true, sake: true, vinegar: true, lemon: true, lime: true, orange: true, fish: true, seafood: true,
  shrimp: true, squid: true, salmon: true, tuna: true, soup: true, potato: true, rice: true, bread: true,
  pasta: true, noodle: true, flour: true, wheat: true, oat: true, quinoa: true, barley: true, corn: true,
  bean: true, lentil: true, chickpea: true, mushroom: true, carrot: true, beet: true, turnip: true,
  cheese: true, beef: true, pork: true, lamb: true, meat: true, tofu: true, tempeh: true, nut: true,
  egg: true, butter: true, chicken: true, turkey: true, duck: true, herb: true, basil: true, mint: true,
  cilantro: true, parsley: true, dill: true, thyme: true, rosemary: true, oregano: true, sage: true,
  lemongrass: true, scallion: true, sprout: true, spinach: true, arugula: true, kale: true, cabbage: true,
  broccoli: true, oil: true, olive: true, sesame: true, ghee: true, sugar: true, honey: true, maple: true,
  soy: true, miso: true, tahini: true, coffee: true, espresso: true, tea: true, matcha: true, sauce: true,
  turmeric: true, cumin: true, apple: true, banana: true, berry: true, mango: true, papaya: true, pineapple: true,
  chocolate: true
};

function findMatch(name: string): boolean {
  const lname = name.toLowerCase();
  if (INGREDIENT_ELEMENTAL_MAP[lname]) return true;
  for (const key of Object.keys(INGREDIENT_ELEMENTAL_MAP)) {
    if (lname.includes(key) || key.includes(lname)) return true;
  }
  return false;
}

const cuisinesDir = path.join(process.cwd(), "src", "data", "cuisines");
const cuisines = ["thai.ts", "french.ts"];
const unmapped: Record<string, number> = {};

for (const file of cuisines) {
  const content = fs.readFileSync(path.join(cuisinesDir, file), "utf-8");
  const ingredientPattern = /name:\s*["']([^"']+)["']/g;
  let match;
  while ((match = ingredientPattern.exec(content)) !== null) {
    const name = match[1];
    // Skip dish names (usually longer than ingredient names and capitalized)
    if (name.length > 25 || name[0] === name[0].toUpperCase()) continue;
    if (!findMatch(name)) {
      unmapped[name] = (unmapped[name] || 0) + 1;
    }
  }
}

const sorted = Object.entries(unmapped).sort((a, b) => b[1] - a[1]);
console.log("Most common unmapped ingredients:");
console.log("=".repeat(50));
for (const [name, count] of sorted.slice(0, 50)) {
  console.log("  " + name.padEnd(30) + " " + count + "x");
}
console.log("\nTotal unique unmapped: " + sorted.length);
