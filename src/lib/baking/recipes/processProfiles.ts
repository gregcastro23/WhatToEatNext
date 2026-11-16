/**
 * What the lab must supply for each kind of baked good when a recipe does not
 * say: batter density, starting temperature, done temperature, a default
 * oven, and how the product is shaped.
 *
 * Every figure here is DECLARED — a stated starting point, not a measurement
 * — and says where it comes from. Most copy a curated preset (whose own
 * figures are declared in src/data/baking/presets.ts); the rest are named
 * model choices. The converter reports each one it uses, so a baker can
 * replace any of them with their own (weigh a level cup of batter and the
 * density stops being an assumption).
 *
 * Pastry and pie/tart have NO profile on purpose: a laminated dough or a
 * filled crust is two materials, and the simulator bakes one homogeneous
 * batter.
 *
 * @file src/lib/baking/recipes/processProfiles.ts
 */
import type { ProductGeometry } from "../formulaTypes";
import type { GoodCategory } from "./sourceTypes";

export interface Declared<T> {
  value: T;
  why: string;
}

/** How the product's shape is found from its batter volume. */
export type ShapeRule =
  | { kind: "free-loaf" }
  | { kind: "loaf-tin" }
  | { kind: "pan-depth"; defaultPan: Declared<{ widthIn: number; lengthIn: number } | { diameterIn: number }> }
  | { kind: "pieces"; form: "slab" | "sphere"; thicknessM: Declared<number> }
  | { kind: "muffin-cup" };

export interface ProcessProfile {
  densityGPerMl: Declared<number>;
  startC: Declared<number>;
  doneCoreC: Declared<number>;
  ovenC: Declared<number>;
  bakeMinutes: Declared<number>;
  shape: ShapeRule;
}

const SOURDOUGH = "as the curated sourdough country loaf preset";
const BRIOCHE = "as the curated brioche loaf preset";
const COOKIE = "as the curated brown butter cookie preset";
const GENOISE = "as the curated genoise sponge preset";
const STIRRED = "a stirred or creamed chemically-leavened batter is near 0.9–1.0 g/mL before the oven (model choice; weigh a level cup of yours to replace it)";
const ROOM = "mixed at room temperature (model choice)";

function d<T>(value: T, why: string): Declared<T> {
  return { value, why };
}

const LEAN_DOUGH = { densityGPerMl: d(0.5, SOURDOUGH), startC: d(24, SOURDOUGH), doneCoreC: d(96, SOURDOUGH) };
const CAKE_DONE = d(95, GENOISE);

export const PROCESS_PROFILES: Readonly<Partial<Record<GoodCategory, ProcessProfile>>> = {
  bread: { ...LEAN_DOUGH, ovenC: d(230, "a lean-bread oven when the recipe names none (model choice)"), bakeMinutes: d(40, "model choice when the recipe names no time"), shape: { kind: "free-loaf" } },
  "enriched-bread": {
    densityGPerMl: d(0.45, BRIOCHE),
    startC: d(26, BRIOCHE),
    doneCoreC: d(93, BRIOCHE),
    ovenC: d(180, BRIOCHE),
    bakeMinutes: d(50, BRIOCHE),
    shape: { kind: "free-loaf" },
  },
  flatbread: {
    ...LEAN_DOUGH,
    ovenC: d(230, "a lean-bread oven when the recipe names none (model choice)"),
    bakeMinutes: d(20, "model choice when the recipe names no time"),
    shape: { kind: "pan-depth", defaultPan: d({ widthIn: 13, lengthIn: 18 }, "a US half-sheet pan, 13 × 18 in, when the recipe names no pan (model choice)") },
  },
  "quick-bread": {
    densityGPerMl: d(0.95, STIRRED),
    startC: d(21, ROOM),
    doneCoreC: CAKE_DONE,
    ovenC: d(175, "model choice when the recipe names none"),
    bakeMinutes: d(55, "model choice when the recipe names no time"),
    shape: { kind: "loaf-tin" },
  },
  muffin: { densityGPerMl: d(0.95, STIRRED), startC: d(21, ROOM), doneCoreC: CAKE_DONE, ovenC: d(190, "model choice when the recipe names none"), bakeMinutes: d(22, "model choice when the recipe names no time"), shape: { kind: "muffin-cup" } },
  "biscuit-scone": {
    densityGPerMl: d(1.0, "a rolled chemically-leavened dough before it rises (model choice)"),
    startC: d(10, "biscuit and scone doughs are made with cold fat (model choice)"),
    doneCoreC: CAKE_DONE,
    ovenC: d(220, "model choice when the recipe names none"),
    bakeMinutes: d(15, "model choice when the recipe names no time"),
    shape: { kind: "pieces", form: "slab", thicknessM: d(0.025, "a 2.5 cm cut biscuit or scone (model choice)") },
  },
  cookie: {
    densityGPerMl: d(1.15, COOKIE),
    startC: d(18, COOKIE),
    doneCoreC: d(85, COOKIE),
    ovenC: d(180, COOKIE),
    bakeMinutes: d(12, COOKIE),
    shape: { kind: "pieces", form: "slab", thicknessM: d(0.012, `a 1.2 cm dough puck, ${COOKIE}; spread is not modelled`) },
  },
  bar: {
    densityGPerMl: d(1.05, "a dense, barely-leavened bar batter (model choice)"),
    startC: d(21, ROOM),
    doneCoreC: d(85, COOKIE),
    ovenC: d(175, "model choice when the recipe names none"),
    bakeMinutes: d(30, "model choice when the recipe names no time"),
    shape: { kind: "pan-depth", defaultPan: d({ widthIn: 8, lengthIn: 8 }, "an 8 × 8 in pan when the recipe names none (model choice)") },
  },
  cake: {
    densityGPerMl: d(0.95, STIRRED),
    startC: d(21, ROOM),
    doneCoreC: CAKE_DONE,
    ovenC: d(175, GENOISE),
    bakeMinutes: d(30, "model choice when the recipe names no time"),
    shape: { kind: "pan-depth", defaultPan: d({ diameterIn: 9 }, "one 9 in round pan when the recipe names none (model choice)") },
  },
  cracker: {
    densityGPerMl: d(1.1, "a dense, rolled, unleavened dough (model choice)"),
    startC: d(21, ROOM),
    doneCoreC: d(96, `${SOURDOUGH}: a thin dough is done once its core reaches the boil plateau`),
    ovenC: d(175, "model choice when the recipe names none"),
    bakeMinutes: d(20, "model choice when the recipe names no time"),
    shape: { kind: "pieces", form: "slab", thicknessM: d(0.004, "a 4 mm rolled cracker (model choice)") },
  },
};

/** An egg-foam cake (genoise, sponge) takes the genoise preset's density and start, not a creamed batter's. */
export const FOAM_CAKE: Pick<ProcessProfile, "densityGPerMl" | "startC"> = { densityGPerMl: d(0.45, GENOISE), startC: d(30, GENOISE) };

/** A twice-baked log (biscotti, rusks): only its first bake is modelled. */
export const TWICE_BAKED_THICKNESS: Declared<number> = d(0.025, "a 2.5 cm log for the first bake; the second, drying bake is not modelled (model choice)");

/** Brioche's loaf tin, copied: a cylinder of 5.5 cm radius, 60 % against the tin. */
export const LOAF_TIN: Declared<ProductGeometry> = d({ shape: "cylinder", dimensionM: 0.055, spanM: 0.11, contactFraction: 0.6 }, BRIOCHE);

/**
 * A standard muffin cup, modelled as a 3 cm-radius SPHERE resting 60 % on the
 * tin. A muffin is about as tall as it is wide and heats from every side; the
 * 1D infinite cylinder heats from the side only, and took 31 min to bake the
 * curated buttermilk muffin that the sphere bakes in 19 (recipes: 18–22).
 */
export const MUFFIN_CUP: Declared<ProductGeometry> = d({ shape: "sphere", dimensionM: 0.03, spanM: 0.06, contactFraction: 0.6 }, "a standard 6 cm muffin, about as tall as it is wide and heated from every side: a 3 cm-radius sphere resting 60 % on the tin (model choice)");

/** A pretzel or breadstick rope, modelled as a long cylinder resting on the sheet. */
export const PRETZEL_ROPE: Declared<ProductGeometry> = d({ shape: "cylinder", dimensionM: 0.0125, spanM: 0.025, contactFraction: 0.15 }, "a 2.5 cm rope, the usual pretzel or breadstick thickness, resting 15 % on the sheet as a free-form loaf (model choice)");

/** A baguette, modelled as a long cylinder. */
export const BAGUETTE: Declared<ProductGeometry> = d({ shape: "cylinder", dimensionM: 0.03, spanM: 0.06, contactFraction: 0.15 }, "a 6 cm-wide baguette, resting 15 % on the deck as a free-form loaf (model choice)");

/** A braided loaf (challah), modelled as a long cylinder of its braid's width. */
export const BRAIDED_LOAF: Declared<ProductGeometry> = d({ shape: "cylinder", dimensionM: 0.045, spanM: 0.09, contactFraction: 0.15 }, "a braided loaf about 9 cm wide, modelled as a long cylinder resting 15 % on the sheet (model choice)");

/** A rolled flatbread or mini pizza: one piece per portion. */
export const ROLLED_FLATBREAD: Declared<number> = d(0.006, "a flatbread rolled to about 6 mm (model choice)");

/** A free-form loaf's share of surface on the deck or pan. */
export const FREE_LOAF_CONTACT = d(0.15, SOURDOUGH);
