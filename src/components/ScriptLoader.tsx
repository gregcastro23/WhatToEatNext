'use client';

import { useEffect } from 'react';

import { log } from '@/services/LoggingService';

/**
 * Client-side component for loading scripts to avoid hydration mismatches
 */
export default function ScriptLoader() {
  useEffect(() => {
    // Load scripts in order of priority
    const loadScripts = async () => {
      try {
        // Helper function to load a script and wait for it
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.onload = () => {
              log.info(`[ScriptLoader] Loaded: ${src}`);
              resolve();
            };
            script.onerror = error => {
              console.error(`[ScriptLoader] Failed to load: ${src}`, error);
              reject(error);
            };
            document.head.appendChild(script);
          });
        };

        // First, load the popup fix
        await loadScript('/popup-fix.js');

        // Then load the click handler fixes
        await loadScript('/fix-click-handlers.js');

        // Wait a brief moment for the fix handlers to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Finally load the test script
        await loadScript('/click-test.js');

        // Apply fixes after all scripts are loaded
        setTimeout(() => {
          if (window.ClickFix && typeof window.ClickFix.fixAllComponents === 'function') {
            window.ClickFix.fixAllComponents();
            log.info('[ScriptLoader] Applied component fixes');
          }
        }, 500);
      } catch (error) {
        console.error('[ScriptLoader] Error loading scripts:', error);
      }
    };

    void loadScripts();

    // Cleanup function
    return () => {
      // No cleanup needed for now
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Add this for TypeScript
declare global {
  interface Window {
    ClickFix?: {
      fixAllComponents: () => void;
      enableAggressiveMode: () => void;
      fixCuisineCards: () => void;
      diagnose: () => void;
    };
  }
}
