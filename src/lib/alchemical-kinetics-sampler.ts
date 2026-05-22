export interface ElementVector {
  Fire: number
  Water: number
  Air: number
  Earth: number
}

export interface HourlyAlchemicalSample {
  t: Date
  planetaryHour?: string
  seasonalPhase?: string
  Energy: number
  totals: ElementVector
}

export interface SamplerOptions {
  hoursToSample?: number
  includePlanetaryHours?: boolean
  validateTiming?: boolean
}

export async function sampleDateRange(
  location: any,
  start: Date,
  end: Date,
  options: any
): Promise<{ samples: HourlyAlchemicalSample[] }> {
  return { samples: [] }
}

export async function sampleHourlyAlchm(options: any): Promise<HourlyAlchemicalSample[]> {
  return []
}
