"use client";

/**
 * The Resistance Chain — Visual Heat Flow & Culinary Bottleneck Breakdown
 *
 * Translates rigorous thermodynamic boundary resistance chains into plain-English
 * actionable takeaways for cooks. Eliminates confusing scientific notation
 * (e.g., 3.68e-1 K·W⁻¹) in favor of clear bottleneck percentages, temperature
 * deltas in °F/°C, and practical culinary tips.
 *
 * @file src/app/(alchm)/kitchen-lab/_solver/ResistanceChain.tsx
 */
import type { BoundaryNetworkResult } from "@/lib/cooking/boundaryNetwork";
import {
  explainHeatBottleneck,
  useTemperatureUnit,
} from "@/lib/cooking/temperatureUnits";
import type React from "react";

/** Minimum rendered width, so a sub-1 % link stays visible and hoverable. */
const MIN_VISIBLE_PERCENT = 2.0;

function biotChefVerdict(biot: number): {
  headline: string;
  advice: string;
} {
  if (biot < 0.1) {
    return {
      headline: "Fast Internal Conduction (Isothermal Core)",
      advice: "Food heats evenly throughout. Searing and interior cooking happen in harmony.",
    };
  }
  if (biot < 1) {
    return {
      headline: "Surface-Dominated Heating",
      advice: "Exterior heats faster than the core, but internal heat moves steadily. Monitor crust development.",
    };
  }
  if (biot <= 10) {
    return {
      headline: "Interior-Dominated Heat Lag",
      advice: "Heat slows down significantly inside. Searing at high heat risks burning the crust before the center finishes.",
    };
  }
  return {
    headline: "Severe Core Heat Lag (Thick Cut / Low Thermal Diffusivity)",
    advice: "Thick cut: Finish with indirect heat, low oven roasting, or braising to avoid overcooking the outer layers.",
  };
}

export function ResistanceChain({
  network,
  caption,
}: {
  network: BoundaryNetworkResult;
  caption?: string;
}): React.JSX.Element {
  const { unit } = useTemperatureUnit();

  // Floored shares so tiny links remain visible, normalized to 100%
  const floored = network.links.map((l) =>
    Math.max(l.share * 100, MIN_VISIBLE_PERCENT)
  );
  const totalFloored = floored.reduce((s, w) => s + w, 0);

  const controllingLink = network.controlling;
  const controllingInsight = explainHeatBottleneck(
    controllingLink.id,
    controllingLink.share
  );

  return (
    <figure className="ma-chain">
      {/* Visual Proportional Bar */}
      <div
        className="ma-chain__row"
        role="img"
        aria-label={caption ?? "thermal resistance bottleneck chain"}
      >
        {network.links.map((link, i) => {
          const isControlling = link.id === controllingLink.id;
          const sharePct = (link.share * 100).toFixed(1);
          return (
            <div
              key={link.id}
              className={`ma-chain__block${isControlling ? " is-controlling" : ""}`}
              style={{ width: `${(floored[i] / totalFloored) * 100}%` }}
              title={`${link.label}: ${sharePct}% of total heat delay`}
            >
              <span className="ma-chain__pct">{sharePct}%</span>
            </div>
          );
        })}
      </div>

      {/* Controlling Bottleneck Chef Callout */}
      <div className="my-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs leading-relaxed text-amber-200">
        <div className="flex items-center gap-1.5 font-semibold text-amber-300">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Primary Heat Bottleneck: {controllingInsight.bottleneckTitle}
        </div>
        <p className="mt-1 text-white/80">{controllingInsight.explanation}</p>
        <p className="mt-1.5 font-medium text-amber-100/90">
          <strong className="text-amber-300">Chef Action:</strong>{" "}
          {controllingInsight.culinaryTip}
        </p>
      </div>

      {/* Link-by-Link Breakdown */}
      <ol className="ma-chain__links">
        {network.links.map((link) => {
          const isControlling = link.id === controllingLink.id;
          const sharePct = (link.share * 100).toFixed(1);
          const dropDegrees =
            unit === "fahrenheit"
              ? (link.dropK * 9) / 5
              : link.dropK;
          const dropLabel = `Δ${Math.round(dropDegrees)}°${unit === "fahrenheit" ? "F" : "C"}`;

          return (
            <li
              key={link.id}
              className={isControlling ? "is-controlling" : undefined}
            >
              <div className="flex flex-col">
                <span className="ma-chain__label">
                  {link.label}
                  {isControlling ? (
                    <em className="ma-chain__tag">primary bottleneck</em>
                  ) : null}
                </span>
                <span className="text-[11px] text-white/50">
                  {explainHeatBottleneck(link.id, link.share).explanation}
                </span>
              </div>
              <span className="ma-chain__nums">
                <span className="font-semibold text-white/90">{sharePct}% share</span>
                <span className="text-white/60">{dropLabel} temp drop</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Practical Cook Summary */}
      <dl className="ma-chain__summary">
        <div>
          <dt>Net Heat Transfer</dt>
          <dd className="text-amber-300 font-medium">
            {Math.round(network.heatFlowW)} W{" "}
            <span className="text-[10px] text-white/50 block font-normal">
              (active thermal flow into food/pan)
            </span>
          </dd>
        </div>
        <div>
          <dt>Core Heat Penetration</dt>
          <dd>
            {network.foodBiot === null ? (
              <span className="text-white/60">
                Empty pan preheat — heat distributes evenly across cookware base.
              </span>
            ) : (
              <div>
                <span className="font-medium text-white/90">
                  {biotChefVerdict(network.foodBiot).headline}
                </span>
                <p className="text-[11px] text-white/60 mt-0.5">
                  {biotChefVerdict(network.foodBiot).advice}
                </p>
              </div>
            )}
          </dd>
        </div>
      </dl>
      {caption ? <figcaption className="mt-2 text-[11px] text-white/40">{caption}</figcaption> : null}
    </figure>
  );
}
