"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { type JSX } from "react";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";

interface Tab {
  id: string;
  label: string;
  icon: GlyphName;
  href: string;
  /**
   * Path prefixes that light this tab. Matched longest-first across all tabs,
   * so a tab can claim a sub-tree without stealing a sibling's more specific
   * route. `/` is exact-only — otherwise Kitchen would swallow every path.
   */
  match: readonly string[];
}

// 5 tabs per design-spec §2.11. Discover and Tables previously held two of the
// five slots, but both are cold-start social surfaces — /discover greets a new
// visitor with "No tables match yet". That spent 40% of the persistent mobile
// nav on empty states while the actual library (2,901 ingredients, 184
// cuisines, the method catalog) was reachable only via homepage tiles or the
// footer. Those two slots now point straight at the library.
//
// Tables and Discover remain reachable from the Kitchen tile grid, the footer,
// and the header mega-menu on ≥900px.
//
// Active state is resolved by path prefix rather than by
// activePrimaryFromPathname: Cuisines and Ingredients both live under that
// helper's "discover" key, so keying off it would light two tabs at once.
//
// All 5 icons must stay visually distinct (regression-guarded below) — Profile
// uses `user` so Cuisines can take `ring`, matching navigation.ts.
const TABS: readonly Tab[] = [
  { id: "kitchen", label: "Kitchen", icon: "flask", href: "/", match: ["/"] },
  {
    id: "cuisines",
    label: "Cuisines",
    icon: "ring",
    href: "/cuisines",
    match: ["/cuisines", "/recipes", "/restaurants"],
  },
  {
    id: "ingredients",
    label: "Ingredients",
    icon: "diamond",
    href: "/ingredients",
    match: ["/ingredients", "/sauces", "/cooking-methods"],
  },
  {
    id: "plan",
    label: "Plan",
    icon: "mortar",
    href: "/menu-planner",
    match: ["/menu-planner", "/meal-plan", "/pantry", "/grocery-cart", "/food-tracking"],
  },
  { id: "profile", label: "Profile", icon: "user", href: "/profile", match: ["/profile"] },
] as const;

/**
 * Resolve which tab owns a pathname, longest matching prefix wins. Returns
 * null when nothing matches (e.g. /discover, /tables, /lab) so no tab shows a
 * false active state for a route that is not in the bar.
 */
export function activeTabId(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  if (pathname === "/") return "kitchen";

  let best: { id: string; len: number } | null = null;
  for (const tab of TABS) {
    for (const prefix of tab.match) {
      if (prefix === "/") continue; // exact-match only, handled above
      const matches = pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (matches && (!best || prefix.length > best.len)) {
        best = { id: tab.id, len: prefix.length };
      }
    }
  }
  return best?.id ?? null;
}

/**
 * Mobile-only bottom tab bar (design-spec §2.11). Five equal tabs; the active
 * tab's icon sits in a copper-ringed white-alpha pill with a soft amber glow.
 * Mounted by the root layout below 900px.
 */
export function MobileGlassTabBar(): JSX.Element {
  const pathname = usePathname();
  const { status } = useSession();
  const active = activeTabId(pathname);

  return (
    <>
      <style>{`
        .alchm-mobile-tabbar { display: flex; }
        @media (min-width: 900px) {
          .alchm-mobile-tabbar { display: none; }
        }
      `}</style>

      <nav
        className="alchm-mobile-tabbar"
        aria-label="Primary navigation"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 65,
          padding: "8px 14px max(22px, env(safe-area-inset-bottom))",
          background:
            "linear-gradient(180deg, rgba(7,6,11,0.4), rgba(7,6,11,0.92))",
          backdropFilter: "blur(18px)",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            gap: 0,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {TABS.map((t) => {
            const isActive = t.id === active;
            // Profile routes unauthenticated users to sign-in.
            const href =
              t.id === "profile" && status !== "authenticated" ? "/login" : t.href;
            return (
              <Link
                key={t.id}
                href={href}
                prefetch={t.id === "profile" ? false : undefined}
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 0",
                  minHeight: 50,
                  color: isActive ? "var(--accent)" : "var(--fg-mute)",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    border: isActive
                      ? "1px solid color-mix(in oklch, var(--accent), transparent 45%)"
                      : "1px solid transparent",
                    boxShadow: isActive
                      ? "0 0 14px color-mix(in oklch, var(--accent), transparent 55%)"
                      : "none",
                    transition:
                      "background 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
                  }}
                >
                  <Glyph name={t.icon} size={18} stroke={isActive ? 1.7 : 1.2} />
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default MobileGlassTabBar;
