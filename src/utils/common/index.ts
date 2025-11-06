import { z } from 'zod';
import { logger } from '../logger';
// ===== THEME MANAGEMENT =====

export interface ThemeData {
  mode: 'light' | 'dark' | 'system';
  accent: string;
}

export class ThemeManager {
  updateTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  async initializeTheme() {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light'
      this.updateTheme(savedTheme)
      return savedTheme;
    } catch (error) {
      logger.error('Error initializing theme: ', error)
      this.updateTheme('light')
      return 'light';
    }
  }

  getTheme(): ThemeData {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light'
      const savedAccent = localStorage.getItem('accent-color') || 'blue'

      return {
        mode: savedTheme as 'light' | 'dark' | 'system',
        accent: savedAccent
      }
    } catch (error) {
      logger.error('Error getting theme: ', error)
      return { mode: 'light', accent: 'blue' }
    }
  }
}

export const themeManager = new ThemeManager();

// ===== ENVIRONMENT VALIDATION =====

const envSchema = z.object({
  _NODE_ENV: z.enum(['development', 'production', 'test']),
  _NEXT_PUBLIC_API_URL: z.string().url().optional()
  // Add other environment variables here
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    _logger.error('Invalid environment variables: ', error)
    process.exit(1)
  }
}

export const env = validateEnv();

export function validateAstrologyConfig() {
  const required = ['NEXT_PUBLIC_PROKERALA_CLIENT_ID', 'NEXT_PUBLIC_PROKERALA_CLIENT_SECRET'];
  const missing = (required || []).filter(key => !process.env[key]);

  if ((missing || []).length > 0) {
    _logger.warn('Missing required environment variables: ', missing);
  }
}

// ===== FEEDBACK COLLECTION =====

export interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  userEmail?: string;
  priority?: 'low' | 'medium' | 'high';
  metadata?: { [key: string]: unknown };
}

/**
 * Collect and process user feedback
 * @param feedback The feedback data submitted by the user
 * @returns Promise that resolves to success status and message
 */
export async function collectFeedback(
  feedback: FeedbackData,
): Promise<{ success: boolean, message: string }> {
  try {
    // Validate feedback data
    if (!feedback.title || !feedback.description || !feedback.type) {
      return {
        success: false,
        message: 'Missing required feedback fields: title, description, and type are required'
      };
    }

    // Log feedback for development purposes
    logger.info('Received user feedback', {
      type: feedback.type,
      title: feedback.title,
      priority: feedback.priority || 'medium'
    });

    // In a real application, you would send this to a server/API endpoint
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Thank you for your feedback! We will review it shortly.'
    };
  } catch (error) {
    logger.error('Error processing feedback', error);
    return {
      success: false,
      message: 'Failed to process feedback. Please try again later.'
    };
  }
}

/**
 * Utility to get feedback categories for UI display
 * @returns Array of feedback categories
 */
export function getFeedbackCategories(): Array<{ id: string, label: string }> {
  return [
    { id: 'bug', label: 'Report a Bug' },
    { id: 'feature', label: 'Request a Feature' },
    { id: 'improvement', label: 'Suggest Improvement' },
    { id: 'other', label: 'Other Feedback' }
  ];
}

// ===== EXPORTS =====
export { themeManager as default };
