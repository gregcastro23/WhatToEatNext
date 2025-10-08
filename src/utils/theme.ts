import { logger } from './logger';

export interface ThemeData {
  mode: 'light' | 'dark' | 'system',
  accent: string
}

export class ThemeManager {
  updateTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  async initializeTheme() {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.updateTheme(savedTheme);
      return savedTheme;
    } catch (error) {
      logger.error('Error initializing theme: ', error);
      this.updateTheme('light');
      return 'light';
    }
  }

  getTheme(): ThemeData {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light';
      const savedAccent = localStorage.getItem('accent-color') || 'blue';

      return {
        mode: savedTheme as 'light' | 'dark' | 'system',
        accent: savedAccent
      }
    } catch (error) {
      logger.error('Error getting theme: ', error);
      return { mode: 'light', accent: 'blue' };
    }
  }
}

export const themeManager = new ThemeManager();
;
export { themeManager as default };
