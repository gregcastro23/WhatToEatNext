import Link from "next/link";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { CelestialHeaderClock } from "./CelestialHeaderClock";
import { Logo } from "./Logo";
import type { JSX } from "react";

export type LabHeaderNavId =
  | "kitchen"
  | "ingredients"
  | "cuisines"
  | "saved"
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
  { id: "saved", label: "Cabinet", href: "/profile" },
  { id: "lab", label: "Lab", href: "/planetary-chart" },
];

export function LabHeader({
  active = "kitchen",
  showSearch = true,
  user,
}: LabHeaderProps): JSX.Element {
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
        .alchm-labheader { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
        .alchm-labheader > .alchm-labheader-left { flex: 1 1 auto; min-width: 0; }
        .alchm-labheader > nav { display: none; }
        .alchm-labheader > .alchm-labheader-right { display: none; }
        @media (min-width: 900px) {
          .alchm-labheader { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; padding: 14px 28px; }
          .alchm-labheader > nav { display: flex; }
          .alchm-labheader > .alchm-labheader-right { display: flex; }
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

      <nav
        style={{
          gap: 4,
          padding: 4,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid var(--line)",
          borderRadius: 999,
        }}
        aria-label="Primary"
      >
        {NAV.map((n) => {
          const isActive = n.id === active;
          return (
            <Link
              key={n.id}
              href={n.href}
              className="t-mono"
              style={{
                padding: "6px 14px",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: isActive ? "var(--fg)" : "var(--fg-mute)",
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

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
