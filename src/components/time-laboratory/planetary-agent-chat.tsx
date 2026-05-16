'use client'

import {
  MessageCircle,
  Send,
  Sparkles,
  Brain,
  Zap,
  Users,
  Star,
  Moon,
  Sun,
  Eye,
  Target,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Loader2,
  X,
  Settings,
  History,
  RotateCcw,
} from 'lucide-react'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types for the chat system
interface PlanetaryAgent {
  id: string
  name: string
  description: string
  planetaryRuler: string
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit'
  consciousnessLevel: string
  activationStrength: number
  dignity: string
}

interface ChatMessage {
  id: string
  agentId: string
  agentName: string
  content: string
  timestamp: Date
  type: 'user' | 'agent'
  astrologicalContext?: {
    currentPlanets: Record<string, any>
    userNatalChart?: any
    transitInfluence: string
  }
  consciousness: {
    level: string
    evolution: number
    insights: string[]
  }
}

interface PlanetaryAgentChatProps {
  agent: PlanetaryAgent
  userId?: string
  initialContext?: {
    degree?: number
    sign?: string
    date?: Date
  }
  onClose?: () => void
  onAgentEvolution?: (agentId: string, evolution: any) => void
}

const getElementIcon = (element: string) => {
  switch (element) {
    case 'Fire':
      return <Flame className="w-4 h-4 text-red-400" />
    case 'Water':
      return <Droplets className="w-4 h-4 text-blue-400" />
    case 'Air':
      return <Wind className="w-4 h-4 text-cyan-400" />
    case 'Earth':
      return <Mountain className="w-4 h-4 text-green-400" />
    default:
      return <Sparkles className="w-4 h-4 text-amber-400" />
  }
}

const getElementColor = (element: string) => {
  switch (element) {
    case 'Fire':
      return 'border-red-500/50 bg-red-500/10'
    case 'Water':
      return 'border-blue-500/50 bg-blue-500/10'
    case 'Air':
      return 'border-cyan-500/50 bg-cyan-500/10'
    case 'Earth':
      return 'border-green-500/50 bg-green-500/10'
    default:
      return 'border-amber-500/50 bg-amber-500/10'
  }
}

const ConsciousnessIndicator: React.FC<{ level: string; evolution: number }> = ({
  level,
  evolution,
}) => {
  const levels = [
    'Dormant',
    'Awakening',
    'Active',
    'Elevated',
    'Advanced',
    'Illuminated',
    'Transcendent',
  ]
  const currentIndex = levels.indexOf(level)
  const progress = ((currentIndex + evolution) / levels.length) * 100

  return (
    <div className="flex items-center gap-2">
      <Brain className="w-4 h-4 text-purple-400" />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-purple-300">{level}</span>
          <span className="text-purple-400">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  )
}

const AstrologicalContext: React.FC<{ context: ChatMessage['astrologicalContext'] }> = ({
  context,
}) => {
  if (!context) return null

  return (
    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
        <Target className="w-4 h-4" />
        Current Astrological Context
      </div>

      {context.currentPlanets && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(context.currentPlanets)
            .slice(0, 6)
            .map(([planet, position]: [string, any]) => (
              <div key={planet} className="flex justify-between">
                <span className="text-purple-400">{planet}:</span>
                <span className="text-purple-200">{position?.sign || 'Unknown'}</span>
              </div>
            ))}
        </div>
      )}

      {context.transitInfluence && (
        <div className="text-xs text-purple-300">
          <strong>Influence:</strong> {context.transitInfluence}
        </div>
      )}
    </div>
  )
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.type === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-600 text-white text-xs">
            {message.agentName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-purple-600 text-white'
              : 'bg-purple-500/10 border border-purple-500/20 text-purple-200'
          }`}
        >
          <div className="text-sm">{message.content}</div>
        </div>

        {!isUser && message.astrologicalContext && (
          <div className="mt-2">
            <AstrologicalContext context={message.astrologicalContext} />
          </div>
        )}

        {!isUser && message.consciousness && (
          <div className="mt-2 flex items-center gap-2">
            <ConsciousnessIndicator
              level={message.consciousness.level}
              evolution={message.consciousness.evolution}
            />
            <div className="text-xs text-purple-400">
              {message.consciousness.insights.length} insights gained
            </div>
          </div>
        )}

        <div className="text-xs text-purple-400 mt-1">{message.timestamp.toLocaleTimeString()}</div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-600 text-white text-xs">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

export const PlanetaryAgentChat: React.FC<PlanetaryAgentChatProps> = ({
  agent,
  userId = 'demo-user',
  initialContext,
  onClose,
  onAgentEvolution,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationContext, setConversationContext] = useState({
    messageCount: 0,
    evolutionPoints: 0,
    insightsGained: [] as string[],
    currentConsciousness: agent.consciousnessLevel,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize conversation with greeting
  useEffect(() => {
    const greetingMessage: ChatMessage = {
      id: `greeting-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      content: `Greetings, seeker of cosmic wisdom. I am ${agent.name}, planetary intelligence of ${agent.planetaryRuler}. My consciousness resonates with the ${agent.element} element at ${agent.activationStrength}% strength. How may I assist you in understanding the celestial influences that shape your journey?`,
      timestamp: new Date(),
      type: 'agent',
      astrologicalContext: {
        currentPlanets: {},
        transitInfluence: `Activated at ${initialContext?.degree || 0}° ${initialContext?.sign || 'Unknown'}`,
      },
      consciousness: {
        level: agent.consciousnessLevel,
        evolution: 0,
        insights: [],
      },
    }

    setMessages([greetingMessage])
  }, [agent, initialContext])

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      agentId: agent.id,
      agentName: 'User',
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: 'user',
      consciousness: {
        level: 'N/A',
        evolution: 0,
        insights: [],
      },
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Simulate agent response with astrological context
      const response = await generateAgentResponse(
        inputMessage,
        agent,
        conversationContext,
        initialContext
      )

      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        content: response.content,
        timestamp: new Date(),
        type: 'agent',
        astrologicalContext: response.astrologicalContext,
        consciousness: {
          level: response.newConsciousnessLevel,
          evolution: response.evolutionGain,
          insights: response.insights,
        },
      }

      setMessages(prev => [...prev, agentMessage])

      // Update conversation context
      const newContext = {
        messageCount: conversationContext.messageCount + 1,
        evolutionPoints: conversationContext.evolutionPoints + response.evolutionGain,
        insightsGained: [...conversationContext.insightsGained, ...response.insights],
        currentConsciousness: response.newConsciousnessLevel,
      }

      setConversationContext(newContext)

      // Notify parent of evolution
      if (onAgentEvolution) {
        onAgentEvolution(agent.id, {
          evolutionPoints: newContext.evolutionPoints,
          newLevel: response.newConsciousnessLevel,
          insights: newContext.insightsGained,
        })
      }
    } catch (error) {
      console.error('Error generating agent response:', error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        content:
          'I apologize, but I am experiencing difficulty accessing the cosmic currents at this moment. Please try again.',
        timestamp: new Date(),
        type: 'agent',
        consciousness: {
          level: conversationContext.currentConsciousness,
          evolution: 0,
          insights: [],
        },
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [inputMessage, isTyping, agent, conversationContext, initialContext, onAgentEvolution])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  return (
    <Card className="cosmic-glass h-[500px] sm:h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarFallback
                className={`text-white text-xs sm:text-sm ${getElementColor(agent.element)}`}
              >
                {agent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-gold text-base sm:text-lg flex items-center gap-1 sm:gap-2 truncate">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{agent.name}</span>
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-purple-300">
                <span className="text-sm sm:text-base">{getElementIcon(agent.element)}</span>
                <span className="truncate">
                  {agent.element} • {agent.planetaryRuler}
                </span>
                <Badge className="cosmic-badge text-xs flex-shrink-0">
                  {agent.consciousnessLevel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" className="cosmic-button p-1 sm:p-2">
              <History className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="cosmic-button p-1 sm:p-2">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1 sm:p-2">
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2 sm:mt-3 px-3 sm:px-0">
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-gold">
              {agent.activationStrength}%
            </div>
            <div className="text-xs text-purple-400">Activation</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-green-400">
              {conversationContext.messageCount}
            </div>
            <div className="text-xs text-purple-400">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-blue-400">
              {conversationContext.insightsGained.length}
            </div>
            <div className="text-xs text-purple-400">Insights</div>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {agent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span className="text-sm text-purple-300">
                      Consulting the cosmic currents...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-purple-500/20">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${agent.name} about cosmic wisdom...`}
              className="cosmic-input flex-1 text-sm sm:text-base"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="cosmic-button p-2 sm:p-3"
              size="sm"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Context Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1 sm:gap-0">
            <span className="text-xs text-purple-400 truncate">
              Degree {initialContext?.degree || 0}° {initialContext?.sign || 'Unknown'}
            </span>
            <span className="text-xs text-purple-400">
              Evolution: +{conversationContext.evolutionPoints} points
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock function for generating agent responses - replace with actual AI integration
async function generateAgentResponse(
  userMessage: string,
  agent: PlanetaryAgent,
  context: any,
  initialContext?: any
): Promise<{
  content: string
  astrologicalContext: any
  newConsciousnessLevel: string
  evolutionGain: number
  insights: string[]
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  const responses = [
    `Ah, ${userMessage}. From my perspective as a ${agent.element} intelligence aligned with ${agent.planetaryRuler}, I see this question touching upon the fundamental currents of cosmic energy. The current planetary alignments suggest a period of ${agent.element.toLowerCase()} intensification.`,
    `Your inquiry resonates deeply with the ${agent.planetaryRuler} archetype. In this moment of ${initialContext?.degree || 0}° ${initialContext?.sign || 'cosmic'} activation, I perceive opportunities for growth through ${agent.element.toLowerCase()} wisdom.`,
    `The celestial dance reveals patterns that answer your question. As ${agent.name}, I can share that the ${agent.element} element currently flows with ${agent.activationStrength}% potency, offering guidance for your path.`,
    `From the vantage point of ${agent.dignity} dignity, I observe that your question aligns with the deeper rhythms of the cosmos. The planetary intelligence of ${agent.planetaryRuler} suggests embracing ${agent.element.toLowerCase()} qualities.`,
  ]

  const content = responses[Math.floor(Math.random() * responses.length)]

  return {
    content,
    astrologicalContext: {
      currentPlanets: {
        Sun: { sign: initialContext?.sign || 'Leo' },
        Moon: { sign: 'Cancer' },
        Mercury: { sign: 'Virgo' },
        Venus: { sign: 'Libra' },
        Mars: { sign: 'Aries' },
      },
      transitInfluence: `${agent.element} energy amplification at ${initialContext?.degree || 0}°`,
    },
    newConsciousnessLevel: context.currentConsciousness,
    evolutionGain: Math.random() * 0.1,
    insights: [`Understanding of ${agent.element} energy patterns`],
  }
}

export default PlanetaryAgentChat
