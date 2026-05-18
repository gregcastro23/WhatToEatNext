"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use, type JSX } from "react";
import {
  CompatibilityRing,
  ElementalMeter,
  Glyph,
  PremiumGlow,
  ProcurementKit,
  SeasonalityChart,
  SensoryRadar,
  type ElementalValues,
  type ProcurementItem,
  type SensoryAxis,
} from "@/components/ui/alchm";
import { useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";

/* ─── Types matching /api/ingredients/[name] ───────────────────────────── */

interface ApiIngredient {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  elementalProperties?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
  flavorProfile?: Record<string, number>;
  seasonality?: string[] | string;
  season?: string[] | string;
  qualities?: string[];
  origin?: string[];
  affinities?: string[];
  healthBenefits?: string[];
  pairingRecommendations?: string[];
  astrologicalProfile?: {
    rulingPlanets?: string[];
    elementalAffinity?: { base?: string; secondary?: string };
  };
  planetaryRuler?: string;
}

interface ApiRecipe {
  id: string;
  name: string;
  cuisine?: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  amount?: number;
  unit?: string;
}

interface ApiResponse {
  success: boolean;
  ingredient: ApiIngredient | null;
  relatedRecipes?: ApiRecipe[];
  recipesByCuisine?: Record<string, unknown[]>;
  substitutions?: Array<{ name: string; rationale: string; type: string }>;
  totalRecipeMatches?: number;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const SEASON_MONTHS: Record<string, number[]> = {
  spring: [2, 3, 4],
  summer: [5, 6, 7],
  autumn: [8, 9, 10],
  fall: [8, 9, 10],
  winter: [11, 0, 1],
  "all-year": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  year: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

function buildYieldCurve(seasonality: string[] | string | undefined): number[] {
  const list = Array.isArray(seasonality)
    ? seasonality.map((s) => String(s).toLowerCase())
    : typeof seasonality === "string"
      ? seasonality
          .toLowerCase()
          .split(/[,/]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const buckets = new Array(12).fill(0) as number[];
  if (list.length === 0) return buckets;
  list.forEach((season) => {
    const months = SEASON_MONTHS[season];
    if (months) months.forEach((m) => (buckets[m] = 1));
  });
  // soft-tail: each filled month bleeds 0.4 into its neighbors
  const smoothed = buckets.slice();
  buckets.forEach((v, i) => {
    if (v > 0) {
      const prev = (i + 11) % 12;
      const next = (i + 1) % 12;
      smoothed[prev] = Math.max(smoothed[prev], 0.45);
      smoothed[next] = Math.max(smoothed[next], 0.45);
    }
  });
  return smoothed;
}

const SEVEN_AXES = ["sweet", "salt", "sour", "bitter", "umami", "spicy", "aromatic"] as const;

function buildSensoryAxes(flavorProfile: Record<string, number> | undefined): SensoryAxis[] {
  return SEVEN_AXES.map((label) => {
    const raw = flavorProfile?.[label] ?? flavorProfile?.[label.toUpperCase()];
    const value = typeof raw === "number" ? Math.max(0, Math.min(1, raw)) : 0;
    return { label, value };
  });
}

function dominantElement(
  props: ApiIngredient["elementalProperties"],
): { key: "fire" | "water" | "earth" | "air"; value: number } {
  const entries: Array<["fire" | "water" | "earth" | "air", number]> = [
    ["fire", props?.Fire ?? 0],
    ["water", props?.Water ?? 0],
    ["earth", props?.Earth ?? 0],
    ["air", props?.Air ?? 0],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return { key: entries[0][0], value: entries[0][1] };
}

const PLANET_ELEMENT: Record<string, "Fire" | "Water" | "Earth" | "Air"> = {
  Sun: "Fire",
  Mars: "Fire",
  Jupiter: "Fire",
  Moon: "Water",
  Venus: "Water",
  Neptune: "Water",
  Mercury: "Air",
  Uranus: "Air",
  Saturn: "Earth",
  Pluto: "Earth",
};

/* ─── Ticker bar ──────────────────────────────────────────────────────── */

interface TickerItem {
  id: string;
  name: string;
  match: number;
  element: "fire" | "water" | "earth" | "air";
}

function useTrendingTicker(currentId: string): TickerItem[] {
  const [items, setItems] = useState<TickerItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    // /api/recommendations/ingredients does not yet exist — guard for 404.
    fetch("/api/recommendations/ingredients?limit=8", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        const list = Array.isArray(j?.items) ? j.items : [];
        setItems(list);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentId]);
  return items;
}

function TickerBar({ items }: { items: TickerItem[] }): JSX.Element {
  return (
    <div
      style={{
        position: "sticky",
        top: 56,
        zIndex: 10,
        borderBottom: "1px solid var(--line)",
        background: "color-mix(in oklch, var(--bg), transparent 25%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "8px 14px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            color: "var(--accent)",
            paddingRight: 12,
            borderRight: "1px solid var(--line)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          TRENDING · NOW
        </span>
        {items.length === 0 ? (
          <span
            className="t-mono"
            style={{
              fontSize: 10,
              color: "var(--fg-mute)",
              paddingLeft: 12,
              whiteSpace: "nowrap",
            }}
          >
            ticker awaiting <code>/api/recommendations/ingredients</code>
          </span>
        ) : (
          items.map((it, i) => (
            <Link
              key={it.id}
              href={`/ingredients/${encodeURIComponent(it.id)}`}
              className="t-mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 14px",
                fontSize: 11,
                color: "var(--fg)",
                textDecoration: "none",
                borderRight: i < items.length - 1 ? "1px solid var(--line)" : "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span className={`el-dot el-${it.element}`} />
              <span style={{ letterSpacing: "0.06em" }}>{it.name.toUpperCase()}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {(it.match * 100).toFixed(0)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function IngredientHeroPage({
  params,
}: {
  params: Promise<{ ingredientId: string }>;
}): JSX.Element {
  const { ingredientId } = use(params);
  const id = decodeURIComponent(ingredientId);
  const alch = useAlchemicalSafe();
  const ticker = useTrendingTicker(id);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/ingredients/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (r) => {
        const body = (await r.json().catch(() => null)) as ApiResponse | null;
        if (cancelled) return;
        if (!r.ok || !body?.success) {
          setStatus("error");
          return;
        }
        if (!body.ingredient) {
          setStatus("missing");
          setData(body);
          return;
        }
        setData(body);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ── Derived view-model ──────────────────────────────────────────── */
  const ingredient = data?.ingredient ?? null;
  const yields = useMemo(
    () => buildYieldCurve(ingredient?.seasonality ?? ingredient?.season),
    [ingredient?.seasonality, ingredient?.season],
  );
  const axes = useMemo(() => buildSensoryAxes(ingredient?.flavorProfile), [ingredient?.flavorProfile]);

  const elementalValues: ElementalValues | null = ingredient?.elementalProperties
    ? {
        fire: ingredient.elementalProperties.Fire ?? 0,
        water: ingredient.elementalProperties.Water ?? 0,
        earth: ingredient.elementalProperties.Earth ?? 0,
        air: ingredient.elementalProperties.Air ?? 0,
      }
    : null;
  const dom = ingredient?.elementalProperties
    ? dominantElement(ingredient.elementalProperties)
    : null;

  // Compatibility against the current planetary hour's elemental affinity.
  const hourElement = alch?.planetaryHour
    ? PLANET_ELEMENT[alch.planetaryHour] ?? "Fire"
    : "Fire";
  const matchScore = ingredient?.elementalProperties
    ? Math.max(0, Math.min(1, ingredient.elementalProperties[hourElement] ?? 0))
    : 0;

  const procurementItems: ProcurementItem[] = useMemo(() => {
    if (!ingredient) return [];
    const sym = ingredient.name.slice(0, 3).toUpperCase().replace(/\s+/g, "");
    return [
      {
        sym,
        n: `${ingredient.name}, market unit`,
        src: "Whole Earth Mkt.",
        px: "12.50",
        qty: 1,
        ingredientId: id,
      },
    ];
  }, [ingredient, id]);

  const activeMonth = new Date().getMonth();

  /* ── Loading / error / missing branches ──────────────────────────── */
  if (status === "loading") {
    return (
      <Shell>
        <div style={{ padding: 28, color: "var(--fg-mute)" }} className="t-mono">
          LOADING · /api/ingredients/{id}
        </div>
      </Shell>
    );
  }

  if (status === "error" || (status === "missing" && !ingredient)) {
    return (
      <Shell>
        <div
          style={{
            padding: 28,
            border: "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
            margin: 20,
            borderRadius: 10,
          }}
        >
          <div className="t-tag" style={{ color: "var(--accent)" }}>
            INGREDIENT NOT FOUND
          </div>
          <p style={{ color: "var(--fg-dim)", marginTop: 8, fontSize: 13 }}>
            No record returned by{" "}
            <code style={{ fontSize: 12 }}>/api/ingredients/{id}</code>. Try a different
            slug, or return to the{" "}
            <Link href="/" style={{ color: "var(--accent)" }}>
              kitchen dashboard
            </Link>
            .
          </p>
        </div>
      </Shell>
    );
  }

  if (!ingredient) return <Shell>{null}</Shell>;

  const recipeCount = data?.totalRecipeMatches ?? data?.relatedRecipes?.length ?? 0;
  const planetaryRuler =
    ingredient.planetaryRuler ??
    ingredient.astrologicalProfile?.rulingPlanets?.[0] ??
    "—";

  return (
    <Shell>
      <TickerBar items={ticker} />

      <style>{`
        .ihero { padding: 18px 14px 40px; display: flex; flex-direction: column; gap: 22px; }
        .ihero-row { display: grid; grid-template-columns: 1fr; gap: 18px; }
        .ihero-charts { display: grid; grid-template-columns: 1fr; gap: 18px; }
        @media (min-width: 760px) {
          .ihero { padding: 24px 24px 60px; }
          .ihero-row { grid-template-columns: 1.4fr 1fr 1fr; align-items: stretch; }
          .ihero-charts { grid-template-columns: 1.5fr 1fr; align-items: start; }
        }
      `}</style>

      <main className="ihero">
        {/* HERO ROW · 3 columns on tablet+ */}
        <section className="ihero-row">
          {/* Left: name + meta */}
          <div className="alchm-panel" style={{ padding: "22px 24px" }}>
            <div className="t-tag" style={{ color: "var(--accent)" }}>
              {ingredient.category?.toUpperCase()}
              {ingredient.subcategory ? ` · ${ingredient.subcategory.toUpperCase()}` : ""}
            </div>
            <h1
              className="t-display"
              style={{
                fontSize: 44,
                lineHeight: 1.05,
                margin: "10px 0 6px",
                color: "var(--fg)",
                textTransform: "capitalize",
              }}
            >
              {ingredient.name}
            </h1>
            {ingredient.description && (
              <p
                style={{
                  color: "var(--fg-dim)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  margin: "8px 0 16px",
                  maxWidth: 520,
                }}
              >
                {ingredient.description}
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {dom && (
                <span
                  className="alchm-chip"
                  style={{
                    borderColor: `color-mix(in oklch, var(--el-${dom.key}), transparent 50%)`,
                  }}
                >
                  <span className={`el-dot el-${dom.key}`} />
                  {dom.key.toUpperCase()} · {(dom.value * 100).toFixed(0)}%
                </span>
              )}
              {ingredient.qualities?.slice(0, 4).map((q) => (
                <span key={q} className="alchm-chip">
                  {q}
                </span>
              ))}
            </div>
          </div>

          {/* Center: match ring */}
          <div
            className="alchm-panel"
            style={{
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span className="t-tag">SKY MATCH</span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                {alch?.planetaryHour?.toUpperCase() ?? "—"} HOUR
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <CompatibilityRing value={matchScore} size={120} />
              <div>
                <div className="t-display" style={{ fontSize: 32, color: "var(--fg)" }}>
                  {(matchScore * 100).toFixed(0)}
                  <span style={{ fontSize: 14, color: "var(--fg-mute)" }}>%</span>
                </div>
                <div
                  className="t-mono"
                  style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 4 }}
                >
                  vs. {hourElement.toUpperCase()} TRANSIT
                </div>
                <div
                  className="t-mono"
                  style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 4 }}
                >
                  RULER · {String(planetaryRuler).toUpperCase()}
                </div>
              </div>
            </div>
            {elementalValues && (
              <>
                <div className="alchm-rule" />
                <ElementalMeter values={elementalValues} />
              </>
            )}
          </div>

          {/* Right: usage stats */}
          <div
            className="alchm-panel"
            style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <div className="t-tag">RECIPE INDEX</div>
              <div
                className="t-display"
                style={{ fontSize: 34, color: "var(--fg)", marginTop: 6 }}
              >
                {recipeCount.toString().padStart(3, "0")}
              </div>
              <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                RECIPES REFERENCE THIS INGREDIENT
              </div>
            </div>
            <div className="alchm-rule" />
            <div>
              <div className="t-tag" style={{ marginBottom: 8 }}>
                ORIGIN
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                {ingredient.origin?.join(" · ") ?? "—"}
              </div>
            </div>
            {ingredient.healthBenefits && ingredient.healthBenefits.length > 0 && (
              <>
                <div className="alchm-rule" />
                <div>
                  <div className="t-tag" style={{ marginBottom: 8 }}>
                    HEALTH SIGNALS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ingredient.healthBenefits.slice(0, 4).map((h) => (
                      <span key={h} className="alchm-chip">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* CHARTS ROW · seasonality + sensory radar */}
        <section className="ihero-charts">
          <div className="alchm-panel" style={{ padding: "20px 24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="t-tag">SEASONALITY · 12 MONTH YIELD</div>
                <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 4 }}>
                  NORTHERN HEMISPHERE · SMOOTHED CURVE
                </div>
              </div>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>
                MONTH · {new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}
              </span>
            </div>
            <SeasonalityChart yields={yields} activeMonth={activeMonth} />
          </div>

          <div className="alchm-panel" style={{ padding: "20px 24px" }}>
            <div className="t-tag" style={{ marginBottom: 14 }}>
              SENSORY PROFILE · 7-AXIS
            </div>
            {Object.keys(ingredient.flavorProfile ?? {}).length > 0 ? (
              <SensoryRadar axes={axes} size={240} />
            ) : (
              <div
                style={{
                  padding: 18,
                  border: "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
                  borderRadius: 8,
                }}
              >
                <div className="t-mono" style={{ fontSize: 10, color: "var(--accent)" }}>
                  AWAITING flavorProfile
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 6 }}>
                  This ingredient record has no numeric sensory map (sweet/salt/sour/bitter/umami/spicy/aromatic).
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PROCUREMENT KIT */}
        <section>
          <ProcurementKit
            items={procurementItems}
            ctaLabel="Procure substance"
            primeBadge="PRIME · 1 DAY"
          />
        </section>

        {/* PREMIUM GATE · agent substitutions + recipe lineage */}
        <section>
          <div className="t-tag" style={{ marginBottom: 12 }}>
            AGENT INTELLIGENCE
          </div>
          <PremiumGlow
            revealAmount={0.4}
            headline="Unlock the full readout for this ingredient."
            description="Recipe lineage, agent-tuned substitutions, and Spirit×Essence×Matter forecasting against your natal chart."
            ctaLabel="Go Premium"
            ctaHref="/premium"
          >
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div className="t-tag" style={{ marginBottom: 10 }}>
                  RECIPE LINEAGE
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(data?.relatedRecipes ?? []).slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: "var(--fg)" }}>{r.name}</div>
                        <div
                          className="t-mono"
                          style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2, letterSpacing: "0.1em" }}
                        >
                          {r.cuisine?.toUpperCase() ?? "—"}
                        </div>
                      </div>
                      <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                        {r.prepTime ? `${r.prepTime}m PREP` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="t-tag" style={{ marginBottom: 10 }}>
                  AGENT SUBSTITUTIONS
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(data?.substitutions ?? []).slice(0, 6).map((s) => (
                    <span key={s.name} className="alchm-chip">
                      {s.name}
                    </span>
                  ))}
                  {(data?.substitutions ?? []).length === 0 && (
                    <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                      no pairings indexed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </PremiumGlow>
        </section>
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ minHeight: "calc(100vh - 70px)", background: "var(--bg)" }}>
      {children}
    </div>
  );
}
