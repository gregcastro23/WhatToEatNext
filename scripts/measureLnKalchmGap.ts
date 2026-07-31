/**
 * Is there a GAP in |ln(kalchm)| that MONICA_LN_EPSILON should sit in?
 *
 * No database needed. The single-body population is a deterministic grid
 * (planet x sign x degree x sect), so this is exhaustive, not a sample.
 *
 * Why it matters: MONICA_LN_EPSILON = 0.05 is self-described as a "tunable knob".
 * agentMonicaTwoBody instead DERIVES its band as the midpoint between two
 * measured quantities:
 *     DEGENERATE_LN_KALCHM   = 0.110698   (vessel Essence exactly 0)
 *     HEALTHY_LN_KALCHM_FLOOR = 0.138173  (smallest non-degenerate |ln k|)
 *     TWO_BODY_LN_EPSILON = (0.110698 + 0.138173) / 2 = 0.1244355
 *
 * That derivation only works if the distribution is BIMODAL — a cluster of
 * degenerate values, a gap, then the healthy values. This measures whether the
 * single-body population has the same shape, and where its gap is.
 *
 * If there is no gap, the band cannot be derived this way and any epsilon is a
 * threshold on a continuum — which would be worth knowing before "deriving" one.
 */
import {
  calculateKalchm,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";
import { getDignityScore } from "@/utils/dignityScales";
import {
  PLANETARY_SECTARIAN_ESMS,
  ZODIAC_ELEMENTS,
} from "@/utils/planetaryAlchemyMapping";
import { groundingVessel, type ESMS } from "@/utils/agentMonica";
import type { AlchemicalProperties } from "@/types/celestial";

const ZERO: ESMS = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
const SIGNS = Object.keys(ZODIAC_ELEMENTS);
const PLANETS = Object.keys(PLANETARY_SECTARIAN_ESMS);
const SECTS = ["diurnal", "nocturnal"] as const;

interface Sample {
  planet: string;
  sign: string;
  degree: number;
  sect: string;
  kalchm: number;
  absLn: number;
  essence: number;
}

const samples: Sample[] = [];

for (const planet of PLANETS) {
  const table = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
  for (const sign of SIGNS) {
    const dignityScale = getDignityScore(planet, sign as never).esmsScale;
    const element = ZODIAC_ELEMENTS[sign as keyof typeof ZODIAC_ELEMENTS];
    const elementalProps = {
      Fire: element === "Fire" ? 1 : 0,
      Water: element === "Water" ? 1 : 0,
      Air: element === "Air" ? 1 : 0,
      Earth: element === "Earth" ? 1 : 0,
    };
    for (let degree = 0; degree < 30; degree++) {
      const v = groundingVessel(degree, dignityScale);
      for (const sect of SECTS) {
        const base: ESMS = table ? { ...ZERO, ...table[sect] } : ZERO;
        const esms: ESMS = {
          Spirit: base.Spirit + v.Spirit,
          Essence: base.Essence + v.Essence,
          Matter: base.Matter + v.Matter,
          Substance: base.Substance + v.Substance,
        };
        const kalchm = calculateKalchm(esms as AlchemicalProperties);
        if (!Number.isFinite(kalchm) || kalchm <= 0) continue;
        const absLn = Math.abs(Math.log(kalchm));
        samples.push({ planet, sign, degree, sect, kalchm, absLn, essence: esms.Essence });
      }
    }
  }
}

console.log(`exhaustive single-body grid: ${samples.length} points`);
console.log(`  ${PLANETS.length} planets x ${SIGNS.length} signs x 30 degrees x 2 sects`);
console.log(`current MONICA_LN_EPSILON = ${MONICA_LN_EPSILON}`);
console.log("=".repeat(74));

// ── the low tail, where the band lives ──────────────────────────────────────
const sorted = [...samples].sort((a, b) => a.absLn - b.absLn);
console.log(`\nSMALLEST 25 |ln kalchm| values (the band's neighbourhood):`);
console.log(`   #  |ln k|      kalchm     Essence  planet/sign/deg/sect`);
sorted.slice(0, 25).forEach((s, i) => {
  console.log(
    `  ${String(i + 1).padStart(2)}  ${s.absLn.toFixed(6)}  ${s.kalchm.toFixed(6)}  ` +
      `${s.essence.toFixed(3).padStart(7)}  ${s.planet} ${s.sign} ${s.degree} ${s.sect}`,
  );
});

// ── is there a GAP? find the largest jump in the low tail ───────────────────
console.log(`\nLARGEST GAPS in the low tail (|ln k| < 0.5):`);
const lowTail = sorted.filter((s) => s.absLn < 0.5);
const gaps: Array<{ lo: number; hi: number; width: number; idx: number }> = [];
for (let i = 1; i < lowTail.length; i++) {
  const lo = lowTail[i - 1].absLn;
  const hi = lowTail[i].absLn;
  if (hi - lo > 0) gaps.push({ lo, hi, width: hi - lo, idx: i });
}
gaps.sort((a, b) => b.width - a.width);
console.log(`  width      between            midpoint    rows below`);
for (const g of gaps.slice(0, 8)) {
  const mid = (g.lo + g.hi) / 2;
  const below = samples.filter((s) => s.absLn < mid).length;
  console.log(
    `  ${g.width.toFixed(6)}  ${g.lo.toFixed(6)} -> ${g.hi.toFixed(6)}  ` +
      `${mid.toFixed(6)}  ${String(below).padStart(6)}`,
  );
}

// ── how many points does each candidate epsilon capture? ────────────────────
console.log(`\nHOW MANY GRID POINTS FALL INSIDE EACH CANDIDATE BAND:`);
const CANDIDATES = [
  ["0.05  (current, CHOSEN)", 0.05],
  ["0.1244355 (two-body, DERIVED)", 0.1244355],
] as const;
for (const [label, eps] of CANDIDATES) {
  const n = samples.filter((s) => s.absLn < eps).length;
  console.log(`  ${label.padEnd(32)} ${String(n).padStart(6)} / ${samples.length}  (${((n / samples.length) * 100).toFixed(2)}%)`);
}
if (gaps.length) {
  const best = gaps[0];
  const mid = (best.lo + best.hi) / 2;
  const n = samples.filter((s) => s.absLn < mid).length;
  console.log(
    `  ${`${mid.toFixed(7)} (widest gap, DERIVED)`.padEnd(32)} ${String(n).padStart(6)} / ${samples.length}  (${((n / samples.length) * 100).toFixed(2)}%)`,
  );
}

// ── does Essence == 0 explain the degenerate cluster, as in two-body? ───────
console.log(`\nIS THE DEGENERATE CLUSTER EXPLAINED BY Essence == 0?  (two-body's rule)`);
const zeroEss = samples.filter((s) => s.essence === 0);
console.log(`  grid points with Essence exactly 0 : ${zeroEss.length}`);
if (zeroEss.length) {
  const lns = zeroEss.map((s) => s.absLn).sort((a, b) => a - b);
  console.log(`  their |ln k| range                 : [${lns[0].toFixed(6)}, ${lns[lns.length - 1].toFixed(6)}]`);
  const nonZero = samples.filter((s) => s.essence !== 0).map((s) => s.absLn).sort((a, b) => a - b);
  console.log(`  Essence != 0, smallest |ln k|       : ${nonZero[0].toFixed(6)}`);
  const separable = lns[lns.length - 1] < nonZero[0];
  console.log(`  cleanly separable?                 : ${separable ? "YES — a derivation exists" : "NO — the two overlap"}`);
  if (separable) {
    console.log(`  => derived epsilon = (${lns[lns.length - 1].toFixed(6)} + ${nonZero[0].toFixed(6)}) / 2 = ${((lns[lns.length - 1] + nonZero[0]) / 2).toFixed(7)}`);
  }
}
