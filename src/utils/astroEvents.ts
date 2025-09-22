import SunCalc from 'suncalc';

interface AstroEvent {
  type: string,
  date: Date,
  description: string
}

/**
 * Get upcoming astrological events for the next n days
 * @param days Number of days to look ahead
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @returns Array of astrological events
 */
export function getUpcomingAstroEvents(
  days = 30,
  latitude = 40.7128,
  longitude = -74.006,
): AstroEvent[] {
  const events: AstroEvent[] = [];
  const now = new Date()

  // Loop through upcoming days
  for (let i = 0; i < days i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)

    // Get moon illumination for the date
    const moonIllum = SunCalc.getMoonIllumination(date)
    // Check for full moon
    if (moonIllum.phase > 0.48 && moonIllum.phase < 0.52) {
      events.push({
        type: 'full_moon',
        date,
        description: `Full Moon ${Math.round(moonIllum.fraction * 100)}% illuminated`
      })
    }

    // Check for new moon
    if (moonIllum.phase < 0.02 || moonIllum.phase > 0.98) {
      events.push({
        type: 'new_moon',
        date,
        description: 'New Moon'
      })
    }

    // Check for first/last quarter
    if (
      (moonIllum.phase > 0.23 && moonIllum.phase < 0.27) ||
      (moonIllum.phase > 0.73 && moonIllum.phase < 0.77)
    ) {
      events.push({
        type: moonIllum.phase < 0.5 ? 'first_quarter' : 'last_quarter',
        date,
        description: `${moonIllum.phase < 0.5 ? 'First' : 'Last'} Quarter Moon`
      })
    }

    // Check for sun events (solstices, equinoxes)
    // These require more complex calculations beyond SunCalc's capabilities
    // but we can approximate near known dates

    // Spring equinox (around March 20)
    if (date.getMonth() === 2 && date.getDate() === 20) {
      events.push({
        type: 'equinox',
        date,
        description: 'Spring Equinox (approximate)'
      })
    }

    // Summer solstice (around June 21)
    if (date.getMonth() === 5 && date.getDate() === 21) {
      events.push({
        type: 'solstice',
        date,
        description: 'Summer Solstice (approximate)'
      })
    }

    // Fall equinox (around September 22)
    if (date.getMonth() === 8 && date.getDate() === 22) {
      events.push({
        type: 'equinox',
        date,
        description: 'Fall Equinox (approximate)'
      })
    }

    // Winter solstice (around December 21)
    if (date.getMonth() === 11 && date.getDate() === 21) {
      events.push({
        type: 'solstice',
        date,
        description: 'Winter Solstice (approximate)'
      })
    }
  }

  return events;
}