'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { stateManager } from '@/utils/stateManager';
import { themeManager } from '@/utils/theme';
import { logger } from '@/utils/logger';
import { 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Palette,
  Eye,
  Bell,
  Clock,
  ChefHat,
  Filter,
  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: SettingsSection[] = [
  { id: 'appearance', label: 'Appearance', icon: Eye },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Cooking Preferences', icon: ChefHat },
  { id: 'dietary', label: 'Dietary Settings', icon: Filter },
];

export default function Settings() {
  const { state, dispatch } = useAlchemical();
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState({
    appearance: {
      theme: 'system',
      colorScheme: 'default',
      fontSize: 16,
      animations: true,
    },
    notifications: {
      recipes: true,
      celestial: true,
      updates: true,
      cooking: true,
    },
    preferences: {
      defaultServings: 2,
      measurementSystem: 'metric',
      maxPrepTime: 60,
      complexity: 'moderate',
    },
    dietary: {
      restrictions: [] as string[],
      allergies: [] as string[],
      preferences: [] as string[],
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = stateManager.getState().user.preferences;
      const themeSettings = themeManager.getTheme();

      setSettings(prev => ({
        ...prev,
        appearance: {
          theme: themeSettings.mode,
          colorScheme: themeSettings.colorScheme,
          fontSize: themeSettings.fontSize,
          animations: themeSettings.animations,
        },
        ...userSettings,
      }));
    } catch (error) {
      logger.error('Error loading settings:', error);
      stateManager.addNotification('error', 'Failed to load settings');
    }
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      // Update theme settings
      await themeManager.updateTheme({
        mode: settings.appearance.theme,
        colorScheme: settings.appearance.colorScheme,
        fontSize: settings.appearance.fontSize,
        animations: settings.appearance.animations,
      });

      // Update user preferences
      await stateManager.updateUserPreferences({
        notifications: settings.notifications,
        preferences: settings.preferences,
        dietary: settings.dietary,
      });

      setHasChanges(false);
      stateManager.addNotification('success', 'Settings saved successfully');
    } catch (error) {
      logger.error('Error saving settings:', error);
      stateManager.addNotification('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      await themeManager.resetTheme();
      await loadSettings();
      stateManager.addNotification('success', 'Settings reset to defaults');
    } catch (error) {
      logger.error('Error resetting settings:', error);
      stateManager.addNotification('error', 'Failed to reset settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Settings
            </h2>
          </div>
          <nav className="p-2">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'}
                `}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {activeSection === 'appearance' && (
                <AppearanceSettings
                  settings={settings.appearance}
                  onChange={(key, value) => 
                    handleSettingChange('appearance', key, value)
                  }
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationSettings
                  settings={settings.notifications}
                  onChange={(key, value) => 
                    handleSettingChange('notifications', key, value)
                  }
                />
              )}
              {activeSection === 'preferences' && (
                <PreferenceSettings
                  settings={settings.preferences}
                  onChange={(key, value) => 
                    handleSettingChange('preferences', key, value)
                  }
                />
              )}
              {activeSection === 'dietary' && (
                <DietarySettings
                  settings={settings.dietary}
                  onChange={(key, value) => 
                    handleSettingChange('dietary', key, value)
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex justify-between items-center">
        <button
          onClick={resetSettings}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        <button
          onClick={saveSettings}
          disabled={!hasChanges || isSaving}
          className={`
            flex items-center gap-2 px-4 py-2 rounded
            ${hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Section Components
function AppearanceSettings({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Appearance Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onChange('theme', value)}
                className={`
                  p-4 rounded-lg border flex flex-col items-center gap-2
                  ${settings.theme === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Color Scheme</label>
          <select
            value={settings.colorScheme}
            onChange={(e) => onChange('colorScheme', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="default">Default</option>
            <option value="nature">Nature</option>
            <option value="celestial">Celestial</option>
            <option value="mystic">Mystic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <input
            type="range"
            min="12"
            max="20"
            value={settings.fontSize}
            onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Small</span>
            <span>Medium</span>
            <span>Large</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable Animations</label>
          <button
            onClick={() => onChange('animations', !settings.animations)}
            className={`
              w-12 h-6 rounded-full transition-colors
              ${settings.animations ? 'bg-blue-500' : 'bg-gray-200'}
            `}
          >
            <div
              className={`
                w-4 h-4 rounded-full bg-white transform transition-transform
                ${settings.animations ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add other section components similarly... 