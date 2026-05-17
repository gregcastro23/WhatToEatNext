'use client'

import {
  Flame,
  Droplets,
  Wind,
  Mountain,
  Star,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageCircle,
  Eye,
  Target,
} from 'lucide-react'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAllDegreeAgents } from '@/lib/planetaryAgentsClient'

// Zodiac sign data
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal', degrees: [0, 30] },
  { name: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed', degrees: [30, 60] },
  { name: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable', degrees: [60, 90] },
  { name: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal', degrees: [90, 120] },
  { name: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed', degrees: [120, 150] },
  { name: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable', degrees: [150, 180] },
  { name: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal', degrees: [180, 210] },
  { name: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed', degrees: [210, 240] },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable', degrees: [240, 270] },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal', degrees: [270, 300] },
  { name: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed', degrees: [300, 330] },
  { name: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable', degrees: [330, 360] },
]

interface ZodiacWheelInteractiveProps {
  selectedDegree?: number
  onDegreeClick?: (degree: number, sign: string) => void
  onAgentChat?: (agentId: string, agentName: string) => void
  size?: number
  showLabels?: boolean
  _highlightElements?: string[]
}

interface DegreeSegmentProps {
  degree: number
  angle: number
  isSelected: boolean
  agent?: any
  onClick: () => void
  size: number
}

const DegreeSegment: React.FC<DegreeSegmentProps> = ({
  /* _degree, */
  angle,
  isSelected,
  agent,
  onClick,
  size,
}) => {
  const radius = size / 2 - 40
  const innerRadius = radius - 25
  const outerRadius = radius + 25

  // Calculate arc path
  const startAngle = (angle - 0.5) * (Math.PI / 180)
  const endAngle = (angle + 0.5) * (Math.PI / 180)

  const x1 = Math.cos(startAngle) * innerRadius
  const y1 = Math.sin(startAngle) * innerRadius
  const x2 = Math.cos(endAngle) * innerRadius
  const y2 = Math.sin(endAngle) * innerRadius
  const x3 = Math.cos(endAngle) * outerRadius
  const y3 = Math.sin(endAngle) * outerRadius
  const x4 = Math.cos(startAngle) * outerRadius
  const y4 = Math.sin(startAngle) * outerRadius

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  const pathData = [
    `M ${x1} ${y1}`,
    `L ${x4} ${y4}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
    `L ${x2} ${y2}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
    'Z',
  ].join(' ')

  // Color based on agent element and strength
  const getSegmentColor = () => {
    if (!agent) return '#374151' // gray-700

    const element = agent.config?.element || 'Spirit'
    const strength = agent.activationStrength || 0

    const baseColors = {
      Fire: '#DC2626', // red-600
      Water: '#2563EB', // blue-600
      Air: '#7C3AED', // violet-600
      Earth: '#16A34A', // green-600
      Spirit: '#F59E0B', // amber-500
    }

    const baseColor = baseColors[element as keyof typeof baseColors] || '#6B7280'
    const opacity = Math.max(0.2, Math.min(1, strength / 100))

    return (
      baseColor +
      Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')
    )
  }

  return (
    <path
      d={pathData}
      fill={isSelected ? '#FCD34D' : getSegmentColor()}
      stroke={isSelected ? '#F59E0B' : '#4B5563'}
      strokeWidth={isSelected ? 2 : 0.5}
      className="cursor-pointer hover:stroke-yellow-400 hover:stroke-2 transition-all duration-200"
      onClick={onClick}
      style={{ transform: `translate(${size / 2}px, ${size / 2}px)` }}
    />
  )
}

const ZodiacSignLabel: React.FC<{
  sign: (typeof ZODIAC_SIGNS)[0]
  centerX: number
  centerY: number
  radius: number
}> = ({ sign, centerX, centerY, radius }) => {
  const angle = ((sign.degrees[0] + sign.degrees[1]) / 2) * (Math.PI / 180)
  const labelRadius = radius + 50
  const x = centerX + Math.cos(angle - Math.PI / 2) * labelRadius
  const y = centerY + Math.sin(angle - Math.PI / 2) * labelRadius

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return <Flame className="w-3 h-3 text-red-400" />
      case 'Water':
        return <Droplets className="w-3 h-3 text-blue-400" />
      case 'Air':
        return <Wind className="w-3 h-3 text-cyan-400" />
      case 'Earth':
        return <Mountain className="w-3 h-3 text-green-400" />
      default:
        return null
    }
  }

  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg font-bold fill-purple-200"
      >
        {sign.symbol}
      </text>
      <text
        x={x}
        y={y + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-purple-400"
      >
        {sign.name}
      </text>
      <foreignObject x={x - 8} y={y + 30} width={16} height={16}>
        {getElementIcon(sign.element)}
      </foreignObject>
    </g>
  )
}

export const ZodiacWheelInteractive: React.FC<ZodiacWheelInteractiveProps> = ({
  selectedDegree,
  onDegreeClick,
  onAgentChat,
  size = 600,
  showLabels = true,
  /* _highlightElements = [], */
}) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const [isPinching, setIsPinching] = useState(false)
  const [hoveredDegree, _setHoveredDegree] = useState<number | null>(null)

  const [degreeData, setDegreeData] = useState<any[]>([])

  // Fetch degree data with agents
  useEffect(() => {
    let mounted = true;
    async function loadAgents() {
      const agentsMap = await fetchAllDegreeAgents();
      if (!mounted) return;
      
      const data: any[] = [];
      for (let degree = 0; degree < 360; degree++) {
        const agent = agentsMap[degree] || null;
        data.push({
          degree,
          agent,
          angle: degree - 90, // Start from top
          sign:
            ZODIAC_SIGNS.find(sign => degree >= sign.degrees[0] && degree < sign.degrees[1])?.name ||
            'Unknown',
        });
      }
      setDegreeData(data);
    }
    void loadAgents();
    return () => { mounted = false; };
  }, []);

  const handleDegreeClick = useCallback(
    (degree: number) => {
      if (onDegreeClick) {
        const sign =
          ZODIAC_SIGNS.find(s => degree >= s.degrees[0] && degree < s.degrees[1])?.name || 'Unknown'
        onDegreeClick(degree, sign)
      }
    },
    [onDegreeClick]
  )

  const handleAgentChat = useCallback(
    (agent: any) => {
      if (onAgentChat && agent) {
        onAgentChat(agent.id, agent.name)
      }
    },
    [onAgentChat]
  )

  // Touch gesture handlers for mobile
  const getTouchDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true)
        setLastTouchDistance(getTouchDistance(e.touches))
      }
    },
    [getTouchDistance]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault() // Prevent scrolling

      if (e.touches.length === 2 && isPinching) {
        const currentDistance = getTouchDistance(e.touches)
        if (lastTouchDistance > 0) {
          const scale = currentDistance / lastTouchDistance
          setZoom(prev => Math.max(0.5, Math.min(2, prev * scale)))
        }
        setLastTouchDistance(currentDistance)
      } else if (e.touches.length === 1 && !isPinching) {
        // Single touch for rotation
        const touch = e.touches[0]
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * (180 / Math.PI)
        setRotation(angle - 90) // Adjust for 12 o'clock start
      }
    },
    [isPinching, lastTouchDistance, getTouchDistance]
  )

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false)
    setLastTouchDistance(0)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
  }, [])

  const selectedAgent =
    selectedDegree !== undefined ? degreeData.find(d => d.degree === selectedDegree)?.agent : null

  const hoveredAgent =
    hoveredDegree !== null ? degreeData.find(d => d.degree === hoveredDegree)?.agent : null

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            disabled={zoom >= 2}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRotation(rotation + 30)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-purple-400">Zoom: {Math.round(zoom * 100)}%</span>
        </div>

        <div className="text-sm text-purple-400">Click any degree to explore planetary agents</div>
      </div>

      <div className="flex gap-6">
        {/* Zodiac Wheel */}
        <Card className="cosmic-glass">
          <CardContent className="p-6">
            <div className="relative">
              <svg
                width={size}
                height={size}
                className="overflow-visible touch-none select-none"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              >
                {/* Outer circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={size / 2 - 20}
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="1"
                  opacity="0.3"
                />

                {/* Degree segments */}
                {degreeData.map(data => (
                  <DegreeSegment
                    key={data.degree}
                    degree={data.degree}
                    angle={data.angle}
                    isSelected={selectedDegree === data.degree}
                    agent={data.agent}
                    onClick={() => handleDegreeClick(data.degree)}
                    size={size}
                  />
                ))}

                {/* Sign labels */}
                {showLabels &&
                  ZODIAC_SIGNS.map(sign => (
                    <ZodiacSignLabel
                      key={sign.name}
                      sign={sign}
                      centerX={size / 2}
                      centerY={size / 2}
                      radius={size / 2 - 40}
                    />
                  ))}

                {/* Center indicator */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={8}
                  fill="#FCD34D"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                <text
                  x={size / 2}
                  y={size / 2 + 25}
                  textAnchor="middle"
                  className="text-xs fill-purple-400"
                >
                  0° Aries
                </text>
              </svg>

              {/* Hover tooltip */}
              {hoveredDegree !== null && hoveredAgent && (
                <div className="absolute top-4 right-4 bg-black/80 border border-purple-500/30 rounded-lg p-3 max-w-xs">
                  <div className="text-sm font-medium text-purple-200">
                    Degree {hoveredDegree}° - {(hoveredAgent).name}
                  </div>
                  <div className="text-xs text-purple-400 mt-1">
                    {(hoveredAgent).description}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Details Panel */}
        <Card className="cosmic-glass w-80">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgent ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-200">
                    {(selectedAgent).agent?.name || (selectedAgent).name}
                  </h3>
                  <p className="text-sm text-purple-400">
                    Degree {selectedDegree}° -{' '}
                    {(selectedAgent).config?.planetaryRuler || 'Unknown Ruler'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-400">Element:</span>
                    <div className="text-purple-200 font-medium">
                      {(selectedAgent).config?.element || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-400">Dignity:</span>
                    <div className="text-purple-200 font-medium">
                      {(selectedAgent).config?.dignity || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-400">Strength:</span>
                    <div className="text-purple-200 font-medium">
                      {(selectedAgent).activationStrength || 0}%
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-400">Consciousness:</span>
                    <div className="text-purple-200 font-medium">
                      {(selectedAgent).consciousnessState?.level || 'Unknown'}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-purple-300">
                  {(selectedAgent).agent?.description || (selectedAgent).description}
                </p>

                <div className="flex gap-2">
                  <Button
                    className="cosmic-button flex-1"
                    onClick={() => handleAgentChat(selectedAgent)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Agent
                  </Button>
                  <Button variant="outline" className="cosmic-button">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-purple-200 mb-2">Select a Degree</h3>
                <p className="text-purple-400 text-sm">
                  Click on any degree in the zodiac wheel to explore the planetary agent activated
                  at that position.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="cosmic-glass">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded" />
              <span className="text-purple-300">Fire Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <span className="text-purple-300">Water Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-violet-600 rounded" />
              <span className="text-purple-300">Air Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded" />
              <span className="text-purple-300">Earth Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-purple-300">Spirit/Unknown</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ZodiacWheelInteractive
