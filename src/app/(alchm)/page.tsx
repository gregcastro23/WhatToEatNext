"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type JSX } from "react";
import {
  AstrologicalClockPanel,
  CuisineExplorerPanel,
  ElementalMeter,
  Glyph,
  IngredientCard,
  PipelinePanel,
  SauceLineagePanel,
  ThermoQuartet,
  type AstrologicalClockRow,
  type CuisineSignatureRow,
  type ElementalValues,
  type IngredientCardData,
  type PipelineService,
  type SauceLineageEdge,
  type SauceLineageNode,
  type ThermoValues,
} from "@/components/ui/alchm";

// PlanetaryClock geometry uses Math.sin/cos which can produce micro-different
// floating-point values between server and client, tripping hydration warnings.
// Render client-only.
const PlanetaryClock = dynamic(
  () => import("@/components/ui/alchm").then((m) => m.PlanetaryClock),
  { ssr: false },
);
import { useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";
import { useUser } from "@/contexts/UserContext";

/* ─── Mapping helpers ─────────────────────────────────────────────────────── */

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

function buildAstroRows(
  positions: Record<string, { sign?: string; degree?: number; minutes?: number; isRetrograde?: boolean } | undefined>,
  hourRuler: string,
): AstrologicalClockRow[] {
  const order = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  return order.map((p) => {
    const data = positions[p];
    const sign = data?.sign ?? "—";
    const deg = data?.degree != null ? String(data.degree).padStart(2, "0") : "00";
    const min = data?.minutes != null ? String(data.minutes).padStart(2, "0") : "00";
    const detail = data?.isRetrograde
      ? "retrograde"
      : p === hourRuler
        ? "current hour"
        : "—";
    return {
      planet: p,
      sym: PLANET_GLYPHS[p] ?? "?",
      position: data ? `${deg}°${min}′ ${sign}` : "—",
      detail,
      active: p === hourRuler,
    };
  });
}

/* ─── Awaiting-backend placeholder ───────────────────────────────────────── */

function AwaitingBackend({
  title,
  endpoint,
  note,
}: {
  title: string;
  endpoint: string;
  note?: string;
}): JSX.Element {
  return (
    <div
      className="alchm-panel"
      style={{
        padding: "20px 22px",
        border: "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="t-tag" style={{ color: "var(--accent)" }}>
          {title} · AWAITING BACKEND
        </div>
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: "var(--fg-mute)",
            letterSpacing: "0.14em",
            wordBreak: "break-all",
          }}
        >
          {endpoint}
        </span>
      </div>
      {note && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--fg-dim)",
            lineHeight: 1.55,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

/* ─── Service telemetry from /api/health ─────────────────────────────────── */

interface HealthPayload {
  status?: string;
  services?: Record<string, string>;
  timestamp?: string;
}

/* ─── Recommended ingredients hook ───────────────────────────────────────── */

const PLANET_GLYPH_LOOKUP: Record<string, string> = {
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

interface RecommendedIngredientPayload {
  id: string;
  name: string;
  category: string;
  elemental_affinity: "fire" | "water" | "earth" | "air";
  planet: string;
  hue: number;
  match_score: number;
  thermo: { spirit: number; essence: number; matter: number; substance: number };
}

function useRecommendedIngredients(limit = 8): IngredientCardData[] | null {
  const [items, setItems] = useState<IngredientCardData[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/recommendations/ingredients?limit=${limit}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        const list: RecommendedIngredientPayload[] = Array.isArray(j.ingredients)
          ? j.ingredients
          : [];
        setItems(
          list.map((it) => ({
            id: it.id,
            name: it.name,
            category: (it.category ?? "other").toUpperCase(),
            element: it.elemental_affinity,
            match: it.match_score,
            properties: it.thermo,
            planet: PLANET_GLYPH_LOOKUP[it.planet] ?? "☉",
            hue: it.hue,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);
  return items;
}

/* ─── Cuisine signatures hook ─────────────────────────────────────────────── */

interface CuisineSignaturePayload {
  id: string;
  name: string;
  region: string;
  match: number;
  signature: [number, number, number, number];
}

interface CuisineSignaturesData {
  total: number;
  rows: CuisineSignatureRow[];
}

function useCuisineSignatures(): CuisineSignaturesData | null {
  const [data, setData] = useState<CuisineSignaturesData | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cuisines/signatures", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        const list: CuisineSignaturePayload[] = Array.isArray(j.cuisines)
          ? j.cuisines
          : [];
        setData({
          total: typeof j.total === "number" ? j.total : list.length,
          rows: list.slice(0, 8).map((c) => ({
            id: c.id,
            name: c.name,
            region: c.region,
            match: c.match,
            sig: c.signature,
          })),
        });
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

/* ─── Sauce lineage hook ─────────────────────────────────────────────────── */

interface SauceLineagePayload {
  root: string;
  nodes: Array<{ id: string; label: string; depth: number }>;
  edges: Array<{ from: string; to: string }>;
  stats: { depth: number; nodes: number; variants: number };
}

interface SauceLineageView {
  rootLabel: string;
  nodes: SauceLineageNode[];
  edges: SauceLineageEdge[];
  stats: Array<{ label: string; value: string | number }>;
}

const SAUCE_VIEWBOX = { width: 320, height: 200 };

function layoutLineage(payload: SauceLineagePayload): SauceLineageView {
  const { width, height } = SAUCE_VIEWBOX;
  const rootNode = payload.nodes.find((n) => n.depth === 0) ?? payload.nodes[0];
  const variants = payload.nodes.filter((n) => n.id !== rootNode?.id);
  const cx = width / 2;
  const rootY = 44;
  const variantY = height - 50;

  const positions = new Map<string, { x: number; y: number; r: number; label: string; color?: string }>();
  if (rootNode) {
    positions.set(rootNode.id, {
      x: cx,
      y: rootY,
      r: 14,
      label: rootNode.label,
      color: "var(--accent-2)",
    });
  }
  const spacing = variants.length > 1 ? (width - 60) / (variants.length - 1) : 0;
  variants.forEach((node, i) => {
    const x = variants.length === 1 ? cx : 30 + spacing * i;
    positions.set(node.id, { x, y: variantY, r: 10, label: node.label });
  });

  const nodes: SauceLineageNode[] = Array.from(positions.values());
  const edges: SauceLineageEdge[] = payload.edges
    .map((e) => {
      const from = positions.get(e.from);
      const to = positions.get(e.to);
      if (!from || !to) return null;
      const mid = (from.y + to.y) / 2;
      return { d: `M ${from.x} ${from.y} C ${from.x} ${mid}, ${to.x} ${mid}, ${to.x} ${to.y}` };
    })
    .filter((e): e is SauceLineageEdge => e !== null);

  return {
    rootLabel: rootNode?.label ?? payload.root,
    nodes,
    edges,
    stats: [
      { label: "Variants", value: payload.stats.variants },
      { label: "Depth", value: payload.stats.depth },
      { label: "Nodes", value: payload.stats.nodes },
    ],
  };
}

function useSauceLineage(root: string): SauceLineageView | null {
  const [view, setView] = useState<SauceLineageView | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sauces/lineage?root=${encodeURIComponent(root)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: SauceLineagePayload | null) => {
        if (cancelled || !j) return;
        setView(layoutLineage(j));
      })
      .catch(() => {
        if (!cancelled) setView(null);
      });
    return () => {
      cancelled = true;
    };
  }, [root]);
  return view;
}

function useHealthTelemetry(): PipelineService[] {
  const [data, setData] = useState<HealthPayload | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!data) return [];
  const svcMap = data.services ?? {};
  return Object.entries(svcMap).map(([name, status]) => ({
    name,
    latency: "—",
    up: status === "healthy",
    agent: name === "external_apis",
  }));
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LaboratoryDashboardPage(): JSX.Element {
  const { currentUser } = useUser();
  const alch = useAlchemicalSafe();
  const services = useHealthTelemetry();
  const recommended = useRecommendedIngredients(8);
  const cuisineData = useCuisineSignatures();
  const sauceLineage = useSauceLineage("bechamel");

  const stats = currentUser?.stats;
  const elemental: ElementalValues | null = stats
    ? { fire: stats.fire, water: stats.water, earth: stats.earth, air: stats.air }
    : null;
  const thermo: ThermoValues | null = stats
    ? {
        spirit: stats.spirit,
        essence: stats.essence,
        matter: stats.matter,
        substance: stats.substance,
      }
    : null;

  const planetaryHour = alch?.planetaryHour ?? "Sun";
  const astroRows = alch
    ? buildAstroRows(alch.planetaryPositions ?? {}, planetaryHour)
    : [];

  const sunSign =
    currentUser?.natalChart?.planets?.find((p) => p.name === "Sun")?.sign ?? null;
  const birthDate = currentUser?.birthData?.dateTime?.split("T")[0] ?? null;

  return (
    <div
      style={{
        display: "grid",
        gap: 0,
        minHeight: "calc(100vh - 70px)",
      }}
      className="alchm-dashboard"
    >
      <style>{`
        .alchm-dashboard { grid-template-columns: 1fr; }
        .alchm-dashboard > .alchm-rail-left,
        .alchm-dashboard > .alchm-rail-right { border: none; }
        @media (min-width: 900px) {
          .alchm-dashboard { grid-template-columns: 260px 1fr; }
          .alchm-dashboard > .alchm-rail-left { border-right: 1px solid var(--line); }
        }
        @media (min-width: 1280px) {
          .alchm-dashboard { grid-template-columns: 300px 1fr 340px; }
          .alchm-dashboard > .alchm-rail-right { border-left: 1px solid var(--line); }
        }
        .alchm-hero { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: center; }
        @media (min-width: 1100px) { .alchm-hero { grid-template-columns: auto 1fr; gap: 28px; } }
        .alchm-bottom { display: grid; grid-template-columns: 1fr; gap: 18px; }
        @media (min-width: 1100px) { .alchm-bottom { grid-template-columns: 1.3fr 1fr; } }
        .alchm-rail-right { display: none; }
        @media (min-width: 1280px) { .alchm-rail-right { display: flex; } }
      `}</style>

      {/* LEFT RAIL */}
      <aside
        className="alchm-rail-left"
        style={{
          padding: "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          minHeight: 0,
        }}
      >
        <div>
          <div className="t-tag" style={{ marginBottom: 10 }}>
            NATAL CHART
          </div>
          {currentUser ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1px solid var(--line-hi)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: "var(--accent-2)" }}
                  >
                    ☉
                  </span>
                </div>
                <div>
                  <div className="t-display" style={{ fontSize: 18, color: "var(--fg)" }}>
                    {sunSign ? `${sunSign} · Sun` : "Sun · —"}
                  </div>
                  <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                    {birthDate ?? "natal data unset"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              className="t-mono"
              style={{ fontSize: 11, color: "var(--fg-mute)", lineHeight: 1.5 }}
            >
              Sign in to load your natal chart from <code>/api/user/profile</code>.
            </div>
          )}
        </div>

        <div className="alchm-rule" />

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <span className="t-tag">ELEMENTAL BALANCE</span>
            <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>
              NATAL ⊗ TRANSIT
            </span>
          </div>
          {elemental ? (
            <ElementalMeter values={elemental} />
          ) : (
            <AwaitingBackend
              title="ELEMENTAL BALANCE"
              endpoint="user.stats"
              note="No AlchemicalProfile on the current user. Sign in to populate."
            />
          )}
        </div>

        <div className="alchm-rule" />

        <div>
          <div className="t-tag" style={{ marginBottom: 10 }}>
            THERMODYNAMICS
          </div>
          {thermo ? (
            <ThermoQuartet values={thermo} />
          ) : (
            <AwaitingBackend
              title="THERMODYNAMICS"
              endpoint="user.stats"
              note="Spirit / Essence / Matter / Substance not yet populated."
            />
          )}
        </div>

        <div className="alchm-rule" />

        <div>
          <div className="t-tag" style={{ marginBottom: 10 }}>
            DIETARY KEYS
          </div>
          {currentUser?.dietaryPreferences &&
          Object.keys(currentUser.dietaryPreferences).length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.keys(currentUser.dietaryPreferences).map((k) => (
                <span key={k} className="alchm-chip">
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <AwaitingBackend
              title="DIETARY KEYS"
              endpoint="user.dietaryPreferences"
              note="No dietary preferences set on the current user record."
            />
          )}
        </div>
      </aside>

      {/* CENTER — Clock + Recommendations */}
      <main
        style={{
          padding: "24px 24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          minHeight: 0,
        }}
      >
        <div className="alchm-hero">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlanetaryClock
              size={280}
              rotation={42}
              motion
              activeId={planetaryHour === "Sun" ? "Sol" : planetaryHour}
              hourLabel={`HOUR · ${PLANET_GLYPHS[planetaryHour] ?? "☉"} ${planetaryHour.toUpperCase()}`}
            />
          </div>

          <div>
            <div className="t-tag" style={{ marginBottom: 8 }}>
              CURRENT TRANSIT · {planetaryHour.toUpperCase()} HOUR
            </div>
            <h1
              className="t-display"
              style={{ fontSize: 38, lineHeight: 1.05, margin: "0 0 14px", color: "var(--fg)" }}
            >
              The sky is in a{" "}
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
                {planetaryHour}
              </em>
              <br />
              hour. Tune dinner to it.
            </h1>
            <p
              style={{
                color: "var(--fg-dim)",
                fontSize: 14,
                lineHeight: 1.55,
                maxWidth: 540,
                margin: "0 0 18px",
              }}
            >
              Real-time positions are sourced from{" "}
              <code style={{ fontSize: 12 }}>/api/astrologize</code>. The composed
              recommendation copy and ranked ingredients are wired against the
              backend contracts in{" "}
              <code style={{ fontSize: 12 }}>src/lib/schemas/dashboard.ts</code>;
              sections without live data are flagged below.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="alchm-btn"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 60%), color-mix(in oklch, var(--accent), transparent 80%))",
                  borderColor: "color-mix(in oklch, var(--accent), transparent 40%)",
                }}
              >
                Compose Tonight&apos;s Menu <Glyph name="arrow" size={14} />
              </button>
              <button type="button" className="alchm-btn alchm-btn-ghost">
                Open Lab
              </button>
            </div>
          </div>
        </div>

        <div className="alchm-rule" />

        {recommended === null ? (
          <AwaitingBackend
            title="RECOMMENDED INGREDIENTS"
            endpoint="GET /api/recommendations/ingredients"
            note="Hydrating top 8 ingredients ranked against the live sky…"
          />
        ) : recommended.length === 0 ? (
          <AwaitingBackend
            title="RECOMMENDED INGREDIENTS"
            endpoint="GET /api/recommendations/ingredients"
            note="No matches available right now — try again in a moment."
          />
        ) : (
          <section>
            <div
              className="t-tag"
              style={{ marginBottom: 12, color: "var(--accent-2)" }}
            >
              RECOMMENDED INGREDIENTS · TIER I
            </div>
            <div className="alchm-recs-grid">
              <style>{`
                .alchm-recs-grid {
                  display: grid;
                  gap: 14px;
                  grid-template-columns: repeat(1, 1fr);
                }
                @media (min-width: 600px) { .alchm-recs-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1100px) { .alchm-recs-grid { grid-template-columns: repeat(4, 1fr); } }
              `}</style>
              {recommended.map((card) => (
                <IngredientCard key={card.id} ing={card} />
              ))}
            </div>
          </section>
        )}

        <div className="alchm-bottom">
          {cuisineData && cuisineData.rows.length > 0 ? (
            <CuisineExplorerPanel
              cuisines={cuisineData.rows}
              totalEntries={cuisineData.total}
            />
          ) : (
            <AwaitingBackend
              title="CUISINE EXPLORER · TIER III"
              endpoint="GET /api/cuisines/signatures"
              note="Hydrating 4-element cuisine signatures against the live sky…"
            />
          )}
          {sauceLineage ? (
            <SauceLineagePanel
              rootName={sauceLineage.rootLabel}
              nodes={sauceLineage.nodes}
              edges={sauceLineage.edges}
              stats={sauceLineage.stats}
              viewBoxWidth={SAUCE_VIEWBOX.width}
              viewBoxHeight={SAUCE_VIEWBOX.height}
            />
          ) : (
            <AwaitingBackend
              title="SAUCE LINEAGE TREE"
              endpoint="GET /api/sauces/lineage?root=bechamel"
              note="Hydrating mother-sauce derivation graph…"
            />
          )}
        </div>
      </main>

      {/* RIGHT RAIL */}
      <aside
        className="alchm-rail-right"
        style={{
          padding: "24px 22px",
          flexDirection: "column",
          gap: 22,
          minHeight: 0,
        }}
      >
        {astroRows.length > 0 ? (
          <AstrologicalClockPanel rows={astroRows} live />
        ) : (
          <AwaitingBackend
            title="ASTROLOGICAL CLOCK"
            endpoint="AlchemicalContext.planetaryPositions"
            note="Hydrating from /api/astrologize. Refresh if positions stay empty."
          />
        )}

        <div className="alchm-rule" />

        <AwaitingBackend
          title="TONIGHT'S COMPOSITION"
          endpoint="GET /api/composition/tonight"
          note="Bundle of agent-composed recipe + procurement summary + /api/generate-image cached hero URL. Schema: TonightCompositionResponseSchema."
        />

        <div className="alchm-rule" />

        {services.length > 0 ? (
          <PipelinePanel services={services} />
        ) : (
          <AwaitingBackend
            title="SERVICE TELEMETRY"
            endpoint="GET /api/health"
            note="Current /api/health returns status only. Extend the response per HealthResponseExtendedSchema to populate per-service latency."
          />
        )}
      </aside>
    </div>
  );
}
