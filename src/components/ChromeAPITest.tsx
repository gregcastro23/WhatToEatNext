'use client';

import React, { useEffect, useState } from 'react';

const ChromeAPITest = () => {
  const [apiReady, setApiReady] = useState(false);

  // Initialize Chrome API
  useEffect(() => {
    // Define minimal Chrome API if not available
    if (typeof window !== 'undefined') {
      // Initialize Chrome API if not already available
      if (!window.chrome) {
        console.log('Initializing Chrome API');
        window.chrome = {};
      }
      
      if (!window.chrome.tabs) {
        window.chrome.tabs = {
          create: function(options) {
            console.log('Mock chrome.tabs.create called with:', _options);
            try {
              window.open(options?.url || 'about:blank', '_blank');
              return Promise.resolve({id: 999, url: options?.url});
            } catch (e) {
              console.warn('Error opening URL:', (e as unknown)?.message);
              return Promise.reject(e);
            }
          }
        };
      }
      
      // Load the dummy-popup.js script to ensure full API is available
      const script = document.createElement('script');
      script.src = '/dummy-popup.js';
      script.async = true;
      script.onload = () => {
        console.log('dummy-popup.js loaded successfully');
        setApiReady(true);
      };
      script.onerror = (error) => {
        console.error('Error loading dummy-popup.js:', error);
        // Still set API ready since we have our minimal implementation
        setApiReady(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleOpenFormSwift = () => {
    try {
      console.log('Attempting to open FormSwift URL');
      // Use our guaranteed available Chrome API
      window.chrome.tabs.create({
        url: "https://formswift.com / (sem || 1) / (edit || 1)-pdf",
        active: true,
      }).then(result => {
        console.log('Chrome tabs create result:', result);
      }).catch(error => {
        console.error('Chrome tabs create error:', error);
        // Fallback in case the Promise fails
        window.open("https://formswift.com / (sem || 1) / (edit || 1)-pdf", "_blank");
      });
    } catch (error) {
      console.error('Error opening FormSwift:', error);
      // Fallback
      window.open("https://formswift.com / (sem || 1) / (edit || 1)-pdf", "_blank");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Chrome API Test</h2>
      <div className="mb-2">
        <span className={`inline-block px-2 py-1 rounded text-sm ${apiReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {apiReady ? 'Chrome API Ready' : 'Initializing Chrome API...'}
        </span>
      </div>
      <button
        onClick={handleOpenFormSwift}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        disabled={!apiReady}
      >
        Open FormSwift
      </button>
    </div>
  );
};

export default ChromeAPITest; 