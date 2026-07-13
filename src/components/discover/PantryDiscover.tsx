"use client";

import Link from "next/link";
import { useMemo, type JSX } from "react";
import { ElementalSignature } from "@/components/ui/alchm/ElementalSignature";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import { NAV_IA, type NavRoute } from "@/config/navigation";
import { useElementalState } from "@/hooks/useElementalState";
import { elementalSignature } from "@/utils/elemental/signature";

/**
 * PantryDiscover — the original "Browse the cosmic pantry" launchpad, extracted
 * VERBATIM from src/app/discover/page.tsx so the new tabbed Discover shell
 * (PR 6 §4) can host it under the [Pantry] segment without changing its
 * behavior or any existing deep links.
 *
 * @file src/components/discover/PantryDiscover.tsx
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

  // Fire/Water/Earth/Air are genuine numeric fields; route them through the
  // canonical signature so the lean — and its tie-breaks — reads identically
  // here and on every other surface (a tied sky now reads "leans water & earth"
  // instead of silently picking one element).
  const sig = useMemo(
    () =>
      elementalSignature({
        Fire: typeof el.Fire === "number" ? el.Fire : 0.25,
        Water: typeof el.Water === "number" ? el.Water : 0.25,
        Earth: typeof el.Earth === "number" ? el.Earth : 0.25,
        Air: typeof el.Air === "number" ? el.Air : 0.25,
      }),
    [el.Fire, el.Water, el.Earth, el.Air],
  );

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

        <ElementalSignature
          variant="full"
          signature={sig}
          style={{ marginBottom: 22 }}
          description={
            <>
              Live elemental match across 2,901 ingredients and 184 cuisines. Everything
              below is filtered and ranked to this moment.
            </>
          }
        />

        <div className="discover-bars">
          {ELEMENT_ROWS.map((row) => {
            const pct = Math.round((sig.values[row.key] ?? 0) * 100);
            const named = sig.coDominant.includes(row.key);
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
                    style={{ fontSize: 12, color: named ? "var(--fg)" : "var(--fg-mute)" }}
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

/* ── Pantry launchpad ─────────────────────────────────────────────────────── */

export function PantryDiscover(): JSX.Element {
  const groups = useMemo(resolveGroups, []);
  const totalRoutes = NAV_IA.discover.routes.length;

  return (
    <div className="discover-root">
      <style>{`
        .discover-wrap {
          max-width: 1080px;
          margin: 0 auto;
          /* Reduced top padding vs. the pre-PR6 standalone page (was 44px/64px)
             since this now sits below the shared Tables/People/Pantry segmented
             control rather than at the very top of the viewport. */
          padding: 20px 20px 88px;
        }
        @media (min-width: 768px) {
          .discover-wrap { padding: 28px 28px 96px; }
        }
        .discover-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 9px;
          color: var(--accent); margin-bottom: 18px;
        }
        .discover-hero-title {
          font-family: var(--f-display);
          font-weight: 500;
          letter-spacing: -0.01em;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.03;
          color: var(--fg);
          margin: 0;
        }
        .discover-hero-sub {
          margin: 14px 0 0;
          font-size: clamp(15px, 2vw, 17px);
          line-height: 1.6;
          color: var(--fg-dim);
          max-width: 620px;
        }
        .discover-brief {
          margin-top: 32px;
          padding: 24px 26px;
          position: relative;
          overflow: hidden;
        }
        .discover-bars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 560px) {
          .discover-bars { grid-template-columns: repeat(2, 1fr); gap: 16px 18px; }
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
        {/* HERO — the pantry launchpad's original header (PR 6 adversarial-review
            finding 5: this must render whenever ?tab=pantry is active, not the
            shell's "Find your table" copy which is Tables/People-specific). */}
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

export default PantryDiscover;
