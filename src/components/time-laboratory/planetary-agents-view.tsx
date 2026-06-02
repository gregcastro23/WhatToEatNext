'use client'

import {
  Users,
  Sparkles,
  MessageCircle,
  Star,
  Zap,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fetchAgentsForDate } from '@/lib/planetaryAgentsClient'
import { AgentFilterPanel, type AgentFilters } from './agent-filter-panel'
import { DegreeAgentSelector } from './degree-agent-selector'
import { MultiAgentConversation } from './multi-agent-conversation'
import { PlanetaryAgentChat } from './planetary-agent-chat'
import { ZodiacWheelInteractive } from './zodiac-wheel-interactive'

// Zodiac modality lookup + derivation from a degree-agent id
// (planetary-{planet}-{sign}-{degree}).
const SIGN_MODALITY: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  aries: 'Cardinal', cancer: 'Cardinal', libra: 'Cardinal', capricorn: 'Cardinal',
  taurus: 'Fixed', leo: 'Fixed', scorpio: 'Fixed', aquarius: 'Fixed',
  gemini: 'Mutable', virgo: 'Mutable', sagittarius: 'Mutable', pisces: 'Mutable',
}

function modalityFromAgentId(id: string | undefined): string | undefined {
  const sign = String(id || '').split('-')[2]?.toLowerCase()
  return sign ? SIGN_MODALITY[sign] : undefined
}

interface PlanetaryAgentsViewProps {
  selectedDate: Date
  userId?: string
  onAgentChat?: (agentId: string, agentName: string, transitContext?: any) => void
  onGroupChat?: (agents: PlanetaryAgentActivation[]) => void
}

interface AgentStrengthIndicatorProps {
  strength: number
  dignity:
    | 'domicile'
    | 'exaltation'
    | 'triplicity'
    | 'term'
    | 'face'
    | 'detriment'
    | 'fall'
    | 'peregrine'
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit'
}

const AgentStrengthIndicator: React.FC<AgentStrengthIndicatorProps> = ({
  strength,
  dignity,
  element,
}) => {
  const getDignityColor = (dignity: string) => {
    switch (dignity) {
      case 'domicile':
        return 'text-green-400 border-green-400'
      case 'exaltation':
        return 'text-yellow-400 border-yellow-400'
      case 'triplicity':
        return 'text-blue-400 border-blue-400'
      case 'term':
        return 'text-purple-400 border-purple-400'
      case 'face':
        return 'text-orange-400 border-orange-400'
      case 'detriment':
        return 'text-red-400 border-red-400'
      case 'fall':
        return 'text-red-500 border-red-500'
      case 'peregrine':
        return 'text-gray-400 border-gray-400'
      default:
        return 'text-gray-400 border-gray-400'
    }
  }

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return <Flame className="w-3 h-3" />
      case 'Water':
        return <Droplets className="w-3 h-3" />
      case 'Air':
        return <Wind className="w-3 h-3" />
      case 'Earth':
        return <Mountain className="w-3 h-3" />
      default:
        return <Star className="w-3 h-3" />
    }
  }

  const getStrengthLabel = (strength: number) => {
    if (strength >= 0.9) return 'Exceptional'
    if (strength >= 0.8) return 'Strong'
    if (strength >= 0.7) return 'Moderate'
    if (strength >= 0.6) return 'Weak'
    return 'Minimal'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-300">Strength</span>
        <div className="flex items-center gap-1">
          {getElementIcon(element)}
          <Badge variant="outline" className={`text-xs ${getDignityColor(dignity)}`}>
            {dignity}
          </Badge>
        </div>
      </div>
      <Progress value={strength * 100} className="h-2" />
      <div className="flex justify-between text-xs text-purple-400">
        <span>{getStrengthLabel(strength)}</span>
        <span>{(strength * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}

interface PlanetaryAgentActivation {
  agent: {
    id: string
    name: string
    description: string
  }
  strength: number
  dignity:
    | 'domicile'
    | 'exaltation'
    | 'triplicity'
    | 'term'
    | 'face'
    | 'detriment'
    | 'fall'
    | 'peregrine'
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit'
  consciousness: {
    level: string
    powerLevel: number
  }
  planetaryRuler: string
  modality?: string
}

interface AgentCardProps {
  activation: PlanetaryAgentActivation
  onChatClick?: () => void
  isLoading?: boolean
}

const AgentCard: React.FC<AgentCardProps> = ({ activation, onChatClick, isLoading }) => {
  const { agent, strength, dignity, element, consciousness, planetaryRuler } = activation

  return (
    <Card className="cosmic-glass border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gold text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            {agent.name}
          </CardTitle>
          <Badge className="cosmic-badge">{planetaryRuler}</Badge>
        </div>
        <p className="text-sm text-purple-300">{agent.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <AgentStrengthIndicator strength={strength} dignity={dignity} element={element} />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-400">Consciousness:</span>
            <div className="text-purple-200 font-medium">{consciousness.level}</div>
          </div>
          <div>
            <span className="text-purple-400">Element:</span>
            <div className="text-purple-200 font-medium flex items-center gap-1">
              {element === 'Fire' && <Flame className="w-3 h-3 text-red-400" />}
              {element === 'Water' && <Droplets className="w-3 h-3 text-blue-400" />}
              {element === 'Air' && <Wind className="w-3 h-3 text-cyan-400" />}
              {element === 'Earth' && <Mountain className="w-3 h-3 text-green-400" />}
              {element}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="cosmic-button flex-1"
            onClick={onChatClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            Ask Agent
          </Button>
          <Button size="sm" variant="outline" className="cosmic-button">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const PlanetaryAgentsView: React.FC<PlanetaryAgentsViewProps> = ({
  selectedDate,
  userId = 'demo-user',
  onAgentChat,
  onGroupChat,
}) => {
  const [activations, setActivations] = useState<PlanetaryAgentActivation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Interactive features state
  const [selectedDegree, setSelectedDegree] = useState<number | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'overview' | 'interactive' | 'chat'>('interactive')
  const [chatMode, setChatMode] = useState<'single' | 'council'>('single')
  const [selectedChatAgent, setSelectedChatAgent] = useState<PlanetaryAgentActivation | null>(null)
  const [filters, setFilters] = useState<AgentFilters>({
    searchTerm: '',
    elements: [],
    dignities: [],
    modalities: [],
    consciousnessLevels: [],
    minStrength: 0,
    maxStrength: 100,
    planetaryRulers: [],
  })

  // Apply the active filters to the visible activation list.
  const filteredActivations = useMemo(() => {
    const f = filters
    const hasAny =
      !!f.searchTerm ||
      f.elements.length > 0 ||
      f.dignities.length > 0 ||
      f.modalities.length > 0 ||
      f.consciousnessLevels.length > 0 ||
      f.planetaryRulers.length > 0 ||
      f.minStrength > 0 ||
      f.maxStrength < 100
    if (!hasAny) return activations
    return activations.filter((a) => {
      if (
        f.searchTerm &&
        !`${a.agent?.name ?? ''} ${a.agent?.id ?? ''}`
          .toLowerCase()
          .includes(f.searchTerm.toLowerCase())
      )
        return false
      if (f.elements.length > 0 && !f.elements.includes(a.element)) return false
      if (f.dignities.length > 0 && !f.dignities.includes(a.dignity)) return false
      if (f.modalities.length > 0) {
        const m = a.modality || modalityFromAgentId(a.agent?.id)
        if (!m || !f.modalities.includes(m)) return false
      }
      if (
        f.consciousnessLevels.length > 0 &&
        !f.consciousnessLevels.includes(a.consciousness?.level)
      )
        return false
      const pct = (a.strength || 0) * 100
      if (pct < f.minStrength || pct > f.maxStrength) return false
      if (
        f.planetaryRulers.length > 0 &&
        !f.planetaryRulers.includes(a.planetaryRuler)
      )
        return false
      return true
    })
  }, [activations, filters])

  const loadAgentActivations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedActivations = await fetchAgentsForDate(selectedDate);
      const withModality = (fetchedActivations as PlanetaryAgentActivation[]).map((a) => ({
        ...a,
        modality: a.modality || modalityFromAgentId(a.agent?.id),
      }));
      setActivations(withModality);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading planetary agents:', err)
      setError(err instanceof Error ? err.message : 'Failed to load planetary agents')
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    void loadAgentActivations()
  }, [loadAgentActivations])

  const handleDegreeClick = useCallback((degree: number, _sign: string) => {
    setSelectedDegree(degree)
  }, [])

  const handleDegreeChange = useCallback((degree: number) => {
    setSelectedDegree(degree)
  }, [])

  const handleFiltersChange = useCallback((newFilters: AgentFilters) => {
    setFilters(newFilters)
  }, [])

  const handleAgentChatFromWheel = useCallback(
    (agentId: string, agentName: string) => {
      if (onAgentChat) {
        onAgentChat(agentId, agentName, {
          date: selectedDate,
          degree: selectedDegree,
          source: 'zodiac-wheel',
        })
      }
    },
    [onAgentChat, selectedDate, selectedDegree]
  )

  const handleOpenAgentChat = useCallback((agent: PlanetaryAgentActivation) => {
    setSelectedChatAgent(agent)
    setChatMode('single')
    setViewMode('chat')
  }, [])

  const handleOpenCouncilChat = useCallback(() => {
    setChatMode('council')
    setViewMode('chat')
  }, [])

  const handleCloseChat = useCallback(() => {
    setViewMode('interactive')
    setSelectedChatAgent(null)
  }, [])

  const handleAgentEvolution = useCallback((agentId: string, evolution: any) => {
    // Update agent evolution in the activations list
    setActivations(prev =>
      prev.map(activation =>
        activation.agent.id === agentId
          ? { ...activation, evolutionPoints: evolution.evolutionPoints }
          : activation
      )
    )
  }, [])

  const handleGroupChat = useCallback(() => {
    if (onGroupChat && activations.length > 0) {
      onGroupChat(activations)
    }
  }, [onGroupChat, activations])

  const getSummaryStats = () => {
    const totalAgents = activations.length
    const strongAgents = activations.filter(a => a.strength >= 0.8).length
    const dominantElement =
      activations.length > 0
        ? activations.reduce(
            (acc, curr) => {
              acc[curr.element] = (acc[curr.element] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )
        : {}

    const mostCommonElement =
      Object.entries(dominantElement).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

    return { totalAgents, strongAgents, mostCommonElement }
  }

  const { totalAgents, strongAgents, mostCommonElement } = getSummaryStats()

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="cosmic-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Planetary Agents - {selectedDate.toLocaleDateString()}
              </CardTitle>
              <p className="text-xs text-purple-400 mt-1">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                onClick={() => setViewMode('overview')}
                className="cosmic-button"
              >
                Overview
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'interactive' ? 'default' : 'outline'}
                onClick={() => setViewMode('interactive')}
                className="cosmic-button"
              >
                Interactive
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGroupChat}
                className="cosmic-button"
                disabled={activations.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Group Chat
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'chat' ? 'default' : 'outline'}
                onClick={handleOpenCouncilChat}
                className="cosmic-button"
              >
                Council Chat
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cosmic-button"
                onClick={() => { void loadAgentActivations(); }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{totalAgents}</div>
              <div className="text-sm text-purple-300">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{strongAgents}</div>
              <div className="text-sm text-purple-300">Strong Activations (≥80%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{mostCommonElement}</div>
              <div className="text-sm text-purple-300">Dominant Element</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Content */}
      {viewMode === 'overview' ? (
        /* Overview Mode - Original Agent Grid */
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
                <span className="text-purple-300">Calculating planetary positions...</span>
              </div>
            </div>
          ) : activations.length === 0 ? (
            <Card className="cosmic-glass">
              <CardContent className="text-center py-12">
                <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-purple-200 mb-2">
                  No Significant Activations
                </h3>
                <p className="text-purple-400">
                  No planetary agents are strongly activated for this date. Try adjusting the date
                  or check back during significant astrological periods.
                </p>
              </CardContent>
            </Card>
          ) : filteredActivations.length === 0 ? (
            <Card className="cosmic-glass">
              <CardContent className="text-center py-12">
                <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-purple-200 mb-2">
                  No Agents Match Your Filters
                </h3>
                <p className="text-purple-400">
                  Adjust or clear the filters below to see activated agents.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivations.map((activation, index) => (
                <AgentCard
                  key={`${activation.agent.id}-${index}`}
                  activation={activation}
                  onChatClick={() => handleOpenAgentChat(activation)}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Interactive Mode - Zodiac Wheel and Controls */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Panel - Degree Selector */}
          <div className="xl:col-span-1">
            <DegreeAgentSelector
              selectedDegree={selectedDegree}
              onDegreeChange={handleDegreeChange}
              onAgentChat={handleAgentChatFromWheel}
            />
          </div>

          {/* Center Panel - Zodiac Wheel */}
          <div className="xl:col-span-2">
            <ZodiacWheelInteractive
              selectedDegree={selectedDegree}
              onDegreeClick={handleDegreeClick}
              onAgentChat={handleAgentChatFromWheel}
              size={600}
              showLabels
            />
          </div>
        </div>
      )}

      {/* Chat View */}
      {viewMode === 'chat' && (
        <div className="space-y-6">
          {chatMode === 'single' && selectedChatAgent ? (
            <PlanetaryAgentChat
              agent={{
                id: selectedChatAgent.agent.id,
                name: selectedChatAgent.agent.name,
                description: selectedChatAgent.agent.description || '',
                planetaryRuler: selectedChatAgent.planetaryRuler,
                element: selectedChatAgent.element,
                consciousnessLevel: 'Active', // Default
                activationStrength: selectedChatAgent.strength,
                dignity: selectedChatAgent.dignity,
              }}
              userId={userId}
              initialContext={{
                degree: selectedDegree,
                sign: 'Unknown', // Would need to calculate from degree
                date: selectedDate,
              }}
              onClose={handleCloseChat}
              onAgentEvolution={handleAgentEvolution}
            />
          ) : chatMode === 'council' ? (
            <MultiAgentConversation
              availableAgents={activations.map(activation => ({
                id: activation.agent.id,
                name: activation.agent.name,
                planetaryRuler: activation.planetaryRuler,
                element: activation.element,
                consciousnessLevel: 'Active',
                activationStrength: activation.strength,
                dignity: activation.dignity,
                description: activation.agent.description || '',
              }))}
              userId={userId}
              initialAgents={activations.slice(0, 3).map(a => a.agent.id)} // Start with top 3 agents
              onClose={handleCloseChat}
              maxAgents={5}
            />
          ) : null}
        </div>
      )}

      {/* Filter Panel - Always visible */}
      <AgentFilterPanel
        onFiltersChange={handleFiltersChange}
        agentCount={activations.length}
        filteredCount={filteredActivations.length}
      />

      {/* Information Panel */}
      <Card className="cosmic-glass">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Planetary Agent Exploration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-purple-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-200 mb-2">Overview Mode</h4>
              <p>
                View planetary agents activated for the current date. Agents are calculated based on
                planetary positions and their strength in the zodiac.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-200 mb-2">Interactive Mode</h4>
              <p>
                Explore the 360 degrees of the zodiac wheel. Click any degree to see which planetary
                agent is activated at that position and chat with them directly.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-purple-500/20">
            <p>
              <strong>Degree Activation:</strong> Each degree of the zodiac has a unique planetary
              agent associated with it. The agent&apos;s strength depends on planetary dignity and
              elemental harmony. Use the interactive wheel to explore different degrees and discover
              their associated intelligences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlanetaryAgentsView
