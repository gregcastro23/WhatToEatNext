"use client";

import Link from "next/link";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { NAV_IA, PRIMARY_KEYS } from "@/config/navigation";
import { Logo } from "./Logo";
import type { JSX } from "react";

/**
 * Footer that reads the same canonical NAV_IA as the header. Header and
 * footer can never drift again.
 */
export function RedesignedFooter(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        padding: "36px 24px 26px",
        borderTop: "1px solid var(--line)",
        background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.3))",
        color: "var(--fg)",
        marginTop: 40,
      }}
    >
      <style>{`
        .alchm-footer-grid {
          max-width: 1280px; margin: 0 auto;
          display: grid; gap: 28px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) { .alchm-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px) { .alchm-footer-grid { grid-template-columns: 1.4fr repeat(5, 1fr) 1.2fr; } }
        .alchm-footer-link {
          font-family: var(--f-mono); font-size: 11px;
          color: var(--fg-mute); letter-spacing: 0.06em;
          text-decoration: none;
        }
        .alchm-footer-link:hover { color: var(--fg-dim); }
        .alchm-footer-link[data-primary="true"] { color: var(--fg-dim); }
      `}</style>

      <div className="alchm-footer-grid">
        <div>
          <Logo size={20} />
          <p
            style={{
              fontSize: 11,
              color: "var(--fg-mute)",
              lineHeight: 1.6,
              margin: "12px 0 16px",
              maxWidth: 240,
            }}
          >
            What you eat next, calibrated to your standing chart and the live sky.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              className="alchm-chip"
              style={{ padding: "3px 8px", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                className="el-dot"
                style={{
                  width: 6,
                  height: 6,
                  background: "oklch(0.74 0.11 130)",
                  boxShadow: "0 0 6px oklch(0.74 0.11 130)",
                }}
              />
              POSTGRES · OK
            </span>
            <span
              className="alchm-chip"
              style={{ padding: "3px 8px", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                className="el-dot"
                style={{
                  width: 6,
                  height: 6,
                  background: "oklch(0.74 0.11 130)",
                  boxShadow: "0 0 6px oklch(0.74 0.11 130)",
                }}
              />
              EDGE · OK
            </span>
          </div>
        </div>

        {PRIMARY_KEYS.map((k) => {
          const m = NAV_IA[k];
          return (
            <div key={k}>
              <div
                className="t-tag"
                style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Glyph name={m.glyph} size={11} stroke={1.4} style={{ color: "var(--accent)" }} />
                {m.label.toUpperCase()}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <li>
                  <Link href={m.path} className="alchm-footer-link" data-primary="true">
                    {m.label}
                  </Link>
                </li>
                {m.routes.slice(0, 4).map((r) =>
                  r.external ? (
                    <li key={r.path}>
                      <a
                        href={r.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="alchm-footer-link"
                      >
                        {r.label}
                      </a>
                    </li>
                  ) : (
                    <li key={r.path}>
                      <Link href={r.path} className="alchm-footer-link">
                        {r.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          );
        })}

        <div>
          <div className="t-tag" style={{ marginBottom: 12 }}>LEGAL & STATUS</div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <li>
              <Link href="/terms" className="alchm-footer-link">Terms</Link>
            </li>
            <li>
              <Link href="/privacy" className="alchm-footer-link">Privacy</Link>
            </li>
            <li>
              <Link href="/profile/security" className="alchm-footer-link">Account & sessions</Link>
            </li>
            <li>
              <Link href="/premium" className="alchm-footer-link">Premium</Link>
            </li>
          </ul>
          <div
            className="t-mono"
            style={{
              marginTop: 18,
              fontSize: 9,
              color: "var(--fg-faint)",
              letterSpacing: "0.14em",
              lineHeight: 1.8,
            }}
          >
            VSOP87 · IAU 2006 · DE440
            <br />© {year} ALCHM KITCHEN
          </div>
        </div>
      </div>
    </footer>
  );
}

export default RedesignedFooter;
