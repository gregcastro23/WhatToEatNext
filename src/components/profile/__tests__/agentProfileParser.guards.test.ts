/**
 * @jest-environment node
 *
 * Rejections and degradations for `parseCraftedAgentProfile`. Every body is the ONE
 * fully populated BASE profile with exactly one thing changed, so a rejection can
 * only be the parser's. Each rejection has a CONTROL (the same place holding a
 * valid value is accepted), and the expected output of a rejection is BASE with
 * that field (or block) removed, so a drop that disturbed a sibling fails too.
 * Non-finite numbers come from JSON TEXT (`1e999`), because `JSON.stringify(Infinity)`
 * is `null` and would test a different case.
 */
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import { parseCraftedAgentProfile } from "../agentProfileParser";

type DeepRequired<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<T[K]> }
    : T;

const ROOT = "agentProfile";
const BASE: DeepRequired<CraftedAgentProfile> = {
  name: "Hildegard of Bingen",
  title: "Abbess",
  era: "Medieval",
  specialization: "Herbal dietetics",
  synthesis: "Viriditas",
  monicaCreationStory: "Born of the Rhine",
  quotes: ["q1", "q2"],
  coreBeliefs: ["b1"],
  appearance: { symbol: "G", color: "#10b981" },
  consciousness: {
    dominantElement: "Earth", dominantAlchemicalQuantity: "Matter", dominantModality: "Fixed", level: "Master", strength: "Deep", emotion: "Serene", signature: "Verdant",
    natalChart: { Sun: { sign: "Virgo", degree: 12.5 } },
    alchemicalElements: { spirit: 5000, essence: 4200, matter: 3800, substance: 3500 },
  },
  personality: {
    core: { essence: "Healer", expression: "Herbs", emotion: "Devotion" },
    traits: ["t1", "t2"], currentMood: "Calm",
    gifts: [{ type: "G1", description: "D1", expression: "E1" }],
    shadows: [{ type: "S1", description: "D1", transformationPath: "P1" }],
    challenges: [{ type: "C1", description: "D1", growthOpportunity: "O1" }],
  },
  abilities: { specialty: "Herbs", teachingStyle: "Parable", resonanceType: "Earth", uniquePower: "Plants", wisdomDomains: ["w1"] },
  historicalDiet: {
    culturalCuisine: "Rhenish", dietaryPhilosophy: "Medicine", staples: ["spelt"], favoriteFoods: ["bread"],
    avoidedFoods: ["leeks"], beverages: ["wine"], foodLore: "Lore",
  },
  birthData: { date: "1098-09-16", time: "12:00", location: { name: "Bermersheim", latitude: 49.8, longitude: 8.2 } },
};
const BASE_JSON = JSON.stringify(BASE);

const WRONG: Array<[string, unknown]> = [["a number", 7], ["null", null], ["an object", { x: 1 }], ["an array", ["x"]], ["a boolean", true]];
const NOT_ARRAYS: Array<[string, unknown]> = [["a string", "x"], ["null", null], ["an object", { x: 1 }], ["a number", 7]];
const NOT_OBJECTS: Array<[string, unknown]> = [["a string", "x"], ["null", null], ["an array", []], ["a number", 7]];
const NOT_FINITE: Array<[string, unknown]> = [
  ["a string", "5"], ["null", null], ["an object", { x: 1 }],
  ["Infinity from 1e999", JSON.parse("1e999")], ["-Infinity from -1e999", JSON.parse("-1e999")],
];

function isContainer(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** BASE as wire JSON with one change applied at the dotted `path` (array indexes are plain numbers). */
function changed(path: string, apply: (parent: Record<string, unknown>, key: string) => void): unknown {
  const root: unknown = JSON.parse(BASE_JSON);
  const keys = path.split(".");
  const last = keys.pop();
  let node: unknown = root;
  for (const key of keys) node = isContainer(node) ? node[key] : undefined;
  if (last === undefined || !isContainer(node)) throw new Error(`BASE has no parent for ${path}`);
  apply(node, last);
  return root;
}

function setAt(path: string, value: unknown): unknown {
  return changed(path, (parent, key) => {
    parent[key] = value;
  });
}

function dropAt(path: string): unknown {
  return changed(path, (parent, key) => {
    Reflect.deleteProperty(parent, key);
  });
}

function run(value: unknown): { parsed: CraftedAgentProfile | null; issues: string[] } {
  const issues: string[] = [];
  return { parsed: parseCraftedAgentProfile(value, issues), issues };
}

function keeps(body: unknown): void {
  expect(run(body)).toStrictEqual({ parsed: body, issues: [] });
}

function becomes(body: unknown, expected: unknown, ...issues: string[]): void {
  expect(run(body)).toStrictEqual({ parsed: expected, issues });
}

const TEXT_PATHS = [
  "title", "era", "specialization", "synthesis", "monicaCreationStory",
  "appearance.symbol", "appearance.color",
  "consciousness.dominantModality", "consciousness.level", "consciousness.strength", "consciousness.emotion", "consciousness.signature",
  "personality.currentMood",
  "abilities.specialty", "abilities.teachingStyle", "abilities.resonanceType", "abilities.uniquePower",
  "historicalDiet.culturalCuisine", "historicalDiet.dietaryPhilosophy", "historicalDiet.foodLore",
  "birthData.date", "birthData.time", "birthData.location.name",
];
const LIST_PATHS = [
  "quotes", "coreBeliefs", "personality.traits", "abilities.wisdomDomains",
  "historicalDiet.staples", "historicalDiet.favoriteFoods", "historicalDiet.avoidedFoods", "historicalDiet.beverages",
];
const SECTION_PATHS = [
  "appearance", "consciousness", "personality", "abilities", "historicalDiet", "birthData",
  "consciousness.alchemicalElements", "personality.core", "birthData.location",
];
const ROW_LISTS: Array<[string, string]> = [["gifts", "expression"], ["shadows", "transformationPath"], ["challenges", "growthOpportunity"]];

describe("the profile as a whole", () => {
  it("CONTROL: the unchanged BASE is reproduced with no issues", () => {
    keeps(JSON.parse(BASE_JSON));
  });

  it.each<[string, unknown]>([["a string", "x"], ["an array", [{ name: "x" }]], ["a number", 7], ["a boolean", true]])(
    "%s is not a profile: null and one issue",
    (_label, value) => {
      expect(run(value)).toStrictEqual({ parsed: null, issues: [`${ROOT}: not an object`] });
    },
  );

  it("the name, the only required field: any string is a name, even an empty one (CONTROL)", () => {
    keeps(setAt("name", ""));
  });

  it.each(WRONG)("a name that is %s returns null with one issue", (_label, wrong) => {
    expect(run(setAt("name", wrong))).toStrictEqual({ parsed: null, issues: [`${ROOT}.name: missing or not a string`] });
  });

  it("a missing name returns null with one issue", () => {
    expect(run(dropAt("name"))).toStrictEqual({ parsed: null, issues: [`${ROOT}.name: missing or not a string`] });
  });

  it("garbage in every optional field never fails the page: only the name survives", () => {
    const { parsed, issues } = run({
      name: "Survivor", title: 1, era: null, specialization: [], synthesis: {}, monicaCreationStory: true,
      quotes: "q", coreBeliefs: 5, appearance: "a", consciousness: [], personality: 7, abilities: null,
      historicalDiet: "d", birthData: true,
    });
    expect(parsed).toStrictEqual({ name: "Survivor" });
    expect([...issues].sort()).toStrictEqual(
      [
        "title: not a string", "era: not a string", "specialization: not a string", "synthesis: not a string",
        "monicaCreationStory: not a string", "quotes: not an array", "coreBeliefs: not an array",
        "appearance: not an object", "consciousness: not an object", "personality: not an object",
        "abilities: not an object", "historicalDiet: not an object", "birthData: not an object",
      ].map((issue) => `${ROOT}.${issue}`).sort(),
    );
  });

  it("hostile keys are inert: nothing is copied and nothing is polluted", () => {
    const hostile: unknown = JSON.parse('{"name":"H","__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
    expect(run(hostile)).toStrictEqual({ parsed: { name: "H" }, issues: [] });
    expect(Reflect.has({}, "polluted")).toBe(false);
  });
});

describe.each(TEXT_PATHS)("optional string %s", (path) => {
  it("CONTROL: a string, even an empty one, is kept", () => {
    keeps(setAt(path, ""));
  });

  it.each(WRONG)("drops %s and reports it, leaving every sibling", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt(path), `${ROOT}.${path}: not a string`);
  });
});

describe.each(LIST_PATHS)("string array %s", (path) => {
  it.each([[[]], [["a", ""]]])("CONTROL: %p is kept", (list) => {
    keeps(setAt(path, list));
  });

  it.each(NOT_ARRAYS)("%s is not an array: dropped and reported", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt(path), `${ROOT}.${path}: not an array`);
  });

  it("keeps the strings of a mixed array and reports the rest ONCE", () => {
    becomes(setAt(path, ["a", 1, null, "b", {}]), setAt(path, ["a", "b"]), `${ROOT}.${path}: 3 non-string entries dropped`);
  });

  it("an array with no strings becomes an empty array", () => {
    becomes(setAt(path, [1, 2]), setAt(path, []), `${ROOT}.${path}: 2 non-string entries dropped`);
  });
});

describe.each(SECTION_PATHS)("object %s", (path) => {
  it.each(NOT_OBJECTS)("%s is not an object: dropped and reported", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt(path), `${ROOT}.${path}: not an object`);
  });
});

describe("consciousness.dominantElement is one of the four elements; anything else becomes Fire and the block SURVIVES", () => {
  const fire = setAt("consciousness.dominantElement", "Fire");
  const defaulted = (detail: string): string => `${ROOT}.consciousness.dominantElement: ${detail}, defaulted to Fire`;

  it.each(["Fire", "Water", "Earth", "Air"])("CONTROL: %s is kept", (element) => {
    keeps(setAt("consciousness.dominantElement", element));
  });

  it.each([["Spirit (a quantity)", "Spirit"], ["Essence (a quantity)", "Essence"], ["an unknown name", "Aether"], ["a lower-case element", "fire"], ["an empty string", ""], ["an array holding the element", ["Fire"]]])(
    "%s becomes Fire, is reported, and the natal chart, the level and every sibling survive",
    (_label, wrong) => {
      becomes(setAt("consciousness.dominantElement", wrong), fire, defaulted("not Fire, Water, Earth or Air"));
    },
  );

  it.each(WRONG)("%s becomes Fire too", (_label, wrong) => {
    becomes(setAt("consciousness.dominantElement", wrong), fire, defaulted("not Fire, Water, Earth or Air"));
  });

  it("a missing dominantElement becomes Fire; the natal chart and the level survive", () => {
    becomes(dropAt("consciousness.dominantElement"), fire, defaulted("missing"));
  });
});

describe("consciousness.dominantAlchemicalQuantity is Spirit, Essence, Matter or Substance, a separate reading from the element", () => {
  const path = "consciousness.dominantAlchemicalQuantity";
  const spirit = setAt(path, "Spirit");

  it.each(["Spirit", "Essence", "Matter", "Substance"])("CONTROL: %s is kept", (quantity) => {
    keeps(setAt(path, quantity));
  });

  it("absent defaults to Spirit with NO issue (no producer sends it yet)", () => {
    becomes(dropAt(path), spirit);
  });

  it.each([["an element", "Fire"], ["an unknown name", "Quintessence"], ["a lower-case quantity", "spirit"], ["an empty string", ""], ["an array holding the quantity", ["Spirit"]], ...WRONG])(
    "%s becomes Spirit and is reported, every sibling untouched",
    (_label, wrong) => {
      becomes(setAt(path, wrong), spirit, `${ROOT}.${path}: not Spirit, Essence, Matter or Substance, defaulted to Spirit`);
    },
  );

  it("the readings are independent: a quantity in the element slot and an element in the quantity slot are each defaulted, never exchanged", () => {
    const withConsciousness = (consciousness: Record<string, unknown>): unknown =>
      changed("consciousness", (parent, key) => {
        parent[key] = consciousness;
      });
    becomes(
      withConsciousness({ dominantElement: "Essence", dominantAlchemicalQuantity: "Water", level: "Master" }),
      withConsciousness({ dominantElement: "Fire", dominantAlchemicalQuantity: "Spirit", level: "Master" }),
      `${ROOT}.consciousness.dominantElement: not Fire, Water, Earth or Air, defaulted to Fire`,
      `${ROOT}.consciousness.dominantAlchemicalQuantity: not Spirit, Essence, Matter or Substance, defaulted to Spirit`,
    );
  });
});

describe.each(["spirit", "essence", "matter", "substance"])("alchemicalElements.%s", (key) => {
  const path = `consciousness.alchemicalElements.${key}`;
  const issue = `${ROOT}.consciousness.alchemicalElements: spirit, essence, matter and substance must all be finite numbers, omitted`;

  it.each([["zero", 0], ["a negative number", -3.5]])("CONTROL: %s is a finite number", (_label, ok) => {
    keeps(setAt(path, ok));
  });

  it.each(NOT_FINITE)("%s omits alchemicalElements and keeps the rest of consciousness", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt("consciousness.alchemicalElements"), issue);
  });

  it("a missing element omits alchemicalElements too", () => {
    becomes(dropAt(path), dropAt("consciousness.alchemicalElements"), issue);
  });
});

describe.each(["essence", "expression", "emotion"])("personality.core.%s", (key) => {
  const path = `personality.core.${key}`;
  const issue = `${ROOT}.personality.core: essence, expression and emotion must all be strings, omitted`;

  it("CONTROL: an empty string is a string", () => {
    keeps(setAt(path, ""));
  });

  it.each(WRONG)("%s omits core and keeps the rest of personality", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt("personality.core"), issue);
  });

  it("a missing field omits core too", () => {
    becomes(dropAt(path), dropAt("personality.core"), issue);
  });
});

describe.each(ROW_LISTS)("personality.%s rows", (list, optional) => {
  const path = `personality.${list}`;
  const good = { type: "T", description: "D" };
  const second = { type: "T2", description: "D2" };
  const BAD_ROWS: Array<[string, unknown]> = [
    ["a string", "x"], ["null", null], ["an array", []], ["a number", 7],
    ["missing its type", { description: "D" }], ["missing its description", { type: "T" }],
    ["a numeric type", { type: 1, description: "D" }], ["a null description", { type: "T", description: null }],
  ];

  it("CONTROL: empty strings are valid row fields", () => {
    keeps(setAt(path, [{ type: "", description: "", [optional]: "" }, good]));
  });

  it.each(BAD_ROWS)("drops a row that is %s, reports its index, keeps the others in order", (_label, row) => {
    becomes(setAt(path, [good, row, second]), setAt(path, [good, second]), `${ROOT}.${path}[1]: not a valid row`);
  });

  it(`drops a non-string ${optional} and keeps the row`, () => {
    becomes(setAt(path, [good, { ...good, [optional]: 7 }]), setAt(path, [good, good]), `${ROOT}.${path}[1].${optional}: not a string`);
  });

  it("a dropped row reports once, even when its optional field is also bad", () => {
    becomes(setAt(path, [{ type: 1, description: "D", [optional]: 7 }]), setAt(path, []), `${ROOT}.${path}[0]: not a valid row`);
  });

  it.each(NOT_ARRAYS)("%s is not an array: dropped and reported", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt(path), `${ROOT}.${path}: not an array`);
  });
});

describe.each(["latitude", "longitude"])("birthData.location.%s", (key) => {
  const path = `birthData.location.${key}`;

  it.each([["zero", 0], ["a negative number", -33.9]])("CONTROL: %s is kept", (_label, ok) => {
    keeps(setAt(path, ok));
  });

  it.each(NOT_FINITE)("drops %s and reports it", (_label, wrong) => {
    becomes(setAt(path, wrong), dropAt(path), `${ROOT}.${path}: not a finite number`);
  });
});
