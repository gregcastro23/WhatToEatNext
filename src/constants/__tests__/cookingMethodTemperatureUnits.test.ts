/**
 * Every cooking method record names the unit of its temperatures, and the
 * named unit agrees with physical anchors in the data.
 *
 * @jest-environment node
 */
import { getCookingMethodsByTemperature } from "@/data/cooking";
import { allCookingMethods } from "@/data/cooking/methods";
import {
  COOKING_METHOD_TEMPERATURE_UNITS,
  convertedTemperature,
  formatTemperature,
  temperatureUnitFor,
} from "../cookingMethodTemperatureUnits";

const keys = Object.keys(allCookingMethods);
const temperaturesOf = (key: string): number[] => {
  const record: unknown = Reflect.get(allCookingMethods, key);
  const table: unknown = typeof record === "object" && record !== null ? Reflect.get(record, "optimalTemperatures") : undefined;
  return typeof table === "object" && table !== null
    ? Object.values(table).filter((value): value is number => typeof value === "number")
    : [];
};

describe("cooking method temperature units", () => {
  it("names a unit for all 27 records and nothing else", () => {
    expect(keys).toHaveLength(27);
    expect(Object.keys(COOKING_METHOD_TEMPERATURE_UNITS).sort()).toEqual([...keys].sort());
  });

  it.each(keys)("%s has temperatures that are physically possible in its unit", (key) => {
    const unit = temperatureUnitFor(key);
    expect(unit).not.toBeNull();
    for (const value of temperaturesOf(key)) {
      // Nothing in a kitchen record is below dry ice and liquid nitrogen, or above 900°F.
      if (unit === "F") expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(unit === "C" ? 250 : 900);
    }
  });

  it.each([
    ["boiling", "F", 212],
    ["pressure_cooking", "C", 121],
    ["cryo_cooking", "C", -196],
    ["distilling", "C", 78],
    ["dehydrating", "C", 70],
    ["roasting", "F", 425],
  ])("%s is in °%s (its record holds %d)", (key, unit, value) => {
    expect(temperatureUnitFor(key)).toBe(unit);
    expect(temperaturesOf(key)).toContain(value);
  });

  it("formats and converts without guessing", () => {
    expect(formatTemperature(121, temperatureUnitFor("pressure-cooking"))).toBe("121°C");
    expect(convertedTemperature(121, "C")).toBe("250°F");
    expect(convertedTemperature(212, "F")).toBe("100°C");
    expect(temperatureUnitFor("baking")).toBeNull();
    expect(formatTemperature(5, null)).toBe("5°");
    expect(convertedTemperature(5, null)).toBeNull();
  });

  it("filters methods by temperature in Fahrenheit whatever the record's unit", () => {
    const hot = Object.keys(getCookingMethodsByTemperature(245, 255));
    expect(hot).toContain("pressure_cooking");
    expect(Object.keys(getCookingMethodsByTemperature(100, 125))).not.toContain("pressure_cooking");
  });
});
