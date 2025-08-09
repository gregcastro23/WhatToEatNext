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
  Zap,
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
    language: '',
  });

  const [performance, setPerformance] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    networkStatus: 'online',
    connectionType: 'unknown',
    lastUpdate: Date.now(),
  });

  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoints>({
    baseUrl: '',
    status: 'unknown',
    lastCheck: 0,
    responseTime: 0,
  });

  const [configHealth, setConfigHealth] = useState<{
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    lastUpdate: number | null;
  }>({
    status: 'healthy',
    issues: [],
    lastUpdate: null,
  });

  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    // Initialize environment information
    const initializeEnvironment = () => {
      const isDev =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      setEnvironment({
        nodeEnv: isDev ? 'development' : 'production',
        isDevelopment: isDev,
        buildTime: new Date().toISOString(),
        version: '1.0.0',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        screenResolution:
          typeof window !== 'undefined'
            ? `${window.screen.width}x${window.screen.height}`
            : 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      });
    };

    // Initialize performance metrics
    const initializePerformance = () => {
      const navigationTiming =
        typeof window !== 'undefined' && window.performance
          ? (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)
          : null;
      const loadTime = navigationTiming
        ? navigationTiming.loadEventEnd - navigationTiming.fetchStart
        : 0;

      setPerformance({
        memoryUsage:
          typeof window !== 'undefined' && (window.performance as any).memory
            ? Math.round((window.performance as any).memory.usedJSHeapSize / 1024 / 1024)
            : 0,
        loadTime: Math.round(loadTime),
        networkStatus: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
        connectionType:
          typeof navigator !== 'undefined' && (navigator as any).connection
            ? (navigator as any).connection.effectiveType
            : 'unknown',
        lastUpdate: Date.now(),
      });
    };

    // Initialize API endpoints
    const initializeAPI = () => {
      const config = ConfigurationService.getConfiguration();
      setApiEndpoints({
        baseUrl: config.api.baseUrl,
        status: 'unknown',
        lastCheck: 0,
        responseTime: 0,
      });
    };

    // Initialize configuration health
    const initializeConfigHealth = () => {
      const health = ConfigurationService.getHealthStatus();
      setConfigHealth(health);
    };

    void initializeEnvironment();
    void initializePerformance();
    void initializeAPI();
    void initializeConfigHealth();

    // Set up periodic updates
    const interval = setInterval(() => {
      void initializePerformance();
      void initializeConfigHealth();
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
        responseTime: Date.now() - startTime,
      }));
    } catch (error) {
      setApiEndpoints(prev => ({
        ...prev,
        status: 'inactive',
        lastCheck: Date.now(),
        responseTime: -1,
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
        if (
          key.startsWith('app-') ||
          key.startsWith('debug-') ||
          key.startsWith('configuration-')
        ) {
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
        return <CheckCircle className='h-4 w-4' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4' />;
      case 'error':
      case 'inactive':
      case 'offline':
        return <AlertTriangle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  return (
    <div className='rounded-lg bg-white p-6 shadow-lg'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-2xl font-bold'>
          <Monitor className='h-6 w-6' />
          Environment Dashboard
        </h2>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
            className='rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200'
          >
            {showAdvancedInfo ? 'Hide' : 'Show'} Advanced
          </button>
          <button
            onClick={clearCache}
            className='rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200'
          >
            Clear Cache
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Environment Information */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Globe className='h-5 w-5' />
            Environment
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Mode:</span>
              <span
                className={`font-medium ${environment.isDevelopment ? 'text-yellow-600' : 'text-green-600'}`}
              >
                {environment.nodeEnv}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Version:</span>
              <span className='font-mono'>{environment.version}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Timezone:</span>
              <span>{environment.timezone}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Language:</span>
              <span>{environment.language}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Activity className='h-5 w-5' />
            Performance
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Memory Usage:</span>
              <span className='font-medium'>{performance.memoryUsage}MB</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Load Time:</span>
              <span className='font-medium'>{performance.loadTime}ms</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Network:</span>
              <span
                className={`flex items-center gap-1 font-medium ${getStatusColor(performance.networkStatus)}`}
              >
                {getStatusIcon(performance.networkStatus)}
                {performance.networkStatus}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Connection:</span>
              <span className='font-mono text-xs'>{performance.connectionType}</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Server className='h-5 w-5' />
            API Status
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Status:</span>
              <span
                className={`flex items-center gap-1 font-medium ${getStatusColor(apiEndpoints.status)}`}
              >
                {getStatusIcon(apiEndpoints.status)}
                {apiEndpoints.status}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Base URL:</span>
              <span className='truncate font-mono text-xs'>
                {apiEndpoints.baseUrl || 'Not set'}
              </span>
            </div>
            {apiEndpoints.responseTime > 0 && (
              <div className='flex justify-between'>
                <span className='text-gray-600'>Response Time:</span>
                <span className='font-medium'>{apiEndpoints.responseTime}ms</span>
              </div>
            )}
            <button
              onClick={checkAPIHealth}
              className='mt-2 w-full rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200'
            >
              Check API Health
            </button>
          </div>
        </div>

        {/* Debug Settings */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Bug className='h-5 w-5' />
            Debug Settings
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Debug Mode</span>
              <button
                onClick={toggleDebugMode}
                className={`h-6 w-10 rounded-full transition-colors ${
                  debugMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`h-4 w-4 transform rounded-full bg-white transition-transform ${
                    debugMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Debug Panel</span>
              <button
                onClick={toggleVisibility}
                className={`h-6 w-10 rounded-full transition-colors ${
                  settings.isVisible ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isVisible ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={resetSettings}
              className='w-full rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300'
            >
              Reset Debug Settings
            </button>
          </div>
        </div>

        {/* Configuration Health */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Database className='h-5 w-5' />
            Configuration
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Health:</span>
              <span
                className={`flex items-center gap-1 font-medium ${getStatusColor(configHealth.status)}`}
              >
                {getStatusIcon(configHealth.status)}
                {configHealth.status}
              </span>
            </div>
            {configHealth.issues.length > 0 && (
              <div className='mt-2'>
                <span className='text-gray-600'>Issues:</span>
                <ul className='mt-1 text-xs text-red-600'>
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
              <div className='flex justify-between'>
                <span className='text-gray-600'>Last Update:</span>
                <span className='text-xs'>
                  {new Date(configHealth.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* System Resources */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Zap className='h-5 w-5' />
            System
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Screen:</span>
              <span className='font-mono text-xs'>{environment.screenResolution}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Build Time:</span>
              <span className='text-xs'>
                {new Date(environment.buildTime).toLocaleDateString()}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Last Perf Update:</span>
              <span className='text-xs'>
                {new Date(performance.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Information */}
      {showAdvancedInfo && (
        <div className='mt-6 rounded-lg bg-gray-50 p-4'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Code className='h-5 w-5' />
            Advanced Information
          </h3>
          <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
            <div>
              <h4 className='mb-2 font-medium'>User Agent</h4>
              <p className='break-all font-mono text-xs text-gray-600'>{environment.userAgent}</p>
            </div>
            <div>
              <h4 className='mb-2 font-medium'>Debug Settings</h4>
              <div className='space-y-1 text-xs text-gray-600'>
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
        <div className='mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <div className='flex items-start gap-2'>
            <Bug className='mt-0.5 h-5 w-5 text-yellow-600' />
            <div>
              <p className='font-medium text-yellow-900'>Debug Mode Active</p>
              <p className='mt-1 text-sm text-yellow-700'>
                Debug mode is enabled. Additional logging, debugging information, and development
                tools are active. This may impact performance and should be disabled in production.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
