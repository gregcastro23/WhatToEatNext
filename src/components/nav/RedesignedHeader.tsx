"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type JSX } from "react";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { PlanetaryChip } from "@/components/ui/alchm/PlanetaryChip";
import {
  NAV_IA,
  PRIMARY_KEYS,
  activePrimaryFromPathname,
  type NavRoute,
  type PrimaryKey,
} from "@/config/navigation";
import { Logo } from "./Logo";

const NotificationBell = dynamic(() => import("./NotificationBell"), { ssr: false });
const GroceryCartButton = dynamic(
  () =>
    import("@/components/grocery-cart/GroceryCartButton").then(
      (m) => m.GroceryCartButton,
    ),
  { ssr: false },
);

const FEATURED_TILE: Record<PrimaryKey, {
  tag: string;
  title: string;
  sub: string;
  cta: string;
  glyph: "atom" | "mortar" | "ring" | "orbital" | "flask";
  href: string;
}> = {
  kitchen: {
    tag: "TONIGHT · CALIBRATED",
    title: "Your kitchen, calibrated",
    sub: "Open the kitchen to see tonight's resonances at a glance.",
    cta: "Open kitchen",
    glyph: "flask",
    href: "/",
  },
  discover: {
    tag: "FEATURED · LIVE SKY",
    title: "Tonight's elemental brief",
    sub: "Live elemental match across 2,901 ingredients and 184 cuisines.",
    cta: "Open discover",
    glyph: "atom",
    href: "/discover",
  },
  plan: {
    tag: "STARTER · YOUR PANTRY",
    title: "Plan the week",
    sub: "Week-long menus tuned to your transits with pantry-aware shopping.",
    cta: "Open planner",
    glyph: "mortar",
    href: "/menu-planner",
  },
  commensal: {
    tag: "INVITES · LIVE FEED",
    title: "Cook with others",
    sub: "Harmonize the table — up to 12 guests, natal charts auto-merged.",
    cta: "Open commensal",
    glyph: "ring",
    href: "/commensal",
  },
  lab: {
    tag: "PREMIUM · PRACTITIONER",
    title: "Engine internals",
    sub: "Recommendation weights, planetary chart, standing chart, quantities.",
    cta: "Open lab",
    glyph: "orbital",
    href: "/lab",
  },
};

/**
 * Visual grouping for the mega-menu's left column. Routes not listed here
 * fall into a trailing "More" group, so adding a new entry to NAV_IA never
 * silently drops it from the panel.
 */
const MENU_GROUPS: Partial<
  Record<PrimaryKey, ReadonlyArray<{ label: string; paths: string[] }>>
> = {
  discover: [
    { label: "Browse", paths: ["/cuisines", "/ingredients", "/cooking-methods", "/sauces", "/restaurants"] },
    { label: "Cook", paths: ["/recipes", "/recipe-builder", "/recipe-generator"] },
  ],
  plan: [
    { label: "Calendar", paths: ["/menu-planner", "/cosmic-recipe"] },
    { label: "Day to day", paths: ["/pantry", "/grocery-cart", "/food-tracking"] },
  ],
  lab: [
    { label: "Engine", paths: ["/lab", "/quantities"] },
    { label: "Charts & Premium", paths: ["/planetary-chart", "/current-chart", "/birth-chart", "/premium"] },
  ],
};

export interface RedesignedHeaderProps {
  /** When provided, overrides the path-derived active key. */
  active?: PrimaryKey;
}

/**
 * The redesigned alchm.kitchen header: 5 primary nav slots, mega-menus,
 * a ⌘K trigger, the live planetary chip, notifications, and the user chip.
 *
 * Sticky and present on every route. NAV_IA is the single source of truth.
 */
export function RedesignedHeader({ active }: RedesignedHeaderProps = {}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const resolved = active ?? activePrimaryFromPathname(pathname);

  const [openMenu, setOpenMenu] = useState<PrimaryKey | "none">("none");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Generous 400ms delay so a slow cursor can bridge from the pill button to
  // the mega-menu without the panel snapping shut mid-transit. A taller hover
  // bridge (below) also catches the gap between trigger and panel.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu("none"), 400);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Close mega-menus on route change
  useEffect(() => {
    setOpenMenu("none");
  }, [pathname]);

  // Close on Escape, and close on mousedown outside the header. The previous
  // implementation used a full-viewport overlay div (z-30) for click-outside,
  // but it sat above the hover bridge (z-auto) and stole mouseenter events
  // during pill → menu transit, causing the menu to snap shut mid-hover.
  // A document listener gives us click-outside without any z-index footprint.
  useEffect(() => {
    if (openMenu === "none") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu("none");
    };
    const onDocMouseDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setOpenMenu("none");
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [openMenu]);

  const openPalette = () => window.dispatchEvent(new CustomEvent("alchm:palette:open"));

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? "G";
  const userName = session?.user?.name ?? "Guest";
  const userId =
    (session?.user as { id?: string } | undefined)?.id?.slice(0, 8).toUpperCase() ??
    "VISITOR";

  return (
    <div
      ref={rootRef}
      data-alchm-header="true"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(7,6,11,0.7)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line)",
        color: "var(--fg)",
      }}
    >
      <style>{`
        .alchm-header-grid {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          max-width: 1600px;
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .alchm-header-grid { padding: 12px 28px; gap: 24px; }
        }
        .alchm-pillnav {
          display: none;
          position: relative;
        }
        @media (min-width: 900px) {
          .alchm-pillnav { display: flex; justify-content: center; }
        }
        .alchm-pill {
          display: flex; gap: 6px; padding: 5px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--line);
          border-radius: 999px;
        }
        .alchm-pill-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px;
          font-family: var(--f-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--fg-mute);
          background: transparent;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          text-decoration: none;
          transition: background 160ms ease, color 160ms ease;
        }
        .alchm-pill-btn:hover { color: var(--fg); background: rgba(255,255,255,0.04); }
        .alchm-pill-btn[data-active="true"],
        .alchm-pill-btn[data-open="true"] {
          color: var(--fg);
          background: rgba(255,255,255,0.08);
        }
        .alchm-header-right { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
        .alchm-header-search {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 7px 10px 7px 12px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--line);
          border-radius: 8px;
          cursor: pointer;
          color: var(--fg-mute);
        }
        @media (min-width: 768px) {
          .alchm-header-search { display: inline-flex; }
        }
        .alchm-header-search:hover { background: rgba(255,255,255,0.04); }
        .alchm-header-search kbd {
          margin-left: 18px; font-family: var(--f-mono); font-size: 9px;
          color: var(--fg-faint); padding: 2px 6px;
          border: 1px solid var(--line); border-radius: 4px;
        }
        .alchm-header-userchip {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 4px 4px 10px;
          background: transparent;
          border: 1px solid var(--line);
          border-radius: 999px;
          cursor: pointer; color: inherit;
          text-decoration: none;
        }
        .alchm-header-userchip-text { display: none; text-align: right; line-height: 1.2; }
        @media (min-width: 1100px) {
          .alchm-header-userchip-text { display: block; }
        }
        .alchm-header-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--f-display); font-style: italic; font-size: 14px;
          color: var(--bg);
        }
        .alchm-header-planet { display: none; }
        @media (min-width: 1024px) {
          .alchm-header-planet { display: flex; }
        }
      `}</style>

      <div className="alchm-header-grid">
        {/* LEFT — logo + planetary chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={22} />
          <div className="alchm-header-planet">
            <div
              style={{
                width: 1,
                height: 22,
                background: "var(--line)",
                marginRight: 14,
              }}
            />
            <PlanetaryChip />
          </div>
        </div>

        {/* CENTER — primary nav pill (hidden on small screens) */}
        <nav className="alchm-pillnav" aria-label="Primary navigation">
          {/*
            Invisible hover bridge spanning the gap between the pill's bottom
            edge and the mega-menu top. Without it, the cursor exits the pill
            before reaching the panel and the close timer can fire mid-transit.
            Anchored to .alchm-pillnav (position: relative) and only rendered
            when a menu is open, so it never blocks header chrome interaction.
          */}
          {openMenu !== "none" && (
            <div
              aria-hidden="true"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                height: 32,
                pointerEvents: "auto",
              }}
            />
          )}
          <div className="alchm-pill" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
            {PRIMARY_KEYS.map((k) => {
              const section = NAV_IA[k];
              const isActive = k === resolved;
              const isOpen = k === openMenu;
              const hasMenu = section.routes.length > 0;

              const button = (
                <button
                  key={k}
                  type="button"
                  className="alchm-pill-btn"
                  data-active={isActive}
                  data-open={isOpen}
                  onMouseEnter={() => {
                    cancelClose();
                    if (hasMenu) setOpenMenu(k);
                    else setOpenMenu("none");
                  }}
                  onFocus={() => {
                    if (hasMenu) setOpenMenu(k);
                  }}
                  onClick={() => {
                    if (!hasMenu) {
                      router.push(section.path);
                      return;
                    }
                    setOpenMenu((curr) => (curr === k ? "none" : k));
                  }}
                  aria-expanded={hasMenu ? isOpen : undefined}
                  aria-haspopup={hasMenu ? "menu" : undefined}
                >
                  <Glyph name={section.glyph} size={13} stroke={1.4} />
                  {section.label}
                  {hasMenu && (
                    <Glyph
                      name="chevron"
                      size={9}
                      stroke={1.6}
                      style={{
                        transform: `rotate(${isOpen ? 90 : 0}deg)`,
                        transition: "transform 180ms ease",
                        opacity: 0.6,
                      }}
                    />
                  )}
                </button>
              );

              return hasMenu ? (
                button
              ) : (
                <Link
                  key={k}
                  href={section.path}
                  className="alchm-pill-btn"
                  data-active={isActive}
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMenu("none");
                  }}
                >
                  <Glyph name={section.glyph} size={13} stroke={1.4} />
                  {section.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* RIGHT — search trigger, notifications, user chip */}
        <div className="alchm-header-right">
          <button
            type="button"
            className="alchm-header-search"
            onClick={openPalette}
            aria-label="Open command palette"
          >
            <Glyph name="search" size={13} stroke={1.4} />
            <span style={{ fontSize: 12, fontFamily: "var(--f-body)" }}>
              Search · navigate · do
            </span>
            <kbd>⌘K</kbd>
          </button>

          {/* mobile-only search icon trigger */}
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid var(--line)",
              color: "var(--fg-mute)",
              cursor: "pointer",
            }}
            className="alchm-header-search-icon"
          >
            <Glyph name="search" size={16} stroke={1.4} />
            <style>{`
              @media (min-width: 768px) {
                .alchm-header-search-icon { display: none !important; }
              }
            `}</style>
          </button>

          <GroceryCartButton />
          {status === "authenticated" && <NotificationBell />}

          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="alchm-header-userchip"
              aria-label="Your account"
            >
              <div className="alchm-header-userchip-text">
                <div style={{ fontSize: 11, color: "var(--fg)" }}>{userName}</div>
                <div
                  className="t-mono"
                  style={{
                    fontSize: 9,
                    color: "var(--fg-mute)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {userId}
                </div>
              </div>
              <div className="alchm-header-avatar">{userInitial}</div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="alchm-pill-btn"
              style={{
                background: "color-mix(in oklch, var(--accent), transparent 70%)",
                border: "1px solid color-mix(in oklch, var(--accent), transparent 50%)",
                color: "var(--fg)",
              }}
            >
              <Glyph name="google" size={13} stroke={1.4} />
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* MEGA MENU — click-outside is handled by a document mousedown listener
          above, so no z-index-fighting overlay sits between the pill and the
          menu. The hover bridge inside .alchm-pillnav handles the hover gap. */}
      {openMenu !== "none" && (
        <MegaMenu
          menuKey={openMenu}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onSelect={() => setOpenMenu("none")}
        />
      )}
    </div>
  );
}

function MegaMenu({
  menuKey,
  onMouseEnter,
  onMouseLeave,
  onSelect,
}: {
  menuKey: PrimaryKey;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSelect: () => void;
}): JSX.Element | null {
  const m = NAV_IA[menuKey];
  if (!m || !m.routes.length) return null;
  const featured = FEATURED_TILE[menuKey];

  const groupDef = MENU_GROUPS[menuKey];
  const groups: Array<{ label: string | null; routes: NavRoute[] }> = (() => {
    if (!groupDef) return [{ label: null, routes: m.routes }];
    const claimed = new Set(groupDef.flatMap((g) => g.paths));
    const out: Array<{ label: string | null; routes: NavRoute[] }> = groupDef.map((g) => ({
      label: g.label,
      routes: g.paths
        .map((p) => m.routes.find((r) => r.path === p))
        .filter((r): r is NavRoute => Boolean(r)),
    }));
    const orphans = m.routes.filter((r) => !claimed.has(r.path));
    if (orphans.length > 0) out.push({ label: "More", routes: orphans });
    return out;
  })();

  const renderRoute = (r: NavRoute): JSX.Element => {
    const inner = (
      <>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--fg-dim)",
            flexShrink: 0,
          }}
        >
          <Glyph name={r.glyph} size={14} stroke={1.4} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--fg)" }}>
              {r.label}
            </span>
            {r.external && (
              <Glyph
                name="arrow"
                size={10}
                stroke={1.6}
                style={{ color: "var(--fg-faint)", transform: "rotate(-45deg)" }}
              />
            )}
            {r.premium && (
              <span
                className="t-mono"
                style={{
                  fontSize: 8.5,
                  color: "var(--accent-2)",
                  letterSpacing: "0.16em",
                  border: "1px solid color-mix(in oklch, var(--accent-2), transparent 60%)",
                  padding: "1px 5px",
                  borderRadius: 3,
                }}
              >
                PREMIUM
              </span>
            )}
          </div>
          <div
            className="t-mono"
            style={{
              fontSize: 9,
              color: "var(--fg-mute)",
              letterSpacing: "0.12em",
              marginTop: 2,
            }}
          >
            {r.hint.toUpperCase()}
          </div>
        </div>
        <Glyph
          name="arrow"
          size={12}
          stroke={1.4}
          style={{ color: "var(--fg-faint)", opacity: 0.5 }}
        />
      </>
    );

    const style: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "32px 1fr auto",
      gap: 12,
      alignItems: "center",
      padding: "12px 14px",
      borderRadius: 10,
      color: "inherit",
      textDecoration: "none",
      transition: "background 140ms ease",
    };

    const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
    };
    const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = "transparent";
    };

    return r.external ? (
      <a
        key={r.path}
        href={r.path}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        onClick={onSelect}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {inner}
      </a>
    ) : (
      <Link
        key={r.path}
        href={r.path}
        style={style}
        onClick={onSelect}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {inner}
      </Link>
    );
  };

  return (
    <div
      role="menu"
      tabIndex={-1}
      aria-label={`${m.label} navigation`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "100%",
        zIndex: 35,
        background: "rgba(10,7,18,0.96)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--line)",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "30px 32px",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 40,
        }}
      >
        {/* LEFT — grouped route list */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <Glyph name={m.glyph} size={18} stroke={1.2} style={{ color: "var(--accent)" }} />
            <span className="t-tag" style={{ color: "var(--accent)" }}>
              {m.label.toUpperCase()}
            </span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span
              className="t-mono"
              style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
            >
              {m.routes.length} ROUTES
            </span>
          </div>

          {groups.map((group, idx) => (
            <div
              key={group.label ?? `flat-${idx}`}
              style={{ marginBottom: idx === groups.length - 1 ? 0 : 26 }}
            >
              {group.label && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    margin: "0 0 10px",
                    paddingLeft: 4,
                  }}
                >
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 9.5,
                      color: "var(--accent-2)",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                    }}
                  >
                    {group.label}
                  </span>
                  <span
                    style={{ flex: 1, height: 1, background: "var(--line)", opacity: 0.5 }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 6,
                }}
              >
                {group.routes.map(renderRoute)}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — featured / contextual tile */}
        <Link
          href={featured.href}
          onClick={onSelect}
          className="alchm-panel-glow"
          style={{
            padding: 22,
            position: "relative",
            overflow: "hidden",
            color: "inherit",
            textDecoration: "none",
            display: "block",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              opacity: 0.25,
              pointerEvents: "none",
            }}
          >
            <Glyph
              name={featured.glyph}
              size={140}
              stroke={0.6}
              style={{ color: "var(--accent)" }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <div className="t-tag" style={{ marginBottom: 8, color: "var(--accent-2)" }}>
              {featured.tag}
            </div>
            <div
              className="t-display"
              style={{
                fontSize: 22,
                color: "var(--fg)",
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              {featured.title}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-dim)",
                lineHeight: 1.55,
                margin: "0 0 14px",
              }}
            >
              {featured.sub}
            </p>
            <span
              className="alchm-btn"
              style={{
                padding: "8px 14px",
                fontSize: 10,
                background:
                  "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 60%), color-mix(in oklch, var(--accent), transparent 80%))",
                borderColor: "color-mix(in oklch, var(--accent), transparent 40%)",
              }}
            >
              {featured.cta.toUpperCase()} <Glyph name="arrow" size={12} />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default RedesignedHeader;
