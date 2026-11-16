/**
 * The product's shape, from its batter volume and what the recipe says about
 * its pan or pieces.
 *
 * COMPUTED where the recipe gives enough: a 9 × 13 in pan holding 1.6 L of
 * batter is a 2.1 cm slab; 24 rolls from 1.2 L of dough are 2.4 cm-radius
 * spheres. DECLARED (from the category profile) where it does not, and the
 * converter reports which.
 *
 * @file src/lib/baking/recipes/geometry.ts
 */
import { basisOf } from "@/data/baking/basis";
import { FREE_LOAF_CONTACT, LOAF_TIN, MUFFIN_CUP, type Declared, type ShapeRule } from "./processProfiles";
import type { ContactPlate, ProductGeometry } from "../formulaTypes";
import type { Basis } from "../types";
import type { InstructionReading, PanCue, PlateCue, Quoted } from "./readInstructions";
import type { Assumption, StatedValue } from "./sourceTypes";

const INCH_M = 0.0254;

export interface ShapeInput {
  rule: ShapeRule;
  batterMl: number;
  reading: InstructionReading;
  /** The recipe's yield, used as a piece count for cookies, rolls and scones. */
  servings: number | null;
  /** The good is made of pieces (rolls, buns, bagels) rather than one loaf. */
  piecesByName: boolean;
  /** A shape the good's name fixes (a pretzel rope), overriding the rule. */
  fixedShape: Declared<ProductGeometry> | null;
}

export interface ShapeResult {
  geometry: ProductGeometry;
  assumptions: Assumption[];
  stated: StatedValue[];
}

export type ShapeOutcome = { ok: true; value: ShapeResult } | { ok: false; reason: string };

function declaredBasis(why: string): Basis {
  return basisOf("DECLARED", "MODEL", why);
}

function fmtCm(m: number): string {
  return `${(m * 100).toFixed(1)} cm`;
}

function panAreaM2(pan: { widthIn: number; lengthIn: number } | { diameterIn: number }): number {
  if ("diameterIn" in pan) return Math.PI * ((pan.diameterIn * INCH_M) / 2) ** 2;
  return pan.widthIn * INCH_M * pan.lengthIn * INCH_M;
}

function panOf(cue: Quoted<PanCue> | null): { widthIn: number; lengthIn: number } | { diameterIn: number } | null {
  if (cue === null) return null;
  if (cue.value.kind === "round") return { diameterIn: cue.value.diameterIn };
  if (cue.value.kind === "rect") return { widthIn: cue.value.widthIn, lengthIn: cue.value.lengthIn };
  return null;
}

function panDepth(input: ShapeInput, fallback: Declared<{ widthIn: number; lengthIn: number } | { diameterIn: number }>): ShapeOutcome {
  const statedPan = panOf(input.reading.pan);
  const pan = statedPan ?? fallback.value;
  // Pans the batter is divided between, or rounds rolled thin and baked one by one — never a cut count.
  const pans = input.reading.pans?.value ?? input.reading.layers?.value ?? 1;
  const area = panAreaM2(pan) * pans;
  const depthM = (input.batterMl * 1e-6) / area;
  const span = Math.sqrt(area / pans);
  const out: ShapeResult = { geometry: { shape: "slab", dimensionM: depthM, spanM: span, contactFraction: 1 }, assumptions: [], stated: [] };
  if (statedPan === null) out.assumptions.push({ field: "pan", value: JSON.stringify(pan), basis: declaredBasis(fallback.why) });
  else if (input.reading.pan !== null) out.stated.push({ field: "pan", value: input.reading.pan.quote, quote: input.reading.pan.quote });
  out.assumptions.push({ field: "batter depth", value: fmtCm(depthM), basis: basisOf("COMPUTED", "MODEL", `batter volume ${Math.round(input.batterMl)} mL ÷ pan area ${(area * 1e4).toFixed(0)} cm²${pans > 1 ? ` (${pans} ${input.reading.pans === null ? "rolled layers" : "pans"})` : ""}`) });
  return { ok: true, value: out };
}

function pieceCount(input: ShapeInput): { n: number; why: string } | null {
  if (input.reading.pieces !== null) return { n: input.reading.pieces.value, why: `the recipe says "${input.reading.pieces.quote}"` };
  if (input.servings !== null && input.servings >= 1) return { n: input.servings, why: `the recipe's stated yield of ${input.servings}` };
  return null;
}

function pieces(input: ShapeInput, form: "slab" | "sphere", thickness: Declared<number>): ShapeOutcome {
  const count = pieceCount(input);
  if (count === null) return { ok: false, reason: "the recipe states no yield or piece count, so the size of one piece is unknown" };
  const pieceM3 = (input.batterMl * 1e-6) / count.n;
  const out: ShapeResult = { geometry: { shape: form, dimensionM: 0, spanM: 0, contactFraction: form === "slab" ? 1 : FREE_LOAF_CONTACT.value }, assumptions: [], stated: [] };
  if (form === "slab") {
    const t = thickness.value;
    out.geometry = { ...out.geometry, dimensionM: t, spanM: Math.sqrt((4 * pieceM3) / (Math.PI * t)) };
    out.assumptions.push({ field: "piece thickness", value: fmtCm(t), basis: declaredBasis(thickness.why) });
  } else {
    const r = Math.cbrt((3 * pieceM3) / (4 * Math.PI));
    out.geometry = { ...out.geometry, dimensionM: r, spanM: 2 * r };
    out.assumptions.push({ field: "free-form contact", value: `${FREE_LOAF_CONTACT.value * 100} %`, basis: declaredBasis(FREE_LOAF_CONTACT.why) });
  }
  out.assumptions.push({ field: "piece size", value: `${count.n} pieces of ${(pieceM3 * 1e6).toFixed(0)} mL`, basis: basisOf("COMPUTED", "MODEL", `batter volume ÷ ${count.why}`) });
  return { ok: true, value: out };
}

function freeLoaf(input: ShapeInput): ShapeOutcome {
  if (input.piecesByName || input.reading.pieces !== null) return pieces(input, "sphere", { value: 0, why: "" });
  const r = Math.cbrt((3 * input.batterMl * 1e-6) / (4 * Math.PI));
  return {
    ok: true,
    value: {
      geometry: { shape: "sphere", dimensionM: r, spanM: 2 * r, contactFraction: FREE_LOAF_CONTACT.value },
      assumptions: [
        { field: "loaf", value: `one free-form loaf, radius ${fmtCm(r)}`, basis: declaredBasis("the recipe names no tin and no piece count: the whole batch is read as one round loaf (model choice)") },
        { field: "free-form contact", value: `${FREE_LOAF_CONTACT.value * 100} %`, basis: declaredBasis(FREE_LOAF_CONTACT.why) },
      ],
      stated: [],
    },
  };
}

function fixed(geometry: Declared<ProductGeometry>, field: string): ShapeOutcome {
  return { ok: true, value: { geometry: geometry.value, assumptions: [{ field, value: `${geometry.value.shape}, ${fmtCm(geometry.value.dimensionM)}`, basis: declaredBasis(geometry.why) }], stated: [] } };
}

/** The simulator's envelope (sim/simulate.ts): a shape outside it is refused here, with the reason, not by the bake. */
function withinEnvelope(outcome: ShapeOutcome): ShapeOutcome {
  if (!outcome.ok) return outcome;
  const g = outcome.value.geometry;
  if (g.dimensionM < 0.002 || g.dimensionM > 0.5) return { ok: false, reason: `its computed ${g.shape === "slab" ? "thickness" : "radius"} of ${(g.dimensionM * 1000).toFixed(1)} mm is outside the simulator's 2–500 mm range` };
  if (g.spanM < 0.01 || g.spanM > 2) return { ok: false, reason: `its computed width of ${fmtCm(g.spanM)} is outside the simulator's 1–200 cm range` };
  return outcome;
}

/** The product geometry for a shape rule, overridden by a pan the recipe names. */
export function shapeFor(input: ShapeInput): ShapeOutcome {
  return withinEnvelope(shapeFromRule(input));
}

function shapeFromRule(input: ShapeInput): ShapeOutcome {
  if (input.fixedShape !== null) return fixed(input.fixedShape, "shape");
  const cue = input.reading.pan?.value.kind;
  if (cue === "muffin") return fixed(MUFFIN_CUP, "muffin cup");
  if (cue === "loaf") return fixed(LOAF_TIN, "loaf tin");
  const { rule } = input;
  switch (rule.kind) {
    case "free-loaf":
      return freeLoaf(input);
    case "loaf-tin":
      return cue === "round" || cue === "rect" ? panDepth(input, { value: { diameterIn: 9 }, why: "" }) : fixed(LOAF_TIN, "loaf tin");
    case "pan-depth":
      return panDepth(input, rule.defaultPan);
    case "pieces":
      return pieces(input, rule.form, rule.thicknessM);
    case "muffin-cup":
      return fixed(MUFFIN_CUP, "muffin cup");
  }
}

/** The pan or stone under the product, from the recipe's cue; aluminium sheet otherwise. */
export function plateFor(cue: PlateCue | null): Declared<ContactPlate> {
  switch (cue) {
    case "stone":
      return { value: { materialId: "stoneware", thicknessMm: 15 }, why: "a baking stone, as the sourdough preset's 15 mm stoneware" };
    case "cast-iron":
      return { value: { materialId: "cast_iron", thicknessMm: 4 }, why: "cast iron, 4 mm (model choice); a lid's trapped steam is not modelled" };
    case "glass":
      return { value: { materialId: "borosilicate_glass", thicknessMm: 4 }, why: "a glass dish, 4 mm borosilicate (model choice)" };
    case null:
      return { value: { materialId: "aluminium", thicknessMm: 1 }, why: "an aluminium pan or sheet, 1 mm, as the curated presets use" };
  }
}
