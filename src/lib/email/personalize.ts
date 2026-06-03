/**
 * Natal-chart → email personalization layer.
 *
 * Turns a user's stored natal chart (dominant element + modality, elemental
 * balance, Sun/Moon/Ascendant, ESMS alchemical signature) into reusable, email-
 * ready blocks and copy. Every email/notification that wants to "speak to the
 * user's chart" should build a `PersonalContext` here and compose from it.
 *
 * SAFE FOR CHARTLESS USERS: skeleton accounts (and anyone pre-onboarding) have an
 * empty `{}` natal chart. `buildPersonalContext` detects that and returns
 * `hasChart: false`, so callers render the "complete your chart" path instead of
 * fabricating cosmic claims.
 *
 * @file src/lib/email/personalize.ts
 */
import type { NatalChart, Element, Modality } from "@/types/natalChart";
import {
  ELEMENT_THEME,
  esc,
  emailCard,
  emailBalanceBars,
} from "./layout";

export interface PersonalContext {
  hasChart: boolean;
  firstName: string;
  element?: Element;
  modality?: Modality;
  balance?: { Fire: number; Water: number; Earth: number; Air: number };
  sun?: string;
  moon?: string;
  ascendant?: string;
  /** Highest of Spirit/Essence/Matter/Substance, if present. */
  topAlchemy?: { name: string; value: number };
}

const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air"];
const MODALITIES: Modality[] = ["Cardinal", "Fixed", "Mutable"];

/** First name (or a warm fallback) from a possibly-empty display name. */
export function firstNameOf(name?: string | null): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0];
}

/** "leo" → "Leo". */
export function signLabel(sign?: string | null): string {
  if (!sign) return "";
  return sign.charAt(0).toUpperCase() + sign.slice(1);
}

function isValidElement(v: unknown): v is Element {
  return typeof v === "string" && (ELEMENTS as string[]).includes(v);
}
function isValidModality(v: unknown): v is Modality {
  return typeof v === "string" && (MODALITIES as string[]).includes(v);
}

/**
 * Build the personalization context from a name + (possibly empty/partial) chart.
 * Tolerates the `{}` charts stored for skeleton/pre-onboarding users.
 */
export function buildPersonalContext(
  name: string | undefined,
  natalChart?: Partial<NatalChart> | null,
): PersonalContext {
  const firstName = firstNameOf(name);
  const chart = natalChart || {};
  const element = isValidElement(chart.dominantElement) ? chart.dominantElement : undefined;

  if (!element) {
    return { hasChart: false, firstName };
  }

  const positions = (chart.planetaryPositions || {}) as Record<string, string>;
  const balanceRaw = (chart.elementalBalance || {}) as Partial<Record<Element, number>>;
  const balance = {
    Fire: balanceRaw.Fire ?? 0,
    Water: balanceRaw.Water ?? 0,
    Earth: balanceRaw.Earth ?? 0,
    Air: balanceRaw.Air ?? 0,
  };

  let topAlchemy: { name: string; value: number } | undefined;
  const alc = chart.alchemicalProperties as Record<string, number> | undefined;
  if (alc) {
    for (const key of ["Spirit", "Essence", "Matter", "Substance"]) {
      const v = alc[key];
      if (typeof v === "number" && (!topAlchemy || v > topAlchemy.value)) {
        topAlchemy = { name: key, value: v };
      }
    }
  }

  return {
    hasChart: true,
    firstName,
    element,
    modality: isValidModality(chart.dominantModality) ? chart.dominantModality : undefined,
    balance,
    sun: positions.Sun ? signLabel(positions.Sun) : undefined,
    moon: positions.Moon ? signLabel(positions.Moon) : undefined,
    ascendant: chart.ascendant ? signLabel(chart.ascendant) : positions.Ascendant ? signLabel(positions.Ascendant) : undefined,
    topAlchemy,
  };
}

/** Per-element culinary guidance used to make recommendations feel earned. */
export const ELEMENT_GUIDANCE: Record<
  Element,
  { vibe: string; cuisines: string; ingredients: string; methods: string }
> = {
  Fire: {
    vibe: "bold, energizing, and quick to transform",
    cuisines: "Thai, Szechuan, Mexican, and North African",
    ingredients: "chili, ginger, garlic, citrus, and bright herbs",
    methods: "grilling, searing, and high-heat stir-frying",
  },
  Water: {
    vibe: "nourishing, restorative, and deeply flavorful",
    cuisines: "Japanese, coastal Mediterranean, and Cantonese",
    ingredients: "seafood, miso, cucumber, melon, and leafy greens",
    methods: "steaming, poaching, and gentle braising",
  },
  Earth: {
    vibe: "grounding, hearty, and satisfying",
    cuisines: "Italian, French country, and Middle Eastern",
    ingredients: "root vegetables, mushrooms, grains, legumes, and aged cheese",
    methods: "roasting, slow-braising, and baking",
  },
  Air: {
    vibe: "light, aromatic, and endlessly curious",
    cuisines: "Vietnamese, modern fusion, and mezze-style spreads",
    ingredients: "fresh herbs, sprouts, citrus zest, nuts, and delicate greens",
    methods: "raw preparations, quick sautés, and aromatic infusions",
  },
};

export function elementGuidance(element: Element) {
  return ELEMENT_GUIDANCE[element];
}

/** One-line chart summary, e.g. "☉ Leo · ☽ Cancer · ↑ Scorpio rising". */
export function chartSummaryLine(ctx: PersonalContext): string {
  const parts: string[] = [];
  if (ctx.sun) parts.push(`☉ ${esc(ctx.sun)}`);
  if (ctx.moon) parts.push(`☽ ${esc(ctx.moon)}`);
  if (ctx.ascendant) parts.push(`↑ ${esc(ctx.ascendant)} rising`);
  return parts.join(" &nbsp;·&nbsp; ");
}

/**
 * The flagship personalized block: a themed card with the user's element,
 * modality, balance bars, chart summary, and a tailored culinary nudge.
 * Returns "" when the user has no chart (caller should render a fallback CTA).
 */
export function chartProfileCard(ctx: PersonalContext): string {
  if (!ctx.hasChart || !ctx.element) return "";
  const theme = ELEMENT_THEME[ctx.element];
  const g = ELEMENT_GUIDANCE[ctx.element];
  const summary = chartSummaryLine(ctx);
  const modality = ctx.modality ? ` · ${esc(ctx.modality)}` : "";
  const alchemy = ctx.topAlchemy
    ? `<p style="color:#4b5563;font-size:13px;margin:12px 0 0 0;">Your strongest alchemical force is <strong>${esc(ctx.topAlchemy.name)}</strong> — it shapes how your meals transform energy.</p>`
    : "";

  return emailCard(
    `
    <p style="color:#1f2937;font-size:16px;margin:0 0 4px 0;font-weight:700;">
      ${theme.emoji} Your Cosmic Kitchen Profile
    </p>
    <p style="color:${theme.color};font-size:15px;font-weight:700;margin:0 0 ${summary ? "4px" : "12px"} 0;">
      ${theme.word} dominant${modality}
    </p>
    ${summary ? `<p style="color:#6b7280;font-size:13px;margin:0 0 14px 0;">${summary}</p>` : ""}
    ${emailBalanceBars(ctx.balance || { Fire: 0, Water: 0, Earth: 0, Air: 0 })}
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:14px 0 0 0;">
      Your chart leans <strong>${g.vibe}</strong>. We tune every recommendation to this —
      think <strong>${g.cuisines}</strong> cuisines, ingredients like ${g.ingredients},
      and ${g.methods}.
    </p>
    ${alchemy}
    `,
    { accent: theme.color, bg: theme.soft },
  );
}

/** Plain-text version of the chart profile (for the text/* part). */
export function chartProfileText(ctx: PersonalContext): string {
  if (!ctx.hasChart || !ctx.element) {
    return "Complete your birth chart at alchm.kitchen to unlock recommendations tuned to your cosmic profile.";
  }
  const g = ELEMENT_GUIDANCE[ctx.element];
  const summary = [ctx.sun && `Sun ${ctx.sun}`, ctx.moon && `Moon ${ctx.moon}`, ctx.ascendant && `${ctx.ascendant} rising`]
    .filter(Boolean)
    .join(", ");
  return [
    `YOUR COSMIC KITCHEN PROFILE`,
    `Dominant element: ${ctx.element}${ctx.modality ? ` (${ctx.modality})` : ""}`,
    summary ? `Chart: ${summary}` : "",
    `Tuned for you: ${g.cuisines} cuisines; ingredients like ${g.ingredients}; ${g.methods}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
