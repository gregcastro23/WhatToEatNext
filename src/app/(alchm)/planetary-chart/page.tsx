/**
 * Planetary Chart — the planetary ecosystem surface.
 *
 * Public (no premium gate): the current sky is the same for everyone. The
 * server computes positions (arc-minute precise, with daily motions), the
 * per-planet alchemical decomposition, and a free-body diagram for each of
 * the ten planets once per request; the interactive wheel below keeps its
 * client-side exploratory tooling (date/location controls).
 */

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import {
  buildFreeBodyDiagrams,
  TEN_PLANETS,
  type FBDPositionInput,
  type PlanetFBD,
} from "@/calculations/planetaryFBD";
import PlanetFBDCard from "@/components/ui/alchm/PlanetFBDCard";
import { planetColor, planetGlyph } from "@/components/ui/alchm/planetColors";
import {
  alchemizeDetailed,
  type PlanetaryPosition,
} from "@/services/RealAlchemizeService";
import { getZodiacGlyph } from "@/utils/chartRendering";
import { calculatePlanetaryPositionsWithMeta } from "@/utils/serverPlanetaryCalculations";
import PlanetaryChartClient from "./PlanetaryChartClient";

/**
 * Every aspecting pair appears on both planets' cards (each side's vector
 * carries identical type/orb/strength/kinematics — only `otherPlanet` and
 * the ESMS-delta sign convention differ). Dedupe to one row per pair for
 * a ledger, keyed off the sorted planet pair + aspect type, ranked by
 * strength.
 */
function buildAspectLedger(fbds: PlanetFBD[]) {
  const seen = new Set<string>();
  const rows: Array<{
    planet1: string;
    planet2: string;
    glyph: string;
    type: string;
    orb: number;
    strength: number;
    polarity: "harmonious" | "challenging" | "neutral";
    kinematics: { state: "applying" | "separating" | "stationary"; daysToExact: number } | null;
  }> = [];
  for (const card of fbds) {
    for (const vector of card.vectors) {
      if (vector.kind !== "aspect" || !vector.aspect) continue;
      const other = vector.aspect.otherPlanet;
      const key = [card.planet, other].sort().join("|") + "|" + vector.aspect.type;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        planet1: card.planet,
        planet2: other,
        glyph: vector.label.split(" ")[0] ?? "",
        type: vector.aspect.type,
        orb: vector.aspect.orb,
        strength: vector.aspect.strength,
        polarity: vector.polarity,
        kinematics: vector.aspect.kinematics,
      });
    }
  }
  return rows.sort((a, b) => b.strength - a.strength);
}

// The (alchm) route group forces dynamic rendering for every route it wraps
// (see layout.tsx — most siblings depend on per-request providers), so a
// page-level `revalidate` here would be silently overridden and do nothing.
// computeEcosystem() itself is cached instead, via unstable_cache below.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planetary Ecosystem — Free-Body Diagrams of the Current Sky",
  description:
    "Every force acting on every planet right now — aspects, elemental pulls, dignities, and momentum — drawn as physics-style free-body diagrams at arc-minute precision.",
};

async function computeEcosystemUncached() {
  const now = new Date();
  const { positions, degraded } = await calculatePlanetaryPositionsWithMeta(now);

  const alchemizeInput: Record<string, PlanetaryPosition> = {};
  const fbdPositions: Record<string, FBDPositionInput> = {};
  for (const [name, pos] of Object.entries(positions)) {
    // The Ascendant depends entirely on the observer's latitude/longitude and
    // advances ~1° every 4 minutes. This page is location-less and public —
    // "the sky is the same for everyone" is only true of the planets — so a
    // backend default-location Ascendant must not become force vectors here.
    // The ESMS engine still injects its own sign-only grounding vessel, which
    // contributes no aspects.
    if (name === "Ascendant") continue;
    alchemizeInput[name] = {
      sign: pos.sign,
      degree: pos.degree,
      minute: pos.minute,
      isRetrograde: pos.isRetrograde,
      exactLongitude: pos.exactLongitude,
    };
    fbdPositions[name] = {
      sign: pos.sign,
      degree: pos.degree,
      minute: pos.minute,
      exactLongitude: pos.exactLongitude,
      isRetrograde: pos.isRetrograde,
      longitudeSpeed: pos.longitudeSpeed,
    };
  }

  const detailed = alchemizeDetailed(alchemizeInput, null, now, {
    incomingDegraded: degraded,
  });
  const { cards: fbds, totals } = buildFreeBodyDiagrams({
    positions: fbdPositions,
    diurnal: detailed.metadata.isDiurnal,
  });

  const positionRows = TEN_PLANETS.filter((planet) => positions[planet] !== undefined).map(
    (planet) => {
      const pos = positions[planet];
      return {
        planet,
        sign: pos.sign,
        degree: pos.degree,
        minute: pos.minute,
        isRetrograde: pos.isRetrograde ?? false,
        arcminPerDay: pos.longitudeSpeed != null ? pos.longitudeSpeed * 60 : null,
      };
    },
  );

  return {
    fbds,
    totals,
    thermo: detailed.thermodynamicProperties,
    kalchm: detailed.kalchm,
    monica: detailed.monica,
    isDiurnal: detailed.metadata.isDiurnal,
    degradedReasons: detailed.degraded?.reasons ?? null,
    timestamp: now.toISOString(),
    positionRows,
    aspectLedger: buildAspectLedger(fbds),
  };
}

// The route itself stays force-dynamic (see above), but the expensive part —
// two upstream HTTP round-trips plus a full alchemizeDetailed + FBD build —
// is cached across requests via Next's Data Cache. `timestamp` is captured
// inside the cached function, so it reflects when the sky was last actually
// computed, never the time of the request that happened to hit the cache.
const computeEcosystem = unstable_cache(
  computeEcosystemUncached,
  ["planetary-chart-ecosystem"],
  { revalidate: 60 },
);

const fmtStat = (value: number) =>
  Math.abs(value) >= 1000 || (Math.abs(value) < 0.001 && value !== 0)
    ? value.toExponential(2)
    : Number(value.toPrecision(3)).toString();

export default async function PlanetaryChartPage() {
  const sky = await computeEcosystem();

  const u = sky.totals.unattributed;
  const unattributedTotal = u.Spirit + u.Essence + u.Matter + u.Substance;

  const stats: Array<[string, number]> = [
    ["HEAT", sky.thermo.heat],
    ["ENTROPY", sky.thermo.entropy],
    ["REACTIVITY", sky.thermo.reactivity],
    ["GREGS ENERGY", sky.thermo.gregsEnergy],
    ["KALCHM", sky.kalchm],
    ["MONICA", sky.monica],
  ];

  return (
    <div
      className="alchm-root min-h-screen py-8 px-4"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1
            className="t-display"
            style={{ fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1.1 }}
          >
            Planetary Ecosystem
          </h1>
          <p style={{ color: "var(--fg-dim)", maxWidth: 640, margin: "0 auto" }}>
            Every force acting on every planet, drawn as a free-body diagram at
            the exact arc minute it occupies — aspects arriving and departing,
            elemental pulls, dignities, and momentum.
          </p>
          <p className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>
            COMPUTED {new Date(sky.timestamp).toUTCString().toUpperCase()} ·{" "}
            {sky.isDiurnal ? "DIURNAL SECT" : "NOCTURNAL SECT"}
            {sky.degradedReasons && (
              <span style={{ color: "var(--accent-2)" }}>
                {" "}· DEGRADED: {sky.degradedReasons.join(", ").toUpperCase()}
              </span>
            )}
          </p>
        </header>

        {/* Sky telemetry strip */}
        <section
          aria-label="Sky thermodynamics"
          className="grid grid-cols-3 md:grid-cols-6 gap-2"
        >
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="alchm-panel"
              style={{ padding: "10px 12px", textAlign: "center" }}
            >
              <div className="t-tag">{label}</div>
              <div
                className="t-num t-mono"
                style={{ fontSize: 15, color: "var(--fg)", marginTop: 4 }}
              >
                {fmtStat(value)}
              </div>
            </div>
          ))}
        </section>

        {/* Positions & aspect ledger */}
        <section
          aria-label="Sky positions and aspect ledger"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <details open className="alchm-panel" style={{ overflow: "hidden" }}>
            <summary className="t-tag" style={{ padding: "12px 14px", cursor: "pointer" }}>
              POSITIONS
            </summary>
            <div style={{ padding: "0 14px 14px", overflowX: "auto" }}>
              <table className="t-mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--fg-mute)" }}>
                    <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 400 }}>PLANET</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 400 }}>SIGN</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 400 }}>DEG°MIN′</th>
                    <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 400 }}>SPEED ′/D</th>
                  </tr>
                </thead>
                <tbody>
                  {sky.positionRows.map((row) => (
                    <tr key={row.planet} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "5px 6px", color: planetColor(row.planet) }}>
                        {planetGlyph(row.planet)} {row.planet}
                      </td>
                      <td style={{ padding: "5px 6px", color: "var(--fg-dim)" }}>
                        {getZodiacGlyph(row.sign)} {row.sign.toUpperCase().slice(0, 3)}
                      </td>
                      <td style={{ padding: "5px 6px", color: "var(--fg-dim)" }}>
                        {row.degree}°{String(row.minute).padStart(2, "0")}′
                      </td>
                      <td
                        style={{
                          padding: "5px 6px",
                          textAlign: "right",
                          color: row.isRetrograde ? "var(--accent-2)" : "var(--fg-dim)",
                        }}
                      >
                        {row.arcminPerDay == null ? "—" : row.arcminPerDay.toFixed(1)}
                        {row.isRetrograde ? " ℞" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <details open className="alchm-panel" style={{ overflow: "hidden" }}>
            <summary className="t-tag" style={{ padding: "12px 14px", cursor: "pointer" }}>
              ASPECT LEDGER · {sky.aspectLedger.length}
            </summary>
            <div style={{ padding: "0 14px 14px", overflowX: "auto" }}>
              <table className="t-mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--fg-mute)" }}>
                    <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 400 }}>PAIR</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 400 }}>TYPE</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 400 }}>ORB</th>
                    <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 400 }}>VERDICT</th>
                  </tr>
                </thead>
                <tbody>
                  {sky.aspectLedger.map((row) => {
                    const orbDeg = Math.floor(row.orb);
                    const orbMin = Math.round((row.orb - orbDeg) * 60);
                    const polarityColor =
                      row.polarity === "harmonious"
                        ? "#4ecdc4"
                        : row.polarity === "challenging"
                          ? "#ef6a5a"
                          : "var(--fg-mute)";
                    const verdict = !row.kinematics
                      ? "—"
                      : row.kinematics.state === "stationary"
                        ? "STATIONARY"
                        : `${row.kinematics.state === "applying" ? "APPLYING" : "SEPARATING"} ${row.kinematics.daysToExact.toFixed(1)}D`;
                    return (
                      <tr
                        key={`${row.planet1}-${row.planet2}-${row.type}`}
                        style={{ borderBottom: "1px solid var(--line)" }}
                      >
                        <td style={{ padding: "5px 6px", color: "var(--fg-dim)" }}>
                          {row.planet1.slice(0, 3)}{" "}
                          <span style={{ color: polarityColor }}>{row.glyph}</span>{" "}
                          {row.planet2.slice(0, 3)}
                        </td>
                        <td style={{ padding: "5px 6px", color: polarityColor }}>
                          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                        </td>
                        <td style={{ padding: "5px 6px", color: "var(--fg-dim)" }}>
                          {orbDeg}°{String(orbMin).padStart(2, "0")}′
                        </td>
                        <td
                          style={{
                            padding: "5px 6px",
                            textAlign: "right",
                            color: "var(--fg-mute)",
                            fontSize: 9.5,
                          }}
                        >
                          {verdict}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        {/* How to read */}
        <section className="alchm-panel" style={{ padding: 16 }}>
          <div className="t-tag" style={{ marginBottom: 8 }}>
            HOW TO READ A FREE-BODY DIAGRAM
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1"
            style={{ color: "var(--fg-dim)", fontSize: 12.5, lineHeight: 1.65 }}
          >
            <p>
              Each card centers a planet on the exact arc minute it occupies —
              the curved ruler behind it is the surrounding slice of the
              zodiac. Aspect vectors point along the true ecliptic bearing of
              the other planet (0° = ahead along the zodiac).
            </p>
            <p>
              A <strong style={{ color: "#4ecdc4" }}>solid arrowhead at the planet</strong>{" "}
              is an applying force still closing in (with days to exact); an{" "}
              <strong style={{ color: "var(--fg)" }}>open arrowhead angled away</strong>{" "}
              is separating. Teal = harmonious, ember = challenging.
            </p>
            <p>
              Sign, sect, and dignity forces read on the fixed element compass
              (Fire ↑, Air →, Water ↓, Earth ←); the violet resultant reads on
              the ESMS compass (Spirit ↑, Essence →, Matter ↓, Substance ←) —
              the planet&apos;s net alchemical tendency.
            </p>
            <p>
              Vector lengths are real engine magnitudes normalized within each
              card; hover or tap any vector for its raw numbers. Momentum is
              dashed violet along the planet&apos;s direction of motion (℞ flips
              it).
            </p>
          </div>
        </section>

        {/* Free-body diagram grid */}
        <section aria-label="Planet free-body diagrams">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span className="t-tag">
              FREE-BODY DIAGRAMS · {sky.fbds.length} PLANETS
            </span>
            <span
              className="t-mono"
              style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.1em" }}
              title="The Ascendant is not a planet and gets no card, and aspects to it keep half their effect off-card — so the ten cards intentionally do not sum to the sky totals above."
            >
              + {unattributedTotal.toFixed(2)} ESMS OFF-CARD
              {sky.totals.groundingVessel
                ? ` (ASCENDANT GROUNDING VESSEL${
                    sky.totals.groundingVessel.injected ? ", INJECTED" : ""
                  })`
                : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sky.fbds.map((fbd) => (
              <PlanetFBDCard key={fbd.planet} fbd={fbd} />
            ))}
          </div>
        </section>

        {/* Interactive wheel + alchemical/kinetic tooling */}
        <section aria-label="Interactive chart">
          <div className="t-tag" style={{ margin: "8px 0 10px" }}>
            INTERACTIVE CHART
          </div>
          <PlanetaryChartClient />
        </section>
      </div>
    </div>
  );
}
