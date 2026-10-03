"use client";

/**
 * The ingredient dossier body. Its data arrives from the server page (SSR),
 * so the card, the recipes that use it and the counts are in the first HTML;
 * only the sky match and the trending strip are live on the client.
 */
import { useState, type JSX } from "react";
import { IngredientActions } from "@/components/ingredients/IngredientActions";
import { ProcurementKit, type ProcurementItem } from "@/components/ui/alchm";
import type { IngredientDossier } from "@/lib/ingredients/dossier";
import { titleCase } from "@/lib/ingredients/dossierView";
import { PairingsPanel, SensoryPanel, SeasonalityPanel, UsedInPanel } from "./DossierDetailPanels";
import { IdentityPanel, SkyMatchPanel, UsagePanel } from "./DossierHeroPanels";
import { TrendingTicker } from "./TrendingTicker";

const LAYOUT_CSS = `
  .ihero { padding: 18px 14px 40px; display: flex; flex-direction: column; gap: 22px; }
  .ihero-row { display: grid; grid-template-columns: 1fr; gap: 18px; }
  .ihero-charts { display: grid; grid-template-columns: 1fr; gap: 18px; }
  @media (min-width: 760px) {
    .ihero { padding: 24px 24px 60px; }
    .ihero-row { grid-template-columns: 1.4fr 1fr 1fr; align-items: stretch; }
    .ihero-charts { grid-template-columns: 1.5fr 1fr; align-items: start; }
  }
`;

function procurementFor({ slug, card }: IngredientDossier): ProcurementItem[] {
  const sym = card.name.slice(0, 3).toUpperCase().replace(/\s+/g, "");
  return [{ sym, n: `${card.name}, market unit`, src: "", px: "", qty: 1, ingredientId: slug }];
}

export function IngredientDossierView({ dossier }: { dossier: IngredientDossier }): JSX.Element {
  const { card, recipes, recipeCount } = dossier;
  const [now] = useState(() => new Date());
  return (
    <div style={{ minHeight: "calc(100vh - 70px)", background: "var(--bg)" }}>
      <TrendingTicker />
      <style>{LAYOUT_CSS}</style>
      <main className="ihero">
        <section className="ihero-row">
          <IdentityPanel card={card} />
          <SkyMatchPanel card={card} />
          <UsagePanel card={card} recipeCount={recipeCount} />
        </section>
        <IngredientActions name={card.name} category={card.category} label={titleCase(card.name)} />
        <section className="ihero-charts">
          <SeasonalityPanel seasons={card.seasons} now={now} />
          <SensoryPanel flavorProfile={card.flavorProfile} />
        </section>
        <section>
          <ProcurementKit items={procurementFor(dossier)} ctaLabel="Procure substance" primeBadge="PRIME · 1 DAY" />
        </section>
        <section style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <UsedInPanel recipes={recipes} recipeCount={recipeCount} />
          <PairingsPanel pairings={dossier.pairings} />
        </section>
      </main>
    </div>
  );
}
