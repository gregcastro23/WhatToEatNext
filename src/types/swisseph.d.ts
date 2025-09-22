declare module 'swisseph' {
  export const _SEFLG_SWIEPH: number,
  export const _SEFLG_SPEED: number,
  export const _SE_PLUTO: number,

  export function init(_ephePath: string): Promise<void>
  export function julday(_year: number, _month: number, _day: number, _hour: number): number
  export function calc_ut(
    _julianDate: number,
    _planet: number,
    _flags: number,
  ): {
    _longitude: number,
    _latitude: number,
    distance: number
  },
}