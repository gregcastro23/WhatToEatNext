/**
 * Wire parsers for the keyed groups of quantities inside one period: ESMS (4
 * keys), thermodynamic (6), elemental (4) and the per-planet rows.
 *
 * Producer: `getStatisticsForPeriod` (`src/utils/alchemicalSampleLookup.ts:272-373`)
 * writes every key of `esms`, `thermo` and `elemental` (`:295-318`) and one
 * `{ esms, elements }` row per planet found in the samples (`detectPlanets`,
 * `:259-266`, capped at 12; the real file has 10, Sun to Pluto, never Ascendant).
 *
 * Key sets: every record literal below is checked by the compiler against the
 * `PeriodStatistics` type, so a key added to or removed from a group on the
 * server fails `tsc` here; there is no local key list to drift. A group is all
 * or nothing. A malformed planet row is dropped, and if rows arrived and none
 * parsed, `perPlanet` is rejected as a whole (the caller then drops the period).
 *
 * Client safe: the server module is reached by `import type` only.
 */

import { isJsonRecord } from "@/lib/api/json";
import type { PeriodStatistics } from "@/utils/alchemicalSampleLookup";
import { parseQuantityContext } from "./quantityContextParser";

type EsmsGroup = PeriodStatistics["esms"];
type ThermoGroup = PeriodStatistics["thermo"];
type ElementGroup = PeriodStatistics["elemental"];
type PlanetRow = PeriodStatistics["perPlanet"][string];

export function parseEsmsGroup(value: unknown): EsmsGroup | null {
  if (!isJsonRecord(value)) return null;
  const spirit = parseQuantityContext(value.Spirit);
  const essence = parseQuantityContext(value.Essence);
  const matter = parseQuantityContext(value.Matter);
  const substance = parseQuantityContext(value.Substance);
  if (spirit === null || essence === null || matter === null || substance === null) {
    return null;
  }
  return { Spirit: spirit, Essence: essence, Matter: matter, Substance: substance };
}

export function parseElementGroup(value: unknown): ElementGroup | null {
  if (!isJsonRecord(value)) return null;
  const fire = parseQuantityContext(value.Fire);
  const water = parseQuantityContext(value.Water);
  const earth = parseQuantityContext(value.Earth);
  const air = parseQuantityContext(value.Air);
  if (fire === null || water === null || earth === null || air === null) return null;
  return { Fire: fire, Water: water, Earth: earth, Air: air };
}

export function parseThermoGroup(value: unknown): ThermoGroup | null {
  if (!isJsonRecord(value)) return null;
  const heat = parseQuantityContext(value.heat);
  const entropy = parseQuantityContext(value.entropy);
  const reactivity = parseQuantityContext(value.reactivity);
  const gregsEnergy = parseQuantityContext(value.gregsEnergy);
  const kalchm = parseQuantityContext(value.kalchm);
  const monica = parseQuantityContext(value.monica);
  if (
    heat === null ||
    entropy === null ||
    reactivity === null ||
    gregsEnergy === null ||
    kalchm === null ||
    monica === null
  ) {
    return null;
  }
  return {
    heat,
    entropy,
    reactivity,
    gregsEnergy,
    kalchm,
    monica,
  };
}

function parsePlanetRow(value: unknown): PlanetRow | null {
  if (!isJsonRecord(value)) return null;
  const esms = parseEsmsGroup(value.esms);
  const elements = parseElementGroup(value.elements);
  return esms === null || elements === null ? null : { esms, elements };
}

/** The planet rows that parse, or null when rows arrived and none did. `{}` is valid. */
export function parsePerPlanet(
  value: unknown,
  onDropped?: (dropped: number) => void,
): PeriodStatistics["perPlanet"] | null {
  if (!isJsonRecord(value)) return null;
  const rows: Array<[string, PlanetRow]> = [];
  let dropped = 0;
  for (const [planet, row] of Object.entries(value)) {
    const parsed = parsePlanetRow(row);
    if (parsed !== null) rows.push([planet, parsed]);
    else dropped++;
  }
  if (rows.length === 0 && Object.keys(value).length > 0) return null;
  if (dropped > 0) onDropped?.(dropped);
  // fromEntries defines own properties, so a "__proto__" key stays data.
  return Object.fromEntries(rows);
}
