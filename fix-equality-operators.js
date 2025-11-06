#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

// Find all TypeScript and JavaScript files in src directory
async function findFiles() {
  const pattern = "src/**/*.{ts,tsx,js,jsx}";
  const files = await glob(pattern, { cwd: process.cwd() });
  return files;
}

// Fix equality operators in a file
function fixEqualityOperators(content) {
  // Replace != with !==
  content = content.replace(/\b!=\s/g, "!== ");

  // Replace == with ===
  content = content.replace(/\b==\s/g, "=== ");

  return content;
}

// Process all files
async function processFiles() {
  const files = await findFiles();
  let totalFixed = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const fixedContent = fixEqualityOperators(content);

      if (content !== fixedContent) {
        fs.writeFileSync(file, fixedContent, "utf8");
        console.log(`Fixed: ${file}`);
        totalFixed++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nTotal files fixed: ${totalFixed}`);
}

processFiles().catch(console.error);
