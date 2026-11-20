"use client";

/**
 * Cuisine Telemetry readout panel displaying canonical 4-element distribution,
 * mother/traditional sauce inventory, signature methods, linked ingredients,
 * and planetary rulers for the selected tradition.
 *
 * @file src/components/recommendations/sauces/CuisineTelemetryCard.tsx
 */
import Link from "next/link";
import React from "react";
import { ELEMENT_ACCENT } from "@/components/recommendations/instrument";
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import type { CuisineFingerprint } from "@/utils/cuisine/cuisineSauceProfiler";

export interface CuisineTelemetryCardProps {
  fingerprint: CuisineFingerprint | null;
  ingredientSlugs: Record<string, string>;
}

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

function TelemetryHeader({ fingerprint }: { fingerprint: CuisineFingerprint }): React.ReactElement {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-2.5">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase">Cuisine Telemetry</span>
        <h4 className="text-sm font-serif font-semibold text-white tracking-wide">{fingerprint.name} Tradition</h4>
        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono text-white/60">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 tabular-nums">
            {fingerprint.motherSauceCount} Mother
          </span>
          <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-violet-200 tabular-nums">
            {fingerprint.traditionalSauceCount} Traditional
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2" aria-label="Four-element balance">
        {ELEMENTS.map((el) => {
          const pct = Math.round(fingerprint.elementalProperties[el] * 100);
          const accent = ELEMENT_ACCENT[el] ?? "#B5ADCC";
          return (
            <div key={el} className="flex flex-col items-center">
              <div className="w-7 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
              </div>
              <span className="text-[9px] font-mono text-white/60 mt-0.5 tabular-nums">
                {el[0]} {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SignatureIngredientsRow({
  ingredients,
  ingredientSlugs,
}: {
  ingredients: readonly string[];
  ingredientSlugs: Record<string, string>;
}): React.ReactElement | null {
  if (ingredients.length === 0) return null;
  return (
    <div className="pt-1 border-t border-white/5">
      <div className="text-[9px] font-mono uppercase text-white/50 mb-1 tracking-wider">Signature Botanicals & Pantry</div>
      <div className="flex flex-wrap gap-1">
        {ingredients.slice(0, 6).map((ing) => {
          const slug = ingredientSlugs[ing.trim().toLowerCase()];
          return slug ? (
            <Link
              key={ing}
              href={ingredientHref(slug)}
              prefetch={false}
              className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-200 hover:border-violet-300 hover:text-white transition-colors"
            >
              {ing}
            </Link>
          ) : (
            <span key={ing} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
              {ing}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function CuisineTelemetryCard({
  fingerprint,
  ingredientSlugs,
}: CuisineTelemetryCardProps): React.ReactElement | null {
  if (!fingerprint) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md space-y-3">
      <TelemetryHeader fingerprint={fingerprint} />
      {fingerprint.description && (
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">{fingerprint.description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {fingerprint.signatureTechniques.length > 0 && (
          <div>
            <div className="text-[9px] font-mono uppercase text-white/50 mb-1 tracking-wider">Signature Methods</div>
            <div className="flex flex-wrap gap-1">
              {fingerprint.signatureTechniques.slice(0, 3).map((tech) => (
                <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        {fingerprint.planetaryResonance.length > 0 && (
          <div>
            <div className="text-[9px] font-mono uppercase text-violet-300/70 mb-1 tracking-wider">Planetary Rulers</div>
            <div className="flex flex-wrap gap-1">
              {fingerprint.planetaryResonance.slice(0, 3).map((planet) => (
                <span key={planet} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-200">
                  ✦ {planet}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <SignatureIngredientsRow ingredients={fingerprint.signatureIngredients} ingredientSlugs={ingredientSlugs} />
    </div>
  );
}
