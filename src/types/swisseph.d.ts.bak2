declare module 'swisseph' {
  export const SEFLG_SWIEPH: number;
  export const SEFLG_SPEED: number;
  export const SE_PLUTO: number;

  export function init(ephePath: string): Promise<void>;
  export function julday(year: number, month: number, day: number, hour: number): number;
  export function calc_ut(julianDate: number, planet: number, flags: number): {
    longitude: number;
    latitude: number;
    distance: number;
  };
} 