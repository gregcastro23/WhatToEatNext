export let themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      let systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })()
` 