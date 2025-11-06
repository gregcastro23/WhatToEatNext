#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing critical parsing errors...");

const fixes = [
  {
    file: "src/__tests__/e2e/MainPageWorkflows.test.tsx",
    search: "jest.mock('@/components/CuisineRecommender'( {",
    replace: "jest.mock('@/components/CuisineRecommender', () => {",
  },
  {
    file: "src/__tests__/e2e/MainPageWorkflows.test.tsx",
    search: "return function MockCuisineRecommender() : any {",
    replace: "return function MockCuisineRecommender(): any {",
  },
  {
    file: "src/__tests__/chakraSystem.test.ts",
    search: "import { ZodiacSign } from '@/types/celestial';",
    replace: "import type { ZodiacSign } from '@/types/celestial';",
  },
];

let fixedCount = 0;

for (const fix of fixes) {
  try {
    const filePath = path.join(process.cwd(), fix.file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed parsing error in ${fix.file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
}

console.log(`\n🎯 Fixed ${fixedCount} parsing errors`);
