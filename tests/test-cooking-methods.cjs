// Test script to check cooking methods data loading
const fs = require("fs");
const path = require("path");

// Check if the data files exist
const dataFiles = [
  "src/data/cooking/methods/index.ts",
  "src/data/cooking/cookingMethods.ts",
  "src/data/cooking/methods/dry/index.ts",
  "src/data/cooking/methods/dry/baking.ts",
];

console.log("Checking cooking methods data files...");
dataFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`${file}: ${exists ? "✓" : "✗"}`);
});

// Check the content of the main index file
const indexFile = "src/data/cooking/methods/index.ts";
if (fs.existsSync(indexFile)) {
  const content = fs.readFileSync(indexFile, "utf8");
  console.log("\nIndex file content preview:");
  console.log(content.substring(0, 200) + "...");
}

// Check the content of the cookingMethods file
const cookingMethodsFile = "src/data/cooking/cookingMethods.ts";
if (fs.existsSync(cookingMethodsFile)) {
  const content = fs.readFileSync(cookingMethodsFile, "utf8");
  console.log("\nCookingMethods file content preview:");
  console.log(content.substring(0, 200) + "...");
}

// Check if the useCookingMethods hook file exists
const hookFile = "src/hooks/useCookingMethods.ts";
if (fs.existsSync(hookFile)) {
  console.log(`\n${hookFile}: ✓`);
  const content = fs.readFileSync(hookFile, "utf8");
  console.log("Hook file content preview:");
  console.log(content.substring(0, 200) + "...");
} else {
  console.log(`\n${hookFile}: ✗`);
}
