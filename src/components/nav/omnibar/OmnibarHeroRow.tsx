/**
 * The ingredient hero (plan §6): the card the query resolved to, with the
 * facts that answer "what is this": category, seasons, qualities, ruling
 * planet, elemental balance, and how many live recipes use it. Text and
 * bars only; the thumbnail is the card's served image when it has one.
 */
import { HeroThumb } from "./HeroThumb";
import type { OmnibarHero } from "./omnibarTypes";
import type { JSX } from "react";

type Elemental = NonNullable<OmnibarHero["elemental"]>;

/** The dossier's element hues, with fallbacks for pages outside the themed root. */
const ELEMENTS: ReadonlyArray<{ key: keyof Elemental; color: string }> = [
  { key: "Fire", color: "var(--el-fire, oklch(0.74 0.17 35))" },
  { key: "Water", color: "var(--el-water, oklch(0.74 0.13 230))" },
  { key: "Earth", color: "var(--el-earth, oklch(0.74 0.11 130))" },
  { key: "Air", color: "var(--el-air, oklch(0.85 0.07 90))" },
];

function ElementalMeter({ elemental }: { elemental: Elemental }): JSX.Element {
  const label = ELEMENTS.map(({ key }) => `${key} ${Math.round(elemental[key] * 100)}%`).join(", ");
  return (
    <span className="omni-meter" role="img" aria-label={`Elemental balance: ${label}`}>
      {ELEMENTS.map(({ key, color }) => (
        <span key={key} className="omni-meter-bar" title={`${key} ${Math.round(elemental[key] * 100)}%`}>
          <span style={{ height: `${Math.max(6, Math.min(100, elemental[key] * 100))}%`, background: color }} />
        </span>
      ))}
    </span>
  );
}

/** "all", or every one of the four seasons (fall and autumn are one), reads as year-round. */
function isYearRound(seasons: readonly string[]): boolean {
  const named = new Set(seasons.map((s) => (s === "fall" ? "autumn" : s)));
  return named.has("all") || ["spring", "summer", "autumn", "winter"].every((s) => named.has(s));
}

function metaLine(hero: OmnibarHero): string[] {
  const seasons = isYearRound(hero.seasons) ? ["YEAR-ROUND"] : hero.seasons.map((s) => s.toUpperCase());
  return [hero.category.toUpperCase(), ...seasons];
}

export function OmnibarHeroRow({ hero, label }: { hero: OmnibarHero; label: string }): JSX.Element {
  const facts = [...hero.qualities, ...hero.rulingPlanets.slice(0, 1).map((p) => `ruled by ${p}`)];
  return (
    <span className="omni-hero">
      <HeroThumb src={hero.imageUrl} label={label} />
      <span className="omni-hero-body">
        <span className="omni-hero-name">{label}</span>
        <span className="omni-hero-meta">
          {metaLine(hero).join(" · ")}
          {hero.inSeasonNow ? <span className="omni-badge">IN SEASON NOW</span> : null}
        </span>
        {facts.length > 0 ? <span className="omni-hero-facts">{facts.join(" · ")}</span> : null}
      </span>
      {hero.elemental ? <ElementalMeter elemental={hero.elemental} /> : null}
      <span className="omni-hero-count">
        <span className="omni-hero-count-n">{hero.recipeCount}</span>
        <span className="omni-hero-count-l">{hero.recipeCount === 1 ? "RECIPE" : "RECIPES"}</span>
      </span>
    </span>
  );
}
