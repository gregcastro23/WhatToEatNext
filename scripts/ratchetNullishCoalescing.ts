/**
 * Precision script to resolve @typescript-eslint/prefer-nullish-coalescing
 * by replacing logical OR (`||`) with nullish coalescing (`??`) at exact AST/linter report coordinates.
 */

import { ESLint } from "eslint";
import fs from "fs";
import path from "path";

const REPO_ROOT = path.resolve(import.meta.dir, "..");

export async function fixNullishCoalescing(targetPaths: string[]) {
  const eslint = new ESLint({
    overrideConfigFile: path.join(REPO_ROOT, "eslint.config.audit.mjs"),
  });

  console.log(`Linting ${targetPaths.join(", ")} for prefer-nullish-coalescing...`);
  const results = await eslint.lintFiles(targetPaths);

  let totalFixed = 0;

  for (const res of results) {
    const messages = res.messages.filter(
      (m) => m.ruleId === "@typescript-eslint/prefer-nullish-coalescing" && m.line && m.column,
    );

    if (messages.length === 0) continue;

    console.log(`Found ${messages.length} occurrences in ${path.relative(REPO_ROOT, res.filePath)}`);

    const fileContent = fs.readFileSync(res.filePath, "utf8");
    const lines = fileContent.split("\n");

    // Sort messages in reverse order (bottom to top, right to left)
    messages.sort((a, b) => {
      if (b.line !== a.line) return b.line - a.line;
      return b.column - a.column;
    });

    let modified = false;

    for (const msg of messages) {
      const lineIdx = msg.line - 1;
      const line = lines[lineIdx];
      if (!line) continue;

      // msg.column is 1-based index
      const colIdx = msg.column - 1;

      // Look for || around the column position
      const searchStart = Math.max(0, colIdx - 5);
      const searchEnd = Math.min(line.length, colIdx + 20);
      const searchWindow = line.slice(searchStart, searchEnd);

      const orPosInWindow = searchWindow.indexOf("||");
      if (orPosInWindow !== -1) {
        const exactPos = searchStart + orPosInWindow;
        lines[lineIdx] = line.slice(0, exactPos) + "??" + line.slice(exactPos + 2);
        modified = true;
        totalFixed++;
      }
    }

    if (modified) {
      fs.writeFileSync(res.filePath, lines.join("\n"), "utf8");
    }
  }

  console.log(`Successfully fixed ${totalFixed} prefer-nullish-coalescing warnings.`);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const targets = args.length > 0 ? args : [
    "src/utils/cookingMethodRecommender.ts",
    "src/utils/ingredientRecommender.ts",
    "src/services/FoodDiaryService.ts",
    "src/services/UnifiedIngredientService.ts",
    "src/services/UnifiedRecommendationService.ts",
    "src/utils/recommendation/methodRecommendation.ts",
    "src/services/UnifiedScoringService.ts",
    "src/services/TokenEconomyService.ts",
    "src/services/LocalRecipeService.ts",
    "src/lib/alchemizer.ts",
  ];
  fixNullishCoalescing(targets);
}
