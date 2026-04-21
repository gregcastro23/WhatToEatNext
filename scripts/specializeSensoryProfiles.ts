import * as fs from 'fs';
import * as path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});

const fpSfPath = path.join(INGREDIENTS_DIR, "flavorProfiles.ts");
console.log("Loading", fpSfPath);
const fpSf = project.addSourceFileAtPath(fpSfPath);
const flavorMapDecl = fpSf.getVariableDeclaration("ingredientFlavorMap");

if (!flavorMapDecl) {
  console.log("Could not find ingredientFlavorMap");
}

let flavorMapObj = flavorMapDecl?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
if (!flavorMapObj && flavorMapDecl?.getInitializer()) {
    const init = flavorMapDecl.getInitializer();
    if (init && init.getKind() === SyntaxKind.AsExpression) {
        flavorMapObj = init.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
    }
}

const FLAVORS: Record<string, Record<string, number>> = {};
if (flavorMapObj) {
  for (const prop of flavorMapObj.getProperties()) {
    const pa = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const key = pa.getName().replace(/^["'`]|["'`]$/g, "");
    const valObj = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!valObj) continue;
    
    const map: Record<string, number> = {};
    for (const vp of valObj.getProperties()) {
      const vpa = vp.asKind(SyntaxKind.PropertyAssignment);
      if (!vpa) continue;
      const vName = vpa.getName().replace(/^["'`]|["'`]$/g, "");
      const vNum = Number(vpa.getInitializer()?.getText());
      if (!isNaN(vNum)) map[vName] = vNum;
    }
    FLAVORS[key] = map;
  }
}

const TOP_OVERRIDES: Record<string, Record<string, number>> = {
  salt: { salty: 1.0, sweet: 0, sour: 0, bitter: 0, umami: 0, spicy: 0 },
  kosher_salt: { salty: 1.0, sweet: 0, sour: 0, bitter: 0, umami: 0, spicy: 0 },
  sugar: { sweet: 1.0, salty: 0, sour: 0, bitter: 0, umami: 0, spicy: 0 },
  granulated_sugar: { sweet: 1.0, salty: 0, sour: 0, bitter: 0, umami: 0, spicy: 0 },
  black_pepper: { spicy: 0.6, earthy: 0.4, sweet: 0, salty: 0, sour: 0, bitter: 0.2, umami: 0 },
  lemon_juice: { sour: 0.9, sweet: 0.1, salty: 0, bitter: 0.1, umami: 0, spicy: 0 },
  olive_oil: { sweet: 0.1, salty: 0, sour: 0, bitter: 0.2, umami: 0, spicy: 0.1, rich: 0.8 },
  butter: { sweet: 0.2, salty: 0.1, sour: 0, bitter: 0, umami: 0.1, spicy: 0, rich: 0.9 },
  unsalted_butter: { sweet: 0.2, salty: 0, sour: 0, bitter: 0, umami: 0.1, spicy: 0, rich: 0.9 },
  garlic: { spicy: 0.5, sweet: 0.2, salty: 0, sour: 0.1, bitter: 0.2, umami: 0.4 },
  onion: { spicy: 0.4, sweet: 0.3, salty: 0, sour: 0.1, bitter: 0.1, umami: 0.4 },
};

for (const [k, v] of Object.entries(TOP_OVERRIDES)) {
  FLAVORS[k] = v;
}

console.log(`Loaded ${Object.keys(FLAVORS).length} flavor profiles.`);

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

let replaced = 0;
let filesModified = 0;

for (const file of files) {
  const sf = project.addSourceFileAtPath(file);
  let modified = false;

  for (const decl of sf.getVariableDeclarations()) {
    const rootObj = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!rootObj) continue;

    for (const prop of rootObj.getProperties()) {
      const pa = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      let ingObj = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!ingObj) {
        const callExpr = pa.getInitializer()?.asKind(SyntaxKind.CallExpression);
        if (callExpr) {
          const args = callExpr.getArguments();
          const objArg = args.find((a) => a.getKind() === SyntaxKind.ObjectLiteralExpression);
          if (objArg) ingObj = objArg.asKind(SyntaxKind.ObjectLiteralExpression);
        }
      }
      if (!ingObj) continue;

      const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
      const nameProp = ingObj.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
      const ingName = nameProp?.getInitializer()?.getText().replace(/^["'`]|["'`]$/g, "") ?? slug;
      
      const flavorMatch = FLAVORS[slug] || FLAVORS[ingName] || FLAVORS[slug.replace(/_/g, ' ')];
      if (!flavorMatch) continue;

      const sensoryProp = ingObj.getProperty("sensoryProfile")?.asKind(SyntaxKind.PropertyAssignment);
      if (!sensoryProp) continue;

      const sensoryObj = sensoryProp.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!sensoryObj) continue;

      const text = sensoryObj.getText();
      if (text.includes('\\n') || text.split('\\n').length > 2) {
        continue;
      }
      
      const tasteProp = sensoryObj.getProperty("taste")?.asKind(SyntaxKind.PropertyAssignment);
      if (tasteProp) {
        const newTaste = "{ " + Object.entries(flavorMatch).map(([k, v]) => `${k}: ${v}`).join(', ') + " }";
        tasteProp.setInitializer(newTaste);
        replaced++;
        modified = true;
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

console.log(`Sensory profiles: ${replaced} entries specialized across ${filesModified} files.`);