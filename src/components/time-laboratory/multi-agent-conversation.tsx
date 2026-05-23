'use client'

import {
  Users,
  Send,
  Plus,
  X,
  Star,
  Loader2,
} from 'lucide-react'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Types
interface PlanetaryAgent {
  id: string
  name: string
  planetaryRuler: string
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit'
  consciousnessLevel: string
  activationStrength: number
  dignity: string
  description: string
}

interface ConversationMessage {
  id: string
  agentId: string
  agentName: string
  content: string
  timestamp: Date
  type: 'user' | 'agent'
  astrologicalContext?: any
  consensusWeight?: number // For group decisions
}

interface MultiAgentConversationProps {
  availableAgents: PlanetaryAgent[]
  userId?: string
  initialAgents?: string[] // Agent IDs to start with
  onClose?: () => void
  maxAgents?: number
}

const getElementIcon = (element: string) => {
  const icons = {
    Fire: '🔥',
    Water: '💧',
    Air: '💨',
    Earth: '🏔️',
    Spirit: '✨',
  }
  return icons[element as keyof typeof icons] || '⭐'
}

const getElementColor = (element: string) => {
  const colors = {
    Fire: 'bg-red-500/20 border-red-500/50',
    Water: 'bg-blue-500/20 border-blue-500/50',
    Air: 'bg-cyan-500/20 border-cyan-500/50',
    Earth: 'bg-green-500/20 border-green-500/50',
    Spirit: 'bg-amber-500/20 border-amber-500/50',
  }
  return colors[element as keyof typeof colors] || 'bg-purple-500/20 border-purple-500/50'
}

const AgentAvatar: React.FC<{ agent: PlanetaryAgent; size?: 'sm' | 'md' | 'lg' }> = ({
  agent,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${getElementColor(agent.element)} border-2`}>
      <AvatarFallback className="text-white font-bold text-xs">
        {agent.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}

const AgentCard: React.FC<{
  agent: PlanetaryAgent
  isSelected: boolean
  onToggle: () => void
  showStats?: boolean
}> = ({ agent, isSelected, onToggle, showStats = false }) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-purple-400 bg-purple-500/10' : 'hover:bg-purple-500/5'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AgentAvatar agent={agent} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-purple-200">{agent.name}</h3>
              <span className="text-lg">{getElementIcon(agent.element)}</span>
            </div>
            <p className="text-sm text-purple-400">
              {agent.planetaryRuler} • {agent.element}
            </p>
            {showStats && (
              <div className="flex items-center gap-2 mt-1">
                <Badge className="cosmic-badge text-xs">{agent.consciousnessLevel}</Badge>
                <span className="text-xs text-purple-400">
                  {agent.activationStrength}% strength
                </span>
              </div>
            )}
          </div>
          {isSelected && <Star className="w-5 h-5 text-yellow-400" />}
        </div>
      </CardContent>
    </Card>
  )
}

const MessageBubble: React.FC<{ message: ConversationMessage }> = ({ message }) => {
  const isUser = message.type === 'user'

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <AgentAvatar
          agent={{
            id: message.agentId,
            name: message.agentName,
            planetaryRuler: '',
            element: 'Spirit',
            consciousnessLevel: '',
            activationStrength: 0,
            dignity: '',
            description: '',
          }}
          size="sm"
        />
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-purple-600 text-white'
              : 'bg-purple-500/10 border border-purple-500/20 text-purple-200'
          }`}
        >
          {!isUser && (
            <div className="text-xs text-purple-400 mb-1 font-medium">{message.agentName}</div>
          )}
          <div className="text-sm">{message.content}</div>
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-purple-400">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {message.consensusWeight && (
            <Badge variant="outline" className="text-xs">
              Weight: {message.consensusWeight.toFixed(1)}
            </Badge>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-600 text-white text-xs">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

export const MultiAgentConversation: React.FC<MultiAgentConversationProps> = ({
  availableAgents,
  userId: _userId = 'demo-user',
  initialAgents = [],
  onClose,
  maxAgents = 5,
}) => {
  const [selectedAgents, setSelectedAgents] = useState<string[]>(initialAgents)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationMode, setConversationMode] = useState<'individual' | 'consensus' | 'debate'>(
    'consensus'
  )
  const [showAgentSelector, setShowAgentSelector] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize with selected agents
  useEffect(() => {
    if (selectedAgents.length > 0 && messages.length === 0) {
      const selectedAgentObjects = availableAgents.filter(agent =>
        selectedAgents.includes(agent.id)
      )

      const welcomeMessage: ConversationMessage = {
        id: `welcome-${Date.now()}`,
        agentId: 'system',
        agentName: 'Cosmic Council',
        content: `Welcome to the Planetary Council! ${selectedAgentObjects.map(a => a.name).join(', ')} have gathered to provide you with comprehensive astrological guidance. Each agent brings unique wisdom from their planetary domain. How may we assist you on your cosmic journey?`,
        timestamp: new Date(),
        type: 'agent',
      }

      setMessages([welcomeMessage])
    }
  }, [selectedAgents, availableAgents, messages.length])

  const toggleAgent = useCallback(
    (agentId: string) => {
      setSelectedAgents(prev => {
        if (prev.includes(agentId)) {
          return prev.filter(id => id !== agentId)
        } else if (prev.length < maxAgents) {
          return [...prev, agentId]
        }
        return prev
      })
    },
    [maxAgents]
  )

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isGenerating || selectedAgents.length === 0) return

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      agentId: 'user',
      agentName: 'You',
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: 'user',
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsGenerating(true)

    try {
      // Generate responses from selected agents
      const responses = await generateMultiAgentResponses(
        inputMessage.trim(),
        selectedAgents,
        availableAgents,
        conversationMode
      )

      // Add responses with slight delays for natural conversation flow
      for (let i = 0; i < responses.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

        const response = responses[i]
        const agentMessage: ConversationMessage = {
          id: `agent-${response.agentId}-${Date.now()}-${i}`,
          agentId: response.agentId,
          agentName: response.agentName,
          content: response.content,
          timestamp: new Date(),
          type: 'agent',
          consensusWeight: response.consensusWeight,
        }

        setMessages(prev => [...prev, agentMessage])
      }

      // Add consensus summary if in consensus mode
      if (conversationMode === 'consensus' && responses.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const consensus = generateConsensusSummary(responses)
        const consensusMessage: ConversationMessage = {
          id: `consensus-${Date.now()}`,
          agentId: 'council',
          agentName: 'Council Consensus',
          content: consensus,
          timestamp: new Date(),
          type: 'agent',
        }

        setMessages(prev => [...prev, consensusMessage])
      }
    } catch (error) {
      console.error('Error generating multi-agent responses:', error)
      const errorMessage: ConversationMessage = {
        id: `error-${Date.now()}`,
        agentId: 'system',
        agentName: 'System',
        content: 'The cosmic council is experiencing interference. Please try again.',
        timestamp: new Date(),
        type: 'agent',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }, [inputMessage, isGenerating, selectedAgents, availableAgents, conversationMode])

  const selectedAgentObjects = availableAgents.filter(agent => selectedAgents.includes(agent.id))

  const unselectedAgents = availableAgents.filter(agent => !selectedAgents.includes(agent.id))

  return (
    <Card className="cosmic-glass h-[700px] flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gold text-xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              Planetary Council
            </CardTitle>
            <p className="text-sm text-purple-400">
              {selectedAgents.length} agents active • {messages.length} messages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={conversationMode}
              onValueChange={(value: any) => setConversationMode(value)}
            >
              <SelectTrigger className="cosmic-select w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consensus">Consensus</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="debate">Debate</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="cosmic-button"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agents
            </Button>

            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Agents */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-purple-400">Active Council:</span>
          <div className="flex gap-1">
            {selectedAgentObjects.map(agent => (
              <div key={agent.id} className="flex items-center gap-1">
                <AgentAvatar agent={agent} size="sm" />
                <span className="text-xs text-purple-300">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Agent Selector */}
      {showAgentSelector && (
        <div className="px-6 pb-4 border-b border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unselectedAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgents.includes(agent.id)}
                onToggle={() => toggleAgent(agent.id)}
                showStats
              />
            ))}
          </div>
          <div className="text-center mt-3">
            <Button
              variant="outline"
              onClick={() => setShowAgentSelector(false)}
              className="cosmic-button"
            >
              Done Selecting
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isGenerating && (
              <div className="flex gap-3 justify-center mb-4">
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm text-purple-300">Council is deliberating...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Consult the planetary council..."
              className="cosmic-input flex-1"
              disabled={isGenerating || selectedAgents.length === 0}
            />
            <Button
              onClick={() => { void handleSendMessage(); }}
              disabled={!inputMessage.trim() || isGenerating || selectedAgents.length === 0}
              className="cosmic-button"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {selectedAgents.length === 0 && (
            <p className="text-xs text-red-400 mt-2">
              Please select at least one planetary agent to begin the council session.
            </p>
          )}

          <div className="flex items-center justify-between mt-2 text-xs text-purple-400">
            <span>Mode: {conversationMode}</span>
            <span>
              {selectedAgents.length}/{maxAgents} agents selected
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock functions for generating responses - replace with actual AI integration
async function generateMultiAgentResponses(
  userMessage: string,
  agentIds: string[],
  availableAgents: PlanetaryAgent[],
  mode: string
): Promise<
  Array<{
    agentId: string
    agentName: string
    content: string
    consensusWeight: number
  }>
> {
  const selectedAgents = availableAgents.filter(agent => agentIds.includes(agent.id))

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))

  return selectedAgents.map(agent => {
    const perspectives = {
      Fire: 'passionate, dynamic action and courage',
      Water: 'intuitive, emotional depth and healing',
      Air: 'intellectual, communicative clarity and logic',
      Earth: 'practical, grounded stability and manifestation',
      Spirit: 'transcendent, mystical wisdom and unity',
    }

    const baseResponse = `From my ${agent.element} perspective as ${agent.name}, I see this matter through the lens of ${perspectives[agent.element] || 'cosmic wisdom'}.`

    let content = baseResponse
    let weight = agent.activationStrength / 100

    // Mode-specific variations
    if (mode === 'debate') {
      const debateStyles = ['challenging', 'supporting', 'nuancing', 'expanding']
      const style = debateStyles[Math.floor(Math.random() * debateStyles.length)]
      content += ` I ${style} this viewpoint by noting that ${agent.planetaryRuler}'s influence suggests ${Math.random() > 0.5 ? 'caution' : 'boldness'} in this matter.`
    } else if (mode === 'consensus') {
      weight = Math.max(weight, 0.7) // Higher weight for consensus
      content += ` My ${agent.consciousnessLevel.toLowerCase()} consciousness aligns this with the greater cosmic harmony.`
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      content:
        `${content 
        } The planetary currents flow with ${agent.activationStrength}% intensity through my domain.`,
      consensusWeight: weight,
    }
  })
}

function generateConsensusSummary(
  responses: Array<{
    agentId: string
    agentName: string
    content: string
    consensusWeight: number
  }>
): string {
  const avgWeight = responses.reduce((sum, r) => sum + r.consensusWeight, 0) / responses.length

  const consensusStatements = [
    `The council reaches ${avgWeight > 0.8 ? 'strong' : avgWeight > 0.6 ? 'moderate' : 'tentative'} consensus.`,
    `Collectively, we perceive alignment between ${responses.map(r => r.agentName).join(', ')} perspectives.`,
    `The planetary intelligences harmonize on this matter with ${Math.round(avgWeight * 100)}% agreement.`,
    `Our unified cosmic wisdom reveals a path forward that integrates all elemental perspectives.`,
  ]

  return consensusStatements[Math.floor(Math.random() * consensusStatements.length)]
}

export default MultiAgentConversation
