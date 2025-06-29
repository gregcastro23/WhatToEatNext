import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Targeted critical initialization focused on Chrome Extension API issues */}
          <script
            id="critical-init"
            dangerouslySetInnerHTML={{
              __html: `
              // Critical initialization to prevent Chrome Extension API errors
              (function() {
                try {
                  // Create the minimal chrome API structure to prevent errors before the full mock loads
                  if (typeof window.chrome === 'undefined') {
                    window.chrome = {
                      tabs: {
                        create: function(options) {
                          // console.log('[CriticalInit] Intercepting chrome.tabs.create early');
                          return Promise.resolve({id: 999, url: options?.url || 'about:blank'});
                        }
                      },
                      runtime: {
                        lastError: null,
                        sendMessage: function() { return true; },
                        onMessage: { addListener: function() {}, removeListener: function() {} }
                      }
                    };
                  }
                  
                  // Create minimal popup object to handle early access
                  window.popup = {
                    create: function() {
                      return {
                        show: function() { return this; },
                        hide: function() { return this; },
                        update: function() { return this; },
                        on: function() { return { off: function() {} }; }
                      };
                    }
                  };
                  
                  // Also protect window.open
                  const originalWindowOpen = window.open;
                  window.open = function(url, target, features) {
                    // console.log('[CriticalInit] Window.open intercepted:', url);
                    // For known extension URLs, don't actually open them
                    if (url && (
                      url.startsWith('chrome-extension:') || 
                      url.includes('popup') ||
                      url.includes('chrome')
                    )) {
                      // console.log('[CriticalInit] Prevented opening extension URL:', url);
                      return null;
                    }
                    return originalWindowOpen.apply(window, arguments);
                  };
                  
                  // console.log('[CriticalInit] Chrome API protection initialized');
                } catch (e) {
                  // console.error('[CriticalInit] Error during initialization:', e);
                }
              })();
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 