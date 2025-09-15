declare module 'swe' {
  export const _SEFLG_SWIEPH: number;
  export const _SEFLG_SPEED: number;
  export const _SE_PLUTO: number;

  export function init(): Promise<void>;
  export function julday(year: number, month: number, day: number, hour: number): number;
  export function calc_ut(
    julianDate: number,
    planet: number,
    flags: number,
  ): {
    longitude: number;
    latitude: number;
    distance: number;
  };
}
