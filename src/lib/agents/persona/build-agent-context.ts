import { createHash } from 'node:crypto'
import type { CraftedAgent } from '@/lib/agent-types'
import { executeQuery } from '@/lib/database'
import { DEMO_AGENTS, MONICA_AS_CRAFTED_AGENT } from '@/lib/demo-agents-data'
import { formatPersonaBlock } from './format-persona-block'

export interface AgentContext {
  agent: CraftedAgent
  personaBlock: string
  /** Stable hash of the persona content — use as a prompt-cache breakpoint key. */
  cacheKey: string
}

const cache = new Map<string, AgentContext>()

export async function findAgent(agentId: string): Promise<CraftedAgent | undefined> {
  if (agentId === 'monica-001' || agentId.toLowerCase() === 'monica') return MONICA_AS_CRAFTED_AGENT
  const byDemo = DEMO_AGENTS.find(
    a => a.id.toLowerCase() === agentId.toLowerCase() || a.name.toLowerCase() === agentId.toLowerCase()
  )
  if (byDemo) return byDemo

  // Attempt database lookup for user-created agents
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
    let queryResult;
    if (isUuid) {
      queryResult = await executeQuery<any>(
        `SELECT u.id AS user_id, u.email, u.profile, up.name, up.bio, up.birth_data, up.natal_chart, up.monica_constant, up.dominant_element
         FROM users u
         JOIN user_profiles up ON up.user_id = u.id
         WHERE u.id = $1::uuid AND u.is_agent = true LIMIT 1`,
        [agentId]
      )
    } else {
      queryResult = await executeQuery<any>(
        `SELECT u.id AS user_id, u.email, u.profile, up.name, up.bio, up.birth_data, up.natal_chart, up.monica_constant, up.dominant_element
         FROM users u
         JOIN user_profiles up ON up.user_id = u.id
         WHERE (u.email = $1 OR up.name ILIKE $2) AND u.is_agent = true LIMIT 1`,
        [agentId, `%${agentId}%`]
      )
    }

    if (queryResult.rows.length > 0) {
      const row = queryResult.rows[0]
      const profile = row.profile || {}
      const birthData = row.birth_data || {}
      const chart = row.natal_chart || {}

      return {
        id: row.user_id,
        name: row.name || row.email.split('@')[0],
        title: row.bio || 'Consciousness Mirror',
        birthData: {
          date: new Date(birthData.dateTime || birthData.date || new Date()),
          time: birthData.time || '12:00',
          location: {
            lat: birthData.latitude ?? 0,
            lon: birthData.longitude ?? 0,
            name: birthData.name || 'Unknown'
          }
        },
        consciousness: {
          natalChart: chart,
          monicaConstant: row.monica_constant ? parseFloat(row.monica_constant) : 3.5,
          dominantElement: row.dominant_element || 'Fire',
          dominantModality: 'Mutable',
          signature: `DYNAMIC-AGENT-${row.user_id}`
        },
        personality: {
          core: {
            essence: chart.planets?.Sun ? `Sun in ${chart.planets.Sun.sign}` : 'Universal Essence',
            expression: chart.ascendant?.sign ? `Ascendant in ${chart.ascendant.sign}` : 'Cosmic Expression',
            emotion: chart.planets?.Moon ? `Moon in ${chart.planets.Moon.sign}` : 'Emotional Depth',
          },
          currentMood: 'contemplative',
          evolutionStage: 1,
        },
        monicaCreationStory: profile.personalContext?.lifeStory || profile.personalContext?.aboutYourself || '',
        coreBeliefs: profile.personalContext?.values ? [profile.personalContext.values] : [],
        quotes: profile.personalContext?.poetry ? [profile.personalContext.poetry] : [],
        abilities: {
          specialty: row.bio || 'Wisdom',
          wisdomDomains: [],
          teachingStyle: 'Intuitive',
          resonanceType: 'Spirit',
          uniquePower: 'Personalized Consciousness',
        },
        appearance: {
          avatar: '🔮',
          color: '#8B5CF6',
          symbol: '🔮'
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
    }
  } catch (error) {
    console.error('[build-agent-context] findAgent DB error:', error)
  }

  return undefined
}

export async function buildAgentContext(agentId: string): Promise<AgentContext | null> {
  const cached = cache.get(agentId)
  if (cached) return cached

  const agent = await findAgent(agentId)
  if (!agent) return null

  const personaBlock = formatPersonaBlock(agent)
  const cacheKey = createHash('sha256').update(personaBlock).digest('hex').slice(0, 16)

  const ctx: AgentContext = { agent, personaBlock, cacheKey }
  cache.set(agentId, ctx)
  return ctx
}

export function clearAgentContextCache(): void {
  cache.clear()
}
