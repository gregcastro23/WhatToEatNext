// Theme initialization script
(function () {
  try {
    let theme = 'light';

    // Try to get theme from localStorage
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        theme = savedTheme;
      } else {
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          theme = 'dark';
        }
      }
    } catch (e) {
      console.warn('Unable to access localStorage for theme preference');
    }

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Also add class for compatibility with tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    console.log('[ThemeScript] Applied theme:', theme);
  } catch (e) {
    console.error('[ThemeScript] Error initializing theme:', e);

    // Fallback to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
