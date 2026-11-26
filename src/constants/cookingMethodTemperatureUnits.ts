/**
 * The unit of every number in a cooking method record's temperatures
 * (`optimalTemperatures`, and smoking's `temperature_range`).
 *
 * The records carry bare numbers. [VERIFIED 2026-11-25 against the data] Nine
 * are Celsius: pressure cooking tops out at 121, cryo cooking holds -196 and
 * -78, distilling's values are commented as °C. The rest are Fahrenheit
 * (boiling water is 212). Pages used to print every value as °F.
 *
 * `Record` over the servable keys makes a new method a type error until its
 * unit is named here.
 */
import { normalizeCookingMethodKey, type ServableCookingMethodKey } from "./cookingMethodKeys";

export type TemperatureUnit = "F" | "C";

export const COOKING_METHOD_TEMPERATURE_UNITS: Readonly<Record<ServableCookingMethodKey, TemperatureUnit>> = {
  boiling: "F",
  braising: "F",
  broiling: "F",
  cryo_cooking: "C",
  curing: "C",
  dehydrating: "C",
  distilling: "C",
  emulsification: "C",
  fermentation: "F",
  frying: "F",
  gelification: "F",
  grilling: "F",
  infusing: "C",
  marinating: "C",
  pickling: "F",
  poaching: "F",
  pressure_cooking: "C",
  raw: "F",
  roasting: "F",
  simmering: "F",
  smoking: "C",
  sous_vide: "F",
  spherification: "F",
  steaming: "F",
  stewing: "F",
  stir_frying: "F",
  tilt_skillet: "F",
};

const BY_KEY: ReadonlyMap<string, TemperatureUnit> = new Map(Object.entries(COOKING_METHOD_TEMPERATURE_UNITS));

/** The unit for a method key in any spelling ("pressure-cooking"), or null when it is no method. */
export function temperatureUnitFor(methodKey: string): TemperatureUnit | null {
  return BY_KEY.get(normalizeCookingMethodKey(methodKey)) ?? null;
}

export function toFahrenheitValue(value: number, unit: TemperatureUnit): number {
  return unit === "F" ? value : (value * 9) / 5 + 32;
}

/** "121°C". A value whose unit is unknown is shown without one rather than guessed. */
export function formatTemperature(value: number, unit: TemperatureUnit | null): string {
  return unit === null ? `${value}°` : `${value}°${unit}`;
}

/** The same temperature in the other unit, rounded: "250°F". Null when the unit is unknown. */
export function convertedTemperature(value: number, unit: TemperatureUnit | null): string | null {
  if (unit === null) return null;
  if (unit === "C") return `${Math.round(toFahrenheitValue(value, "C"))}°F`;
  return `${Math.round(((value - 32) * 5) / 9)}°C`;
}
