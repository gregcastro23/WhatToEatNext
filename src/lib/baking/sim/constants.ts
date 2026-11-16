/**
 * The simulator's constants, each with its basis.
 *
 * Two kinds live here and are labelled apart:
 * - LITERATURE values (MEASURED / DERIVED): Henry's law for CO₂, the crust
 *   browning activation energy, the sucrose shift of starch gelatinization.
 * - MODEL choices (DECLARED): thresholds and display scales that no source
 *   supplies. They are listed on the Sources tab with their reason, the way
 *   `VAPOUR_ESCAPE_FRACTION` is in the vessel registry. Replace one with a
 *   measurement when one exists; do not tune it to make a preset look right.
 *
 * @file src/lib/baking/sim/constants.ts
 */
import type { Basis } from "../types";

export interface SimConstant {
  value: number;
  unit: string;
  label: string;
  basis: Basis;
}

/** Cassava starch DSC ranges across varieties (To and Tc), °C — the basis of the gelatinization window width. */
const CASSAVA_TO_RANGE = [56.33, 63.0];
const CASSAVA_TC_RANGE = [69.1, 77.12];
function midpoint(range: readonly number[]): number {
  return ((range[0] ?? 0) + (range[1] ?? 0)) / 2;
}

export const SIM = {
  henryCo2At298: { value: 3.3e-4, unit: "mol·m⁻³·Pa⁻¹", label: "CO₂ solubility at 298.15 K", basis: { kind: "MEASURED", source: "SANDER_2023" } },
  henryCo2RefK: { value: 298.15, unit: "K", label: "Henry's-law reference temperature", basis: { kind: "MEASURED", source: "SANDER_2023" } },
  henryCo2TempDependenceK: { value: 2400, unit: "K", label: "d ln H / d(1/T) for CO₂", basis: { kind: "MEASURED", source: "SANDER_2023", note: "evaluated entries span 2300–2600 K" } },
  browningEaJMol: { value: 64151, unit: "J·mol⁻¹", label: "Crust browning activation energy", basis: { kind: "MEASURED", source: "ZANONI_1995", note: "first-order ΔE kinetics on bread crust, 140–250 °C" } },
  browningRefC: { value: 150, unit: "°C", label: "Browning dose reference temperature", basis: { kind: "DECLARED", source: "MODEL", note: "dose = equivalent minutes at this temperature; inside Zanoni's 140–250 °C range" } },
  browningScaleMin: { value: 5, unit: "eq-min", label: "Browning display: knee of the scale", basis: { kind: "DECLARED", source: "MODEL", note: "display only: extent = ln(1 + dose/knee) ÷ ln(1 + full/knee)" } },
  browningFullDose: { value: 600, unit: "eq-min", label: "Browning display: dose shown as fully dark", basis: { kind: "DECLARED", source: "MODEL", note: "anchored so the 45-minute, 250 °C hearth-loaf preset (dose ≈ 380) reads about 0.9, deep brown rather than burnt" } },
  reducingSugarWeight: { value: 8, unit: "per dry fraction", label: "Reducing-sugar weight in browning rate", basis: { kind: "DECLARED", source: "MODEL", note: "rate × (1 + w·reducing-sugar dry fraction); no source quantifies it" } },
  crumbTortuosity: { value: 2, unit: "—", label: "Crumb tortuosity for vapour diffusion", basis: { kind: "DECLARED", source: "PHILIP_DEVRIES_1957", note: "porous-media tortuosities run about 1.5–3; vapour-enhanced conductivity scales as 1/τ" } },
  gasRetentionRefRatio: { value: 1, unit: "structure:tenderiser", label: "Gas retention: ratio that holds all its gas", basis: { kind: "DECLARED", source: "MODEL", note: "retention = clamp(ratio ÷ this, floor, 1): a fat- and sugar-heavy matrix cannot hold the gas a gluten or egg network can" } },
  gasRetentionFloor: { value: 0.2, unit: "fraction", label: "Gas retention floor", basis: { kind: "DECLARED", source: "MODEL" } },
  maxPorosity: { value: 0.9, unit: "fraction", label: "Gas-cell rupture porosity", basis: { kind: "DECLARED", source: "MODEL", note: "cells vent past this porosity; bread and sponge crumbs sit below it" } },
  vapourCapFraction: { value: 0.95, unit: "of P", label: "Cell vapour-pressure cap", basis: { kind: "DECLARED", source: "MODEL", note: "numerical guard on V ∝ 1/(P − p_w) at the boil" } },
  crustDryRatio: { value: 0.25, unit: "of starting water", label: "Crust threshold", basis: { kind: "DECLARED", source: "MODEL", note: "a layer is crust once it holds under this share of its starting water" } },
  structureSetFraction: { value: 0.5, unit: "fraction", label: "Structure counts as set", basis: { kind: "DECLARED", source: "MODEL", note: "half of the starch-and-protein transition completed" } },
  gelWindowK: { value: midpoint(CASSAVA_TC_RANGE) - midpoint(CASSAVA_TO_RANGE), unit: "K", label: "Gelatinization window width", basis: { kind: "DERIVED", source: "CASSAVA_DSC_2019", note: "Tc − To between the midpoints of the cassava variety ranges, applied to every starch by analogy" } },
  sucroseSpecificVolumeMlG: { value: 0.62, unit: "mL·g⁻¹", label: "Apparent specific volume of dissolved sucrose", basis: { kind: "DECLARED", source: "MODEL", note: "converts g sucrose per g water to molarity for the Allan et al. shift; about ±2 %" } },
  sodaOnsetC: { value: 60, unit: "°C", label: "Excess-soda decomposition onset", basis: { kind: "DECLARED", source: "MODEL", note: "no peer-reviewed dough value was found; reported onsets span 50–110 °C" } },
  sodaEndC: { value: 100, unit: "°C", label: "Excess-soda decomposition complete", basis: { kind: "DECLARED", source: "MODEL", note: "in solution the release is essentially complete at the boil" } },
  powderMixingFraction: { value: 0.35, unit: "of CO₂", label: "Baking powder CO₂ released at mixing", basis: { kind: "DECLARED", source: "ASB_DOUBLE_ACTING", note: "MCP gives 60–70 % of its CO₂ in mixing, SAS almost none; the split depends on the blend" } },
  powderHeatOnsetC: { value: 40, unit: "°C", label: "Baking powder heat-release onset", basis: { kind: "DECLARED", source: "MODEL" } },
  powderHeatEndC: { value: 70, unit: "°C", label: "Baking powder heat-release complete", basis: { kind: "DECLARED", source: "MODEL" } },
  yeastDeathC: { value: 60, unit: "°C", label: "Baker's yeast killed in dough", basis: { kind: "MEASURED", source: "ASB_BAKING", note: "trade reference range 50–60 °C; no primary thermal-death kinetics study was found" } },
  scorchExtent: { value: 0.95, unit: "extent", label: "Scorch threshold", basis: { kind: "DECLARED", source: "MODEL", note: "browning extent treated as burnt" } },
  collapseVentShare: { value: 0.1, unit: "of mass", label: "Collapse: unset mass that vented", basis: { kind: "DECLARED", source: "MODEL" } },
  gummyWaterToStarch: { value: 1, unit: "g water per g starch", label: "Gummy: enough water to have gelatinized", basis: { kind: "DECLARED", source: "MODEL", note: "below this the starch could never fully gelatinize (a cookie sets by drying instead), so an incomplete window is not a gummy crumb" } },
  denseFinalPorosity: { value: 0.5, unit: "fraction", label: "Dense crumb: final core porosity below", basis: { kind: "DECLARED", source: "MODEL" } },
  dryLossPct: { value: 20, unit: "% mass", label: "Over-dried: bake loss above", basis: { kind: "DECLARED", source: "ASB_BAKING", note: "pan bread loses 8–12 %, hearth loaves up to about 20 %" } },
} satisfies Record<string, SimConstant>;

export type SimConstantId = keyof typeof SIM;
