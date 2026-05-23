// Lightweight in-process stub for the alchemical kinetics service.
// Computes a deterministic planetary hour from the requested date and a
// latitude-modulated power curve, so consumers get values that vary with
// the inputs they pass. The remote backend will replace this once the
// kinetics ingestion endpoint lands (see consciousness-memory.ts).

const CHALDEAN_HOURS = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
] as const;

// Day-of-week → planet ruling the first hour after sunrise (Sun=0..Saturn=6)
const DAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

export interface KineticsGetArgs {
  lat: number;
  lon: number;
  date?: string;
  includeElemental?: boolean;
  includePlanetary?: boolean;
  window?: number;
  validateTraditional?: boolean;
}

export interface KineticsPutArgs {
  lat: number;
  lon: number;
  "start-time": string;
  "end-time": string;
  "time-interval"?: number;
  exportFormat?: "json" | "csv";
}

function planetaryHourSequence(reference: Date): string[] {
  const dayRuler = DAY_RULERS[reference.getDay()];
  const start = CHALDEAN_HOURS.indexOf(dayRuler);
  const hour = reference.getHours();
  // 24 hours starting at sunrise (~6am); wrap past midnight.
  const offset = (hour - 6 + 24) % 24;
  return Array.from({ length: 24 }, (_, i) => CHALDEAN_HOURS[(start + offset + i) % 7]);
}

function powerCurve(lat: number, hours: number): Array<{ power: number }> {
  // Power waxes/wanes through the day; equatorial latitudes get a flatter
  // curve, polar latitudes a sharper one. Bounded to [0.4, 1.0].
  const latFactor = 1 - Math.min(Math.abs(lat) / 90, 1) * 0.4;
  return Array.from({ length: hours }, (_, i) => {
    const phase = (i / hours) * 2 * Math.PI;
    const base = 0.7 + Math.sin(phase) * 0.3 * latFactor;
    return { power: Math.max(0.4, Math.min(1, base)) };
  });
}

function seasonalInfluence(reference: Date, lat: number): string {
  // Northern vs southern hemisphere flip
  const month = reference.getMonth();
  const northern = lat >= 0;
  const north = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer",
    "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];
  const south = ["Summer", "Summer", "Fall", "Fall", "Fall", "Winter",
    "Winter", "Winter", "Spring", "Spring", "Spring", "Summer"];
  return (northern ? north : south)[month];
}

export const AlchemicalKineticsClient = {
  get: async (args: KineticsGetArgs) => {
    const reference = args.date ? new Date(args.date) : new Date();
    const window = Math.max(1, args.window ?? 6);
    const includePlanetary = args.includePlanetary ?? true;
    const includeElemental = args.includeElemental ?? false;

    return {
      power: powerCurve(args.lat, window),
      momentum: includeElemental ? 1 + Math.cos((args.lon * Math.PI) / 180) * 0.2 : 1,
      timing: {
        planetaryHours: includePlanetary ? planetaryHourSequence(reference) : [],
        seasonalInfluence: seasonalInfluence(reference, args.lat),
      },
    };
  },

  put: async (args: KineticsPutArgs) => {
    const start = new Date(args["start-time"]);
    const end = new Date(args["end-time"]);
    const intervalMin = Math.max(1, args["time-interval"] ?? 60);
    const sampleCount = Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / (intervalMin * 60 * 1000)) + 1,
    );

    const data = Array.from({ length: sampleCount }, (_, i) => ({
      Timestamp: new Date(start.getTime() + i * intervalMin * 60 * 1000).toISOString(),
      Total_Spirit: 0,
      Total_Essence: 0,
      Total_Matter: 0,
      Total_Substance: 0,
      Heat: 0,
      Entropy: 0,
    }));

    const payload = { data };
    const exportFormat = args.exportFormat ?? "json";

    return {
      ok: true,
      json: async () => payload,
      text: async () =>
        exportFormat === "csv"
          ? ["Timestamp,Total_Spirit,Total_Essence,Total_Matter,Total_Substance,Heat,Entropy"]
              .concat(
                data.map(
                  (d) =>
                    `${d.Timestamp},${d.Total_Spirit},${d.Total_Essence},${d.Total_Matter},${d.Total_Substance},${d.Heat},${d.Entropy}`,
                ),
              )
              .join("\n")
          : JSON.stringify(payload),
    };
  },
};
