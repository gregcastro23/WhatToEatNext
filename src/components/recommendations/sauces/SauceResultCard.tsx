"use client";

/**
 * Individual harmonized sauce recommendation card with 4-element readout,
 * linked ingredient chips, pantry coverage, and accessible expandable dossier.
 *
 * @file src/components/recommendations/sauces/SauceResultCard.tsx
 */
import Link from "next/link";
import React, { useId, useMemo, useState } from "react";
import { ELEMENT_ACCENT } from "@/components/recommendations/instrument";
import { allSauces } from "@/data/sauces";
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import { computePantryMatch, type PantryMatchResult } from "@/lib/sauces/pantryMatch";
import { sauceHref } from "@/lib/sauces/sauceFocus";
import type { CuisineSauceResult, ScoreBreakdown, UnifiedSauce } from "@/utils/cuisine/cuisineSauceProfiler";
import SauceDrawerContent from "./SauceDrawerContent";

export interface SauceResultCardProps {
  result: CuisineSauceResult;
  rank: number;
  activeCuisine: string;
  ingredientSlugs: Record<string, string>;
  pantryNames: readonly string[];
  onInspectLineage?: (id: string) => void;
}

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

function TelemetryBar({
  label,
  value,
  tone = "violet",
}: {
  label: string;
  value: number;
  tone?: "violet" | "amber" | "emerald" | "sky";
}): React.ReactElement {
  const pct = Math.round(value * 100);
  const colorMap = { violet: "bg-violet-400", amber: "bg-amber-400", emerald: "bg-emerald-400", sky: "bg-sky-400" };
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-white/60 truncate font-mono text-[10px] uppercase">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[tone]} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-[11px] text-white/75 tabular-nums">{pct}%</span>
    </div>
  );
}

function getOriginBadge(origin: UnifiedSauce["origin"]): { label: string; tone: string } {
  switch (origin) {
    case "mother":
      return { label: "Mother Sauce", tone: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    case "traditional":
      return { label: "Traditional", tone: "bg-violet-500/20 text-violet-300 border-violet-500/40" };
    case "global":
      return { label: "Global", tone: "bg-sky-500/20 text-sky-300 border-sky-500/40" };
    default:
      return { label: "Pairing", tone: "bg-white/10 text-white/70 border-white/15" };
  }
}

function CardHeader({
  sauce,
  rank,
  matchPct,
  pantryCount,
  pantryMatch,
}: {
  sauce: UnifiedSauce;
  rank: number;
  matchPct: number;
  pantryCount: number;
  pantryMatch: PantryMatchResult;
}): React.ReactElement {
  const originBadge = getOriginBadge(sauce.origin);
  const rankTone =
    rank === 1
      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black"
      : rank === 2
        ? "bg-gradient-to-br from-violet-400 to-violet-600 text-white"
        : "bg-white/10 text-white/80 border border-white/10";
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-mono font-bold shrink-0 ${rankTone}`}>
          #{rank}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${originBadge.tone}`}>
              {originBadge.label}
            </span>
            {sauce.ownerCuisine && (
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
                {sauce.ownerCuisine}
              </span>
            )}
            {sauce.base && <span className="text-[9px] font-mono text-white/50">· {sauce.base} base</span>}
            {sauce.seasonality && <span className="text-[9px] font-mono text-white/45">· {sauce.seasonality}</span>}
            {pantryCount > 0 && pantryMatch.total > 0 && (
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${pantryMatch.matched.length > 0 ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200" : "bg-white/[0.03] border-white/10 text-white/50"}`}>
                {pantryMatch.matched.length}/{pantryMatch.total} in pantry
              </span>
            )}
          </div>
          <h4 className="text-xl font-serif font-medium text-white tracking-wide">{sauce.name}</h4>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-2xl font-mono font-bold tracking-tight bg-gradient-to-r from-violet-300 via-white to-amber-300 bg-clip-text text-transparent tabular-nums">
          {matchPct}%
        </div>
        <div className="text-[9px] font-mono uppercase tracking-widest text-violet-300/75">Harmonic Match</div>
        {sauce.elementalProperties && (
          <div className="flex items-center justify-end gap-1 mt-1.5" aria-label="Sauce elemental signature">
            {ELEMENTS.map((el) => {
              const pct = Math.round((sauce.elementalProperties?.[el] ?? 0) * 100);
              return (
                <span key={el} title={`${el}: ${pct}%`} className="inline-block h-1 w-4 rounded-full bg-white/10 overflow-hidden">
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ELEMENT_ACCENT[el] ?? "#B5ADCC" }} />
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CardIngredients({
  ingredients,
  ingredientSlugs,
  matchedSet,
}: {
  ingredients: readonly string[];
  ingredientSlugs: Record<string, string>;
  matchedSet: ReadonlySet<string>;
}): React.ReactElement | null {
  if (ingredients.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ingredients.slice(0, 6).map((ing) => {
        const slug = ingredientSlugs[ing.trim().toLowerCase()];
        const inPantry = matchedSet.has(ing.trim());
        const chipClass = `text-[10px] font-mono px-2 py-0.5 rounded-full border inline-flex items-center gap-1 transition-colors ${
          slug
            ? "border-violet-400/35 bg-violet-500/10 text-violet-200 hover:border-violet-300 hover:text-white"
            : "border-white/10 bg-white/[0.03] text-white/70"
        }`;
        return slug ? (
          <Link key={ing} href={ingredientHref(slug)} prefetch={false} className={chipClass}>
            {inPantry && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-label="In pantry" />}
            {ing}
          </Link>
        ) : (
          <span key={ing} className={chipClass}>
            {inPantry && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-label="In pantry" />}
            {ing}
          </span>
        );
      })}
    </div>
  );
}

function CardActions({
  expanded,
  hasFullRecipe,
  drawerId,
  sauce,
  phylogenyCuisine,
  onToggleExpand,
  onInspectLineage,
}: {
  expanded: boolean;
  hasFullRecipe: boolean;
  drawerId: string;
  sauce: UnifiedSauce;
  phylogenyCuisine: string;
  onToggleExpand: () => void;
  onInspectLineage?: (id: string) => void;
}): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={drawerId}
        onClick={onToggleExpand}
        className="w-full sm:w-auto sm:flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono tracking-wider uppercase text-white/85 hover:text-white transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
      >
        <span>{expanded ? "Hide Dossier & Notes" : hasFullRecipe ? "View Recipe & Scaler" : "View Traditional Dossier"}</span>
        <span className="text-[10px] text-violet-300" aria-hidden="true">{expanded ? "▲" : "▼"}</span>
      </button>
      {onInspectLineage ? (
        <button
          type="button"
          onClick={() => onInspectLineage(sauce.id)}
          className="flex-1 sm:flex-initial justify-center min-h-[40px] py-2 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-xs font-mono tracking-wider uppercase text-violet-200 hover:text-white transition-all flex items-center gap-1.5 shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
        >
          <span>Phylogeny</span>
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <Link
          href={`/sauces?cuisine=${encodeURIComponent(phylogenyCuisine)}`}
          prefetch={false}
          className="flex-1 sm:flex-initial justify-center min-h-[40px] py-2 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-xs font-mono tracking-wider uppercase text-violet-200 hover:text-white transition-all flex items-center gap-1.5 shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
        >
          <span>Phylogeny</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
      {sauce.dataKey && (
        <Link
          href={sauceHref(sauce.dataKey)}
          prefetch={false}
          className="flex-1 sm:flex-initial justify-center min-h-[40px] py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono tracking-wider uppercase text-amber-200 hover:text-white transition-all flex items-center gap-1.5 shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2"
        >
          <span>Full Dossier</span>
          <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}

function CardBreakdown({ breakdown }: { breakdown: ScoreBreakdown }): React.ReactElement {
  return (
    <div className="space-y-1.5 rounded-xl border border-white/5 bg-black/25 p-3">
      <TelemetryBar label="Authenticity" value={breakdown.cuisineAuthenticity} tone="violet" />
      <TelemetryBar label="Dish Pairing" value={breakdown.dishPairing} tone="amber" />
      <TelemetryBar label="Cosmic Harmony" value={breakdown.astrologicalHarmony} tone="sky" />
      <TelemetryBar label="Elemental Fit" value={breakdown.elementalCompatibility} tone="emerald" />
    </div>
  );
}

export default function SauceResultCard({
  result,
  rank,
  activeCuisine,
  ingredientSlugs,
  pantryNames,
  onInspectLineage,
}: SauceResultCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const drawerId = useId();
  const { sauce } = result;
  const dataSauce = sauce.dataKey ? allSauces[sauce.dataKey] : undefined;
  const hasFullRecipe = (sauce.ingredients?.length ?? 0) > 0 || (dataSauce?.ingredients?.length ?? 0) > 0;
  const keyIngredients = useMemo(
    () => sauce.keyIngredients ?? dataSauce?.keyIngredients ?? [],
    [sauce.keyIngredients, dataSauce?.keyIngredients],
  );
  const pantryMatch = useMemo(() => computePantryMatch(keyIngredients, pantryNames), [keyIngredients, pantryNames]);
  const matchedSet = useMemo(() => new Set(pantryMatch.matched), [pantryMatch.matched]);

  return (
    <article
      className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl overflow-hidden ${
        expanded
          ? "border-violet-500/60 bg-[#120f20] shadow-[0_0_35px_rgba(139,92,246,0.2)] ring-1 ring-violet-500/40"
          : "border-white/10 bg-[#0e0c16]/85 hover:border-white/20 hover:bg-[#120f1e] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
      }`}
    >
      <div className="p-5 md:p-6 space-y-4">
        <CardHeader sauce={sauce} rank={rank} matchPct={Math.round(result.score * 100)} pantryCount={pantryNames.length} pantryMatch={pantryMatch} />
        <p className="text-xs text-white/75 line-clamp-2 leading-relaxed">
          {sauce.description ?? "An authentic alchemical sauce formulation tuned for this dish composition."}
        </p>
        <CardIngredients ingredients={keyIngredients} ingredientSlugs={ingredientSlugs} matchedSet={matchedSet} />
        <CardBreakdown breakdown={result.breakdown} />
        <CardActions
          expanded={expanded}
          hasFullRecipe={hasFullRecipe}
          drawerId={drawerId}
          sauce={sauce}
          phylogenyCuisine={sauce.ownerCuisine ?? activeCuisine}
          onToggleExpand={() => setExpanded((prev) => !prev)}
          {...(onInspectLineage ? { onInspectLineage } : {})}
        />
        {expanded && <SauceDrawerContent drawerId={drawerId} result={result} {...(dataSauce ? { dataSauce } : {})} />}
      </div>
    </article>
  );
}
