/**
 * click-test.js
 * 
 * This script tests click functionality on expandable components.
 * Run it from the browser console to analyze and fix click issues.
 */

(function() {
  console.log('[ClickTest] Starting diagnostics...');

  // Function to test clicks on expandable elements
  function testExpandableElements() {
    console.log('[ClickTest] Looking for expandable elements...');
    
    // Common selectors for expandable components in the app
    const selectors = [
      '[data-expandable="true"]',
      '.cuisineCard',
      '.recipe-card',
      '.ingredientCard',
      '.method-card'
    ];
    
    const selector = selectors.join(',');
    const expandableElements = document.querySelectorAll(selector);
    
    console.log(`[ClickTest] Found ${expandableElements.length} expandable elements`);
    
    // Add click listeners for logging
    expandableElements.forEach((element, index) => {
      // Skip elements that already have the diagnostic listener
      if (element.__clickTestAdded) return;
      
      // Mark element as tested
      element.__clickTestAdded = true;
      
      // Clone the original element to preserve its event listeners
      const clone = element.cloneNode(true);
      
      // Add an outline to show it's being monitored
      element.style.outline = '1px solid rgba(0, 128, 255, 0.5)';
      
      // Add an attribute for tracking
      element.setAttribute('data-click-test-id', `expandable-${index}`);
      
      // Add a click event listener using capture phase to log all clicks
      element.addEventListener('click', function(event) {
        console.log(`[ClickTest] Click detected on element:`, {
          id: element.getAttribute('data-click-test-id'),
          tagName: element.tagName,
          className: element.className,
          expanded: element.classList.contains('expanded'),
          eventPropagation: !event.cancelBubble,
          eventTarget: event.target.tagName + (event.target.className ? '.' + event.target.className : '')
        });
      }, true); // Use capture phase to get event before stopPropagation
      
      console.log(`[ClickTest] Monitoring element:`, {
        id: element.getAttribute('data-click-test-id'),
        tagName: element.tagName,
        className: element.className,
        text: element.textContent.substring(0, 30).trim() + '...'
      });
    });
  }
  
  // Function to simulate clicking on elements
  function simulateClicks() {
    console.log('[ClickTest] Starting click simulation...');
    
    const expandableElements = document.querySelectorAll('[data-expandable="true"]');
    let clickCount = 0;
    
    // Only test a few elements to avoid overwhelming the UI
    const maxClicks = Math.min(5, expandableElements.length);
    
    for (let i = 0; i < maxClicks; i++) {
      const element = expandableElements[i];
      if (element) {
        console.log(`[ClickTest] Simulating click on:`, element.tagName, i);
        
        // Use a timeout to space out the clicks
        setTimeout(() => {
          try {
            element.click();
            clickCount++;
            console.log(`[ClickTest] Simulated click ${clickCount}/${maxClicks}`);
          } catch (error) {
            console.error(`[ClickTest] Error clicking element:`, error);
          }
        }, i * 1000); // 1 second between clicks
      }
    }
  }
  
  // Function to recommend fixes for common issues
  function suggestFixes() {
    const issues = [];
    
    // Check for preventDefault and stopPropagation
    const scripts = document.querySelectorAll('script');
    let containsStopPropagation = false;
    
    scripts.forEach(script => {
      if (script.textContent && (
        script.textContent.includes('stopPropagation') || 
        script.textContent.includes('preventDefault')
      )) {
        containsStopPropagation = true;
      }
    });
    
    if (containsStopPropagation) {
      issues.push({
        issue: 'Event propagation might be being stopped',
        fix: 'Check for stopPropagation() calls in your click handlers. Make sure they don\'t prevent parent handlers from executing.'
      });
    }
    
    // Check for z-index issues
    const elements = document.querySelectorAll('*');
    let hasHighZIndex = false;
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex);
      if (zIndex > 1000) {
        hasHighZIndex = true;
      }
    });
    
    if (hasHighZIndex) {
      issues.push({
        issue: 'High z-index elements detected',
        fix: 'High z-index elements may be capturing clicks. Check for overlays or fixed elements.'
      });
    }
    
    // Check for pointer-events
    let hasPointerEventsNone = false;
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.pointerEvents === 'none') {
        hasPointerEventsNone = true;
      }
    });
    
    if (hasPointerEventsNone) {
      issues.push({
        issue: 'Elements with pointer-events: none detected',
        fix: 'Some elements have pointer-events set to none, which prevents them from receiving clicks.'
      });
    }
    
    // Return recommendations
    return issues;
  }

  // Create a public API for manual testing
  window.ClickTest = {
    diagnose: testExpandableElements,
    simulate: simulateClicks,
    suggestFixes: suggestFixes,
    fixAll: function() {
      // Apply automatic fixes
      console.log('[ClickTest] Applying automatic fixes...');
      
      // Add missing click handlers to expandable elements
      document.querySelectorAll('[data-expandable="true"]').forEach(element => {
        if (!element.onclick) {
          element.onclick = function(event) {
            console.log('[ClickTest] Added click handler triggered');
            
            // Toggle expanded class
            this.classList.toggle('expanded');
            
            // If the element contains expandable-content, toggle it too
            const content = this.querySelector('.expandable-content');
            if (content) {
              content.classList.toggle('expanded');
            }
            
            // Prevent default and stop propagation
            event.preventDefault();
            event.stopPropagation();
          };
          
          console.log('[ClickTest] Added missing click handler to:', element);
        }
      });
      
      console.log('[ClickTest] Fixes applied. Test by clicking elements.');
    }
  };
  
  // Run initial diagnostics
  testExpandableElements();
  
  console.log('[ClickTest] Diagnostics complete. Use window.ClickTest.diagnose() to re-run tests.');
  console.log('[ClickTest] Use window.ClickTest.simulate() to simulate clicks on expandable elements.');
  console.log('[ClickTest] Use window.ClickTest.suggestFixes() to get recommendations for issues.');
  console.log('[ClickTest] Use window.ClickTest.fixAll() to attempt automatic fixes for common issues.');
})(); 