import type { ElementalProperties } from "./alchemy";

export type { Season } from "@/constants/seasons";
export interface SeasonalPhase {
  _name: Season;
  _start: Date;
  _peak: Date;
  _end: Date;
  _primaryElement: keyof ElementalProperties;
  secondaryElement: keyof ElementalProperties;
}
