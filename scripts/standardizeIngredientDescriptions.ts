/**
 * Replace known placeholder ingredient descriptions with richer standardized copy.
 *
 * Strategy:
 * - Prefer existing `ingredientSummaries[slug]`
 * - Fallback to a category-aware generated description using ingredient name
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

const PLACEHOLDER_SIGNATURES = [
  "A pantry staple,",
  "A fresh plant food,",
  "A protein-rich ingredient,",
  "A dried aromatic spice,",
  "A foundational seasoning,",
  "An acidic condiment,",
  "A culinary fat,",
  "A dairy product,",
  "An aromatic culinary herb,",
  "A cereal or pseudo-cereal product,",
  "A liquid consumable,",
];

function stripQuotes(s: string): string {
  return s.replace(/^["'`]|["'`]$/g, "");
}

function sentenceName(name: string): string {
  return name.trim() || "This ingredient";
}

function titleName(name: string): string {
  return sentenceName(name)
    .split(" ")
    .filter(Boolean)
    .map((w) => `${w[0]?.toUpperCase() ?? ""}${w.slice(1)}`)
    .join(" ");
}

function generatedDescription(name: string, category?: string): string {
  const n = sentenceName(name);
  const t = titleName(name);
  const c = (category ?? "").toLowerCase();

  if (c.includes("spice")) {
    return `${t} is a concentrated aromatic spice used in small amounts to add heat, fragrance, and depth to sauces, marinades, and dry rubs. Blooming it briefly in hot fat or toasting it gently before grinding helps release volatile oils and prevents flat flavor. Store airtight away from light and humidity, and refresh frequently to maintain potency.`;
  }
  if (c.includes("herb")) {
    return `${t} is an aromatic herb used to brighten savory dishes with fresh, volatile flavor compounds. Add early for mellow infusion or late for sharper aromatic lift, depending on the recipe goal. Because aroma degrades quickly with heat and air, keep it cold and dry, and chop just before use when possible.`;
  }
  if (c.includes("oil") || c.includes("fat")) {
    return `${t} is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.`;
  }
  if (c.includes("vinegar") || c.includes("acid")) {
    return `${t} is an acidic ingredient used to balance richness, sharpen flavor, and improve perceived freshness in finished dishes. In small doses it can also support emulsification and brighten sauces, pickles, and braises. Add gradually and taste as you go, since acidity intensity varies significantly by style and concentration.`;
  }
  if (c.includes("dairy")) {
    return `${t} is a dairy ingredient that contributes richness, body, and protein structure to both savory and sweet preparations. Heat and acid can quickly shift texture from smooth to curdled, so gentle temperature control is important in sauces and custards. Keep refrigerated and handle with clean tools to maintain shelf life and flavor.`;
  }
  if (c.includes("grain")) {
    return `${t} is a grain-based ingredient that contributes starch, structure, and sustained body to dishes. Hydration ratio, particle size, and cooking time strongly affect final texture, from creamy and tender to chewy and crisp. Store dry in an airtight container and rotate stock to avoid stale or rancid flavors.`;
  }
  if (c.includes("protein") || c.includes("meat") || c.includes("seafood")) {
    return `${t} is a protein-forward ingredient valued for structure, satiety, and umami depth. Technique determines outcome: dry heat builds browning and intensity, while moist heat promotes tenderness and even hydration. Season in layers and cook to the right internal doneness target for both flavor and safety.`;
  }
  if (c.includes("fruit")) {
    return `${t} is a fruit ingredient used for sweetness, acidity, aroma, and moisture balance. Ripeness and processing method meaningfully change flavor concentration and texture, so adjust sugar and acid around the ingredient's current state. Use chilled for freshness-driven dishes or cooked to concentrate body and flavor.`;
  }
  if (c.includes("vegetable")) {
    return `${t} is a vegetable ingredient that contributes structure, micronutrients, and a broad range of textures depending on cut and heat level. High heat emphasizes caramelization and sweetness, while gentle cooking preserves water content and delicate notes. Prep consistently so pieces cook evenly and integrate cleanly into the dish.`;
  }
  if (c.includes("season")) {
    return `${t} is a seasoning ingredient used to adjust balance, aroma, and perceived intensity across savory and sweet cooking. Add in stages so you can control extraction during cooking and precision at the finish. Keep sealed and dry to preserve potency and prevent clumping or flavor drift.`;
  }
  if (c.includes("beverage") || c.includes("liquid")) {
    return `${t} is a liquid culinary ingredient used for hydration, extraction, and flavor transport. Temperature and dilution directly affect aroma release and mouthfeel, so tune handling to the dish rather than treating it as neutral water. Store as directed and keep containers sealed between uses to preserve freshness.`;
  }

  return `${t} is a culinary ingredient used to contribute flavor, texture, and functional balance within a dish. Its impact depends on when it is added and how it is prepared, so adjust timing and quantity to match the recipe's desired result. Store in stable, dry conditions and rotate inventory regularly for consistent quality.`;
}

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});

const summariesPath = path.join(INGREDIENTS_DIR, "ingredientSummaries.ts");
const summaries: Record<string, string> = {};
if (fs.existsSync(summariesPath)) {
  const sf = project.addSourceFileAtPath(summariesPath);
  const decl = sf.getVariableDeclaration("ingredientSummaries");
  const obj = decl?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (obj) {
    for (const p of obj.getProperties()) {
      const pa = p.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const key = stripQuotes(pa.getName());
      const init = pa.getInitializer()?.getText() ?? "";
      summaries[key] = stripQuotes(init);
    }
  }
}

const files: string[] = [];
const walk = (dir: string): void => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (
      entry.isFile() &&
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
};
walk(INGREDIENTS_DIR);

let replaced = 0;
let touchedFiles = 0;

for (const file of files) {
  const sf = project.addSourceFileAtPath(file);
  let touched = false;

  for (const decl of sf.getVariableDeclarations()) {
    const root = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!root) continue;

    for (const p of root.getProperties()) {
      const pa = p.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const slug = stripQuotes(pa.getName());
      const obj = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) continue;

      const descProp = obj.getProperty("description")?.asKind(SyntaxKind.PropertyAssignment);
      const nameProp = obj.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
      if (!descProp || !nameProp) continue;

      const current = stripQuotes(descProp.getInitializer()?.getText() ?? "");
      const isPlaceholder = PLACEHOLDER_SIGNATURES.some((sig) => current.startsWith(sig));
      if (!isPlaceholder) continue;

      const name = stripQuotes(nameProp.getInitializer()?.getText() ?? slug);
      const category = stripQuotes(
        obj.getProperty("category")?.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()?.getText() ?? "",
      );
      const replacement = summaries[slug] || generatedDescription(name, category);
      descProp.setInitializer(JSON.stringify(replacement));
      replaced += 1;
      touched = true;
    }
  }

  if (touched) {
    sf.saveSync();
    touchedFiles += 1;
  } else {
    project.removeSourceFile(sf);
  }
}

// eslint-disable-next-line no-console
console.log(`Standardized descriptions: replaced ${replaced} placeholders across ${touchedFiles} files.`);

