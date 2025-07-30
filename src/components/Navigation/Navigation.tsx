'use client';

import { 
  Home, 
  Book, 
  Heart, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Star,
  Clock,
  ChefHat,
  Filter,
  Utensils
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { stateManager } from '@/utils/stateManager';
import { themeManager } from '@/utils/theme';


const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/recipes', label: 'Recipes', icon: Book },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/celestial', label: 'Celestial Guide', icon: Star },
  { path: '/sauce-explorer', label: 'Sauce Explorer', icon: Utensils },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/kitchen', label: 'My Kitchen', icon: ChefHat },
  { path: '/preferences', label: 'Preferences', icon: Filter },
];

export default function Navigation() {
  const pathname = usePathname();
  const { state } = useAlchemical();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: string;
  }>>([]);

  useEffect(() => {
    // Initialize theme
    const currentTheme = themeManager.getTheme();
    setTheme(currentTheme.mode === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : currentTheme.mode);

    // Initialize state manager and listen for notifications
    let unsubscribeFunction: (() => void) | undefined;
    
    const initStateManager = async () => {
      try {
        // stateManager is already a Promise<StateManager>
        const stateManagerInstance = await stateManager;
        unsubscribeFunction = stateManagerInstance.subscribe('navigation', (state) => {
          setNotifications(state.ui.notifications);
        });
      } catch (error) {
        console.error('Failed to initialize state manager:', error);
      }
    };
    
    void initStateManager();

    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    themeManager.updateTheme(newTheme);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-lg md:hidden"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Navigation Bar */}
      <nav
        className={`
          fixed top-0 right-0 h-full bg-white shadow-xl z-40
          md:relative md:shadow-none md:w-64
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-full' : 'translate-x-full md:translate-x-0 w-0 md:w-64'}
        `}
      >
        <div className="h-full flex flex-col p-4">
          {/* Logo/Header */}
          <div className="flex items-center justify-between mb-8 p-2">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <ChefHat className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-semibold">Culinary Cosmos</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 space-y-2">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  onClick={closeMenu}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-50 text-gray-700'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle &amp; Settings */}
          <div className="border-t pt-4 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                hover:bg-gray-50 text-gray-700"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <Link
              href="/settings"
              onClick={closeMenu}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                hover:bg-gray-50 text-gray-700"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg shadow-lg max-w-sm
              ${notification.type === 'error' ? 'bg-red-500 text-white' :
                notification.type === 'success' ? 'bg-green-500 text-white' :
                'bg-blue-500 text-white'}
              animate-fade-in-up
            `}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden animate-fade-in"
        />
      )}
    </>
  );
} 