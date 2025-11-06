#!/usr/bin/env node

const fs = require("fs");

const filePath = "src/pages/cuisines/index.tsx";

// Read the file
let content = fs.readFileSync(filePath, "utf8");

// Simple fix: just add null check to the filter
content = content.replace(
  "return !profile.parentCuisine; // Only include cuisines that don't have a parent",
  "return profile && !profile.parentCuisine; // Only include cuisines that have a profile and don't have a parent",
);

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log("✅ Fixed cuisines page with simple null check");
