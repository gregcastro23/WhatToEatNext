import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { initializeChromeApis } from '@/utils/chromeApiInitializer';
// Polyfill to ensure getDominantElement is globally available during SSR/SSG
import '@/utils/globalDominantElement';

// Declare global window type extension
declare global {
  interface Window {
    __reloadedDummyPopup?: boolean;
    __chromeAPIsInitialized?: boolean;
    __lockdownHandled?: boolean;
    __extensionErrorHandlerInstalled?: boolean;
    __alchemicalEnginePatchApplied?: boolean;
    lockdown?: Function;
    harden?: Function;
    popup?: Record<string, unknown>;
    chrome?: Record<string, unknown>;
    getElementRanking?: Function;
    createElementObject?: Function;
    combineElementObjects?: Function;
    getAbsoluteElementValue?: Function;
    capitalize?: Function;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // console.log('[App] Initializing with Chrome API protection');
    
    // Setup global error handler for Chrome Extension API and lockdown errors
    const errorHandler = function(event: ErrorEvent) {
      // Check for Chrome Extension API related errors
      if (event.message && (
        event.message.includes('chrome') || 
        event.message.includes('tabs') || 
        event.message.includes('Cannot read properties of undefined') ||
        event.message.includes('lockdown') ||
        event.message.includes('Removing unpermitted intrinsics') ||
        event.message.includes('popup') ||
        event.message.includes('viewer.js') ||
        event.message.includes('Assignment to constant variable')
      )) {
        // console.warn('[App] Intercepted API/lockdown error:', event.message);
        
        // Load scripts for handling these specific errors if not loaded yet
        loadErrorHandlingScripts();
        
        // Prevent default handling for extension-specific errors
        if (
          event.message.includes('chrome.tabs') ||
          event.message.includes('extension') ||
          event.message.includes('lockdown') ||
          event.message.includes('popup') ||
          event.message.includes('Assignment to constant variable')
        ) {
          event.preventDefault();
          return true;
        }
      }
      return false;
    };
    
    // Function to ensure error handling scripts are loaded
    function loadErrorHandlingScripts() {
      // Force load the dummy-popup.js script
      if (!window.__reloadedDummyPopup) {
        window.__reloadedDummyPopup = true;
        // console.log('[App] Loading dummy-popup.js for Chrome API mocking');
        
        const script = document.createElement('script');
        script.src = '/dummy-popup.js';
        script.async = false; // Load synchronously to ensure it's loaded before other scripts
        document.head.appendChild(script);
        
        // Load lockdown patch
        if (!window.__lockdownHandled) {
          const lockdownScript = document.createElement('script');
          lockdownScript.src = '/lockdown-patch.js';
          lockdownScript.async = false;
          document.head.appendChild(lockdownScript);
        }
        
        // Also load the alchemical engine patch
        if (!window.__alchemicalEnginePatchApplied) {
          const alchemicalPatchScript = document.createElement('script');
          alchemicalPatchScript.src = '/patchAlchemicalEngine.js';
          alchemicalPatchScript.async = false;
          document.head.appendChild(alchemicalPatchScript);
        }
        
        // Also reinitialize Chrome APIs
        if (!window.__chromeAPIsInitialized) {
          try {
            initializeChromeApis();
            window.__chromeAPIsInitialized = true;
          } catch (e) {
            // console.warn('[App] Error initializing Chrome APIs:', e);
          }
        }
      }
    }
    
    // Initialize Chrome APIs immediately on component mount
    try {
      initializeChromeApis();
      window.__chromeAPIsInitialized = true;
      
      // Pre-emptively load error handling scripts
      loadErrorHandlingScripts();
    } catch (e) {
      // console.warn('[App] Error during initial Chrome API initialization:', e);
    }
    
    window.addEventListener('error', errorHandler, true);
    
    return () => {
      // console.log('[App] Removing Chrome API error handler');
      window.removeEventListener('error', errorHandler, true);
    };
  }, []);

  return (
    <>
      <Head>
        <title>What To Eat Next</title>
        <meta name="description" content="Food recommendations based on your astrological profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Preload critical scripts to avoid Chrome API errors */}
        <link rel="preload" href="/dummy-popup.js" as="script" />
        <link rel="preload" href="/empty.js" as="script" />
        <link rel="preload" href="/lockdown-patch.js" as="script" />
        <link rel="preload" href="/patchAlchemicalEngine.js" as="script" />
        
        {/* Directly include critical scripts with highest priority */}
        <script src="/empty.js" />
        <script src="/lockdown-patch.js" />
        <script src="/dummy-popup.js" />
        <script src="/patchAlchemicalEngine.js" />
      </Head>
      <Component {...pageProps} />
    </>
  );
} 