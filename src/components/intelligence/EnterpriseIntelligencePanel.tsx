/**
 * Enterprise Intelligence Panel Component
 * Main Page Restoration - Task 3.8 Implementation
 * 
 * Displays enterprise intelligence insights, recommendations,
 * and system health information for cuisine recommendations.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  Lightbulb,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  useEnterpriseIntelligence,
  useEnterpriseIntelligenceHealth,
  useEnterpriseIntelligenceRecommendations,
  useEnterpriseIntelligencePerformance
} from '@/hooks/useEnterpriseIntelligence';
import type { ElementalProperties, ZodiacSign, LunarPhase } from '@/types/alchemy';

// ========== INTERFACES ==========

export interface EnterpriseIntelligencePanelProps {
  recipeData?: any;
  ingredientData?: any;
  astrologicalContext?: {
    zodiacSign: ZodiacSign;
    lunarPhase: LunarPhase;
    elementalProperties: ElementalProperties;
    planetaryPositions?: any;
  };
  className?: string;
  showDetailedMetrics?: boolean;
  autoAnalyze?: boolean;
  onAnalysisComplete?: (analysis: any) => void;
}

// ========== COMPONENT ==========

export default function EnterpriseIntelligencePanel({
  recipeData,
  ingredientData,
  astrologicalContext,
  className = '',
  showDetailedMetrics = false,
  autoAnalyze = true,
  onAnalysisComplete
}: EnterpriseIntelligencePanelProps) {
  // ========== STATE ==========
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'health' | 'performance'>('overview');

  // ========== HOOKS ==========
  
  const { state, actions, systemHealth, isHealthy, needsAttention } = useEnterpriseIntelligence({
    autoAnalyze,
    enableRecipeIntelligence: true,
    enableIngredientIntelligence: true,
    enableValidationIntelligence: true,
    enableSafetyIntelligence: true,
    enableOptimizationRecommendations: true,
    cacheResults: true,
    logLevel: 'info'
  });

  const healthStatus = useEnterpriseIntelligenceHealth();
  const { recommendations, hasRecommendations, highPriorityCount } = useEnterpriseIntelligenceRecommendations();
  const performanceStatus = useEnterpriseIntelligencePerformance();

  // ========== EFFECTS ==========
  
  React.useEffect(() => {
    if (autoAnalyze && recipeData && ingredientData && astrologicalContext && !state.isAnalyzing) {
      actions.performAnalysis(recipeData, ingredientData, astrologicalContext)
        .then(analysis => {
          if (analysis && onAnalysisComplete) {
            onAnalysisComplete(analysis);
          }
        });
    }
  }, [recipeData, ingredientData, astrologicalContext, autoAnalyze, state.isAnalyzing, actions, onAnalysisComplete]);

  // ========== MEMOIZED VALUES ==========
  
  const statusIcon = useMemo(() => {
    if (state.isAnalyzing) return <RefreshCw className="animate-spin" size={16} />;
    if (state.error) return <XCircle className="text-red-500" size={16} />;
    if (needsAttention) return <AlertTriangle className="text-yellow-500" size={16} />;
    if (isHealthy) return <CheckCircle className="text-green-500" size={16} />;
    return <Brain className="text-blue-500" size={16} />;
  }, [state.isAnalyzing, state.error, needsAttention, isHealthy]);

  const statusText = useMemo(() => {
    if (state.isAnalyzing) return 'Analyzing...';
    if (state.error) return 'Analysis Error';
    if (needsAttention) return 'Needs Attention';
    if (isHealthy) return 'System Healthy';
    return 'Intelligence Ready';
  }, [state.isAnalyzing, state.error, needsAttention, isHealthy]);

  const statusColor = useMemo(() => {
    if (state.isAnalyzing) return 'text-blue-600';
    if (state.error) return 'text-red-600';
    if (needsAttention) return 'text-yellow-600';
    if (isHealthy) return 'text-green-600';
    return 'text-gray-600';
  }, [state.isAnalyzing, state.error, needsAttention, isHealthy]);

  // ========== EVENT HANDLERS ==========
  
  const handleManualAnalysis = async () => {
    if (recipeData && ingredientData && astrologicalContext) {
      const analysis = await actions.performAnalysis(recipeData, ingredientData, astrologicalContext);
      if (analysis && onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // ========== RENDER HELPERS ==========
  
  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* System Health Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">System Health</h4>
          <div className={`flex items-center space-x-2 ${statusColor}`}>
            {statusIcon}
            <span className="text-sm font-medium">{statusText}</span>
          </div>
        </div>
        
        {state.analysis && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(systemHealth.score * 100)}%
              </div>
              <div className="text-xs text-gray-500">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
              </div>
              <div className="text-xs text-gray-500">Health Status</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {state.analysis && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Brain size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Recipe Intelligence</span>
            </div>
            <div className="mt-1 text-lg font-bold text-blue-600">
              {Math.round(state.analysis.recipeIntelligence.optimizationScore * 100)}%
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-900">Ingredient Intelligence</span>
            </div>
            <div className="mt-1 text-lg font-bold text-green-600">
              {Math.round(state.analysis.ingredientIntelligence.optimizationScore * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-red-800">
            <XCircle size={16} />
            <span className="font-medium">Analysis Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{state.error}</p>
          <button
            onClick={handleManualAnalysis}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Retry Analysis
          </button>
        </div>
      )}
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="space-y-4">
      {hasRecommendations ? (
        <>
          {highPriorityCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle size={16} />
                <span className="font-medium">{highPriorityCount} High Priority Recommendations</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Lightbulb size={16} className={`mt-0.5 ${
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {rec.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{rec.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {recommendations.length > 5 && (
            <div className="text-center">
              <span className="text-sm text-gray-500">
                +{recommendations.length - 5} more recommendations
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Lightbulb size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recommendations available</p>
          <p className="text-xs">Run analysis to generate recommendations</p>
        </div>
      )}
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-4">
      {state.analysis ? (
        <>
          {/* Validation Health */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Validation Intelligence</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Data Integrity</span>
                <span className="text-sm font-medium">
                  {Math.round(state.analysis.validationIntelligence.dataIntegrity.score * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Astrological Consistency</span>
                <span className="text-sm font-medium">
                  {Math.round(state.analysis.validationIntelligence.astrologicalConsistency.score * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Elemental Harmony</span>
                <span className="text-sm font-medium">
                  {Math.round(state.analysis.validationIntelligence.elementalHarmony.score * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Safety Intelligence */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Safety Intelligence</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Level</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                state.analysis.safetyIntelligence.riskAssessment.level === 'low' ? 'bg-green-100 text-green-700' :
                state.analysis.safetyIntelligence.riskAssessment.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {state.analysis.safetyIntelligence.riskAssessment.level.toUpperCase()}
              </span>
            </div>
            {state.analysis.safetyIntelligence.riskAssessment.factors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Risk Factors:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {state.analysis.safetyIntelligence.riskAssessment.factors.map((factor, index) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Issues and Warnings */}
          {(systemHealth.issues.length > 0 || systemHealth.warnings.length > 0) && (
            <div className="space-y-2">
              {systemHealth.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h5 className="font-medium text-red-800 mb-2">Issues</h5>
                  <ul className="text-sm text-red-600 space-y-1">
                    {systemHealth.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {systemHealth.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h5 className="font-medium text-yellow-800 mb-2">Warnings</h5>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    {systemHealth.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Shield size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No health data available</p>
          <p className="text-xs">Run analysis to check system health</p>
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {state.performanceMetrics.analysisCount}
            </div>
            <div className="text-xs text-gray-500">Total Analyses</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Math.round(state.performanceMetrics.averageExecutionTime)}ms
            </div>
            <div className="text-xs text-gray-500">Avg Response Time</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.round(state.performanceMetrics.cacheHitRate * 100)}%
            </div>
            <div className="text-xs text-gray-500">Cache Hit Rate</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {Math.round(state.performanceMetrics.errorRate * 100)}%
            </div>
            <div className="text-xs text-gray-500">Error Rate</div>
          </div>
        </div>
      </div>

      {showDetailedMetrics && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Performance Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Performance</span>
              <span className={`text-sm font-medium ${
                performanceStatus.isPerformant ? 'text-green-600' : 'text-red-600'
              }`}>
                {performanceStatus.isPerformant ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cache Efficiency</span>
              <span className="text-sm font-medium">
                {Math.round(performanceStatus.cacheEfficiency * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reliability</span>
              <span className="text-sm font-medium">
                {Math.round(performanceStatus.reliability * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ========== RENDER ==========
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Brain className="text-blue-600" size={20} />
          <div>
            <h3 className="font-medium text-gray-900">Enterprise Intelligence</h3>
            <p className="text-xs text-gray-500">Recipe & Ingredient Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {state.lastAnalyzed && (
            <span className="text-xs text-gray-400">
              {state.lastAnalyzed.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={handleManualAnalysis}
            disabled={state.isAnalyzing}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Refresh Analysis"
          >
            <RefreshCw size={16} className={state.isAnalyzing ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleToggleExpanded}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'health', label: 'Health', icon: Shield },
              { id: 'performance', label: 'Performance', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'recommendations' && renderRecommendationsTab()}
            {activeTab === 'health' && renderHealthTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
          </div>
        </div>
      )}
    </div>
  );
}