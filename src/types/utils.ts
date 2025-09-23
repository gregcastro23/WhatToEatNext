/**
 * A type that allows any string-keyed object
 */
export type StringIndexed<T = unknown> = {
  [key: string]: T
}

/**
 * A type that ensures an object has specific properties but also allows string indexing
 */
export type WithStringIndex<T> = T & StringIndexed,

/**
 * A utility type to convert nested records to accept string indexes
 */
export type DeepStringIndexed<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringIndexed<T[K]> & StringIndexed : T[K]
} & StringIndexed,

/**
 * A utility type for objects that have element properties (Fire, Water, Earth, Air)
 * but may also have other string keys
 */
export type ElementalRecord = {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
  [key: string]: number
}

/**
 * A type for objects that have case-insensitive season values
 */
export type SeasonalRecord<T> = {
  spring: T,
  _summer: T,
  _autumn: T,
  _winter: T,
  [key: string]: T // For case-insensitive lookup
}

/**
 * A type for objects with planet names as keys
 */
export type PlanetaryRecord<T> = {
  sun: T,
  _moon: T,
  _mercury: T,
  _venus: T,
  _mars: T,
  _jupiter: T,
  _saturn: T,
  _uranus: T,
  _neptune: T,
  _pluto: T,
  [key: string]: T // For case-insensitive or additional planets
}

/**
 * A type for time-of-day records
 */
export type TimeOfDayRecord<T> = {
  morning: T,
  _noon: T,
  _evening: T,
  _night: T,
  [key: string]: T // For additional time periods
}
