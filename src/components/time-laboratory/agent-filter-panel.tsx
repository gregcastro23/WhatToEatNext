'use client'

import {
  Filter,
  Search,
  X,
  Flame,
  Droplets,
  Wind,
  Mountain,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import React, { useState, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

// Filter options
const ELEMENTS = ['Fire', 'Water', 'Air', 'Earth', 'Spirit']
const DIGNITIES = [
  'domicile',
  'exaltation',
  'triplicity',
  'term',
  'face',
  'detriment',
  'fall',
  'peregrine',
]
const MODALITIES = ['Cardinal', 'Fixed', 'Mutable']
const CONSCIOUSNESS_LEVELS = [
  'Dormant',
  'Awakening',
  'Active',
  'Elevated',
  'Advanced',
  'Illuminated',
  'Transcendent',
]

interface AgentFilterPanelProps {
  onFiltersChange?: (filters: AgentFilters) => void
  agentCount?: number
  filteredCount?: number
}

export interface AgentFilters {
  searchTerm: string
  elements: string[]
  dignities: string[]
  modalities: string[]
  consciousnessLevels: string[]
  minStrength: number
  maxStrength: number
  planetaryRulers: string[]
}

const defaultFilters: AgentFilters = {
  searchTerm: '',
  elements: [],
  dignities: [],
  modalities: [],
  consciousnessLevels: [],
  minStrength: 0,
  maxStrength: 100,
  planetaryRulers: [],
}

export const AgentFilterPanel: React.FC<AgentFilterPanelProps> = ({
  onFiltersChange,
  agentCount = 0,
  filteredCount = 0,
}) => {
  const [filters, setFilters] = useState<AgentFilters>(defaultFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = useCallback(
    (newFilters: Partial<AgentFilters>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      if (onFiltersChange) {
        onFiltersChange(updatedFilters)
      }
    },
    [filters, onFiltersChange]
  )

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
    if (onFiltersChange) {
      onFiltersChange(defaultFilters)
    }
  }, [onFiltersChange])

  const toggleArrayFilter = useCallback(
    (key: keyof AgentFilters, value: string) => {
      const currentArray = filters[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      updateFilters({ [key]: newArray })
    },
    [filters, updateFilters]
  )

  const getActiveFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.elements.length > 0) count++
    if (filters.dignities.length > 0) count++
    if (filters.modalities.length > 0) count++
    if (filters.consciousnessLevels.length > 0) count++
    if (filters.minStrength > 0) count++
    if (filters.maxStrength < 100) count++
    if (filters.planetaryRulers.length > 0) count++
    return count
  }, [filters])

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
        return <Sparkles className="w-3 h-3 text-amber-400" />
    }
  }

  return (
    <Card className="cosmic-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Agent Filters
            {getActiveFilterCount > 0 && (
              <Badge className="cosmic-badge">{getActiveFilterCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount > 0 && (
              <Button size="sm" variant="outline" onClick={clearFilters} className="cosmic-button">
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="cosmic-button"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-purple-400">
          Showing {filteredCount} of {agentCount} agents
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-purple-300 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Agents
          </Label>
          <Input
            placeholder="Search by agent name, description, or planetary ruler..."
            value={filters.searchTerm}
            onChange={e => updateFilters({ searchTerm: e.target.value })}
            className="cosmic-input"
          />
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label className="text-purple-300">Elements</Label>
          <div className="flex flex-wrap gap-2">
            {ELEMENTS.map(element => (
              <Button
                key={element}
                size="sm"
                variant={filters.elements.includes(element) ? 'default' : 'outline'}
                onClick={() => toggleArrayFilter('elements', element)}
                className={`cosmic-button text-xs ${
                  filters.elements.includes(element) ? 'text-white' : 'text-purple-300'
                }`}
              >
                {getElementIcon(element)}
                <span className="ml-1">{element}</span>
              </Button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Strength Range */}
            <div className="space-y-3">
              <Label className="text-purple-300">Activation Strength</Label>
              <div className="space-y-2">
                <Slider
                  value={[filters.minStrength, filters.maxStrength]}
                  onValueChange={([min, max]) =>
                    updateFilters({ minStrength: min, maxStrength: max })
                  }
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-400">
                  <span>{filters.minStrength}%</span>
                  <span>{filters.maxStrength}%</span>
                </div>
              </div>
            </div>

            {/* Dignities */}
            <div className="space-y-3">
              <Label className="text-purple-300">Planetary Dignities</Label>
              <div className="grid grid-cols-2 gap-2">
                {DIGNITIES.map(dignity => (
                  <div key={dignity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dignity-${dignity}`}
                      checked={filters.dignities.includes(dignity)}
                      onCheckedChange={() => toggleArrayFilter('dignities', dignity)}
                    />
                    <Label
                      htmlFor={`dignity-${dignity}`}
                      className="text-sm text-purple-300 capitalize cursor-pointer"
                    >
                      {dignity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Modalities */}
            <div className="space-y-3">
              <Label className="text-purple-300">Sign Modalities</Label>
              <div className="flex flex-wrap gap-2">
                {MODALITIES.map(modality => (
                  <Button
                    key={modality}
                    size="sm"
                    variant={filters.modalities.includes(modality) ? 'default' : 'outline'}
                    onClick={() => toggleArrayFilter('modalities', modality)}
                    className={`cosmic-button text-xs ${
                      filters.modalities.includes(modality) ? 'text-white' : 'text-purple-300'
                    }`}
                  >
                    {modality}
                  </Button>
                ))}
              </div>
            </div>

            {/* Consciousness Levels */}
            <div className="space-y-3">
              <Label className="text-purple-300">Consciousness Levels</Label>
              <Select
                value={
                  filters.consciousnessLevels.length === 1 ? filters.consciousnessLevels[0] : ''
                }
                onValueChange={value =>
                  updateFilters({ consciousnessLevels: value ? [value] : [] })
                }
              >
                <SelectTrigger className="cosmic-select">
                  <SelectValue placeholder="Select consciousness level" />
                </SelectTrigger>
                <SelectContent>
                  {CONSCIOUSNESS_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Planetary Rulers */}
            <div className="space-y-3">
              <Label className="text-purple-300">Planetary Rulers</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Sun',
                  'Moon',
                  'Mercury',
                  'Venus',
                  'Mars',
                  'Jupiter',
                  'Saturn',
                  'Uranus',
                  'Neptune',
                  'Pluto',
                ].map(planet => (
                  <Button
                    key={planet}
                    size="sm"
                    variant={filters.planetaryRulers.includes(planet) ? 'default' : 'outline'}
                    onClick={() => toggleArrayFilter('planetaryRulers', planet)}
                    className={`cosmic-button text-xs ${
                      filters.planetaryRulers.includes(planet) ? 'text-white' : 'text-purple-300'
                    }`}
                  >
                    {planet}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {getActiveFilterCount > 0 && (
          <div className="pt-4 border-t border-purple-500/20">
            <Label className="text-purple-300 mb-2 block">Active Filters:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.searchTerm && (
                <Badge variant="secondary" className="cosmic-badge text-xs">
                  Search: &quot;{filters.searchTerm}&quot;
                  <button
                    onClick={() => updateFilters({ searchTerm: '' })}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.elements.map(element => (
                <Badge key={element} variant="secondary" className="cosmic-badge text-xs">
                  {element}
                  <button
                    onClick={() => toggleArrayFilter('elements', element)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.dignities.map(dignity => (
                <Badge key={dignity} variant="secondary" className="cosmic-badge text-xs">
                  {dignity}
                  <button
                    onClick={() => toggleArrayFilter('dignities', dignity)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.modalities.map(modality => (
                <Badge key={modality} variant="secondary" className="cosmic-badge text-xs">
                  {modality}
                  <button
                    onClick={() => toggleArrayFilter('modalities', modality)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {(filters.minStrength > 0 || filters.maxStrength < 100) && (
                <Badge variant="secondary" className="cosmic-badge text-xs">
                  Strength: {filters.minStrength}-{filters.maxStrength}%
                  <button
                    onClick={() => updateFilters({ minStrength: 0, maxStrength: 100 })}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AgentFilterPanel
