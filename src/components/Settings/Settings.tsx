'use client';

import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Eye,
  Bell,
  ChefHat,
  Filter,
  Save,
  RotateCcw,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { logger } from '@/utils/logger';
import { stateManager } from '@/utils/stateManager';
import { themeManager } from '@/utils/theme';

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
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const manager = await stateManager;
      const userPrefs = manager.getState().user.preferences;
      const themeSettings = themeManager.getTheme();

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
          defaultServings: userPrefs.cooking.servingSize || 2,
          measurementSystem: 'metric',
          maxPrepTime: userPrefs.cooking.maxPrepTime || 60,
          complexity: userPrefs.cooking.complexity || 'moderate',
        },
        dietary: {
          restrictions: userPrefs.dietary.restrictions || [],
          favorites: userPrefs.dietary.favorites || [],
          excluded: userPrefs.dietary.excluded || [],
          spiciness: userPrefs.dietary.spiciness || 'medium',
        },
      });
    } catch (error) {
      logger.error('Error loading settings:', error);
      const manager = await stateManager;
      manager.addNotification('error', 'Failed to load settings');
    }
  };

  const handleSettingChange = (section: keyof AppSettings, key: string, value: unknown) => {
    setSettings(prev => {
      const newSettings = { ...prev };

      if (section === 'appearance') {
        newSettings.appearance = {
          ...prev.appearance,
          [key]: value,
        };
      } else if (section === 'notifications') {
        newSettings.notifications = {
          ...prev.notifications,
          [key]: value,
        };
      } else if (section === 'preferences') {
        newSettings.preferences = {
          ...prev.preferences,
          [key]: value,
        };
      } else if (section === 'dietary') {
        newSettings.dietary = {
          ...prev.dietary,
          [key]: value,
        };
      }

      return newSettings;
    });
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      // Update theme settings - only pass mode since that's the only parameter it accepts
      await themeManager.updateTheme(settings.appearance.theme);

      // Update user preferences
      const manager = await stateManager;

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
          },
        },
      });

      setHasChanges(false);
      manager.addNotification('success', 'Settings saved successfully');
    } catch (error) {
      logger.error('Error saving settings:', error);
      const manager = await stateManager;
      manager.addNotification('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      // Reset to default theme
      themeManager.updateTheme('light');

      // Reload settings
      await loadSettings();

      const manager = await stateManager;
      manager.addNotification('success', 'Settings reset to defaults');
    } catch (error) {
      logger.error('Error resetting settings:', error);
      const manager = await stateManager;
      manager.addNotification('error', 'Failed to reset settings');
    }
  };

  return (
    <div className='mx-auto max-w-4xl rounded-lg bg-white shadow-lg'>
      <div className='flex min-h-[600px] flex-col md:flex-row'>
        {/* Sidebar */}
        <div className='w-full border-r md:w-64'>
          <div className='border-b p-4'>
            <h2 className='flex items-center gap-2 text-xl font-semibold'>
              <SettingsIcon className='h-5 w-5' />
              Settings
            </h2>
          </div>
          <nav className='p-2'>
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } `}
              >
                <section.icon className='h-5 w-5' />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className='flex-1 p-6'>
          <div key={activeSection} className='animate-fade-in space-y-6'>
            {activeSection === 'appearance' && (
              <AppearanceSettings
                settings={settings.appearance}
                onChange={(key, value) => handleSettingChange('appearance', key, value)}
              />
            )}
            {activeSection === 'notifications' && (
              <NotificationSettings
                settings={settings.notifications}
                onChange={(key, value) => handleSettingChange('notifications', key, value)}
              />
            )}
            {activeSection === 'preferences' && (
              <PreferenceSettings
                settings={settings.preferences}
                onChange={(key, value) => handleSettingChange('preferences', key, value)}
              />
            )}
            {activeSection === 'dietary' && (
              <DietarySettings
                settings={settings.dietary}
                onChange={(key, value) => handleSettingChange('dietary', key, value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between border-t p-4'>
        <button
          onClick={resetSettings}
          className='flex items-center gap-2 rounded px-4 py-2 text-gray-600 hover:bg-gray-50'
        >
          <RotateCcw className='h-4 w-4' />
          Reset to Defaults
        </button>
        <button
          onClick={saveSettings}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 rounded px-4 py-2 ${
            hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
          } `}
        >
          <Save className='h-4 w-4' />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Section Components
function AppearanceSettings({
  settings,
  onChange,
}: {
  settings: AppSettings['appearance'];
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium'>Appearance Settings</h3>

      <div className='space-y-4'>
        <div>
          <label className='mb-2 block text-sm font-medium'>Theme</label>
          <div className='grid grid-cols-3 gap-4'>
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onChange('theme', value)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 ${
                  settings.theme === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                } `}
              >
                <Icon className='h-6 w-6' />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Color Scheme</label>
          <select
            value={settings.accent}
            onChange={e => onChange('accent', e.target.value)}
            className='w-full rounded border p-2'
          >
            <option value='blue'>Blue</option>
            <option value='green'>Green</option>
            <option value='purple'>Purple</option>
            <option value='red'>Red</option>
          </select>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Font Size</label>
          <input
            type='range'
            min='12'
            max='20'
            value={settings.fontSize}
            onChange={e => onChange('fontSize', parseInt(e.target.value))}
            className='w-full'
          />
          <div className='flex justify-between text-sm text-gray-500'>
            <span>Small</span>
            <span>Medium</span>
            <span>Large</span>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium'>Enable Animations</label>
          <button
            onClick={() => onChange('animations', !settings.animations)}
            className={`h-6 w-12 rounded-full transition-colors ${settings.animations ? 'bg-blue-500' : 'bg-gray-200'} `}
          >
            <div
              className={`h-4 w-4 transform rounded-full bg-white transition-transform ${settings.animations ? 'translate-x-7' : 'translate-x-1'} `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings({
  settings,
  onChange,
}: {
  settings: AppSettings['notifications'];
  onChange: (key: string, value: unknown) => void;
}) {
  const notificationOptions = [
    {
      key: 'recipes',
      label: 'Recipe Recommendations',
      description: 'Get notified about new recipe suggestions',
    },
    {
      key: 'celestial',
      label: 'Celestial Updates',
      description: 'Receive updates about astrological influences',
    },
    {
      key: 'updates',
      label: 'App Updates',
      description: 'Notifications about app updates and new features',
    },
    {
      key: 'cooking',
      label: 'Cooking Reminders',
      description: 'Timing and preparation reminders while cooking',
    },
  ];

  return (
    <div className='space-y-6'>
      <h3 className='flex items-center gap-2 text-lg font-medium'>
        <Bell className='h-5 w-5' />
        Notification Preferences
      </h3>

      <div className='space-y-4'>
        {notificationOptions.map(({ key, label, description }) => (
          <div key={key} className='flex items-center justify-between rounded-lg bg-gray-50 p-4'>
            <div>
              <label className='font-medium'>{label}</label>
              <p className='text-sm text-gray-600'>{description}</p>
            </div>
            <button
              onClick={() => onChange(key, !(settings as any)[key])}
              className={`h-6 w-12 rounded-full transition-colors ${
                (settings as any)[key] ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-5 w-5 transform rounded-full bg-white transition-transform ${
                  (settings as any)[key] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className='rounded-lg bg-blue-50 p-4'>
        <h4 className='font-medium text-blue-900'>Notification Timing</h4>
        <p className='mt-1 text-sm text-blue-700'>
          Notifications are sent based on optimal astrological timing for cooking and preparation
          activities.
        </p>
      </div>
    </div>
  );
}

// Preference Settings Component
function PreferenceSettings({
  settings,
  onChange,
}: {
  settings: AppSettings['preferences'];
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className='space-y-6'>
      <h3 className='flex items-center gap-2 text-lg font-medium'>
        <ChefHat className='h-5 w-5' />
        Cooking Preferences
      </h3>

      <div className='space-y-4'>
        <div>
          <label className='mb-2 block text-sm font-medium'>Default Serving Size</label>
          <div className='flex items-center gap-4'>
            <input
              type='range'
              min='1'
              max='12'
              value={settings.defaultServings}
              onChange={e => onChange('defaultServings', parseInt(e.target.value))}
              className='flex-1'
            />
            <span className='w-8 text-center text-lg font-medium'>{settings.defaultServings}</span>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Measurement System</label>
          <div className='grid grid-cols-2 gap-4'>
            {[
              { value: 'metric', label: 'Metric (kg, L, °C)' },
              { value: 'imperial', label: 'Imperial (lbs, qt, °F)' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChange('measurementSystem', value)}
                className={`rounded-lg border p-3 text-left ${
                  settings.measurementSystem === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Maximum Preparation Time</label>
          <div className='flex items-center gap-4'>
            <input
              type='range'
              min='15'
              max='180'
              step='15'
              value={settings.maxPrepTime}
              onChange={e => onChange('maxPrepTime', parseInt(e.target.value))}
              className='flex-1'
            />
            <span className='w-16 text-center text-lg font-medium'>{settings.maxPrepTime}min</span>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Recipe Complexity</label>
          <div className='grid grid-cols-3 gap-4'>
            {[
              {
                value: 'simple',
                label: 'Simple',
                description: 'Basic recipes with few ingredients',
              },
              {
                value: 'moderate',
                label: 'Moderate',
                description: 'Standard recipes with medium complexity',
              },
              {
                value: 'complex',
                label: 'Complex',
                description: 'Advanced recipes with multiple techniques',
              },
            ].map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => onChange('complexity', value)}
                className={`rounded-lg border p-4 text-left ${
                  settings.complexity === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className='font-medium'>{label}</div>
                <div className='mt-1 text-xs text-gray-600'>{description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dietary Settings Component
function DietarySettings({
  settings,
  onChange,
}: {
  settings: AppSettings['dietary'];
  onChange: (key: string, value: unknown) => void;
}) {
  const dietaryRestrictions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'shellfish-free',
    'egg-free',
    'soy-free',
    'halal',
    'kosher',
  ];

  const cuisineTypes = [
    'italian',
    'chinese',
    'mexican',
    'indian',
    'thai',
    'japanese',
    'french',
    'mediterranean',
    'american',
    'korean',
    'vietnamese',
    'greek',
  ];

  const toggleRestriction = (restriction: string) => {
    const current = settings.restrictions;
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    onChange('restrictions', updated);
  };

  const toggleFavorite = (cuisine: string) => {
    const current = settings.favorites;
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    onChange('favorites', updated);
  };

  const toggleExcluded = (cuisine: string) => {
    const current = settings.excluded;
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    onChange('excluded', updated);
  };

  return (
    <div className='space-y-6'>
      <h3 className='flex items-center gap-2 text-lg font-medium'>
        <Filter className='h-5 w-5' />
        Dietary Settings
      </h3>

      <div className='space-y-6'>
        <div>
          <h4 className='mb-3 font-medium'>Dietary Restrictions</h4>
          <div className='grid grid-cols-2 gap-2'>
            {dietaryRestrictions.map(restriction => (
              <button
                key={restriction}
                onClick={() => toggleRestriction(restriction)}
                className={`rounded-lg border p-2 text-left text-sm capitalize ${
                  settings.restrictions.includes(restriction)
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {restriction.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className='mb-3 font-medium'>Favorite Cuisines</h4>
          <div className='grid grid-cols-3 gap-2'>
            {cuisineTypes.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => toggleFavorite(cuisine)}
                className={`rounded-lg border p-2 text-left text-sm capitalize ${
                  settings.favorites.includes(cuisine)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className='mb-3 font-medium'>Excluded Cuisines</h4>
          <div className='grid grid-cols-3 gap-2'>
            {cuisineTypes.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => toggleExcluded(cuisine)}
                className={`rounded-lg border p-2 text-left text-sm capitalize ${
                  settings.excluded.includes(cuisine)
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className='mb-3 font-medium'>Spice Level Preference</h4>
          <div className='grid grid-cols-3 gap-4'>
            {[
              { value: 'mild', label: 'Mild', description: 'Little to no spice' },
              { value: 'medium', label: 'Medium', description: 'Moderate spice level' },
              { value: 'hot', label: 'Hot', description: 'High spice level' },
            ].map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => onChange('spiciness', value)}
                className={`rounded-lg border p-4 text-left ${
                  settings.spiciness === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className='font-medium'>{label}</div>
                <div className='mt-1 text-xs text-gray-600'>{description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
