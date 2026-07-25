/**
 * The two-body band has no derivable gap after the kalchm exact-zero fix.
 * This measures the three candidate replacements so the choice is made on numbers.
 *
 * A. STRUCTURAL   — band exactly the cells whose vessel Essence is 0 (the CAUSE),
 *                   instead of thresholding |ln kalchm| (a PROXY for it).
 * B. BOUND        — pick the threshold that caps two-body monica at the
 *                   single-body envelope (3.8977146920667267).
 * C. NONE         — no band; accept whatever the formula gives.
 *
 * No DB. The two-body grid is deterministic.
 */
import { twoBodyState, twoBodyMonicaForSect } from "@/utils/agentMonicaTwoBody";
import { ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";
import { MONICA_EQUILIBRIUM } from "@/data/unified/alchemicalCalculations";

const SIGNS = Object.keys(ZODIAC_ELEMENTS);
const PHASES = [
  "new moon", "waxing crescent", "first quarter", "waxing gibbous", "full moon",
  "waning gibbous", "last quarter", "waning crescent", "dark moon",
];
const SECTS = ["diurnal", "nocturnal"] as const;
const SINGLE_BODY_ENVELOPE = 3.8977146920667267;

interface Cell {
  phase: string; sign: string; degree: number; sect: string;
  essence: number; absLn: number; monica: number;
}

const cells: Cell[] = [];
for (const sign of SIGNS) {
  for (let degree = 0; degree < 30; degree++) {
    for (const sect of SECTS) {
      for (const phase of PHASES) {
        const st = twoBodyState(phase, sign, degree, sect);
        const absLn = Math.abs((st.lnKalchm as number) ?? NaN);
        const monica = twoBodyMonicaForSect(phase, sign, degree, sect);
        if (!Number.isFinite(absLn) || !Number.isFinite(monica)) continue;
        cells.push({ phase, sign, degree, sect, essence: st.esms?.Essence ?? NaN, absLn, monica });
      }
    }
  }
}

const absMax = (xs: number[]) => Math.max(...xs.map(Math.abs));
console.log(`two-body cells: ${cells.length}`);
console.log(`single-body envelope: ${SINGLE_BODY_ENVELOPE}`);
console.log("=".repeat(78));

// ── which degrees actually have vessel Essence === 0? ───────────────────────
const zeroEssDegrees = [...new Set(cells.filter((c) => c.essence === 0).map((c) => c.degree))].sort((a, b) => a - b);
const comixion = [8, 22];
console.log("");
console.log("A. STRUCTURAL — cells with vessel Essence exactly 0");
console.log(`   degrees with Essence 0 : [${zeroEssDegrees.join(", ")}]`);
console.log(`   Comixion (as coded)    : [${comixion.join(", ")}]`);
console.log(`   MATCH? ${JSON.stringify(zeroEssDegrees) === JSON.stringify(comixion) ? "yes" : "NO — the Essence-0 set is NOT the Comixion set"}`);
const zeroEss = cells.filter((c) => c.essence === 0);
const nonZeroEss = cells.filter((c) => c.essence !== 0);
console.log(`   Essence-0 cells        : ${zeroEss.length}   |ln k| [${Math.min(...zeroEss.map(c=>c.absLn)).toPrecision(6)}, ${Math.max(...zeroEss.map(c=>c.absLn)).toPrecision(6)}]`);
console.log(`   Essence-nonzero cells  : ${nonZeroEss.length}  |ln k| [${Math.min(...nonZeroEss.map(c=>c.absLn)).toPrecision(6)}, ${Math.max(...nonZeroEss.map(c=>c.absLn)).toPrecision(6)}]`);
console.log(`   => banding by Essence===0 gives monica max ${absMax(nonZeroEss.map(c=>c.monica)).toPrecision(6)} on the REST`);
console.log(`      within the single-body envelope? ${absMax(nonZeroEss.map(c=>c.monica)) <= SINGLE_BODY_ENVELOPE ? "YES" : "no"}`);

// ── B. what threshold caps monica at the envelope? ─────────────────────────
console.log("");
console.log("B. BOUND — smallest |ln k| threshold that caps monica at the envelope");
const sortedByLn = [...cells].sort((a, b) => a.absLn - b.absLn);
let needed = 0;
for (const c of sortedByLn) {
  if (Math.abs(c.monica) > SINGLE_BODY_ENVELOPE) needed = Math.max(needed, c.absLn);
}
console.log(`   largest |ln k| among cells exceeding the envelope: ${needed.toPrecision(17)}`);
const banded = cells.filter((c) => c.absLn < needed);
console.log(`   a band at that value captures ${banded.length} of ${cells.length} cells (${((banded.length/cells.length)*100).toFixed(1)}%)`);
const keptB = cells.filter((c) => c.absLn >= needed);
console.log(`   monica max on the REST: ${absMax(keptB.map(c=>c.monica)).toPrecision(6)}`);
const collateralB = banded.filter((c) => c.essence !== 0);
console.log(`   HEALTHY cells (Essence != 0) swallowed: ${collateralB.length}  <- collateral damage`);

// ── C. no band at all ──────────────────────────────────────────────────────
console.log("");
console.log("C. NONE — no band");
console.log(`   monica max: ${absMax(cells.map(c=>c.monica)).toPrecision(6)}`);
console.log(`   cells beyond the single-body envelope: ${cells.filter(c=>Math.abs(c.monica)>SINGLE_BODY_ENVELOPE).length}`);
const beyond = cells.filter(c=>Math.abs(c.monica)>SINGLE_BODY_ENVELOPE);
if (beyond.length) {
  const degs = [...new Set(beyond.map(c=>c.degree))].sort((a,b)=>a-b);
  console.log(`   they sit at degrees: [${degs.join(", ")}]`);
  console.log(`   all Essence-0? ${beyond.every(c=>c.essence===0) ? "YES — the overshoot is exactly the degenerate family" : "no"}`);
}

console.log("");
console.log("=".repeat(78));
console.log(`for reference, phi = ${MONICA_EQUILIBRIUM}`);
