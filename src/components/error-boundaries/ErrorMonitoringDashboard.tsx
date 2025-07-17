'use client';

import React, { useState, useEffect } from 'react';
import { useErrorLogger, ErrorLogEntry, ErrorRecoveryMetrics } from './ErrorLogger';
import { useErrorRecovery } from './ErrorRecoverySystem';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Activity,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface ErrorMonitoringDashboardProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  compact?: boolean;
}

/**
 * Error Monitoring Dashboard Component
 * Provides real-time error monitoring and recovery status
 */
export function ErrorMonitoringDashboard({ 
  isVisible = true, 
  onToggleVisibility,
  compact = false 
}: ErrorMonitoringDashboardProps) {
  const { errorLog, getMetrics, clearErrorLog, getRecentErrors } = useErrorLogger();
  const { isRecovering, manualRecovery } = useErrorRecovery();
  const [selectedError, setSelectedError] = useState<ErrorLogEntry | null>(null);
  const [metrics, setMetrics] = useState<ErrorRecoveryMetrics | null>(null);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getMetrics]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-50"
        title="Show Error Monitor"
      >
        <Eye className="h-4 w-4" />
      </button>
    );
  }

  const recentErrors = getRecentErrors(30); // Last 30 minutes
  const criticalErrors = errorLog.filter(entry => entry.severity === 'critical' && !entry.resolved);

  if (compact) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm z-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Error Monitor</h4>
          <button
            onClick={onToggleVisibility}
            className="text-gray-400 hover:text-gray-600"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
        
        {metrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total Errors:</span>
              <span className="font-medium">{metrics.totalErrors}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Resolved:</span>
              <span className="font-medium text-green-600">{metrics.resolvedErrors}</span>
            </div>
            {criticalErrors.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-600">Critical:</span>
                <span className="font-medium text-red-600">{criticalErrors.length}</span>
              </div>
            )}
          </div>
        )}
        
        {isRecovering && (
          <div className="mt-2 flex items-center text-xs text-blue-600">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Recovering...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Error Monitor</h3>
          </div>
          <div className="flex items-center space-x-2">
            {errorLog.length > 0 && (
              <button
                onClick={clearErrorLog}
                className="text-gray-400 hover:text-gray-600"
                title="Clear Error Log"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onToggleVisibility}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="font-medium">{metrics.totalErrors}</div>
                <div className="text-xs text-gray-500">Total Errors</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">{metrics.resolvedErrors}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>
          </div>
          
          {metrics.errorRate > 0 && (
            <div className="mt-2 flex items-center text-xs">
              {metrics.errorRate > 1 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className="text-gray-600">
                {metrics.errorRate.toFixed(1)} errors/min
              </span>
            </div>
          )}
        </div>
      )}

      {/* Critical Errors Alert */}
      {criticalErrors.length > 0 && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-800">
              {criticalErrors.length} critical error{criticalErrors.length !== 1 ? 's' : ''} need attention
            </span>
          </div>
        </div>
      )}

      {/* Recovery Status */}
      {isRecovering && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-sm text-blue-800">Recovery in progress...</span>
          </div>
        </div>
      )}

      {/* Error List */}
      <div className="flex-1 overflow-y-auto max-h-48">
        {recentErrors.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No recent errors</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentErrors.slice(0, 10).map((error) => (
              <div
                key={error.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  selectedError?.id === error.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        error.resolved ? 'bg-green-500' : 
                        error.severity === 'critical' ? 'bg-red-500' :
                        error.severity === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {error.componentName || error.context}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {error.error.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {!error.resolved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        manualRecovery(error.id);
                      }}
                      className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                      title="Retry Recovery"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                {selectedError?.id === error.id && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-20">
                      {error.error.stack || error.error.message}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorMonitoringDashboard;