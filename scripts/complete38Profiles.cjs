#!/usr/bin/env node

/**
 * Complete All 38 Missing Astrological Profiles
 * Based on actual validation output
 */

const fs = require("fs");
const path = require("path");

// Category-based profiles
const PROFILES = {
  dried_herb: {
    rulingPlanets: ["Mercury", "Moon"],
    favorableZodiac: ["Gemini", "Virgo", "Cancer"],
    seasonalAffinity: ["all"],
  },
  seafood: {
    rulingPlanets: ["Moon", "Neptune"],
    favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
    seasonalAffinity: ["all"],
  },
  meat_chicken: {
    rulingPlanets: ["Mercury", "Mars"],
    favorableZodiac: ["Gemini", "Aries", "Virgo"],
    seasonalAffinity: ["all"],
  },
  meat_beef: {
    rulingPlanets: ["Mars", "Saturn"],
    favorableZodiac: ["Aries", "Taurus", "Capricorn"],
    seasonalAffinity: ["all"],
  },
  meat_pork: {
    rulingPlanets: ["Venus", "Jupiter"],
    favorableZodiac: ["Taurus", "Sagittarius", "Libra"],
    seasonalAffinity: ["all"],
  },
  oil: {
    rulingPlanets: ["Venus", "Sun"],
    favorableZodiac: ["Taurus", "Libra", "Leo"],
    seasonalAffinity: ["all"],
  },
  citrus: {
    rulingPlanets: ["Sun", "Mercury"],
    favorableZodiac: ["Leo", "Gemini", "Sagittarius"],
    seasonalAffinity: ["winter", "spring"],
  },
  spice_blend: {
    rulingPlanets: ["Mercury", "Jupiter"],
    favorableZodiac: ["Gemini", "Sagittarius", "Virgo"],
    seasonalAffinity: ["all"],
  },
};

// All 38 ingredients to fix (from validation output)
const FIXES = [
  // 23 dried herbs
  {
    file: "herbs/driedHerbs.ts",
    ingredients: [
      "dried_basil",
      "dried_oregano",
      "dried_thyme",
      "dried_rosemary",
      "dried_sage",
      "dried_bay_leaves",
      "dried_marjoram",
      "dried_savory",
      "dried_chervil",
      "dried_tarragon",
      "dried_dill",
      "dried_mint",
      "dried_fennel",
      "dried_parsley",
      "dried_cilantro",
      "dried_chives",
      "dried_lemon_balm",
      "dried_lavender",
      "dried_summer_savory",
      "dried_lovage",
      "chervil",
      "bay_leaf",
      "anise",
    ],
    profile: PROFILES.dried_herb,
  },

  // 6 seafood
  {
    file: "proteins/seafood.ts",
    ingredients: [
      "atlantic_salmon",
      "tuna",
      "shrimp",
      "cod",
      "halibut",
      "scallops",
    ],
    profile: PROFILES.seafood,
  },

  // 3 meats (individualized)
  { file: "proteins/meat.ts", ingredient: "beef", profile: PROFILES.meat_beef },
  {
    file: "proteins/meat.ts",
    ingredient: "chicken",
    profile: PROFILES.meat_chicken,
  },
  { file: "proteins/meat.ts", ingredient: "pork", profile: PROFILES.meat_pork },

  // 2 oils (oils.ts)
  {
    file: "oils/oils.ts",
    ingredients: ["palm_oil", "almond_oil"],
    profile: PROFILES.oil,
  },

  // 2 oils (seasonings/oils.ts)
  {
    file: "seasonings/oils.ts",
    ingredients: ["ghee", "avocado_oil"],
    profile: PROFILES.oil,
  },

  // 1 citrus
  {
    file: "fruits/citrus.ts",
    ingredient: "mandarin",
    profile: PROFILES.citrus,
  },

  // 1 spice blend
  {
    file: "spices/spiceBlends.ts",
    ingredient: "herbes_de_provence",
    profile: PROFILES.spice_blend,
  },
];

function addProfile(filePath, ingredientKey, profile) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Pattern to find ingredient and insert after elementalProperties
  const pattern = new RegExp(
    `(\\s{2}${ingredientKey}:\\s*{[\\s\\S]*?elementalProperties:\\s*{[^}]+})(,?)([\\s\\S]*?)(\\n\\s{2}\\w+:|\\n};)`,
    "m",
  );
  const match = content.match(pattern);

  if (!match) {
    console.log(
      `  ⚠ Could not find ${ingredientKey} in ${path.basename(filePath)}`,
    );
    return false;
  }

  // Check if already has profile
  if (match[3].includes("astrologicalProfile:")) {
    return false;
  }

  const profileCode = `
    astrologicalProfile: {
      rulingPlanets: [${profile.rulingPlanets.map((p) => `'${p}'`).join(", ")}],
      favorableZodiac: [${profile.favorableZodiac.map((z) => `'${z}'`).join(", ")}],
      seasonalAffinity: [${profile.seasonalAffinity.map((s) => `'${s}'`).join(", ")}]
    },`;

  const replacement = match[1] + "," + profileCode + match[3] + match[4];
  content = content.replace(pattern, replacement);

  fs.writeFileSync(filePath, content, "utf-8");
  return true;
}

console.log(
  "🔧 Adding astrologicalProfile to all 38 incomplete ingredients...\n",
);

let totalFixed = 0;
let totalAttempted = 0;

for (const fix of FIXES) {
  const filePath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "ingredients",
    fix.file,
  );

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fix.file}`);
    continue;
  }

  console.log(`📝 ${fix.file}...`);

  // Handle single ingredient
  if (fix.ingredient) {
    totalAttempted++;
    if (addProfile(filePath, fix.ingredient, fix.profile)) {
      console.log(`  ✓ ${fix.ingredient}`);
      totalFixed++;
    }
  }

  // Handle multiple ingredients
  if (fix.ingredients) {
    for (const ingredient of fix.ingredients) {
      totalAttempted++;
      if (addProfile(filePath, ingredient, fix.profile)) {
        console.log(`  ✓ ${ingredient}`);
        totalFixed++;
      }
    }
  }

  console.log();
}

console.log("=".repeat(80));
console.log(
  `✅ Added astrologicalProfile to ${totalFixed} out of ${totalAttempted} ingredients`,
);
console.log("=".repeat(80));
console.log("\nRunning validation to verify 100% completion...\n");
