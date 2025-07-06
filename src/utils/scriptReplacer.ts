// scriptReplacer.ts - Created on 2025-01-02
// Provides script replacement functionality for the FoodRecommender component

/**
 * Script replacement utilities for dynamic content loading
 */

// Global type declaration for script replacement functionality
declare global {
  interface Window {
    __scriptReplacerInitialized?: boolean;
    scriptReplacer?: {
      replace: (selector: string, content: string) => void;
      inject: (script: string) => void;
      cleanup: () => void;
    };
  }
}

/**
 * Initialize script replacement functionality
 */
export function initializeScriptReplacer(): void {
  if (typeof window === 'undefined') return;
  
  if (window.__scriptReplacerInitialized) return;
  
  // Create script replacement object
  window.scriptReplacer = {
    replace: (selector: string, content: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = content;
      }
    },
    
    inject: (script: string) => {
      const scriptElement = document.createElement('script');
      scriptElement.textContent = script;
      document.head.appendChild(scriptElement);
    },
    
    cleanup: () => {
      // Cleanup any dynamically injected scripts
      const dynamicScripts = document.querySelectorAll('script[data-dynamic="true"]');
      dynamicScripts.forEach(script => script.remove());
    }
  };
  
  window.__scriptReplacerInitialized = true;
}

/**
 * Replace content in a specific element
 */
export function replaceContent(selector: string, content: string): void {
  if (typeof window === 'undefined') return;
  
  if (!window.scriptReplacer) {
    initializeScriptReplacer();
  }
  
  window.scriptReplacer?.replace(selector, content);
}

/**
 * Inject a script into the page
 */
export function injectScript(script: string): void {
  if (typeof window === 'undefined') return;
  
  if (!window.scriptReplacer) {
    initializeScriptReplacer();
  }
  
  window.scriptReplacer?.inject(script);
}

/**
 * Clean up dynamically injected content
 */
export function cleanupScripts(): void {
  if (typeof window === 'undefined') return;
  
  if (!window.scriptReplacer) {
    initializeScriptReplacer();
  }
  
  window.scriptReplacer?.cleanup();
}

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  initializeScriptReplacer();
}

export default {
  initializeScriptReplacer,
  replaceContent,
  injectScript,
  cleanupScripts
}; 