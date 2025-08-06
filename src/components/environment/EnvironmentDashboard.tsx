'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Server, 
  Database, 
  Globe, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Code,
  Bug,
  Zap
} from 'lucide-react';
import { useDebugSettings } from '@/hooks/useDebugSettings';
import { ConfigurationService } from '@/services/ConfigurationService';

interface EnvironmentInfo {
  nodeEnv: string;
  isDevelopment: boolean;
  buildTime: string;
  version: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

interface PerformanceMetrics {
  memoryUsage: number;
  loadTime: number;
  networkStatus: 'online' | 'offline';
  connectionType: string;
  lastUpdate: number;
}

interface APIEndpoints {
  baseUrl: string;
  status: 'active' | 'inactive' | 'unknown';
  lastCheck: number;
  responseTime: number;
}

export default function EnvironmentDashboard() {
  const { settings, resetSettings, toggleVisibility } = useDebugSettings();
  const [environment, setEnvironment] = useState<EnvironmentInfo>({
    nodeEnv: 'development',
    isDevelopment: true,
    buildTime: new Date().toISOString(),
    version: '1.0.0',
    userAgent: '',
    screenResolution: '',
    timezone: '',
    language: ''
  });

  const [performance, setPerformance] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    networkStatus: 'online',
    connectionType: 'unknown',
    lastUpdate: Date.now()
  });

  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoints>({
    baseUrl: '',
    status: 'unknown',
    lastCheck: 0,
    responseTime: 0
  });

  const [configHealth, setConfigHealth] = useState<{
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    lastUpdate: number | null;
  }>({
    status: 'healthy',
    issues: [],
    lastUpdate: null
  });

  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    // Initialize environment information
    const initializeEnvironment = () => {
      const isDev = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      setEnvironment({
        nodeEnv: isDev ? 'development' : 'production',
        isDevelopment: isDev,
        buildTime: new Date().toISOString(),
        version: '1.0.0',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        screenResolution: typeof window !== 'undefined' ? 
          `${window.screen.width}x${window.screen.height}` : 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: typeof navigator !== 'undefined' ? navigator.language : 'en-US'
      });
    };

    // Initialize performance metrics
    const initializePerformance = () => {
      const navigationTiming = typeof window !== 'undefined' && window.performance ? 
        window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming : null;
      const loadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;
      
      setPerformance({
        memoryUsage: typeof window !== 'undefined' && (window.performance as any).memory ? 
          Math.round((window.performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
        loadTime: Math.round(loadTime),
        networkStatus: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
        connectionType: typeof navigator !== 'undefined' && (navigator as any).connection ? 
          (navigator as any).connection.effectiveType : 'unknown',
        lastUpdate: Date.now()
      });
    };

    // Initialize API endpoints
    const initializeAPI = () => {
      const config = ConfigurationService.getConfiguration();
      setApiEndpoints({
        baseUrl: config.api.baseUrl,
        status: 'unknown',
        lastCheck: 0,
        responseTime: 0
      });
    };

    // Initialize configuration health
    const initializeConfigHealth = () => {
      const health = ConfigurationService.getHealthStatus();
      setConfigHealth(health);
    };

    initializeEnvironment();
    initializePerformance();
    initializeAPI();
    initializeConfigHealth();

    // Set up periodic updates
    const interval = setInterval(() => {
      initializePerformance();
      initializeConfigHealth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkAPIHealth = async () => {
    const startTime = Date.now();
    try {
      // In a real app, this would ping the actual API
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
      
      setApiEndpoints(prev => ({
        ...prev,
        status: 'active',
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime
      }));
    } catch (error) {
      setApiEndpoints(prev => ({
        ...prev,
        status: 'inactive',
        lastCheck: Date.now(),
        responseTime: -1
      }));
    }
  };

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    
    // Update configuration service
    ConfigurationService.updateConfiguration('debug', 'debug', newDebugMode);
  };

  const clearCache = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('app-') || key.startsWith('debug-') || key.startsWith('configuration-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage
      sessionStorage.clear();
      
      console.log('Application cache cleared');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'online':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'inactive':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'online':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
      case 'inactive':
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="w-6 h-6" />
          Environment Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            {showAdvancedInfo ? 'Hide' : 'Show'} Advanced
          </button>
          <button
            onClick={clearCache}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Clear Cache
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Environment Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Environment
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className={`font-medium ${environment.isDevelopment ? 'text-yellow-600' : 'text-green-600'}`}>
                {environment.nodeEnv}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-mono">{environment.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timezone:</span>
              <span>{environment.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Language:</span>
              <span>{environment.language}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memory Usage:</span>
              <span className="font-medium">{performance.memoryUsage}MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Load Time:</span>
              <span className="font-medium">{performance.loadTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Network:</span>
              <span className={`font-medium flex items-center gap-1 ${getStatusColor(performance.networkStatus)}`}>
                {getStatusIcon(performance.networkStatus)}
                {performance.networkStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connection:</span>
              <span className="font-mono text-xs">{performance.connectionType}</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Server className="w-5 h-5" />
            API Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium flex items-center gap-1 ${getStatusColor(apiEndpoints.status)}`}>
                {getStatusIcon(apiEndpoints.status)}
                {apiEndpoints.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base URL:</span>
              <span className="font-mono text-xs truncate">{apiEndpoints.baseUrl || 'Not set'}</span>
            </div>
            {apiEndpoints.responseTime > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">{apiEndpoints.responseTime}ms</span>
              </div>
            )}
            <button
              onClick={checkAPIHealth}
              className="w-full mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              Check API Health
            </button>
          </div>
        </div>

        {/* Debug Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Debug Mode</span>
              <button
                onClick={toggleDebugMode}
                className={`w-10 h-6 rounded-full transition-colors ${
                  debugMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    debugMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Debug Panel</span>
              <button
                onClick={toggleVisibility}
                className={`w-10 h-6 rounded-full transition-colors ${
                  settings.isVisible ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    settings.isVisible ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={resetSettings}
              className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Reset Debug Settings
            </button>
          </div>
        </div>

        {/* Configuration Health */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Health:</span>
              <span className={`font-medium flex items-center gap-1 ${getStatusColor(configHealth.status)}`}>
                {getStatusIcon(configHealth.status)}
                {configHealth.status}
              </span>
            </div>
            {configHealth.issues.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-600">Issues:</span>
                <ul className="mt-1 text-xs text-red-600">
                  {configHealth.issues.slice(0, 2).map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                  {configHealth.issues.length > 2 && (
                    <li>• +{configHealth.issues.length - 2} more...</li>
                  )}
                </ul>
              </div>
            )}
            {configHealth.lastUpdate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Update:</span>
                <span className="text-xs">
                  {new Date(configHealth.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* System Resources */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Screen:</span>
              <span className="font-mono text-xs">{environment.screenResolution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build Time:</span>
              <span className="text-xs">
                {new Date(environment.buildTime).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Perf Update:</span>
              <span className="text-xs">
                {new Date(performance.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Information */}
      {showAdvancedInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Advanced Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">User Agent</h4>
              <p className="text-xs font-mono text-gray-600 break-all">
                {environment.userAgent}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Debug Settings</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Position: {settings.position}</div>
                <div>Opacity: {Math.round(settings.opacity * 100)}%</div>
                <div>Size: {settings.size}</div>
                <div>Performance Metrics: {settings.showPerformanceMetrics ? 'On' : 'Off'}</div>
                <div>Astrological Data: {settings.showAstrologicalData ? 'On' : 'Off'}</div>
                <div>Component States: {settings.showComponentStates ? 'On' : 'Off'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Mode Alert */}
      {debugMode && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Bug className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Debug Mode Active</p>
              <p className="text-sm text-yellow-700 mt-1">
                Debug mode is enabled. Additional logging, debugging information, and development tools are active. 
                This may impact performance and should be disabled in production.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}