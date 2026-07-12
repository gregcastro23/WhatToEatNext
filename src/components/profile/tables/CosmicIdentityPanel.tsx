"use client";

/**
 * CosmicIdentityPanel — §3.5 elemental balance bars. Reuses the same
 * derivation as the existing alchemicalConstitution profile block
 * (tasteGraph.elementalAffinities with an equal-split fallback) — no
 * re-derivation from raw chart data.
 */

import { ElementBars, GlassPanel, LabelXS, type Element } from "@/components/tables/ui";
import type { JSX } from "react";

export interface CosmicIdentityPanelProps {
  /** profile.tasteGraph?.elementalAffinities (0..1 per element). */
  elementalAffinities: Partial<Record<Element, number>> | null | undefined;
  dominantElement: string | null;
  className?: string;
}

const EQUAL_SPLIT: Record<Element, number> = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

export function CosmicIdentityPanel({
  elementalAffinities,
  dominantElement,
  className = "",
}: CosmicIdentityPanelProps): JSX.Element {
  const values = elementalAffinities && Object.keys(elementalAffinities).length > 0
    ? elementalAffinities
    : EQUAL_SPLIT;
  return (
    <GlassPanel className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <LabelXS as="h2" className="text-alchm-fg-dim">
          Cosmic Identity
        </LabelXS>
        {dominantElement && (
          <LabelXS className="text-alchm-copper-bright">{dominantElement} dominant</LabelXS>
        )}
      </div>
      <ElementBars values={values} />
    </GlassPanel>
  );
}

export default CosmicIdentityPanel;
