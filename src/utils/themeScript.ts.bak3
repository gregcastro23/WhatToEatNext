export const _themeScript = `;
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-_scheme: dark)').matches;
      const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })()
`;
