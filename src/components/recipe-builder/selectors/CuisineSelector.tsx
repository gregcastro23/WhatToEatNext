"use client";

/**
 * Regional and cultural cuisines — the indexed cuisines (plus a fallback
 * list) as chips, the two strongest statistical signatures of each selected
 * cuisine, and free-text entry for anything else.
 *
 * @file src/components/recipe-builder/selectors/CuisineSelector.tsx
 */

import React, { useMemo } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { getAllCuisineNames, getCuisineEntry } from "@/utils/cuisine/cuisineIndex";
import { CustomEntryInput } from "./CustomEntryInput";
import { ToggleChipGroup } from "./ToggleChipGroup";

const CUISINE_FALLBACK: readonly string[] = [
  "American",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Thai",
  "Vietnamese",
];

interface SignatureSummary {
  cuisine: string;
  sampleSize: number;
  signatures: Array<{ property: string; zscore: number; description?: string }>;
}

function formatSignatureLabel(property: string, zscore: number): string {
  const direction = zscore >= 0 ? "elevated" : "reduced";
  const magnitude = Math.abs(zscore).toFixed(1);
  return `${property} ${direction} ${magnitude}σ`;
}

/** The two largest-|z| signatures of each selected cuisine the index knows. */
function summarizeSignatures(cuisines: readonly string[]): SignatureSummary[] {
  const summaries: SignatureSummary[] = [];
  for (const cuisine of cuisines) {
    const entry = getCuisineEntry(cuisine);
    if (!entry) continue;
    const signatures = [...entry.signatures]
      .sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore))
      .slice(0, 2)
      .map((sig) => ({
        property: String(sig.property),
        zscore: sig.zscore,
        ...(sig.description ? { description: sig.description } : {}),
      }));
    if (signatures.length > 0) {
      summaries.push({ cuisine, sampleSize: entry.sampleSize, signatures });
    }
  }
  return summaries;
}

function SignatureCard({ summary }: { summary: SignatureSummary }): React.JSX.Element {
  return (
    <div className="glass-card-premium rounded-xl border border-purple-500/20 bg-purple-950/20 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-purple-300">
          {summary.cuisine} Alchemical Signatures
        </span>
        <span className="t-mono text-[10px] text-purple-400/60">
          corpus n={summary.sampleSize}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {summary.signatures.map((sig) => (
          <span
            key={`${summary.cuisine}-${sig.property}`}
            title={sig.description}
            className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-purple-400/30 px-2 py-0.5 text-[10px] font-medium text-purple-200 t-mono"
          >
            <span aria-hidden>✨</span>
            {formatSignatureLabel(sig.property, sig.zscore)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CuisineSelector(): React.JSX.Element {
  const { selectedCuisines, addCuisine, removeCuisine } = useRecipeBuilder();

  const cuisineOptions = useMemo<string[]>(
    () => Array.from(new Set<string>([...getAllCuisineNames(), ...CUISINE_FALLBACK])),
    [],
  );
  const summaries = useMemo(() => summarizeSignatures(selectedCuisines), [selectedCuisines]);

  return (
    <ToggleChipGroup
      label="Regional & Cultural Cuisines"
      options={cuisineOptions}
      tone="purple"
      isSelected={(cuisine) => selectedCuisines.includes(cuisine)}
      onToggle={(cuisine) =>
        selectedCuisines.includes(cuisine) ? removeCuisine(cuisine) : addCuisine(cuisine)
      }
    >
      {summaries.length > 0 && (
        <div className="mb-3 space-y-2">
          {summaries.map((summary) => (
            <SignatureCard key={summary.cuisine} summary={summary} />
          ))}
        </div>
      )}
      <CustomEntryInput
        label="Custom cuisine tradition"
        placeholder="Add custom cuisine tradition..."
        tone="purple"
        existing={selectedCuisines}
        onAdd={addCuisine}
      />
    </ToggleChipGroup>
  );
}
