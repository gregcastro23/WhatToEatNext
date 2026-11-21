"use client";

import { useState, type JSX } from "react";
import { BUTCHER_CUTS, SPECIES_LIST, getFdcRecordForCut, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { FAT_CLASS_COLOR } from "@/lib/butcher/science/fatClass";
import type { AnatomicalCut, FdcMatch, SpeciesId } from "@/lib/butcher/types";

/**
 * Every cut's USDA basis in one filterable table (species × EXACT / PROXY),
 * folded away by default so the active cut's citation stays the focus.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ProvenanceIndex.tsx
 */

type SpeciesFilter = SpeciesId | "all";
type MatchFilter = FdcMatch | "all";

const MATCH_FILTERS: ReadonlyArray<{ readonly id: MatchFilter; readonly label: string }> = [
  { id: "all", label: "All" },
  { id: "EXACT", label: "Exact" },
  { id: "PROXY", label: "Proxy" },
];

export function countByMatch(match: FdcMatch): number {
  return BUTCHER_CUTS.filter((c) => getFdcRecordForCut(c)?.match === match).length;
}

function IndexFilters({
  species,
  match,
  onSpecies,
  onMatch,
}: {
  readonly species: SpeciesFilter;
  readonly match: MatchFilter;
  readonly onSpecies: (s: SpeciesFilter) => void;
  readonly onMatch: (m: MatchFilter) => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="bt-seg" role="group" aria-label="Filter index by species">
        <button type="button" className="bt-btn" aria-pressed={species === "all"} onClick={() => onSpecies("all")}>All species</button>
        {SPECIES_LIST.map((sp) => (
          <button key={sp.id} type="button" className="bt-btn" aria-pressed={species === sp.id} onClick={() => onSpecies(sp.id)}>{sp.name}</button>
        ))}
      </div>
      <div className="bt-seg" role="group" aria-label="Filter index by USDA match">
        {MATCH_FILTERS.map((m) => (
          <button key={m.id} type="button" className="bt-btn" aria-pressed={match === m.id} onClick={() => onMatch(m.id)}>{m.label}</button>
        ))}
      </div>
    </div>
  );
}

function IndexRow({ cut, active }: { readonly cut: AnatomicalCut; readonly active: boolean }): JSX.Element | null {
  const fdc = getFdcRecordForCut(cut);
  if (!fdc) return null;
  return (
    <tr aria-current={active ? "true" : undefined} className={active ? "bt-index__active" : undefined}>
      <th scope="row" className="font-normal">{cut.name}</th>
      <td className="text-white/60">{getSpeciesSpec(cut.speciesId).name}</td>
      <td>
        <span className="bt-prov__badge is-static" data-match={fdc.match} title={fdc.matchNote ?? fdc.description}>
          <span className="bt-prov__dot" aria-hidden="true" />
          {fdc.match === "PROXY" ? "Proxy" : "Exact"}
        </span>
      </td>
      <td className="bt-num">
        <a className="underline" href={`https://fdc.nal.usda.gov/food-details/${fdc.fdcId}/nutrients`} target="_blank" rel="noreferrer">{fdc.fdcId}</a>
      </td>
      <td className="bt-num">
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: FAT_CLASS_COLOR[cut.fatClass] }} aria-hidden="true" />
        {cut.proximate.fatG.toFixed(1)}
      </td>
      <td className="bt-num">{cut.proximate.collagenG.toFixed(2)}</td>
    </tr>
  );
}

export function ProvenanceIndex({ activeCutId }: { readonly activeCutId: string }): JSX.Element {
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [match, setMatch] = useState<MatchFilter>("all");
  const rows = BUTCHER_CUTS.filter(
    (c) => (species === "all" || c.speciesId === species) && (match === "all" || getFdcRecordForCut(c)?.match === match),
  );
  return (
    <details className="bt-card bt-index">
      <summary>
        <span className="text-base text-white">USDA basis for every cut</span>
        <span className="bt-num ml-2 text-xs text-white/55">{countByMatch("EXACT")} exact · {countByMatch("PROXY")} proxy</span>
      </summary>
      <div className="mt-3 space-y-3">
        <IndexFilters species={species} match={match} onSpecies={setSpecies} onMatch={setMatch} />
        <div className="overflow-x-auto">
          <table className="bt-table min-w-[560px]" aria-label="USDA basis for every cut">
            <thead>
              <tr><th scope="col">Cut</th><th scope="col">Species</th><th scope="col">Basis</th><th scope="col">FDC</th><th scope="col">Fat g</th><th scope="col">Collagen g</th></tr>
            </thead>
            <tbody>
              {rows.map((c) => <IndexRow key={c.id} cut={c} active={c.id === activeCutId} />)}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-white/45">{rows.length} of {BUTCHER_CUTS.length} cuts shown · g per 100 g raw · hover a badge for the proxy reason.</p>
      </div>
    </details>
  );
}
