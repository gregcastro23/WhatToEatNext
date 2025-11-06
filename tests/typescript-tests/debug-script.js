// Debug script to check for potentially missing or corrupted files
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that were deleted according to the information
const deletedFiles = [
  "analyze-root-cleanup.mjs",
  "docs/ROOT_DIRECTORY_CLEANUP_SUMMARY.md",
  "src/data/unified/flavorProfiles_fixed.ts",
];

// Critical files that should exist
const criticalFiles = [
  "src/data/unified/flavorProfiles.ts",
  "src/data/unified/unifiedFlavorEngine.ts",
  "src/data/unified/flavorProfileMigration.ts",
  "src/utils/recommendation/ingredientRecommendation.ts",
  "next.config.js",
  "src/app/page.tsx",
  "src/app/layout.tsx",
];

// Check if deleted files existed
console.log("=== Checking deleted files ===");
deletedFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`${file}: ${exists ? "Still exists" : "Deleted"}`);
});

// Check if critical files exist
console.log("\n=== Checking critical files ===");
criticalFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`${file}: ${exists ? "Exists ✓" : "MISSING ✗"}`);
});

// Check for imports referring to deleted files
console.log(
  "\n=== Checking for imports referring to flavorProfiles_fixed.ts ===",
);
function searchForImport(directory, searchText) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(directory, file.name);

    if (file.isDirectory()) {
      // Skip node_modules and .next folders
      if (file.name !== "node_modules" && file.name !== ".next") {
        searchForImport(fullPath, searchText);
      }
    } else if (
      file.name.endsWith(".ts") ||
      file.name.endsWith(".tsx") ||
      file.name.endsWith(".js")
    ) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes(searchText)) {
          console.log(`Found reference in: ${fullPath}`);
        }
      } catch (err) {
        console.error(`Error reading ${fullPath}: ${err.message}`);
      }
    }
  }
}

try {
  searchForImport(path.join(__dirname, "src"), "flavorProfiles_fixed");
} catch (err) {
  console.error(`Error searching for imports: ${err.message}`);
}

console.log("\n=== Checking Next.js configuration ===");
// Check if astro config exists
const astroConfigPath = path.join(__dirname, "astro.config.mjs");
const astroConfigExists = fs.existsSync(astroConfigPath);
console.log(
  `astro.config.mjs: ${astroConfigExists ? "Exists ✓" : "MISSING ✗"}`,
);

// Check current working directory
console.log("\n=== Current working directory ===");
console.log(__dirname);
