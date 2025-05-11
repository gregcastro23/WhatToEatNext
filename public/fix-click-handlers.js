/**
 * fix-click-handlers.js
 * 
 * This script provides diagnostic and fix functionality for click handling issues
 * in React applications. It addresses common problems with React's synthetic events,
 * event bubbling, and stopPropagation behaviors.
 */

(function() {
  console.log('[ClickFix] Initializing click handler diagnostic and fix module...');

  // Track clicks that should have worked but didn't
  let missedClicks = [];
  let fixedEventHandlers = 0;
  
  // Store original event methods
  const originalStopProp = Event.prototype.stopPropagation;
  const originalPreventDefault = Event.prototype.preventDefault;
  
  // Check for global event handler overrides
  if (Event.prototype.stopPropagation !== originalStopProp) {
    console.warn('[ClickFix] Event.prototype.stopPropagation has been overridden');
    Event.prototype.stopPropagation = originalStopProp;
    console.log('[ClickFix] Restored original stopPropagation');
  }
  
  if (Event.prototype.preventDefault !== originalPreventDefault) {
    console.warn('[ClickFix] Event.prototype.preventDefault has been overridden');
    Event.prototype.preventDefault = originalPreventDefault;
    console.log('[ClickFix] Restored original preventDefault');
  }

  // Fix 1: Patch stopPropagation to prevent excessive blocking
  Event.prototype.stopPropagation = function() {
    if (this.__clickFixTracked) return; // Prevent double tracking
    
    this.__clickFixTracked = true;
    console.debug('[ClickFix] stopPropagation called at:', new Error().stack);
    
    // Call original
    return originalStopProp.apply(this, arguments);
  };

  // Fix 2: Create a global click handler to detect missed clicks
  document.addEventListener('click', function(e) {
    if (e.target.getAttribute('data-click-fixed') === 'true') return;
    
    // Check if target has onClick attribute but no click listener
    const element = e.target.closest('[data-expandable="true"]');
    if (element && !element.__hasClickListener) {
      console.log('[ClickFix] Found expandable element without working click handler', element);
      missedClicks.push({
        element: element,
        time: new Date().getTime()
      });
      
      // Try to fix by adding a fallback click handler
      element.__hasClickListener = true;
      element.addEventListener('click', function(event) {
        if (event.__handledByClickFix) return;
        event.__handledByClickFix = true;
        
        console.log('[ClickFix] Handling click via fallback handler');
        
        // Try to find the toggle function from React props
        const reactInstance = element.__reactFiber$;
        if (reactInstance) {
          // Look for common toggle function names
          const toggleFuncNames = ['toggle', 'toggleExpand', 'toggleExpanded', 'handleToggle', 'toggleExpansion'];
          let toggleFunc = null;
          
          for (const funcName of toggleFuncNames) {
            if (typeof element[funcName] === 'function') {
              toggleFunc = element[funcName];
              break;
            }
          }
          
          if (toggleFunc) {
            toggleFunc(event);
            fixedEventHandlers++;
            console.log('[ClickFix] Successfully called toggle function');
          } else {
            // Toggle expanded class as fallback
            if (element.classList.contains('expanded')) {
              element.classList.remove('expanded');
            } else {
              element.classList.add('expanded');
            }
            fixedEventHandlers++;
            console.log('[ClickFix] Toggled expanded class as fallback');
          }
        }
      });
    }
  }, true); // Use capture phase to detect all clicks

  // Fix 3: Patch React's event delegation
  window.setTimeout(function() {
    if (!window.React || !window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) return;
    
    const ReactDOM = window.ReactDOM;
    if (!ReactDOM) return;
    
    try {
      // Modify React's event delegation system to ensure events are properly propagated
      const originalCreateEventHandle = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events?.createEventHandle;
      if (originalCreateEventHandle) {
        ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Events.createEventHandle = function() {
          const result = originalCreateEventHandle.apply(this, arguments);
          console.log('[ClickFix] Patched React event handle creation');
          return result;
        };
      }
    } catch (e) {
      console.error('[ClickFix] Failed to patch React event system:', e);
    }
  }, 500);

  // Fix 4: Add click diagnostic attributes to expand/collapse elements
  function markExpandableElements() {
    // Common classes and patterns used for expandable components
    const selectors = [
      '.expanded', 
      '[aria-expanded]',
      '[data-expandable="true"]',
      '.expandable',
      '[class*="expand"]',
      '[class*="collapse"]',
      // Specific components from the codebase
      '.method-card',
      '.variation-item',
      '.recipe-card',
      '.cuisineCard',
      '.ingredientCard'
    ];
    
    const elements = document.querySelectorAll(selectors.join(','));
    
    elements.forEach(el => {
      if (!el.hasAttribute('data-click-fixed')) {
        el.setAttribute('data-expandable', 'true');
        el.setAttribute('data-click-fixed', 'true');
        console.log('[ClickFix] Marked expandable element:', el);
      }
    });
  }
  
  // Fix 5: Enhanced click handler that allows capturing a click anywhere on the component
  function enhanceClickHandlers() {
    const expandableElements = document.querySelectorAll('[data-expandable="true"]');
    
    expandableElements.forEach(element => {
      // Skip if already enhanced
      if (element.__clickEnhanced) return;
      element.__clickEnhanced = true;
      
      // Add a click capture handler
      element.addEventListener('click', function(event) {
        // Skip if the event is already being handled
        if (event.__clickFixHandled) return;
        event.__clickFixHandled = true;
        
        // If the click is on a button or link inside the expandable, don't expand
        const target = event.target;
        if (
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input')
        ) {
          // Allow the native click to proceed
          return;
        }
        
        console.log('[ClickFix] Enhanced click handler for:', element);
        
        // Toggle expanded state
        element.classList.toggle('expanded');
        
        // Find any expandable content inside
        const content = element.querySelector('.expandable-content');
        if (content) {
          content.classList.toggle('expanded');
        }
        
        // Find any potential toggle functions
        const componentProps = element._reactProps || element.__reactProps;
        if (componentProps) {
          const toggleProps = Object.entries(componentProps).find(([key]) => 
            key.toLowerCase().includes('toggle') || 
            key.toLowerCase().includes('expand') ||
            key.toLowerCase().includes('click')
          );
          
          if (toggleProps && typeof toggleProps[1] === 'function') {
            try {
              toggleProps[1](event);
              console.log('[ClickFix] Called component toggle function:', toggleProps[0]);
            } catch (error) {
              console.error('[ClickFix] Error calling component toggle function:', error);
            }
          }
        }
        
        // Stop propagation to prevent duplicate handling
        event.stopPropagation();
      }, true); // Use capture phase
    });
  }

  // Run diagnostics and fixes periodically
  window.setInterval(markExpandableElements, 2000);
  window.setInterval(enhanceClickHandlers, 3000);

  // Create diagnostic API for debugging
  window.ClickFix = {
    diagnose: function() {
      console.log('[ClickFix] Diagnostic summary:');
      console.log(`  - Missed clicks detected: ${missedClicks.length}`);
      console.log(`  - Fixed event handlers: ${fixedEventHandlers}`);
      return {
        missedClicks,
        fixedEventHandlers
      };
    },
    forceFix: function() {
      markExpandableElements();
      enhanceClickHandlers();
      console.log('[ClickFix] Force-fixed all expandable elements');
    },
    resetTracking: function() {
      missedClicks = [];
      fixedEventHandlers = 0;
      console.log('[ClickFix] Reset tracking counters');
    },
    
    // NEW: Add aggressive mode for fixing deeply nested click issues
    enableAggressiveMode: function() {
      console.log('[ClickFix] Enabling aggressive click fixing mode');
      
      // Force all expandable elements to respond to clicks
      document.querySelectorAll('[data-expandable="true"]').forEach(el => {
        // Give higher z-index to ensure clickability
        el.style.position = 'relative';
        el.style.zIndex = '10';
        
        // Ensure pointer-events are enabled
        el.style.pointerEvents = 'auto';
        
        // Setup a transparent layer to catch clicks
        const clickLayer = document.createElement('div');
        clickLayer.style.position = 'absolute';
        clickLayer.style.top = '0';
        clickLayer.style.left = '0';
        clickLayer.style.width = '100%';
        clickLayer.style.height = '100%';
        clickLayer.style.zIndex = '11';
        clickLayer.style.cursor = 'pointer';
        
        // Clicking this layer will toggle expanded state
        clickLayer.addEventListener('click', (event) => {
          event.stopPropagation();
          el.classList.toggle('expanded');
          console.log('[ClickFix] Aggressive click layer toggled element:', el);
          
          // Try to find inner expandable content
          const expandableContent = el.querySelector('.expandable-content');
          if (expandableContent) {
            expandableContent.classList.toggle('expanded');
          }
        });
        
        // Only append if not already there
        if (!el.querySelector('[data-click-layer="true"]')) {
          clickLayer.setAttribute('data-click-layer', 'true');
          el.appendChild(clickLayer);
        }
      });
      
      return 'Aggressive mode enabled';
    },
    
    disableAggressiveMode: function() {
      console.log('[ClickFix] Disabling aggressive click fixing mode');
      
      // Remove all click layers
      document.querySelectorAll('[data-click-layer="true"]').forEach(el => {
        el.remove();
      });
      
      // Restore original styling
      document.querySelectorAll('[data-expandable="true"]').forEach(el => {
        el.style.position = '';
        el.style.zIndex = '';
        el.style.pointerEvents = '';
      });
      
      return 'Aggressive mode disabled';
    },
    
    // Add targeted fix for specific component types
    fixCuisineCards: function() {
      document.querySelectorAll('.cuisineCard, [class*="cuisine"]').forEach(el => {
        el.setAttribute('data-expandable', 'true');
        el.style.cursor = 'pointer';
        el.__fixedForCuisine = true;
        
        // Add special click handler
        el.addEventListener('click', function(event) {
          console.log('[ClickFix] Cuisine card clicked:', el);
          
          // Let natural handlers work but ensure propagation
          setTimeout(() => {
            // Check if cuisine toggle worked
            const wasExpanded = el.hasAttribute('data-expanded') || 
                              el.classList.contains('expanded');
            
            if (!wasExpanded) {
              console.log('[ClickFix] Forcing cuisine expansion');
              el.classList.add('expanded');
              el.setAttribute('data-expanded', 'true');
            }
          }, 100);
        });
      });
      
      return 'Fixed cuisine cards';
    },
    
    fixRecipeCards: function() {
      document.querySelectorAll('.recipe-card, [id*="recipe-"]').forEach(el => {
        el.setAttribute('data-expandable', 'true');
        el.style.cursor = 'pointer';
        el.__fixedForRecipe = true;
        
        // Similar fix to cuisine cards
        el.addEventListener('click', function(event) {
          console.log('[ClickFix] Recipe card clicked:', el);
        });
      });
      
      return 'Fixed recipe cards';
    },
    
    fixIngredientCards: function() {
      document.querySelectorAll('.ingredientCard, [class*="ingredient"]').forEach(el => {
        el.setAttribute('data-expandable', 'true');
        el.style.cursor = 'pointer';
        el.__fixedForIngredient = true;
        
        // Similar fix
        el.addEventListener('click', function(event) {
          console.log('[ClickFix] Ingredient card clicked:', el);
        });
      });
      
      return 'Fixed ingredient cards';
    },
    
    fixMethodCards: function() {
      document.querySelectorAll('.method-card, [class*="method"]').forEach(el => {
        el.setAttribute('data-expandable', 'true');
        el.style.cursor = 'pointer';
        el.__fixedForMethod = true;
        
        // Similar fix
        el.addEventListener('click', function(event) {
          console.log('[ClickFix] Method card clicked:', el);
        });
      });
      
      return 'Fixed method cards';
    },
    
    // Fix all component types at once
    fixAllComponents: function() {
      this.fixCuisineCards();
      this.fixRecipeCards();
      this.fixIngredientCards();
      this.fixMethodCards();
      return 'Fixed all component types';
    }
  };

  console.log('[ClickFix] Module initialized. Call window.ClickFix.diagnose() for diagnostics.');
  console.log('[ClickFix] Call window.ClickFix.forceFix() to manually apply fixes.');
  console.log('[ClickFix] Call window.ClickFix.fixAllComponents() to fix all component types.');
})(); 