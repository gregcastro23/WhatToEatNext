'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { stateManager } from '@/utils/stateManager';
import { themeManager } from '@/utils/theme';
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
  Filter
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/recipes', label: 'Recipes', icon: Book },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/celestial', label: 'Celestial Guide', icon: Star },
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

    // Listen for notifications
    const unsubscribe = stateManager.subscribe('navigation', (state) => {
      setNotifications(state.ui.notifications);
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    themeManager.updateTheme({ mode: newTheme });
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
      <motion.nav
        initial={false}
        animate={{
          x: isOpen ? 0 : '100%',
          width: isOpen ? '100%' : '0%'
        }}
        className={`
          fixed top-0 right-0 h-full bg-white shadow-xl z-40
          md:relative md:transform-none md:shadow-none md:w-64
          transition-transform duration-200 ease-in-out
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
                  {path === '/favorites' && state.favorites.length > 0 && (
                    <span className="ml-auto bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {state.favorites.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle & Settings */}
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
      </motion.nav>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                p-4 rounded-lg shadow-lg max-w-sm
                ${notification.type === 'error' ? 'bg-red-500 text-white' :
                  notification.type === 'success' ? 'bg-green-500 text-white' :
                  'bg-blue-500 text-white'}
              `}
            >
              {notification.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}
    </>
  );
} 