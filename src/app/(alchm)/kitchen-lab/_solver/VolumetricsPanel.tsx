"use client";

/**
 * Volumetrics — the gap between a measured cup and a computed density.
 *
 * Like the Boundaries tab, every figure is computed from the engine at render
 * time. The comparison table is built by running the real `volumeToMass`
 * against the real measured portions, so a row cannot drift from what the
 * converter would actually return.
 *
 * @file src/app/(alchm)/lab/_solver/VolumetricsPanel.tsx
 */
import { useMemo } from "react";
import { MEASURED_PORTIONS } from "@/data/cooking/measuredPortions";
import type { MassFractions } from "@/lib/cooking/choiOkos";
import { analysePacking, volumeToMass } from "@/lib/cooking/volumetrics";
import { MEASURED_INGREDIENT_COUNT, UNIT_CONVERSIONS, convertToGramsDetailed } from "@/utils/unitConversion";

/** What the old table assumed a cup weighed, for every ingredient alike. */
const WATER_ASSUMPTION_G = UNIT_CONVERSIONS.cup;

/**
 * `[MEASURED 2026-08-18]` Distinct ingredient names appearing with a volume unit
 * across the 1,078-recipe corpus, and the share of those mentions the measured
 * table now covers. Counted by script over
 * `backend/alchm_kitchen/data/json/recipes.json`; stated here because a coverage
 * figure that lived only in a commit message would stop being visible.
 */
const CORPUS_DISTINCT_NAMES = 1460;
const CORPUS_COVERAGE = 0.324;
/** Overstatement of total corpus mass under the water assumption. */
const CORPUS_OVERSTATEMENT = 0.116;

/** Ingredients whose disagreement with the water assumption makes the point. */
const HEADLINE_ROWS = ["All-Purpose Flour", "Cilantro", "Sugar", "Salt"];

const FLOUR: MassFractions = {
  water: 0.119, protein: 0.103, fat: 0.01, carbohydrate: 0.763, ash: 0.0047,
};
const OLIVE_OIL: MassFractions = { water: 0, protein: 0, fat: 1, carbohydrate: 0, ash: 0 };

export function VolumetricsPanel(): React.JSX.Element {
  const rows = useMemo(
    () =>
      HEADLINE_ROWS.flatMap((name) => {
        const m = volumeToMass(name, 1, "cup");
        return m ? [{ name, grams: m.grams, fdcId: m.fdcId, ratio: WATER_ASSUMPTION_G / m.grams }] : [];
      }),
    [],
  );

  const packing = useMemo(() => {
    const flourCup = volumeToMass("All-Purpose Flour", 1, "cup");
    const oilCup = volumeToMass("Olive Oil", 1, "cup");
    return {
      flour: flourCup ? analysePacking(FLOUR, flourCup.grams, "cup") : null,
      oil: oilCup ? analysePacking(OLIVE_OIL, oilCup.grams, "cup") : null,
    };
  }, []);

  const measuredChip = convertToGramsDetailed(1, "cup", "all-purpose flour");
  const approxChip = convertToGramsDetailed(1, "cup", "quinoa");

  return (
    <div className="ma-solver ma-boundaries">
      <section className="ma-rail" aria-label="measurement fidelity">
        <article className="ma-card">
          <h3>a cup is not a mass</h3>
          <p className="ma-note">
            Converting every volume unit at water density overstates the total mass of
            volume-measured ingredients across the 1,078-recipe corpus by{" "}
            <strong>{(CORPUS_OVERSTATEMENT * 100).toFixed(1)} %</strong>. It errs in both
            directions, which is why salt is on this list.
          </p>
          <div className="ma-scroll">
            <table className="ma-table">
              <thead>
                <tr><th>ingredient</th><th>g per USDA cup</th><th>assumed</th><th>ratio</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className={r.ratio < 1 ? "is-understated" : undefined}>
                    <td>{r.name}</td>
                    <td>{r.grams.toFixed(0)}</td>
                    <td className="ma-quiet">{WATER_ASSUMPTION_G}</td>
                    <td>
                      {r.ratio.toFixed(2)}×
                      <em>{r.ratio < 1 ? " understated" : " overstated"}</em>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ma-note">
            The USDA cup is 236.588 mL, not the 240 mL nutrition-label cup. Mixing the two is a
            1.4 % error sitting silently under everything else.
          </p>
        </article>

        <article className="ma-card">
          <h3>coverage</h3>
          <p className="ma-headline">
            {MEASURED_INGREDIENT_COUNT}
            <em>of {CORPUS_DISTINCT_NAMES.toLocaleString()} names</em>
          </p>
          <div className="ma-coverage-bar">
            <span className="is-measured" style={{ width: `${CORPUS_COVERAGE * 100}%` }} />
            <span className="is-approximated" />
          </div>
          <ul className="ma-legend">
            <li><i className="ma-legend__key ma-legend__key--measured" />measured — {(CORPUS_COVERAGE * 100).toFixed(1)} % of volume mentions</li>
            <li><i className="ma-legend__key ma-legend__key--approx" />water approximation, tagged as such</li>
          </ul>
          <p className="ma-note">
            The remainder is not silently wrong — it falls back to water density and says so on
            every value. Absence of a measurement must not look like a measurement.
          </p>
        </article>

        <article className="ma-card">
          <h3>basis, on every value</h3>
          <p className="ma-basis-chip is-measured">
            USDA measured · FDC #{measuredChip?.fdcId} · {measuredChip?.grams.toFixed(0)} g
          </p>
          <p className="ma-basis-chip is-approximated">
            water approximation · {approxChip?.grams.toFixed(0)} g
            <em>{approxChip?.approximationNote}</em>
          </p>
          <p className="ma-note">
            Two different kinds of thing, and they are meant to look it. The measured one is
            authoritative; the approximated one is visibly provisional.
          </p>
        </article>
      </section>

      <section className="ma-results" aria-label="packing">
        <article className="ma-card ma-card--wide">
          <h3>packing — how much of a cup is air</h3>
          {packing.flour ? (
            <>
              <p className="ma-headline">
                {(packing.flour.porosity * 100).toFixed(1)}
                <em>% air, in a cup of flour</em>
              </p>
              <div className="ma-coverage-bar">
                <span className="is-measured" style={{ width: `${(1 - packing.flour.porosity) * 100}%` }} />
                <span className="is-void" />
              </div>
              <dl className="ma-stats">
                <div><dt>true density</dt><dd>{packing.flour.trueDensityKgM3.toFixed(0)} kg·m⁻³</dd></div>
                <div><dt>bulk density</dt><dd>{packing.flour.bulkDensityKgM3.toFixed(0)} kg·m⁻³</dd></div>
                {packing.oil ? (
                  <div><dt>olive oil, for contrast</dt><dd>{(Math.abs(packing.oil.porosity) * 100).toFixed(1)} % void</dd></div>
                ) : null}
              </dl>
              <p className="ma-note">
                Choi–Okos gives the <strong>true</strong> density of the material; a measured cup
                gives the <strong>bulk</strong> density of the material plus the air between its
                grains. For a liquid the two coincide. For flour they do not, and that gap is
                exactly why composition alone cannot convert a cup of a powder.
              </p>
              <p className="ma-note">
                A negative porosity is <em>not</em> clamped anywhere in this layer. It cannot
                happen physically, so when it appears it means the measured portion and the
                composition describe different preparations — a signal worth keeping.
              </p>
            </>
          ) : (
            <p className="ma-refusal">No measured cup weight for flour, so packing cannot be computed.</p>
          )}
        </article>

        <article className="ma-card ma-card--wide">
          <h3>every measured portion</h3>
          <div className="ma-scroll ma-scroll--tall">
            <table className="ma-table">
              <thead>
                <tr><th>ingredient</th><th>cup</th><th>tbsp</th><th>tsp</th><th>FDC</th><th>measured as</th></tr>
              </thead>
              <tbody>
                {MEASURED_PORTIONS.map((p) => (
                  <tr key={p.ingredient}>
                    <td>{p.ingredient}</td>
                    <td>{p.gramsPer.cup?.toFixed(1) ?? <span className="ma-absent">—</span>}</td>
                    <td>{p.gramsPer.tbsp?.toFixed(2) ?? <span className="ma-absent">—</span>}</td>
                    <td>{p.gramsPer.tsp?.toFixed(2) ?? <span className="ma-absent">—</span>}</td>
                    <td className="ma-quiet">#{p.fdcId}</td>
                    <td className="ma-quiet">
                      {/* One qualifier per distinct preparation, not one per measure:
                          USDA repeats "crumbled" across a bay leaf's tbsp and tsp. */}
                      {[...new Set(Object.values(p.measuredAs ?? {}))].join(", ") || (
                        <span className="ma-absent">unqualified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ma-note">
            A dash is a measure USDA did not publish for that ingredient, not a zero. Black pepper
            has no unqualified cup weight at all — which is why the qualifier column exists, and why
            missing parsing once looked exactly like missing data.
          </p>
        </article>
      </section>
    </div>
  );
}
