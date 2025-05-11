/**
 * fix-click-handlers.js
 * 
 * This script helps diagnose and fix issues with click handlers
 * in the application, particularly for expand/collapse functionality.
 */

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[ClickFix] DOM content loaded, initializing click handler diagnostics');
    
    // Function to diagnose click handling issues
    function diagnoseClickIssues() {
      console.log('[ClickFix] Starting click handler diagnostics');
      
      // First, check for event bubble/capture issues
      let eventCapturingStopped = false;
      
      // Check for stopPropagation and preventDefault overrides
      const originalStopProp = Event.prototype.stopPropagation;
      const originalPreventDefault = Event.prototype.preventDefault;
      
      if (Event.prototype.stopPropagation !== originalStopProp) {
        console.warn('[ClickFix] Event.prototype.stopPropagation has been overridden');
        Event.prototype.stopPropagation = originalStopProp;
        eventCapturingStopped = true;
      }
      
      if (Event.prototype.preventDefault !== originalPreventDefault) {
        console.warn('[ClickFix] Event.prototype.preventDefault has been overridden');
        Event.prototype.preventDefault = originalPreventDefault;
        eventCapturingStopped = true;
      }
      
      // Look for expandable elements with common class patterns
      const expandableElements = document.querySelectorAll(
        '[class*="expand"], [class*="collaps"], [class*="toggle"], ' +
        '[class*="arrow"], [class*="chevron"], button, .card-header, ' +
        '[role="button"]'
      );
      
      console.log(`[ClickFix] Found ${expandableElements.length} potentially expandable elements`);
      
      // Track elements that might need fixing
      let elementsToFix = [];
      
      // Check for click handlers on expandable elements
      expandableElements.forEach((el, index) => {
        if (index < 100) { // Limit to first 100 elements to avoid overwhelming the console
          const elClone = el.cloneNode(false);
          const hasOnClickAttr = el.hasAttribute('onclick');
          const hasClickListeners = window.getComputedStyle(el).cursor === 'pointer' || 
                                   el.tagName === 'BUTTON' ||
                                   el.getAttribute('role') === 'button';
          
          if (!hasOnClickAttr && hasClickListeners) {
            elementsToFix.push(el);
            console.log('[ClickFix] Element might need fixing:', el.tagName, 
                        el.className, 'has onClick:', hasOnClickAttr);
          }
        }
      });
      
      console.log(`[ClickFix] Found ${elementsToFix.length} elements that might need fixing`);
      
      return {
        elementsToFix,
        eventCapturingStopped
      };
    }
    
    // Function to fix click handlers
    function fixClickHandlers(diagnostics) {
      console.log('[ClickFix] Applying fixes for click handlers');
      
      // Re-enable event capturing if needed
      if (diagnostics.eventCapturingStopped) {
        console.log('[ClickFix] Re-enabling event capturing');
      }
      
      // Fix elements with missing or non-functioning click handlers
      diagnostics.elementsToFix.forEach(el => {
        // Add backup click handler for expand/collapse elements
        if (el.querySelector('.chevron-up, .chevron-down, [class*="chevron"]') ||
            el.classList.contains('expanded') || 
            el.classList.toString().includes('expand') ||
            el.getAttribute('aria-expanded') !== null) {
          
          console.log('[ClickFix] Adding backup click handler to:', el.tagName, el.className);
          
          // Add a click handler with useCapture to ensure it runs
          el.addEventListener('click', function(e) {
            console.log('[ClickFix] Backup click handler fired for:', el.tagName, el.className);
            
            // Toggle expanded class
            if (el.classList.contains('expanded')) {
              el.classList.remove('expanded');
              // Also try to handle aria attributes
              el.setAttribute('aria-expanded', 'false');
            } else {
              el.classList.add('expanded');
              el.setAttribute('aria-expanded', 'true');
            }
            
            // Toggle visibility of child content containers
            const contentContainers = el.nextElementSibling || 
                                     el.querySelector('.content, .card-body, .collapse, .expandable');
            
            if (contentContainers) {
              if (contentContainers.style.display === 'none') {
                contentContainers.style.display = 'block';
              } else {
                contentContainers.style.display = 'none';
              }
            }
          }, true); // Use capture to ensure this runs
        }
      });
      
      // Ensure React event handling is working
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || window.React) {
        console.log('[ClickFix] React detected, ensuring event handling is functional');
        
        // Try to force a re-render if React is detected
        try {
          // Create a minor DOM change to encourage React to re-evaluate handlers
          const hiddenMarker = document.createElement('div');
          hiddenMarker.style.display = 'none';
          hiddenMarker.id = 'click-fix-marker-' + Date.now();
          document.body.appendChild(hiddenMarker);
          
          // Force a style recalculation
          window.getComputedStyle(hiddenMarker).display;
          
          // Remove marker
          setTimeout(() => {
            if (document.body.contains(hiddenMarker)) {
              document.body.removeChild(hiddenMarker);
            }
          }, 100);
        } catch (e) {
          console.warn('[ClickFix] Error while attempting to trigger React update:', e);
        }
      }
      
      console.log('[ClickFix] Fixes applied, monitoring for issues');
    }
    
    // Run diagnostics
    const diagnostics = diagnoseClickIssues();
    
    // Apply fixes
    fixClickHandlers(diagnostics);
    
    // Continue monitoring for a short time after load
    setTimeout(function() {
      const newDiagnostics = diagnoseClickIssues();
      if (newDiagnostics.elementsToFix.length > 0) {
        console.log('[ClickFix] Found additional elements to fix after initial load');
        fixClickHandlers(newDiagnostics);
      }
    }, 2000);
  });
  
  // Also run after window load to catch dynamically created elements
  window.addEventListener('load', function() {
    setTimeout(function() {
      console.log('[ClickFix] Window loaded, running additional diagnostics');
      const diagnostics = diagnoseClickIssues();
      fixClickHandlers(diagnostics);
    }, 500);
  });
  
  // Helper function to diagnose click issues
  function diagnoseClickIssues() {
    // Implementation is kept minimal in global scope
    // to prevent interfering with other scripts
    return { 
      elementsToFix: document.querySelectorAll('[class*="expand"], [class*="collaps"], [class*="toggle"]'),
      eventCapturingStopped: false
    };
  }
})(); 