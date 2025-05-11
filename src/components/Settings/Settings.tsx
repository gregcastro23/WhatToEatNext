'use client';

import React, { useState, useEffect } from 'react';

import @/contexts  from 'AlchemicalContext ';
import @/utils  from 'stateManager ';
import @/utils  from 'theme ';
import @/utils  from 'logger ';
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

interface AppSettings {
  appearance: {
    theme: string;
    accent: string;
    fontSize: number;
    animations: boolean;
  };
  notifications: {
    recipes: boolean;
    celestial: boolean;
    updates: boolean;
    cooking: boolean;
  };
  preferences: {
    defaultServings: number;
    measurementSystem: string;
    maxPrepTime: number;
    complexity: string;
  };
  dietary: {
    restrictions: string[];
    favorites: string[];
    excluded: string[];
    spiciness: 'mild' | 'medium' | 'hot';
  };
}

export default function Settings() {
  const { state, dispatch } = useAlchemical();
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState({
    appearance: {
      theme: 'system',
      accent: 'blue',
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
      favorites: [] as string[],
      excluded: [] as string[],
      spiciness: 'medium' as 'mild' | 'medium' | 'hot',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  let loadSettings = async () => {
    try {
      let manager = await stateManager;
      let userPrefs = manager.getState().user.preferences;
      let themeSettings = themeManager.getTheme();

      setSettings({
        appearance: {
          theme: themeSettings.mode,
          accent: themeSettings.accent,
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
          defaultServings: userPrefs.cooking?.servingSize || 2,
          measurementSystem: 'metric',
          maxPrepTime: userPrefs.cooking?.maxPrepTime || 60,
          complexity: userPrefs.cooking?.complexity || 'moderate',
        },
        dietary: {
          restrictions: userPrefs.dietary?.restrictions || [],
          favorites: userPrefs.dietary?.favorites || [],
          excluded: userPrefs.dietary?.excluded || [],
          spiciness: userPrefs.dietary?.spiciness || 'medium',
        },
      });
    } catch (error) {
      logger.error('Error loading settings:', error);
      let manager = await stateManager;
      manager.addNotification('error', 'Failed to load settings');
    }
  };

  let handleSettingChange = (section: keyof AppSettings, key: string, value: unknown) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      
      if (section === 'appearance') {
        newSettings.appearance = {
          ...prev.appearance,
          [key]: value
        };
      } else if (section === 'notifications') {
        newSettings.notifications = {
          ...prev.notifications,
          [key]: value
        };
      } else if (section === 'preferences') {
        newSettings.preferences = {
          ...prev.preferences,
          [key]: value
        };
      } else if (section === 'dietary') {
        newSettings.dietary = {
          ...prev.dietary,
          [key]: value
        };
      }
      
      return newSettings;
    });
    setHasChanges(true);
  };

  let saveSettings = async () => {
    try {
      setIsSaving(true);

      // Update theme settings - only pass mode since that's the only parameter it accepts
      await themeManager.updateTheme(settings.appearance.theme);

      // Update user preferences
      let manager = await stateManager;
      
      // Use setState to update user preferences
      manager.setState({
        user: {
          ...manager.getState().user,
          preferences: {
            theme: {
              mode: settings.appearance.theme as 'light' | 'dark' | 'system',
              colorScheme: 'default',
              fontSize: settings.appearance.fontSize,
              animations: settings.appearance.animations,
            },
            dietary: {
              restrictions: settings.dietary.restrictions as any,
              favorites: settings.dietary.favorites,
              excluded: settings.dietary.excluded,
              spiciness: settings.dietary.spiciness,
            },
            cooking: {
              preferredMethods: manager.getState().user.preferences.cooking.preferredMethods,
              maxPrepTime: settings.preferences.maxPrepTime,
              servingSize: settings.preferences.defaultServings,
              complexity: settings.preferences.complexity as 'simple' | 'moderate' | 'complex',
            },
            cuisines: manager.getState().user.preferences.cuisines,
          }
        }
      });

      setHasChanges(false);
      manager.addNotification('success', 'Settings saved successfully');
    } catch (error) {
      logger.error('Error saving settings:', error);
      let manager = await stateManager;
      manager.addNotification('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  let resetSettings = async () => {
    try {
      // Reset to default theme
      themeManager.updateTheme('light');
      
      // Reload settings
      await loadSettings();
      
      let manager = await stateManager;
      manager.addNotification('success', 'Settings reset to defaults');
    } catch (error) {
      logger.error('Error resetting settings:', error);
      const manager = await stateManager;
      manager.addNotification('error', 'Failed to reset settings');
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
          <div
            key={activeSection}
            className="space-y-6 animate-fade-in"
          >
            {activeSection === 'appearance' && (
              <AppearanceSettings
                settings={settings.appearance}
                onChange={(key, value) => 
                  handleSettingChange('appearance', key, value)
                }
              />
            )}
            {/* Other settings components are commented out for now until implemented */}
            {/* 
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
            */}
          </div>
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
function AppearanceSettings({ 
  settings, 
  onChange 
}: { 
  settings: AppSettings['appearance']; 
  onChange: (key: string, value: unknown) => void 
}) {
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
            value={settings.accent}
            onChange={(e) => onChange('accent', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
            <option value="red">Red</option>
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