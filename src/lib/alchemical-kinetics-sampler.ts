/**
 * Alchemical Kinetics Sampler
 * ---------------------------
 * Hourly sampling with planetary timing context for kinetic calculations.
 * Builds on existing alchemizer patterns while adding seasonal and timing validation.
 */

import { createLogger } from '@/utils/logger'
import {
  computeElementalVelocity,
  computeElementalMomentum,
  computeForce,
  computeInertia,
  type ElementVector,
  type PlanetaryHour,
  type ForceVector,
} from './alchemical-kinetics'
import { alchemize, type AlchemicalInfo } from './alchemizer'
import { generateAccurateHoroscope } from './monica/horoscope-generator'
import { PlanetaryHourCalculator } from './PlanetaryHourCalculator'

const logger = createLogger('AlchemicalKineticsSampler')

export interface HourlyAlchemicalSample {
  t: Date
  totals: ElementVector
  Heat: number
  Entropy: number
  Reactivity: number
  Energy: number
  matter: number
  earth: number
  substance: number
  spirit: number
  essence: number
  planetaryHour: PlanetaryHour
  dayNight: 'day' | 'night'
  seasonalPhase: string
  force?: ForceVector
}

export class AlchemicalKineticsSampler {
  static async sampleRange(options: SamplerOptions): Promise<HourlyAlchemicalSample[]> {
    return Promise.resolve(sampleHourlyAlchm({ latitude: 0, longitude: 0 }, new Date(), options))
  }
}

export interface SamplerOptions {
  includePlanetaryHours?: boolean // Default true
  validateTiming?: boolean // Check against traditional expectations
  timeZone?: string
  hoursToSample?: number // Default 24
  startHour?: number // Default 0
}

export interface TimingValidationResult {
  isValid: boolean
  warnings: string[]
  seasonalExpectations: string
  planetaryPatterns: Record<string, number>
}

// Seasonal phase calculation based on date
function getSeasonalPhase(date: Date): string {
  const month = date.getMonth() // 0-based (January = 0)

  // Approximate seasonal boundaries (Northern Hemisphere)
  if (month === 11 || month === 0 || month === 1) return 'Winter'
  if (month === 2 || month === 3 || month === 4) return 'Spring'
  if (month === 5 || month === 6 || month === 7) return 'Summer'
  if (month === 8 || month === 9 || month === 10) return 'Autumn'

  return 'Transitional'
}

// Traditional seasonal expectations for validation
function getSeasonalExpectations(phase: string): string {
  const expectations: Record<string, string> = {
    Spring: 'Acceleration patterns, increasing Fire/Air elements, growth momentum',
    Summer: 'Peak energy, maximum Fire dominance, sustained high velocity',
    Autumn: 'Deceleration patterns, increasing Water/Earth, momentum conservation',
    Winter: 'Stability patterns, Earth dominance, low velocity variance',
    Transitional: 'Mixed patterns, elemental transitions, moderate variance',
  }
  return expectations[phase] || 'Unknown seasonal pattern'
}

// Convert alchemizer output to our kinetics-friendly format
function convertAlchemizerOutput(alchmData: Partial<AlchemicalInfo>): {
  totals: ElementVector
  Heat: number
  Entropy: number
  Reactivity: number
  Energy: number
  matter: number
  earth: number
  substance: number
  spirit: number
  essence: number
} {
  const effectValues = alchmData['Total Effect Value'] ?? {}
  const totals: ElementVector = {
    Fire: effectValues['Fire'] ?? 0,
    Water: effectValues['Water'] ?? 0,
    Air: effectValues['Air'] ?? 0,
    Earth: effectValues['Earth'] ?? 0,
  }

  const alchemyEffects = alchmData['Alchemy Effects']

  return {
    totals,
    Heat: alchmData.Heat ?? 0,
    Entropy: alchmData.Entropy ?? 0,
    Reactivity: alchmData.Reactivity ?? 0,
    Energy: alchmData.Energy ?? 0,
    matter: alchemyEffects?.['Total Matter'] ?? 0,
    earth: totals.Earth, // Earth element from totals
    substance: alchemyEffects?.['Total Substance'] ?? 0,
    spirit: alchemyEffects?.['Total Spirit'] ?? 0,
    essence: alchemyEffects?.['Total Essence'] ?? 0,
  }
}

/**
 * Attach force calculations to existing samples
 * Computes velocity, momentum, and force for the sample series
 */
export function attachForceToSamples(samples: HourlyAlchemicalSample[]): void {
  if (!samples || samples.length === 0) return

  // Build inputs for kinetics computation
  const elementalInput = samples.map(s => ({
    t: s.t,
    totals: s.totals,
    planetaryHour: s.planetaryHour,
  }))

  // Compute velocity
  const velocityResults = computeElementalVelocity(elementalInput)

  // Compute momentum (requires velocity and inertia)
  const momentumInput = velocityResults.map((vRec, i) => {
    const s = samples[i]
    if (!s) {
      throw new Error(
        `kinetics-sampler: no sample at index ${i} for ${velocityResults.length} velocity results`
      )
    }
    const inertia = computeInertia({
      matter: s.matter,
      earth: s.earth,
      substance: s.substance,
      planetaryHour: s.planetaryHour,
    })
    return { t: vRec.t, v: vRec.v, inertia, substance: s.substance }
  })
  const momentumResults = computeElementalMomentum(momentumInput)

  // Compute force
  const forceResults = computeForce(
    momentumResults.map((p, i) => {
      const mInput = momentumInput[i]
      const sample = samples[i]
      if (!mInput || !sample) {
        throw new Error(`kinetics-sampler: momentum/sample misalignment at index ${i}`)
      }
      return {
        t: p.t,
        p: p.p,
        inertia: mInput.inertia,
        planetaryHour: sample.planetaryHour,
      }
    }),
    velocityResults.map((v, i) => ({
      t: v.t,
      v: v.v,
      planetaryHour: samples[i]?.planetaryHour,
    }))
  )

  // Attach force to samples
  forceResults.forEach((forceRec, i) => {
    if (samples[i]) {
      samples[i].force = forceRec.f
    }
  })
}

/**
 * Sample hourly alchemical data with planetary timing context
 * Ensures proper astrological timing for kinetic calculations
 */
export function sampleHourlyAlchm(
  location: { latitude: number; longitude: number },
  date: Date,
  options: SamplerOptions = {}
): HourlyAlchemicalSample[] {
  // `validateTiming` / `timeZone` are part of SamplerOptions but consumed by
  // other functions (e.g. sampleDateRange); this sampler doesn't read them.
  const {
    includePlanetaryHours = true,
    hoursToSample = 24,
    startHour = 0,
  } = options

  const samples: HourlyAlchemicalSample[] = []
  const planetaryCalculator = includePlanetaryHours
    ? new PlanetaryHourCalculator(location.latitude, location.longitude)
    : null

  const baseDate = new Date(date)
  const seasonalPhase = getSeasonalPhase(baseDate)

  for (let i = 0; i < hoursToSample; i++) {
    const hour = (startHour + i) % 24

    // Create birth info for this hour
    const birthInfo = {
      year: baseDate.getFullYear(),
      month: baseDate.getMonth() + 1, // alchemizer expects 1-based months
      day: baseDate.getDate(),
      hour,
      minute: 0,
      latitude: location.latitude,
      longitude: location.longitude,
    }

    const hourDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hour,
      0
    )

    try {
      // Generate horoscope and alchemical data
      const horoscope = generateAccurateHoroscope(birthInfo)
      const alchmData = alchemize(birthInfo, horoscope)

      // Get planetary hour information
      let planetaryHour: PlanetaryHour = ''
      let isDaytime = true

      if (planetaryCalculator) {
        const planetaryInfo = planetaryCalculator.getPlanetaryHour(hourDate)
        planetaryHour = planetaryInfo.planet
        ;({ isDaytime } = planetaryInfo)
      }

      // Convert to kinetics format
      const converted = convertAlchemizerOutput(alchmData)

      const sample: HourlyAlchemicalSample = {
        t: hourDate,
        ...converted,
        planetaryHour,
        dayNight: isDaytime ? 'day' : 'night',
        seasonalPhase,
      }

      samples.push(sample)
    } catch (error) {
      logger.error(`Error processing hour ${hour}`, { error })
      // Add a minimal sample to maintain time series continuity
      samples.push({
        t: hourDate,
        totals: { Fire: 0, Water: 0, Air: 0, Earth: 0 },
        Heat: 0,
        Entropy: 0,
        Reactivity: 0,
        Energy: 0,
        matter: 0,
        earth: 0,
        substance: 0,
        spirit: 0,
        essence: 0,
        planetaryHour: '',
        dayNight: 'day',
        seasonalPhase,
      })
    }
  }

  return samples
}

/**
 * Validate timing patterns against traditional expectations
 * Checks for proper planetary hour effects and seasonal alignment
 */
export function validateTimingPatterns(samples: HourlyAlchemicalSample[]): TimingValidationResult {
  if (!samples || samples.length === 0) {
    return {
      isValid: false,
      warnings: ['No samples provided for validation'],
      seasonalExpectations: 'Cannot assess without data',
      planetaryPatterns: {},
    }
  }

  const warnings: string[] = []
  const planetaryPatterns: Record<string, number> = {}

  // Group samples by planetary hour
  const hourGroups: Record<string, HourlyAlchemicalSample[]> = {}
  samples.forEach(sample => {
    const hour = sample.planetaryHour || 'unknown'
    hourGroups[hour] ??= [];
    hourGroups[hour].push(sample)
  })

  // Calculate averages per planetary hour
  Object.entries(hourGroups).forEach(([hour, hourSamples]) => {
    if (hourSamples.length === 0) return

    const avgFire = hourSamples.reduce((sum, s) => sum + s.totals.Fire, 0) / hourSamples.length
    const avgWater = hourSamples.reduce((sum, s) => sum + s.totals.Water, 0) / hourSamples.length
    const avgEnergy = hourSamples.reduce((sum, s) => sum + s.Energy, 0) / hourSamples.length

    // Calculate force averages if available
    const forceSamples = hourSamples.filter(s => s.force)
    let avgFireForce = 0
    if (forceSamples.length > 0) {
      avgFireForce =
        forceSamples.reduce((sum, s) => sum + (s.force?.Fire ?? 0), 0) / forceSamples.length
    }

    planetaryPatterns[hour] = avgEnergy

    // Traditional validation checks
    if (hour === 'Sun' && avgFire < avgWater) {
      warnings.push('Fire element unexpectedly low during Sun hours')
    }
    if (hour === 'Moon' && avgWater < avgFire * 0.8) {
      warnings.push('Water element unexpectedly low during Moon hours')
    }

    // Force validation checks
    if (hour === 'Mars' && avgFireForce < 0.01) {
      warnings.push('Fire force unexpectedly low during Mars hours (should show acceleration)')
    }
    if (hour === 'Saturn' && avgFireForce > -0.01) {
      warnings.push('Fire force unexpectedly high during Saturn hours (should show deceleration)')
    }
  })

  // Seasonal validation
  const seasonalPhase = samples[0]?.seasonalPhase || 'Unknown'
  const seasonalExpectations = getSeasonalExpectations(seasonalPhase)

  // Check for seasonal alignment
  const totalSamples = samples.length
  const fireSum = samples.reduce((sum, s) => sum + s.totals.Fire, 0)
  const earthSum = samples.reduce((sum, s) => sum + s.totals.Earth, 0)
  const avgFire = fireSum / totalSamples
  const avgEarth = earthSum / totalSamples

  if (seasonalPhase === 'Summer' && avgFire < avgEarth) {
    warnings.push('Fire dominance expected in Summer but Earth is higher')
  }
  if (seasonalPhase === 'Winter' && avgEarth < avgFire * 0.8) {
    warnings.push('Earth dominance expected in Winter but Fire is disproportionately high')
  }

  const isValid = warnings.length === 0

  return {
    isValid,
    warnings,
    seasonalExpectations,
    planetaryPatterns,
  }
}

/**
 * Quick sampler for current moment (single sample)
 * Useful for real-time applications
 */
export function sampleCurrentMoment(
  location: { latitude: number; longitude: number },
  options: Pick<SamplerOptions, 'includePlanetaryHours' | 'timeZone'> = {}
): HourlyAlchemicalSample {
  const now = new Date()
  const samples = sampleHourlyAlchm(location, now, {
    ...options,
    hoursToSample: 1,
    startHour: now.getHours(),
  })

  const [first] = samples
  if (!first) {
    throw new Error('Failed to generate current moment sample')
  }

  return first
}

/**
 * Sample a date range with validation
 * For multi-day kinetic analysis
 */
export function sampleDateRange(
  location: { latitude: number; longitude: number },
  startDate: Date,
  endDate: Date,
  options: SamplerOptions = {}
): {
  samples: HourlyAlchemicalSample[]
  validation: TimingValidationResult
} {
  const allSamples: HourlyAlchemicalSample[] = []

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dailySamples = sampleHourlyAlchm(location, currentDate, options)
    allSamples.push(...dailySamples)

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const validation = options.validateTiming
    ? validateTimingPatterns(allSamples)
    : { isValid: true, warnings: [], seasonalExpectations: '', planetaryPatterns: {} }

  return {
    samples: allSamples,
    validation,
  }
}

