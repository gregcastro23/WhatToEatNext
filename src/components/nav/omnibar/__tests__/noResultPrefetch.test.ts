/**
 * Result links never prefetch (production, 2026-09-24): Next prefetches a
 * <Link> as it scrolls into view, which renders the destination page. One
 * "aubergine" result list rendered five recipe pages at once, each loading the
 * whole recipe catalog on a cold instance while the database was timing out.
 * Every <Link> in the omnibar's result surfaces must say prefetch={false}.
 */
import { readFileSync } from "fs";
import { join } from "path";

const RESULT_SURFACES = [
  "src/components/nav/omnibar/OmnibarResults.tsx",
  "src/components/nav/omnibar/OmnibarActionChip.tsx",
  "src/components/search/SearchResultsView.tsx",
  "src/components/ingredients/dossier/DossierDetailPanels.tsx",
  "src/components/ingredients/dossier/TrendingTicker.tsx",
  "src/components/sauces/SauceFocusCard.tsx",
  "src/components/ingredients/IngredientActions.tsx",
];

function linkTags(source: string): string[] {
  return [...source.matchAll(/<Link\b[^>]*>/gs)].map((m) => m[0]);
}

describe("omnibar result links", () => {
  it.each(RESULT_SURFACES)("%s: every <Link> sets prefetch={false}", (file) => {
    const tags = linkTags(readFileSync(join(process.cwd(), file), "utf8"));
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.filter((tag) => !tag.includes("prefetch={false}"))).toEqual([]);
  });
});
