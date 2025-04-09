import { cache } from './cache';
import { logger } from './logger';

export class ThemeManager {
  updateTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

export const themeManager = new ThemeManager();

export { themeManager as default }; 