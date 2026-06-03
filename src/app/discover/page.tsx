"use client";

import Link from "next/link";
import { useMemo, type JSX } from "react";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import { NAV_IA, type NavRoute } from "@/config/navigation";
import { useElementalState } from "@/hooks/useElementalState";

/**
 * Discover — "Browse the cosmic pantry".
 *
 * The landing page for the Discover nav cluster (bottom tab bar + header
 * mega-menu both point here). Mirrors the desktop mega-menu's grouping
 * (RedesignedHeader → MENU_GROUPS.discover) as a full launchpad, and opens
 * with a live elemental brief so the catalog is framed by the current sky.
 *
 * Route metadata (label / glyph / hint) is pulled from NAV_IA so the page
 * never drifts from the rest of the navigation. Any discover route not
 * claimed by a group below lands in a trailing "More" group, so adding an
 * entry to NAV_IA can never silently drop it from this page.
 *
 * @file src/app/discover/page.tsx
 */

interface GroupDef {
  label: string;
  sub: string;
  paths: string[];
}

const GROUP_DEFS: readonly GroupDef[] = [
  {
    label: "Browse",
    sub: "The catalog — ranked by the live sky",
    paths: ["/cuisines", "/ingredients", "/cooking-methods", "/sauces", "/restaurants"],
  },
  {
    label: "Cook",
    sub: "Compose and generate from raw materials",
    paths: ["/recipes", "/recipe-builder", "/recipe-generator"],
  },
];

interface ResolvedGroup {
  label: string;
  sub: string;
  routes: NavRoute[];
}

/** Resolve the group defs against NAV_IA, sweeping orphans into "More". */
function resolveGroups(): ResolvedGroup[] {
  const routes = NAV_IA.discover.routes;
  const claimed = new Set(GROUP_DEFS.flatMap((g) => g.paths));
  const groups: ResolvedGroup[] = GROUP_DEFS.map((g) => ({
    label: g.label,
    sub: g.sub,
    routes: g.paths
      .map((p) => routes.find((r) => r.path === p))
      .filter((r): r is NavRoute => Boolean(r)),
  }));
  const orphans = routes.filter((r) => !claimed.has(r.path));
  if (orphans.length > 0) {
    groups.push({ label: "More", sub: "Everything else in the pantry", routes: orphans });
  }
  return groups;
}

/* ── Live elemental brief ─────────────────────────────────────────────────── */

interface ElementRow {
  key: "Fire" | "Water" | "Earth" | "Air";
  label: string;
  glyph: GlyphName;
  color: string;
}

// Classic alchemical triangles: Fire △, Water ▽, Earth ▽̶, Air △̶.
const ELEMENT_ROWS: readonly ElementRow[] = [
  { key: "Fire", label: "Fire", glyph: "triangle-up", color: "var(--el-fire)" },
  { key: "Water", label: "Water", glyph: "triangle-down", color: "var(--el-water)" },
  { key: "Earth", label: "Earth", glyph: "triangle-down-bar", color: "var(--el-earth)" },
  { key: "Air", label: "Air", glyph: "triangle-up-bar", color: "var(--el-air)" },
];

function ElementalBrief(): JSX.Element {
  const el = useElementalState();

  // Fire/Water/Earth/Air are genuine numeric fields; derive the dominant
  // locally rather than trusting the hook's cast-on `dominant` field.
  const { values, dominant } = useMemo(() => {
    const v: Record<ElementRow["key"], number> = {
      Fire: typeof el.Fire === "number" ? el.Fire : 0.25,
      Water: typeof el.Water === "number" ? el.Water : 0.25,
      Earth: typeof el.Earth === "number" ? el.Earth : 0.25,
      Air: typeof el.Air === "number" ? el.Air : 0.25,
    };
    const dom = (Object.entries(v) as Array<[ElementRow["key"], number]>).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
    )[0];
    return { values: v, dominant: dom };
  }, [el.Fire, el.Water, el.Earth, el.Air]);

  const domRow = ELEMENT_ROWS.find((r) => r.key === dominant) ?? ELEMENT_ROWS[0];

  return (
    <section
      className="alchm-panel-glow discover-brief"
      aria-label="Tonight's elemental brief"
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        <Glyph name="atom" size={170} stroke={0.6} style={{ color: "var(--accent)" }} />
      </div>

      <div style={{ position: "relative" }}>
        <div className="t-tag" style={{ color: "var(--accent-2)", marginBottom: 10 }}>
          TONIGHT&apos;S ELEMENTAL BRIEF · LIVE SKY
        </div>

        <div className="discover-brief-head">
          <div>
            <div
              className="t-display"
              style={{ fontSize: 26, color: "var(--fg)", lineHeight: 1.15 }}
            >
              The sky leans{" "}
              <span style={{ color: domRow.color }}>{domRow.label.toLowerCase()}</span>
            </div>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "var(--fg-dim)",
                lineHeight: 1.55,
                maxWidth: 460,
              }}
            >
              Live elemental match across 2,901 ingredients and 184 cuisines. Everything
              below is filtered and ranked to this moment.
            </p>
          </div>
          <div
            className="discover-brief-dom"
            style={{
              background: `radial-gradient(circle at 32% 28%, ${domRow.color}, color-mix(in oklch, ${domRow.color}, black 55%))`,
            }}
            aria-hidden="true"
          >
            <Glyph name={domRow.glyph} size={26} stroke={1.3} style={{ color: "rgba(0,0,0,0.72)" }} />
          </div>
        </div>

        <div className="discover-bars">
          {ELEMENT_ROWS.map((row) => {
            const pct = Math.round((values[row.key] ?? 0) * 100);
            return (
              <div key={row.key} className="discover-bar">
                <div className="discover-bar-top">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <Glyph name={row.glyph} size={13} stroke={1.4} style={{ color: row.color }} />
                    <span
                      className="t-mono"
                      style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--fg-dim)" }}
                    >
                      {row.label.toUpperCase()}
                    </span>
                  </span>
                  <span
                    className="t-num"
                    style={{ fontSize: 12, color: row.key === dominant ? "var(--fg)" : "var(--fg-mute)" }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="discover-bar-track">
                  <div
                    className="discover-bar-fill"
                    style={{ width: `${pct}%`, background: row.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Route card ───────────────────────────────────────────────────────────── */

function DiscoverCard({ route }: { route: NavRoute }): JSX.Element {
  return (
    <Link href={route.path} className="discover-card">
      <span className="discover-card-glyph">
        <Glyph name={route.glyph} size={18} stroke={1.4} />
      </span>
      <span className="discover-card-body">
        <span className="discover-card-label-row">
          <span className="discover-card-label">{route.label}</span>
          {route.premium && <span className="discover-card-premium">PREMIUM</span>}
        </span>
        <span className="discover-card-hint t-mono">{route.hint.toUpperCase()}</span>
      </span>
      <Glyph
        name="arrow"
        size={14}
        stroke={1.4}
        className="discover-card-arrow"
      />
    </Link>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function DiscoverPage(): JSX.Element {
  const groups = useMemo(resolveGroups, []);
  const totalRoutes = NAV_IA.discover.routes.length;

  return (
    <div className="lab discover-root">
      <style>{`
        .discover-root { min-height: calc(100vh - 64px); }
        .discover-wrap {
          max-width: 1080px;
          margin: 0 auto;
          padding: 44px 20px 88px;
        }
        @media (min-width: 768px) {
          .discover-wrap { padding: 64px 28px 96px; }
        }
        .discover-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 9px;
          color: var(--accent); margin-bottom: 18px;
        }
        .discover-hero-title {
          font-family: var(--f-display);
          font-weight: 500;
          letter-spacing: -0.01em;
          font-size: clamp(38px, 6vw, 60px);
          line-height: 1.02;
          color: var(--fg);
          margin: 0;
        }
        .discover-hero-sub {
          margin: 16px 0 0;
          font-size: clamp(15px, 2vw, 17px);
          line-height: 1.6;
          color: var(--fg-dim);
          max-width: 620px;
        }

        .discover-brief {
          margin-top: 36px;
          padding: 24px 26px;
          position: relative;
          overflow: hidden;
        }
        .discover-brief-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 20px; margin-bottom: 22px;
        }
        .discover-brief-dom {
          flex-shrink: 0;
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .discover-bars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 560px) {
          .discover-bars { grid-template-columns: repeat(2, 1fr); gap: 16px 18px; }
          .discover-brief-dom { width: 48px; height: 48px; }
        }
        .discover-bar-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .discover-bar-track {
          height: 6px; border-radius: 999px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .discover-bar-fill {
          height: 100%; border-radius: 999px;
          transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .discover-section { margin-top: 48px; }
        .discover-section-head {
          display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px;
        }
        .discover-section-rule {
          flex: 1; height: 1px; background: var(--line);
        }
        .discover-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
          gap: 12px;
        }

        .discover-card {
          display: grid;
          grid-template-columns: 44px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 16px 18px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005));
          border: 1px solid var(--line);
          color: inherit;
          text-decoration: none;
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .discover-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--line-hi);
          transform: translateY(-2px);
        }
        .discover-card-glyph {
          width: 44px; height: 44px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--line);
          color: var(--fg-dim);
          transition: color 160ms ease, border-color 160ms ease;
        }
        .discover-card:hover .discover-card-glyph {
          color: var(--accent);
          border-color: color-mix(in oklch, var(--accent), transparent 55%);
        }
        .discover-card-body { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .discover-card-label-row { display: flex; align-items: center; gap: 8px; }
        .discover-card-label {
          font-family: var(--f-body); font-size: 15px; color: var(--fg);
        }
        .discover-card-premium {
          font-family: var(--f-mono); font-size: 8.5px; letter-spacing: 0.16em;
          color: var(--accent-2);
          border: 1px solid color-mix(in oklch, var(--accent-2), transparent 60%);
          padding: 1px 5px; border-radius: 3px;
        }
        .discover-card-hint {
          font-size: 9px; letter-spacing: 0.12em; color: var(--fg-mute);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .discover-card-arrow {
          color: var(--fg-faint);
          transition: color 160ms ease, transform 160ms ease;
        }
        .discover-card:hover .discover-card-arrow {
          color: var(--accent); transform: translateX(3px);
        }
      `}</style>

      <div className="discover-wrap">
        {/* HERO */}
        <header>
          <span className="discover-hero-eyebrow t-tag">
            <Glyph name="atom" size={14} stroke={1.4} />
            DISCOVER · THE COSMIC PANTRY
          </span>
          <h1 className="discover-hero-title">Browse the cosmic pantry</h1>
          <p className="discover-hero-sub">
            Every cuisine, ingredient, method, sauce, and recipe in the kitchen — each one
            scored against the current planetary hour. Start anywhere; the sky does the ranking.
          </p>
        </header>

        {/* LIVE BRIEF */}
        <ElementalBrief />

        {/* GROUPS */}
        {groups.map((group) => (
          <section
            key={group.label}
            className="discover-section"
            aria-label={group.label}
          >
            <div className="discover-section-head">
              <span className="t-tag" style={{ color: "var(--accent)" }}>
                {group.label.toUpperCase()}
              </span>
              <span style={{ fontSize: 12, color: "var(--fg-mute)" }}>{group.sub}</span>
              <span className="discover-section-rule" />
              <span
                className="t-mono"
                style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
              >
                {group.routes.length} OF {totalRoutes}
              </span>
            </div>
            <div className="discover-grid">
              {group.routes.map((route) => (
                <DiscoverCard key={route.path} route={route} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
