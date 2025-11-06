#!/usr/bin/env node

const fs = require("fs");

console.log("🔧 Fixing syntax error in migrated-components page...");

const filePath = "src/app/test/migrated-components/page.tsx";
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, "utf8");

  // Fix the TabsList function syntax
  content = content.replace(
    /const TabsList = \(\{ children, className \}: unknown\) => \{\s*<div className=\{`flex gap-2 \$\{\(className as string\) \|\| ''\}`\}>\{children as React\.ReactNode\}<\/div>\s*\);/,
    "const TabsList = ({ children, className }: unknown) => (\n  <div className={`flex gap-2 ${(className as string) || ''}`}>{children as React.ReactNode}</div>\n);",
  );

  fs.writeFileSync(filePath, content);
  console.log("✅ Fixed syntax error");
}

console.log("🎉 Syntax error fix completed!");
