/**
 * The kitchen equipment a cosmic recipe request may name. The agents backend
 * has no equipment field, so it is written into the prompt it receives.
 */
import { z } from "zod";

export const MAX_EQUIPMENT = 20;
export const MAX_EQUIPMENT_LENGTH = 60;

export const equipmentSchema = z.array(z.string().trim().min(1).max(MAX_EQUIPMENT_LENGTH)).max(MAX_EQUIPMENT).optional();

/** Appended to the generation prompt; empty when no equipment was named. */
export function equipmentHint(equipment: readonly string[] | undefined): string {
  if (!equipment || equipment.length === 0) return "";
  return `\nAvailable equipment: ${equipment.join(", ")}. Cook with only this equipment, plus basic knives, bowls and utensils. If the dish needs something else, change the method instead.`;
}
