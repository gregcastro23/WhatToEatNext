/**
 * safePopupImplementation.js
 * A standalone, dependency-free implementation of popup functionality that won't
 * be affected by external scripts or lockdown.
 */

// Define safe popup in a closure to protect it
(function() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  console.log('[SafePopupImpl] Installing standalone popup implementation');
  
  // Create a standalone popup implementation
  const createStandalonePopup = () => {
    // Private data store - can't be accessed directly from outside
    const state = {
      isShown: false,
      content: '',
      position: 'center',
      type: 'default',
      element: null
    };
    
    /**
     * Creates a popup with configurable options
     * @returns {Object} - Methods to control the popup
     */
    const create = function(content, options = {}) {
      // Default options
      const {
        duration = 3000,
        type = 'default',
        position = 'center',
        callback = null
      } = options;
      
      console.log('[SafePopupImpl] Creating popup:', content);
      
      // Store current state
      state.content = content || '';
      state.position = position;
      state.type = type;
      
      // Return control methods
      return {
        show: function() {
          console.log('[SafePopupImpl] Showing popup');
          state.isShown = true;
          
          // Create popup element if it doesn't exist
          if (!state.element) {
            state.element = document.createElement('div');
            state.element.className = `safe-popup safe-popup-${state.type} safe-popup-${state.position}`;
            
            // Create content container using DOM methods instead of innerHTML
            const contentContainer = document.createElement('div');
            contentContainer.className = 'safe-popup-content';
            
            // Set content safely
            if (typeof state.content === 'string') {
              contentContainer.textContent = state.content;
            } else if (state.content instanceof HTMLElement) {
              contentContainer.appendChild(state.content);
            }
            
            state.element.appendChild(contentContainer);
            
            // Add basic styles
            const style = document.createElement('style');
            style.textContent = `
              .safe-popup {
                position: fixed;
                padding: 1rem 1.5rem;
                background: #ffffff;
                color: #333333;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                transition: all 0.3s ease;
                opacity: 0;
                pointer-events: auto;
              }
              .safe-popup.show {
                opacity: 1;
              }
              .safe-popup-center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              .safe-popup-top {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
              }
              .safe-popup-bottom {
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
              }
              .safe-popup-success { background: #4caf50; color: white; }
              .safe-popup-error { background: #f44336; color: white; }
              .safe-popup-warning { background: #ff9800; color: white; }
              .safe-popup-info { background: #2196f3; color: white; }
            `;
            document.head.appendChild(style);
            
            // Add click handler to dismiss
            state.element.addEventListener('click', () => {
              this.hide();
            });
            
            // Add to document
            document.body.appendChild(state.element);
          }
          
          // Show the popup
          setTimeout(() => {
            if (state.element) {
              state.element.classList.add('show');
            }
          }, 10);
          
          // Auto-hide after duration
          if (duration > 0) {
            setTimeout(() => {
              this.hide();
              
              // Execute callback if provided
              if (typeof callback === 'function') {
                callback();
              }
            }, duration);
          }
          
          return this;
        },
        
        hide: function() {
          console.log('[SafePopupImpl] Hiding popup');
          state.isShown = false;
          
          if (state.element) {
            state.element.classList.remove('show');
            
            // Remove after transition
            setTimeout(() => {
              if (state.element && state.element.parentNode) {
                state.element.parentNode.removeChild(state.element);
                state.element = null;
              }
            }, 300);
          }
          
          return this;
        },
        
        update: function(content) {
          console.log('[SafePopupImpl] Updating popup');
          state.content = content || state.content;
          
          if (state.element) {
            const contentElement = state.element.querySelector('.safe-popup-content');
            if (contentElement) {
              // Clear existing content
              while (contentElement.firstChild) {
                contentElement.removeChild(contentElement.firstChild);
              }
              
              // Set new content safely
              if (typeof content === 'string') {
                contentElement.textContent = content || '';
              } else if (content instanceof HTMLElement) {
                contentElement.appendChild(content);
              }
            }
          }
          
          return this;
        },
        
        on: function(event, _handler) {
          console.log('[SafePopupImpl] Adding event listener:', event);
          // Return an object with off method
          return {
            off: function() {
              console.log('[SafePopupImpl] Removing event listener:', event);
              // Implementation here if needed
            }
          };
        }
      };
    };
    
    // Return a full popup object with top-level methods
    return {
      create: create,
      show: function(content, options) {
        return create(content, options).show();
      },
      hide: function() {
        if (state.element) {
          state.element.classList.remove('show');
          setTimeout(() => {
            if (state.element && state.element.parentNode) {
              state.element.parentNode.removeChild(state.element);
              state.element = null;
            }
          }, 300);
        }
        return this;
      },
      update: function(content) {
        if (state.element) {
          const contentElement = state.element.querySelector('.safe-popup-content');
          if (contentElement) {
            // Clear existing content
            while (contentElement.firstChild) {
              contentElement.removeChild(contentElement.firstChild);
            }
            
            // Set new content safely
            if (typeof content === 'string') {
              contentElement.textContent = content || '';
            } else if (content instanceof HTMLElement) {
              contentElement.appendChild(content);
            }
          }
        }
        return this;
      },
      isInitialized: true
    };
  };
  
  // Create the standalone popup
  const standalonePopup = createStandalonePopup();
  
  // Safely install it if window.popup doesn't exist or doesn't have create
  if (!window.popup || !window.popup.create) {
    console.log('[SafePopupImpl] Installing standalone popup');
    window.popup = standalonePopup;
  } else {
    console.log('[SafePopupImpl] popup.create already exists, preserving original with fallback');
    // Backup the original create method
    const originalCreate = window.popup.create;
    
    // Replace with a version that falls back to our implementation if original fails
    window.popup.create = function() {
      try {
        return originalCreate.apply(window.popup, arguments);
      } catch (error) {
        console.warn('[SafePopupImpl] Original popup.create failed, using fallback:', error);
        return standalonePopup.create.apply(standalonePopup, arguments);
      }
    };
  }
  
  // Expose a safe reference that can be imported directly
  window.__safePopup = standalonePopup;
  
  console.log('[SafePopupImpl] Standalone popup installed successfully');
})();

// Export empty object for ESM compatibility
export default {}; 