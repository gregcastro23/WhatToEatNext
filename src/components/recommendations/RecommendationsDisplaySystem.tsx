'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Star,
  ChefHat,
  Utensils,
  Globe,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader,
  BarChart3,
  PieChart,
  Activity,
  Zap,
} from 'lucide-react';

// Interfaces for unused state variables that need activation
interface RecommendationItem {
  id: string;
  name: string;
  type: 'ingredient' | 'method' | 'cuisine';
  score: number;
  confidence: number;
  astrological_influence: string;
  elemental_properties: Record<string, number>;
  modality?: string;
  tags?: string[];
}

interface RecommendationsState {
  topIngredients: RecommendationItem[];
  topMethods: RecommendationItem[];
  topCuisines: RecommendationItem[];
  dominantElement: string;
  dominantAlchemicalProperty: string;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
}

interface TransformationData {
  transformedIngredients: RecommendationItem[];
  transformedMethods: RecommendationItem[];
  transformedCuisines: RecommendationItem[];
}

interface LoadingStates {
  recommendations: boolean;
  transformations: boolean;
  error: Error | null;
}

interface FilterStates {
  elementFilter: string;
  modalityFilter: string;
  scoreThreshold: number;
  showDetails: boolean;
  sortBy: 'score' | 'confidence' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface RecommendationsDisplaySystemProps {
  // Props to receive data from parent components
  initialRecommendations?: RecommendationsState;
  onRecommendationSelect?: (item: RecommendationItem) => void;
  enableLiveUpdates?: boolean;
  showAdvancedMetrics?: boolean;
}

export default function RecommendationsDisplaySystem({
  initialRecommendations,
  onRecommendationSelect,
  enableLiveUpdates = true,
  showAdvancedMetrics = false,
}: RecommendationsDisplaySystemProps) {
  // Activate unused state variables by creating comprehensive state management
  const [recommendations, setRecommendations] = useState<RecommendationsState>({
    topIngredients: [],
    topMethods: [],
    topCuisines: [],
    dominantElement: 'Fire',
    dominantAlchemicalProperty: 'Spirit',
    heat: 0.5,
    entropy: 0.5,
    reactivity: 0.5,
    gregsEnergy: 0.5,
  });

  const [transformationData, setTransformationData] = useState<TransformationData>({
    transformedIngredients: [],
    transformedMethods: [],
    transformedCuisines: [],
  });

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    recommendations: true,
    transformations: false,
    error: null,
  });

  const [filterStates, setFilterStates] = useState<FilterStates>({
    elementFilter: 'all',
    modalityFilter: 'all',
    scoreThreshold: 0.5,
    showDetails: false,
    sortBy: 'score',
    sortOrder: 'desc',
  });

  const [activeDisplayMode, setActiveDisplayMode] = useState<'grid' | 'list' | 'chart'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<'ingredients' | 'methods' | 'cuisines'>(
    'ingredients',
  );
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Initialize with provided recommendations or generate sample data
  useEffect(() => {
    if (initialRecommendations) {
      setRecommendations(initialRecommendations);
      setLoadingStates(prev => ({ ...prev, recommendations: false }));
    } else {
      // Generate sample recommendation data to activate unused variables
      generateSampleRecommendations();
    }
  }, [initialRecommendations]);

  const generateSampleRecommendations = async () => {
    setLoadingStates(prev => ({ ...prev, recommendations: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const sampleIngredients: RecommendationItem[] = [
        {
          id: 'ing-1',
          name: 'Rosemary',
          type: 'ingredient',
          score: 0.95,
          confidence: 0.87,
          astrological_influence: 'Mars in Aries',
          elemental_properties: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0.0 },
          modality: 'Cardinal',
          tags: ['herb', 'warming', 'protective'],
        },
        {
          id: 'ing-2',
          name: 'Sea Salt',
          type: 'ingredient',
          score: 0.92,
          confidence: 0.93,
          astrological_influence: 'Moon in Cancer',
          elemental_properties: { Water: 0.5, Earth: 0.4, Air: 0.1, Fire: 0.0 },
          modality: 'Fixed',
          tags: ['mineral', 'purifying', 'grounding'],
        },
        {
          id: 'ing-3',
          name: 'Ginger',
          type: 'ingredient',
          score: 0.89,
          confidence: 0.84,
          astrological_influence: 'Sun in Leo',
          elemental_properties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0.0 },
          modality: 'Mutable',
          tags: ['root', 'warming', 'digestive'],
        },
      ];

      const sampleMethods: RecommendationItem[] = [
        {
          id: 'method-1',
          name: 'Slow Roasting',
          type: 'method',
          score: 0.91,
          confidence: 0.88,
          astrological_influence: 'Saturn in Capricorn',
          elemental_properties: { Earth: 0.5, Fire: 0.4, Air: 0.1, Water: 0.0 },
          modality: 'Cardinal',
          tags: ['transformation', 'patience', 'depth'],
        },
        {
          id: 'method-2',
          name: 'Steam Cooking',
          type: 'method',
          score: 0.86,
          confidence: 0.91,
          astrological_influence: 'Neptune in Pisces',
          elemental_properties: { Water: 0.6, Fire: 0.2, Air: 0.2, Earth: 0.0 },
          modality: 'Mutable',
          tags: ['gentle', 'preserving', 'cleansing'],
        },
      ];

      const sampleCuisines: RecommendationItem[] = [
        {
          id: 'cuisine-1',
          name: 'Mediterranean',
          type: 'cuisine',
          score: 0.94,
          confidence: 0.89,
          astrological_influence: 'Venus in Libra',
          elemental_properties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
          modality: 'Cardinal',
          tags: ['balanced', 'harmonious', 'solar'],
        },
      ];

      setRecommendations({
        topIngredients: sampleIngredients,
        topMethods: sampleMethods,
        topCuisines: sampleCuisines,
        dominantElement: 'Fire',
        dominantAlchemicalProperty: 'Spirit',
        heat: Math.random() * 1.0,
        entropy: Math.random() * 1.0,
        reactivity: Math.random() * 1.0,
        gregsEnergy: Math.random() * 1.0,
      });

      // Generate transformation data
      setTransformationData({
        transformedIngredients: sampleIngredients.map(item => ({
          ...item,
          id: `transformed-${item.id}`,
          score: item.score * 0.85, // Simulate transformation effect
          confidence: Math.min(item.confidence * 1.1, 1.0),
        })),
        transformedMethods: sampleMethods,
        transformedCuisines: sampleCuisines,
      });

      setSuccessNotification('Recommendations loaded successfully!');
      setTimeout(() => setSuccessNotification(null), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load recommendations';
      setLoadingStates(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));
      setErrorNotification(errorMessage);
      setTimeout(() => setErrorNotification(null), 5000);
    } finally {
      setLoadingStates(prev => ({ ...prev, recommendations: false }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await generateSampleRecommendations();
    setIsRefreshing(false);
  };

  const getCurrentData = () => {
    switch (selectedCategory) {
      case 'ingredients':
        return recommendations.topIngredients;
      case 'methods':
        return recommendations.topMethods;
      case 'cuisines':
        return recommendations.topCuisines;
      default:
        return [];
    }
  };

  const _getTransformedData = () => {
    switch (selectedCategory) {
      case 'ingredients':
        return transformationData.transformedIngredients;
      case 'methods':
        return transformationData.transformedMethods;
      case 'cuisines':
        return transformationData.transformedCuisines;
      default:
        return [];
    }
  };

  const filteredData = getCurrentData()
    .filter(item => {
      if (filterStates.elementFilter !== 'all') {
        const dominantElement = Object.entries(item.elemental_properties).reduce((a, b) =>
          a[1] > b[1] ? a : b,
        )[0];
        if (dominantElement !== filterStates.elementFilter) return false;
      }
      if (filterStates.modalityFilter !== 'all' && item.modality !== filterStates.modalityFilter) {
        return false;
      }
      if (item.score < filterStates.scoreThreshold) return false;
      return true;
    })
    .sort((a, b) => {
      const factor = filterStates.sortOrder === 'asc' ? 1 : -1;
      switch (filterStates.sortBy) {
        case 'score':
          return (a.score - b.score) * factor;
        case 'confidence':
          return (a.confidence - b.confidence) * factor;
        case 'name':
          return a.name.localeCompare(b.name) * factor;
        default:
          return 0;
      }
    });

  const renderNotifications = () => (
    <div className='fixed right-4 top-4 z-50 space-y-2'>
      {successNotification && (
        <div className='flex items-center gap-2 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700'>
          <CheckCircle className='h-4 w-4' />
          {successNotification}
        </div>
      )}
      {errorNotification && (
        <div className='flex items-center gap-2 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
          <AlertCircle className='h-4 w-4' />
          {errorNotification}
        </div>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {filteredData.map(item => (
        <div
          key={item.id}
          className='cursor-pointer rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg'
          onClick={() => onRecommendationSelect?.(item)}
        >
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{item.name}</h3>
            <div className='flex items-center gap-1'>
              <Star className='h-4 w-4 text-yellow-500' />
              <span className='text-sm font-medium'>{item.score.toFixed(2)}</span>
            </div>
          </div>

          <div className='mb-3 text-sm text-gray-600'>
            <p>Confidence: {(item.confidence * 100).toFixed(0)}%</p>
            <p>Influence: {item.astrological_influence}</p>
            {item.modality && <p>Modality: {item.modality}</p>}
          </div>

          {filterStates.showDetails && (
            <>
              <div className='mb-3'>
                <h4 className='mb-1 text-xs font-medium text-gray-700'>Elemental Properties:</h4>
                <div className='grid grid-cols-2 gap-1 text-xs'>
                  {Object.entries(item.elemental_properties).map(([element, value]) => (
                    <div key={element} className='flex justify-between'>
                      <span>{element}:</span>
                      <span>{(value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-700'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className='space-y-2'>
      {filteredData.map(item => (
        <div
          key={item.id}
          className='flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
          onClick={() => onRecommendationSelect?.(item)}
        >
          <div className='flex items-center gap-4'>
            <div className='flex-shrink-0'>
              {selectedCategory === 'ingredients' && <ChefHat className='h-6 w-6 text-green-600' />}
              {selectedCategory === 'methods' && <Utensils className='h-6 w-6 text-blue-600' />}
              {selectedCategory === 'cuisines' && <Globe className='h-6 w-6 text-purple-600' />}
            </div>
            <div>
              <h3 className='font-medium'>{item.name}</h3>
              <p className='text-sm text-gray-600'>{item.astrological_influence}</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <div className='font-medium'>{item.score.toFixed(2)}</div>
              <div className='text-sm text-gray-500'>{(item.confidence * 100).toFixed(0)}%</div>
            </div>
            <Star className='h-5 w-5 text-yellow-500' />
          </div>
        </div>
      ))}
    </div>
  );

  const renderChartView = () => (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      <h3 className='mb-4 flex items-center gap-2 font-semibold'>
        <BarChart3 className='h-5 w-5' />
        Recommendation Scores
      </h3>
      <div className='space-y-4'>
        {filteredData.map(item => (
          <div key={item.id} className='flex items-center gap-4'>
            <div className='w-24 truncate text-sm font-medium'>{item.name}</div>
            <div className='flex-1'>
              <div className='h-2 rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-blue-500'
                  style={{ width: `${item.score * 100}%` }}
                />
              </div>
            </div>
            <div className='w-16 text-right text-sm'>{item.score.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loadingStates.recommendations) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <Loader className='mx-auto mb-4 h-8 w-8 animate-spin' />
          <p className='text-gray-600'>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (loadingStates.error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
        <AlertCircle className='mx-auto mb-4 h-8 w-8 text-red-600' />
        <h3 className='mb-2 font-semibold text-red-900'>Error Loading Recommendations</h3>
        <p className='mb-4 text-red-700'>{loadingStates.error.message}</p>
        <button
          onClick={handleRefresh}
          className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className='recommendations-display-system'>
      {renderNotifications()}

      {/* Header Controls */}
      <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='flex items-center gap-2 text-xl font-bold'>
            <TrendingUp className='h-6 w-6' />
            Recommendations Display System
          </h2>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200 disabled:opacity-50'
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setFilterStates(prev => ({ ...prev, showDetails: !prev.showDetails }))}
              className='flex items-center gap-2 rounded bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200'
            >
              {filterStates.showDetails ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
              {filterStates.showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className='mt-4 flex gap-2'>
          {(['ingredients', 'methods', 'cuisines'] as const).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 font-medium capitalize ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Mode Selection */}
        <div className='mt-4 flex gap-2'>
          {(['grid', 'list', 'chart'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveDisplayMode(mode)}
              className={`rounded px-3 py-2 font-medium capitalize ${
                activeDisplayMode === mode
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Metrics Panel */}
      {showAdvancedMetrics && (
        <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Activity className='h-5 w-5' />
            Advanced Metrics
          </h3>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {recommendations.heat.toFixed(2)}
              </div>
              <div className='text-sm text-gray-600'>Heat</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {recommendations.entropy.toFixed(2)}
              </div>
              <div className='text-sm text-gray-600'>Entropy</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {recommendations.reactivity.toFixed(2)}
              </div>
              <div className='text-sm text-gray-600'>Reactivity</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {recommendations.gregsEnergy.toFixed(2)}
              </div>
              <div className='text-sm text-gray-600'>Greg's Energy</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Element Filter</label>
            <select
              value={filterStates.elementFilter}
              onChange={e => setFilterStates(prev => ({ ...prev, elementFilter: e.target.value }))}
              className='w-full rounded border p-2'
            >
              <option value='all'>All Elements</option>
              <option value='Fire'>Fire</option>
              <option value='Water'>Water</option>
              <option value='Earth'>Earth</option>
              <option value='Air'>Air</option>
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>Modality Filter</label>
            <select
              value={filterStates.modalityFilter}
              onChange={e => setFilterStates(prev => ({ ...prev, modalityFilter: e.target.value }))}
              className='w-full rounded border p-2'
            >
              <option value='all'>All Modalities</option>
              <option value='Cardinal'>Cardinal</option>
              <option value='Fixed'>Fixed</option>
              <option value='Mutable'>Mutable</option>
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>Score Threshold</label>
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={filterStates.scoreThreshold}
              onChange={e =>
                setFilterStates(prev => ({ ...prev, scoreThreshold: parseFloat(e.target.value) }))
              }
              className='w-full'
            />
            <div className='mt-1 text-xs text-gray-500'>
              {filterStates.scoreThreshold.toFixed(1)}
            </div>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>Sort By</label>
            <select
              value={`${filterStates.sortBy}-${filterStates.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  typeof filterStates.sortBy,
                  typeof filterStates.sortOrder,
                ];
                setFilterStates(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className='w-full rounded border p-2'
            >
              <option value='score-desc'>Score (High to Low)</option>
              <option value='score-asc'>Score (Low to High)</option>
              <option value='confidence-desc'>Confidence (High to Low)</option>
              <option value='confidence-asc'>Confidence (Low to High)</option>
              <option value='name-asc'>Name (A to Z)</option>
              <option value='name-desc'>Name (Z to A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Display */}
      <div className='mb-6'>
        {filteredData.length === 0 ? (
          <div className='rounded-lg bg-gray-50 p-8 text-center'>
            <Filter className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-semibold text-gray-700'>No Results Found</h3>
            <p className='text-gray-600'>Try adjusting your filters to see more recommendations.</p>
          </div>
        ) : (
          <>
            {activeDisplayMode === 'grid' && renderGridView()}
            {activeDisplayMode === 'list' && renderListView()}
            {activeDisplayMode === 'chart' && renderChartView()}
          </>
        )}
      </div>

      {/* Summary Statistics */}
      <div className='rounded-lg bg-gray-50 p-4'>
        <div className='flex items-center justify-between text-sm text-gray-600'>
          <span>
            Showing {filteredData.length} of {getCurrentData().length} {selectedCategory}
          </span>
          <span>
            Dominant Element: {recommendations.dominantElement} | Property:{' '}
            {recommendations.dominantAlchemicalProperty}
          </span>
        </div>
      </div>
    </div>
  );
}
