/**
 * Historical Echoes — closes the /quantities page.
 *
 *   "When was the last time the cosmos felt like this?"
 *
 * Pulls /api/alchm-quantities/echoes for the Sun (Solar Return, 1 year ago)
 * or one of five outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto)
 * and renders:
 *   1. Solar Return Panel with exact 1-year historical recurrence & top cuisine matches.
 *   2. Placements comparison (The cosmos then vs now).
 *   3. Alchemical & thermodynamic state evolution (ESMS + thermo deltas).
 *   4. Outer-planet multi-decade & century epoch cycles.
 */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { _logger } from "@/lib/logger";

export const ECHO_PLANETS = [
  "Sun",
  "Pluto",
  "Neptune",
  "Uranus",
  "Saturn",
  "Jupiter",
] as const;
export type EchoPlanet = (typeof ECHO_PLANETS)[number];

interface PlanetSnapshot {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  minute: number;
  isRetrograde: boolean;
}

interface SolarCuisineMatch {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  score: number;
  elementalAlignment: { Fire: number; Water: number; Earth: number; Air: number };
  flavorProfiles: Record<string, number>;
  signatureIngredients: string[];
  signatureTechniques: string[];
  planetaryResonance: string[];
  reasons: string[];
}

interface EchoResponse {
  success: boolean;
  echo: {
    planet: EchoPlanet;
    reference: {
      iso: string;
      ts: number;
      longitude: number;
      sign: string;
      degree: number;
      minute: number;
      snapshot: PlanetSnapshot[];
      alchemical: {
        esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
        thermodynamicProperties: {
          heat: number;
          entropy: number;
          reactivity: number;
          gregsEnergy: number;
        };
        kalchm: number;
        monica: number;
      };
    };
    echo: EchoResponse["echo"]["reference"] & {
      yearsAgo: number;
      deltaArcminutes: number;
    };
    delta: {
      aNumber: number;
      spirit: number;
      essence: number;
      matter: number;
      substance: number;
      heat: number;
      entropy: number;
      reactivity: number;
      gregsEnergy: number;
    };
    search: { coarseStageMs: number; refineStageMs: number; iterations: number };
    cuisineMatches?: SolarCuisineMatch[];
  };
}

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

const SIGN_GLYPHS: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

const SIGN_ELEMENTS: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

const ELEMENT_COLORS: Record<"Fire" | "Earth" | "Air" | "Water", { text: string; bg: string; border: string }> = {
  Fire: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  Air: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25" },
  Water: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
};

const PLANET_PERIODS: Record<EchoPlanet, number> = {
  Sun: 1.0,
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.79,
  Pluto: 247.94,
};

const PLANET_TITLES: Record<EchoPlanet, string> = {
  Sun: "Solar Return (Annual Mirror)",
  Jupiter: "Jupiter Return",
  Saturn: "Saturn Return",
  Uranus: "Uranus Return",
  Neptune: "Neptune Return",
  Pluto: "Pluto Return",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatYearsAgo(years: number, isSolar: boolean): string {
  if (isSolar) {
    const days = Math.round(years * 365.25);
    return `${days} days ago · exactly 1.0 tropical year`;
  }
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  if (years < 10) {
    const yrs = Math.floor(years);
    const months = Math.round((years - yrs) * 12);
    if (months === 0) return `${yrs} year${yrs === 1 ? "" : "s"} ago`;
    return `${yrs}y ${months}mo ago`;
  }
  return `${years.toFixed(1)} years ago`;
}

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 100) return n.toFixed(2);
  if (a >= 10) return n.toFixed(3);
  if (a >= 1) return n.toFixed(3);
  return n.toFixed(digits);
}

function calcAngleShift(refLon: number, echoLon: number): number {
  return (((refLon - echoLon) % 360) + 540) % 360 - 180;
}

export default function HistoricalEchoes(): React.JSX.Element {
  const [planet, setPlanet] = useState<EchoPlanet>("Sun");
  const [data, setData] = useState<EchoResponse["echo"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCuisineTab, setActiveCuisineTab] = useState<number>(0);

  const isSolar = planet === "Sun";

  useEffect(() => {
    let cancelled = false;
    const fetchEcho = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/alchm-quantities/echoes?planet=${planet}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as EchoResponse;
        if (!json.success) throw new Error("API reported failure");
        if (!cancelled) setData(json.echo);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEcho().catch((err: unknown) => {
      _logger.error("Unhandled error in fetchEcho:", err);
    });

    return (): void => {
      cancelled = true;
    };
  }, [planet]);

  const matchedPlanetEntry = useMemo(() => {
    if (!data) return null;
    return data.echo.snapshot.find((p) => p.planet === planet) ?? null;
  }, [data, planet]);

  return (
    <section className="space-y-8" aria-label="Historical Echoes Section">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-2xl font-black text-white tracking-tight">Historical Echoes</h2>
          <span className="text-xs text-white/50 italic">
            When was the last time the cosmos felt like this?
          </span>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-[10px] text-amber-300/80 font-mono uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              {formatYearsAgo(data.echo.yearsAgo, isSolar)} · delta {data.echo.deltaArcminutes.toFixed(2)}′
            </span>
          )}
        </div>
      </div>

      {/* Planet / Mode selector */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Cosmic Echo Selection">
        {ECHO_PLANETS.map((p) => {
          const isSelected = planet === p;
          const isSunPlanet = p === "Sun";
          return (
            <button
              key={p}
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setPlanet(p);
                setActiveCuisineTab(0);
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wider
                transition-all duration-200 border
                ${
                  isSelected
                    ? isSunPlanet
                      ? "border-amber-400 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/25 text-amber-200 shadow-lg shadow-amber-500/10"
                      : "border-white/30 bg-white/10 text-white"
                    : isSunPlanet
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-300/60 hover:text-amber-200 hover:border-amber-400/40"
                    : "border-white/8 bg-white/[0.02] text-white/40 hover:text-white/70 hover:border-white/15"
                }
              `}
            >
              <span className={`text-lg ${isSunPlanet && isSelected ? "text-amber-300" : ""}`}>
                {PLANET_GLYPHS[p]}
              </span>
              <span>{isSunPlanet ? "Solar Return" : p}</span>
              <span className="opacity-60 text-[10px] font-mono normal-case">
                {PLANET_PERIODS[p].toFixed(1)}y
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-4">
          <div className="h-44 bg-white/5 animate-pulse rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-72 bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-72 bg-white/5 animate-pulse rounded-2xl" />
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Hero Echo Card */}
          <HeroEchoCard planet={planet} data={data} isSolar={isSolar} />

          {/* Solar Return Cuisine Matches */}
          {isSolar && data.cuisineMatches && data.cuisineMatches.length > 0 && (
            <SolarCuisineSection
              cuisineMatches={data.cuisineMatches}
              sign={data.echo.sign}
              activeTab={activeCuisineTab}
              onSelectTab={setActiveCuisineTab}
            />
          )}

          {/* Two-Column Chart Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPanel
              title={isSolar ? `Solar Return · ${formatDate(data.echo.iso)}` : formatDate(data.echo.iso)}
              subtitle={
                isSolar
                  ? "The cosmos when the Sun was at this exact degree 1 year ago"
                  : `The cosmos at the last ${planet} return`
              }
              snapshot={data.echo.snapshot}
              referenceSnapshot={data.reference.snapshot}
              highlightPlanet={planet}
              accent="amber"
            />
            <ChartPanel
              title="Today's Celestial Chart"
              subtitle="The cosmos right now"
              snapshot={data.reference.snapshot}
              referenceSnapshot={data.echo.snapshot}
              highlightPlanet={planet}
              accent="purple"
            />
          </div>

          {/* ESMS & Thermodynamic Comparison Strip */}
          <ESMSComparisonSection data={data} planet={planet} isSolar={isSolar} />

          {/* Footer note */}
          <footer className="text-[10px] text-white/30 italic font-mono px-2 flex justify-between flex-wrap gap-2">
            <span>
              {planet} returns every {PLANET_PERIODS[planet]} year{PLANET_PERIODS[planet] === 1 ? "" : "s"}.
              {matchedPlanetEntry && data.echo.deltaArcminutes < 5
                ? ` Match precision: ${data.echo.deltaArcminutes.toFixed(2)} arcminutes — essentially exact.`
                : ` Match precision: ${data.echo.deltaArcminutes.toFixed(2)} arcminutes.`}
            </span>
            <span>Refined via Swiss Ephemeris / astronomy-engine</span>
          </footer>
        </>
      )}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroEchoCard({
  planet,
  data,
  isSolar,
}: {
  planet: EchoPlanet;
  data: EchoResponse["echo"];
  isSolar: boolean;
}): React.JSX.Element {
  const borderStyle = isSolar
    ? "border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-purple-950/20"
    : "border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent";

  return (
    <article className={`rounded-3xl overflow-hidden border backdrop-blur-md p-7 relative transition-all duration-300 ${borderStyle}`}>
      <div
        className={`absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none ${
          isSolar ? "bg-amber-400" : "bg-amber-500"
        }`}
      />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none bg-purple-500" />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${isSolar ? "text-amber-300" : "text-white/40"}`}>
              {PLANET_TITLES[planet]} · {isSolar ? "Annual Cosmic Mirror" : "Epoch Match"}
            </span>
            {isSolar && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                1 Year Cycle
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-4 mb-3">
            <span className={`text-7xl leading-none ${isSolar ? "text-amber-300" : "text-white"}`}>
              {PLANET_GLYPHS[planet]}
            </span>
            <div>
              <div className="text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2 flex-wrap">
                <span>
                  {data.echo.degree}°{String(data.echo.minute).padStart(2, "0")}′
                </span>
                <span className="text-2xl text-amber-300/80">
                  {SIGN_GLYPHS[data.echo.sign] ?? ""}
                </span>
                <span className="text-lg text-white/50 font-mono uppercase tracking-wider">
                  {data.echo.sign}
                </span>
              </div>
              <div className="text-[11px] text-white/40 font-mono mt-1.5 flex items-center gap-2 flex-wrap">
                <span>
                  Reference: {data.reference.degree}°{String(data.reference.minute).padStart(2, "0")}′ {data.reference.sign}
                </span>
                <span>·</span>
                <span className="text-emerald-400/90 font-bold">
                  delta {data.echo.deltaArcminutes.toFixed(2)}′ (arcmin)
                </span>
              </div>
            </div>
          </div>

          {isSolar && (
            <p className="text-xs text-amber-100/70 max-w-xl leading-relaxed mt-2">
              The Sun has completed a 360° tropical orbit to reach the exact degree and minute it
              held one year ago. While your solar core is aligned in identical celestial posture,
              the accompanying planetary backdrop has fundamentally transformed.
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.35em] mb-1">
            Last Time Here (1 Year Ago)
          </div>
          <div className="text-2xl font-black text-white">
            {formatDate(data.echo.iso)}
          </div>
          <div className="text-xs text-white/50 font-mono mt-0.5">
            {formatDateTime(data.echo.iso)}
          </div>
          <div className="text-sm text-amber-300 font-semibold mt-1">
            {formatYearsAgo(data.echo.yearsAgo, isSolar)}
          </div>
        </div>
      </div>
    </article>
  );
}

function SolarCuisineSection({
  cuisineMatches,
  sign,
  activeTab,
  onSelectTab,
}: {
  cuisineMatches: SolarCuisineMatch[];
  sign: string;
  activeTab: number;
  onSelectTab: (index: number) => void;
}): React.JSX.Element {
  const activeCuisine = cuisineMatches[activeTab] ?? cuisineMatches[0];

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.04] to-transparent p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">☉</span>
            <h3 className="text-base font-black text-white uppercase tracking-[0.2em]">
              Solar Return Cuisine Matches
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Cuisines resonating with this solar moment&apos;s elemental balance, Sun in{" "}
            <span className="text-amber-300 font-bold capitalize">{sign}</span>, and annual rebirth vitality.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-auto">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Top {cuisineMatches.length} Matches
          </span>
        </div>
      </div>

      {/* Cuisine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cuisineMatches.map((cuisine, index) => {
          const isSelected = activeTab === index;
          return (
            <button
              type="button"
              key={cuisine.id}
              onClick={() => onSelectTab(index)}
              className={`text-left w-full cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-amber-400/60 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                  : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-black text-white">{cuisine.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {cuisine.matchPercentage}%
                  </span>
                </div>

                <p className="text-[11px] text-white/60 line-clamp-2 mb-3">
                  {cuisine.description}
                </p>

                <div className="mb-3 space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-white/40">
                    <span>Elements</span>
                    <span>
                      F: {Math.round(cuisine.elementalAlignment.Fire * 100)}% · W:{" "}
                      {Math.round(cuisine.elementalAlignment.Water * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${cuisine.elementalAlignment.Fire * 100}%` }}
                      className="bg-amber-500 h-full"
                      title="Fire"
                    />
                    <div
                      style={{ width: `${cuisine.elementalAlignment.Earth * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title="Earth"
                    />
                    <div
                      style={{ width: `${cuisine.elementalAlignment.Air * 100}%` }}
                      className="bg-sky-400 h-full"
                      title="Air"
                    />
                    <div
                      style={{ width: `${cuisine.elementalAlignment.Water * 100}%` }}
                      className="bg-indigo-500 h-full"
                      title="Water"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Signature Aromatics
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cuisine.signatureIngredients.slice(0, 3).map((ing) => (
                      <span
                        key={ing}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/70 font-mono"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 w-full">
                <div className="text-[10px] text-amber-200/90 font-medium">
                  {cuisine.reasons[0] ?? "Resonant with solar return placement"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Active Cuisine Focus Box */}
      {activeCuisine && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                Featured Solar Culinary Alignment
              </div>
              <h4 className="text-lg font-black text-white">
                {activeCuisine.name} Cuisine · {activeCuisine.matchPercentage}% Harmonic Match
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCuisine.planetaryResonance.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-white/70 border border-white/10"
                >
                  {PLANET_GLYPHS[p] ?? ""} {p}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Why this cuisine harmonizes with your solar return
              </div>
              <ul className="space-y-1.5">
                {activeCuisine.reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-white/80">
                    <span className="text-amber-400 text-sm">✦</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Recommended Preparation & Techniques
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCuisine.signatureTechniques.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-200 border border-amber-500/20 text-xs capitalize"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mt-2">
                {activeCuisine.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ESMSComparisonSection({
  data,
  planet,
  isSolar,
}: {
  data: EchoResponse["echo"];
  planet: EchoPlanet;
  isSolar: boolean;
}): React.JSX.Element {
  const esmsList = [
    ["Spirit", data.reference.alchemical.esms.Spirit, data.echo.alchemical.esms.Spirit, "#f59e0b"],
    ["Essence", data.reference.alchemical.esms.Essence, data.echo.alchemical.esms.Essence, "#3b82f6"],
    ["Matter", data.reference.alchemical.esms.Matter, data.echo.alchemical.esms.Matter, "#10b981"],
    ["Substance", data.reference.alchemical.esms.Substance, data.echo.alchemical.esms.Substance, "#8b5cf6"],
  ] as const;

  const thermoList = [
    ["Heat", data.reference.alchemical.thermodynamicProperties.heat, data.echo.alchemical.thermodynamicProperties.heat],
    ["Entropy", data.reference.alchemical.thermodynamicProperties.entropy, data.echo.alchemical.thermodynamicProperties.entropy],
    ["Reactivity", data.reference.alchemical.thermodynamicProperties.reactivity, data.echo.alchemical.thermodynamicProperties.reactivity],
    ["Greg's Energy", data.reference.alchemical.thermodynamicProperties.gregsEnergy, data.echo.alchemical.thermodynamicProperties.gregsEnergy],
  ] as const;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.25em]">
          Alchemical State — Then vs. Now
        </h3>
        <span className="text-[10px] text-white/40 font-mono">
          {isSolar
            ? "same Sun degree, shifted cosmic backdrop"
            : `same ${planet} placement, different cosmic backdrop`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {esmsList.map(([label, now, then, color]) => {
          const delta = now - then;
          return (
            <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
              <div className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color }}>
                {label}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black tabular-nums" style={{ color }}>
                  {fmt(now)}
                </span>
                <span className="text-[10px] text-white/30 font-mono uppercase">now</span>
              </div>
              <div className="text-[11px] text-white/50 tabular-nums">
                then: <span className="font-mono">{fmt(then)}</span>
              </div>
              <div
                className={`text-[11px] font-bold mt-1 tabular-nums ${
                  delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-white/40"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {fmt(delta)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {thermoList.map(([label, now, then]) => {
          const delta = now - then;
          return (
            <div key={label} className="rounded-xl border border-white/5 bg-white/[0.015] p-3">
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                {label}
              </div>
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-base font-black text-white tabular-nums">{fmt(now)}</span>
              </div>
              <div className="text-[10px] text-white/40 tabular-nums">
                vs <span className="font-mono">{fmt(then)}</span>
              </div>
              <div
                className={`text-[10px] font-bold mt-0.5 tabular-nums ${
                  delta > 0 ? "text-emerald-400/80" : delta < 0 ? "text-rose-400/80" : "text-white/30"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {fmt(delta)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  subtitle,
  snapshot,
  referenceSnapshot,
  highlightPlanet,
  accent,
}: {
  title: string;
  subtitle: string;
  snapshot: PlanetSnapshot[];
  referenceSnapshot?: PlanetSnapshot[];
  highlightPlanet: string;
  accent: "amber" | "purple";
}): React.JSX.Element {
  const accentBorder = accent === "amber" ? "border-amber-500/25" : "border-purple-500/25";
  const accentText = accent === "amber" ? "text-amber-400" : "text-purple-400";

  return (
    <div className={`rounded-2xl border ${accentBorder} bg-white/[0.02] p-5 backdrop-blur-md`}>
      <div className="mb-4">
        <div className={`text-xs font-black uppercase tracking-[0.25em] mb-1 ${accentText}`}>
          {title}
        </div>
        <div className="text-[11px] text-white/50 italic">{subtitle}</div>
      </div>

      <div className="space-y-1.5">
        {snapshot.map((p) => {
          const isHighlight = p.planet === highlightPlanet;
          const element: "Fire" | "Earth" | "Air" | "Water" = SIGN_ELEMENTS[p.sign.toLowerCase()] ?? "Fire";
          const elColor = ELEMENT_COLORS[element];

          const otherP = referenceSnapshot?.find((item) => item.planet === p.planet);
          const shift = otherP ? calcAngleShift(p.longitude, otherP.longitude) : 0;
          const isIdentical = Math.abs(shift) < 0.05;

          return (
            <div
              key={p.planet}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                isHighlight
                  ? `bg-white/[0.07] border ${accentBorder}`
                  : "hover:bg-white/[0.02] border border-transparent"
              }`}
            >
              <span className={`text-xl ${isHighlight ? accentText : "text-white/40"}`}>
                {PLANET_GLYPHS[p.planet] ?? "·"}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isHighlight ? "text-white font-extrabold" : "text-white/70"
                    }`}
                  >
                    {p.planet}
                  </span>
                  {p.isRetrograde && (
                    <span className="text-[9px] font-mono font-bold text-amber-400/80 bg-amber-400/10 px-1 rounded">
                      ℞
                    </span>
                  )}
                  <span
                    className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded border ${elColor.bg} ${elColor.text} ${elColor.border}`}
                  >
                    {element}
                  </span>
                  {isHighlight && isIdentical && (
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      IDENTICAL
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right tabular-nums whitespace-nowrap">
                <div
                  className={`text-sm font-mono font-bold ${
                    isHighlight ? "text-white" : "text-white/80"
                  }`}
                >
                  {p.degree}°{String(p.minute).padStart(2, "0")}′
                  <span className="text-white/40 ml-1.5">{SIGN_GLYPHS[p.sign] ?? ""}</span>
                </div>
                <div className="text-[10px] text-white/40 font-mono uppercase">
                  {p.sign}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
