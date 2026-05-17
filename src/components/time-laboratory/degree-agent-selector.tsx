'use client'

import { Target, Search, ArrowRight, Zap, Star, Sparkles } from 'lucide-react'
import React, { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

// Zodiac sign data
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal', startDegree: 0 },
  { name: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed', startDegree: 30 },
  { name: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable', startDegree: 60 },
  { name: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal', startDegree: 90 },
  { name: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed', startDegree: 120 },
  { name: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable', startDegree: 150 },
  { name: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal', startDegree: 180 },
  { name: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed', startDegree: 210 },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable', startDegree: 240 },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal', startDegree: 270 },
  { name: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed', startDegree: 300 },
  { name: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable', startDegree: 330 },
]

// Notable degrees and their significance
const NOTABLE_DEGREES = [
  { degree: 0, name: 'Aries Point', significance: 'World events, fame, notoriety' },
  { degree: 1, name: 'Aries Degree 1', significance: 'Leadership, pioneering spirit' },
  { degree: 15, name: 'Mid-Aries', significance: 'Balanced Aries energy' },
  { degree: 29, name: 'Anaretic Aries', significance: 'Critical, karmic completion' },
  { degree: 30, name: 'Taurus Point', significance: 'Material manifestation' },
  { degree: 60, name: 'Gemini Point', significance: 'Communication, duality' },
  { degree: 90, name: 'Cancer Point', significance: 'Emotional foundation' },
  { degree: 120, name: 'Leo Point', significance: 'Creative self-expression' },
  { degree: 150, name: 'Virgo Point', significance: 'Service, perfectionism' },
  { degree: 180, name: 'Libra Point', significance: 'Balance, partnerships' },
  { degree: 210, name: 'Scorpio Point', significance: 'Transformation, power' },
  { degree: 240, name: 'Sagittarius Point', significance: 'Philosophy, expansion' },
  { degree: 270, name: 'Capricorn Point', significance: 'Authority, structure' },
  { degree: 300, name: 'Aquarius Point', significance: 'Innovation, community' },
  { degree: 330, name: 'Pisces Point', significance: 'Spirituality, dissolution' },
]

interface DegreeAgentSelectorProps {
  selectedDegree?: number
  onDegreeChange?: (degree: number) => void
  onAgentChat?: (agentId: string, agentName: string) => void
}

export const DegreeAgentSelector: React.FC<DegreeAgentSelectorProps> = ({
  selectedDegree,
  onDegreeChange,
  onAgentChat: _onAgentChat,
}) => {
  const [inputDegree, setInputDegree] = useState(selectedDegree?.toString() || '0')
  const [sliderDegree, setSliderDegree] = useState(selectedDegree || 0)

  const handleDegreeSubmit = useCallback(
    (degree: number) => {
      const normalizedDegree = Math.max(0, Math.min(359, degree))
      setInputDegree(normalizedDegree.toString())
      setSliderDegree(normalizedDegree)
      if (onDegreeChange) {
        onDegreeChange(normalizedDegree)
      }
    },
    [onDegreeChange]
  )

  const handleInputSubmit = useCallback(() => {
    const degree = parseInt(inputDegree, 10)
    if (!isNaN(degree)) {
      handleDegreeSubmit(degree)
    }
  }, [inputDegree, handleDegreeSubmit])

  const handleSliderChange = useCallback(
    (value: number[]) => {
      const degree = value[0]
      setSliderDegree(degree)
      setInputDegree(degree.toString())
      if (onDegreeChange) {
        onDegreeChange(degree)
      }
    },
    [onDegreeChange]
  )

  const getSignForDegree = (degree: number) => {
    return ZODIAC_SIGNS.find(sign => degree >= sign.startDegree && degree < sign.startDegree + 30)
  }

  const getDegreeWithinSign = (degree: number) => {
    const sign = getSignForDegree(degree)
    return sign ? degree - sign.startDegree : degree
  }

  const currentSign = getSignForDegree(sliderDegree)
  const degreeWithinSign = getDegreeWithinSign(sliderDegree)

  return (
    <div className="space-y-4">
      {/* Degree Input */}
      <Card className="cosmic-glass">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Degree Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Numeric Input */}
          <div className="flex items-center gap-2">
            <Label htmlFor="degree-input" className="text-purple-300 min-w-fit">
              Degree (0-359):
            </Label>
            <Input
              id="degree-input"
              type="number"
              min="0"
              max="359"
              value={inputDegree}
              onChange={e => setInputDegree(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleInputSubmit()}
              className="cosmic-input max-w-24"
            />
            <Button size="sm" onClick={handleInputSubmit} className="cosmic-button">
              <Search className="w-4 h-4 mr-1" />
              Go
            </Button>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <Label className="text-purple-300">Degree Slider:</Label>
            <Slider
              value={[sliderDegree]}
              onValueChange={handleSliderChange}
              max={359}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-400">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>359°</span>
            </div>
          </div>

          {/* Current Position Display */}
          <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentSign?.symbol || '♈'}</div>
              <div>
                <div className="text-lg font-semibold text-purple-200">
                  {currentSign?.name || 'Aries'} {degreeWithinSign}°
                </div>
                <div className="text-sm text-purple-400">Degree {sliderDegree} of 360</div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="cosmic-badge">{currentSign?.element || 'Fire'}</Badge>
              <div className="text-xs text-purple-400 mt-1">
                {currentSign?.modality || 'Cardinal'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Degree Presets */}
      <Card className="cosmic-glass">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Degree Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {ZODIAC_SIGNS.map(sign => (
              <Button
                key={sign.name}
                variant="outline"
                size="sm"
                onClick={() => handleDegreeSubmit(sign.startDegree)}
                className={`cosmic-button text-xs ${
                  selectedDegree !== undefined &&
                  selectedDegree >= sign.startDegree &&
                  selectedDegree < sign.startDegree + 30
                    ? 'border-gold bg-gold/20'
                    : ''
                }`}
              >
                {sign.symbol} {sign.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notable Degrees */}
      <Card className="cosmic-glass">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Notable Degrees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {NOTABLE_DEGREES.map(notable => (
              <Button
                key={notable.degree}
                variant="ghost"
                size="sm"
                onClick={() => handleDegreeSubmit(notable.degree)}
                className={`w-full justify-start text-left cosmic-button ${
                  selectedDegree === notable.degree ? 'border-gold bg-gold/20' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium text-purple-200">
                      {notable.degree}° - {notable.name}
                    </div>
                    <div className="text-xs text-purple-400">{notable.significance}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Degree Analysis */}
      {selectedDegree !== undefined && (
        <Card className="cosmic-glass">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Degree Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-400">Sign Position:</span>
                <div className="text-purple-200 font-medium">
                  {currentSign?.name} {degreeWithinSign}°
                </div>
              </div>
              <div>
                <span className="text-purple-400">Element:</span>
                <div className="text-purple-200 font-medium">{currentSign?.element}</div>
              </div>
              <div>
                <span className="text-purple-400">Modality:</span>
                <div className="text-purple-200 font-medium">{currentSign?.modality}</div>
              </div>
              <div>
                <span className="text-purple-400">Decan:</span>
                <div className="text-purple-200 font-medium">
                  {Math.floor(degreeWithinSign / 10) + 1}st Decan
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-purple-500/20">
              <p className="text-sm text-purple-300">
                <strong>Interpretation:</strong> Degrees represent specific qualities and planetary
                influences. The {degreeWithinSign}° position in {currentSign?.name} carries the
                essence of {currentSign?.element.toLowerCase()} energy with{' '}
                {currentSign?.modality.toLowerCase()} qualities. Click on the zodiac wheel above to
                explore the planetary agent activated at this degree.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DegreeAgentSelector
