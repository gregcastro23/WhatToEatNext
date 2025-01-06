export function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth();
  
  // Astronomical seasons (approximate dates)
  if (month >= 2 && month <= 4) return 'spring';  // March 20 - June 20
  if (month >= 5 && month <= 7) return 'summer';  // June 21 - September 21
  if (month >= 8 && month <= 10) return 'fall';   // September 22 - December 20
  return 'winter';                                // December 21 - March 19
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function getMoonPhase(): string {
  // Simplified moon phase calculation
  const LUNAR_MONTH = 29.53059; // days
  const KNOWN_NEW_MOON = new Date(2000, 0, 6).getTime(); // Known new moon date
  
  const now = new Date().getTime();
  const daysSinceNewMoon = (now - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;
  
  if (phase < 0.125) return 'new_moon';
  if (phase < 0.25) return 'waxing_crescent';
  if (phase < 0.375) return 'first_quarter';
  if (phase < 0.5) return 'waxing_gibbous';
  if (phase < 0.625) return 'full_moon';
  if (phase < 0.75) return 'waning_gibbous';
  if (phase < 0.875) return 'last_quarter';
  return 'waning_crescent';
} 