import { readJson } from "@/lib/api/json";
import {
  parseOwnerWeekMenuResponse,
  parsePublicWeekResponse,
} from "../weekMenuParser";

const VALID_SLOT = {
  dayOfWeek: 1,
  mealType: "dinner",
  recipe: { elementalProperties: { Fire: 0.5, Water: 0.5 } },
};

const OWNER_CONTROL = {
  success: true,
  menu: { meals: [VALID_SLOT] },
};

const PUBLIC_CONTROL = {
  success: true,
  updatedAt: "2026-11-12T12:00:00.000Z",
  meals: [VALID_SLOT],
};

describe("weekMenuParser — failure guards and paired controls", () => {
  it("rejects JSON null, non-records, and non-true success with paired controls", () => {
    expect(parseOwnerWeekMenuResponse(OWNER_CONTROL)).toEqual({
      meals: [VALID_SLOT],
    });
    expect(parsePublicWeekResponse(PUBLIC_CONTROL)).toEqual({
      meals: [VALID_SLOT],
      updatedAt: "2026-11-12T12:00:00.000Z",
    });

    const nullWire: unknown = JSON.parse("null");
    expect(() => parseOwnerWeekMenuResponse(nullWire)).toThrow();
    expect(() => parsePublicWeekResponse(nullWire)).toThrow();

    expect(() => parseOwnerWeekMenuResponse([])).toThrow();
    expect(() => parseOwnerWeekMenuResponse({ success: false, menu: null })).toThrow();
    expect(() => parseOwnerWeekMenuResponse({ success: "true", menu: null })).toThrow();
    expect(() => parsePublicWeekResponse([])).toThrow();
    expect(() => parsePublicWeekResponse({ success: false, updatedAt: null, meals: [] })).toThrow();
    expect(() => parsePublicWeekResponse({ success: "true", updatedAt: null, meals: [] })).toThrow();
  });

  it("enforces owner menu record and meals array shape", () => {
    expect(parseOwnerWeekMenuResponse({ success: true, menu: null })).toEqual({
      meals: [],
    });
    expect(() => parseOwnerWeekMenuResponse({ success: true })).toThrow(
      "expected menu record or null",
    );
    expect(() => parseOwnerWeekMenuResponse({ success: true, menu: [] })).toThrow(
      "expected menu record or null",
    );
    expect(() => parseOwnerWeekMenuResponse({ success: true, menu: {} })).toThrow(
      "expected meals array",
    );
    expect(() =>
      parseOwnerWeekMenuResponse({ success: true, menu: { meals: "bad" } }),
    ).toThrow("expected meals array");
    expect(() =>
      parseOwnerWeekMenuResponse({ success: true, menu: { meals: "" } }),
    ).toThrow("expected meals array");
  });

  it("enforces public updatedAt null-or-string and meals array shape", () => {
    expect(
      parsePublicWeekResponse({ success: true, updatedAt: null, meals: [] }),
    ).toEqual({ meals: [], updatedAt: null });

    expect(() =>
      parsePublicWeekResponse({ success: true, updatedAt: 1700000000, meals: [] }),
    ).toThrow();
    expect(() =>
      parsePublicWeekResponse({ success: true, updatedAt: undefined, meals: [] }),
    ).toThrow();
    expect(() =>
      parsePublicWeekResponse({ success: true, updatedAt: null, meals: {} }),
    ).toThrow();
  });

  it("drops an individual bad row alongside a valid control row, but throws when all rows fail", () => {
    const badRows: unknown[] = [
      "not-a-row",
      [],
      JSON.parse("null"),
      { dayOfWeek: -1, mealType: "dinner" },
      { dayOfWeek: 7, mealType: "dinner" },
      { dayOfWeek: 1.5, mealType: "dinner" },
      { dayOfWeek: "1", mealType: "dinner" },
      { dayOfWeek: 1, mealType: "brunch" },
      { dayOfWeek: 1, mealType: 123 },
      { dayOfWeek: 1, mealType: "dinner", recipe: "pasta" },
      { dayOfWeek: 1, mealType: "dinner", recipe: [] },
      { dayOfWeek: 1, mealType: "dinner", recipe: { elementalProperties: [] } },
      { dayOfWeek: 1, mealType: "dinner", recipe: { elementalProperties: "Fire" } },
      { dayOfWeek: 1, mealType: "dinner", recipe: { elementalProperties: { Fire: "0.5" } } },
      { dayOfWeek: 1, mealType: "dinner", recipe: { elementalProperties: { Fire: null } } },
    ];

    for (const bad of badRows) {
      const mixed = parsePublicWeekResponse({
        success: true,
        updatedAt: null,
        meals: [bad, VALID_SLOT],
      });
      expect(mixed.meals).toEqual([VALID_SLOT]);

      expect(() =>
        parsePublicWeekResponse({
          success: true,
          updatedAt: null,
          meals: [bad],
        }),
      ).toThrow();
    }
  });

  it("rejects non-finite 1e999 and -1e999 elementalProperties from JSON text via readJson and direct parse", async () => {
    const finiteControl = '{"success":true,"menu":{"meals":[{"dayOfWeek":2,"mealType":"lunch","recipe":{"elementalProperties":{"Fire":0.75}}}]}}';
    await expect(
      readJson(
        new Response(finiteControl, { headers: { "content-type": "application/json" } }),
        parseOwnerWeekMenuResponse,
      ),
    ).resolves.toEqual({
      meals: [{ dayOfWeek: 2, mealType: "lunch", recipe: { elementalProperties: { Fire: 0.75 } } }],
    });

    const posInfBody = '{"success":true,"menu":{"meals":[{"dayOfWeek":2,"mealType":"lunch","recipe":{"elementalProperties":{"Fire":1e999}}}]}}';
    await expect(
      readJson(
        new Response(posInfBody, { headers: { "content-type": "application/json" } }),
        parseOwnerWeekMenuResponse,
      ),
    ).rejects.toThrow();

    const negInfParsed: unknown = JSON.parse(
      '{"success":true,"updatedAt":null,"meals":[{"dayOfWeek":2,"mealType":"lunch","recipe":{"elementalProperties":{"Water":-1e999}}},{"dayOfWeek":3,"mealType":"snack"}]}',
    );
    expect(parsePublicWeekResponse(negInfParsed)).toEqual({
      meals: [{ dayOfWeek: 3, mealType: "snack" }],
      updatedAt: null,
    });
  });
});
