/**
 * Personalized re-engagement bulletin.
 *
 * The "come use the site" email — tuned to the recipient's natal chart when we
 * have one (element, balance, Sun/Moon/Asc, tailored culinary guidance), with a
 * graceful "finish your chart" path when we don't. Built entirely from the
 * shared skeleton (`../layout`) + personalization layer (`../personalize`), so
 * it stays consistent with every other alchm.kitchen email and is a worked
 * example for crafting new user-specific emails.
 *
 * @file src/lib/email/templates/bulletin.ts
 */
import type { NatalChart } from "@/types/natalChart";
import {
  BRAND,
  ELEMENT_THEME,
  esc,
  renderEmailLayout,
  emailParagraph,
  emailButton,
  emailHeading,
  emailFeatureRow,
  emailCard,
  emailDivider,
  emailEyebrow,
  plainTextEmail,
} from "../layout";
import {
  buildPersonalContext,
  chartProfileCard,
  chartProfileText,
  elementGuidance,
} from "../personalize";

export interface BulletinInput {
  name?: string;
  natalChart?: Partial<NatalChart> | null;
  appUrl?: string;
  /** When provided, an unsubscribe link is shown (recommended for broadcasts). */
  unsubscribeUrl?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderBulletinEmail(input: BulletinInput): RenderedEmail {
  const appUrl = input.appUrl || BRAND.appUrl;
  const ctx = buildPersonalContext(input.name, input.natalChart);
  const theme = ctx.element ? ELEMENT_THEME[ctx.element] : null;
  const accent = theme?.color || BRAND.accent;
  const heroEmoji = theme?.emoji || "✨";

  // Subject + hero copy adapt to whether we know their chart.
  const subject = ctx.hasChart && ctx.element
    ? `${heroEmoji} ${ctx.firstName}, your ${ctx.element} kitchen is calling`
    : `${ctx.firstName}, your alchm.kitchen is ready ✨`;

  const heroTitle = ctx.hasChart
    ? `Your kitchen is aligned, ${esc(ctx.firstName)}`
    : `Welcome back, ${esc(ctx.firstName)}`;

  const preheader = ctx.hasChart && ctx.element
    ? `Today's cosmic weather and ${ctx.element}-tuned recommendations are waiting.`
    : `Finish your birth chart to unlock recommendations tuned to you.`;

  // ── Personalized section ────────────────────────────────────────────────
  let personalSection: string;
  if (ctx.hasChart && ctx.element) {
    const g = elementGuidance(ctx.element);
    personalSection =
      chartProfileCard(ctx) +
      emailParagraph(
        `Right now the live sky is shifting, and your recommendations move with it. ` +
          `Open your dashboard to see what's most nourishing for a <strong>${esc(ctx.element)}</strong> chart today — ` +
          `we're surfacing ${esc(g.cuisines)} dishes and ${esc(g.methods)} that fit your energy.`,
      );
  } else {
    personalSection = emailCard(
      `<p style="color:#1f2937;font-size:16px;margin:0 0 8px 0;font-weight:700;">✨ Unlock your personalized kitchen</p>
       <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">
         Add your birth date, time, and place and we'll calculate your natal chart — then every
         recommendation, recipe, and meal plan is tuned to your unique elemental profile.
       </p>`,
      { accent: BRAND.accent, bg: "#faf5ff" },
    );
  }

  const primaryCta = ctx.hasChart
    ? emailButton(`${appUrl}/current-chart`, "See today's alignment →")
    : emailButton(`${appUrl}/profile`, "Complete your chart →");

  // ── What you can do right now ───────────────────────────────────────────
  const features = [
    emailFeatureRow(
      "🔮",
      "Today's recommendations",
      `what to eat right now, computed from real-time planetary positions. <a href="${appUrl}/current-chart" style="color:${BRAND.accent};text-decoration:none;font-weight:600;">Check the sky →</a>`,
    ),
    emailFeatureRow(
      "🍳",
      "Generate a cosmic recipe",
      `a recipe built for this moment and your chart. <a href="${appUrl}/recipe-generator" style="color:${BRAND.accent};text-decoration:none;font-weight:600;">Make one →</a>`,
    ),
    emailFeatureRow(
      "📅",
      "Plan your week",
      "map meals to the season and the planetary weather — never wonder “what’s for dinner?” again.",
    ),
    emailFeatureRow(
      "🍜",
      "Discover restaurants",
      `for the nights nobody wants to cook — matched to your taste and needs. <a href="${appUrl}/restaurants" style="color:${BRAND.accent};text-decoration:none;font-weight:600;">Explore →</a>`,
    ),
  ].join("");

  const body = [
    emailEyebrow(ctx.hasChart && ctx.element ? `${ctx.element} · Cosmic kitchen` : "Your kitchen awaits", accent),
    emailParagraph(`Hi <strong>${esc(ctx.firstName)}</strong>,`),
    emailParagraph(
      `alchm.kitchen pairs ancient alchemy and astrology with NASA-precision planetary data to tell you ` +
        `exactly what to cook — personalized to <em>you</em>. Here's what's waiting:`,
    ),
    personalSection,
    primaryCta,
    emailDivider(),
    emailHeading("What you can do right now"),
    features,
    emailDivider(),
    emailParagraph(
      `Questions, ideas, or a dish you're proud of? Just reply — we read every message. ` +
        `<a href="mailto:${BRAND.support}" style="color:${BRAND.accent};text-decoration:none;font-weight:600;">${BRAND.support}</a>`,
      { size: 14 },
    ),
    emailParagraph(
      `With gratitude and good food,<br><strong>Greg Castro</strong><br>` +
        `<span style="color:${BRAND.inkSoft};font-size:13px;">Chef &amp; Founder, ${BRAND.name}</span>`,
      { size: 15 },
    ),
  ].join("");

  const html = renderEmailLayout({
    title: subject,
    preheader,
    heroEmoji,
    heroTitle,
    heroSubtitle: "What to eat, aligned with the cosmos",
    accentColor: accent,
    bodyHtml: body,
    footerNote: "You're receiving this because you have an account at alchm.kitchen.",
    unsubscribeUrl: input.unsubscribeUrl,
  });

  // ── Plain-text counterpart ──────────────────────────────────────────────
  const text = plainTextEmail(
    [
      heroTitle.replace(/<[^>]+>/g, ""),
      `Hi ${ctx.firstName},`,
      `alchm.kitchen pairs ancient alchemy and astrology with NASA-precision planetary data to tell you exactly what to cook — personalized to you.`,
      chartProfileText(ctx),
      `WHAT YOU CAN DO RIGHT NOW`,
      `- Today's recommendations — ${appUrl}/current-chart`,
      `- Generate a cosmic recipe — ${appUrl}/recipe-generator`,
      `- Plan your week with the planetary weather`,
      `- Discover restaurants — ${appUrl}/restaurants`,
      ctx.hasChart ? `See today's alignment: ${appUrl}/current-chart` : `Complete your chart: ${appUrl}/profile`,
      `Questions or ideas? Reply anytime: ${BRAND.support}`,
      `With gratitude and good food,\nGreg Castro — Chef & Founder, ${BRAND.name}`,
    ],
    { unsubscribeUrl: input.unsubscribeUrl },
  );

  return { subject, html, text };
}
