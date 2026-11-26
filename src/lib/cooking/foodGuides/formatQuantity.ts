/** A guide quantity as a reader writes it: "400°F", "15–20 min", "3 days". */
import type { GuideQuantity, QuantityUnit } from "./schema";

const PLURALS: Readonly<Partial<Record<QuantityUnit, string>>> = { day: "days", week: "weeks", month: "months", cup: "cups" };

export function formatQuantity({ min, max, unit }: Pick<GuideQuantity, "min" | "max" | "unit">): string {
  const range = max === null || max === min ? `${min}` : `${min}–${max}`;
  if (unit === "°F") return `${range}°F`;
  const top = max ?? min;
  const word = top === 1 ? unit : (PLURALS[unit] ?? unit);
  return `${range} ${word}`;
}
