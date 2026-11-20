"use client";

import { SAUCE_CITATION_LIST } from "@/lib/sauces/physics/citations";
import type { JSX } from "react";

export function SauceSourcesPanel(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="sl-card space-y-2">
        <h3 className="text-base">Literature Citations & Epistemic Boundaries</h3>
        <p className="text-sm text-white/65 leading-relaxed">
          Every SI-unit number in Emulsion & Body and Reduction & Pan traces to one of the correlations below.
          Alchm Pairing Studio and Phylogeny Forest run under their own declared model banner and do not claim
          physical instrument equivalence.
        </p>
      </div>

      <div className="sl-card space-y-3">
        {SAUCE_CITATION_LIST.map(({ id, citation }) => (
          <div key={id} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-white">{citation.short}</span>
              <span className="sl-chip text-white/70">{citation.confidence}</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{citation.full}</p>
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-emerald-300 underline hover:text-emerald-200"
              >
                {citation.url}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
