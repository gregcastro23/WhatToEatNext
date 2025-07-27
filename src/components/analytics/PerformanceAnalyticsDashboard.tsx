/**
 * Performance Analytics Dashboard Component
 * 
 * Displays comprehensive performance metrics, caching statistics,
 * and user interaction analytics for recommendation systems
 */

'use client';

import { 
  BarChart3, 
  Clock, 
  Database, 
  TrendingUp, 
  Users, 
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw
} from 'lucide-react';
import React, { useState } from 'react';

import { useRecommendationAnalytics } from '@/hooks/useRecommendationAnalytics';

// ========== INTERFACES ==========

interface PerformanceAnalyticsDashboardProps {
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

// ========== COMPONENTS ==========

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit, 
  trend, 
  icon, 
  color, 
  description 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val < 1) {
        return val.toFixed(3);
      } else if (val < 100) {
        return val.toFixed(1);
      } else {
        return Math.round(val).toString();
      }
    }
    return val;
  };

  const getTrendColor = (trendValue?: number): string => {
    if (!trendValue) return 'text-gray-500';
    return trendValue > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trendValue?: number): string => {
    if (!trendValue) return '';
    return trendValue > 0 ? '↗' : '↘';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {description && (
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info size={16} className="text-gray-400 cursor-help" />
            {showTooltip && (
              <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded p-2 whitespace-nowrap z-10">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </span>
          {unit && (
            <span className="text-sm text-gray-500">{unit}</span>
          )}
          {trend !== undefined && (
            <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const PerformanceChart: React.FC<{ 
  data: number[]; 
  label: string; 
  color: string;
  height?: number;
}> = ({ data, label, color, height = 60 }) => {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded`} style={{ height }}>
        <span className="text-sm text-gray-500">No data available</span>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">
          {data.length} data points
        </span>
      </div>
      <div className={`relative bg-gray-50 rounded overflow-hidden`} style={{ height }}>
        <svg width="100%" height="100%" className="absolute inset-0">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 80 - 10;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========

export const PerformanceAnalyticsDashboard: React.FC<PerformanceAnalyticsDashboardProps> = ({
  className = '',
  compact = false,
  showDetails = true
}) => {
  const [analyticsState, analyticsActions] = useRecommendationAnalytics({
    enablePerformanceTracking: true,
    enableCaching: true,
    enableInteractionTracking: true,
    metricsUpdateInterval: 5000
  });

  const [isExpanded, setIsExpanded] = useState(!compact);
  const [refreshing, setRefreshing] = useState(false);

  const { metrics, cacheStats, performanceTrends, isLoading, error } = analyticsState;

  // ========== EVENT HANDLERS ==========

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Force a metrics update by getting a fresh snapshot
      analyticsActions.getAnalyticsSnapshot();
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for visual feedback
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearAnalytics = () => {
    if (confirm('Are you sure you want to clear all analytics data?')) {
      analyticsActions.clearAnalytics();
    }
  };

  // ========== RENDER HELPERS ==========

  const renderCompactView = () => (
    <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2">
        <Zap size={16} className="text-blue-500" />
        <span className="text-sm font-medium">Performance</span>
      </div>
      
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <Clock size={14} className="text-gray-400" />
          <span>{metrics?.loadTime.toFixed(0) || 0}ms</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Database size={14} className="text-gray-400" />
          <span>{(cacheStats.hitRate * 100).toFixed(0)}%</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <TrendingUp size={14} className="text-gray-400" />
          <span>{performanceTrends.performanceScore.toFixed(0)}</span>
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-auto p-1 hover:bg-gray-100 rounded"
      >
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 size={20} className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleClearAnalytics}
            className="px-3 py-1 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors"
          >
            Clear Data
          </button>
          
          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronUp size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <Info size={16} />
            <span className="font-medium">Analytics Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <RefreshCw size={16} className="animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Load Time"
            value={metrics?.loadTime || 0}
            unit="ms"
            icon={<Clock size={16} className="text-white" />}
            color="bg-blue-500"
            description="Average time to load recommendations"
          />
          
          <MetricCard
            title="Cache Hit Rate"
            value={(cacheStats.hitRate * 100)}
            unit="%"
            icon={<Database size={16} className="text-white" />}
            color="bg-green-500"
            description="Percentage of requests served from cache"
          />
          
          <MetricCard
            title="Performance Score"
            value={performanceTrends.performanceScore}
            unit="/100"
            icon={<TrendingUp size={16} className="text-white" />}
            color="bg-purple-500"
            description="Overall performance rating"
          />
          
          <MetricCard
            title="Interaction Rate"
            value={metrics?.userInteractionRate || 0}
            unit="/min"
            icon={<Users size={16} className="text-white" />}
            color="bg-orange-500"
            description="User interactions per minute"
          />
        </div>
      )}

      {/* Performance Charts */}
      {showDetails && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <PerformanceChart
              data={(performanceTrends as Record<string, unknown>).loadTimeTrend as number[] || []}
              label="Load Time Trend"
              color="#3B82F6"
            />
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <PerformanceChart
              data={(performanceTrends as Record<string, unknown>).cacheHitRateTrend as number[] || []}
              label="Cache Hit Rate Trend"
              color="#10B981"
            />
          </div>
        </div>
      )}

      {/* Cache Statistics */}
      {showDetails && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Cache Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.totalEntries}</div>
              <div className="text-sm text-gray-500">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(cacheStats.memoryUsage / 1024).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Memory (KB)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Hit Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ========== RENDER ==========

  return (
    <div className={`${className}`}>
      {compact && !isExpanded ? renderCompactView() : renderDetailedView()}
    </div>
  );
};

export default PerformanceAnalyticsDashboard;