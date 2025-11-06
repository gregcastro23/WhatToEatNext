#!/usr/bin/env node

/**
 * Final Robustness Pass
 * Adds astrologicalProfile to the last 13 ingredients
 */

const fs = require("fs");
const path = require("path");

const FINAL_FIXES = [
  {
    file: "src/data/ingredients/herbs/medicinalHerbs.ts",
    ingredient: "chamomile",
    profile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["Cancer", "Taurus", "Pisces"],
      seasonalAffinity: ["summer"],
    },
  },
  {
    file: "src/data/ingredients/proteins/eggs.ts",
    ingredient: "quail_egg",
    profile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Virgo"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  {
    file: "src/data/ingredients/vegetables/rootVegetables.ts",
    ingredient: "beet",
    profile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["Capricorn", "Aries", "Scorpio"],
      seasonalAffinity: ["autumn", "winter"],
    },
  },
  {
    file: "src/data/ingredients/vegetables/rootVegetables.ts",
    ingredient: "turnip",
    profile: {
      rulingPlanets: ["Saturn", "Moon"],
      favorableZodiac: ["Capricorn", "Cancer", "Taurus"],
      seasonalAffinity: ["autumn", "winter"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "balsamic_vinegar",
    profile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["Capricorn", "Libra", "Taurus"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "red_wine_vinegar",
    profile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["Aries", "Scorpio", "Capricorn"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "sherry_vinegar",
    profile: {
      rulingPlanets: ["Saturn", "Jupiter"],
      favorableZodiac: ["Capricorn", "Sagittarius"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "white_wine_vinegar",
    profile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["Gemini", "Virgo", "Capricorn"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "champagne_vinegar",
    profile: {
      rulingPlanets: ["Venus", "Mercury"],
      favorableZodiac: ["Libra", "Gemini", "Aquarius"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "malt_vinegar",
    profile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["Capricorn", "Aries"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "coconut_vinegar",
    profile: {
      rulingPlanets: ["Moon", "Jupiter"],
      favorableZodiac: ["Cancer", "Sagittarius"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "cane_vinegar",
    profile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["Leo", "Sagittarius"],
      seasonalAffinity: ["all"],
    },
  },
  {
    file: "src/data/ingredients/vinegars/vinegars.ts",
    ingredient: "fruit_vinegar",
    profile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Taurus", "Cancer", "Libra"],
      seasonalAffinity: ["all"],
    },
  },
];

function addAstrologicalProfile(filePath, ingredientKey, profile) {
  let content = fs.readFileSync(filePath, "utf-8");
  const ingredientPattern = new RegExp(
    `(\\s{2}${ingredientKey}:\\s*{[\\s\\S]*?elementalProperties:\\s*{[^}]+})(,?)([\\s\\S]*?)(\\n\\s{2}\\w+:|\\n};)`,
    "m",
  );
  const match = content.match(ingredientPattern);

  if (!match) {
    console.log(`  ⚠ Could not find ${ingredientKey}`);
    return false;
  }

  if (match[3].includes("astrologicalProfile:")) {
    return false;
  }

  const profileCode = `
    astrologicalProfile: {
      rulingPlanets: [${profile.rulingPlanets.map((p) => `'${p}'`).join(", ")}],
      favorableZodiac: [${profile.favorableZodiac.map((z) => `'${z}'`).join(", ")}]${
        profile.seasonalAffinity
          ? `,
      seasonalAffinity: [${profile.seasonalAffinity.map((s) => `'${s}'`).join(", ")}]`
          : ""
      }
    },`;

  const replacement = match[1] + "," + profileCode + match[3] + match[4];
  content = content.replace(ingredientPattern, replacement);

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  ✓ ${ingredientKey}`);
  return true;
}

console.log("🔧 Final robustness pass...\n");

let fixed = 0;
for (const fix of FINAL_FIXES) {
  const filePath = path.join(__dirname, "..", fix.file);
  if (addAstrologicalProfile(filePath, fix.ingredient, fix.profile)) {
    fixed++;
  }
}

console.log(`\n✅ Added astrologicalProfile to ${fixed} ingredients\n`);
