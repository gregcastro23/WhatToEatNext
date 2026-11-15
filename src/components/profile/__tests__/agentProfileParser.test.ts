/**
 * @jest-environment node
 *
 * Round trips for `parseCraftedAgentProfile`.
 *
 * REAL DATA: none exists in this repo. MEASURED 2026-11-14 by searching src/ docs/
 * scripts/ tests/ mcp-server/ database/ public/ data/ for the profile's field names
 * (monicaCreationStory, coreBeliefs, historicalDiet, culturalCuisine): ASOL serves
 * the profiles; scripts/sync-agentic-users.ts only TYPES them (`RawAgent`) and
 * src/data/historicalCritiqueLore.ts holds critique text for 8 agents, not
 * profiles. So the corpus is built from the two things the repo can state:
 *  1. the profile the route SYNTHESIZES when ASOL has none, replicated from
 *     src/app/api/users/[userId]/route.ts:422-443 over every dominant element and
 *     every bio / diet / natalChart variant its code can see (30 profiles);
 *  2. a profile with EVERY declared field populated. `DeepRequired` makes the
 *     compiler fail the day `CraftedAgentProfile` gains a field this fixture lacks.
 */
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import { toClassicalElement } from "@/lib/agents/consciousnessAxes";
import { isJsonRecord } from "@/lib/api/json";
import { parseCraftedAgentProfile } from "../agentProfileParser";

type DeepRequired<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<T[K]> }
    : T;

const FULL: DeepRequired<CraftedAgentProfile> = {
  name: "Hildegard of Bingen",
  title: "Abbess and Natural Philosopher",
  era: "Medieval",
  specialization: "Viriditas and healing foods",
  synthesis: "Green life force as a cooking principle.",
  monicaCreationStory: "Born from the herbal tradition of the Rhine.",
  quotes: ["The soul is like a wind.", "Glance at the sun."],
  coreBeliefs: ["Viriditas sustains all living things"],
  appearance: { symbol: "G", color: "#10b981" },
  consciousness: {
    dominantElement: "Earth",
    dominantAlchemicalQuantity: "Matter",
    dominantModality: "Fixed",
    level: "Master",
    strength: "Deep",
    emotion: "Serene",
    signature: "Verdant",
    natalChart: {
      Sun: { sign: "Virgo", degree: 12.5, house: 3, retrograde: false },
      aspects: [{ planet1: "Sun", type: "trine", planet2: "Moon", exact: true, orb: 1.2 }],
    },
    alchemicalElements: { spirit: 5000, essence: 4200, matter: 3800, substance: 3500 },
  },
  personality: {
    core: { essence: "Healer", expression: "Herbal remedies", emotion: "Devotion" },
    traits: ["visionary", "practical"],
    currentMood: "Contemplative",
    gifts: [
      { type: "Healing", description: "Knows herbs", expression: "Tinctures" },
      { type: "Music", description: "Composes" },
    ],
    shadows: [
      { type: "Rigidity", description: "Resists change", transformationPath: "Listening" },
      { type: "Isolation", description: "Withdraws" },
    ],
    challenges: [
      { type: "Authority", description: "Church politics", growthOpportunity: "Diplomacy" },
      { type: "Health", description: "Chronic illness" },
    ],
  },
  abilities: {
    specialty: "Herbal dietetics",
    teachingStyle: "Visionary parable",
    resonanceType: "Earth-Water",
    uniquePower: "Reading plants",
    wisdomDomains: ["herbalism", "music"],
  },
  historicalDiet: {
    culturalCuisine: "Rhenish monastic",
    dietaryPhilosophy: "Food is medicine.",
    staples: ["spelt", "barley"],
    favoriteFoods: ["spelt bread"],
    avoidedFoods: ["raw leeks"],
    beverages: ["herbal wine"],
    foodLore: "Spelt was her grain of choice.",
  },
  birthData: {
    date: "1098-09-16",
    time: "12:00",
    location: { name: "Bermersheim vor der Höhe", latitude: 49.8, longitude: 8.2 },
  },
};

interface DbRow {
  name: string | null;
  bio: string | null;
  dominant_element: string | null;
}

/** users/[userId]/route.ts:422-443, expression for expression (`diet` and `natalChart` are the route's locals). */
function synthesized(row: DbRow, slug: string, diet: Record<string, unknown> | undefined, natalChart: unknown): unknown {
  return {
    name: row.name ?? (slug ? slug.split("-").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") : "Historical Agent"),
    title: (row.bio?.includes("(") ? row.bio.split("(")[0]?.trim() : row.bio) ?? "Historical Alchemist",
    era: (row.bio?.includes("(") ? row.bio.match(/\(([^)]+)\)/)?.[1] : "Historical Era") ?? "Historical Master",
    appearance: {
      color: row.dominant_element === "Fire" ? "#ef4444" : row.dominant_element === "Water" ? "#3b82f6" : row.dominant_element === "Air" ? "#10b981" : "#a855f7",
      symbol: "⚗️",
    },
    consciousness: { dominantElement: toClassicalElement(row.dominant_element), level: "Master", natalChart },
    ...(diet ? { historicalDiet: diet } : {}),
    personality: {
      core: {
        essence: row.bio ?? "Perpetual seeker of alchemical wisdom",
        expression: "Living culinary and philosophical mastery",
        emotion: "Serene contemplation",
      },
    },
  };
}

const ROWS: Array<[string, DbRow]> = [
  ["isaac-newton", { name: "Isaac Newton", bio: "Natural Philosopher (England, 1643)", dominant_element: "Fire" }],
  ["leonardo-da-vinci", { name: null, bio: null, dominant_element: "Water" }],
  ["cleopatra", { name: "Cleopatra", bio: "Pharaoh", dominant_element: "Air" }],
  ["hildegard-of-bingen", { name: "Hildegard", bio: "Abbess (Rhineland)", dominant_element: "Earth" }],
  ["paracelsus", { name: "Paracelsus", bio: "Physician (Switzerland)", dominant_element: null }],
];
const DIETS: Array<Record<string, unknown> | undefined> = [
  undefined,
  {
    staples: ["bread"],
    favoriteFoods: ["figs"],
    avoidedFoods: ["lard"],
    dietaryPhilosophy: "Moderation.",
    culturalCuisine: "Classical",
    beverages: ["wine"],
    foodLore: "Figs were a fast-day food.",
  },
];
const CHARTS: unknown[] = [{ Sun: { sign: "Leo", degree: 12.5, house: 3 } }, null, undefined];

function onTheWire(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

/** What the parser adds when a consciousness block names no dominantAlchemicalQuantity: the owner's default, Spirit. */
function withDefaultQuantity(wire: unknown): unknown {
  if (!isJsonRecord(wire) || !isJsonRecord(wire.consciousness)) return wire;
  return { ...wire, consciousness: { dominantAlchemicalQuantity: "Spirit", ...wire.consciousness } };
}

function run(wire: unknown): { parsed: CraftedAgentProfile | null; issues: string[] } {
  const issues: string[] = [];
  return { parsed: parseCraftedAgentProfile(wire, issues), issues };
}

function leaves(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((sum: number, entry: unknown) => sum + leaves(entry), 0);
  if (isJsonRecord(value)) return Object.values(value).reduce((sum: number, entry: unknown) => sum + leaves(entry), 0);
  return 1;
}

/** An unknown key on every object except natalChart, which is `unknown` and passes through untouched. */
function withExtras(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry: unknown) => withExtras(entry));
  if (!isJsonRecord(value)) return value;
  const out: Record<string, unknown> = { extra: "x" };
  for (const [key, entry] of Object.entries(value)) out[key] = key === "natalChart" ? entry : withExtras(entry);
  return out;
}

describe("parseCraftedAgentProfile round trips", () => {
  it("a profile with every declared field is reproduced exactly, with no issues", () => {
    const wire = onTheWire(FULL);
    expect(leaves(wire)).toBeGreaterThan(65);
    expect(run(wire)).toStrictEqual({ parsed: wire, issues: [] });
  });

  it("reproduces every profile the route can synthesize (plus the default quantity), with no issues", () => {
    let checked = 0;
    for (const [slug, row] of ROWS) {
      for (const diet of DIETS) {
        for (const chart of CHARTS) {
          const wire = onTheWire(synthesized(row, slug, diet, chart));
          expect(run(wire)).toStrictEqual({ parsed: withDefaultQuantity(wire), issues: [] });
          checked += 1;
        }
      }
    }
    expect(checked).toBe(30);
  });

  it("the smallest profile is a name alone", () => {
    expect(run({ name: "Solo" })).toStrictEqual({ parsed: { name: "Solo" }, issues: [] });
  });

  it("empty objects and arrays are valid values and survive", () => {
    const wire = onTheWire({
      name: "Empty",
      quotes: [],
      coreBeliefs: [],
      appearance: {},
      consciousness: { dominantElement: "Fire" },
      personality: { traits: [], gifts: [], shadows: [], challenges: [] },
      abilities: { wisdomDomains: [] },
      historicalDiet: { staples: [], favoriteFoods: [], avoidedFoods: [], beverages: [] },
      birthData: { location: {} },
    });
    expect(run(wire)).toStrictEqual({ parsed: withDefaultQuantity(wire), issues: [] });
  });

  it("empty strings and zeros are values, not absences", () => {
    const wire = onTheWire({
      name: "",
      title: "",
      quotes: [""],
      consciousness: {
        dominantElement: "Fire",
        level: "",
        alchemicalElements: { spirit: 0, essence: 0, matter: 0, substance: 0 },
      },
      personality: {
        core: { essence: "", expression: "", emotion: "" },
        gifts: [{ type: "", description: "" }],
      },
      birthData: { location: { name: "", latitude: 0, longitude: 0 } },
    });
    expect(run(wire)).toStrictEqual({ parsed: withDefaultQuantity(wire), issues: [] });
  });

  it.each<[string, unknown]>([
    ["an object", { Sun: { sign: "Leo", degree: 12.5 } }],
    ["null", null],
    ["an array", [1, 2, 3]],
    ["a string", "unparsed"],
    ["a number", 0],
    ["an empty object", {}],
  ])("natalChart is `unknown` and passes through unchanged: %s", (_label, chart) => {
    const wire = onTheWire({ name: "N", consciousness: { dominantElement: "Fire", natalChart: chart } });
    expect(run(wire)).toStrictEqual({ parsed: withDefaultQuantity(wire), issues: [] });
  });

  it("null and undefined are a normal answer: no profile, nothing reported", () => {
    const fromJson: unknown = JSON.parse("null");
    expect(fromJson).toBeNull();
    expect(run(fromJson)).toStrictEqual({ parsed: null, issues: [] });
    expect(run(undefined)).toStrictEqual({ parsed: null, issues: [] });
  });

  it("unknown keys are not copied, at any level", () => {
    const wire = onTheWire(FULL);
    expect(run(withExtras(wire))).toStrictEqual({ parsed: wire, issues: [] });
  });

  it("does not modify its input", () => {
    const wire = onTheWire(FULL);
    const before = JSON.stringify(wire);
    run(wire);
    expect(JSON.stringify(wire)).toBe(before);
  });
});
