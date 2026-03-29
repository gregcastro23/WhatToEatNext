const fs = require("fs");
const { execSync } = require("child_process");

const data = JSON.parse(fs.readFileSync("level1-check.json", "utf8"));
const filesToFix = [];

data.forEach(f => {
  const hasImportOrder = f.messages.some(m => m.ruleId === "import/order");
  if (hasImportOrder) {
    filesToFix.push(f.filePath);
  }
});

for (const filePath of filesToFix) {
  let content = fs.readFileSync(filePath, "utf8");
  
  // A naive but usually effective regex to match import statements
  // It handles multi-line imports
  const importRegex = /^import\s+[\s\S]*?from\s+['"][^'"]+['"];?(?:\r?\n)?|^import\s+['"][^'"]+['"];?(?:\r?\n)?/gm;
  
  const imports = [];
  let match;
  
  // Find all imports
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[0].trim());
  }
  
  if (imports.length === 0) continue;
  
  // Remove them from the content
  content = content.replace(importRegex, "");
  
  // Strip out any empty lines that might have been left behind at the top
  content = content.replace(/^\s*\n/gm, "");
  
  let directives = [];
  let matchDirective = content.match(/^['"]use (client|server)['"];?(?:\r?\n)?/);
  let mainContent = content;
  
  if (matchDirective) {
    directives.push(matchDirective[0].trim());
    mainContent = content.substring(matchDirective[0].length).trim();
  }
  
  // Reconstruct the file:
  // 1. Directives (e.g. "use client";)
  // 2. All imports combined
  // 3. The rest of the content
  let newContent = "";
  if (directives.length > 0) newContent += directives.join("\n") + "\n\n";
  newContent += imports.join("\n") + "\n\n";
  newContent += mainContent;
  
  fs.writeFileSync(filePath, newContent, "utf8");
}

console.log("Gathered imports in " + filesToFix.length + " files.");
// Now run eslint --fix on these files
if (filesToFix.length > 0) {
  try {
    console.log("Running eslint --fix...");
    execSync("npx eslint --fix " + filesToFix.join(" "), { stdio: 'inherit' });
  } catch (e) {
    console.error("Eslint --fix finished with some warnings/errors.");
  }
}
