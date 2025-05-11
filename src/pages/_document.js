import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 
          PRIORITY 1: Load the Chrome API initialization script that defines
          popup.create BEFORE popup.js can try to use it 
        */}
        <Script
          src="/init-chrome-api.js"
          strategy="beforeInteractive"
          id="chrome-api-init"
        />
        
        {/* PRIORITY 2: Load popup.js after initialization */}
        <Script
          src="/popup.js"
          strategy="beforeInteractive"
          id="popup-js"
        />

        {/* PRIORITY 3: Load error handlers */}
        <Script
          src="/error-handlers.js"
          strategy="beforeInteractive"
          id="error-handlers"
        />
        
        {/* PRIORITY 4: Load theme script */}
        <Script
          src="/theme-script.js"
          strategy="beforeInteractive"
          id="theme-script"
        />
      </Head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 