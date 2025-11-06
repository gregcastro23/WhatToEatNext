#!/usr/bin/env node

const fs = require("fs");

console.log("🔧 Fixing component import issues...");

// Fix 1: Export the actual CookingMethodsSection component from the test page
const testPagePath =
  "src/app/test/migrated-components/cooking-methods-section/page.tsx";
if (fs.existsSync(testPagePath)) {
  let content = fs.readFileSync(testPagePath, "utf8");

  // Add export for the actual component
  content = content.replace(
    "const CookingMethodsSectionMigrated = CookingMethodsSection;",
    "const CookingMethodsSectionMigrated = CookingMethodsSection;\n\n// Export the component for use in other pages\nexport { CookingMethodsSection };",
  );

  fs.writeFileSync(testPagePath, content);
  console.log("✅ Added CookingMethodsSection export to test page");
}

// Fix 2: Update imports in cooking-methods-demo page
const demoPagePath = "src/app/cooking-methods-demo/page.tsx";
if (fs.existsSync(demoPagePath)) {
  let content = fs.readFileSync(demoPagePath, "utf8");

  // Fix the import to use named export
  content = content.replace(
    "import CookingMethodsSection from '@/app/test/migrated-components/cooking-methods-section/page';",
    "import { CookingMethodsSection } from '@/app/test/migrated-components/cooking-methods-section/page';",
  );

  fs.writeFileSync(demoPagePath, content);
  console.log("✅ Fixed import in cooking-methods-demo page");
}

// Fix 3: Update imports in cooking-methods page
const methodsPagePath = "src/app/cooking-methods/page.tsx";
if (fs.existsSync(methodsPagePath)) {
  let content = fs.readFileSync(methodsPagePath, "utf8");

  // Fix the import to use named export
  content = content.replace(
    "import CookingMethodsSection from '@/app/test/migrated-components/cooking-methods-section/page';",
    "import { CookingMethodsSection } from '@/app/test/migrated-components/cooking-methods-section/page';",
  );

  fs.writeFileSync(methodsPagePath, content);
  console.log("✅ Fixed import in cooking-methods page");
}

console.log("🎉 Component import fixes completed!");
