#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing TypeScript compilation errors...");

// Fix 1: cooking-methods-section component
const cookingMethodsPath =
  "src/app/test/migrated-components/cooking-methods-section/page.tsx";
if (fs.existsSync(cookingMethodsPath)) {
  let content = fs.readFileSync(cookingMethodsPath, "utf8");

  // Fix parameter names
  content = content.replace("_showToggle,", "showToggle,");
  content = content.replace("_initiallyExpanded,", "initiallyExpanded,");

  // Fix method access
  content = content.replace(
    /methods\.map\(m => \(/,
    "methods.map(m => {\n      const method = m as Record<string, unknown>;\n      return (",
  );

  content = content.replace(/key={m\.id}/, "key={String(method.id)}");

  content = content.replace(
    /selectedMethodId === m\.id/,
    "selectedMethodId === method.id",
  );

  content = content.replace(/{m\.name}/, "{String(method.name)}");

  content = content.replace(/{m\.description}/, "{String(method.description)}");

  content = content.replace(/\)\)}/, ");\n    })}");

  // Fix handleSelectMethod
  content = content.replace(
    /setSelectedMethodId\(\(method as unknown\)\.id\);/,
    "const methodObj = method as Record<string, unknown>;\n    setSelectedMethodId(String(methodObj.id));",
  );

  fs.writeFileSync(cookingMethodsPath, content);
  console.log("✅ Fixed cooking-methods-section component");
}

// Fix 2: cuisine-section component
const cuisineSectionPath =
  "src/app/test/migrated-components/cuisine-section/page.tsx";
if (fs.existsSync(cuisineSectionPath)) {
  let content = fs.readFileSync(cuisineSectionPath, "utf8");

  // Fix parameter name
  content = content.replace("_elementalState,", "elementalState,");

  fs.writeFileSync(cuisineSectionPath, content);
  console.log("✅ Fixed cuisine-section component");
}

// Fix 3: main migrated-components page
const mainPagePath = "src/app/test/migrated-components/page.tsx";
if (fs.existsSync(mainPagePath)) {
  let content = fs.readFileSync(mainPagePath, "utf8");

  // Fix Tabs component
  content = content.replace(
    /const Tabs = \(\{ children, _defaultValue, className \}: unknown\) =>/,
    "const Tabs = ({ children, defaultValue, className }: unknown) =>",
  );

  content = content.replace(
    /\(className\)\?\{children\}/,
    "(className as string | undefined)}{(children as React.ReactNode)}",
  );

  // Fix other components with proper type assertions
  content = content.replace(
    /const TabsList = \(\{ children, className \}: unknown\) => \(/,
    "const TabsList = ({ children, className }: unknown) => {",
  );

  content = content.replace(
    /\<div className=\{\`flex gap-2 \$\{className \|\| \'\'\}\`\}\>\{children\}\<\/div\>/,
    "<div className={`flex gap-2 ${(className as string) || ''}`}>{children as React.ReactNode}</div>",
  );

  content = content.replace(
    /const TabsTrigger = \(\{ children \}: unknown\) => \(/,
    "const TabsTrigger = ({ children }: unknown) => (",
  );

  content = content.replace(
    /\<button className=\'rounded border px-3 py-1\'\>\{children\}\<\/button\>/,
    "<button className='rounded border px-3 py-1'>{children as React.ReactNode}</button>",
  );

  content = content.replace(
    /const TabsContent = \(\{ children \}: unknown\) => \<div className=\'mt-4\'\>\{children\}\<\/div\>/,
    "const TabsContent = ({ children }: unknown) => <div className='mt-4'>{children as React.ReactNode}</div>",
  );

  fs.writeFileSync(mainPagePath, content);
  console.log("✅ Fixed main migrated-components page");
}

console.log("🎉 TypeScript compilation error fixes completed!");
