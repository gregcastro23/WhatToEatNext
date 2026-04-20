/**
 * Dedup duplicate property assignments inside ingredient files.
 * Keeps the FIRST occurrence, removes subsequent ones — because
 * the first version is author-original and later versions are
 * script-added generics.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind, ObjectLiteralExpression } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

const files: string[] = [];
function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (
      entry.name.endsWith(".ts") &&
      ![
        "index.ts",
        "types.ts",
        "ingredients.ts",
        "ingredientSummaries.ts",
        "flavorProfiles.ts",
        "elementalProperties.ts",
      ].includes(entry.name)
    ) {
      files.push(p);
    }
  }
}
walk(INGREDIENTS_DIR);

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});

let totalRemoved = 0;
let filesModified = 0;

for (const file of files) {
  const sf = project.addSourceFileAtPath(file);
  let modified = false;

  // Loop until no more duplicates are found — each pass touches one object,
  // because removing a property invalidates ts-morph descendants below that node.
  let passModified = true;
  while (passModified) {
    passModified = false;
    const allObjects = sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
    outer: for (const obj of allObjects) {
      if (obj.wasForgotten()) continue;
      const seen = new Set<string>();
      const props = obj.getProperties();
      for (const p of props) {
        const pa = p.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;
        const name = pa.getName().replace(/^["'`]|["'`]$/g, "");
        if (seen.has(name)) {
          pa.remove();
          totalRemoved++;
          modified = true;
          passModified = true;
          break outer; // re-scan from top
        }
        seen.add(name);
      }
    }
  }

  if (modified) {
    sf.saveSync();
    filesModified++;
  } else {
    project.removeSourceFile(sf);
  }
}

console.log(`Removed ${totalRemoved} duplicate properties from ${filesModified} files.`);
