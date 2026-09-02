"use client";

/**
 * Boundaries — the reference surface, for a reader checking the tool's homework.
 *
 * Every row is SAMPLED FROM THE ENGINE at render time rather than transcribed
 * into this file. That is not a convenience: a reference tab that carries its
 * own copy of the numbers is a second source of truth, and the whole point of
 * the tab is to show what the solver is actually running on.
 *
 * The closure percentages are computed live for the same reason. If someone
 * edits a stored property, this badge moves — a hardcoded "0.067 %" would keep
 * reassuring a reader about a table that had changed underneath it.
 *
 * @file src/app/(alchm)/lab/_solver/BoundariesPanel.tsx
 */
import { useMemo } from "react";
import {
  BOILING_SURFACE_CSF,
  airProperties,
  criticalHeatFluxWm2,
  nucleateBoilingFlux,
  saturatedWaterProperties,
  type BoilingSurface,
} from "@/lib/cooking/boundaryNetwork";

/**
 * The Prandtl column as PRINTED in Incropera, kept here and nowhere else.
 *
 * These are the only transcribed numbers in the file and they exist to be
 * disagreed with: the engine derives Pr from the four stored columns, and the
 * gap between derived and printed is the transcription check. Storing them in
 * the engine would make the check circular.
 */
const AIR_PRINTED_PR: Array<[number, number]> = [
  [250, 0.72], [300, 0.707], [350, 0.7], [400, 0.69], [450, 0.686], [500, 0.684],
  [550, 0.683], [600, 0.685], [650, 0.69], [700, 0.695], [750, 0.702], [800, 0.709],
];
const WATER_PRINTED_PR: Array<[number, number]> = [
  [280, 10.26], [290, 7.56], [300, 5.83], [310, 4.62], [320, 3.77], [330, 3.15],
  [340, 2.66], [350, 2.29], [360, 2.02], [370, 1.8], [373.15, 1.76],
];

interface Correlation {
  name: string;
  citation: string;
  envelope: string;
  accuracy: string;
}

/**
 * `[BASIS]` Every correlation the solver can reach, with the envelope and the
 * accuracy each publishes. McAdams appears TWICE because it is two branches
 * with different constants over different Rayleigh ranges — collapsing them
 * into one row, as a first design pass did, misstates both.
 */
const CORRELATIONS: Correlation[] = [
  {
    name: "Churchill & Chu — vertical plate",
    citation: "Int. J. Heat Mass Transfer 18(11), 1975",
    envelope: "all Ra, any Pr",
    accuracy: "±20–30 %",
  },
  {
    name: "Churchill & Chu — horizontal cylinder",
    citation: "Int. J. Heat Mass Transfer 18(11), 1975",
    envelope: "Ra ≤ 1e12",
    accuracy: "±20–30 %",
  },
  {
    name: "McAdams — plate facing up (laminar)",
    citation: "via Incropera §9.6.3",
    envelope: "1e4 ≤ Ra ≤ 1e7",
    accuracy: "±20–30 %",
  },
  {
    name: "McAdams — plate facing up (turbulent)",
    citation: "via Incropera §9.6.3",
    envelope: "1e7 ≤ Ra ≤ 1e11",
    accuracy: "±20–30 %",
  },
  {
    name: "McAdams — plate facing down",
    citation: "via Incropera §9.6.3",
    envelope: "1e5 ≤ Ra ≤ 1e10",
    accuracy: "±20–30 %",
  },
  {
    name: "Rohsenow — nucleate pool boiling",
    citation: "Trans. ASME 74, 1952",
    envelope: "0 < ΔTe, below the critical heat flux",
    accuracy: "surface-dependent; C_sf is cubed",
  },
  {
    name: "Zuber — critical heat flux",
    citation: "Zuber 1959, large-plate constant 0.149",
    envelope: "saturated pool boiling",
    accuracy: "1.25 vs ~1.1 MW·m⁻² for a finite heater",
  },
  {
    name: "Chilton–Colburn — evaporation analogy",
    citation: "h_m = h/(ρ·cp·Le^{2/3})",
    envelope: "dilute vapour, free water surface",
    accuracy: "an upper bound on evaporation",
  },
];

/** Excess temperatures the boiling chart plots, K. */
const EXCESS_SWEEP = [2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 22];

export function BoundariesPanel(): React.JSX.Element {
  const air = useMemo(
    () => AIR_PRINTED_PR.map(([k, printed]) => ({ k, printed, p: airProperties(k - 273.15) })),
    [],
  );
  const water = useMemo(
    () =>
      WATER_PRINTED_PR.map(([k, printed]) => ({
        k,
        printed,
        p: saturatedWaterProperties(k - 273.15),
      })),
    [],
  );
  const airWorst = Math.max(...air.map((r) => Math.abs(r.p.prandtl - r.printed) / r.printed));
  const waterWorst = Math.max(...water.map((r) => Math.abs(r.p.prandtl - r.printed) / r.printed));

  const boiling = useMemo(() => {
    const w = saturatedWaterProperties(100);
    const chf = criticalHeatFluxWm2(w);
    const series = (surface: BoilingSurface) =>
      EXCESS_SWEEP.flatMap((dt) => {
        try {
          return [{ dt, flux: nucleateBoilingFlux(w, dt, surface).fluxWm2 }];
        } catch {
          // Past burnout the correlation does not describe the branch, so the
          // series STOPS. It does not fade, dash, or continue — that cutoff is
          // the most interesting thing on the chart.
          return [];
        }
      });
    return {
      chf,
      etched: series("stainless-etched"),
      scored: series("stainless-scored"),
      ratio:
        (BOILING_SURFACE_CSF["stainless-polished"] / BOILING_SURFACE_CSF["stainless-scored"]) ** 3,
    };
  }, []);

  return (
    <div className="ma-solver ma-boundaries">
      <section className="ma-rail" aria-label="property tables">
        <PropertyTable
          title="Air at 1 atm"
          source="Incropera & DeWitt, Table A.4"
          worst={airWorst}
          rows={air.map((r) => ({
            k: r.k,
            printed: r.printed,
            stored: [r.p.rhoKgM3.toFixed(4), r.p.cpJkgK.toFixed(0), (r.p.muPaS * 1e7).toFixed(1), (r.p.kWmK * 1e3).toFixed(1)],
            derived: [(r.p.nuM2s * 1e6).toFixed(2), (r.p.alphaM2s * 1e6).toFixed(1), r.p.prandtl.toFixed(4)],
          }))}
          storedHeads={["ρ [kg·m⁻³]", "c_p [J·kg⁻¹·K⁻¹]", "μ ×10⁷ [Pa·s]", "k ×10³ [W·m⁻¹·K⁻¹]"]}
          derivedHeads={["ν ×10⁶", "α ×10⁶", "Pr"]}
        />

        <PropertyTable
          title="Saturated liquid water"
          source="Incropera & DeWitt, Table A.6 — density is 1/v_f"
          worst={waterWorst}
          rows={water.map((r) => ({
            k: r.k,
            printed: r.printed,
            stored: [r.p.rhoKgM3.toFixed(2), r.p.cpJkgK.toFixed(0), (r.p.muPaS * 1e6).toFixed(1), (r.p.kWmK * 1e3).toFixed(0)],
            derived: [(r.p.sigmaNm * 1e3).toFixed(1), (r.p.hfgJkg / 1e3).toFixed(0), r.p.prandtl.toFixed(4)],
          }))}
          storedHeads={["ρ [kg·m⁻³]", "c_p [J·kg⁻¹·K⁻¹]", "μ ×10⁶ [Pa·s]", "k ×10³ [W·m⁻¹·K⁻¹]"]}
          derivedHeads={["σ ×10³", "h_fg [kJ·kg⁻¹]", "Pr"]}
        />

        <article className="ma-card">
          <h3>what the closure caught</h3>
          <p className="ma-note">
            The 373.15 K viscosity was first transcribed as <code>279e-6</code>, which closes the
            Prandtl identity to <strong>1.7300</strong> against a printed 1.76 — a 1.7 % outlier
            where every other row sits under 0.4 %. The stored value is the independently known
            0.2818 mPa·s, which closes to{" "}
            <strong>{saturatedWaterProperties(100).prandtl.toFixed(4)}</strong> and puts the row
            back in family.
          </p>
          <p className="ma-note">
            Both tables refuse outside their tabulated span rather than extrapolating, so no row
            shown here is one the solver would decline to use.
          </p>
        </article>
      </section>

      <section className="ma-results" aria-label="correlations and boiling">
        <article className="ma-card ma-card--wide">
          <h3>correlation catalogue</h3>
          <div className="ma-scroll">
            <table className="ma-table">
              <thead>
                <tr><th>correlation</th><th>citation</th><th>validity envelope</th><th>accuracy</th></tr>
              </thead>
              <tbody>
                {CORRELATIONS.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td className="ma-quiet">{c.citation}</td>
                    <td className="ma-quiet">{c.envelope}</td>
                    <td>{c.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ma-note">
            Natural convection carries ±20–30 % of its own. Any downstream precision past two
            significant figures is illusory; what these are good at is comparison.
          </p>
        </article>

        <article className="ma-card ma-card--wide">
          <h3>boiling regime — where the tool refuses</h3>
          <BoilingChart {...boiling} />
          <p className="ma-note">
            Flux goes as the excess temperature <strong>cubed</strong>. Past the critical heat flux
            the vapour film goes continuous, the surface dries, and flux <em>falls</em> — a monotone
            cube there would be inventing energy, so both series simply stop.
          </p>
          <p className="ma-note">
            C_sf is cubed too, so a scored surface carries {boiling.ratio.toFixed(2)}× the flux of a
            mirror-polished one and reaches burnout at a lower excess temperature. Same dial, two
            regimes.
          </p>
        </article>
      </section>
    </div>
  );
}

function PropertyTable({
  title, source, worst, rows, storedHeads, derivedHeads,
}: {
  title: string; source: string; worst: number;
  rows: Array<{ k: number; printed: number; stored: string[]; derived: string[] }>;
  storedHeads: string[]; derivedHeads: string[];
}): React.JSX.Element {
  return (
    <article className="ma-card">
      <h3>{title}</h3>
      <p className="ma-basis">{source}</p>
      <div className="ma-scroll">
        <table className="ma-table">
          <thead>
            <tr>
              <th>T [K]</th>
              {storedHeads.map((h) => <th key={h}>{h}</th>)}
              {derivedHeads.map((h) => <th key={h} className="ma-derived-head">{h}</th>)}
              <th className="ma-derived-head">printed Pr</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k}>
                <td>{r.k}</td>
                {r.stored.map((v, i) => <td key={i}>{v}</td>)}
                {r.derived.map((v, i) => <td key={i} className="ma-derived-cell">{v}</td>)}
                <td className="ma-derived-cell">{r.printed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ma-closure">
        ν, α and Pr are <strong>derived</strong>, not stored — they are algebraically redundant, so
        reproducing the printed column is how a mistyped digit surfaces. Worst residual across every
        row: <strong>{(worst * 100).toFixed(3)} %</strong>.
      </p>
    </article>
  );
}

/**
 * Log–log boiling curve. Both series stop at the critical heat flux because the
 * engine refuses there; the SVG never draws past the last point it was given.
 */
function BoilingChart({
  chf, etched, scored,
}: {
  chf: number;
  etched: Array<{ dt: number; flux: number }>;
  scored: Array<{ dt: number; flux: number }>;
  ratio: number;
}): React.JSX.Element {
  const W = 520, H = 300, PAD_L = 56, PAD_B = 40, PAD_T = 12, PAD_R = 12;
  const xMin = Math.log10(2), xMax = Math.log10(25);
  const yMin = Math.log10(1e3), yMax = Math.log10(2e6);
  const px = (dt: number) => PAD_L + ((Math.log10(dt) - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R);
  const py = (f: number) => H - PAD_B - ((Math.log10(f) - yMin) / (yMax - yMin)) * (H - PAD_B - PAD_T);
  const path = (pts: Array<{ dt: number; flux: number }>) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.dt).toFixed(1)} ${py(p.flux).toFixed(1)}`).join(" ");

  return (
    <div className="ma-scroll">
      <svg viewBox={`0 0 ${W} ${H}`} className="ma-chart" role="img"
        aria-label="nucleate boiling flux against excess temperature, log axes, cut off at the critical heat flux">
        {[1e3, 1e4, 1e5, 1e6].map((g) => (
          <g key={g}>
            <line x1={PAD_L} x2={W - PAD_R} y1={py(g)} y2={py(g)} className="ma-chart__grid" />
            <text x={PAD_L - 6} y={py(g) + 3} className="ma-chart__tick" textAnchor="end">
              {g >= 1e6 ? "1 MW" : `${g / 1e3} kW`}
            </text>
          </g>
        ))}
        {[2, 5, 10, 20].map((t) => (
          <g key={t}>
            <line x1={px(t)} x2={px(t)} y1={PAD_T} y2={H - PAD_B} className="ma-chart__grid" />
            <text x={px(t)} y={H - PAD_B + 14} className="ma-chart__tick" textAnchor="middle">{t} K</text>
          </g>
        ))}
        {/* One CHF value, one line. A scored surface meets it at a lower ΔT — not
            at a different flux, which an earlier draft drew. */}
        <line x1={PAD_L} x2={W - PAD_R} y1={py(chf)} y2={py(chf)} className="ma-chart__chf" />
        <text x={W - PAD_R} y={py(chf) - 6} className="ma-chart__chf-label" textAnchor="end">
          critical heat flux {(chf / 1e6).toFixed(2)} MW·m⁻² — refused beyond
        </text>
        <path d={path(etched)} className="ma-chart__curve" />
        <path d={path(scored)} className="ma-chart__curve ma-chart__curve--scored" />
        {[etched, scored].map((s, i) => {
          const last = s.at(-1);
          return last ? (
            <circle key={i} cx={px(last.dt)} cy={py(last.flux)} r="3.5" className="ma-chart__stop" />
          ) : null;
        })}
        <text x={PAD_L + 8} y={PAD_T + 12} className="ma-chart__tick">q″ ∝ ΔTe³</text>
        <text x={(W + PAD_L) / 2} y={H - 4} className="ma-chart__axis" textAnchor="middle">excess temperature (log)</text>
      </svg>
      <ul className="ma-legend">
        <li><i className="ma-legend__key ma-legend__key--etched" />etched stainless</li>
        <li><i className="ma-legend__key ma-legend__key--scored" />scored stainless</li>
      </ul>
    </div>
  );
}
