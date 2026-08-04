/**
 * `tz-lookup` ships no types (CC0, zero deps, a rasterized form of the official
 * tz boundary shapefile). Declared here rather than pulled from DefinitelyTyped
 * so the contract we rely on is stated in-repo.
 *
 * Throws a RangeError on out-of-range coordinates rather than returning null,
 * which is why `resolveBirthZone` wraps the call in a try/catch.
 */
declare module "tz-lookup" {
  /**
   * @param latitude  degrees, −90…90
   * @param longitude degrees, −180…180
   * @returns the IANA zone name covering that point, e.g. "America/New_York".
   *          Every land and sea point resolves; the function does not return null.
   */
  export default function tzLookup(latitude: number, longitude: number): string;
}
