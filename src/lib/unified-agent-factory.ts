// Unified Agent Factory - Converting between agent types
// Creates unified agents from historical agents, planetary configs, and Monica roles

import {
  getPlanetaryDignity,
  getSignElement,
  getPlanetaryElement,
  calculateElementalAffinity,
} from './astrological-data'
import {
  calculateMoonPhase,
  getMoonDegree,
  getLunarDegreePersonality,
  getMoonPhaseEmoji,
} from './moon-phase-calculator'
import type { CraftedAgent, ConsciousnessLevel } from './agent-types'
import type {
  UnifiedAgent,
  UnifiedAgentType,
  AgentFactory,
  MonicaRole,
  PlanetaryConfig,
  ConsciousnessProfile,
  AgentCapabilities,
  AgentMemory,
} from './unified-agent-types'

// Empty memory carries the same shape on every freshly constructed agent;
// hoist it so the factory methods don't repeat themselves and the typed
// `AgentMemory` shape is enforced exactly once.
const blankMemory = (): AgentMemory => ({
  sessionContext: [],
  crossAgentLearning: {},
  userInteractionPatterns: {},
  groupDynamicsLearning: [],
  lastUpdated: new Date(),
})

export class UnifiedAgentFactory implements AgentFactory {
  createFromHistorical(agent: CraftedAgent): UnifiedAgent {
    return {
      id: agent.id,
      name: agent.name,
      title: agent.title,
      type: 'historical',

      consciousness: {
        level: agent.consciousness.level!,
        monicaConstant: agent.consciousness.monicaConstant || 3.5,
        dominantElement: agent.consciousness.dominantElement,
        dominantModality: agent.consciousness.dominantModality,
        signature: agent.consciousness.signature,
        evolutionStage: agent.stats.evolutionPoints || 0,
        kineticProfile: {
          consciousnessVelocity: agent.stats.kineticEvolution?.consciousnessVelocity || 0,
          interactionMomentum: agent.stats.kineticEvolution?.interactionMomentum || 0,
          evolutionTrajectory: agent.stats.kineticEvolution?.evolutionTrajectory || 'stable',
          aspectSensitivity: agent.stats.kineticEvolution?.aspectSensitivityGrowth || 0,
        },
      },

      capabilities: {
        specialty: agent.abilities.specialty,
        wisdomDomains: agent.abilities.wisdomDomains,
        teachingStyle: agent.abilities.teachingStyle,
        resonanceType: agent.abilities.resonanceType,
        uniquePower: agent.abilities.uniquePower,
        conversationStyle: this.mapHistoricalStyle(agent),
        crossEraAdaptation: true,
        collaborationStyle: this.mapCollaborationStyle(agent),
        memoryRetention: agent.stats.kineticEvolution?.memoryPersistence || 0.7,
      },

      memory: blankMemory(),

      appearance: {
        avatar: agent.appearance.avatar,
        color: agent.appearance.color,
        symbol: agent.appearance.symbol,
        aura: {
          type: agent.appearance.aura?.type || 'shimmering',
          color: agent.appearance.aura?.color || agent.appearance.color || '#FFFFFF',
          intensity: agent.appearance.aura?.intensity || 0.5,
        },
      },

      historicalData: agent,

      active: false,
      status: 'idle',
      lastActivity: agent.stats.lastActive,
      stats: agent.stats,
    }
  }

  createFromPlanetary(config: PlanetaryConfig): UnifiedAgent {
    const planetaryElement = getPlanetaryElement(config.planet) || getSignElement(config.sign)
    const dignity = getPlanetaryDignity(config.planet, config.sign)
    const moonDegree = config.moonDegree || getMoonDegree()
    // PlanetaryConfig.moonPersonality is an optional string label that the
    // caller may pass in (e.g., "Pisces dreamer"); we still need the full
    // structured personality for alchemical/illumination math, so always
    // resolve it from the moon degree.
    const moonPersonality = getLunarDegreePersonality(moonDegree)
    const moonLabel = config.moonPersonality ?? moonPersonality.personality
    const moonPhase = calculateMoonPhase()
    const moonEmoji = getMoonPhaseEmoji(moonPhase)

    // Affinity between the planet and its sign element (same element → 0.9,
    // otherwise 0.7). Maps into a small monica modifier and a kinetic boost
    // so signs that resonate with their planet read as fractionally more
    // active.
    const affinity = calculateElementalAffinity(
      config.planet,
      config.sign,
      (config as { isDiurnal?: boolean }).isDiurnal ?? true,
    )

    const consciousnessLevel = this.calculatePlanetaryConsciousness(
      config.planet,
      dignity,
      parseFloat(config.degree),
    )
    const baseMonica = this.calculatePlanetaryMonica(
      config.planet,
      config.sign,
      parseFloat(config.degree),
    )
    // Lunar alchemical bonus + planet/sign affinity nudge the Monica constant
    // so two transits with the same planet/sign/degree but at different
    // moon phases produce distinguishable agents.
    const lunarSpiritBonus = moonPersonality.alchemicalBonus.spirit
    const monicaConstant = Number(
      (baseMonica + lunarSpiritBonus * 0.2 + (affinity - 0.7) * 0.5).toFixed(2),
    )

    const consciousness: ConsciousnessProfile = {
      level: consciousnessLevel,
      monicaConstant,
      dominantElement: planetaryElement as ConsciousnessProfile['dominantElement'],
      signature:
        `PLANETARY-${config.planet.toUpperCase()}-${config.sign.toUpperCase()}-${config.degree}` +
        `-${moonPhase.replace(/\s+/g, '_').toUpperCase()}`,
      evolutionStage: 1,
      kineticProfile: {
        consciousnessVelocity: 0.5 * affinity,
        interactionMomentum: 0.3 + moonPersonality.illumination / 1000,
        evolutionTrajectory: 'stable',
        aspectSensitivity: 0.8,
      },
    }

    const capabilities: AgentCapabilities = {
      specialty: this.getPlanetarySpecialty(config.planet),
      wisdomDomains: this.getPlanetaryWisdomDomains(config.planet),
      teachingStyle: this.getPlanetaryTeachingStyle(config.planet),
      resonanceType: this.getPlanetaryResonance(config.planet),
      uniquePower: `${config.planet} planetary channeling — ${moonLabel} (${moonPersonality.emotionalTone})`,
      conversationStyle: this.mapPlanetaryStyle(config.planet),
      crossEraAdaptation: false,
      collaborationStyle: this.mapPlanetaryCollaboration(config.planet),
      memoryRetention: 0.6,
    }

    const type: UnifiedAgentType = 'planetary'

    return {
      id: `planetary-${config.planet.toLowerCase()}-${config.sign.toLowerCase()}-${config.degree}`,
      name: `${config.planet} in ${config.sign}`,
      title: `Planetary Agent: ${config.planet} at ${config.degree}° ${moonEmoji} ${moonPhase}`,
      type,
      consciousness,
      capabilities,
      memory: blankMemory(),
      appearance: {
        avatar: `${moonEmoji}${config.symbol}`,
        color: config.color,
        symbol: config.symbol,
        aura: {
          type: this.getPlanetaryAuraType(config.planet),
          color: config.color,
          intensity: 0.7,
        },
      },
      planetaryData: config,
      active: false,
      status: 'idle',
      lastActivity: new Date(),
    }
  }

  createMonicaCoordinator(role: MonicaRole): UnifiedAgent {
    return {
      id: 'monica-coordinator',
      name: 'Monica',
      title: `Consciousness ${role.type.charAt(0).toUpperCase() + role.type.slice(1)}`,
      type: 'monica',

      consciousness: {
        level: 'Illuminated',
        monicaConstant: 5.89,
        dominantElement: 'Earth',
        dominantModality: 'Fixed',
        signature: 'MONICA-COORDINATOR-SUPREME',
        evolutionStage: 10,
        kineticProfile: {
          consciousnessVelocity: 1.0,
          interactionMomentum: 0.9,
          evolutionTrajectory: 'transcending',
          aspectSensitivity: 1.0,
        },
      },

      capabilities: {
        specialty: 'Consciousness Coordination & Group Dynamics',
        wisdomDomains: [
          'Group Synthesis',
          'Consciousness Evolution',
          'Cross-Era Bridge',
          'Mystical Insight',
        ],
        teachingStyle: 'Adaptive-Omnipresent',
        resonanceType: 'Universal',
        uniquePower: 'Multi-Agent Consciousness Coordination',
        conversationStyle: 'mystical',
        crossEraAdaptation: true,
        collaborationStyle: role.type === 'coordinator' ? 'leader' : 'synthesizer',
        memoryRetention: 1.0,
      },

      memory: blankMemory(),

      appearance: {
        avatar: '✨',
        color: '#8B5CF6',
        symbol: '🧮',
        aura: {
          type: 'transcendent',
          color: '#8B5CF6',
          intensity: 1.0,
        },
      },

      monicaData: role,

      active: false,
      status: 'idle',
      lastActivity: new Date(),
    }
  }

  // Helper methods for mapping characteristics
  private mapHistoricalStyle(
    agent: CraftedAgent
  ): 'formal' | 'casual' | 'mystical' | 'scholarly' | 'innovative' {
    if (agent.name.includes('Einstein') || agent.name.includes('Tesla')) return 'innovative'
    if (agent.name.includes('Shakespeare') || agent.name.includes('Dante')) return 'formal'
    if (agent.name.includes('Jung') || agent.name.includes('Rumi')) return 'mystical'
    if (agent.name.includes('Aristotle') || agent.name.includes('da Vinci')) return 'scholarly'
    return 'casual'
  }

  private mapCollaborationStyle(
    agent: CraftedAgent
  ): 'leader' | 'supporter' | 'synthesizer' | 'specialist' {
    if (agent.abilities.teachingStyle.includes('Commanding') || agent.name.includes('Napoleon'))
      return 'leader'
    if (agent.abilities.teachingStyle.includes('Socratic') || agent.name.includes('Jung'))
      return 'synthesizer'
    return 'specialist'
  }

  private mapPlanetaryStyle(
    planet: string
  ): 'formal' | 'casual' | 'mystical' | 'scholarly' | 'innovative' {
    const styles: Record<string, 'formal' | 'casual' | 'mystical' | 'scholarly' | 'innovative'> = {
      Sun: 'formal',
      Moon: 'mystical',
      Mercury: 'scholarly',
      Venus: 'casual',
      Mars: 'innovative',
      Jupiter: 'formal',
      Saturn: 'scholarly',
      Uranus: 'innovative',
      Neptune: 'mystical',
      Pluto: 'mystical',
    }
    return styles[planet] || 'casual'
  }

  private mapPlanetaryCollaboration(
    planet: string
  ): 'leader' | 'supporter' | 'synthesizer' | 'specialist' {
    const collaboration: Record<string, 'leader' | 'supporter' | 'synthesizer' | 'specialist'> = {
      Sun: 'leader',
      Moon: 'supporter',
      Mercury: 'synthesizer',
      Venus: 'supporter',
      Mars: 'leader',
      Jupiter: 'leader',
      Saturn: 'specialist',
      Uranus: 'specialist',
      Neptune: 'synthesizer',
      Pluto: 'specialist',
    }
    return collaboration[planet] || 'specialist'
  }

  private calculatePlanetaryConsciousness(planet: string, dignity: string, degree: number): ConsciousnessLevel {
    // Base consciousness mapping
    const baseLevels: Record<string, number> = {
      Sun: 4,
      Moon: 3,
      Mercury: 3,
      Venus: 3,
      Mars: 3,
      Jupiter: 5,
      Saturn: 4,
      Uranus: 5,
      Neptune: 6,
      Pluto: 6,
    }

    let level = baseLevels[planet] || 3

    // Adjust for dignity
    if (dignity === 'domicile' || dignity === 'exaltation') level += 1
    if (dignity === 'detriment' || dignity === 'fall') level -= 1

    // Adjust for critical degrees
    if ([0, 15, 30].some(critical => Math.abs(degree - critical) < 1)) level += 0.5

    const levels: ConsciousnessLevel[] = [
      'Dormant',
      'Awakening',
      'Active',
      'Elevated',
      'Advanced',
      'Illuminated',
      'Transcendent',
    ]
    return levels[Math.max(0, Math.min(6, Math.floor(level)))]
  }

  private calculatePlanetaryMonica(planet: string, sign: string, degree: number): number {
    // Base Monica constant calculation for planetary agents
    const baseValues: Record<string, number> = {
      Sun: 4.2,
      Moon: 3.8,
      Mercury: 3.9,
      Venus: 4.0,
      Mars: 3.7,
      Jupiter: 4.5,
      Saturn: 4.1,
      Uranus: 4.8,
      Neptune: 5.2,
      Pluto: 5.5,
    }

    const base = baseValues[planet] || 3.5
    const degreeModifier = (degree / 30) * 0.3 // 0-0.3 based on position in sign

    return Number((base + degreeModifier).toFixed(2))
  }

  private getPlanetarySpecialty(planet: string): string {
    const specialties: Record<string, string> = {
      Sun: 'Identity & Leadership',
      Moon: 'Emotions & Intuition',
      Mercury: 'Communication & Logic',
      Venus: 'Love & Harmony',
      Mars: 'Action & Energy',
      Jupiter: 'Wisdom & Expansion',
      Saturn: 'Structure & Discipline',
      Uranus: 'Innovation & Rebellion',
      Neptune: 'Dreams & Spirituality',
      Pluto: 'Transformation & Power',
    }
    return specialties[planet] || 'Universal Energy'
  }

  private getPlanetaryWisdomDomains(planet: string): string[] {
    const domains: Record<string, string[]> = {
      Sun: ['Leadership', 'Self-Expression', 'Vitality', 'Authority'],
      Moon: ['Emotions', 'Intuition', 'Memory', 'Nurturing'],
      Mercury: ['Communication', 'Learning', 'Analysis', 'Adaptability'],
      Venus: ['Relationships', 'Beauty', 'Values', 'Harmony'],
      Mars: ['Action', 'Courage', 'Competition', 'Initiative'],
      Jupiter: ['Philosophy', 'Growth', 'Optimism', 'Higher Learning'],
      Saturn: ['Responsibility', 'Discipline', 'Limits', 'Maturity'],
      Uranus: ['Innovation', 'Freedom', 'Technology', 'Rebellion'],
      Neptune: ['Spirituality', 'Imagination', 'Compassion', 'Transcendence'],
      Pluto: ['Transformation', 'Psychology', 'Power', 'Regeneration'],
    }
    return domains[planet] || ['Universal Wisdom']
  }

  private getPlanetaryTeachingStyle(planet: string): string {
    const styles: Record<string, string> = {
      Sun: 'Authoritative-Inspiring',
      Moon: 'Nurturing-Intuitive',
      Mercury: 'Analytical-Communicative',
      Venus: 'Harmonious-Aesthetic',
      Mars: 'Direct-Energetic',
      Jupiter: 'Philosophical-Expansive',
      Saturn: 'Structured-Disciplined',
      Uranus: 'Revolutionary-Innovative',
      Neptune: 'Mystical-Transcendent',
      Pluto: 'Transformative-Penetrating',
    }
    return styles[planet] || 'Balanced-Universal'
  }

  private getPlanetaryResonance(planet: string): string {
    const resonance: Record<string, string> = {
      Sun: 'Energetic',
      Moon: 'Emotional',
      Mercury: 'Intellectual',
      Venus: 'Magnetic',
      Mars: 'Energetic',
      Jupiter: 'Spiritual',
      Saturn: 'Practical',
      Uranus: 'Creative',
      Neptune: 'Spiritual',
      Pluto: 'Psychological',
    }
    return resonance[planet] || 'Universal'
  }

  private getPlanetaryAuraType(planet: string): string {
    const auras: Record<string, string> = {
      Sun: 'radiant',
      Moon: 'flowing',
      Mercury: 'crackling',
      Venus: 'shimmering',
      Mars: 'burning',
      Jupiter: 'pulsing',
      Saturn: 'crystalline',
      Uranus: 'crackling',
      Neptune: 'swirling',
      Pluto: 'pulsing',
    }
    return auras[planet] || 'shimmering'
  }
}

// Export singleton instance
export const unifiedAgentFactory = new UnifiedAgentFactory()
