'use client';

import Script from 'next/script';

export function ThemeScript() {
  return (
    <Script
      id='theme-script'
      strategy='beforeInteractive'
      dangerouslySetInnerHTML={{
        __html: `
          try {
            let theme = 'light';
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
              theme = savedTheme;
            } else if (systemPrefersDark) {
              theme = 'dark';
            }
            
            document.documentElement.setAttribute('data-theme', theme);
          } catch (e) {
            document.documentElement.setAttribute('data-theme', 'light');
          }
        `,
      }}
    />
  );
}
