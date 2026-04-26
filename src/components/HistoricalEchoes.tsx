/**
 * Historical Echoes — closes the /quantities page.
 *
 *   "When was the last time the cosmos felt like this?"
 *
 * Pulls /api/alchm-quantities/echoes for one of five outer planets and
 * renders the date prominently along with the full chart at the echo
 * moment, the alchemical state then vs. now, and a clean human delta.
 *
 * Pluto is the headline (its 248-year orbit means each return is a once-
 * per-lifetime cosmic event). Saturn / Jupiter / Uranus / Neptune are
 * available via the planet selector.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

const ECHO_PLANETS = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"] as const;
type EchoPlanet = (typeof ECHO_PLANETS)[number];

interface PlanetSnapshot {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  minute: number;
  isRetrograde: boolean;
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

const PLANET_PERIODS: Record<EchoPlanet, number> = {
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.79,
  Pluto: 247.94,
};

const PLANET_TITLES: Record<EchoPlanet, string> = {
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

function formatYearsAgo(years: number): string {
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

export default function HistoricalEchoes() {
  const [planet, setPlanet] = useState<EchoPlanet>("Pluto");
  const [data, setData] = useState<EchoResponse["echo"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
    })();
    return () => {
      cancelled = true;
    };
  }, [planet]);

  const matchedPlanetEntry = useMemo(() => {
    if (!data) return null;
    return data.echo.snapshot.find((p) => p.planet === planet) ?? null;
  }, [data, planet]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="text-xl font-black text-white">Historical Echoes</h2>
        <span className="text-[10px] text-white/40 italic">
          When was the last time the cosmos felt like this?
        </span>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">
          {data ? `${formatYearsAgo(data.echo.yearsAgo)} · matched to ${data.echo.deltaArcminutes.toFixed(2)} arcmin` : ""}
        </span>
      </div>

      {/* Planet selector */}
      <div className="flex flex-wrap gap-1.5">
        {ECHO_PLANETS.map((p) => (
          <button
            key={p}
            onClick={() => setPlanet(p)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider
              transition-all duration-200 border
              ${
                planet === p
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/8 bg-white/[0.02] text-white/40 hover:text-white/70 hover:border-white/15"
              }
            `}
          >
            <span className="text-base">{PLANET_GLYPHS[p]}</span>
            <span>{p}</span>
            <span className="opacity-50 text-[9px] font-mono normal-case">
              {PLANET_PERIODS[p].toFixed(1)}y
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-4">
          <div className="h-32 bg-white/5 animate-pulse rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Hero echo card */}
          <div className="rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent backdrop-blur-md p-7 relative">
            {/* glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none bg-amber-500" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none bg-purple-500" />

            <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">
                  {PLANET_TITLES[planet]} · Echo Match
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-7xl">{PLANET_GLYPHS[planet]}</span>
                  <div>
                    <div className="text-3xl font-black text-white tracking-tight leading-none">
                      {data.echo.degree}°{String(data.echo.minute).padStart(2, "0")}′
                      <span className="ml-2 text-2xl text-white/60">{SIGN_GLYPHS[data.echo.sign] ?? ""}</span>
                      <span className="ml-1 text-lg text-white/40 font-mono uppercase tracking-wider">
                        {data.echo.sign}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/30 font-mono mt-1">
                      reference: {data.reference.degree}°
                      {String(data.reference.minute).padStart(2, "0")}′ ·
                      delta {data.echo.deltaArcminutes.toFixed(2)}′
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-1">
                  Last Time Here
                </div>
                <div className="text-2xl font-black text-white">
                  {formatDate(data.echo.iso)}
                </div>
                <div className="text-sm text-amber-300/80 mt-1 font-medium">
                  {formatYearsAgo(data.echo.yearsAgo)}
                </div>
              </div>
            </div>
          </div>

          {/* Two-column chart comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Echo chart */}
            <ChartPanel
              title={formatDate(data.echo.iso)}
              subtitle={`The cosmos at the last ${planet} return`}
              snapshot={data.echo.snapshot}
              highlightPlanet={planet}
              accent="amber"
            />
            {/* Now chart */}
            <ChartPanel
              title="Today"
              subtitle="The cosmos right now"
              snapshot={data.reference.snapshot}
              highlightPlanet={planet}
              accent="purple"
            />
          </div>

          {/* ESMS comparison strip */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-black text-white/80 uppercase tracking-[0.25em]">
                Alchemical State — Then vs. Now
              </h3>
              <span className="text-[9px] text-white/30 font-mono">
                same {planet} placement, different cosmic backdrop
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  ["Spirit", data.reference.alchemical.esms.Spirit, data.echo.alchemical.esms.Spirit, "#f59e0b"],
                  ["Essence", data.reference.alchemical.esms.Essence, data.echo.alchemical.esms.Essence, "#3b82f6"],
                  ["Matter", data.reference.alchemical.esms.Matter, data.echo.alchemical.esms.Matter, "#10b981"],
                  ["Substance", data.reference.alchemical.esms.Substance, data.echo.alchemical.esms.Substance, "#8b5cf6"],
                ] as const
              ).map(([label, now, then, color]) => {
                const delta = now - then;
                return (
                  <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <div className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color }}>
                      {label}
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-black tabular-nums" style={{ color }}>
                        {fmt(now)}
                      </span>
                      <span className="text-[10px] text-white/30 font-mono uppercase">now</span>
                    </div>
                    <div className="text-[10px] text-white/50 tabular-nums">
                      then: <span className="font-mono">{fmt(then)}</span>
                    </div>
                    <div
                      className={`text-[10px] font-bold mt-1 tabular-nums ${
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

            {/* Thermo comparison */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  ["Heat", data.reference.alchemical.thermodynamicProperties.heat, data.echo.alchemical.thermodynamicProperties.heat],
                  ["Entropy", data.reference.alchemical.thermodynamicProperties.entropy, data.echo.alchemical.thermodynamicProperties.entropy],
                  ["Reactivity", data.reference.alchemical.thermodynamicProperties.reactivity, data.echo.alchemical.thermodynamicProperties.reactivity],
                  ["Greg's Energy", data.reference.alchemical.thermodynamicProperties.gregsEnergy, data.echo.alchemical.thermodynamicProperties.gregsEnergy],
                ] as const
              ).map(([label, now, then]) => {
                const delta = now - then;
                return (
                  <div key={label} className="rounded-xl border border-white/5 bg-white/[0.015] p-3">
                    <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
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

          <p className="text-[9px] text-white/20 italic font-mono px-2">
            {planet} returns every {PLANET_PERIODS[planet]} years.
            {matchedPlanetEntry && data.echo.deltaArcminutes < 5
              ? ` Match precision: ${data.echo.deltaArcminutes.toFixed(2)} arcminutes — essentially exact.`
              : ` Match precision: ${data.echo.deltaArcminutes.toFixed(2)} arcminutes.`}
          </p>
        </>
      )}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChartPanel({
  title,
  subtitle,
  snapshot,
  highlightPlanet,
  accent,
}: {
  title: string;
  subtitle: string;
  snapshot: PlanetSnapshot[];
  highlightPlanet: string;
  accent: "amber" | "purple";
}) {
  const accentBorder = accent === "amber" ? "border-amber-500/20" : "border-purple-500/20";
  const accentText = accent === "amber" ? "text-amber-400" : "text-purple-400";
  return (
    <div className={`rounded-2xl border ${accentBorder} bg-white/[0.02] p-5 backdrop-blur-md`}>
      <div className="mb-4">
        <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${accentText}`}>
          {title}
        </div>
        <div className="text-[10px] text-white/40 italic">{subtitle}</div>
      </div>
      <div className="space-y-1.5">
        {snapshot.map((p) => {
          const isHighlight = p.planet === highlightPlanet;
          return (
            <div
              key={p.planet}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                isHighlight
                  ? `bg-white/[0.06] border ${accentBorder}`
                  : "hover:bg-white/[0.02] border border-transparent"
              }`}
            >
              <span
                className={`text-xl ${isHighlight ? accentText : "text-white/40"}`}
              >
                {PLANET_GLYPHS[p.planet] ?? "·"}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isHighlight ? "text-white" : "text-white/60"
                  }`}
                >
                  {p.planet}
                  {p.isRetrograde && (
                    <span className="ml-1.5 text-[8px] font-mono text-amber-400/60">℞</span>
                  )}
                </div>
              </div>
              <div className="text-right tabular-nums whitespace-nowrap">
                <div
                  className={`text-sm font-mono font-bold ${
                    isHighlight ? "text-white" : "text-white/70"
                  }`}
                >
                  {p.degree}°{String(p.minute).padStart(2, "0")}′
                  <span className="text-white/40 ml-1.5">{SIGN_GLYPHS[p.sign] ?? ""}</span>
                </div>
                <div className="text-[9px] text-white/30 font-mono uppercase">
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
