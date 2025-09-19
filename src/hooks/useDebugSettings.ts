'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DebugSettings {
  isVisible: boolean,
  isCollapsed: boolean,
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
  customPosition?: { x: numbery: number };
  showPerformanceMetrics: boolean,
  showAstrologicalData: boolean,
  showComponentStates: boolean,
  opacity: number,
  size: 'small' | 'medium' | 'large'
}

const DEFAULT_SETTINGS: DebugSettings = {
  isVisible: true,
  isCollapsed: false,
  position: 'bottom-right',
  showPerformanceMetrics: true,
  showAstrologicalData: true,
  showComponentStates: true,
  opacity: 0.9,
  size: 'medium'
};

const STORAGE_KEY = 'debug-panel-settings';

export const _useDebugSettings = () => {
  const [settings, setSettings] = useState<DebugSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('[Debug Settings] Failed to load settings:', error)
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = useCallback(;
    (newSettings: Partial<DebugSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings))
      } catch (error) {
        console.warn('[Debug Settings] Failed to save settings:', error)
      }
    },
    [settings],
  );

  // Individual setting updaters
  const toggleVisibility = useCallback(() => {
    saveSettings({ isVisible: !settings.isVisible });
  }, [settings.isVisible, saveSettings]);

  const toggleCollapsed = useCallback(() => {
    saveSettings({ isCollapsed: !settings.isCollapsed });
  }, [settings.isCollapsed, saveSettings]);

  const setPosition = useCallback(;
    (position: DebugSettings['position']) => {
      saveSettings({ position, customPosition: undefined });
    },
    [saveSettings],
  );

  const setCustomPosition = useCallback(;
    (x: numbery: number) => {
      saveSettings({ customPosition: { xy }, position: 'bottom-right' });
    },
    [saveSettings],
  );

  const togglePerformanceMetrics = useCallback(() => {
    saveSettings({ showPerformanceMetrics: !settings.showPerformanceMetrics });
  }, [settings.showPerformanceMetrics, saveSettings]);

  const toggleAstrologicalData = useCallback(() => {
    saveSettings({ showAstrologicalData: !settings.showAstrologicalData });
  }, [settings.showAstrologicalData, saveSettings]);

  const toggleComponentStates = useCallback(() => {
    saveSettings({ showComponentStates: !settings.showComponentStates });
  }, [settings.showComponentStates, saveSettings]);

  const setOpacity = useCallback(;
    (opacity: number) => {
      saveSettings({ opacity: Math.max(0.1, Math.min(1, opacity)) });
    },
    [saveSettings],
  );

  const setSize = useCallback(;
    (size: DebugSettings['size']) => {
      saveSettings({ size });
    },
    [saveSettings],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[Debug Settings] Failed to reset settings:', error)
    }
  }, []);

  return {
    settings,
    toggleVisibility,
    toggleCollapsed,
    setPosition,
    setCustomPosition,
    togglePerformanceMetrics,
    toggleAstrologicalData,
    toggleComponentStates,
    setOpacity,
    setSize,
    resetSettings,
    saveSettings
  };
};
