"use client";

/**
 * The dossier's lower rows: seasonality and sensory charts, the recipes that
 * use the ingredient (live catalog, linked), and its pairings.
 */
import Link from "next/link";
import { SeasonalityChart, SensoryRadar } from "@/components/ui/alchm";
import type { DossierRecipe } from "@/lib/ingredients/dossier";
import type { DossierCard } from "@/lib/ingredients/dossierView";
import { buildSensoryAxes, buildYieldCurve } from "./dossierCharts";
import type { JSX } from "react";

const DASHED_NOTE = {
  padding: 18,
  border: "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
  borderRadius: 8,
};

export function SeasonalityPanel({ seasons, now }: { seasons: readonly string[]; now: Date }): JSX.Element {
  return (
    <div className="alchm-panel" style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div className="t-tag">SEASONALITY · 12 MONTH YIELD</div>
          <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 4 }}>
            NORTHERN HEMISPHERE · SMOOTHED CURVE
          </div>
        </div>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>
          MONTH · {now.toLocaleString("en-US", { month: "short" }).toUpperCase()}
        </span>
      </div>
      <SeasonalityChart yields={buildYieldCurve(seasons)} activeMonth={now.getMonth()} />
    </div>
  );
}

export function SensoryPanel({ flavorProfile }: { flavorProfile: DossierCard["flavorProfile"] }): JSX.Element {
  return (
    <div className="alchm-panel" style={{ padding: "20px 24px" }}>
      <div className="t-tag" style={{ marginBottom: 14 }}>
        SENSORY PROFILE · 7-AXIS
      </div>
      {Object.keys(flavorProfile).length > 0 ? (
        <SensoryRadar axes={buildSensoryAxes(flavorProfile)} size={240} />
      ) : (
        <div style={DASHED_NOTE}>
          <div className="t-mono" style={{ fontSize: 10, color: "var(--accent)" }}>
            AWAITING flavorProfile
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 6 }}>
            This ingredient record has no numeric sensory map (sweet/salt/sour/bitter/umami/spicy/aromatic).
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeRow({ recipe }: { recipe: DossierRecipe }): JSX.Element {
  return (
    <Link
      href={recipe.href}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--line)",
        textDecoration: "none",
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: "var(--fg)" }}>{recipe.name}</div>
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2, letterSpacing: "0.1em" }}>
          {recipe.cuisine?.toUpperCase() ?? "—"}
          {recipe.alternative ? " · OR ALTERNATIVE" : ""}
        </div>
      </div>
      <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
        {recipe.totalMinutes === null ? "" : `${recipe.totalMinutes}m`}
      </div>
    </Link>
  );
}

export function UsedInPanel({ recipes, recipeCount }: { recipes: readonly DossierRecipe[]; recipeCount: number }): JSX.Element {
  const more = recipeCount - recipes.length;
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 10 }}>
        USED IN · {recipeCount} {recipeCount === 1 ? "RECIPE" : "RECIPES"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {recipes.map((recipe) => (
          <RecipeRow key={recipe.id} recipe={recipe} />
        ))}
        {recipes.length === 0 && (
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            no recipes in the live catalog use it yet
          </span>
        )}
        {more > 0 && (
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            and {more} more
          </span>
        )}
      </div>
    </div>
  );
}

export function PairingsPanel({ pairings }: { pairings: readonly string[] }): JSX.Element {
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 10 }}>
        PAIRS WITH
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {pairings.slice(0, 6).map((name) => (
          <span key={name} className="alchm-chip">
            {name}
          </span>
        ))}
        {pairings.length === 0 && (
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            no pairings indexed
          </span>
        )}
      </div>
    </div>
  );
}
