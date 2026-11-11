/**
 * The tabs of /kitchen-lab/physics and the `?tab=` contract.
 *
 * Kept out of page.tsx because a Next.js page module may only export the
 * page itself, and the tab contract needs tests: the
 * /cooking-methods/tilt-skillet redirect lands on `?tab=vessel`, and a parse
 * that quietly fell back to the solver would send that traffic to the wrong
 * panel with nothing failing.
 *
 * @file src/app/(alchm)/kitchen-lab/physics/physicsTabs.ts
 */

export type PhysicsTab =
  | "solver"
  | "compare"
  | "boundaries"
  | "volumetrics"
  | "latent"
  | "reduction"
  | "transfer"
  | "vessel";

export const PHYSICS_TABS: ReadonlyArray<[PhysicsTab, string, string]> = [
  ["solver", "Thermal solver", "One arrangement, solved end to end"],
  ["compare", "Compare", "Three arrangements against one food"],
  ["boundaries", "Boundaries", "Property tables and correlations"],
  ["volumetrics", "Volumetrics", "Measured mass per volume"],
  ["latent", "Latent heat", "Phase-change energy, through the Rust engine"],
  ["reduction", "Reduction & Live Pot", "Simmer reduction, glaze milestones, and collaborative kitchen pot sync"],
  ["transfer", "Medium transfer", "Heat crossing atmosphere → vessel → solution → food"],
  ["vessel", "Hermetic Vessel", "Pressure, saturation ceiling, and headspace vapour across 10–250 kPa"],
];

export const DEFAULT_PHYSICS_TAB: PhysicsTab = "solver";

export function isPhysicsTab(value: string | null): value is PhysicsTab {
  return PHYSICS_TABS.some(([id]) => id === value);
}

/** The tab a `?tab=` value names; anything unknown or absent is the solver. */
export function tabFromParam(value: string | null): PhysicsTab {
  return isPhysicsTab(value) ? value : DEFAULT_PHYSICS_TAB;
}

/** The URL for a tab: the default tab drops the parameter, others set it; other parameters survive. */
export function urlForTab(href: string, tab: PhysicsTab): string {
  const url = new URL(href);
  if (tab === DEFAULT_PHYSICS_TAB) url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  return url.toString();
}
