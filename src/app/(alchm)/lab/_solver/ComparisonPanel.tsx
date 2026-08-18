"use client";

/**
 * Comparison — the same food, three arrangements, opposite bottlenecks.
 *
 * The Solver tab answers "what does THIS arrangement do". This tab answers the
 * question that made the whole boundary layer worth building: **why does the
 * same food behave completely differently in an oven and in a pot?**
 *
 * All three chains are solved live from one shared food definition, so the
 * claim in the heading is enforced by construction rather than asserted in
 * prose — there is literally one `FOOD` object and the columns cannot drift
 * apart without someone editing it.
 *
 * @file src/app/(alchm)/lab/_solver/ComparisonPanel.tsx
 */
import { useMemo } from "react";
import { getVessel } from "@/data/cooking/vessels";
import { solveBoundaryNetwork, type BoundaryNetworkResult } from "@/lib/cooking/boundaryNetwork";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import { ResistanceChain } from "./ResistanceChain";

/**
 * ONE food, shared by every column. A 25 mm-radius potato, k = 0.55 W·m⁻¹·K⁻¹.
 *
 * The point of the tab is that this never changes, so it is defined once and
 * spread into each arrangement rather than repeated per column.
 */
const FOOD = {
  geometry: "sphere" as FoodGeometry,
  halfDimensionM: 0.025,
  kWmK: 0.55,
  areaM2: 4 * Math.PI * 0.025 * 0.025,
};

/**
 * The 8 qt stockpot, read FROM THE REGISTRY rather than transcribed.
 *
 * The first draft of this file hardcoded a 0.05 m² base and a 3 mm wall, which
 * are plausible and are not this pot: it is 240 mm internally with a 4 mm base
 * in 304 stainless. Transcribing a vessel into a view is how a registry stops
 * being the source of truth.
 */
function stockpotLeg(): {
  sourceToVesselHWm2K: number;
  areaM2: number;
  kWmK: number;
  thicknessM: number;
  vesselToMediumHWm2K: number;
} {
  const pot = getVessel("stockpot_8qt");
  if (!pot) throw new Error("the comparison tab needs stockpot_8qt in the vessel registry");
  return {
    // `[BASIS]` A gas ring against a pot base is ~60 W·m⁻²·K⁻¹; nucleate boiling
    // on the inside is thousands. Both are stated here because this tab fixes
    // one arrangement and can afford named values, where the Solver tab has to
    // reuse the method's own coefficient and says so.
    sourceToVesselHWm2K: 60,
    areaM2: pot.baseAreaM2,
    kWmK: pot.material.kWmK,
    thicknessM: pot.baseThicknessMm / 1000,
    vesselToMediumHWm2K: 5000,
  };
}

interface Arrangement {
  id: string;
  title: string;
  note: string;
  network: BoundaryNetworkResult;
}

export function ComparisonPanel(): React.JSX.Element {
  const arrangements = useMemo<Arrangement[]>(() => {
    const pot = stockpotLeg();
    return [
      {
        id: "oven",
        title: "200 °C oven, on a rack",
        note: "No vessel at all. The chain has two links because the arrangement has two — not five with three left blank.",
        network: solveBoundaryNetwork({
          sourceC: 200,
          sinkC: 20,
          food: { ...FOOD, mediumToFoodHWm2K: 15 },
        }),
      },
      {
        id: "boiling",
        title: "Boiling water, 8 qt stockpot",
        note: "Same potato. The medium is now 100× better at moving heat, so the food's own interior becomes the entire answer.",
        network: solveBoundaryNetwork({
          sourceC: 250,
          sinkC: 20,
          vessel: pot,
          food: { ...FOOD, mediumToFoodHWm2K: 1500 },
        }),
      },
      {
        id: "empty",
        title: "Empty pot on a burner",
        note: "No food in the chain, so no Biot number. The tool says so rather than printing one.",
        network: solveBoundaryNetwork({ sourceC: 250, sinkC: 100, vessel: pot }),
      },
    ];
  }, []);

  const [oven, boiling] = arrangements;
  const wallLink = boiling.network.links.find((l) => l.id === "vessel-wall")!;
  const airLink = oven.network.links.find((l) => l.id === "medium-to-food")!;

  return (
    <div className="ma-solver ma-compare">
      <header className="ma-compare__head">
        <h2>Same food, opposite bottleneck.</h2>
        <p className="ma-note">
          One 50 mm potato, k = {FOOD.kWmK} W·m⁻¹·K⁻¹, in three arrangements. Nothing about the
          food changes between columns — every chain below is solved from the same object. What
          changes is which link is slowest, and that is what decides whether a hotter medium, more
          stirring, or a thinner cut is the thing that helps.
        </p>
      </header>

      <div className="ma-compare__grid">
        {arrangements.map((a) => (
          <article key={a.id} className="ma-card">
            <h3>{a.title}</h3>
            <p className="ma-compare__count">
              {a.network.links.length} link{a.network.links.length === 1 ? "" : "s"}
            </p>
            <ResistanceChain network={a.network} />
            <p className="ma-note">{a.note}</p>
          </article>
        ))}
      </div>

      <article className="ma-card ma-card--wide ma-compare__strip">
        <h3>the pan is never the bottleneck</h3>
        <p className="ma-note">
          In the boiling column the vessel wall holds{" "}
          <strong>{(wallLink.share * 100).toFixed(2)} %</strong> of the total resistance
          ({wallLink.resistanceKperW.toExponential(2)} K·W⁻¹), against{" "}
          {airLink.resistanceKperW.toExponential(2)} K·W⁻¹ for the air above the roast in the oven
          column — a factor of{" "}
          <strong>
            {Math.round(airLink.resistanceKperW / wallLink.resistanceKperW).toLocaleString()}×
          </strong>
          .
        </p>
        <div className="ma-compare__bars">
          <Bar label="vessel wall, 3 mm" value={wallLink.resistanceKperW} max={airLink.resistanceKperW} accent />
          <Bar label="still air over a roast" value={airLink.resistanceKperW} max={airLink.resistanceKperW} />
        </div>
        <p className="ma-note">
          A pan&rsquo;s contribution is thermal mass and evenness — how far its temperature falls
          when cold food lands, and how evenly it spreads a burner ring. It is not resistance, and
          buying a thicker pan to cook faster is buying the wrong property.
        </p>
      </article>
    </div>
  );
}

/**
 * A proportional bar. The cast-iron case renders as a hairline against the air
 * case, which is the entire finding — so the width is NOT floored the way the
 * chain blocks are. Here being nearly invisible is the message.
 */
function Bar({
  label, value, max, accent,
}: {
  label: string; value: number; max: number; accent?: boolean;
}): React.JSX.Element {
  return (
    <div className="ma-compare__bar">
      <span className="ma-compare__bar-label">{label}</span>
      <span className="ma-compare__bar-track">
        <span
          className={accent ? "is-accent" : undefined}
          style={{ width: `${Math.max((value / max) * 100, 0.15)}%` }}
        />
      </span>
      <span className="ma-compare__bar-value">{value.toExponential(2)} K·W⁻¹</span>
    </div>
  );
}
