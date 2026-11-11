/**
 * Food-chemistry regimes by temperature, each with the source it rests on.
 *
 * These are ONSETS with sourced ends where a source gives one — not a
 * partition of the temperature axis. Every source consulted (2026-11-11)
 * describes a time–temperature process that overlaps its neighbours:
 * collagen turns to gelatin while sarcoplasmic proteins are still
 * aggregating, Maillard browning keeps running as sucrose begins to
 * decompose. Forcing them into non-overlapping bands (25–65, 65–95, 130–175,
 * >175 °C, as first proposed) contradicted all four sources it was checked
 * against, so the bands were dropped rather than relabelled.
 *
 * Deliberately absent, because no fetched source supported them: an onset
 * for charring/pyrolysis, plant-enzyme blanching temperatures, and
 * glucose/fructose caramelisation points (the secondary sources disagree).
 * A temperature with no active regime renders as "no cited regime", not as
 * an invented one. The fermentation regime first proposed (15.6–60 °C) joined
 * a sauerkraut lower bound to a yeast-kill upper bound; it is two regimes now,
 * each with its own source.
 *
 * Boiling is not here: it is a phase boundary that moves with pressure, so it
 * comes from IF97 (`thermoVessel.ts`), not from a fixed temperature.
 *
 * @file src/lib/cooking/cookingRegimes.ts
 */

export interface RegimeSource {
  /** The work, e.g. "Tornberg 2005". */
  work: string;
  /** Where in it, and what it states. */
  locator: string;
  url: string;
}

export type RegimeMoisture = "wet" | "dry" | "any";

/** °F → °C, for sources that state Fahrenheit: the value round-trips from what they print. */
function fahrenheitToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export interface CookingRegime {
  id: string;
  label: string;
  /** Sourced onset, °C. */
  onsetC: number;
  /** Sourced end, °C, or null where no source ends it. */
  endC: number | null;
  /**
   * Which surface the source supports the regime on:
   * - `wet`: needs liquid water (hydrolysis, a fermenting brine) — not offered
   *   once the surface has dried;
   * - `dry`: the source ties it to low moisture (Maillard at 120 °C, per EFSA)
   *   or measured it dry — not offered while free water remains;
   * - `any`: the source does not condition it on moisture.
   */
  moisture: RegimeMoisture;
  sources: readonly RegimeSource[];
  /** Caveats a reader needs, in one or two sentences. */
  note: string;
}

export const COOKING_REGIMES: readonly CookingRegime[] = [
  {
    id: "lactic-fermentation",
    label: "Lactic fermentation (sauerkraut)",
    onsetC: fahrenheitToC(60),
    endC: fahrenheitToC(75),
    moisture: "wet",
    sources: [
      { work: "Clemson HGIC", locator: "Making Sauerkraut — ferment at 60–70 °F; below 60 °F it may not ferment, above 75 °F it may soften", url: "https://hgic.clemson.edu/making-sauerkraut/" },
    ],
    note: "75 °F is a quality limit (soft kraut), not a kill temperature; no source consulted gives a lactic-culture death point.",
  },
  {
    id: "yeast-death",
    label: "Yeast dies",
    onsetC: 55.5,
    endC: 60,
    moisture: "any",
    sources: [
      { work: "Pyler 1988, via BAKERpedia", locator: "Yeast kill — starts to die at 55.5 °C, absolute kill at 60 °C", url: "https://bakerpedia.com/processes/yeast-kill/" },
    ],
    note: "Measured for baker's yeast in baking. Heat-tolerant plant enzymes survive past 60 °C; their inactivation is time-dependent and not modelled here.",
  },
  {
    id: "protein-coagulation",
    label: "Muscle-protein coagulation",
    onsetC: 40,
    endC: 90,
    moisture: "any",
    sources: [
      { work: "Tornberg 2005", locator: "Meat Science 70(3):493–508 — sarcoplasmic proteins aggregate 40–60 °C; some coagulate up to 90 °C", url: "https://www.lunduniversity.lu.se/lup/publication/88d9a255-499a-4f43-9c40-e452b670f927" },
    ],
    note: "The 90 °C end comes from the same abstract. Myofibrillar unfolding begins lower, at 30–32 °C in solution.",
  },
  {
    id: "collagen-gelatin",
    label: "Collagen → gelatin",
    onsetC: 50,
    endC: null,
    moisture: "wet",
    sources: [
      { work: "Baldwin", locator: "A Practical Guide to Sous Vide Cooking — collagen dissolves into gelatin above 50–55 °C", url: "https://douglasbaldwin.com/sous-vide.html" },
      { work: "Tornberg 2005", locator: "Meat Science 70(3):493–508 — collagen denaturation at 53–63 °C", url: "https://www.lunduniversity.lu.se/lup/publication/88d9a255-499a-4f43-9c40-e452b670f927" },
    ],
    note: "No source ends it below boiling: hydrolysis continues through the simmer and runs hotter under pressure. It is hydrolysis, so it needs water.",
  },
  {
    id: "maillard",
    label: "Maillard browning at culinary rate",
    onsetC: 120,
    endC: null,
    moisture: "dry",
    sources: [
      { work: "EFSA", locator: "Acrylamide topic — forms at +120 °C and low moisture", url: "https://www.efsa.europa.eu/en/topics/topic/acrylamide" },
      { work: "El Hosry et al. 2025", locator: "Foods 14(11):1881 — maximum rate at 120 °C in a glucose–glycine model", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12154226/" },
    ],
    note: "A rate threshold, not a switch: the same review records Maillard chemistry far below 120 °C, just slowly. EFSA ties 120 °C to low moisture, so it is shown for a dried surface only.",
  },
  {
    id: "pyrazine",
    label: "Pyrazine-rich Maillard",
    onsetC: 140,
    endC: null,
    moisture: "dry",
    sources: [
      { work: "El Hosry et al. 2025", locator: "Foods 14(11):1881 — high pyrazine and thiazole yields above 140 °C", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12154226/" },
    ],
    note: "Measured in an asparagine–glucose model system; roast-aroma compounds dominate from here. Shown for a dried surface, as Maillard is.",
  },
  {
    id: "sucrose-caramelisation",
    label: "Sucrose caramelisation",
    onsetC: 442 - 273.15,
    endC: null,
    moisture: "dry",
    sources: [
      { work: "Magon et al. 2014", locator: "Thermochim. Acta 589:183–196 — apparent melting with decomposition, 442–465 K", url: "https://trc.nist.gov/ThermoML/10.1016/j.tca.2014.05.029.html" },
    ],
    note: "442 K = 168.85 °C, the low end of the range measured on crystalline sucrose (so: dry). Other sugars caramelise lower; their published points disagree, so they are not shown.",
  },
];

/** The surface a regime is read for: one still holding free water, or one that has dried. */
export type SurfaceState = "wet" | "dry";

/**
 * Regimes active at a temperature on a given surface: onset ≤ T, (no end, or
 * T ≤ end), and a moisture condition the surface satisfies. With no surface
 * given, moisture is not filtered.
 */
export function regimesAt(celsius: number, surface?: SurfaceState): CookingRegime[] {
  return COOKING_REGIMES.filter(
    (r) =>
      celsius >= r.onsetC &&
      (r.endC === null || celsius <= r.endC) &&
      (surface === undefined || r.moisture === "any" || r.moisture === surface),
  );
}
