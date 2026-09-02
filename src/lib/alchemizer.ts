// Alchemizer Engine
// This module implements the core alchemical calculation system

import { _logger } from './logger'
import { generateAccurateHoroscope, type BirthInfo, type GeneratedHoroscope } from './monica/horoscope-generator'
import { recordElementalLogicMode } from './observability-legacy'
import { performanceCache, createBirthInfoHash } from './performance-cache'

// Zodiac signs indexed by number
export const signs: Record<number, string> = {
  0: 'Aries',
  1: 'Taurus',
  2: 'Gemini',
  3: 'Cancer',
  4: 'Leo',
  5: 'Virgo',
  6: 'Libra',
  7: 'Scorpio',
  8: 'Sagittarius',
  9: 'Capricorn',
  10: 'Aquarius',
  11: 'Pisces',
}

// Reverse mapping for convenience
export const signIndices: Record<string, number> = Object.entries(signs).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: parseInt(key, 10) }),
  {} as Record<string, number>
)

export interface PlanetAlchemy {
  Spirit?: number
  Essence?: number
  Matter?: number
  Substance?: number
}

export interface PlanetInfoEntry {
  'Dignity Effect'?: Record<string, number>
  Elements?: string[]
  Alchemy?: PlanetAlchemy
  'Diurnal Element': string
  'Nocturnal Element': string
}

// Planet information including dignity effects and elemental properties
export const planetInfo: Record<string, PlanetInfoEntry> = {
  Sun: {
    'Dignity Effect': {
      Leo: 1,
      Aries: 2,
      Aquarius: -1,
      Libra: -2,
    },
    Elements: ['Fire', 'Fire'],
    Alchemy: {
      Spirit: 1,
      Essence: 0,
      Matter: 0,
      Substance: 0,
    },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire',
  },
  Moon: {
    'Dignity Effect': {
      Cancer: 1,
      Taurus: 2,
      Capricorn: -1,
      Scorpio: -2,
    },
    Elements: ['Water', 'Water'],
    Alchemy: {
      Spirit: 0,
      Essence: 1,
      Matter: 1,
      Substance: 0,
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water',
  },
  Mercury: {
    'Dignity Effect': {
      Gemini: 1,
      Virgo: 3,
      Sagittarius: 1,
      Pisces: -3,
    },
    Elements: ['Air', 'Earth'],
    Alchemy: {
      Spirit: 1,
      Essence: 0,
      Matter: 0,
      Substance: 1,
    },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth',
  },
  Venus: {
    'Dignity Effect': {
      Libra: 1,
      Taurus: 1,
      Pisces: 2,
      Aries: -1,
      Scorpio: -1,
      Virgo: -2,
    },
    Elements: ['Water', 'Earth'],
    Alchemy: {
      Spirit: 0,
      Essence: 1,
      Matter: 1,
      Substance: 0,
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Earth',
  },
  Mars: {
    'Dignity Effect': {
      Aries: 1,
      Scorpio: 1,
      Capricorn: 2,
      Taurus: -1,
      Libra: -1,
      Cancer: -2,
    },
    Elements: ['Fire', 'Water'],
    Alchemy: {
      Spirit: 0,
      Essence: 1,
      Matter: 1,
      Substance: 0,
    },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Water',
  },
  Jupiter: {
    'Dignity Effect': {
      Pisces: 1,
      Sagittarius: 1,
      Cancer: 2,
      Gemini: -1,
      Virgo: -1,
      Capricorn: -2,
    },
    Elements: ['Air', 'Fire'],
    Alchemy: {
      Spirit: 1,
      Essence: 1,
      Matter: 0,
      Substance: 0,
    },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Fire',
  },
  Saturn: {
    'Dignity Effect': {
      Aquarius: 1,
      Capricorn: 1,
      Libra: 2,
      Cancer: -1,
      Leo: -1,
      Aries: -2,
    },
    Elements: ['Air', 'Earth'],
    Alchemy: {
      Spirit: 1,
      Essence: 0,
      Matter: 1,
      Substance: 0,
    },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth',
  },
  Uranus: {
    'Dignity Effect': {
      Aquarius: 1,
      Scorpio: 2,
      Taurus: -3,
    },
    Elements: ['Water', 'Air'],
    Alchemy: {
      Spirit: 0,
      Essence: 1,
      Matter: 1,
      Substance: 0,
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Air',
  },
  Neptune: {
    'Dignity Effect': {
      Pisces: 1,
      Cancer: 2,
      Virgo: -1,
      Capricorn: -2,
    },
    Elements: ['Water', 'Water'],
    Alchemy: {
      Spirit: 0,
      Essence: 1,
      Matter: 0,
      Substance: 1,
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water',
  },
  Pluto: {
    'Dignity Effect': {
      Scorpio: 1,
      Leo: 2,
      Taurus: -1,
      Aquarius: -2,
    },
    Elements: ['Earth', 'Water'],
    Alchemy: {
      Spirit: 0,
      Essence: 1,
      Matter: 1,
      Substance: 0,
    },
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Water',
  },
  Ascendant: {
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Earth',
  },
}

export interface SignInfoEntry {
  Element: string
  Ruler: string
  Modality: string
  'Major Tarot Card'?: string
}

// Sign information
export const signInfo: Record<string, SignInfoEntry> = {
  Aries: {
    Element: 'Fire',
    Ruler: 'Mars',
    Modality: 'Cardinal',
  },
  Taurus: {
    Element: 'Earth',
    Ruler: 'Venus',
    Modality: 'Fixed',
  },
  Gemini: {
    Element: 'Air',
    Ruler: 'Mercury',
    Modality: 'Mutable',
  },
  Cancer: {
    Element: 'Water',
    Ruler: 'Moon',
    Modality: 'Cardinal',
  },
  Leo: {
    Element: 'Fire',
    Ruler: 'Sun',
    Modality: 'Fixed',
  },
  Virgo: {
    Element: 'Earth',
    Ruler: 'Mercury',
    Modality: 'Mutable',
  },
  Libra: {
    Element: 'Air',
    Ruler: 'Venus',
    Modality: 'Cardinal',
  },
  Scorpio: {
    Element: 'Water',
    Ruler: 'Mars',
    Modality: 'Fixed',
  },
  Sagittarius: {
    Element: 'Fire',
    Ruler: 'Jupiter',
    Modality: 'Mutable',
  },
  Capricorn: {
    Element: 'Earth',
    Ruler: 'Saturn',
    Modality: 'Cardinal',
  },
  Aquarius: {
    Element: 'Air',
    Ruler: 'Saturn',
    Modality: 'Fixed',
  },
  Pisces: {
    Element: 'Water',
    Ruler: 'Jupiter',
    Modality: 'Mutable',
  },
}

// Helper function to capitalize strings
export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Create an empty element object
export function createElementObject(): Record<string, number> {
  return {
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  }
}

// Combine two element objects
export function combineElementObjects(
  element_object_1: Record<string, number>,
  element_object_2: Record<string, number>
): Record<string, number> {
  const combinedObject = createElementObject()
  combinedObject['Fire'] = (element_object_1['Fire'] ?? 0) + (element_object_2['Fire'] ?? 0)
  combinedObject['Water'] = (element_object_1['Water'] ?? 0) + (element_object_2['Water'] ?? 0)
  combinedObject['Air'] = (element_object_1['Air'] ?? 0) + (element_object_2['Air'] ?? 0)
  combinedObject['Earth'] = (element_object_1['Earth'] ?? 0) + (element_object_2['Earth'] ?? 0)
  return combinedObject
}

// Get ranking of elements by value (top `rank` slots, max 4)
export function getElementRanking(
  element_object: Record<string, number>,
  rank = 1
): Record<number, string> {
  const elementRankDict: Record<number, string> = {
    1: '',
    2: '',
    3: '',
    4: '',
  }

  const remaining = new Map(Object.entries(element_object))
  const slots = Math.max(0, Math.min(rank, 4))

  for (let i = 1; i <= slots; i++) {
    let topElement = ''
    let topValue = -Infinity
    for (const [element, value] of remaining) {
      if (value > topValue) {
        topValue = value
        topElement = element
      }
    }
    if (!topElement) break
    elementRankDict[i] = topElement
    remaining.delete(topElement)
  }

  return elementRankDict
}

// Get sum of all element values
export function getAbsoluteElementValue(element_object: Record<string, number>): number {
  return (
    (element_object['Fire'] ?? 0) +
    (element_object['Water'] ?? 0) +
    (element_object['Air'] ?? 0) +
    (element_object['Earth'] ?? 0)
  )
}

// Calculate elemental compatibility according to elementallogic principles
export function getElementalCompatibility(element1: string, element2: string): number {
  if (element1 === element2) {
    return 0.9
  }
  return 0.7
}

// Get the complementary element (according to elementallogic, each element complements itself)
export function getComplementaryElement(element: string): string {
  return element
}

export interface AlchemicalInfo {
  'Sun Sign': string
  'Major Arcana': { Sun: string; Ascendant: string }
  'Minor Arcana': { Decan: string; Cusp: string }
  'Alchemy Effects': {
    'Total Spirit': number
    'Total Essence': number
    'Total Day Essence': number
    'Total Matter': number
    'Total Substance': number
    'Total Night Essence': number
    'A #'?: number
  }
  'Chart Ruler': string
  'Total Dignity Effect': Record<string, number>
  'Total Decan Effect': Record<string, number>
  'Total Degree Effect': Record<string, number>
  'Total Aspect Effect': Record<string, number>
  'Total Elemental Effect': Record<string, number>
  'Total Effect Value': Record<string, number>
  'Dominant Element': string
  'Total Chart Absolute Effect': number
  Heat: number
  Entropy: number
  Reactivity: number
  Energy: number
  '# Cardinal': number
  '# Fixed': number
  '# Mutable': number
  '% Cardinal': number
  '% Fixed': number
  '% Mutable': number
  'Dominant Modality': string
  'All Conjunctions': unknown[]
  'All Trines': unknown[]
  'All Squares': unknown[]
  'All Oppositions': unknown[]
  Stelliums: unknown[]
  Signs: Record<string, Record<string, unknown>>
  Planets: Record<string, Record<string, unknown>>
  [key: string]: unknown
}

export type AlchemizerBirthInfo =
  | BirthInfo
  | {
      year?: number
      month?: number
      day?: number
      hour?: number
      minute?: number
      latitude?: number
      longitude?: number
      [key: string]: unknown
    }

export interface HoroscopeCelestialBody {
  label?: string
  Sign?: { label?: string }
  House?: { label?: string }
  ChartPosition?: {
    Ecliptic?: { ArcDegreesFormatted30?: string }
  }
}

export interface HoroscopeAspectItem {
  aspectKey?: string
  point1Label?: string
  point2Label?: string
}

export interface HoroscopeInput {
  Ascendant?: { Sign?: { label?: string } }
  CelestialBodies?: {
    all?: HoroscopeCelestialBody[]
    [key: string]: unknown
  }
  Aspects?: {
    points?: Record<string, HoroscopeAspectItem[]>
  }
  tropical?: HoroscopeInput
  [key: string]: unknown
}

// Main alchemizer function
export function alchemize(
  birth_info: AlchemizerBirthInfo,
  horoscope_dict: HoroscopeInput | GeneratedHoroscope
): AlchemicalInfo {
  let uiOverride: boolean | null = null
  try {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('additiveOnlyElements')
      if (v === 'true') uiOverride = true
      else if (v === 'false') uiOverride = false
    }
  } catch {}

  const envFlag =
    (typeof process !== 'undefined' &&
      process.env.NEXT_PUBLIC_ADDITIVE_ONLY_ELEMENTS === 'true') ||
    false
  const ADDITIVE_ONLY_ELEMENTS = uiOverride ?? envFlag
  recordElementalLogicMode(ADDITIVE_ONLY_ELEMENTS ? 'additive' : 'legacy')

  const birthInfoHash = createBirthInfoHash(birth_info)
  const cachedResult = performanceCache.getAlchemicalData(birthInfoHash)
  if (cachedResult) {
    return cachedResult as AlchemicalInfo
  }

  const rawDict = horoscope_dict as Record<string, unknown>
  const horoscope: HoroscopeInput = (rawDict['tropical'] as HoroscopeInput | undefined) ?? (horoscope_dict as HoroscopeInput)

  let diurnalOrNocturnal = 'Diurnal'
  const birthDict = birth_info as Record<string, unknown>
  const hour = typeof birthDict['hour'] === 'number' ? birthDict['hour'] : 12
  if (hour < 5 || hour > 17) {
    diurnalOrNocturnal = 'Nocturnal'
  }

  const alchmInfo: AlchemicalInfo = {
    'Sun Sign': '',
    'Major Arcana': { Sun: '', Ascendant: '' },
    'Minor Arcana': { Decan: '', Cusp: 'None' },
    'Alchemy Effects': {
      'Total Spirit': 0,
      'Total Essence': 0,
      'Total Day Essence': 0,
      'Total Matter': 0,
      'Total Substance': 0,
      'Total Night Essence': 0,
    },
    'Chart Ruler': '',
    'Total Dignity Effect': createElementObject(),
    'Total Decan Effect': createElementObject(),
    'Total Degree Effect': createElementObject(),
    'Total Aspect Effect': createElementObject(),
    'Total Elemental Effect': createElementObject(),
    'Total Effect Value': createElementObject(),
    'Dominant Element': '',
    'Total Chart Absolute Effect': 0,
    Heat: 0,
    Entropy: 0,
    Reactivity: 0,
    Energy: 0,
    '# Cardinal': 0,
    '# Fixed': 0,
    '# Mutable': 0,
    '% Cardinal': 0,
    '% Fixed': 0,
    '% Mutable': 0,
    'Dominant Modality': '',
    'All Conjunctions': [],
    'All Trines': [],
    'All Squares': [],
    'All Oppositions': [],
    Stelliums: [],
    Signs: {},
    Planets: {},
  }

  Object.values(signs).forEach(sign => {
    alchmInfo['Signs'][sign] = {}
  })

  Object.keys(planetInfo).forEach(planet => {
    alchmInfo['Planets'][planet] = {}
  })

  if (!alchmInfo['Planets']['Ascendant']) {
    alchmInfo['Planets']['Ascendant'] = {}
  }

  const risingSign = horoscope.Ascendant?.Sign?.label
  if (risingSign && signInfo[risingSign]) {
    const risingElement = signInfo[risingSign].Element

    alchmInfo['Planets']['Ascendant']['Diurnal Element'] = risingElement
    alchmInfo['Planets']['Ascendant']['Nocturnal Element'] = risingElement

    const ascTarot = signInfo[risingSign]['Major Tarot Card']
    if (ascTarot) {
      alchmInfo['Major Arcana']['Ascendant'] = ascTarot
    }
  }

  if (horoscope.CelestialBodies?.all) {
    const sunData = horoscope.CelestialBodies.all.find((p) => p.label === 'Sun')
    const sunSign = sunData?.Sign?.label
    if (sunSign && signInfo[sunSign]) {
      alchmInfo['Sun Sign'] = sunSign
      alchmInfo['Chart Ruler'] = signInfo[sunSign].Ruler

      const sunTarot = signInfo[sunSign]['Major Tarot Card']
      if (sunTarot) {
        alchmInfo['Major Arcana']['Sun'] = sunTarot
      }
    }
  }

  if (horoscope.CelestialBodies?.all) {
    horoscope.CelestialBodies.all.forEach((planet_data) => {
      const planet = planet_data.label
      const sign = planet_data.Sign?.label

      if (planet && sign && signInfo[sign]) {
        const element = signInfo[sign].Element
        const modality = signInfo[sign].Modality

        if (modality === 'Cardinal') alchmInfo['# Cardinal'] += 1
        else if (modality === 'Fixed') alchmInfo['# Fixed'] += 1
        else if (modality === 'Mutable') alchmInfo['# Mutable'] += 1

        alchmInfo['Total Effect Value'][element] = (alchmInfo['Total Effect Value'][element] ?? 0) + 1

        const planetMeta = planetInfo[planet]
        if (planetMeta) {
          let elementalEffectValue = 0

          if (planet === 'Sun' || planet === 'Moon') {
            const planetElement =
              diurnalOrNocturnal === 'Diurnal'
                ? planetMeta['Diurnal Element']
                : planetMeta['Nocturnal Element']

            if (planetElement === element) {
              elementalEffectValue = 1
            }
          } else {
            if (planetMeta['Diurnal Element'] === element) {
              elementalEffectValue = 1
            } else if (planetMeta['Nocturnal Element'] === element) {
              elementalEffectValue = 1
            } else {
              elementalEffectValue = ADDITIVE_ONLY_ELEMENTS ? 0 : -1
            }
          }

          alchmInfo['Total Effect Value'][element] = (alchmInfo['Total Effect Value'][element] ?? 0) + elementalEffectValue

          alchmInfo['Planets'][planet] ??= {}
          alchmInfo['Planets'][planet]['Sign'] = sign
          alchmInfo['Planets'][planet]['Element'] = element

          const dignityEffect = planetMeta['Dignity Effect']?.[sign] ?? 0
          let totalEffectMultiplier = 1

          if (dignityEffect) {
            totalEffectMultiplier += Math.abs(dignityEffect) * 0.1
          }

          alchmInfo['Planets'][planet]['Total Effect Multiplier'] = totalEffectMultiplier

          const baseAlchemyValues = planetMeta['Alchemy']
          if (baseAlchemyValues) {
            const alchemyValues: Record<string, unknown> = {}

            if (!alchmInfo['Planets'][planet]['Alchemy Effects']) {
              alchmInfo['Planets'][planet]['Alchemy Effects'] = {}
            }

            if (baseAlchemyValues['Spirit']) {
              const spiritBonus = baseAlchemyValues['Spirit'] * totalEffectMultiplier
              alchemyValues['Spirit'] = spiritBonus
              alchmInfo['Alchemy Effects']['Total Spirit'] += spiritBonus
              alchemyValues['Day Alchemy'] = { Spirit: spiritBonus }
            }

            if (baseAlchemyValues['Essence']) {
              const essenceBonus = baseAlchemyValues['Essence'] * totalEffectMultiplier
              alchemyValues['Essence'] = essenceBonus
              alchmInfo['Alchemy Effects']['Total Essence'] += essenceBonus

              if (alchemyValues['Spirit']) {
                alchemyValues['Night Alchemy'] = { Essence: essenceBonus }
                alchmInfo['Alchemy Effects']['Total Night Essence'] += essenceBonus
              } else {
                alchemyValues['Day Alchemy'] = { Essence: essenceBonus }
                alchmInfo['Alchemy Effects']['Total Day Essence'] += essenceBonus
              }
            }

            if (baseAlchemyValues['Matter']) {
              const matterBonus = baseAlchemyValues['Matter'] * totalEffectMultiplier
              alchemyValues['Matter'] = matterBonus
              alchmInfo['Alchemy Effects']['Total Matter'] += matterBonus
              alchemyValues['Night Alchemy'] = { Matter: matterBonus }
            }

            if (baseAlchemyValues['Substance']) {
              const substanceBonus = baseAlchemyValues['Substance'] * totalEffectMultiplier
              alchemyValues['Substance'] = substanceBonus
              alchmInfo['Alchemy Effects']['Total Substance'] += substanceBonus
              alchemyValues['Night Alchemy'] = { Substance: substanceBonus }
            }

            alchmInfo['Planets'][planet]['Alchemy Effects'] = alchemyValues
          }
        }
      }
    })
  }

  if (horoscope.Aspects?.points) {
    Object.entries(horoscope.Aspects.points).forEach(([_planetKey, aspects]) => {
      if (Array.isArray(aspects)) {
        aspects.forEach((aspect) => {
          const aspectType = aspect.aspectKey
          const planet1 = aspect.point1Label
          const planet2 = aspect.point2Label

          let aspectMultiplier = 1.0
          if (aspectType === 'conjunction') aspectMultiplier = 1.2
          else if (aspectType === 'trine') aspectMultiplier = 1.1
          else if (aspectType === 'square') aspectMultiplier = 0.9
          else if (aspectType === 'opposition') aspectMultiplier = 0.8

          const p1Alchemy = planet1 ? planetInfo[planet1]?.['Alchemy'] : undefined
          const p2Alchemy = planet2 ? planetInfo[planet2]?.['Alchemy'] : undefined
          if (p1Alchemy && p2Alchemy) {
            const keys: Array<keyof PlanetAlchemy> = ['Spirit', 'Essence', 'Matter', 'Substance']
            for (const key of keys) {
              const value1 = p1Alchemy[key] ?? 0
              const value2 = p2Alchemy[key] ?? 0

              if (value1 > 0 && value2 > 0) {
                const targetKey = `Total ${key}` as keyof AlchemicalInfo['Alchemy Effects']
                const currentVal = alchmInfo['Alchemy Effects'][targetKey] ?? 0
                alchmInfo['Alchemy Effects'][targetKey] = currentVal + 0.1 * aspectMultiplier
              }
            }
          }
        })
      }
    })
  }

  const { 1: dominantElement } = getElementRanking(alchmInfo['Total Effect Value'])
  if (dominantElement !== undefined) {
    alchmInfo['Dominant Element'] = dominantElement
  }

  const totalPlanets = alchmInfo['# Cardinal'] + alchmInfo['# Fixed'] + alchmInfo['# Mutable']
  if (totalPlanets > 0) {
    alchmInfo['% Cardinal'] = alchmInfo['# Cardinal'] / totalPlanets
    alchmInfo['% Fixed'] = alchmInfo['# Fixed'] / totalPlanets
    alchmInfo['% Mutable'] = alchmInfo['# Mutable'] / totalPlanets

    if (
      alchmInfo['% Cardinal'] >= alchmInfo['% Fixed'] &&
      alchmInfo['% Cardinal'] >= alchmInfo['% Mutable']
    ) {
      alchmInfo['Dominant Modality'] = 'Cardinal'
    } else if (
      alchmInfo['% Fixed'] >= alchmInfo['% Cardinal'] &&
      alchmInfo['% Fixed'] >= alchmInfo['% Mutable']
    ) {
      alchmInfo['Dominant Modality'] = 'Fixed'
    } else if (
      alchmInfo['% Mutable'] >= alchmInfo['% Cardinal'] &&
      alchmInfo['% Mutable'] >= alchmInfo['% Fixed']
    ) {
      alchmInfo['Dominant Modality'] = 'Mutable'
    }
  }

  const fire = alchmInfo['Total Effect Value']['Fire'] ?? 0
  const water = alchmInfo['Total Effect Value']['Water'] ?? 0
  const air = alchmInfo['Total Effect Value']['Air'] ?? 0
  const earth = alchmInfo['Total Effect Value']['Earth'] ?? 0
  const spirit = alchmInfo['Alchemy Effects']['Total Spirit']
  const essence = alchmInfo['Alchemy Effects']['Total Essence']
  const matter = alchmInfo['Alchemy Effects']['Total Matter']
  const substance = alchmInfo['Alchemy Effects']['Total Substance']

  const denominator = (substance + essence + matter + water + air + earth) || 1
  const earthWaterDenominator = (matter + earth + water) || 1

  alchmInfo['Heat'] = (spirit ** 2 + fire ** 2) / denominator ** 2 || 0
  alchmInfo['Entropy'] =
    (spirit ** 2 + substance ** 2 + fire ** 2 + air ** 2) / earthWaterDenominator ** 2 || 0
  alchmInfo['Reactivity'] =
    (spirit ** 2 + substance ** 2 + essence ** 2 + fire ** 2 + air ** 2 + water ** 2) /
      ((matter + earth) ** 2 || 1) || 0
  alchmInfo['Energy'] = alchmInfo['Heat'] - alchmInfo['Reactivity'] * alchmInfo['Entropy'] || 0

  alchmInfo['Alchemy Effects']['A #'] = spirit + essence + matter + substance

  performanceCache.setAlchemicalData(birthInfoHash, alchmInfo)

  return alchmInfo
}

const currentMomentCache = new Map<string, { data: AlchemicalInfo; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function generateAlchmForCurrentMoment(): Promise<AlchemicalInfo> {
  try {
    _logger.info('Generating alchemical data for current moment...')

    const now = new Date()
    const roundedTime = Math.floor(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)
    const cacheKey = `current-moment-${roundedTime}`

    const cached = currentMomentCache.get(cacheKey)
    if (cached && now.getTime() - cached.timestamp < CACHE_TTL) {
      _logger.info('Using cached alchemical data for current moment')
      return cached.data
    }

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const timeString = `${hour}:${minute}`

    _logger.info(`Current datetime: ${dateString} ${timeString}`)

    const currentMomentInfo: AlchemizerBirthInfo = {
      year,
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      latitude: 0,
      longitude: 0,
    }

    const { getCurrentPlanetaryPositions } = await import('./calculate-transits')

    _logger.info('Fetching current planetary positions...')
    const currentPositions = getCurrentPlanetaryPositions()

    const planetList = [
      'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
      'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
    ] as const

    const houseMapping: Record<string, string> = {
      Sun: '10', Moon: '9', Mercury: '11', Venus: '12', Mars: '7',
      Jupiter: '4', Saturn: '5', Uranus: '6', Neptune: '7', Pluto: '2'
    }

    for (const planet of planetList) {
      if (!currentPositions[planet]) {
        currentPositions[planet] = { sign: 'Aries', degree: 0, retrograde: false }
      }
    }

    const ascSign = currentPositions['Ascendant'] ? currentPositions['Ascendant'].sign : 'Aries'
    const allCelestialBodies: HoroscopeCelestialBody[] = planetList.map(label => {
      const pos = currentPositions[label] ?? { sign: 'Aries', degree: 0, retrograde: false }
      return {
        label,
        Sign: { label: pos.sign },
        House: { label: houseMapping[label] ?? '1' }
      }
    })

    const celestialRecord: Record<string, unknown> = { all: allCelestialBodies }
    for (const label of planetList) {
      const pos = currentPositions[label] ?? { sign: 'Aries', degree: 0, retrograde: false }
      celestialRecord[label.toLowerCase()] = {
        ChartPosition: {
          Ecliptic: { ArcDegreesFormatted30: `${pos.degree}°` }
        }
      }
    }

    const horoscope: HoroscopeInput = {
      tropical: {
        Ascendant: {
          Sign: {
            label: ascSign,
          },
        },
        CelestialBodies: celestialRecord,
        Aspects: {
          points: generateCurrentAspects(currentPositions),
        },
      },
    }

    _logger.info('Calculating alchemical data...')
    const alchmData = alchemize(currentMomentInfo, horoscope)
    _logger.info('Alchemical calculations complete')

    currentMomentCache.set(cacheKey, {
      data: alchmData,
      timestamp: now.getTime(),
    })

    if (currentMomentCache.size > 10) {
      const oldestKey = currentMomentCache.keys().next().value
      if (oldestKey !== undefined) {
        currentMomentCache.delete(oldestKey)
      }
    }

    return alchmData
  } catch (error) {
    _logger.error('Error generating alchemical data:', error)
    throw error
  }
}

function generateCurrentAspects(
  positions: Record<string, { sign?: string; degree?: number; retrograde?: boolean }>
): Record<string, HoroscopeAspectItem[]> {
  const aspects: Record<string, HoroscopeAspectItem[]> = {}
  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ]

  planets.forEach(planet => {
    aspects[planet] = []
  })

  for (let i = 0; i < planets.length; i++) {
    const planet1 = planets[i]
    if (!planet1) continue
    const planet1Cap = planet1.charAt(0).toUpperCase() + planet1.slice(1)

    for (let j = i + 1; j < planets.length; j++) {
      const planet2 = planets[j]
      if (!planet2) continue
      const planet2Cap = planet2.charAt(0).toUpperCase() + planet2.slice(1)

      const pos1 = positions[planet1Cap]
      const pos2 = positions[planet2Cap]
      if (!pos1 || !pos2 || !pos1.sign || !pos2.sign) continue

      const signIndexMap = getSignIndices()
      const planet1SignIndex = signIndexMap[pos1.sign] ?? 0
      const planet2SignIndex = signIndexMap[pos2.sign] ?? 0

      const difference = Math.abs(planet1SignIndex - planet2SignIndex)
      let aspectType: string | undefined

      if (difference === 0) {
        aspectType = 'conjunction'
      } else if (difference === 4 || difference === 8) {
        aspectType = 'trine'
      } else if (difference === 3 || difference === 9) {
        aspectType = 'square'
      } else if (difference === 6) {
        aspectType = 'opposition'
      } else {
        continue
      }

      aspects[planet1]?.push({
        aspectKey: aspectType,
        point1Label: planet1Cap,
        point2Label: planet2Cap,
      })

      aspects[planet2]?.push({
        aspectKey: aspectType,
        point1Label: planet2Cap,
        point2Label: planet1Cap,
      })
    }
  }

  return aspects
}

function getSignIndices(): Record<string, number> {
  return {
    Aries: 0,
    Taurus: 1,
    Gemini: 2,
    Cancer: 3,
    Leo: 4,
    Virgo: 5,
    Libra: 6,
    Scorpio: 7,
    Sagittarius: 8,
    Capricorn: 9,
    Aquarius: 10,
    Pisces: 11,
  }
}

const alchemizerExport = { alchemize, generateAlchmForCurrentMoment }
export default alchemizerExport

export async function generateAlchmForBirthInfo(input: {
  birthDate: string
  birthTime?: string
  birthLocation?: string
}): Promise<AlchemicalInfo> {
  try {
    const dateObj = new Date(input.birthDate)
    if (isNaN(dateObj.getTime())) {
      const [y, m, d] = input.birthDate.split('-').map(v => parseInt(v, 10))
      if (!y || !m || !d) throw new Error('Invalid birthDate format')
      dateObj.setFullYear(y)
      dateObj.setMonth(m - 1)
      dateObj.setDate(d)
    }

    const time = input.birthTime ?? '12:00'
    const [hhStr, mmStr] = time.split(':')
    const hour = Math.max(0, Math.min(23, parseInt(hhStr || '12', 10)))
    const minute = Math.max(0, Math.min(59, parseInt(mmStr || '0', 10)))

    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()

    const birthInfo: BirthInfo = {
      year,
      month,
      day,
      hour,
      minute,
      latitude: 0,
      longitude: 0,
    }

    const horoscope = generateAccurateHoroscope(birthInfo)
    const alchmData = alchemize(birthInfo, horoscope)
    return await Promise.resolve(alchmData)
  } catch (error) {
    _logger.error('generateAlchmForBirthInfo error:', error)
    return {
      'Sun Sign': '',
      'Major Arcana': { Sun: '', Ascendant: '' },
      'Minor Arcana': { Decan: '', Cusp: 'None' },
      'Alchemy Effects': {
        'Total Spirit': 0,
        'Total Essence': 0,
        'Total Day Essence': 0,
        'Total Matter': 0,
        'Total Substance': 0,
        'Total Night Essence': 0,
        'A #': 0,
      },
      'Chart Ruler': '',
      'Total Dignity Effect': createElementObject(),
      'Total Decan Effect': createElementObject(),
      'Total Degree Effect': createElementObject(),
      'Total Aspect Effect': createElementObject(),
      'Total Elemental Effect': createElementObject(),
      'Total Effect Value': createElementObject(),
      'Dominant Element': 'Fire',
      'Total Chart Absolute Effect': 0,
      Heat: 0,
      Entropy: 0,
      Reactivity: 0,
      Energy: 0,
      '# Cardinal': 0,
      '# Fixed': 0,
      '# Mutable': 0,
      '% Cardinal': 0,
      '% Fixed': 0,
      '% Mutable': 0,
      'Dominant Modality': '',
      'All Conjunctions': [],
      'All Trines': [],
      'All Squares': [],
      'All Oppositions': [],
      Stelliums: [],
      Signs: {},
      Planets: {},
    }
  }
}
