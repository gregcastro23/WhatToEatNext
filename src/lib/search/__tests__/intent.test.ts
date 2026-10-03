/**
 * The intent parser (Phase 5) on its own: which words are intent, which are
 * ingredients, and what text is left for the name search. A small exact
 * lookup stands in for the catalog; the corpus tests use the real one.
 */
import { hasIntent, parseIntent, type QueryIntent } from "../intent";
import { normalizeText } from "../text";

const NAMES: Record<string, string> = {
  spinach: "spinach",
  egg: "chicken_egg",
  eggs: "chicken_egg",
  feta: "feta",
  pasta: "pasta",
  chicken: "chicken",
  "summer savory": "summer_savory",
  "spring onion": "green_onions",
  basil: "basil",
};

function parse(query: string): QueryIntent {
  return parseIntent(normalizeText(query).tokens, (text) => NAMES[text] ?? null, "autumn");
}

describe("parseIntent: recipe intents", () => {
  it("vegan pasta: a diet, and the ingredient stays in the text", () => {
    expect(parse("vegan pasta")).toMatchObject({ diet: "vegan", ingredients: ["pasta"], text: "pasta" });
  });

  it("vegan wins over vegetarian when both are asked, in either order", () => {
    expect(parse("vegetarian vegan").diet).toBe("vegan");
    expect(parse("vegan vegetarian").diet).toBe("vegan");
    expect(parse("plant-based").diet).toBe("vegan");
  });

  it("allergen claims are recognised but kept apart: the data can't verify them", () => {
    expect(parse("gluten-free pasta")).toMatchObject({ diet: null, unverified: ["gluten-free"], text: "pasta" });
    expect(parse("dairy free nut free").unverified).toEqual(["dairy-free", "nut-free"]);
  });

  it.each([
    ["quick chicken", 30, true, "chicken"],
    ["under 45 minutes", 45, false, ""],
    ["30-minute meals", 30, false, ""],
    ["30min dinner", 30, false, ""],
    ["in 20 mins", 20, false, ""],
    ["under an hour", 60, false, ""],
    ["2 hrs", 120, false, ""],
    ["less than 15 minutes", 15, false, ""],
  ])("%s → %i min (quick %s), text %j", (query, minutes, quick, text) => {
    const intent = parse(query);
    expect(intent.time).toEqual({ minutes, quick });
    expect(intent.text).toBe(text);
  });

  it("a number that is no time stays text, and so does a bare lead word", () => {
    expect(parse("30 cloves").time).toBeNull();
    expect(parse("under the sea")).toMatchObject({ time: null, text: "under the sea" });
  });

  it("meals, with plurals and supper", () => {
    expect(parse("desserts").meal).toBe("dessert");
    expect(parse("supper ideas")).toMatchObject({ meal: "dinner", text: "" });
  });
});

describe("parseIntent: ingredient intents", () => {
  it("in season resolves to the request's season; a named season is itself", () => {
    expect(parse("in season").season).toEqual({ season: "autumn", now: true });
    expect(parse("fall").season).toEqual({ season: "autumn", now: false });
    expect(parse("winter").season).toEqual({ season: "winter", now: false });
  });

  it("a category word narrows an ingredient intent, and only then", () => {
    expect(parse("mercury herbs")).toMatchObject({ planet: "Mercury", category: { label: "Herbs" }, text: "" });
    expect(parse("warming spices")).toMatchObject({ quality: { quality: "warming", stem: "warm" }, category: { label: "Spices" }, text: "" });
    const alone = parse("herbs");
    expect(alone.category).toBeNull();
    expect(alone.text).toBe("herbs");
    expect(hasIntent(alone)).toBe(false);
  });

  it("a catalog name beats the intent word inside it (longest span first)", () => {
    expect(parse("summer savory")).toMatchObject({ season: null, ingredients: ["summer_savory"], text: "summer savory" });
    expect(parse("spring onion")).toMatchObject({ season: null, ingredients: ["green_onions"] });
  });

  it("only the thermal words are qualities: warm salad is a dish", () => {
    expect(parse("warm salad").quality).toBeNull();
    expect(parse("cooling").quality).toEqual({ quality: "cooling", stem: "cool" });
  });
});

describe("parseIntent: several ingredients", () => {
  it("names each ingredient once, in order, and drops the joins between them", () => {
    expect(parse("spinach, eggs and feta")).toMatchObject({ ingredients: ["spinach", "chicken_egg", "feta"], text: "spinach eggs feta" });
    expect(parse("spinach egg eggs").ingredients).toEqual(["spinach", "chicken_egg"]);
  });

  it("a join stays in the text when fewer than two ingredients are named", () => {
    expect(parse("pasta and sauce")).toMatchObject({ ingredients: ["pasta"], text: "pasta and sauce" });
    expect(hasIntent(parse("pasta and sauce"))).toBe(false);
  });
});

describe("parseIntent: filler and regions", () => {
  it("filler leaves only beside an intent", () => {
    expect(parse("quick vegan recipes")).toMatchObject({ diet: "vegan", time: { minutes: 30 }, text: "" });
    expect(parse("recipes").text).toBe("recipes");
  });

  it("a region is a suggestion: its word stays in the text", () => {
    const intent = parse("oaxacan");
    expect(intent.region).toEqual({ phrase: "oaxacan", cuisine: "Mexican", basis: "Oaxaca is a state of Mexico" });
    expect(intent.text).toBe("oaxacan");
    expect(hasIntent(intent)).toBe(true);
  });

  it("a plain name has no intent", () => {
    for (const query of ["spinach", "carbonara", "dan dan noodles", "basil pesto"]) expect(hasIntent(parse(query))).toBe(false);
  });
});
