/**
 * scriptReplacer.js
 * Focused on handling Chrome Extension API issues by replacing problematic scripts
 * and providing robust mocks for Chrome APIs
 */

(function() {
  if (typeof window === 'undefined') return;
  
  console.log('[ScriptReplacer] Initializing script interceptor for Chrome Extension APIs');
  
  // Track initialization to prevent double initialization
  if (window.__scriptReplacerInitialized) {
    console.log('[ScriptReplacer] Already initialized, skipping');
    return;
  }
  window.__scriptReplacerInitialized = true;
  
  // Names of scripts to intercept
  const PROBLEMATIC_SCRIPTS = ['popup.js', 'lockdown-install.js', 'chrome-api.js', 'extension-api.js'];
  
  // Create a Chrome API mock early to prevent any errors
  if (typeof window.chrome === 'undefined') {
    console.log('[ScriptReplacer] Setting up Chrome API mock structure');
    window.chrome = {
      tabs: {
        create: function(options) {
          console.log('[ScriptReplacer] chrome.tabs.create intercepted with:', options);
          // Redirect to dummy-popup.js implementation
          window.location.href = options?.url || window.location.href;
          return Promise.resolve({id: 999, url: options?.url});
        }
      },
      runtime: {
        lastError: null,
        sendMessage: function() { return true; },
        onMessage: {
          addListener: function() {},
          removeListener: function() {}
        }
      }
    };
  }
  
  // Replace XMLHttpRequest to intercept script loading via XHR
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    if (arguments[1] && typeof arguments[1] === 'string') {
      const url = arguments[1];
      
      // Check if this is a problematic script
      const isProblematic = PROBLEMATIC_SCRIPTS.some(script => url.includes(script));
      
      if (isProblematic) {
        console.log(`[ScriptReplacer] Intercepted XHR request for problematic script: ${url}`);
        // Replace with dummy implementation
        arguments[1] = '/dummy-popup.js';
      }
    }
    return originalXHROpen.apply(this, arguments);
  };
  
  // Replace script src attributes for problematic scripts
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value && typeof value === 'string') {
          const isProblematic = PROBLEMATIC_SCRIPTS.some(script => value.includes(script));
          
          if (isProblematic) {
            console.log(`[ScriptReplacer] Intercepted script src attribute: ${value}`);
            return originalSetAttribute.call(this, name, '/dummy-popup.js');
          }
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    return element;
  };
  
  // Intercept direct script assignments
  const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
  if (originalDescriptor && originalDescriptor.set) {
    Object.defineProperty(HTMLScriptElement.prototype, 'src', {
      set: function(value) {
        if (value && typeof value === 'string') {
          const isProblematic = PROBLEMATIC_SCRIPTS.some(script => value.includes(script));
          
          if (isProblematic) {
            console.log(`[ScriptReplacer] Intercepted direct script.src assignment: ${value}`);
            value = '/dummy-popup.js';
          }
        }
        return originalDescriptor.set.call(this, value);
      },
      get: originalDescriptor.get,
      configurable: true
    });
  }
  
  // Handle dynamic script insertions via appendChild
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(node) {
    if (node.nodeName === 'SCRIPT' && node.src && typeof node.src === 'string') {
      const isProblematic = PROBLEMATIC_SCRIPTS.some(script => node.src.includes(script));
      
      if (isProblematic) {
        console.log(`[ScriptReplacer] Intercepted script append for: ${node.src}`);
        node.src = '/dummy-popup.js';
      }
    }
    return originalAppendChild.call(this, node);
  };
  
  // Safer insertBefore handling for script injection
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (newNode.nodeName === 'SCRIPT' && newNode.src && typeof newNode.src === 'string') {
      const isProblematic = PROBLEMATIC_SCRIPTS.some(script => newNode.src.includes(script));
      
      if (isProblematic) {
        console.log(`[ScriptReplacer] Intercepted insertBefore for script: ${newNode.src}`);
        newNode.src = '/dummy-popup.js';
      }
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
  
  // Global error handler for chrome API errors
  window.addEventListener('error', function(event) {
    // Specific Chrome API errors to intercept
    if (event.message && (
      event.message.includes('chrome') || 
      event.message.includes('tabs') ||
      event.message.includes('Cannot read properties of undefined') ||
      event.message.includes('lockdown')
    )) {
      console.warn('[ScriptReplacer] Intercepted potential extension API error:', event.message);
      
      // Ensure Chrome API is available to prevent cascading errors
      if (typeof window.chrome === 'undefined' || typeof window.chrome.tabs === 'undefined') {
        console.log('[ScriptReplacer] Re-initializing Chrome API after error');
        
        // Force browser to load our dummy implementation
        const script = document.createElement('script');
        script.src = '/dummy-popup.js';
        script.async = true;
        document.head.appendChild(script);
      }
      
      // Only prevent default for specific Chrome extension errors
      if (
        event.message.includes('chrome.tabs') ||
        event.message.includes('extension') ||
        event.message.includes('lockdown-install')
      ) {
        event.preventDefault();
        return true;
      }
    }
    return false;
  }, true);
  
  console.log('[ScriptReplacer] Chrome API protection active');
})();

export default {}; 