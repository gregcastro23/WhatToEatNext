import { NextApiRequest, NextApiResponse } from 'next';

import { testCookingMethodRecommendations } from '../../../utils/testRecommendations';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Run our test function
    const testResults = testCookingMethodRecommendations()

    // Return the results
    res.status(200).json({
      success: true,
      data: testResults,
      message: 'Test completed successfully'
    })
  } catch (error) {
    // _logger.error('Error in test endpoint:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test failed'
    })
  }
}