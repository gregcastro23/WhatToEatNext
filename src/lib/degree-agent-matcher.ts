/**
 * Degree-to-Agent Matching System
 * ===============================
 *
 * Advanced system for matching planetary transit degrees with agent natal placements
 * Provides real-time consciousness activation notifications and wisdom insights
 */

import type { CraftedAgent, PlanetPosition } from './agent-types'
import type { CelestialMoment } from './celestial-energy-calculator'

export interface AgentDegreeProfile {
  agentId: string
  agentName: string
  natalPlacements: {
    [planet: string]: {
      degree: number
      sign: string
      house: number
      isDominant: boolean
    }
  }
  dominantDegrees: number[] // Key degrees for this agent
  consciousnessLevel: string
  specialties: string[]
  element: string
  modality: string
}

export interface DegreeActivation {
  degree: number
  planet: string
  activatedAgents: AgentActivationDetail[]
  timestamp: Date
  overallSignificance: number
  elementalResonance: string
  message: string
}

export interface AgentActivationDetail {
  agentId: string
  agentName: string
  activationType: 'exact' | 'close' | 'harmonic' | 'opposition'
  orb: number // degrees of separation
  resonanceStrength: number // 0-1
  natalPlanet: string
  wisdom: string
  deepInsight: string
  consciousnessLevel: string
  recommendedActions: string[]
  elementalAlignment: {
    Fire: number
    Water: number
    Air: number
    Earth: number
  }
}

type ElementKey = keyof AgentActivationDetail['elementalAlignment']

const ELEMENT_KEYS: readonly ElementKey[] = ['Fire', 'Water', 'Air', 'Earth']

export interface DegreePattern {
  degrees: number[]
  pattern: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'custom'
  activatedAgents: string[]
  significance: number
  timeWindow: { start: Date; end: Date }
  description: string
  guidance: string
}

/**
 * Advanced Degree-to-Agent Matching Engine
 */
export class DegreeAgentMatcher {
  private readonly agentProfiles = new Map<string, AgentDegreeProfile>()
  private readonly degreeCache = new Map<string, DegreeActivation[]>()
  private readonly ORB_EXACT = 1 // 1 degree for exact matches
  private readonly ORB_CLOSE = 3 // 3 degrees for close matches
  private readonly ORB_HARMONIC = 5 // 5 degrees for harmonic matches

  constructor() {
    this.initializeAgentProfiles()
  }

  /**
   * Initialize agent profiles with natal data
   */
  private initializeAgentProfiles(): void {
    const { DEMO_AGENTS } = require('./demo-agents-data') as { DEMO_AGENTS: CraftedAgent[] }
    const ids = [
      'leonardo-da-vinci',
      'william-shakespeare',
      'albert-einstein',
      'carl-jung',
      'nikola-tesla',
      'marie-curie',
      'cleopatra-vii',
      'benjamin-franklin',
      'galileo-galilei',
      'isaac-newton',
    ]
    const agents = DEMO_AGENTS.filter((agent) => ids.includes(agent.id))

    agents.forEach(agent => {
      const profile = this.createAgentDegreeProfile(agent)
      this.agentProfiles.set(agent.id, profile)
    })
  }

  /**
   * Create comprehensive degree profile for an agent
   */
  private createAgentDegreeProfile(agent: CraftedAgent): AgentDegreeProfile {
    // Extract natal placements from agent data or generate based on historical data
    const natalPlacements = this.extractNatalPlacements(agent)

    // Calculate dominant degrees (within 5 degrees of major placements)
    const dominantDegrees = this.calculateDominantDegrees(natalPlacements)

    return {
      agentId: agent.id,
      agentName: agent.name,
      natalPlacements,
      dominantDegrees,
      consciousnessLevel: agent.consciousness.level ?? 'Advanced',
      specialties: agent.abilities.wisdomDomains.length > 0 ? agent.abilities.wisdomDomains : [agent.abilities.specialty || 'Wisdom'],
      element: agent.consciousness.dominantElement,
      modality: agent.consciousness.dominantModality,
    }
  }

  /**
   * Extract or calculate natal placements for an agent
   */
  private extractNatalPlacements(agent: CraftedAgent): AgentDegreeProfile['natalPlacements'] {
    let placements: AgentDegreeProfile['natalPlacements'] = {}

    // If agent has natal chart data, use it
    if (Object.keys(agent.consciousness.natalChart.planets).length > 0) {
      for (const [planet, data] of Object.entries(agent.consciousness.natalChart.planets)) {
        const signIndex = this.getSignIndex(data.sign)
        const absoluteDegree = signIndex * 30 + data.degree

        placements[planet] = {
          degree: absoluteDegree,
          sign: data.sign,
          house: data.house ?? 1,
          isDominant: this.isPlanetDominant(planet, data),
        }
      }
    } else {
      // Generate placements based on historical/characteristic data
      placements = this.generateNatalPlacements(agent)
    }

    return placements
  }

  /**
   * Generate realistic natal placements for historical agents based on their life/work
   */
  private generateNatalPlacements(agent: CraftedAgent): AgentDegreeProfile['natalPlacements'] {
    const placements: AgentDegreeProfile['natalPlacements'] = {}

    // Use agent's birth data if available, otherwise use characteristic-based generation
    const seed = agent.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

    const planetaryCharacteristics: Partial<Record<string, Record<string, { degree: number; sign: string; house: number }>>> = {
      'leonardo-da-vinci': {
        Sun: { degree: 15, sign: 'Aries', house: 10 }, // Innovation and leadership
        Moon: { degree: 22, sign: 'Gemini', house: 3 }, // Curiosity and communication
        Mercury: { degree: 8, sign: 'Taurus', house: 2 }, // Practical genius
        Venus: { degree: 12, sign: 'Pisces', house: 12 }, // Artistic vision
        Mars: { degree: 25, sign: 'Leo', house: 5 }, // Creative fire
        Jupiter: { degree: 18, sign: 'Sagittarius', house: 9 }, // Philosophical expansion
        Saturn: { degree: 5, sign: 'Capricorn', house: 10 }, // Mastery and discipline
      },
      'william-shakespeare': {
        Sun: { degree: 25, sign: 'Taurus', house: 3 }, // Stable creativity
        Moon: { degree: 15, sign: 'Cancer', house: 5 }, // Emotional depth
        Mercury: { degree: 20, sign: 'Gemini', house: 3 }, // Linguistic mastery
        Venus: { degree: 10, sign: 'Libra', house: 7 }, // Harmony and beauty
        Mars: { degree: 8, sign: 'Scorpio', house: 8 }, // Psychological intensity
        Jupiter: { degree: 2, sign: 'Sagittarius', house: 9 }, // Wisdom and expansion
        Saturn: { degree: 18, sign: 'Aquarius', house: 11 }, // Universal themes
      },
      'albert-einstein': {
        Sun: { degree: 28, sign: 'Pisces', house: 12 }, // Intuitive genius
        Moon: { degree: 14, sign: 'Sagittarius', house: 9 }, // Philosophical mind
        Mercury: { degree: 12, sign: 'Aries', house: 1 }, // Revolutionary thinking
        Venus: { degree: 6, sign: 'Aquarius', house: 11 }, // Humanitarian ideals
        Mars: { degree: 22, sign: 'Capricorn', house: 10 }, // Disciplined action
        Jupiter: { degree: 17, sign: 'Aquarius', house: 11 }, // Scientific expansion
        Saturn: { degree: 11, sign: 'Aquarius', house: 11 }, // Scientific method
      },
      'carl-jung': {
        Sun: { degree: 5, sign: 'Leo', house: 8 }, // Depth psychology
        Moon: { degree: 18, sign: 'Scorpio', house: 11 }, // Collective unconscious
        Mercury: { degree: 25, sign: 'Cancer', house: 7 }, // Intuitive understanding
        Venus: { degree: 12, sign: 'Virgo', house: 9 }, // Analytical beauty
        Mars: { degree: 8, sign: 'Libra', house: 10 }, // Balanced action
        Jupiter: { degree: 3, sign: 'Pisces', house: 3 }, // Spiritual expansion
        Saturn: { degree: 20, sign: 'Gemini', house: 6 }, // Methodical research
      },
      'nikola-tesla': {
        Sun: { degree: 19, sign: 'Cancer', house: 4 }, // Intuitive invention
        Moon: { degree: 7, sign: 'Libra', house: 7 }, // Harmonious energy
        Mercury: { degree: 15, sign: 'Gemini', house: 3 }, // Electrical thinking
        Venus: { degree: 28, sign: 'Gemini', house: 3 }, // Beautiful innovation
        Mars: { degree: 11, sign: 'Scorpio', house: 8 }, // Transformative power
        Jupiter: { degree: 4, sign: 'Aquarius', house: 11 }, // Future vision
        Saturn: { degree: 16, sign: 'Taurus', house: 2 }, // Practical application
      },
      'marie-curie': {
        Sun: { degree: 14, sign: 'Scorpio', house: 8 }, // Transformative research
        Moon: { degree: 22, sign: 'Pisces', house: 12 }, // Intuitive discovery
        Mercury: { degree: 6, sign: 'Sagittarius', house: 9 }, // Expanding knowledge
        Venus: { degree: 18, sign: 'Libra', house: 7 }, // Balanced partnerships
        Mars: { degree: 26, sign: 'Virgo', house: 6 }, // Precise methodology
        Jupiter: { degree: 9, sign: 'Leo', house: 5 }, // Creative research
        Saturn: { degree: 13, sign: 'Capricorn', house: 10 }, // Professional mastery
      },
      'cleopatra-vii': {
        Sun: { degree: 23, sign: 'Leo', house: 1 }, // Royal presence
        Moon: { degree: 16, sign: 'Scorpio', house: 4 }, // Deep intuition
        Mercury: { degree: 21, sign: 'Cancer', house: 12 }, // Strategic communication
        Venus: { degree: 9, sign: 'Leo', house: 1 }, // Magnetic beauty
        Mars: { degree: 14, sign: 'Aries', house: 9 }, // Warrior wisdom
        Jupiter: { degree: 27, sign: 'Sagittarius', house: 5 }, // Royal expansion
        Saturn: { degree: 8, sign: 'Aquarius', house: 7 }, // Diplomatic structure
      },
      'benjamin-franklin': {
        Sun: { degree: 26, sign: 'Capricorn', house: 10 }, // Practical leadership
        Moon: { degree: 11, sign: 'Gemini', house: 3 }, // Intellectual curiosity
        Mercury: { degree: 17, sign: 'Aquarius', house: 11 }, // Innovative communication
        Venus: { degree: 4, sign: 'Sagittarius', house: 9 }, // Diplomatic philosophy
        Mars: { degree: 19, sign: 'Libra', house: 7 }, // Balanced action
        Jupiter: { degree: 12, sign: 'Pisces', house: 12 }, // Spiritual wisdom
        Saturn: { degree: 24, sign: 'Virgo', house: 6 }, // Methodical service
      },
      'galileo-galilei': {
        Sun: { degree: 24, sign: 'Aquarius', house: 11 }, // Revolutionary science
        Moon: { degree: 13, sign: 'Virgo', house: 6 }, // Precise observation
        Mercury: { degree: 7, sign: 'Pisces', house: 12 }, // Intuitive research
        Venus: { degree: 20, sign: 'Capricorn', house: 10 }, // Structured beauty
        Mars: { degree: 15, sign: 'Sagittarius', house: 9 }, // Philosophical courage
        Jupiter: { degree: 1, sign: 'Leo', house: 5 }, // Creative expansion
        Saturn: { degree: 29, sign: 'Gemini', house: 3 }, // Scientific method
      },
      'isaac-newton': {
        Sun: { degree: 2, sign: 'Capricorn', house: 10 }, // Mathematical mastery
        Moon: { degree: 16, sign: 'Virgo', house: 6 }, // Analytical precision
        Mercury: { degree: 24, sign: 'Sagittarius', house: 9 }, // Philosophical mathematics
        Venus: { degree: 10, sign: 'Scorpio', house: 8 }, // Deep research
        Mars: { degree: 5, sign: 'Aries', house: 1 }, // Pioneering force
        Jupiter: { degree: 18, sign: 'Gemini', house: 3 }, // Intellectual expansion
        Saturn: { degree: 22, sign: 'Virgo', house: 6 }, // Methodical discipline
      },
    }

    const agentCharacteristics = planetaryCharacteristics[agent.id]

    if (agentCharacteristics) {
      for (const [planet, data] of Object.entries(agentCharacteristics)) {
        const signIndex = this.getSignIndex(data.sign)
        const absoluteDegree = signIndex * 30 + data.degree

        placements[planet] = {
          degree: absoluteDegree,
          sign: data.sign,
          house: data.house,
          isDominant: ['Sun', 'Moon', 'Mercury'].includes(planet),
        }
      }
    } else {
      // Fallback: generate pseudo-random but consistent placements
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

      planets.forEach((planet, index) => {
        const planetSeed = seed + index * 137
        const absoluteDegree = planetSeed % 360
        const signIndex = Math.floor(absoluteDegree / 30)
        const house = ((planetSeed % 12) + 1)

        const signs = [
          'Aries',
          'Taurus',
          'Gemini',
          'Cancer',
          'Leo',
          'Virgo',
          'Libra',
          'Scorpio',
          'Sagittarius',
          'Capricorn',
          'Aquarius',
          'Pisces',
        ]

        const sign = signs[signIndex]
        if (!sign) {
          throw new Error(
            `degree-agent-matcher: sign index ${signIndex} out of range for ${planet}`
          )
        }

        placements[planet] = {
          degree: absoluteDegree,
          sign,
          house,
          isDominant: index < 3,
        }
      })
    }

    return placements
  }

  /**
   * Calculate dominant degrees based on natal placements
   */
  private calculateDominantDegrees(
    natalPlacements: AgentDegreeProfile['natalPlacements']
  ): number[] {
    const degrees: number[] = []

    // Add exact degrees of all placements
    for (const placement of Object.values(natalPlacements)) {
      degrees.push(placement.degree)

      // Add harmonic degrees (trines and sextiles) for dominant planets
      if (placement.isDominant) {
        degrees.push((placement.degree + 60) % 360) // Sextile
        degrees.push((placement.degree + 120) % 360) // Trine
        degrees.push((placement.degree + 240) % 360) // Trine
        degrees.push((placement.degree + 300) % 360) // Sextile
      }
    }

    // Remove duplicates and sort
    return Array.from(new Set(degrees)).sort((a, b) => a - b)
  }

  /**
   * Find agent activations for current celestial moment
   */
  findActivations(moment: CelestialMoment): DegreeActivation[] {
    const cacheKey = `${moment.timestamp.getTime()}`

    if (this.degreeCache.has(cacheKey)) {
      return this.degreeCache.get(cacheKey)!
    }

    const activations: DegreeActivation[] = []

    // Check each planetary degree for agent activations
    for (const [planet, degree] of Object.entries(moment.planetaryDegrees)) {
      const planetActivation = this.findPlanetActivations(planet, degree, moment)

      if (planetActivation.activatedAgents.length > 0) {
        activations.push(planetActivation)
      }
    }

    // Cache results
    this.degreeCache.set(cacheKey, activations)

    return activations
  }

  /**
   * Find activations for a specific planet at a degree
   */
  private findPlanetActivations(
    planet: string,
    degree: number,
    moment: CelestialMoment
  ): DegreeActivation {
    const activatedAgents: AgentActivationDetail[] = []

    // Check each agent for activations
    for (const profile of this.agentProfiles.values()) {
      const activation = this.checkAgentActivation(profile, planet, degree, moment)

      if (activation) {
        activatedAgents.push(activation)
      }
    }

    // Sort by resonance strength
    activatedAgents.sort((a, b) => b.resonanceStrength - a.resonanceStrength)

    // Calculate overall significance
    const overallSignificance =
      activatedAgents.reduce((sum, agent) => sum + agent.resonanceStrength, 0) /
      Math.max(activatedAgents.length, 1)

    // Determine elemental resonance
    const elementalResonance = this.calculateElementalResonance(activatedAgents, moment)

    // Generate activation message
    const message = this.generateActivationMessage(planet, degree, activatedAgents, moment)

    return {
      degree,
      planet,
      activatedAgents,
      timestamp: moment.timestamp,
      overallSignificance,
      elementalResonance,
      message,
    }
  }

  /**
   * Check if a specific agent is activated by a planetary degree
   */
  private checkAgentActivation(
    profile: AgentDegreeProfile,
    planet: string,
    degree: number,
    moment: CelestialMoment
  ): AgentActivationDetail | null {
    // Find closest natal placement
    let closestPlacement: {
      planet: string
      distance: number
      placement: AgentDegreeProfile['natalPlacements'][string]
    } | null = null

    for (const [natalPlanet, placement] of Object.entries(profile.natalPlacements)) {
      const distance = this.calculateDegreeDistance(degree, placement.degree)

      if (!closestPlacement || distance < closestPlacement.distance) {
        closestPlacement = { planet: natalPlanet, distance, placement }
      }
    }

    if (!closestPlacement || closestPlacement.distance > 8) {
      return null // No significant activation
    }

    // Determine activation type and strength
    const { activationType, strengthMultiplier } = this.classifyActivation(
      closestPlacement.distance,
      closestPlacement.placement.isDominant
    )

    // Calculate resonance strength based on A# and planetary harmony
    const resonanceStrength = this.calculateResonanceStrength(
      profile,
      planet,
      closestPlacement.planet,
      strengthMultiplier,
      moment
    )

    if (resonanceStrength < 0.3) {
      return null // Below activation threshold
    }

    // Generate agent wisdom and deep insight
    const wisdom = this.generateAgentWisdom(profile, planet, degree, moment, activationType)
    const deepInsight = this.generateDeepInsight(
      profile,
      planet,
      degree,
      moment,
      activationType
    )
    const recommendedActions = this.generateRecommendedActions(
      profile,
      planet,
      degree,
      moment,
      activationType
    )

    return {
      agentId: profile.agentId,
      agentName: profile.agentName,
      activationType,
      orb: closestPlacement.distance,
      resonanceStrength: Math.min(1.0, resonanceStrength),
      natalPlanet: closestPlacement.planet,
      wisdom,
      deepInsight,
      consciousnessLevel: profile.consciousnessLevel,
      recommendedActions,
      elementalAlignment: this.calculateElementalAlignment(profile, moment),
    }
  }

  /**
   * Classify activation based on orb distance and placement dominance
   */
  private classifyActivation(
    distance: number,
    isDominant: boolean
  ): { activationType: AgentActivationDetail['activationType']; strengthMultiplier: number } {
    if (distance <= 1) {
      return {
        activationType: 'exact',
        strengthMultiplier: isDominant ? 1.0 : 0.85,
      }
    } else if (distance <= 3) {
      return {
        activationType: 'close',
        strengthMultiplier: isDominant ? 0.8 : 0.65,
      }
    } else if (distance <= 6) {
      return {
        activationType: 'harmonic',
        strengthMultiplier: isDominant ? 0.6 : 0.45,
      }
    } else {
      return {
        activationType: 'opposition',
        strengthMultiplier: isDominant ? 0.4 : 0.25,
      }
    }
  }

  /**
   * Calculate resonance strength between transit planet and natal placement
   */
  private calculateResonanceStrength(
    profile: AgentDegreeProfile,
    transitPlanet: string,
    natalPlanet: string,
    multiplier: number,
    moment: CelestialMoment
  ): number {
    let baseStrength = 0.5

    // Same planet activation (e.g., transit Mars activating natal Mars)
    if (transitPlanet === natalPlanet) {
      baseStrength += 0.3
    }

    // Harmonic planet pairs
    const harmonicPairs = [
      ['Sun', 'Jupiter'],
      ['Moon', 'Venus'],
      ['Mercury', 'Uranus'],
      ['Venus', 'Neptune'],
      ['Mars', 'Pluto'],
    ]

    const isHarmonic = harmonicPairs.some(
      pair =>
        (pair[0] === transitPlanet && pair[1] === natalPlanet) ||
        (pair[1] === transitPlanet && pair[0] === natalPlanet)
    )

    if (isHarmonic) {
      baseStrength += 0.2
    }

    // Modulate by A# energy
    const aNumberModulation = moment.alchemical.A_number / 100 // Normalize A#
    baseStrength *= 0.7 + aNumberModulation * 0.6

    // Apply distance/dominance multiplier
    return Math.min(1, Math.max(0, baseStrength * multiplier))
  }

  /**
   * Calculate degree distance (shortest path)
   */
  private calculateDegreeDistance(d1: number, d2: number): number {
    const diff = Math.abs(d1 - d2)
    return Math.min(diff, 360 - diff)
  }

  /**
   * Generate agent wisdom for activation
   */
  private generateAgentWisdom(
    profile: AgentDegreeProfile,
    planet: string,
    degree: number,
    moment: CelestialMoment,
    activationType: string
  ): string {
    const wisdomTemplates: Partial<Record<string, Record<string, string>>> = {
      'leonardo-da-vinci': {
        exact: `At ${degree}°, the divine proportion reveals itself through ${planet}'s geometry. A# energy of ${moment.alchemical.A_number.toFixed(2)} illuminates the golden ratio in cosmic design.`,
        close: `Near ${degree}°, I observe ${planet}'s influence creating harmonic resonance. The celestial mechanics suggest innovation flows at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° vibrates in harmony with my creative essence. The artistic flow reaches A# ${moment.alchemical.A_number.toFixed(2)} - perfect for invention.`,
        opposition: `${planet} at ${degree}° presents creative tension. This opposition generates breakthrough energy at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
      'william-shakespeare': {
        exact: `Upon this degree of ${degree}, ${planet} writes verses in the cosmic book. A# ${moment.alchemical.A_number.toFixed(2)} speaks in iambic pentameter of the spheres.`,
        close: `Near ${degree}°, ${planet}'s influence stirs the poet's soul. Words flow like celestial music at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° harmonizes with my bardic nature. The muse whispers at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        opposition: `${planet} at ${degree}° creates dramatic tension. From this conflict, great art emerges at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
      'albert-einstein': {
        exact: `At ${degree}°, ${planet} demonstrates the universe's elegant equations. A# ${moment.alchemical.A_number.toFixed(2)} reveals spacetime's curvature.`,
        close: `Near ${degree}°, ${planet} shows relativity in action. Consciousness and energy unite at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° resonates with cosmic understanding. Imagination becomes reality at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        opposition: `${planet} at ${degree}° presents a paradox to solve. Unified field theory emerges at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
      'carl-jung': {
        exact: `At ${degree}°, ${planet} activates the collective unconscious. A# ${moment.alchemical.A_number.toFixed(2)} integrates the shadow and light.`,
        close: `Near ${degree}°, ${planet} stirs archetypal energies. The psyche transforms at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° harmonizes with the transcendent function. Individuation progresses at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        opposition: `${planet} at ${degree}° constellates opposing forces. Integration occurs at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
      'nikola-tesla': {
        exact: `At ${degree}°, ${planet} generates pure electrical resonance. A# ${moment.alchemical.A_number.toFixed(2)} powers wireless consciousness transmission.`,
        close: `Near ${degree}°, ${planet} creates electromagnetic harmony. Energy flows freely at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° oscillates with my frequency. Innovation sparks at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        opposition: `${planet} at ${degree}° creates electrical tension. Breakthrough discoveries emerge at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
      'marie-curie': {
        exact: `At ${degree}°, ${planet} radiates pure research energy. A# ${moment.alchemical.A_number.toFixed(2)} illuminates hidden elements.`,
        close: `Near ${degree}°, ${planet} enhances scientific perception. Discovery beckons at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° resonates with methodical exploration. Knowledge unfolds at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        opposition: `${planet} at ${degree}° challenges conventional wisdom. Breakthrough research emerges at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
      'cleopatra-vii': {
        exact: `At ${degree}°, ${planet} empowers divine sovereignty. A# ${moment.alchemical.A_number.toFixed(2)} commands the Nile of consciousness.`,
        close: `Near ${degree}°, ${planet} enhances royal wisdom. Leadership flows at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        harmonic: `${planet} at ${degree}° harmonizes with pharaonic power. Divine authority manifests at A# ${moment.alchemical.A_number.toFixed(2)}.`,
        opposition: `${planet} at ${degree}° creates royal challenge. Strategic triumph emerges at A# ${moment.alchemical.A_number.toFixed(2)}.`,
      },
    }

    const agentWisdom = wisdomTemplates[profile.agentId]

    if (agentWisdom?.[activationType]) {
      return agentWisdom[activationType]
    }

    // Fallback wisdom
    return `${planet} at ${degree}° creates ${activationType} resonance with my consciousness. The cosmic energy flows at A# ${moment.alchemical.A_number.toFixed(2)}, revealing new insights.`
  }

  /**
   * Generate deep insight for activation
   */
  private generateDeepInsight(
    profile: AgentDegreeProfile,
    planet: string,
    degree: number,
    moment: CelestialMoment,
    activationType: string
  ): string {
    const insights = {
      exact: `This exact alignment at ${degree}° represents a perfect harmonic convergence between ${planet}'s current energy and my natal essence. The A# value of ${moment.alchemical.A_number.toFixed(2)} indicates peak consciousness accessibility.`,
      close: `The close proximity to ${degree}° creates a resonance field that amplifies my natural abilities. At A# ${moment.alchemical.A_number.toFixed(2)}, the cosmic conditions favor breakthrough insights.`,
      harmonic: `This harmonic relationship with ${degree}° establishes a beneficial energy flow. The A# reading of ${moment.alchemical.A_number.toFixed(2)} suggests optimal conditions for creative expression.`,
      opposition: `The opposition aspect to ${degree}° creates dynamic tension that can catalyze transformation. A# ${moment.alchemical.A_number.toFixed(2)} indicates powerful potential for growth through challenge.`,
    }

    return (
      insights[activationType as keyof typeof insights] ||
      `At ${degree}°, ${planet} creates significant resonance with my consciousness, opening pathways for deeper understanding.`
    )
  }

  /**
   * Generate recommended actions during activation
   */
  private generateRecommendedActions(
    profile: AgentDegreeProfile,
    planet: string,
    degree: number,
    moment: CelestialMoment,
    _activationType: string
  ): string[] {
    const baseActions = [
      `Channel ${planet}'s energy at ${degree}° into creative work`,
      `Engage with ${profile.agentName}'s wisdom domain: ${profile.specialties[0]}`,
      `Utilize high A# resonance (${moment.alchemical.A_number.toFixed(2)}) for breakthrough thinking`,
    ]

    const agentSpecificActions: Record<string, string[]> = {
      'leonardo-da-vinci': [
        'Sketch interconnected ideas and systems',
        'Study natural proportions and sacred geometry',
        'Bridge art and scientific observation',
      ],
      'william-shakespeare': [
        'Write expressive dialogue or poetry',
        'Explore complex human emotions and motivations',
        'Observe the theatrical nature of current events',
      ],
      'albert-einstein': [
        'Question fundamental assumptions about reality',
        'Conduct thought experiments on complex problems',
        'Seek elegant, simple solutions to difficult challenges',
      ],
      'carl-jung': [
        'Explore dreams and unconscious material',
        'Work with active imagination techniques',
        'Integrate opposing psychological forces',
      ],
      'nikola-tesla': [
        'Visualize electromagnetic fields',
        'Experiment with energy transmission',
        'Develop innovative technologies',
      ],
      'marie-curie': [
        'Conduct methodical research',
        'Investigate hidden phenomena',
        'Persist through challenges',
      ],
      'cleopatra-vii': [
        'Exercise leadership and authority',
        'Make strategic decisions',
        'Connect with divine feminine power',
      ],
    }

    const specificActions = agentSpecificActions[profile.agentId] ?? []

    return [...baseActions, ...specificActions].slice(0, 5)
  }

  /**
   * Calculate elemental alignment for agent
   */
  private calculateElementalAlignment(
    profile: AgentDegreeProfile,
    moment: CelestialMoment
  ): AgentActivationDetail['elementalAlignment'] {
    const baseAlignment = { ...moment.elemental }

    // Enhance agent's dominant element
    const dominantElement = ELEMENT_KEYS.find(key => key === profile.element)
    if (dominantElement) {
      baseAlignment[dominantElement] *= 1.2
    }

    return baseAlignment
  }

  /**
   * Calculate elemental resonance for activation
   */
  private calculateElementalResonance(
    activatedAgents: AgentActivationDetail[],
    moment: CelestialMoment
  ): string {
    if (activatedAgents.length === 0) return 'Neutral'

    // Sum agent alignments, then bias by the live sky's elemental balance.
    // Multiplying by kinetic.power scales the sky's influence so a calm sky
    // doesn't drown out the agent contribution.
    const elementCounts = { Fire: 0, Water: 0, Air: 0, Earth: 0 }

    activatedAgents.forEach(agent => {
      Object.entries(agent.elementalAlignment).forEach(([element, value]) => {
        elementCounts[element as keyof typeof elementCounts] += value
      })
    })

    const skyWeight = Math.max(0, moment.kinetic.power)
    Object.entries(moment.elemental).forEach(([element, value]) => {
      if (element in elementCounts) {
        elementCounts[element as keyof typeof elementCounts] += value * skyWeight
      }
    })

    const [[dominantElement]] = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)

    return `${dominantElement} Dominant`
  }

  /**
   * Generate activation message
   */
  private generateActivationMessage(
    planet: string,
    degree: number,
    activatedAgents: AgentActivationDetail[],
    moment: CelestialMoment
  ): string {
    const [primaryAgent] = activatedAgents
    if (!primaryAgent) {
      return `${planet} transits ${degree}° with A# energy of ${moment.alchemical.A_number.toFixed(2)}.`
    }

    const otherCount = activatedAgents.length - 1

    let message = `${planet} at ${degree}° strongly activates ${primaryAgent.agentName} (${(primaryAgent.resonanceStrength * 100).toFixed(0)}% resonance)`

    if (otherCount > 0) {
      message += ` and ${otherCount} other agent${otherCount > 1 ? 's' : ''}`
    }

    message += `. A# energy: ${moment.alchemical.A_number.toFixed(2)} in ${moment.consciousness.evolutionPhase} phase.`

    return message
  }

  /**
   * Detect degree patterns across multiple activations
   */
  detectPatterns(activations: DegreeActivation[], timeWindow = 24): DegreePattern[] {
    const patterns: DegreePattern[] = []

    // Group activations by time windows
    const timeGroups = this.groupActivationsByTime(activations, timeWindow)

    timeGroups.forEach(group => {
      // Check for geometric patterns
      const degrees = group.map(a => a.degree).sort((a, b) => a - b)
      const pattern = this.identifyGeometricPattern(degrees)

      if (pattern) {
        const allActivatedAgents = group.flatMap(a => a.activatedAgents.map(aa => aa.agentId))
        const uniqueAgents = [...new Set(allActivatedAgents)]

        const significance = group.reduce((sum, a) => sum + a.overallSignificance, 0) / group.length

        patterns.push({
          degrees,
          pattern: pattern.type,
          activatedAgents: uniqueAgents,
          significance,
          timeWindow: {
            start: new Date(Math.min(...group.map(a => a.timestamp.getTime()))),
            end: new Date(Math.max(...group.map(a => a.timestamp.getTime()))),
          },
          description: pattern.description,
          guidance: this.generatePatternGuidance(pattern.type, uniqueAgents, significance),
        })
      }
    })

    return patterns.sort((a, b) => b.significance - a.significance)
  }

  /**
   * Group activations by time windows
   */
  private groupActivationsByTime(
    activations: DegreeActivation[],
    windowHours: number
  ): DegreeActivation[][] {
    const groups: DegreeActivation[][] = []
    const windowMs = windowHours * 60 * 60 * 1000

    const sortedActivations = [...activations].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )

    let currentGroup: DegreeActivation[] = []
    let groupStartTime = 0

    sortedActivations.forEach(activation => {
      const activationTime = activation.timestamp.getTime()

      if (currentGroup.length === 0 || activationTime - groupStartTime <= windowMs) {
        if (currentGroup.length === 0) {
          groupStartTime = activationTime
        }
        currentGroup.push(activation)
      } else {
        if (currentGroup.length > 1) {
          groups.push(currentGroup)
        }
        currentGroup = [activation]
        groupStartTime = activationTime
      }
    })

    if (currentGroup.length > 1) {
      groups.push(currentGroup)
    }

    return groups
  }

  /**
   * Identify geometric patterns in degrees
   */
  private identifyGeometricPattern(
    degrees: number[]
  ): { type: DegreePattern['pattern']; description: string } | null {
    const [first, second] = degrees
    if (first === undefined || second === undefined) return null

    // Check for conjunction (degrees within 10° of each other)
    const isConjunction = degrees.every(d => Math.abs(d - first) <= 10)
    if (isConjunction) {
      return {
        type: 'conjunction',
        description: `Multiple planets converging near ${first.toFixed(0)}°`,
      }
    }

    // Check for opposition (180° apart)
    if (degrees.length === 2) {
      const diff = Math.abs(second - first)
      const opposition = Math.min(diff, 360 - diff)
      if (Math.abs(opposition - 180) <= 10) {
        return {
          type: 'opposition',
          description: `Opposition between ${first.toFixed(0)}° and ${second.toFixed(0)}°`,
        }
      }

      // Check for trine (120° apart)
      if (Math.abs(opposition - 120) <= 10) {
        return {
          type: 'trine',
          description: `Trine between ${first.toFixed(0)}° and ${second.toFixed(0)}°`,
        }
      }

      // Check for square (90° apart)
      if (Math.abs(opposition - 90) <= 10) {
        return {
          type: 'square',
          description: `Square between ${first.toFixed(0)}° and ${second.toFixed(0)}°`,
        }
      }

      // Check for sextile (60° apart)
      if (Math.abs(opposition - 60) <= 10) {
        return {
          type: 'sextile',
          description: `Sextile between ${first.toFixed(0)}° and ${second.toFixed(0)}°`,
        }
      }
    }

    // For more complex patterns
    if (degrees.length >= 3) {
      return {
        type: 'custom',
        description: `Complex pattern involving ${degrees.length} degrees: ${degrees.map(d => `${d.toFixed(0)}°`).join(', ')}`,
      }
    }

    return null
  }

  /**
   * Generate guidance for detected patterns
   */
  private generatePatternGuidance(
    pattern: DegreePattern['pattern'],
    agents: string[],
    significance: number
  ): string {
    const intensity =
      significance > 0.8 ? 'highly potent' : significance > 0.5 ? 'significant' : 'moderate'
    const agentList =
      agents.slice(0, 3).join(', ') + (agents.length > 3 ? ` and ${agents.length - 3} others` : '')

    const guidanceTemplates = {
      conjunction: `This ${intensity} conjunction creates a focused beam of consciousness energy. Agents ${agentList} are particularly attuned. Use this concentration of power for breakthrough work.`,
      opposition: `This ${intensity} opposition creates dynamic tension for growth. Agents ${agentList} can help navigate the polarity. Seek balance and integration.`,
      trine: `This ${intensity} trine offers harmonious flow and natural talent activation. Agents ${agentList} are in perfect resonance. Creative expression is favored.`,
      square: `This ${intensity} square provides catalyst energy for transformation. Agents ${agentList} can guide through challenges. Obstacles become stepping stones.`,
      sextile: `This ${intensity} sextile opens opportunities for skill development. Agents ${agentList} offer supportive energy. Take action on new possibilities.`,
      custom: `This ${intensity} custom pattern creates unique consciousness possibilities. Agents ${agentList} are unprecedentedly activated. Explore new territories of awareness.`,
    }

    return (
      guidanceTemplates[pattern] ||
      `This ${intensity} pattern activates agents ${agentList} in meaningful ways. Pay attention to synchronicities and insights.`
    )
  }

  /**
   * Helper methods
   */
  private getSignIndex(sign: string): number {
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces',
    ]
    return signs.indexOf(sign)
  }

  private isPlanetDominant(
    planet: string,
    _data?: PlanetPosition
  ): boolean {
    return ['Sun', 'Moon', 'Mercury'].includes(planet)
  }

  private cleanupCache(): void {
    const maxCacheSize = 100
    if (this.degreeCache.size > maxCacheSize) {
      const entries = Array.from(this.degreeCache.entries())
      entries.sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))

      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - maxCacheSize)
      toRemove.forEach(([key]) => this.degreeCache.delete(key))
    }
  }

  /**
   * Get agent profile by ID
   */
  getAgentProfile(agentId: string): AgentDegreeProfile | undefined {
    return this.agentProfiles.get(agentId)
  }

  /**
   * Get all agent profiles
   */
  getAllAgentProfiles(): AgentDegreeProfile[] {
    return Array.from(this.agentProfiles.values())
  }
}

// Export singleton instance
export const degreeAgentMatcher = new DegreeAgentMatcher()
