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
  AlertCircle,
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
    debug: config.debug,
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
    version: '1.0.0',
  });

  useEffect(() => {
    // Load environment information
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    setEnvironment({
      nodeEnv: isDev ? 'development' : 'production',
      apiBaseUrl: configState.api.baseUrl,
      isDevelopment: isDev,
      buildTime: new Date().toISOString(),
      version: '1.0.0',
    });
  }, [configState.api.baseUrl]);

  const handleApiChange = (key: keyof ConfigState['api'], value: string | number) => {
    setConfigState(prev => ({
      ...prev,
      api: {
        ...prev.api,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleAstrologyChange = (key: keyof ConfigState['astrology'], value: any) => {
    setConfigState(prev => ({
      ...prev,
      astrology: {
        ...prev.astrology,
        [key]: value,
      },
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
          [aspect]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleDebugToggle = () => {
    setConfigState(prev => ({
      ...prev,
      debug: !prev.debug,
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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

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
    reader.onload = e => {
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
      debug: config.debug,
    });
    setHasChanges(false);
  };

  return (
    <div className='rounded-lg bg-white p-6 shadow-lg'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-2xl font-bold'>
          <Settings className='h-6 w-6' />
          Configuration Management
        </h2>
        <div className='flex items-center gap-2'>
          <label className='flex cursor-pointer items-center gap-2 rounded bg-gray-100 px-3 py-1 hover:bg-gray-200'>
            <Upload className='h-4 w-4' />
            Import
            <input type='file' accept='.json' onChange={importConfiguration} className='hidden' />
          </label>
          <button
            onClick={exportConfiguration}
            className='flex items-center gap-2 rounded bg-gray-100 px-3 py-1 hover:bg-gray-200'
          >
            <Download className='h-4 w-4' />
            Export
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className='mb-6 flex gap-2 border-b'>
        <button
          onClick={() => setActiveSection('api')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'api'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          API Settings
        </button>
        <button
          onClick={() => setActiveSection('astrology')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'astrology'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Astrology Settings
        </button>
        <button
          onClick={() => setActiveSection('environment')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'environment'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Environment
        </button>
      </div>

      {/* API Settings Section */}
      {activeSection === 'api' && (
        <div className='space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-medium'>
              <Link className='mr-1 inline h-4 w-4' />
              API Base URL
            </label>
            <input
              type='text'
              value={configState.api.baseUrl}
              onChange={e => handleApiChange('baseUrl', e.target.value)}
              className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
              placeholder='https://api.example.com'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                <Clock className='mr-1 inline h-4 w-4' />
                Update Interval (minutes)
              </label>
              <input
                type='number'
                value={configState.api.celestialUpdateInterval / 60000}
                onChange={e =>
                  handleApiChange('celestialUpdateInterval', parseInt(e.target.value) * 60000)
                }
                className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
                min='1'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                <Clock className='mr-1 inline h-4 w-4' />
                Timeout (seconds)
              </label>
              <input
                type='number'
                value={configState.api.timeout / 1000}
                onChange={e => handleApiChange('timeout', parseInt(e.target.value) * 1000)}
                className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
                min='1'
              />
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              <RefreshCw className='mr-1 inline h-4 w-4' />
              Retry Count
            </label>
            <input
              type='number'
              value={configState.api.retryCount}
              onChange={e => handleApiChange('retryCount', parseInt(e.target.value))}
              className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
              min='0'
              max='10'
            />
          </div>
        </div>
      )}

      {/* Astrology Settings Section */}
      {activeSection === 'astrology' && (
        <div className='space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-medium'>
              <Globe className='mr-1 inline h-4 w-4' />
              Default Timezone
            </label>
            <select
              value={configState.astrology.defaultTimezoneName}
              onChange={e => handleAstrologyChange('defaultTimezoneName', e.target.value)}
              className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
            >
              <option value='UTC'>UTC</option>
              <option value='America/New_York'>Eastern Time</option>
              <option value='America/Chicago'>Central Time</option>
              <option value='America/Denver'>Mountain Time</option>
              <option value='America/Los_Angeles'>Pacific Time</option>
              <option value='Europe/London'>London</option>
              <option value='Europe/Paris'>Paris</option>
              <option value='Asia/Tokyo'>Tokyo</option>
            </select>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              <Activity className='mr-1 inline h-4 w-4' />
              Retrograde Threshold (degrees/day)
            </label>
            <input
              type='number'
              value={configState.astrology.retrogradeThreshold}
              onChange={e =>
                handleAstrologyChange('retrogradeThreshold', parseFloat(e.target.value))
              }
              className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
              step='0.1'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Planet speeds below this value are considered retrograde
            </p>
          </div>

          <div>
            <h3 className='mb-3 text-sm font-medium'>
              <Compass className='mr-1 inline h-4 w-4' />
              Aspect Orbs (degrees)
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              {Object.entries(configState.astrology.aspectOrbs).map(([aspect, orb]) => (
                <div key={aspect} className='flex items-center justify-between'>
                  <label className='text-sm capitalize'>{aspect}:</label>
                  <input
                    type='number'
                    value={orb}
                    onChange={e => handleAspectOrbChange(aspect, parseFloat(e.target.value))}
                    className='w-20 rounded border px-2 py-1 focus:ring-2 focus:ring-blue-500'
                    step='0.5'
                    min='0'
                    max='15'
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Environment Section */}
      {activeSection === 'environment' && (
        <div className='space-y-6'>
          <div className='rounded-lg bg-gray-50 p-4'>
            <h3 className='mb-3 font-medium'>Environment Information</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Environment:</span>
                <span
                  className={`font-medium ${environment.isDevelopment ? 'text-yellow-600' : 'text-green-600'}`}
                >
                  {environment.nodeEnv}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>API Base URL:</span>
                <span className='font-mono text-xs'>{environment.apiBaseUrl}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Build Time:</span>
                <span>{new Date(environment.buildTime).toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Version:</span>
                <span>{environment.version}</span>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between rounded-lg bg-gray-50 p-4'>
            <div>
              <label className='font-medium'>Debug Mode</label>
              <p className='text-sm text-gray-600'>Enable detailed logging and debug panels</p>
            </div>
            <button
              onClick={handleDebugToggle}
              className={`h-6 w-12 rounded-full transition-colors ${
                configState.debug ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`h-5 w-5 transform rounded-full bg-white transition-transform ${
                  configState.debug ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {configState.debug && (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='mt-0.5 h-5 w-5 text-yellow-600' />
                <div>
                  <p className='font-medium text-yellow-900'>Debug Mode Active</p>
                  <p className='mt-1 text-sm text-yellow-700'>
                    Debug mode is enabled. Additional logging and diagnostic information will be
                    displayed throughout the application.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className='mt-8 flex items-center justify-between border-t pt-6'>
        <button
          onClick={resetToDefaults}
          className='rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100'
        >
          Reset to Defaults
        </button>
        <button
          onClick={saveConfiguration}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
            hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          <Save className='h-4 w-4' />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
