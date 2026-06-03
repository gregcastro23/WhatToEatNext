/**
 * Reusable email skeleton + building blocks for alchm.kitchen.
 *
 * One shared shell (preheader, header gradient, white body card, footer) so every
 * transactional / bulletin / notification email is visually consistent and new
 * emails don't re-duplicate the chrome. Compose an email from the component
 * helpers (heading, paragraph, button, card, feature row, elemental balance bars)
 * and pass the assembled `bodyHtml` to `renderEmailLayout`.
 *
 * All styles are INLINE — required for broad email-client compatibility. Layout
 * uses simple block elements + inline styles (matches the rest of our emails).
 *
 * @file src/lib/email/layout.ts
 */
import type { Element } from "@/types/celestial";

export const BRAND = {
  name: "alchm.kitchen",
  legal: "Cooking With Castro LLC",
  heroGradient: "linear-gradient(135deg, #1a0533 0%, #4c1d95 50%, #78350f 100%)",
  accent: "#8b5cf6",
  amber: "#f59e0b",
  ctaGradient: "linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)",
  ink: "#374151",
  inkSoft: "#6b7280",
  support: "cookingwithcastrollc@gmail.com",
  get appUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "https://alchm.kitchen";
  },
} as const;

/** Per-element visual theme (emoji + accent color + soft background tint). */
export const ELEMENT_THEME: Record<Element, { emoji: string; color: string; soft: string; word: string }> = {
  Fire: { emoji: "🔥", color: "#ef4444", soft: "#fef2f2", word: "Fire" },
  Water: { emoji: "💧", color: "#3b82f6", soft: "#eff6ff", word: "Water" },
  Earth: { emoji: "🌍", color: "#22c55e", soft: "#f0fdf4", word: "Earth" },
  Air: { emoji: "💨", color: "#a855f7", soft: "#faf5ff", word: "Air" },
};

/** Escape untrusted text (user names, etc.) before inlining into HTML. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface EmailLayoutOptions {
  /** <title> + internal label. */
  title: string;
  /** Hidden inbox-preview text (the gray line shown after the subject). */
  preheader?: string;
  /** Large glyph shown in the header. */
  heroEmoji?: string;
  heroTitle: string;
  heroSubtitle?: string;
  /** Optional accent (e.g. the user's element color) used for a thin top rule. */
  accentColor?: string;
  /** The unique, pre-composed body HTML. */
  bodyHtml: string;
  /** A line shown just above the copyright (e.g. why they're receiving this). */
  footerNote?: string;
  /** When provided, renders an unsubscribe link in the footer (bulletins/marketing). */
  unsubscribeUrl?: string;
}

/** Wrap composed body HTML in the shared, email-client-safe shell. */
export function renderEmailLayout(o: EmailLayoutOptions): string {
  const year = new Date().getFullYear();
  const accent = o.accentColor || BRAND.accent;
  const preheader = o.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">${esc(o.preheader)}</div>`
    : "";

  const unsubscribe = o.unsubscribeUrl
    ? `<p style="color:#9ca3af;font-size:12px;margin:8px 0 0 0;">
         <a href="${o.unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
         &nbsp;·&nbsp; You can update your preferences anytime in your profile.
       </p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${esc(o.title)}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9fafb;">
  ${preheader}
  <div style="max-width:620px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="background:${BRAND.heroGradient};border-radius:16px 16px 0 0;padding:44px 36px;text-align:center;border-top:4px solid ${accent};">
      ${o.heroEmoji ? `<div style="font-size:40px;line-height:1;margin-bottom:14px;">${o.heroEmoji}</div>` : `<div style="font-size:30px;line-height:1;margin-bottom:14px;letter-spacing:6px;">🜂 🜄 🜃 🜁</div>`}
      <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;letter-spacing:-0.4px;line-height:1.25;">
        ${o.heroTitle}
      </h1>
      ${o.heroSubtitle ? `<p style="color:rgba(255,255,255,0.85);margin:12px 0 0 0;font-size:16px;font-style:italic;">${o.heroSubtitle}</p>` : ""}
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px 36px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.08);">
      ${o.bodyHtml}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:26px 20px 0 20px;">
      ${o.footerNote ? `<p style="color:#9ca3af;font-size:12px;margin:0 0 6px 0;">${o.footerNote}</p>` : ""}
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        © ${year} ${BRAND.name} — ${BRAND.legal}. All rights reserved.
      </p>
      ${unsubscribe}
    </div>

  </div>
</body>
</html>`.trim();
}

// ─── Composable body components ──────────────────────────────────────────────

/** Small uppercase eyebrow label. */
export function emailEyebrow(text: string, color: string = BRAND.accent): string {
  return `<p style="color:${color};font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 8px 0;">${esc(text)}</p>`;
}

/** Section heading. */
export function emailHeading(text: string): string {
  return `<h2 style="color:#1f2937;font-size:19px;font-weight:700;margin:0 0 14px 0;">${esc(text)}</h2>`;
}

/** Body paragraph. `html` may contain inline markup (already-safe). */
export function emailParagraph(html: string, opts: { muted?: boolean; size?: number } = {}): string {
  const color = opts.muted ? BRAND.inkSoft : BRAND.ink;
  const size = opts.size ?? 15;
  return `<p style="color:${color};font-size:${size}px;line-height:1.75;margin:0 0 18px 0;">${html}</p>`;
}

/** Primary call-to-action button (centered). */
export function emailButton(href: string, label: string, opts: { gradient?: string; block?: boolean } = {}): string {
  const bg = opts.gradient || BRAND.ctaGradient;
  return `
  <div style="text-align:center;margin:8px 0 26px 0;">
    <a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;padding:15px 38px;border-radius:10px;font-weight:700;font-size:16px;letter-spacing:0.3px;">${esc(label)}</a>
  </div>`;
}

/** Soft accent card (left-bordered callout). */
export function emailCard(html: string, opts: { accent?: string; bg?: string } = {}): string {
  const accent = opts.accent || BRAND.accent;
  const bg = opts.bg || "#faf5ff";
  return `<div style="background:${bg};border-left:4px solid ${accent};padding:20px 22px;margin:0 0 24px 0;border-radius:0 8px 8px 0;">${html}</div>`;
}

/** A feature/benefit row (emoji + bold title + description). */
export function emailFeatureRow(emoji: string, title: string, html: string): string {
  return `
  <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:15px 18px;border-radius:10px;margin:0 0 12px 0;">
    <p style="margin:0;font-size:15px;color:#1f2937;line-height:1.6;">${emoji} <strong>${esc(title)}</strong> — ${html}</p>
  </div>`;
}

/** Horizontal rule. */
export function emailDivider(): string {
  return `<div style="height:1px;background:#e5e7eb;margin:28px 0;"></div>`;
}

/**
 * Render the four-element balance as labeled horizontal bars.
 * `balance` values are 0–1 fractions (they need not sum to exactly 1).
 */
export function emailBalanceBars(balance: { Fire: number; Water: number; Earth: number; Air: number }): string {
  const order: Element[] = ["Fire", "Water", "Earth", "Air"];
  const rows = order
    .map((el) => {
      const pct = Math.round(Math.max(0, Math.min(1, balance[el] || 0)) * 100);
      const t = ELEMENT_THEME[el];
      return `
      <tr>
        <td style="padding:3px 10px 3px 0;font-size:13px;color:#374151;white-space:nowrap;width:78px;">${t.emoji} ${t.word}</td>
        <td style="padding:3px 0;width:100%;">
          <div style="background:#eef0f3;border-radius:6px;height:12px;width:100%;">
            <div style="background:${t.color};height:12px;border-radius:6px;width:${pct}%;"></div>
          </div>
        </td>
        <td style="padding:3px 0 3px 10px;font-size:12px;color:#6b7280;text-align:right;width:38px;">${pct}%</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

// ─── Plain-text counterpart ──────────────────────────────────────────────────

/** Assemble a plain-text email body from sections, with the shared footer. */
export function plainTextEmail(sections: string[], opts: { unsubscribeUrl?: string } = {}): string {
  const year = new Date().getFullYear();
  const footer = [
    "",
    "—",
    `© ${year} ${BRAND.name} — ${BRAND.legal}. All rights reserved.`,
    opts.unsubscribeUrl ? `Unsubscribe: ${opts.unsubscribeUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return `${sections.filter(Boolean).join("\n\n")}\n${footer}`.trim();
}
