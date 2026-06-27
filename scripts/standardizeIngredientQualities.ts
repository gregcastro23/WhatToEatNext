#!/usr/bin/env bun
/**
 * Scan recipeCoverageIngredients.ts and replace placeholder qualities:
 * ["recipe-linked", "standardized"] with rich, authentic, and category/name-specific qualities.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const COVERAGE_FILE = path.join(REPO_ROOT, "src", "data", "ingredients", "misc", "recipeCoverageIngredients.ts");

function stripQuotes(s: string): string {
  return s.replace(/^["'`]|["'`]$/g, "");
}

function getQualities(name: string, category: string): string[] {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  // Custom name-based rules
  if (n.includes("sauce") || n.includes("marinade")) {
    return ["savory", "liquid", "umami"];
  }
  if (n.includes("syrup") || n.includes("sugar") || n.includes("honey") || n.includes("sweet")) {
    return ["sweet", "sticky", "rich"];
  }
  if (n.includes("broth") || n.includes("stock")) {
    return ["savory", "liquid", "base"];
  }
  if (n.includes("pepper") || n.includes("chili") || n.includes("spicy")) {
    return ["spicy", "pungent", "warm"];
  }
  if (n.includes("wine") || n.includes("beer") || n.includes("sake") || n.includes("alcohol")) {
    return ["alcoholic", "aromatic", "acidic"];
  }
  if (n.includes("flour") || n.includes("starch") || n.includes("powder")) {
    return ["starchy", "powdery", "dry"];
  }
  if (n.includes("bun") || n.includes("bread") || n.includes("roll") || n.includes("crust")) {
    return ["yeasty", "baked", "soft"];
  }
  if (n.includes("cheese") || n.includes("milk") || n.includes("cream") || n.includes("yogurt")) {
    return ["creamy", "rich", "dairy-based"];
  }
  if (n.includes("seed") || n.includes("nut")) {
    return ["nutty", "crunchy", "fat-rich"];
  }

  // Category fallbacks
  if (c.includes("grain")) return ["carbohydrate-rich", "sustaining", "versatile"];
  if (c.includes("vegetable")) return ["fresh", "nutrient-dense", "versatile"];
  if (c.includes("herb")) return ["aromatic", "fresh", "bright"];
  if (c.includes("spice")) return ["aromatic", "warm", "concentrated"];
  if (c.includes("seasoning")) return ["foundational", "flavor-building", "savory"];
  if (c.includes("oil") || c.includes("fat")) return ["fatty", "rich", "flavor-carrier"];
  if (c.includes("vinegar") || c.includes("acid")) return ["acidic", "bright", "balancing"];
  if (c.includes("beverage")) return ["refreshing", "aromatic", "hydrating"];
  if (c.includes("dairy")) return ["creamy", "rich", "foundational"];
  if (c.includes("fruit")) return ["sweet", "juicy", "aromatic"];
  if (c.includes("protein") || c.includes("meat") || c.includes("seafood")) return ["protein-rich", "nourishing", "savory"];

  return ["functional", "flavor-builder", "pantry-staple"];
}

function main() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error(`File not found: ${COVERAGE_FILE}`);
    process.exit(1);
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
  });

  const sf = project.addSourceFileAtPath(COVERAGE_FILE);
  let replacedCount = 0;

  for (const decl of sf.getVariableDeclarations()) {
    const root = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!root) continue;

    for (const p of root.getProperties()) {
      const pa = p.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;

      const obj = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) continue;

      const qualitiesProp = obj.getProperty("qualities")?.asKind(SyntaxKind.PropertyAssignment);
      if (!qualitiesProp) continue;

      const currentText = qualitiesProp.getInitializer()?.getText() ?? "";
      // Match the exact placeholder pattern
      if (currentText.includes("recipe-linked") && currentText.includes("standardized")) {
        const nameProp = obj.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
        const categoryProp = obj.getProperty("category")?.asKind(SyntaxKind.PropertyAssignment);

        const name = stripQuotes(nameProp?.getInitializer()?.getText() ?? "");
        const category = stripQuotes(categoryProp?.getInitializer()?.getText() ?? "misc");

        const richQualities = getQualities(name, category);
        qualitiesProp.setInitializer(JSON.stringify(richQualities));
        replacedCount++;
      }
    }
  }

  if (replacedCount > 0) {
    sf.saveSync();
    console.log(`Standardized qualities: replaced ${replacedCount} placeholder qualities arrays in recipeCoverageIngredients.ts.`);
  } else {
    console.log("No placeholder qualities arrays found.");
  }
}

main();
