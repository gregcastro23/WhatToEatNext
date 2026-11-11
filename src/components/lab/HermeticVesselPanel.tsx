"use client";

import { useMemo, type JSX } from "react";
import { readVessel, type VesselReading } from "@/lib/cooking/thermoVessel";
import type { VesselState } from "@/lib/cooking/vesselState";
import { CitationChip, Refused } from "./CitationChip";
import { useVesselState } from "./useVesselState";
import { VesselControls } from "./vessel/VesselControls";
import { VesselReadouts } from "./vessel/VesselReadouts";
import { VesselRegimes } from "./vessel/VesselRegimes";

/**
 * The Hermetic Vessel — what pressure, temperature and headspace humidity do
 * to water in a pot, in SI, from IAPWS-IF97.
 *
 * ## What it deliberately does not show
 *
 * - **An evaporation rate.** A mass flux needs a headspace mass-transfer
 *   coefficient, and none of the repo's correlations is sourced for one.
 *   Δp_v, the driving force, is shown instead (RULED 2026-11-11).
 * - **Reaction rates.** No activation energies in the repo are sourced, so the
 *   chemistry is shown as cited regimes, not as k(T) numbers.
 * - **Nucleate boiling.** That depends on wall superheat, which the vessel
 *   model does not resolve; the boiling state is read against T_sat only.
 *
 * The same vessel drives the alchm simulator on /kitchen-lab/alchm
 * (`useVesselState`), which maps these SI readings onto its circuit and
 * labels every mapping as a ruling.
 *
 * @file src/components/lab/HermeticVesselPanel.tsx
 */

type Outcome = { ok: true; reading: VesselReading } | { ok: false; reason: string };

function read(vessel: VesselState): Outcome {
  try {
    return { ok: true, reading: readVessel(vessel) };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

function Header(): JSX.Element {
  return (
    <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Hermetic Vessel</h2>
        <p className="mt-1 max-w-2xl text-xs text-white/45">
          Seal a pot and its water boils hotter; pull a vacuum and it boils cooler. The saturation
          ceiling, the latent heat and the vapour exchange with the headspace all follow from the
          steam tables.
        </p>
      </div>
      <CitationChip work="IAPWS-IF97" locator="R7-97(2012) — regions 1, 2 and 4" />
    </header>
  );
}

function Readings({ reading, vessel }: { reading: VesselReading; vessel: VesselState }): JSX.Element {
  return (
    <>
      <VesselReadouts reading={reading} />
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <VesselRegimes
          title="While free water remains"
          temperatureC={reading.wetSurfaceC}
          regimes={reading.regimesWhileWet}
        />
        {reading.aboveCeiling ? (
          <VesselRegimes
            title="Once the surface dries"
            temperatureC={vessel.temperatureC}
            regimes={reading.regimesOnceDry}
          />
        ) : (
          <p className="self-start text-xs leading-relaxed text-white/40">
            The setpoint is at or below the boiling point, so a surface that still holds water can
            reach it: there is no separate dry-surface reading.
          </p>
        )}
      </div>
    </>
  );
}

export function HermeticVesselPanel({ className }: { className?: string }): JSX.Element {
  const { vessel, update, setVessel } = useVesselState();
  const outcome = useMemo(() => read(vessel), [vessel]);
  return (
    <section className={className}>
      <Header />
      <VesselControls vessel={vessel} onPatch={update} onPreset={setVessel} />
      <div className="mt-6">
        {outcome.ok ? (
          <Readings reading={outcome.reading} vessel={vessel} />
        ) : (
          <p className="text-sm text-white/50">
            Outside IF97: <Refused reason={outcome.reason} />
          </p>
        )}
      </div>
      <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-white/45">
        No evaporation rate is shown: it would need a headspace mass-transfer coefficient, and none
        is sourced here. No charring onset is shown: no source consulted gave one. Regimes are
        onsets, not a partition — several run at once.
      </p>
    </section>
  );
}
