#!/usr/bin/env node

/**
 * Add Missing Astrological Profiles Script
 *
 * This script automatically adds astrological profiles to ingredients that are missing them.
 * It uses category-based defaults and elemental properties to generate appropriate profiles.
 *
 * Usage: node scripts/addMissingAstrologicalProfiles.cjs
 */

const fs = require("fs");
const path = require("path");

// Configuration
const INGREDIENTS_DIR = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "ingredients",
);

// Category-based astrological defaults
const CATEGORY_ASTROLOGY = {
  // Fruits
  stone_fruit: {
    rulingPlanets: ["Venus", "Sun"],
    favorableZodiac: ["Taurus", "Leo", "Libra"],
    seasonalAffinity: ["summer"],
  },
  berry: {
    rulingPlanets: ["Venus", "Moon"],
    favorableZodiac: ["Cancer", "Taurus", "Pisces"],
    seasonalAffinity: ["summer"],
  },
  citrus: {
    rulingPlanets: ["Sun", "Mercury"],
    favorableZodiac: ["Leo", "Gemini", "Sagittarius"],
    seasonalAffinity: ["winter", "spring"],
  },
  tropical_fruit: {
    rulingPlanets: ["Sun", "Jupiter"],
    favorableZodiac: ["Leo", "Sagittarius", "Aries"],
    seasonalAffinity: ["summer"],
  },

  // Grains
  whole_grain: {
    rulingPlanets: ["Saturn", "Earth"],
    favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
    seasonalAffinity: ["autumn"],
  },
  refined_grain: {
    rulingPlanets: ["Mercury", "Venus"],
    favorableZodiac: ["Virgo", "Gemini", "Libra"],
    seasonalAffinity: ["all"],
  },

  // Spices and Herbs
  hot_spice: {
    rulingPlanets: ["Mars", "Sun"],
    favorableZodiac: ["Aries", "Leo", "Scorpio"],
    seasonalAffinity: ["winter"],
  },
  aromatic_spice: {
    rulingPlanets: ["Mercury", "Venus"],
    favorableZodiac: ["Gemini", "Libra", "Aquarius"],
    seasonalAffinity: ["all"],
  },
  herb: {
    rulingPlanets: ["Mercury", "Moon"],
    favorableZodiac: ["Gemini", "Virgo", "Cancer"],
    seasonalAffinity: ["spring", "summer"],
  },

  // Default fallback
  default: {
    rulingPlanets: ["Mercury"],
    favorableZodiac: ["Virgo", "Gemini"],
    seasonalAffinity: ["all"],
  },
};

/**
 * Determine category from file path and elemental properties
 */
function determineCategory(filePath, elementals) {
  const lowerPath = filePath.toLowerCase();

  // Fruits
  if (lowerPath.includes("stonefruit") || lowerPath.includes("stone")) {
    return "stone_fruit";
  }
  if (lowerPath.includes("berry") || lowerPath.includes("berries")) {
    return "berry";
  }
  if (lowerPath.includes("citrus")) {
    return "citrus";
  }
  if (lowerPath.includes("tropical")) {
    return "tropical_fruit";
  }

  // Grains
  if (lowerPath.includes("wholegrain") || lowerPath.includes("whole")) {
    return "whole_grain";
  }
  if (lowerPath.includes("refined") || lowerPath.includes("grain")) {
    return "refined_grain";
  }

  // Spices/Herbs - use elemental properties
  if (lowerPath.includes("spice") || lowerPath.includes("pepper")) {
    if (elementals && elementals.Fire > 0.4) {
      return "hot_spice";
    }
    return "aromatic_spice";
  }
  if (lowerPath.includes("herb")) {
    return "herb";
  }

  return "default";
}

/**
 * Generate astrological profile based on category and elementals
 */
function generateAstrologicalProfile(category, elementals) {
  const baseProfile =
    CATEGORY_ASTROLOGY[category] || CATEGORY_ASTROLOGY.default;

  // Clone the base profile
  const profile = {
    rulingPlanets: [...baseProfile.rulingPlanets],
    favorableZodiac: [...baseProfile.favorableZodiac],
    seasonalAffinity: [...baseProfile.seasonalAffinity],
  };

  // Adjust based on dominant element if available
  if (elementals) {
    const dominant = getDominantElement(elementals);

    switch (dominant) {
      case "Fire":
        if (
          !profile.rulingPlanets.includes("Mars") &&
          !profile.rulingPlanets.includes("Sun")
        ) {
          profile.rulingPlanets.push("Mars");
        }
        if (!profile.favorableZodiac.includes("Aries")) {
          profile.favorableZodiac.push("Aries");
        }
        break;

      case "Water":
        if (
          !profile.rulingPlanets.includes("Moon") &&
          !profile.rulingPlanets.includes("Neptune")
        ) {
          profile.rulingPlanets.push("Moon");
        }
        if (!profile.favorableZodiac.includes("Cancer")) {
          profile.favorableZodiac.push("Cancer");
        }
        break;

      case "Earth":
        if (
          !profile.rulingPlanets.includes("Saturn") &&
          !profile.rulingPlanets.includes("Venus")
        ) {
          profile.rulingPlanets.push("Saturn");
        }
        if (!profile.favorableZodiac.includes("Taurus")) {
          profile.favorableZodiac.push("Taurus");
        }
        break;

      case "Air":
        if (
          !profile.rulingPlanets.includes("Mercury") &&
          !profile.rulingPlanets.includes("Uranus")
        ) {
          profile.rulingPlanets.push("Mercury");
        }
        if (!profile.favorableZodiac.includes("Gemini")) {
          profile.favorableZodiac.push("Gemini");
        }
        break;
    }
  }

  return profile;
}

/**
 * Get dominant element
 */
function getDominantElement(elementals) {
  let max = 0;
  let dominant = "Fire";

  for (const [element, value] of Object.entries(elementals)) {
    if (value > max) {
      max = value;
      dominant = element;
    }
  }

  return dominant;
}

/**
 * Format astrological profile as TypeScript code
 */
function formatAstrologicalProfile(profile, indent = 4) {
  const spaces = " ".repeat(indent);

  return `${spaces}astrologicalProfile: {
${spaces}  rulingPlanets: [${profile.rulingPlanets.map((p) => `'${p}'`).join(", ")}],
${spaces}  favorableZodiac: [${profile.favorableZodiac.map((z) => `'${z}'`).join(", ")}]${
    profile.seasonalAffinity
      ? `,
${spaces}  seasonalAffinity: [${profile.seasonalAffinity.map((s) => `'${s}'`).join(", ")}]`
      : ""
  }
${spaces}}`;
}

/**
 * Process a single ingredient file
 */
function processFile(filePath, relativePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    // Check if file has ingredient data
    const rawVarMatch = content.match(/const\s+(raw\w+)\s*=\s*{/);
    if (!rawVarMatch) return { modified: false };

    const rawVarName = rawVarMatch[1];
    const objStartIdx = content.indexOf(rawVarName) + rawVarName.length;

    // Find the object boundaries
    let braceCount = 0;
    let startIdx = -1;
    let endIdx = -1;

    for (let i = objStartIdx; i < content.length; i++) {
      if (content[i] === "{") {
        if (braceCount === 0) startIdx = i;
        braceCount++;
      } else if (content[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (startIdx === -1 || endIdx === -1) return { modified: false };

    const objContent = content.substring(startIdx, endIdx);

    // Find ingredients missing astrologicalProfile
    const ingredientKeyMatches = [...objContent.matchAll(/^\s{2}(\w+):\s*{/gm)];

    for (const match of ingredientKeyMatches) {
      const ingredientKey = match[1];
      const keyIdx = match.index + startIdx; // Adjust for full content index
      const ingredientObjStart = content.indexOf("{", keyIdx);

      // Find end of this ingredient object
      let braces = 0;
      let ingredientObjEnd = -1;
      for (let i = ingredientObjStart; i < content.length; i++) {
        if (content[i] === "{") braces++;
        else if (content[i] === "}") {
          braces--;
          if (braces === 0) {
            ingredientObjEnd = i;
            break;
          }
        }
      }

      if (ingredientObjEnd === -1) continue;

      const ingredientObjStr = content.substring(
        ingredientObjStart,
        ingredientObjEnd + 1,
      );

      // Check if already has astrologicalProfile
      if (ingredientObjStr.includes("astrologicalProfile:")) {
        continue; // Skip, already has it
      }

      // Extract elemental properties
      let elementals = null;
      const elementalsMatch = ingredientObjStr.match(
        /elementalProperties:\s*{([^}]+)}/,
      );
      if (elementalsMatch) {
        const elementalStr = elementalsMatch[1];
        elementals = {};

        const fireMatch = elementalStr.match(/Fire:\s*([\d.]+)/);
        const waterMatch = elementalStr.match(/Water:\s*([\d.]+)/);
        const earthMatch = elementalStr.match(/Earth:\s*([\d.]+)/);
        const airMatch = elementalStr.match(/Air:\s*([\d.]+)/);

        if (fireMatch) elementals.Fire = parseFloat(fireMatch[1]);
        if (waterMatch) elementals.Water = parseFloat(waterMatch[1]);
        if (earthMatch) elementals.Earth = parseFloat(earthMatch[1]);
        if (airMatch) elementals.Air = parseFloat(airMatch[1]);
      }

      // Determine category and generate profile
      const category = determineCategory(filePath, elementals);
      const profile = generateAstrologicalProfile(category, elementals);
      const profileCode = formatAstrologicalProfile(profile);

      // Find insertion point - add after elementalProperties or after name
      let insertionPoint = -1;
      const elementalPropsIdx = ingredientObjStr.indexOf(
        "elementalProperties:",
      );

      if (elementalPropsIdx !== -1) {
        // Find the end of elementalProperties
        const elementalStart = ingredientObjStr.indexOf("{", elementalPropsIdx);
        let elementalBraces = 0;
        let elementalEnd = -1;

        for (let i = elementalStart; i < ingredientObjStr.length; i++) {
          if (ingredientObjStr[i] === "{") elementalBraces++;
          else if (ingredientObjStr[i] === "}") {
            elementalBraces--;
            if (elementalBraces === 0) {
              elementalEnd = i + 1;
              break;
            }
          }
        }

        if (elementalEnd !== -1) {
          // Find the comma after elementalProperties
          let commaIdx = elementalEnd;
          while (
            commaIdx < ingredientObjStr.length &&
            ingredientObjStr[commaIdx] !== ","
          ) {
            commaIdx++;
          }

          if (commaIdx < ingredientObjStr.length) {
            insertionPoint = ingredientObjStart + commaIdx + 1;
          }
        }
      }

      if (insertionPoint !== -1) {
        // Insert the astrological profile
        const beforeInsertion = content.substring(0, insertionPoint);
        const afterInsertion = content.substring(insertionPoint);

        content = beforeInsertion + "\n" + profileCode + "," + afterInsertion;
        modified = true;

        console.log(
          `  ✓ Added astrologicalProfile to ${ingredientKey} in ${relativePath}`,
        );
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf-8");
      return { modified: true, file: relativePath };
    }

    return { modified: false };
  } catch (error) {
    console.error(`  ✗ Error processing ${relativePath}: ${error.message}`);
    return { modified: false, error: error.message };
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir, baseDir = dir) {
  const results = { filesProcessed: 0, filesModified: 0, errors: 0 };
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subResults = scanDirectory(fullPath, baseDir);
      results.filesProcessed += subResults.filesProcessed;
      results.filesModified += subResults.filesModified;
      results.errors += subResults.errors;
    } else if (
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts") &&
      entry.name !== "index.ts" &&
      entry.name !== "types.ts"
    ) {
      const relativePath = path.relative(baseDir, fullPath);
      results.filesProcessed++;

      const result = processFile(fullPath, relativePath);

      if (result.modified) {
        results.filesModified++;
      }
      if (result.error) {
        results.errors++;
      }
    }
  }

  return results;
}

// Run script
console.log("🔧 Adding missing astrologicalProfiles to ingredients...\n");
const results = scanDirectory(INGREDIENTS_DIR);

console.log("\n" + "=".repeat(80));
console.log("COMPLETION SUMMARY");
console.log("=".repeat(80));
console.log(`Files Processed:  ${results.filesProcessed}`);
console.log(`Files Modified:   ${results.filesModified}`);
console.log(`Errors:           ${results.errors}`);
console.log("=".repeat(80) + "\n");

if (results.filesModified > 0) {
  console.log("✅ Successfully added astrologicalProfiles.");
  console.log("   Run validation script to verify changes.\n");
  process.exit(0);
} else {
  console.log("ℹ️  No files needed modification.\n");
  process.exit(0);
}
