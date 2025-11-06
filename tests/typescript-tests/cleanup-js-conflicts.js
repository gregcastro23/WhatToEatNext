#!/usr/bin/env node

import fs from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");

function log(message) {
  console.log(`[${DRY_RUN ? "DRY-RUN" : "REMOVING"}] ${message}`);
}

function deleteFileIfNotDryRun(filePath) {
  if (!DRY_RUN) {
    fs.unlinkSync(filePath);
  }
}

// Find all .js files in src directory that have corresponding .ts files
function findConflictingJsFiles(dir) {
  const conflictingFiles = [];

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (!item.startsWith(".") && item !== "node_modules") {
          scanDirectory(fullPath);
        }
      } else if (item.endsWith(".js")) {
        // Check if there's a corresponding .ts file
        const tsFile = fullPath.replace(".js", ".ts");
        if (fs.existsSync(tsFile)) {
          conflictingFiles.push(fullPath);
        }
      }
    }
  }

  scanDirectory(dir);
  return conflictingFiles;
}

// Main execution
function main() {
  log("Scanning for conflicting JavaScript files...");

  const srcDir = "src";
  if (!fs.existsSync(srcDir)) {
    console.error("❌ src directory not found");
    process.exit(1);
  }

  const conflictingFiles = findConflictingJsFiles(srcDir);

  if (conflictingFiles.length === 0) {
    console.log("✅ No conflicting JavaScript files found");
    return;
  }

  log(`Found ${conflictingFiles.length} conflicting JavaScript files:`);

  conflictingFiles.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    const tsFile = file.replace(".js", ".ts");
    const relativeTsPath = path.relative(process.cwd(), tsFile);

    log(`${relativePath} (conflicts with ${relativeTsPath})`);

    try {
      deleteFileIfNotDryRun(file);
    } catch (error) {
      console.error(`❌ Error removing ${relativePath}:`, error.message);
    }
  });

  if (DRY_RUN) {
    console.log("\n🔍 This was a dry run. To remove conflicting files, run:");
    console.log("node cleanup-js-conflicts.js");
  } else {
    console.log(
      `\n✅ Removed ${conflictingFiles.length} conflicting JavaScript files!`,
    );
    console.log('Run "yarn build" to verify the fixes.');
  }
}

main();
