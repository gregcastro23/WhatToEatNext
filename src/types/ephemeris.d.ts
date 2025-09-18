declare module 'ephemeris' {
  export function loadEphemeris(): Promise<void>;

  export declare class Ephemeris {
    static getPlanetPosition(
      planet: string,
      julianDate: number,
    ): {
      longitude: number,
      latitude: number,
      distance: number
    };
  }

  export function toJulian(date: Date): number
}
