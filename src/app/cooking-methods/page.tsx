'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { 
  Search, 
 
  Flame, 
  Droplets, 
  Mountain, 
  Wind, 
  Sparkles,
  Clock,
  Zap,
  Globe,
  BookOpen,
  Target
} from 'lucide-react';

import { CookingMethodsSection } from '@/components/CookingMethodsSection';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { calculateMethodScore } from '@/utils/cookingMethodRecommender';

interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  culturalOrigin?: string;
  variations?: CookingMethod[];
  elementalEffect?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
}

export default function CookingMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<CookingMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<CookingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [elementFilter, setElementFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'duration'>('score');
  const [elementDominanceFilter, setElementDominanceFilter] = useState<string>('all');
  const [alchemicalPropertiesFilter, setAlchemicalPropertiesFilter] = useState<string>('all');
  // const [showSidebar, setShowSidebar] = useState(false);

  const { astroState } = useAstrologicalState();

  useEffect(() => {
    // Convert cooking methods data to the format expected by the component
    const convertedMethods: CookingMethod[] = Object.entries(cookingMethods).map(([key, methodData]) => {
      const data = methodData as any;
      
      // Calculate a score based on alchemical properties and elemental effects
      const spirit = data.alchemicalProperties?.Spirit || 0.5;
      const essence = data.alchemicalProperties?.Essence || 0.5;
      const matter = data.alchemicalProperties?.Matter || 0.5;
      const substance = data.alchemicalProperties?.Substance || 0.5;
      
      const fire = data.elementalEffect?.Fire || 0.25;
      const water = data.elementalEffect?.Water || 0.25;
      const earth = data.elementalEffect?.Earth || 0.25;
      const air = data.elementalEffect?.Air || 0.25;
      
      // Calculate score based on alchemical balance and elemental harmony
      const alchemicalBalance = (spirit + essence + matter + substance) / 4;
      const elementalHarmony = Math.max(fire, water, earth, air);
      const score = (alchemicalBalance * 0.6) + (elementalHarmony * 0.4);
      
      return {
        id: key,
        name: data.name || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: data.description || `A cooking method that transforms ingredients through ${key.replace(/_/g, ' ')}.`,
        score: Math.min(1.0, Math.max(0.3, score)),
        elementalEffect: data.elementalEffect || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        duration: data.duration || {
          min: 10,
          max: 60
        },
        suitable_for: data.suitable_for || ['various ingredients'],
        benefits: data.benefits || ['cooking'],
        alchemicalProperties: data.alchemicalProperties || {
          Spirit: 0.5,
          Essence: 0.5,
          Matter: 0.5,
          Substance: 0.5
        }
      };
    });

    // Sort methods by score initially
    const sortedMethods = convertedMethods.sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return scoreB - scoreA;
    });

    setMethods(sortedMethods);
    setFilteredMethods(sortedMethods);
  }, []);

  // Filter and sort methods based on current filters
  useEffect(() => {
    let filtered = [...methods];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.suitable_for?.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply element filter
    if (elementFilter !== 'all') {
      filtered = filtered.filter(method => {
        const elemental = method.elementalEffect;
        if (!elemental) return false;
        
        const elementValue = elemental[elementFilter as keyof typeof elemental] || 0;
        return elementValue > 0.4; // Show methods that significantly use this element
      });
    }

    // Apply duration filter
    if (durationFilter !== 'all') {
      filtered = filtered.filter(method => {
        const duration = method.duration;
        if (!duration) return false;
        
        const avgDuration = (duration.min + duration.max) / 2;
        
        switch (durationFilter) {
          case 'quick':
            return avgDuration <= 15;
          case 'medium':
            return avgDuration > 15 && avgDuration <= 60;
          case 'slow':
            return avgDuration > 60;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          return scoreB - scoreA;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          const durationA = a.duration ? (a.duration.min + a.duration.max) / 2 : 0;
          const durationB = b.duration ? (b.duration.min + b.duration.max) / 2 : 0;
          return durationA - durationB;
        default:
          return 0;
      }
    });

    setFilteredMethods(filtered);
  }, [methods, searchTerm, elementFilter, durationFilter, sortBy]);

  const handleMethodSelect = (method: CookingMethod) => {
    setSelectedMethod(method);
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame size={16} />;
      case 'Water': return <Droplets size={16} />;
      case 'Earth': return <Mountain size={16} />;
      case 'Air': return <Wind size={16} />;
      default: return null;
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'text-red-600';
      case 'Water': return 'text-blue-600';
      case 'Earth': return 'text-green-600';
      case 'Air': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            <Sparkles className="inline-block mr-2" />
            Alchemical Cooking Methods
          </h1>
          <p className="text-lg text-indigo-600 max-w-3xl mx-auto">
            Discover the art of culinary transformation through elemental cooking techniques. 
            Each method has unique alchemical properties that enhance flavors and create 
            harmonious dishes aligned with cosmic energies.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search methods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Element Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Zap className="inline-block mr-1" size={16} />
                Element
              </label>
              <select
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Elements</option>
                <option value="Fire">Fire</option>
                <option value="Water">Water</option>
                <option value="Earth">Earth</option>
                <option value="Air">Air</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline-block mr-1" size={16} />
                Duration
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Durations</option>
                <option value="quick">Quick (≤15 min)</option>
                <option value="medium">Medium (15-60 min)</option>
                <option value="slow">Slow (&gt;60 min)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline-block mr-1" size={16} />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'duration')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="score">Alchemical Score</option>
                <option value="name">Name</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredMethods.length} of {methods.length} cooking methods
              {searchTerm && ` matching "${searchTerm}"`}
              {elementFilter !== 'all' && ` with dominant ${elementFilter} element`}
              {durationFilter !== 'all' && ` (${durationFilter} duration)`}
            </p>
          </div>
        </div>

        {/* Use the CookingMethodsSection component */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Use the CookingMethodsSection component */}
          <div className="lg:col-span-2">
            <CookingMethodsSection 
              methods={filteredMethods}
              onSelectMethod={handleMethodSelect}
              selectedMethodId={selectedMethod?.id || null}
            />
          </div>

          {/* Method Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <Globe className="inline-block mr-2" size={20} />
                Method Details
              </h2>
              
              {selectedMethod ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedMethod.name}</h3>
                    <p className="text-gray-600">{selectedMethod.description}</p>
                  </div>
                  
                  {/* Alchemical Score */}
                  {selectedMethod.score && (
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Alchemical Score</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {Math.round(selectedMethod.score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${selectedMethod.score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Elemental Effects */}
                  {selectedMethod.elementalEffect && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Elemental Effects</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedMethod.elementalEffect).map(([element, value]) => (
                          <div key={element} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getElementIcon(element)}
                              <span className="text-sm font-medium text-gray-700">{element}</span>
                            </div>
                            <span className={`text-sm font-medium ${getElementColor(element)}`}>
                              {Math.round(value * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Alchemical Properties */}
                  {selectedMethod.alchemicalProperties && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Alchemical Properties</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedMethod.alchemicalProperties).map(([property, value]) => (
                          <div key={property} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{property}</span>
                            <span className="text-sm font-medium text-indigo-600">
                              {Math.round(value * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Duration */}
                  {selectedMethod.duration && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Duration</h4>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedMethod.duration.min}-{selectedMethod.duration.max} minutes
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Suitable For */}
                  {selectedMethod.suitable_for && selectedMethod.suitable_for.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ideal For</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMethod.suitable_for.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Benefits */}
                  {selectedMethod.benefits && selectedMethod.benefits.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMethod.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Method</h3>
                  <p className="text-gray-600">Choose a cooking method from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 