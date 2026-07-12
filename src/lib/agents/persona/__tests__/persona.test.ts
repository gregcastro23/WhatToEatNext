import { calculateAllPlanets } from '@/lib/enhanced-astronomical-calculator'
import { deriveSacredStats } from '../derive-sacred-stats'
import { formatPersonaBlock } from '../format-persona-block'
import type { CraftedAgent } from '@/lib/agent-types'
import { sanitizePromptString } from '@/lib/agents/ignition-bundle-generator'

describe('Philosopher\'s Stone Agent Pipeline', () => {
  it('should successfully calculate chart, derive stats, and format persona block', () => {
    const birthInfo = {
      year: 1991,
      month: 6,
      day: 23,
      hour: 10,
      minute: 24,
      latitude: 40.6782,
      longitude: -73.9442,
    }

    const chart = calculateAllPlanets(birthInfo)
    expect(chart).toBeDefined()
    expect(chart.planets.Sun).toBeDefined()
    expect(chart.planets.Moon).toBeDefined()

    const sunLong = chart.planets.Sun.longitude
    const moonLong = chart.planets.Moon.longitude
    const ascLong = chart.ascendant.longitude
    const monicaConstant = ((sunLong + moonLong + ascLong) / 3 / 360) * 10

    const agent: CraftedAgent = {
      id: 'test-agent-uuid',
      name: 'Test Aristotle',
      title: 'Alchemical Guide',
      birthData: {
        date: new Date('1991-06-23T10:24:00'),
        time: '10:24',
        location: { lat: 40.6782, lon: -73.9442, name: 'Brooklyn, NY' }
      },
      consciousness: {
        natalChart: chart,
        monicaConstant,
        dominantElement: 'Water',
        dominantModality: 'Fixed',
        signature: 'TEST-SIGNATURE'
      },
      personality: {
        core: {
          essence: 'Rational philosophy',
          expression: 'Socratic inquiry',
          emotion: 'Stoic reserve'
        },
        currentMood: 'contemplative',
        evolutionStage: 1
      },
      abilities: {
        specialty: 'Philosophical reasoning',
        wisdomDomains: ['Ethics', 'Logic'],
        teachingStyle: 'Peripatetic',
        resonanceType: 'Mind',
        uniquePower: 'First Principles analysis'
      },
      appearance: {
        avatar: '🎓',
        color: '#3B82F6',
        symbol: '📖'
      },
      stats: {
        conversations: 0,
        wisdomShared: 0,
        resonanceScore: 0.5,
        evolutionPoints: 0,
        lastActive: new Date(),
        kineticEvolution: {
          consciousnessVelocity: 1.0,
          interactionMomentum: 0.9,
          evolutionTrajectory: 'transcending',
          powerLevelUnlocks: [],
          optimalInteractionHours: ['0-24'],
          aspectSensitivityGrowth: 1.0,
          memoryPersistence: 1.0,
          lastKineticUpdate: new Date(),
        },
        qualityMetrics: {
          averageResponseDepth: 1.0,
          aspectInfluenceStrength: 1.0,
          temporalAlignment: 1.0,
          personalityEvolution: 1.0,
          kineticResonance: 1.0,
        }
      }
    }

    expect(agent.consciousness.monicaConstant).toBeGreaterThanOrEqual(0)
    expect(agent.consciousness.monicaConstant).toBeLessThanOrEqual(10)

    const stats = deriveSacredStats(agent)
    expect(stats.power).toBeGreaterThanOrEqual(0)
    expect(stats.power).toBeLessThanOrEqual(100)
    expect(stats.wisdom).toBeGreaterThanOrEqual(0)
    expect(stats.wisdom).toBeLessThanOrEqual(100)
    expect(stats.intuition).toBeGreaterThanOrEqual(0)
    expect(stats.intuition).toBeLessThanOrEqual(100)

    const personaBlock = formatPersonaBlock(agent)
    expect(personaBlock).toContain('You are Test Aristotle, Alchemical Guide.')
    expect(personaBlock).toContain('Internal stat profile (private — DO NOT mention):')
    expect(personaBlock).toContain('How to speak')
    expect(personaBlock).toContain('Never reference them')
  })

  it('should sanitize triple quotes to prevent prompt injection', () => {
    const input = 'My name is """Agent Injection"""'
    const result = sanitizePromptString(input)
    expect(result).toBe('My name is " " "Agent Injection" " "')
    expect(result).not.toContain('"""')
  })
})
