/**
 * What a recipe's own instruction steps say about the bake: the oven
 * temperature, how long, in what, and how many pieces.
 *
 * Every reading keeps the words it came from, so the mapping report can show
 * the quote beside the number. A temperature of the INSIDE of the product
 * ("internal temperature reaches 190 °F") is never read as the oven — it is
 * below 100 °C, the floor of the oven range read — and a minute count in a
 * step about resting, rising or cooling is never read as bake time.
 *
 * @file src/lib/baking/recipes/readInstructions.ts
 */

export interface Quoted<T> {
  value: T;
  quote: string;
}

export type PanCue =
  | { kind: "muffin" }
  | { kind: "loaf" }
  | { kind: "round"; diameterIn: number }
  | { kind: "rect"; widthIn: number; lengthIn: number }
  | { kind: "sheet" };

/** What the product sits on, when the recipe names something other than a metal pan. */
export type PlateCue = "stone" | "cast-iron" | "glass";

export interface OvenTemperature {
  celsius: number;
  fromFahrenheit: boolean;
  /** "350°" with no unit: read as Fahrenheit, and reported as an assumption. */
  unitAssumed: boolean;
}

export interface InstructionReading {
  ovenC: Quoted<OvenTemperature> | null;
  /** A different oven temperature stated later (a two-stage bake), °C. */
  laterOvenC: number | null;
  bakeMinutes: Quoted<readonly [number, number]> | null;
  pan: Quoted<PanCue> | null;
  plate: Quoted<PlateCue> | null;
  /** "until the internal temperature reaches 190 °F": the recipe's own done point, °C. */
  doneC: Quoted<number> | null;
  /** "two loaves", "divide into 12 rolls". */
  pieces: Quoted<number> | null;
  /** "two 8-inch cake pans": how many pans the batter is divided between. */
  pans: Quoted<number> | null;
  /** Pieces the steps roll out thin and bake one by one (a layer cake's rounds). */
  layers: Quoted<number> | null;
  steam: Quoted<true> | null;
}

const NOT_BAKING = /\b(rest|rise|proof|cool|chill|refrigerat|stand|sit|soak|simmer|boil|knead|marinat|steep|freeze|let)\w*/i;
/** "bake … 25–30 minutes": the first duration within the same clause after a bake verb. */
const BAKE_DURATION = /\bbak(?:e|ed|es|ing)\b(?!\s+(?:soda|powder|sheets?|pans?|dish(?:es)?|trays?|paper|parchment|mats?|stones?|steel|tins?|spray|chocolate))([^.;]{0,70}?)(\d+(?:\.\d+)?)\s*(?:(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(minutes?|mins?|hours?|hrs?)\b/i;
const WORDS: Readonly<Record<string, number>> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, eight: 8, ten: 10, twelve: 12, dozen: 12 };

function sentences(steps: readonly string[]): string[] {
  return steps.flatMap((s) => s.split(/(?<=[.!?;])\s+/)).map((s) => s.trim()).filter((s) => s.length > 0);
}

function toNumber(word: string): number {
  return WORDS[word.toLowerCase()] ?? Number(word);
}

function fahrenheit(degrees: string, unitAssumed: boolean): OvenTemperature {
  return { celsius: ((Number(degrees) - 32) * 5) / 9, fromFahrenheit: true, unitAssumed };
}

/**
 * Every temperature in one sentence, in order. When the sentence states any
 * Celsius figure, its Celsius figures are read ("450°F (230°C) … 375°F
 * (190°C)"); otherwise its Fahrenheit ones are converted; a bare "350°" is
 * read as Fahrenheit and flagged.
 */
function temperaturesIn(sentence: string): OvenTemperature[] {
  const c = [...sentence.matchAll(/(\d{2,3})\s*°\s*C\b|(\d{2,3})\s*degrees\s*C(elsius)?\b/gi)];
  if (c.length > 0) return c.map((m) => ({ celsius: Number(m[1] ?? m[2]), fromFahrenheit: false, unitAssumed: false }));
  const f = [...sentence.matchAll(/(\d{3})\s*°?\s*(?:degrees\s*)?F(ahrenheit)?\b/gi)];
  if (f.length > 0) return f.map((m) => fahrenheit(m[1] ?? "", false));
  return [...sentence.matchAll(/(\d{3})\s*(°|degrees)/gi)].map((m) => fahrenheit(m[1] ?? "", true));
}

function readOven(all: readonly string[]): Pick<InstructionReading, "ovenC" | "laterOvenC"> {
  const found = all
    // No sentence is skipped for naming an internal temperature: "Bake at 375°F until it reads 190°F"
    // states the oven too, and the inside's figure is below the 100 °C floor filtered next.
    .filter((s) => /oven|preheat|bake|baking/i.test(s))
    .flatMap((s) => temperaturesIn(s).map((t) => ({ s, t })))
    .filter((x) => x.t.celsius >= 100 && x.t.celsius <= 320);
  const [first] = found;
  if (first === undefined) return { ovenC: null, laterOvenC: null };
  const later = found.find((x) => Math.abs(x.t.celsius - first.t.celsius) >= 5);
  return { ovenC: { value: first.t, quote: first.s }, laterOvenC: later?.t.celsius ?? null };
}

const CONTINUES = /\b(then|more|another|additional|further|longer|reduce|lower)\b/i;

/**
 * The bake periods one sentence states, in minutes. A second period counts
 * only when the words around it say it continues the bake ("…, then reduce to
 * 375°F and bake 30 minutes more"), never an alternative ("or bake 35").
 */
function periodsIn(sentence: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let previousEnd = 0;
  for (const m of sentence.matchAll(new RegExp(BAKE_DURATION.source, "gi"))) {
    const start = m.index;
    const end = start + m[0].length;
    const context = sentence.slice(previousEnd, end + 15);
    if (!NOT_BAKING.test(m[1] ?? "") && (out.length === 0 || CONTINUES.test(context))) {
      const scale = /^h/i.test(m[4] ?? "") ? 60 : 1;
      out.push([Number(m[2]) * scale, Number(m[3] ?? m[2]) * scale]);
    }
    previousEnd = end;
  }
  return out;
}

/** The bake time: the first sentence that states one, plus each later sentence that says it continues the bake. */
function readTime(all: readonly string[]): Quoted<readonly [number, number]> | null {
  let total: [number, number] | null = null;
  const quotes: string[] = [];
  for (const s of all) {
    const periods = periodsIn(s);
    if (periods.length === 0) continue;
    if (total !== null && !/\b(more|another|additional|further|longer)\b/i.test(s)) continue;
    total = periods.reduce<[number, number]>((acc, p) => [acc[0] + p[0], acc[1] + p[1]], total ?? [0, 0]);
    quotes.push(s);
  }
  return total === null ? null : { value: total, quote: quotes.join(" … ") };
}

const PANS: ReadonlyArray<[RegExp, (m: RegExpExecArray) => PanCue | null]> = [
  [/muffin (tins?|pans?|cups?|papers|liners)|cupcake (pans?|tins?|liners)/i, (): PanCue => ({ kind: "muffin" })],
  [/loaf (pans?|tins?)|bread pan|\b[89]\s*x\s*[45]\b/i, (): PanCue => ({ kind: "loaf" })],
  [/(\d{1,2})\s*(?:-?\s*inch|"|in\.)?\s*x\s*(\d{1,2})\s*(?:-?\s*inch|"|in\.)?(?=[^.]{0,20}\b(pan|dish|tin)\b)/i, (m): PanCue => ({ kind: "rect", widthIn: Number(m[1]), lengthIn: Number(m[2]) })],
  [/(\d{1,2}(?:\.\d)?)\s*-?\s*(?:inch|in\.|")\s*(?:(?:round|springform|cake|tart|pie|square|baking|glass|metal|cast[- ]iron)\s+){0,2}(pans?|tins?|dish|plate|skillet)/i, (m): PanCue => ({ kind: "round", diameterIn: Number(m[1]) })],
  [/(baking|cookie) sheets?|sheet (pans?|trays?)|sheet trays?|half[- ]sheet|baking trays?/i, (): PanCue => ({ kind: "sheet" })],
];

function readPan(text: string): Quoted<PanCue> | null {
  for (const [pattern, build] of PANS) {
    const m = pattern.exec(text);
    const cue = m === null ? null : build(m);
    if (m !== null && cue !== null) return { value: cue, quote: m[0] };
  }
  return null;
}

const PLATES: ReadonlyArray<[RegExp, PlateCue]> = [
  [/pizza stone|baking stone|baking steel/i, "stone"],
  [/skillet|cast[- ]iron|dutch oven|cloche|combo cooker/i, "cast-iron"],
  [/glass (pan|dish|baking dish)|pyrex/i, "glass"],
];

function readPlate(text: string): Quoted<PlateCue> | null {
  for (const [pattern, cue] of PLATES) {
    const m = pattern.exec(text);
    if (m !== null) return { value: cue, quote: m[0] };
  }
  return null;
}

function readDone(all: readonly string[]): Quoted<number> | null {
  for (const s of all) {
    const m = /\b(internal|inner|inside|core)\b[^.]{0,40}?(\d{2,3})\s*°?\s*(F|C)\b/i.exec(s);
    if (m === null) continue;
    const value = Number(m[2]);
    const celsius = (m[3] ?? "").toUpperCase() === "F" ? ((value - 32) * 5) / 9 : value;
    if (celsius >= 60 && celsius <= 99) return { value: celsius, quote: s };
  }
  return null;
}

const COUNT = "(\\d{1,2}|one|two|three|four|five|six|eight|ten|twelve|dozen)";

function readCount(text: string, nouns: string, between: number): Quoted<number> | null {
  const m = new RegExp(`\\b${COUNT}\\s+(?:[\\w-]+\\s+){0,${between}}?(${nouns})\\b`, "i").exec(text);
  if (m === null) return null;
  const n = toNumber(m[1] ?? "");
  return Number.isFinite(n) && n >= 1 ? { value: n, quote: m[0] } : null;
}

function readPieces(text: string): Quoted<number> | null {
  return readCount(text, "loaves|loafs|rolls|buns|balls|bagels|pieces|portions|rounds|pizzas|braids|rings", 2);
}

function readPans(text: string): Quoted<number> | null {
  return readCount(text, "pans|tins", 3);
}

/** Pieces count as layers only when the steps roll them out thin, one at a time. */
function readLayers(text: string, pieces: Quoted<number> | null): Quoted<number> | null {
  return pieces !== null && /\broll(ed)?\b[^.]{0,60}\b(thin|circles?|discs?|rounds?|layers?)\b/i.test(text) ? pieces : null;
}

/** Everything the steps state about the bake. */
export function readInstructions(steps: readonly string[]): InstructionReading {
  const all = sentences(steps);
  const text = all.join(" ");
  const steamMatch = /\bsteam\b|ice cubes|spray (the )?oven|pan of (hot|boiling) water/i.exec(text);
  const pieces = readPieces(text);
  return {
    ...readOven(all),
    bakeMinutes: readTime(all),
    pan: readPan(text),
    plate: readPlate(text),
    doneC: readDone(all),
    pieces,
    pans: readPans(text),
    layers: readLayers(text, pieces),
    steam: steamMatch === null ? null : { value: true, quote: steamMatch[0] },
  };
}
