import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import type { Element, ElementalProperties } from "@/types/alchemy";
import {
  elementalSignature,
  type ElementalSignature as Signature,
} from "@/utils/elemental/signature";
import type { CSSProperties, JSX, ReactNode } from "react";

/**
 * Shared elemental-signature display.
 *
 * The one component every surface uses to *name* the current elemental lean,
 * driven by the canonical {@link elementalSignature} model. It adapts: a clear
 * sky reads as a single element, a close cluster reads co-dominant
 * ("leans water & earth"), and an even sky reads "in balance" — identically
 * everywhere, replacing a scatter of bespoke "{element} Dominant" labels.
 *
 * This is purely the *headline / label / orb*. Surfaces that show the full
 * four-element breakdown keep their bars (ElementalMeter / the discover bars);
 * this component supplies the wording above them.
 *
 * Elemental principle: co-dominant is additive blending, never opposition —
 * there is no "vs" anywhere in the copy or visuals.
 *
 * @file src/components/ui/alchm/ElementalSignature.tsx
 */

interface ElementMeta {
  label: string;
  glyph: GlyphName;
  colorVar: string;
}

/** Element → display label, alchemical-triangle glyph, and CSS color token. */
export const ELEMENT_META: Record<Element, ElementMeta> = {
  Fire: { label: "Fire", glyph: "triangle-up", colorVar: "var(--el-fire)" },
  Water: { label: "Water", glyph: "triangle-down", colorVar: "var(--el-water)" },
  Earth: { label: "Earth", glyph: "triangle-down-bar", colorVar: "var(--el-earth)" },
  Air: { label: "Air", glyph: "triangle-up-bar", colorVar: "var(--el-air)" },
};

export type ElementalSignatureVariant = "full" | "compact" | "inline";

export interface ElementalSignatureProps {
  /** Raw or normalized four-element vector (normalized internally). */
  values?: ElementalProperties | null;
  /** A precomputed signature; overrides `values` when supplied. */
  signature?: Signature;
  /** `full` = hero headline + orb · `compact` = orb + chip · `inline` = colored label only. */
  variant?: ElementalSignatureVariant;
  /** Lead-in subject for the `full` headline (e.g. "The sky", "This dish"). */
  subject?: string;
  /** Optional sub-copy under the `full` headline. */
  description?: ReactNode;
  /** Headline font size for the `full` variant. */
  headlineSize?: number;
  className?: string;
  style?: CSSProperties;
}

/** Colored, separator-joined element names ("water & earth", "fire, water & earth"). */
function NamedElements({
  elements,
  lowercase,
}: {
  elements: Element[];
  lowercase?: boolean;
}): JSX.Element {
  return (
    <>
      {elements.map((el, i) => {
        const meta = ELEMENT_META[el];
        const sep = i === 0 ? "" : i === elements.length - 1 ? " & " : ", ";
        return (
          <span key={el}>
            {sep}
            <span style={{ color: meta.colorVar }}>
              {lowercase ? meta.label.toLowerCase() : meta.label}
            </span>
          </span>
        );
      })}
    </>
  );
}

/** The elements this signature actually *names* (dominant, or the co-dominant set). */
function namedElements(sig: Signature): Element[] {
  return sig.tier === "co-dominant" ? sig.coDominant : [sig.dominant];
}

/** Orb fill: a single radial for one element, an additive blend for co-dominant, a four-element wheel for balanced. */
function orbBackground(sig: Signature): string {
  if (sig.tier === "balanced") {
    return "conic-gradient(from 90deg, var(--el-fire), var(--el-water), var(--el-earth), var(--el-air), var(--el-fire))";
  }
  const colors = namedElements(sig).map((el) => ELEMENT_META[el].colorVar);
  if (colors.length === 1) {
    return `radial-gradient(circle at 32% 28%, ${colors[0]}, color-mix(in oklch, ${colors[0]}, black 55%))`;
  }
  return `linear-gradient(135deg, ${colors.join(", ")})`;
}

function Orb({
  sig,
  size,
  glyphSize,
}: {
  sig: Signature;
  size: number;
  glyphSize: number;
}): JSX.Element {
  const glyph: GlyphName =
    sig.tier === "balanced" ? "atom" : ELEMENT_META[sig.dominant].glyph;
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: orbBackground(sig),
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <Glyph
        name={glyph}
        size={glyphSize}
        stroke={1.3}
        style={{ color: "rgba(0,0,0,0.72)" }}
      />
    </span>
  );
}

export function ElementalSignature({
  values,
  signature,
  variant = "compact",
  subject = "The sky",
  description,
  headlineSize = 26,
  className,
  style,
}: ElementalSignatureProps): JSX.Element {
  const sig = signature ?? elementalSignature(values ?? null);
  const named = namedElements(sig);

  if (variant === "inline") {
    return (
      <span className={className} style={style} aria-label={sig.shortLabel}>
        {sig.tier === "balanced" ? (
          "Balanced"
        ) : (
          <NamedElements elements={named} />
        )}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span
        className={className}
        aria-label={sig.shortLabel}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          ...style,
        }}
      >
        <Orb sig={sig} size={18} glyphSize={9} />
        <span style={{ color: "var(--fg)", fontSize: 13 }}>{sig.shortLabel}</span>
      </span>
    );
  }

  // variant === "full"
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 20,
        ...style,
      }}
    >
      <div>
        <div
          className="t-display"
          style={{ fontSize: headlineSize, color: "var(--fg)", lineHeight: 1.15 }}
        >
          {subject}{" "}
          {sig.tier === "balanced" ? (
            <>
              is <span style={{ color: "var(--accent)" }}>in balance</span>
            </>
          ) : (
            <>
              leans <NamedElements elements={named} lowercase />
            </>
          )}
        </div>
        {description != null && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: "var(--fg-dim)",
              lineHeight: 1.55,
              maxWidth: 460,
            }}
          >
            {description}
          </p>
        )}
      </div>
      <Orb sig={sig} size={56} glyphSize={26} />
    </div>
  );
}

export default ElementalSignature;
