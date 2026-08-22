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
 * ── Which engine solved them ────────────────────────────────────────────────
 *
 * The chains now come from {@link createBoundarySolver}, which resolves to the
 * compiled Rust core when `public/wasm` is built and to the TypeScript kernel
 * when it is not. `public/wasm` is gitignored, so a fresh checkout genuinely
 * runs the fallback — the badge in the header reports `solver.engine`, the
 * engine that ACTUALLY ran, never a hopeful constant.
 *
 * ── Refusals, including a missing vessel ────────────────────────────────────
 *
 * `solve()` returns null as a refusal and this renders it as one. So does the
 * absence of `stockpot_8qt` from the vessel registry: this file used to `throw`
 * from inside a `useMemo` for that case, which took down the entire Compare tab
 * rather than the two columns that actually need the pot. A missing vessel is
 * now a stated gap in two cards, and the oven column still renders.
 *
 * @file src/app/(alchm)/kitchen-lab/_solver/ComparisonPanel.tsx
 */
import { useEffect, useMemo, useState } from "react";
import { Refused } from "@/components/lab/CitationChip";
import { getVessel } from "@/data/cooking/vessels";
import type { BoundaryNetworkResult } from "@/lib/cooking/boundaryNetwork";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import { createBoundarySolver, type BoundarySolver } from "@/lib/wasm/thermoEngine";
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

/** The vessel leg of the chain, in the shape the solver takes. */
interface VesselLeg {
  sourceToVesselHWm2K: number;
  areaM2: number;
  kWmK: number;
  thicknessM: number;
  vesselToMediumHWm2K: number;
}

/** Stated once, so the two pot-bearing columns refuse with the same sentence. */
const NO_POT_REASON =
  "stockpot_8qt is not in the vessel registry, so this chain has no base area, wall thickness or conductivity to solve from.";

/** Stated once, for the case where the engine itself declines the inputs. */
const REFUSED_REASON =
  "the solver declined these inputs — they fall outside the envelope its correlations are valid over, so there is no chain to draw.";

/**
 * The 8 qt stockpot, read FROM THE REGISTRY rather than transcribed.
 *
 * The first draft of this file hardcoded a 0.05 m² base and a 3 mm wall, which
 * are plausible and are not this pot: it is 240 mm internally with a 4 mm base
 * in 304 stainless. Transcribing a vessel into a view is how a registry stops
 * being the source of truth.
 *
 * ⚠️ Returns null rather than throwing. An earlier version threw from inside a
 * `useMemo`, with no error boundary above it, so a registry edit would blank
 * the whole tab instead of the two cards that depend on the pot.
 */
function stockpotLeg(): VesselLeg | null {
  const pot = getVessel("stockpot_8qt");
  if (!pot) return null;
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
  /** null is a REFUSAL — never a zeroed chain, never a fabricated link. */
  network: BoundaryNetworkResult | null;
  /** Why the chain is absent. Only meaningful when `network` is null. */
  reason: string;
}

export function ComparisonPanel(): React.JSX.Element {
  // The solver is async to CREATE and synchronous to CALL, so it is built once
  // here and held, rather than awaited inside a render path.
  const [solver, setSolver] = useState<BoundarySolver | null>(null);

  useEffect(() => {
    let disposed = false;
    void createBoundarySolver().then((s) => {
      if (!disposed) setSolver(s);
    });
    return () => {
      disposed = true;
    };
  }, []);

  // Three solves per engine, not three per render.
  const solved = useMemo(() => {
    if (!solver) return null;
    const pot = stockpotLeg();

    const oven: Arrangement = {
      id: "oven",
      title: "200 °C oven, on a rack",
      note: "No vessel at all. The chain has two links because the arrangement has two — not five with three left blank.",
      network: solver.solve({
        sourceC: 200,
        sinkC: 20,
        food: { ...FOOD, mediumToFoodHWm2K: 15 },
      }),
      reason: REFUSED_REASON,
    };

    const boiling: Arrangement = {
      id: "boiling",
      title: "Boiling water, 8 qt stockpot",
      note: "Same potato. The medium is now 100× better at moving heat, so the food's own interior becomes the entire answer.",
      network: pot
        ? solver.solve({
            sourceC: 250,
            sinkC: 20,
            vessel: pot,
            food: { ...FOOD, mediumToFoodHWm2K: 1500 },
          })
        : null,
      reason: pot ? REFUSED_REASON : NO_POT_REASON,
    };

    const empty: Arrangement = {
      id: "empty",
      title: "Empty pot on a burner",
      note: "No food in the chain, so no Biot number. The tool says so rather than printing one.",
      network: pot ? solver.solve({ sourceC: 250, sinkC: 100, vessel: pot }) : null,
      reason: pot ? REFUSED_REASON : NO_POT_REASON,
    };

    return { oven, boiling, all: [oven, boiling, empty] };
  }, [solver]);

  if (!solver || !solved) {
    return (
      <div className="ma-solver ma-compare">
        <header className="ma-compare__head">
          <h2>Same food, opposite bottleneck.</h2>
          <p className="ma-note">Loading the physics engine…</p>
        </header>
      </div>
    );
  }

  const { oven, boiling, all } = solved;
  const wallLink = boiling.network?.links.find((l) => l.id === "vessel-wall") ?? null;
  const airLink = oven.network?.links.find((l) => l.id === "medium-to-food") ?? null;
  // The strip reads one link out of each of two columns, so it can lose either.
  const stripReason = !wallLink ? boiling.reason : !airLink ? oven.reason : null;

  return (
    <div className="ma-solver ma-compare">
      <header className="ma-compare__head">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2>Same food, opposite bottleneck.</h2>
          <EngineBadge engine={solver.engine} />
        </div>
        <p className="ma-note">
          One 50 mm potato, k = {FOOD.kWmK} W·m⁻¹·K⁻¹, in three arrangements. Nothing about the
          food changes between columns — every chain below is solved from the same object. What
          changes is which link is slowest, and that is what decides whether a hotter medium, more
          stirring, or a thinner cut is the thing that helps.
        </p>
      </header>

      <div className="ma-compare__grid">
        {all.map((a) => (
          <article key={a.id} className="ma-card">
            <h3>{a.title}</h3>
            <p className="ma-compare__count">
              {a.network
                ? `${a.network.links.length} link${a.network.links.length === 1 ? "" : "s"}`
                : "no chain"}
            </p>
            {a.network ? (
              <ResistanceChain network={a.network} />
            ) : (
              <p className="ma-refusal">
                <Refused reason={a.reason} /> {a.reason}
              </p>
            )}
            <p className="ma-note">{a.note}</p>
          </article>
        ))}
      </div>

      <article className="ma-card ma-card--wide ma-compare__strip">
        <h3>the pan is never the bottleneck</h3>
        <p className="ma-note">
          In the boiling column the vessel wall holds{" "}
          <strong>
            {wallLink ? (
              `${(wallLink.share * 100).toFixed(2)} %`
            ) : (
              <Refused reason={stripReason ?? REFUSED_REASON} />
            )}
          </strong>{" "}
          of the total resistance (
          {wallLink ? (
            `${wallLink.resistanceKperW.toExponential(2)} K·W⁻¹`
          ) : (
            <Refused reason={stripReason ?? REFUSED_REASON} />
          )}
          ), against{" "}
          {airLink ? (
            `${airLink.resistanceKperW.toExponential(2)} K·W⁻¹`
          ) : (
            <Refused reason={stripReason ?? REFUSED_REASON} />
          )}{" "}
          for the air above the roast in the oven column — a factor of{" "}
          <strong>
            {wallLink && airLink ? (
              `${Math.round(airLink.resistanceKperW / wallLink.resistanceKperW).toLocaleString()}×`
            ) : (
              <Refused reason={stripReason ?? REFUSED_REASON} />
            )}
          </strong>
          .
        </p>
        {wallLink && airLink ? (
          <div className="ma-compare__bars">
            <Bar
              label="vessel wall, 3 mm"
              value={wallLink.resistanceKperW}
              max={airLink.resistanceKperW}
              accent
            />
            <Bar
              label="still air over a roast"
              value={airLink.resistanceKperW}
              max={airLink.resistanceKperW}
            />
          </div>
        ) : (
          // A bar whose length is a resistance cannot be drawn without one.
          // Drawing an empty track would read as "zero resistance", which is
          // the opposite of what a refusal means.
          <p className="ma-refusal">
            <Refused reason={stripReason ?? REFUSED_REASON} /> {stripReason ?? REFUSED_REASON}
          </p>
        )}
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
 * Which engine produced the chains above.
 *
 * Reads `solver.engine`, the engine that ran. `public/wasm` is gitignored, so a
 * checkout that has not run `bun run build:wasm` takes the TypeScript path and
 * this must say so — a badge that claimed WASM regardless would be describing a
 * build step the reader may never have performed.
 *
 * Both class strings are literal on purpose: Tailwind's scanner cannot see an
 * interpolated `border-${x}-400/30`.
 */
function EngineBadge({ engine }: { engine: "wasm" | "typescript" }): React.JSX.Element {
  return (
    <span
      className={
        engine === "wasm"
          ? "rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-200"
          : "rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-200"
      }
      title={
        engine === "wasm"
          ? "Compiled Rust, under a byte-parity contract with the TypeScript kernel."
          : "public/wasm is not built in this checkout — running the TypeScript half of the same parity contract. Run `bun run build:wasm` for the compiled engine."
      }
    >
      {engine === "wasm" ? "Rust · WASM" : "TypeScript fallback"}
    </span>
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
