// Raw cooking methods - methods that don't involve heat
import type { CookingMethodData } from "@/types/cookingMethod";
import { raw } from "./raw";

export const rawCookingMethods: Record<string, CookingMethodData> = {
  raw,
};

export { raw };

export default rawCookingMethods;
