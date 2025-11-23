/**
 * Type definitions for swisseph-v2
 * Swiss Ephemeris binding for Node.js with modern API
 * @see https://www.npmjs.com/package/swisseph-v2
 * @see https://www.astro.com/swisseph/swephprg.htm
 */

declare module "swisseph-v2" {
  /**
   * Planetary and celestial body constants
   */
  export const SE_SUN: number;
  export const SE_MOON: number;
  export const SE_MERCURY: number;
  export const SE_VENUS: number;
  export const SE_MARS: number;
  export const SE_JUPITER: number;
  export const SE_SATURN: number;
  export const SE_URANUS: number;
  export const SE_NEPTUNE: number;
  export const SE_PLUTO: number;
  export const SE_MEAN_NODE: number; // Mean lunar node (Rahu)
  export const SE_TRUE_NODE: number; // True lunar node
  export const SE_MEAN_APOG: number; // Mean lunar apogee (Lilith)
  export const SE_OSCU_APOG: number; // Osculating lunar apogee
  export const SE_CHIRON: number;
  export const SE_ASC: number; // Ascendant
  export const SE_MC: number; // Midheaven

  /**
   * Calculation flags
   */
  export const SEFLG_JPLEPH: number; // Use JPL ephemeris
  export const SEFLG_SWIEPH: number; // Use Swiss ephemeris
  export const SEFLG_MOSEPH: number; // Use Moshier ephemeris
  export const SEFLG_HELCTR: number; // Heliocentric positions
  export const SEFLG_TRUEPOS: number; // True positions (not apparent)
  export const SEFLG_J2000: number; // No precession (J2000)
  export const SEFLG_NONUT: number; // No nutation
  export const SEFLG_SPEED3: number; // Speed from 3 positions
  export const SEFLG_SPEED: number; // High precision speed
  export const SEFLG_NOGDEFL: number; // No gravitational deflection
  export const SEFLG_NOABERR: number; // No aberration
  export const SEFLG_EQUATORIAL: number; // Equatorial positions
  export const SEFLG_XYZ: number; // Cartesian coordinates
  export const SEFLG_RADIANS: number; // Angles in radians
  export const SEFLG_BARYCTR: number; // Barycentric positions
  export const SEFLG_TOPOCTR: number; // Topocentric positions
  export const SEFLG_SIDEREAL: number; // Sidereal positions

  /**
   * Zodiac mode constants
   */
  export const SE_SIDM_FAGAN_BRADLEY: number; // Fagan/Bradley ayanamsa
  export const SE_SIDM_LAHIRI: number; // Lahiri ayanamsa
  export const SE_SIDM_DELUCE: number; // De Luce ayanamsa
  export const SE_SIDM_RAMAN: number; // Raman ayanamsa
  export const SE_SIDM_USHASHASHI: number; // Usha/Shashi ayanamsa
  export const SE_SIDM_KRISHNAMURTI: number; // Krishnamurti ayanamsa
  export const SE_SIDM_DJWHAL_KHUL: number; // Djwhal Khul ayanamsa
  export const SE_SIDM_YUKTESHWAR: number; // Yukteshwar ayanamsa
  export const SE_SIDM_JN_BHASIN: number; // JN Bhasin ayanamsa
  export const SE_SIDM_BABYL_KUGLER1: number; // Babylonian (Kugler 1)
  export const SE_SIDM_BABYL_KUGLER2: number; // Babylonian (Kugler 2)
  export const SE_SIDM_BABYL_KUGLER3: number; // Babylonian (Kugler 3)
  export const SE_SIDM_BABYL_HUBER: number; // Babylonian (Huber)
  export const SE_SIDM_BABYL_ETPSC: number; // Babylonian (ETPSC)
  export const SE_SIDM_ALDEBARAN_15TAU: number; // Aldebaran at 15 Taurus
  export const SE_SIDM_HIPPARCHOS: number; // Hipparchos
  export const SE_SIDM_SASSANIAN: number; // Sassanian
  export const SE_SIDM_GALCENT_0SAG: number; // Galactic center at 0 Sagittarius
  export const SE_SIDM_J2000: number; // J2000
  export const SE_SIDM_J1900: number; // J1900
  export const SE_SIDM_B1950: number; // B1950
  export const SE_SIDM_TRUE_CITRA: number; // True Citra
  export const SE_SIDM_TRUE_REVATI: number; // True Revati
  export const SE_SIDM_TRUE_PUSHYA: number; // True Pushya
  export const SE_SIDM_USER: number; // User-defined ayanamsa

  /**
   * Calculation result structure
   */
  export interface CalcResult {
    longitude: number; // Ecliptic longitude in degrees
    latitude: number; // Ecliptic latitude in degrees
    distance: number; // Distance in AU
    longitudeSpeed: number; // Speed in longitude (degrees/day)
    latitudeSpeed: number; // Speed in latitude (degrees/day)
    distanceSpeed: number; // Speed in distance (AU/day)
    error?: string; // Error message if calculation failed
  }

  /**
   * UTC time structure
   */
  export interface UtcTime {
    year: number;
    month: number; // 1-12
    day: number;
    hour: number; // 0-23
    minute: number; // 0-59
    second: number; // 0-59.999...
  }

  /**
   * Julian day result from UTC conversion
   */
  export interface JulianDayResult {
    julianDayET: number; // Julian day in Ephemeris Time
    julianDayUT: number; // Julian day in Universal Time
  }

  /**
   * House system constants
   */
  export const SE_HS_PLACIDUS: string; // 'P' - Placidus
  export const SE_HS_KOCH: string; // 'K' - Koch
  export const SE_HS_PORPHYRIUS: string; // 'O' - Porphyrius
  export const SE_HS_REGIOMONTANUS: string; // 'R' - Regiomontanus
  export const SE_HS_CAMPANUS: string; // 'C' - Campanus
  export const SE_HS_EQUAL: string; // 'A' - Equal (cusp 1 = Asc)
  export const SE_HS_WHOLE_SIGN: string; // 'W' - Whole sign
  export const SE_HS_MERIDIAN: string; // 'X' - Meridian system
  export const SE_HS_VEHLOW_EQUAL: string; // 'V' - Vehlow equal
  export const SE_HS_AXIAL_ROTATION: string; // 'L' - Axial rotation system

  /**
   * Set the ephemeris path
   * @param path Path to ephemeris files directory (optional for Moshier)
   */
  export function swe_set_ephe_path(path: string | null): void;

  /**
   * Set the sidereal mode
   * @param sidMode Sidereal mode constant (SE_SIDM_*)
   * @param t0 Reference date for user-defined ayanamsa (0 for predefined)
   * @param ayanT0 Initial value of ayanamsa for user-defined (0 for predefined)
   */
  export function swe_set_sid_mode(
    sidMode: number,
    t0?: number,
    ayanT0?: number,
  ): void;

  /**
   * Get ayanamsa (precession offset) for a given Julian day
   * @param tjdEt Julian day in Ephemeris Time
   * @returns Ayanamsa value in degrees
   */
  export function swe_get_ayanamsa(tjdEt: number): number;

  /**
   * Get ayanamsa with Universal Time
   * @param tjdUt Julian day in Universal Time
   * @returns Ayanamsa value in degrees
   */
  export function swe_get_ayanamsa_ut(tjdUt: number): number;

  /**
   * Convert UTC to Julian day
   * @param year Year
   * @param month Month (1-12)
   * @param day Day (1-31)
   * @param hour Hour (0-23)
   * @param minute Minute (0-59)
   * @param second Second (0-59.999...)
   * @param gregflag Calendar type (SE_GREG_CAL or SE_JUL_CAL)
   * @returns Julian day result
   */
  export function swe_utc_to_jd(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    gregflag: number,
  ): JulianDayResult;

  /**
   * Convert Julian day to UTC
   * @param tjdUt Julian day in Universal Time
   * @param gregflag Calendar type (SE_GREG_CAL or SE_JUL_CAL)
   * @returns UTC time structure
   */
  export function swe_jdut1_to_utc(tjdUt: number, gregflag: number): UtcTime;

  /**
   * Calculate Julian day from calendar date
   * @param year Year
   * @param month Month (1-12)
   * @param day Day (1-31)
   * @param hour Hour as decimal (e.g., 12.5 for 12:30)
   * @param gregflag Calendar type (SE_GREG_CAL or SE_JUL_CAL)
   * @returns Julian day number
   */
  export function swe_julday(
    year: number,
    month: number,
    day: number,
    hour: number,
    gregflag: number,
  ): number;

  /**
   * Calculate planetary position for a given Julian day and body
   * @param tjdEt Julian day in Ephemeris Time
   * @param ipl Planet/body constant (SE_SUN, SE_MOON, etc.)
   * @param iflag Calculation flags (SEFLG_*)
   * @returns Calculation result with position and speed
   */
  export function swe_calc(
    tjdEt: number,
    ipl: number,
    iflag: number,
  ): CalcResult;

  /**
   * Calculate planetary position using Universal Time
   * @param tjdUt Julian day in Universal Time
   * @param ipl Planet/body constant (SE_SUN, SE_MOON, etc.)
   * @param iflag Calculation flags (SEFLG_*)
   * @returns Calculation result with position and speed
   */
  export function swe_calc_ut(
    tjdUt: number,
    ipl: number,
    iflag: number,
  ): CalcResult;

  /**
   * Calculate houses for a given time and location
   * @param tjdUt Julian day in Universal Time
   * @param latitude Geographic latitude in degrees
   * @param longitude Geographic longitude in degrees (positive east)
   * @param houseSystem House system character (SE_HS_*)
   * @returns Object with cusps and ascmc (Ascendant, MC, etc.)
   */
  export function swe_houses(
    tjdUt: number,
    latitude: number,
    longitude: number,
    houseSystem: string,
  ): {
    cusps: number[]; // House cusps [1-12 or 1-36]
    ascmc: number[]; // [0]=Asc, [1]=MC, [2]=ARMC, [3]=Vertex, [4]=EP, [5]=CE
  };

  /**
   * Close Swiss Ephemeris and free resources
   */
  export function swe_close(): void;

  /**
   * Calendar type constants
   */
  export const SE_GREG_CAL: number; // Gregorian calendar
  export const SE_JUL_CAL: number; // Julian calendar

  /**
   * Delta T constants
   */
  export function swe_deltat(tjd: number): number; // Get Delta T for a Julian day

  /**
   * Get library version
   */
  export function swe_version(): string;

  /**
   * Get planetary name
   */
  export function swe_get_planet_name(ipl: number): string;
}
