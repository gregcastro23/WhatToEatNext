/**
 * MolecularGrid — the MOLECULAR_INTERACTION bento block for a method
 * profile page. Pure presentational server component; renders the curated
 * interaction entries (prose, formulas, tags, telemetry footers) plus the
 * optional verified-outcome checklist.
 */
import { CheckCircle2, Thermometer } from "lucide-react";
import { MaChip } from "@/components/cooking-methods/primitives";
import type { MolecularInteractionEntry } from "@/types/cookingMethod";

export default function MolecularGrid({
  interactions,
  checklist,
}: {
  interactions: MolecularInteractionEntry[];
  checklist?: string[];
}) {
  if (interactions.length === 0 && (!checklist || checklist.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-8">
      {interactions.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {interactions.map((entry, index) => (
            <div
              key={entry.title}
              className={`space-y-3 border-l-2 pl-4 ${
                index % 2 === 0
                  ? "border-[var(--ma-accent)]"
                  : "border-ma-line"
              }`}
            >
              <h3 className="font-grimoire text-lg text-[var(--ma-accent-soft)]">
                {entry.title}
              </h3>
              <p className="font-mono text-sm leading-relaxed text-ma-fg-dim">
                {entry.prose}
              </p>
              {entry.formula ? (
                <code className="ma-data block text-sm tracking-widest text-ma-emerald-soft">
                  {entry.formula}
                </code>
              ) : null}
              {entry.tags && entry.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <MaChip key={tag} tone="outline">
                      {tag}
                    </MaChip>
                  ))}
                </div>
              ) : null}
              {entry.temperatureRange ? (
                <MaChip tone="outline">
                  <Thermometer className="h-3 w-3" aria-hidden />
                  {entry.temperatureRange}
                </MaChip>
              ) : null}
              {entry.dataPoint ? (
                <div className="flex items-baseline gap-3 border-t border-ma-line/30 pt-3">
                  <span className="ma-label text-ma-outline">
                    {entry.dataPoint.label}
                  </span>
                  <span className="ma-data text-sm text-[var(--ma-accent-soft)]">
                    {entry.dataPoint.value}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {checklist && checklist.length > 0 ? (
        <div className="ma-rule border-b-0 border-t pt-5">
          <span className="ma-label mb-4 block text-ma-outline">
            VERIFIED_OUTCOMES
          </span>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {checklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 font-mono text-sm text-ma-fg-dim"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ma-accent)]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
