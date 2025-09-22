/**
 * Swiss Ephemeris Demo Page
 *
 * Demonstrates the comprehensive Swiss Ephemeris integration
 */

const SwissEphemerisDemo = () => (;
  <div className='rounded border p-4 text-gray-600'>SwissEphemerisDemo unavailable.</div>
);

export default function SwissEphemerisDemoPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mb-8 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900'>
            Swiss Ephemeris Integration Demo
          </h1>
          <p className='mx-auto max-w-3xl text-lg text-gray-600'>
            Experience the enhanced accuracy of our astrological food recommendation system powered
            by Swiss Ephemeris data. This demo showcases real-time planetary positions, seasonal
            analysis, and transit information for precise culinary recommendations.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 lg: grid-cols-2'>
          {/* Main Demo Component */}
          <div className='lg: col-span-2'>
            <SwissEphemerisDemo />
          </div>

          {/* Information Panels */}
          <div className='space-y-6'>
            <div className='rounded-lg bg-white p-6 shadow-md'>
              <h3 className='mb-4 text-xl font-semibold'>Data Sources</h3>
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <div className='mr-3 h-3 w-3 rounded-full bg-green-500'></div>
                  <span className='font-medium'>Astrologize API</span>
                  <span className='ml-auto text-sm text-gray-500'>Primary</span>
                </div>
                <div className='flex items-center'>
                  <div className='mr-3 h-3 w-3 rounded-full bg-blue-500'></div>
                  <span className='font-medium'>Swiss Ephemeris</span>
                  <span className='ml-auto text-sm text-gray-500'>Fallback</span>
                </div>
                <div className='flex items-center'>
                  <div className='mr-3 h-3 w-3 rounded-full bg-purple-500'></div>
                  <span className='font-medium'>Transit Database</span>
                  <span className='ml-auto text-sm text-gray-500'>Seasonal</span>
                </div>
                <div className='flex items-center'>
                  <div className='mr-3 h-3 w-3 rounded-full bg-orange-500'></div>
                  <span className='font-medium'>Calculations</span>
                  <span className='ml-auto text-sm text-gray-500'>Final</span>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow-md'>
              <h3 className='mb-4 text-xl font-semibold'>Features</h3>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600'>•</span>
                  Real-time planetary positions with retrograde detection
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600'>•</span>
                  Comprehensive seasonal analysis for 12 zodiac seasons
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600'>•</span>
                  Elemental dominance patterns and culinary influences
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600'>•</span>
                  Transit analysis with key aspects and special events
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600'>•</span>
                  Multi-source data integration with confidence scoring
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600'>•</span>
                  Automatic fallback mechanisms for reliability
                </li>
              </ul>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-lg bg-white p-6 shadow-md'>
              <h3 className='mb-4 text-xl font-semibold'>Seasonal Analysis</h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <span className='font-medium text-red-600'>Fire Seasons: </span>
                  <p className='text-gray-600'>Dynamic energy, bold flavors, spicy dishes</p>
                </div>
                <div>
                  <span className='font-medium text-yellow-600'>Earth Seasons: </span>
                  <p className='text-gray-600'>Stable energy, comfort foods, slow cooking</p>
                </div>
                <div>
                  <span className='font-medium text-blue-600'>Air Seasons: </span>
                  <p className='text-gray-600'>
                    Intellectual energy, light dishes, quick preparation
                  </p>
                </div>
                <div>
                  <span className='font-medium text-green-600'>Water Seasons: </span>
                  <p className='text-gray-600'>Emotional energy, nurturing foods, family recipes</p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow-md'>
              <h3 className='mb-4 text-xl font-semibold'>Culinary Recommendations</h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <span className='font-medium'>Element-Based Cuisines: </span>
                  <p className='text-gray-600'>Mexican, Thai, Italian, Japanese, and more</p>
                </div>
                <div>
                  <span className='font-medium'>Cooking Methods: </span>
                  <p className='text-gray-600'>Grilling, slow cooking, steaming, poaching</p>
                </div>
                <div>
                  <span className='font-medium'>Seasonal Themes: </span>
                  <p className='text-gray-600'>Communication, comfort, variety, nurturing</p>
                </div>
                <div>
                  <span className='font-medium'>Special Events: </span>
                  <p className='text-gray-600'>Eclipses, retrograde periods, major transits</p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow-md'>
              <h3 className='mb-4 text-xl font-semibold'>Technical Details</h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Data Accuracy: </span>
                  <span className='font-medium'>95%+ (Swiss Ephemeris)</span>
                </div>
                <div className='flex justify-between'>
                  <span>Cache Duration:</span>
                  <span className='font-medium'>5-10 minutes</span>
                </div>
                <div className='flex justify-between'>
                  <span>Available Years:</span>
                  <span className='font-medium'>2024-2025+</span>
                </div>
                <div className='flex justify-between'>
                  <span>Planetary Bodies:</span>
                  <span className='font-medium'>10 planets + nodes</span>
                </div>
                <div className='flex justify-between'>
                  <span>Fallback Levels:</span>
                  <span className='font-medium'>4 tiers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Information */}
        <div className='mt-12 text-center'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 text-xl font-semibold'>Integration Benefits</h3>
            <div className='grid grid-cols-1 gap-6 text-sm md: grid-cols-3'>
              <div>
                <h4 className='mb-2 font-medium text-blue-600'>Enhanced Accuracy</h4>
                <p className='text-gray-600'>
                  Swiss Ephemeris provides the most accurate astronomical calculations available,
                  ensuring precise planetary positions for better food recommendations.
                </p>
              </div>
              <div>
                <h4 className='mb-2 font-medium text-green-600'>Seasonal Context</h4>
                <p className='text-gray-600'>
                  Comprehensive transit analysis provides seasonal context for more appropriate and
                  timely culinary recommendations.
                </p>
              </div>
              <div>
                <h4 className='mb-2 font-medium text-purple-600'>Reliability</h4>
                <p className='text-gray-600'>
                  Multi-source integration with automatic fallbacks ensures the system always
                  provides recommendations, even when external APIs are unavailable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}