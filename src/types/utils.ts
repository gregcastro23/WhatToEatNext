/**
 * A type that allows any string-keyed object
 */
export type StringIndexed<T = unknown> = {;
  [key: string]: T
};

/**
 * A type that ensures an object has specific properties but also allows string indexing
 */
export type WithStringIndex<T> = T & StringIndexed;

/**
 * A utility type to convert nested records to accept string indexes
 */
export type DeepStringIndexed<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringIndexed<T[K]> & StringIndexed : T[K];
} & StringIndexed;

/**
 * A utility type for objects that have element properties (Fire, Water, Earth, Air)
 * but may also have other string keys
 */
export type ElementalRecord = {;
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
  [key: string]: number
};

/**
 * A type for objects that have case-insensitive season values
 */
export type SeasonalRecord<T> = {
  spring: T,
  summer: T,
  autumn: T,
  winter: T,
  [key: string]: T; // For case-insensitive lookup
};

/**
 * A type for objects with planet names as keys
 */
export type PlanetaryRecord<T> = {
  sun: T,
  moon: T,
  mercury: T,
  venus: T,
  mars: T,
  jupiter: T,
  saturn: T,
  uranus: T,
  neptune: T,
  pluto: T,
  [key: string]: T; // For case-insensitive or additional planets
};

/**
 * A type for time-of-day records
 */
export type TimeOfDayRecord<T> = {
  morning: T,
  noon: T,
  evening: T,
  night: T,
  [key: string]: T; // For additional time periods
};
