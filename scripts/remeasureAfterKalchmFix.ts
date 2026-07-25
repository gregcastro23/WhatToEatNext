/**
 * Re-measure every constant derived from kalchm, AFTER the exact-zero fix.
 *
 * No DB. Both grids are deterministic, so these are censuses.
 * Run from the branch that HAS the fix, or the numbers are the old ones.
 */
import {
  calculateKalchm,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";
import { getDignityScore } from "@/utils/dignityScales";
import { PLANETARY_SECTARIAN_ESMS, ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";
import { groundingVessel, agentMonicaForSect, type ESMS } from "@/utils/agentMonica";
import { twoBodyState, twoBodyMonicaForSect } from "@/utils/agentMonicaTwoBody";
import type { AlchemicalProperties } from "@/types/celestial";

const ZERO: ESMS = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
const SIGNS = Object.keys(ZODIAC_ELEMENTS);
const PLANETS = Object.keys(PLANETARY_SECTARIAN_ESMS);
const SECTS = ["diurnal", "nocturnal"] as const;
const p = (n: number) => n.toPrecision(17);

function widestGap(sorted: number[], below = 0.5) {
  let best = { lo: 0, hi: 0, width: 0 };
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] >= below) break;
    const w = sorted[i] - sorted[i - 1];
    if (w > best.width) best = { lo: sorted[i - 1], hi: sorted[i], width: w };
  }
  return best;
}

// ─────────────────────────────────────────── 1. single-body |ln kalchm| gap ──
const singleLn: number[] = [];
const singleMonica: number[] = [];
for (const planet of PLANETS) {
  const table = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
  for (const sign of SIGNS) {
    const ds = getDignityScore(planet, sign as never).esmsScale;
    for (let degree = 0; degree < 30; degree++) {
      const v = groundingVessel(degree, ds);
      for (const sect of SECTS) {
        const base: ESMS = table ? { ...ZERO, ...table[sect] } : ZERO;
        const esms: ESMS = {
          Spirit: base.Spirit + v.Spirit,
          Essence: base.Essence + v.Essence,
          Matter: base.Matter + v.Matter,
          Substance: base.Substance + v.Substance,
        };
        const k = calculateKalchm(esms as AlchemicalProperties);
        if (Number.isFinite(k) && k > 0) singleLn.push(Math.abs(Math.log(k)));
        singleMonica.push(agentMonicaForSect(planet, sign, degree, sect));
      }
    }
  }
}
singleLn.sort((a, b) => a - b);
const sg = widestGap(singleLn);
const sMid = (sg.lo + sg.hi) / 2;

console.log("=".repeat(76));
console.log("1. SINGLE-BODY |ln kalchm| GAP");
console.log("=".repeat(76));
console.log(`  n                    ${singleLn.length}`);
console.log(`  degenerate ceiling   ${p(sg.lo)}`);
console.log(`  healthy floor        ${p(sg.hi)}`);
console.log(`  gap width            ${p(sg.width)}`);
console.log(`  MIDPOINT (epsilon)   ${p(sMid)}`);
console.log(`  band captures        ${singleLn.filter((x) => x < sMid).length} / ${singleLn.length}`);
console.log(`  current constant     ${p(MONICA_LN_EPSILON)}  ${Math.abs(MONICA_LN_EPSILON - sMid) < 1e-12 ? "MATCHES" : "*** STALE ***"}`);

// ───────────────────────────────────────────── 2. two-body |ln kalchm| gap ──
// Comixion degrees (8/22) are the degenerate family — vessel Essence is 0 there.
const isComixion = (d: number) => d === 8 || d === 22;
const twoLnDegen: number[] = [];
const twoLnHealthy: number[] = [];
const twoMonica: number[] = [];
for (const sign of SIGNS) {
  for (let degree = 0; degree < 30; degree++) {
    for (const sect of SECTS) {
      for (const phase of ["waxing gibbous", "full moon", "new moon", "waning crescent"]) {
        const st = twoBodyState(phase, sign, degree, sect);
        const ln = Math.abs((st.lnKalchm as number) ?? NaN);
        if (Number.isFinite(ln)) (isComixion(degree) ? twoLnDegen : twoLnHealthy).push(ln);
        const m = twoBodyMonicaForSect(phase, sign, degree, sect);
        if (Number.isFinite(m)) twoMonica.push(m);
      }
    }
  }
}
twoLnDegen.sort((a, b) => a - b);
twoLnHealthy.sort((a, b) => a - b);

console.log("");
console.log("=".repeat(76));
console.log("2. TWO-BODY |ln kalchm| GAP  (degenerate = Comixion degrees 8/22)");
console.log("=".repeat(76));
console.log(`  degenerate n         ${twoLnDegen.length}   max |ln k|  ${p(twoLnDegen[twoLnDegen.length - 1])}`);
console.log(`  healthy n            ${twoLnHealthy.length}   min |ln k|  ${p(twoLnHealthy[0])}`);
const separable = twoLnDegen[twoLnDegen.length - 1] < twoLnHealthy[0];
console.log(`  cleanly separable    ${separable ? "YES" : "NO — they OVERLAP, midpoint derivation invalid"}`);
if (separable) {
  const mid = (twoLnDegen[twoLnDegen.length - 1] + twoLnHealthy[0]) / 2;
  console.log(`  MIDPOINT (epsilon)   ${p(mid)}`);
  console.log(`  collateral (healthy below midpoint): ${twoLnHealthy.filter((x) => x < mid).length}  (must be 0)`);
} else {
  console.log(`  degenerate max ${p(twoLnDegen[twoLnDegen.length - 1])} >= healthy min ${p(twoLnHealthy[0])}`);
}

// ───────────────────────────────────────────────── 3. Sacred-7 |max|/2 ──────
const absMax = (xs: number[]) => Math.max(...xs.map(Math.abs));
console.log("");
console.log("=".repeat(76));
console.log("3. SACRED-7 SCALES  (|max| / 2)");
console.log("=".repeat(76));
console.log(`  single-body  |max| ${p(absMax(singleMonica))}  -> scale ${p(absMax(singleMonica) / 2)}   (was 1.9875)`);
console.log(`  two-body     |max| ${p(absMax(twoMonica))}  -> scale ${p(absMax(twoMonica) / 2)}   (was 2.7095)`);
console.log(`  full-chart   needs the DB (71 stored rows) — measure separately`);
