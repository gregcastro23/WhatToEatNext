"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { CelestialHeaderClock } from "./CelestialHeaderClock";
import { Logo } from "./Logo";
import type { JSX } from "react";

export type LabHeaderNavId =
  | "kitchen"
  | "ingredients"
  | "cuisines"
  | "cooking-methods"
  | "pantry"
  | "meal-plan"
  | "recipes"
  | "profile"
  | "lab";

export interface LabHeaderProps {
  active?: LabHeaderNavId;
  showSearch?: boolean;
  user?: { name: string; id: string };
}

const NAV: Array<{ id: LabHeaderNavId; label: string; href: string }> = [
  { id: "kitchen", label: "Kitchen", href: "/" },
  { id: "ingredients", label: "Ingredients", href: "/ingredients" },
  { id: "cuisines", label: "Cuisines", href: "/cuisines" },
  { id: "cooking-methods", label: "Methods", href: "/cooking-methods" },
  { id: "pantry", label: "Pantry", href: "/pantry" },
  { id: "meal-plan", label: "Meal Plan", href: "/meal-plan" },
  { id: "recipes", label: "Recipes", href: "/recipes" },
  { id: "profile", label: "Profile", href: "/profile" },
  { id: "lab", label: "Lab", href: "/lab" },
];

function activeFromPathname(pathname: string | null): LabHeaderNavId {
  if (!pathname || pathname === "/") return "kitchen";
  if (pathname.startsWith("/ingredients")) return "ingredients";
  if (pathname.startsWith("/cuisines")) return "cuisines";
  if (pathname.startsWith("/cooking-methods")) return "cooking-methods";
  if (pathname.startsWith("/pantry")) return "pantry";
  if (pathname.startsWith("/meal-plan")) return "meal-plan";
  if (
    pathname.startsWith("/recipes") ||
    pathname.startsWith("/recipe-generator") ||
    pathname.startsWith("/cosmic-recipe")
  )
    return "recipes";
  if (pathname.startsWith("/profile")) return "profile";
  if (
    pathname.startsWith("/lab") ||
    pathname.startsWith("/planetary-chart") ||
    pathname.startsWith("/birth-chart") ||
    pathname.startsWith("/current-chart")
  )
    return "lab";
  return "kitchen";
}

export function LabHeader({
  active,
  showSearch = true,
  user,
}: LabHeaderProps): JSX.Element {
  const pathname = usePathname();
  const resolvedActive = active ?? activeFromPathname(pathname);
  return (
    <header
      data-alchm-header="true"
      className="alchm-labheader"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "blur(14px)",
        background: "color-mix(in oklch, var(--bg), transparent 25%)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <style>{`
        .alchm-labheader {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
        }
        .alchm-labheader > .alchm-labheader-left { flex-shrink: 0; }
        .alchm-labheader > .alchm-labheader-nav-wrap {
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          min-width: 0;
        }
        .alchm-labheader > .alchm-labheader-nav-wrap::-webkit-scrollbar { display: none; }
        .alchm-labheader > .alchm-labheader-right { display: none; }
        @media (min-width: 1100px) {
          .alchm-labheader {
            grid-template-columns: auto 1fr auto;
            padding: 14px 28px;
            gap: 20px;
          }
          .alchm-labheader > .alchm-labheader-nav-wrap { display: flex; justify-content: center; overflow: visible; }
          .alchm-labheader > .alchm-labheader-right { display: flex; }
        }
        .alchm-labheader-nav-pill {
          display: inline-flex;
          gap: 2px;
          padding: 3px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--line);
          border-radius: 999px;
          white-space: nowrap;
          width: max-content;
        }
        .alchm-labheader-nav-link {
          padding: 5px 11px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-mute);
          border-radius: 999px;
          text-decoration: none;
          display: inline-block;
        }
        .alchm-labheader-nav-link[data-active="true"] {
          color: var(--fg);
          background: rgba(255,255,255,0.06);
        }
      `}</style>
      <div
        className="alchm-labheader-left"
        style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}
      >
        <Logo />
        <div
          className="alchm-rule"
          style={{ width: 20, transform: "rotate(90deg)", flexShrink: 0 }}
        />
        <CelestialHeaderClock />
      </div>

      <div className="alchm-labheader-nav-wrap">
        <nav className="alchm-labheader-nav-pill" aria-label="Primary">
          {NAV.map((n) => {
            const isActive = n.id === resolvedActive;
            return (
              <Link
                key={n.id}
                href={n.href}
                className="t-mono alchm-labheader-nav-link"
                data-active={isActive}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="alchm-labheader-right"
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 14,
        }}
      >
        {showSearch && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              minWidth: 220,
            }}
          >
            <Glyph
              name="search"
              size={14}
              stroke={1.4}
              style={{ color: "var(--fg-mute)" }}
            />
            <span style={{ fontSize: 12, color: "var(--fg-mute)" }}>
              Search ingredients, recipes…
            </span>
            <span
              className="t-mono"
              style={{
                marginLeft: "auto",
                fontSize: 9,
                color: "var(--fg-faint)",
                padding: "2px 5px",
                border: "1px solid var(--line)",
                borderRadius: 4,
              }}
            >
              ⌘K
            </span>
          </div>
        )}
        {user && (
          <div
            className="t-mono"
            style={{
              fontSize: 10,
              color: "var(--fg-mute)",
              textAlign: "right",
              lineHeight: 1.3,
            }}
          >
            <div style={{ color: "var(--fg)" }}>{user.name}</div>
            <div>{user.id}</div>
          </div>
        )}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            border: "1px solid var(--line-hi)",
          }}
        />
      </div>
    </header>
  );
}

export default LabHeader;
