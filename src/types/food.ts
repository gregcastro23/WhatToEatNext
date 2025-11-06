export interface FoodAssociation {
  cookingMethods?: string[];
  planet?: string;
  foods?: string[];
  qualities?: string[];
  elementalAffinities?: string[];
  boostTimes?: {
    dayOfWeek?: number;
    hourOfDay?: number[];
  };
  [key: string]: unknown; // Allow additional properties
}
