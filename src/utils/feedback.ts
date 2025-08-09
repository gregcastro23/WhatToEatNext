// User feedback collection utility
import { logger } from './logger';

// Interface for feedback data structure
export interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  userEmail?: string;
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}

/**
 * Collect and process user feedback
 * @param feedback The feedback data submitted by the user
 * @returns Promise that resolves to success status and message
 */
export async function collectFeedback(
  feedback: FeedbackData,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate feedback data
    if (!feedback.title || !feedback.description || !feedback.type) {
      return {
        success: false,
        message: 'Missing required feedback fields: title, description, and type are required',
      };
    }

    // Log feedback for development purposes
    logger.info('Received user feedback', {
      type: feedback.type,
      title: feedback.title,
      priority: feedback.priority || 'medium',
    });

    // In a real application, you would send this to a server/API endpoint
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Thank you for your feedback! We will review it shortly.',
    };
  } catch (error) {
    logger.error('Error processing feedback', error);
    return {
      success: false,
      message: 'Failed to process feedback. Please try again later.',
    };
  }
}

/**
 * Utility to get feedback categories for UI display
 * @returns Array of feedback categories
 */
export function getFeedbackCategories(): { id: string; label: string }[] {
  return [
    { id: 'bug', label: 'Report a Bug' },
    { id: 'feature', label: 'Request a Feature' },
    { id: 'improvement', label: 'Suggest Improvement' },
    { id: 'other', label: 'Other Feedback' },
  ];
}
