'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Clock, 
  RefreshCw, 
  Link,
  Compass,
  Activity,
  Download,
  Upload,
  Save,
  AlertCircle
} from 'lucide-react';
import { config } from '@/config';

interface ConfigState {
  api: {
    celestialUpdateInterval: number;
    timeout: number;
    retryCount: number;
    baseUrl: string;
  };
  astrology: {
    defaultTimezoneName: string;
    retrogradeThreshold: number;
    aspectOrbs: Record<string, number>;
  };
  debug: boolean;
}

export default function ConfigurationPanel() {
  const [configState, setConfigState] = useState<ConfigState>({
    api: { ...config.api },
    astrology: { ...config.astrology },
    debug: config.debug
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'api' | 'astrology' | 'environment'>('api');

  // Environment information
  const [environment, setEnvironment] = useState({
    nodeEnv: 'development',
    apiBaseUrl: '',
    isDevelopment: true,
    buildTime: new Date().toISOString(),
    version: '1.0.0'
  });

  useEffect(() => {
    // Load environment information
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    setEnvironment({
      nodeEnv: isDev ? 'development' : 'production',
      apiBaseUrl: configState.api.baseUrl,
      isDevelopment: isDev,
      buildTime: new Date().toISOString(),
      version: '1.0.0'
    });
  }, [configState.api.baseUrl]);

  const handleApiChange = (key: keyof ConfigState['api'], value: string | number) => {
    setConfigState(prev => ({
      ...prev,
      api: {
        ...prev.api,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleAstrologyChange = (key: keyof ConfigState['astrology'], value: any) => {
    setConfigState(prev => ({
      ...prev,
      astrology: {
        ...prev.astrology,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleAspectOrbChange = (aspect: string, value: number) => {
    setConfigState(prev => ({
      ...prev,
      astrology: {
        ...prev.astrology,
        aspectOrbs: {
          ...prev.astrology.aspectOrbs,
          [aspect]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleDebugToggle = () => {
    setConfigState(prev => ({
      ...prev,
      debug: !prev.debug
    }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('app-configuration', JSON.stringify(configState));
      
      // In a real app, this would update the global config
      Object.assign(config, configState);
      
      setHasChanges(false);
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(configState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as ConfigState;
        setConfigState(imported);
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import configuration:', error);
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = () => {
    setConfigState({
      api: { ...config.api },
      astrology: { ...config.astrology },
      debug: config.debug
    });
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Configuration Management
        </h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importConfiguration}
              className="hidden"
            />
          </label>
          <button
            onClick={exportConfiguration}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveSection('api')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'api'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          API Settings
        </button>
        <button
          onClick={() => setActiveSection('astrology')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'astrology'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Astrology Settings
        </button>
        <button
          onClick={() => setActiveSection('environment')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'environment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Environment
        </button>
      </div>

      {/* API Settings Section */}
      {activeSection === 'api' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              API Base URL
            </label>
            <input
              type="text"
              value={configState.api.baseUrl}
              onChange={(e) => handleApiChange('baseUrl', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Update Interval (minutes)
              </label>
              <input
                type="number"
                value={configState.api.celestialUpdateInterval / 60000}
                onChange={(e) => handleApiChange('celestialUpdateInterval', parseInt(e.target.value) * 60000)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={configState.api.timeout / 1000}
                onChange={(e) => handleApiChange('timeout', parseInt(e.target.value) * 1000)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Retry Count
            </label>
            <input
              type="number"
              value={configState.api.retryCount}
              onChange={(e) => handleApiChange('retryCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              max="10"
            />
          </div>
        </div>
      )}

      {/* Astrology Settings Section */}
      {activeSection === 'astrology' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Default Timezone
            </label>
            <select
              value={configState.astrology.defaultTimezoneName}
              onChange={(e) => handleAstrologyChange('defaultTimezoneName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Activity className="w-4 h-4 inline mr-1" />
              Retrograde Threshold (degrees/day)
            </label>
            <input
              type="number"
              value={configState.astrology.retrogradeThreshold}
              onChange={(e) => handleAstrologyChange('retrogradeThreshold', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Planet speeds below this value are considered retrograde
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">
              <Compass className="w-4 h-4 inline mr-1" />
              Aspect Orbs (degrees)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(configState.astrology.aspectOrbs).map(([aspect, orb]) => (
                <div key={aspect} className="flex items-center justify-between">
                  <label className="text-sm capitalize">{aspect}:</label>
                  <input
                    type="number"
                    value={orb}
                    onChange={(e) => handleAspectOrbChange(aspect, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                    step="0.5"
                    min="0"
                    max="15"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Environment Section */}
      {activeSection === 'environment' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Environment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className={`font-medium ${environment.isDevelopment ? 'text-yellow-600' : 'text-green-600'}`}>
                  {environment.nodeEnv}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Base URL:</span>
                <span className="font-mono text-xs">{environment.apiBaseUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build Time:</span>
                <span>{new Date(environment.buildTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span>{environment.version}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium">Debug Mode</label>
              <p className="text-sm text-gray-600">Enable detailed logging and debug panels</p>
            </div>
            <button
              onClick={handleDebugToggle}
              className={`w-12 h-6 rounded-full transition-colors ${
                configState.debug ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  configState.debug ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {configState.debug && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Debug Mode Active</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Debug mode is enabled. Additional logging and diagnostic information will be displayed throughout the application.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={saveConfiguration}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}