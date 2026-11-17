"use client";

import Link from "next/link";
import { useState, type JSX } from "react";
import { submitViewFeedback } from "@/components/analytics/PageViewTracker";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { NAV_IA, PRIMARY_KEYS } from "@/config/navigation";
import { Logo } from "./Logo";

function QuickFeedbackTrigger(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (note.trim().length < 2 || status === "sending") return;
    setStatus("sending");
    const ok = await submitViewFeedback({ note, rating });
    setStatus(ok ? "sent" : "idle");
    if (ok) {
      setNote("");
      window.setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1500);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="alchm-footer-link"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          💬 Share Note / Report Issue
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            handleSubmit(e).catch(() => undefined);
          }}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--line-hi)",
            borderRadius: 8,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxWidth: 240,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>
              SESSION FEEDBACK
            </span>
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: star <= rating ? "#fbbf24" : "var(--fg-faint)",
                    padding: 0,
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What worked well or felt off on this view?"
            rows={2}
            maxLength={500}
            style={{
              width: "100%",
              fontSize: 11,
              background: "rgba(0,0,0,0.4)",
              color: "var(--fg)",
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: "6px 8px",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="alchm-footer-link"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status !== "idle" || note.trim().length < 2}
              className="alchm-footer-link"
              style={{
                background: "var(--accent)",
                color: "#0A0712",
                border: "none",
                borderRadius: 5,
                padding: "4px 10px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              {status === "sent" ? "✓ Sent!" : status === "sending" ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const FOOTER_STYLES = `
  .alchm-footer-grid { max-width: 1280px; margin: 0 auto; display: grid; gap: 28px; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .alchm-footer-grid { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 900px) { .alchm-footer-grid { grid-template-columns: 1.4fr repeat(5, 1fr) 1.2fr; } }
  .alchm-footer-link { font-family: var(--f-mono); font-size: 11px; color: var(--fg-mute); letter-spacing: 0.06em; text-decoration: none; }
  .alchm-footer-link:hover { color: var(--fg-dim); }
  .alchm-footer-link[data-primary="true"] { color: var(--fg-dim); }
`;

function FooterNavColumn({ navKey }: { navKey: (typeof PRIMARY_KEYS)[number] }): JSX.Element {
  const m = NAV_IA[navKey];
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <Glyph name={m.glyph} size={11} stroke={1.4} style={{ color: "var(--accent)" }} />
        {m.label.toUpperCase()}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <li><Link href={m.path} className="alchm-footer-link" data-primary="true">{m.label}</Link></li>
        {m.routes.slice(0, 4).map((r) => (
          <li key={r.path}>
            {r.external ? (
              <a href={r.path} target="_blank" rel="noopener noreferrer" className="alchm-footer-link">{r.label}</a>
            ) : (
              <Link href={r.path} className="alchm-footer-link">{r.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Footer that reads the same canonical NAV_IA as the header. Header and
 * footer can never drift again.
 */
export function RedesignedFooter(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer style={{ padding: "36px 24px 26px", borderTop: "1px solid var(--line)", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.3))", color: "var(--fg)", marginTop: 40 }}>
      <style>{FOOTER_STYLES}</style>
      <div className="alchm-footer-grid">
        <div>
          <Logo size={20} />
          <p style={{ fontSize: 11, color: "var(--fg-mute)", lineHeight: 1.6, margin: "12px 0 16px", maxWidth: 240 }}>
            What you eat next, calibrated to your standing chart and the live sky.
          </p>
          <QuickFeedbackTrigger />
        </div>
        {PRIMARY_KEYS.map((k) => <FooterNavColumn key={k} navKey={k} />)}
        <div>
          <div className="t-tag" style={{ marginBottom: 12 }}>LEGAL & STATUS</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <li><Link href="/terms" className="alchm-footer-link">Terms</Link></li>
            <li><Link href="/privacy" className="alchm-footer-link">Privacy</Link></li>
            <li><Link href="/profile/security" className="alchm-footer-link">Account & sessions</Link></li>
            <li><Link href="/vault" className="alchm-footer-link">ESMS Vault</Link></li>
          </ul>
          <div className="t-mono" style={{ marginTop: 18, fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.14em", lineHeight: 1.8 }}>
            VSOP87 · IAU 2006 · DE440<br />© {year} ALCHM KITCHEN
          </div>
        </div>
      </div>
    </footer>
  );
}

export default RedesignedFooter;
