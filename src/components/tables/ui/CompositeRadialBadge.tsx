import { Glyph } from "@/components/ui/alchm/Glyph";
import {
  apportionPercentages,
  ELEMENT_COLORS,
  ELEMENT_GLYPHS,
  ELEMENTS,
  type Element,
} from "./elements";
import type { JSX } from "react";

export interface ElementArc {
  element: Element;
  /** Normalized share of the ring (0..1). */
  fraction: number;
  /** Arc length along the circumference. */
  length: number;
  /** Distance from 12 o'clock where this arc starts. */
  offset: number;
}

/**
 * Split a ring circumference into one arc per element, proportional to the
 * (raw or normalized) element values. Zero/negative values collapse to a
 * zero-length arc; an all-zero vector renders four equal quarters.
 */
export function computeElementArcs(
  values: Partial<Record<Element, number>>,
  circumference: number,
): ElementArc[] {
  const clamped = ELEMENTS.map(
    (element) => [element, Math.max(0, values[element] ?? 0)] as const,
  );
  const total = clamped.reduce((sum, [, value]) => sum + value, 0);
  let offset = 0;
  return clamped.map(([element, value]) => {
    const fraction = total > 0 ? value / total : 1 / ELEMENTS.length;
    const length = fraction * circumference;
    const arc: ElementArc = { element, fraction, length, offset };
    offset += length;
    return arc;
  });
}

export type CompositeRadialBadgeVariant = "composite" | "compatibility";

export interface CompositeRadialBadgeProps {
  variant?: CompositeRadialBadgeVariant;
  /** Element mix (0..1 each) for the composite variant. */
  values?: Partial<Record<Element, number>>;
  /** Match score (0..1) for the compatibility variant. */
  value?: number;
  /** Outer diameter in px (spec default w-12). */
  size?: number;
  ariaLabel?: string;
  className?: string;
}

/**
 * Small radial badge (tables-design-spec.md §2.7). `composite` renders four
 * element arcs around a dark inner circle with the dominant element's sigil;
 * `compatibility` renders a single copper→violet arc with the % centered.
 */
export function CompositeRadialBadge({
  variant = "composite",
  values,
  value = 0,
  size = 48,
  ariaLabel,
  className = "",
}: CompositeRadialBadgeProps): JSX.Element {
  const strokeWidth = Math.max(3, Math.round(size / 14));
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  // Deterministic (no useId: keep this usable from Server Components).
  // Identical props produce identical gradients, so id reuse is harmless.
  const gradientId = `tables-compat-${size}-${Math.round(Math.max(0, Math.min(1, value)) * 100)}`;

  if (variant === "compatibility") {
    const clamped = Math.max(0, Math.min(1, value));
    const pct = Math.round(clamped * 100);
    return (
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? `Compatibility ${pct}%`}
        className={`relative inline-block ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} aria-hidden>
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#e0a66b" />
              <stop offset="100%" stopColor="#b57ee0" />
            </linearGradient>
          </defs>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped)}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-alchm-fg" style={{ fontSize: size * 0.26 }}>
          {pct}%
        </span>
      </div>
    );
  }

  const arcs = computeElementArcs(values ?? {}, circumference);
  const dominant = arcs.reduce((best, arc) =>
    arc.fraction > best.fraction ? arc : best,
  );
  // Apportion from the drawn fractions (they sum to 1 even for an all-zero
  // vector) so the announced percentages always sum to exactly 100.
  const percentages = apportionPercentages(
    Object.fromEntries(arcs.map((arc) => [arc.element, arc.fraction])),
  );
  const label =
    ariaLabel ??
    `Elemental composition: ${arcs
      .map((arc) => `${arc.element} ${percentages[arc.element]}%`)
      .join(", ")}`;
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#0E0C16"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {arcs
          .filter((arc) => arc.length > 0)
          .map((arc) => (
            <circle
              key={arc.element}
              data-element={arc.element}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ELEMENT_COLORS[arc.element].hex}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          ))}
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center ${ELEMENT_COLORS[dominant.element].text}`}
        aria-hidden
      >
        <Glyph
          name={ELEMENT_GLYPHS[dominant.element]}
          size={Math.round(size * 0.4)}
          stroke={1.4}
        />
      </span>
    </div>
  );
}

export default CompositeRadialBadge;
