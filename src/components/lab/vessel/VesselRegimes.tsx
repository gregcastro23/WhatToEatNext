import type { CookingRegime } from "@/lib/cooking/cookingRegimes";
import { CitationChip } from "../CitationChip";
import type { JSX } from "react";

/**
 * The cited food-chemistry regimes for one surface temperature.
 *
 * A temperature with no active regime says so in words. Nothing is filled in
 * for charring: no fetched source gave it an onset (cookingRegimes.ts).
 *
 * @file src/components/lab/vessel/VesselRegimes.tsx
 */

function span(regime: CookingRegime): string {
  const onset = regime.onsetC.toFixed(regime.onsetC % 1 === 0 ? 0 : 1);
  return regime.endC === null ? `from ${onset} °C` : `${onset}–${regime.endC} °C`;
}

function RegimeRow({ regime }: { regime: CookingRegime }): JSX.Element {
  return (
    <li className="rounded border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-white/85">{regime.label}</span>
        <span className="font-mono text-[11px] text-white/45">{span(regime)}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-white/45">{regime.note}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {regime.sources.map((s) => (
          <a key={s.url + s.work} href={s.url} target="_blank" rel="noopener noreferrer">
            <CitationChip work={s.work} locator={s.locator} />
          </a>
        ))}
      </div>
    </li>
  );
}

export function VesselRegimes({
  title,
  temperatureC,
  regimes,
}: {
  title: string;
  temperatureC: number;
  regimes: readonly CookingRegime[];
}): JSX.Element {
  return (
    <section aria-label={title}>
      <h3 className="mb-2 text-[11px] uppercase tracking-wider text-white/45">
        {title} · <span className="font-mono normal-case">{temperatureC.toFixed(2)} °C</span>
      </h3>
      {regimes.length > 0 ? (
        <ul className="space-y-2">
          {regimes.map((r) => (
            <RegimeRow key={r.id} regime={r} />
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/40">
          No cited regime starts at this temperature.
        </p>
      )}
    </section>
  );
}
