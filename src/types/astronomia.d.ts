// Create type declarations for astronomia modules
declare module 'astronomia' {
  export const solar: {
    apparentLongitude(jd: number): number;
    apparentVSOP87(jd: number): {
      lon: number;
      lat: number;
      range: number;
    };
  };

  export const moon: {
    position(jd: number): {
      lon: number;
      lat: number;
      range: number;
    };
    phase(jd: number): number;
  };

  export const julian: {
    CalendarGregorianToJD(year: number, month: number, day: number): number;
    JDToCalendarGregorian(jd: number): { year: number; month: number; day: number };
  };

  export const planetposition: {
    Planet: new (name: string) => {
      position(jd: number): {
        lon: number;
        lat: number;
        range: number;
      };
      name: string;
    };
  };

  export const moonphase: {
    phaseAngle(jd: number): number;
    phase(jd: number): number;
    nextQuarter(jd: number): { quarter: number; jde: number };
  };
}
