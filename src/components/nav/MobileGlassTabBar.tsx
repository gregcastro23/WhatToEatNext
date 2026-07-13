"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { type JSX } from "react";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import { activePrimaryFromPathname } from "@/config/navigation";

interface Tab {
  id: string;
  label: string;
  icon: GlyphName;
  href: string;
  matchKey: "kitchen" | "discover" | "plan" | "commensal" | "lab";
}

// 5 tabs per design-spec §2.11. The center quick-action FAB is removed — its
// actions remain reachable (recipe-builder/pantry under Plan, the palette via
// the header ⌘K, and inviting people is now the Tables tab itself). Tables
// keeps the internal `commensal` matchKey (navigation.ts relabels the
// section). Tables uses `orbital` (not `ring`, which Profile already claims) —
// the orbital-ring motif the design spec uses for Tables elsewhere in this
// program — so no two of the 5 tabs render the same icon.
const TABS: readonly Tab[] = [
  { id: "kitchen", label: "Kitchen", icon: "flask", href: "/", matchKey: "kitchen" },
  { id: "discover", label: "Discover", icon: "atom", href: "/discover", matchKey: "discover" },
  { id: "plan", label: "Plan", icon: "diamond", href: "/menu-planner", matchKey: "plan" },
  { id: "tables", label: "Tables", icon: "orbital", href: "/tables", matchKey: "commensal" },
  { id: "profile", label: "Profile", icon: "ring", href: "/profile", matchKey: "lab" },
] as const;

/**
 * Mobile-only bottom tab bar (design-spec §2.11). Five equal tabs; the active
 * tab's icon sits in a copper-ringed white-alpha pill with a soft amber glow.
 * Mounted by the root layout below 900px.
 */
export function MobileGlassTabBar(): JSX.Element {
  const pathname = usePathname();
  const { status } = useSession();
  const active = activePrimaryFromPathname(pathname);

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
            const isActive = t.matchKey === active;
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
