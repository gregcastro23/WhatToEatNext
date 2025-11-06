#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function cleanupESLintCaches() {
  console.log("🧹 Cleaning ESLint Caches...");

  const cacheDirs = [
    ".eslint-cache",
    ".eslint-ts-cache",
    ".eslint-performance-cache",
    ".eslint-incremental-cache",
  ];

  const cacheFiles = [
    ".eslint-tsbuildinfo",
    ".eslint-timing.json",
    ".eslint-metrics.json",
    "tsconfig.tsbuildinfo",
  ];

  let cleaned = 0;

  // Clean cache directories
  cacheDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed cache directory: ${dir}`);
      cleaned++;
    }
  });

  // Clean cache files
  cacheFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed cache file: ${file}`);
      cleaned++;
    }
  });

  if (cleaned === 0) {
    console.log("ℹ️  No cache files found to clean");
  } else {
    console.log(`🎯 Cleaned ${cleaned} cache items`);
  }
}

cleanupESLintCaches();
