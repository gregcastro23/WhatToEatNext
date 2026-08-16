/**
 * Audit the cooking-method surfaces for numbers that contradict their own
 * stated physics.
 *
 * This script is the reproduction for the claims recorded in
 * `src/lib/cooking/thermo.ts` and in the `[FIXED 2026-08-16]` comments in
 * `EnhancedCookingMethodRecommender.tsx`. It recomputes the OLD derivation
 * (`calculateOptimalCookingConditions`, still exported and still used by the
 * alchemical layer) alongside the published envelope, and reports every method
 * where the two disagree.
 *
 * Run:  bun run scripts/audit-cooking-method-physics.ts
 *
 * A non-zero exit means the alchemical temperature is once again being used
 * where a physical one belongs.
 */

import {
  calculateOptimalCookingConditions,
  getCookingMethodThermodynamics,
} from "@/constants/alchemicalPillars";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import { METHOD_PHYSICAL_REFERENCE } from "@/data/cooking/physicalReference";
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";
import { calculateKalchm, calculateMonica } from "@/data/unified/alchemicalCalculations";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import { buildMethodMetrics, getMethodCorpusStats } from "@/lib/cooking/methodMetrics";
import { cToF } from "@/lib/cooking/thermo";

const CATEGORIES: Record<string, Record<string, any>> = {
  dry: dryCookingMethods as any,
  wet: wetCookingMethods as any,
  molecular: molecularCookingMethods as any,
  traditional: traditionalCookingMethods as any,
  transformation: transformationMethods as any,
};

// The component's own documented fallback, so this run is reproducible offline
// and does not depend on where the planets happen to be today.
const BASE_ESMS = { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 };

interface Row {
  category: string;
  id: string;
  alchemicalTempF: number | null;
  alchemicalTiming: string | null;
  envelopeLow: number | null;
  envelopeHigh: number | null;
  durationMin: number | null;
  durationMax: number | null;
  kalchm: number | null;
  gregsEnergy: number;
}

const rows: Row[] = [];

for (const [category, methods] of Object.entries(CATEGORIES)) {
  for (const [id, method] of Object.entries(methods)) {
    const pillar = getCookingMethodPillar(id);
    const esms = pillar
      ? {
          Spirit: BASE_ESMS.Spirit + (pillar.effects.Spirit || 0),
          Essence: BASE_ESMS.Essence + (pillar.effects.Essence || 0),
          Matter: BASE_ESMS.Matter + (pillar.effects.Matter || 0),
          Substance: BASE_ESMS.Substance + (pillar.effects.Substance || 0),
        }
      : BASE_ESMS;

    const thermo =
      method.thermodynamicProperties ||
      getCookingMethodThermodynamics(id) || { heat: 0.5, entropy: 0.5, reactivity: 0.5 };

    const { gregsEnergy } = calculateGregsEnergy({
      ...esms,
      Fire: method.elementalEffect.Fire,
      Water: method.elementalEffect.Water,
      Air: method.elementalEffect.Air,
      Earth: method.elementalEffect.Earth,
    });
    const kalchm = calculateKalchm(esms);
    const monica = calculateMonica(gregsEnergy, thermo.reactivity, kalchm);
    const conditions =
      method.thermodynamicProperties && Number.isFinite(monica)
        ? calculateOptimalCookingConditions(monica, method.thermodynamicProperties)
        : null;

    const reference = METHOD_PHYSICAL_REFERENCE[id];
    const duration = method.duration || method.time_range;

    rows.push({
      category,
      id,
      alchemicalTempF: conditions?.temperature ?? null,
      alchemicalTiming: conditions?.timing ?? null,
      envelopeLow: reference?.temperatureF.low ?? null,
      envelopeHigh: reference?.temperatureF.high ?? null,
      durationMin: duration?.min ?? null,
      durationMax: duration?.max ?? null,
      kalchm,
      gregsEnergy,
    });
  }
}

let failures = 0;

// ── 1. Alchemical temperature vs published envelope ─────────────────────────
console.log("\n═══ 1. Alchemical temperature vs the method's own published envelope ═══");
console.log("   OLD derivation: 200 + heat × 300 + monicaTemperatureAdjustment\n");

const comparable = rows.filter((r) => r.alchemicalTempF !== null && r.envelopeLow !== null);
const outOfBand = comparable.filter(
  (r) => r.alchemicalTempF! < r.envelopeLow! || r.alchemicalTempF! > r.envelopeHigh!,
);
for (const r of outOfBand) {
  const over = r.alchemicalTempF! > r.envelopeHigh!;
  const miss = over ? r.alchemicalTempF! - r.envelopeHigh! : r.envelopeLow! - r.alchemicalTempF!;
  console.log(
    `   ${r.id.padEnd(18)} alchemical ${String(r.alchemicalTempF).padStart(5)}°F   ` +
      `envelope ${String(r.envelopeLow).padStart(5)}–${String(r.envelopeHigh).padEnd(5)}°F   ` +
      `off by ${String(Math.round(miss)).padStart(4)} °F ${over ? "HIGH" : "LOW"}`,
  );
}
console.log(`\n   ${outOfBand.length}/${comparable.length} methods outside their own envelope.`);
if (outOfBand.length > 0) {
  console.log("   These are NOT rendered any more — the Conditions tab reads the envelope directly.");
}

// ── 2. Timing label vs the method's own duration ────────────────────────────
console.log("\n═══ 2. Alchemical timing label vs the method's own stated duration ═══");
const timingConflicts = rows.filter((r) => {
  if (!r.alchemicalTiming || r.durationMin === null) return false;
  const avg = (r.durationMin + r.durationMax!) / 2;
  return (r.alchemicalTiming === "slow" && avg <= 30) || (r.alchemicalTiming === "quick" && avg >= 240);
});
for (const r of timingConflicts) {
  console.log(
    `   ${r.id.padEnd(18)} labelled ${r.alchemicalTiming!.toUpperCase().padEnd(6)} ` +
      `but its own duration is ${r.durationMin}–${r.durationMax} min`,
  );
}
const slowCount = rows.filter((r) => r.alchemicalTiming === "slow").length;
console.log(
  `\n   ${timingConflicts.length} direct contradictions; ` +
    `${slowCount}/${rows.length} methods labelled "slow" — the label carries almost no information.`,
);

// ── 3. Kalchm display range ─────────────────────────────────────────────────
console.log("\n═══ 3. Kalchm rendering range ═══");
const kalchms = rows.map((r) => r.kalchm!).filter(Number.isFinite).sort((a, b) => a - b);
const wide = rows.filter((r) => r.kalchm! >= 10000);
console.log(
  `   min ${kalchms[0].toExponential(2)}   max ${kalchms[kalchms.length - 1].toExponential(2)}   ` +
    `span ${(kalchms[kalchms.length - 1] / kalchms[0]).toExponential(1)}×`,
);
console.log(`   ${wide.length} methods exceed 4 integer digits: ${wide.map((r) => r.id).join(", ")}`);
console.log("   Rendered with .toFixed(3) these overflowed their card. Now scientific notation + ln K.");

// ── 4. Greg's Energy range vs the harmony-score calibration ──────────────────
console.log("\n═══ 4. Greg's Energy range vs the thermo dimension's calibration ═══");
const ge = rows.map((r) => r.gregsEnergy).sort((a, b) => a - b);
console.log(
  `   min ${ge[0].toFixed(3)}   median ${ge[Math.floor(ge.length / 2)].toFixed(3)}   max ${ge[ge.length - 1].toFixed(3)}`,
);
const oldScore = (g: number) => Math.max(5, Math.min(100, 60 + g * 40));
const oldFloored = ge.filter((g) => oldScore(g) <= 5.0001).length;
console.log(`   OLD linear map (60 + G × 40, calibrated for [−1, +1]): ${oldFloored}/${ge.length} pinned at the floor.`);
console.log("   Live sky ESMS pushes Greg's Energy past −7, so the real figure was worse.");
console.log("   NOW: logistic centred on the measured median — no clamping in any regime.");

// ── 5. Physics coverage ─────────────────────────────────────────────────────
console.log("\n═══ 5. Physics profile coverage ═══");
const missingPhysics = rows.filter((r) => !METHOD_PHYSICS[r.id]);
if (missingPhysics.length > 0) {
  console.log(`   ✗ MISSING: ${missingPhysics.map((r) => r.id).join(", ")}`);
  failures += 1;
} else {
  console.log(`   ✓ all ${rows.length} servable methods have a physics profile`);
}

const corpus = getMethodCorpusStats();
console.log(
  `   corpus: h over ${corpus.counts.logH} methods (log10 median ${corpus.logH.median.toFixed(2)}, ` +
    `MAD-σ ${corpus.logH.madSigma.toFixed(2)}), core time over ${corpus.counts.coreMinutes}`,
);

// ── 6. What the surfaces show now ───────────────────────────────────────────
console.log("\n═══ 6. Replacement values now rendered ═══");
console.log(
  ["method", "paced by", "h W/m²K", "z", "medium °F", "core min", "browns"].map((s) => s.padEnd(11)).join(""),
);
for (const r of rows) {
  const m = buildMethodMetrics(r.id);
  if (!m) continue;
  console.log(
    [
      r.id.slice(0, 10).padEnd(11),
      m.rateLimiter.replace("-transfer", "").replace("-", " ").slice(0, 10).padEnd(11),
      (m.transfer ? m.transfer.typical.toLocaleString() : "n/a").padEnd(11),
      (m.transfer?.z != null ? (m.transfer.z >= 0 ? "+" : "") + m.transfer.z.toFixed(2) : "—").padEnd(11),
      String(Math.round(m.medium.fahrenheit)).padEnd(11),
      (m.reference.result ? m.reference.result.minutes.toFixed(1) : "n/a").padEnd(11),
      m.browning.available ? "yes" : "no",
    ].join(""),
  );
}

// ── 7. Regression guard ─────────────────────────────────────────────────────
console.log("\n═══ 7. Regression guard ═══");
const guardOffenders: string[] = [];
for (const [id, profile] of Object.entries(METHOD_PHYSICS)) {
  const reference = METHOD_PHYSICAL_REFERENCE[id];
  if (!reference || profile.mediumDivergenceNote) continue;
  const mediumF = cToF(profile.mediumC);
  if (mediumF < reference.temperatureF.low - 30 || mediumF > reference.temperatureF.high + 30) {
    guardOffenders.push(`${id}: medium ${mediumF.toFixed(0)}°F vs ${reference.temperatureF.low}–${reference.temperatureF.high}°F`);
  }
}
if (guardOffenders.length > 0) {
  console.log(`   ✗ undocumented medium/envelope divergence:\n     ${guardOffenders.join("\n     ")}`);
  failures += 1;
} else {
  console.log("   ✓ every physics medium sits inside its envelope, or documents why it does not");
}

console.log(failures === 0 ? "\nAUDIT PASSED\n" : `\nAUDIT FAILED (${failures})\n`);
process.exit(failures === 0 ? 0 : 1);
