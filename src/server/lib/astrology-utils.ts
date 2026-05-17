import * as Astronomy from "astronomy-engine";
import { 
  type PlanetaryRequest, 
  type RailwayPositionsResponse, 
  type RailwayPlanetData 
} from "../../lib/validation/railway.js";

export interface ArcDegrees {
  degrees: number;
  minutes: number;
  seconds: number;
}

export interface CelestialBody {
  key: string;
  label: string;
  Sign: { key: string; zodiac: string; label: string };
  ChartPosition: { Ecliptic: { DecimalDegrees: number; ArcDegrees: ArcDegrees } };
  isRetrograde: boolean;
}

export interface AscendantData {
  sign: string;
  degree: number;
  minute: number;
  exactLongitude: number;
}

export interface AstrologizeResponse {
  success: boolean;
  _celestialBodies: { all: CelestialBody[] } & Record<string, CelestialBody | CelestialBody[]>;
  ascendant?: AscendantData;
  birth_info: {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
    ayanamsa: string;
  };
  source: string;
  precision: string;
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const PLANET_MAPPING: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

export function getSignFromLongitude(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: ZODIAC_SIGNS[signIndex] || "aries", degree };
}

function isPlanetRetrograde(body: Astronomy.Body, date: Date): boolean {
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) return false;
  // Retrograde is GEOCENTRIC. Astronomy.EclipticLongitude returns heliocentric
  // for non-Moon bodies (which never goes retrograde), so we must use
  // GeoVector → Ecliptic here.
  const astroTime = new Astronomy.AstroTime(date);
  const prevTime = new Astronomy.AstroTime(new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000));
  const currentLong = Astronomy.Ecliptic(Astronomy.GeoVector(body, astroTime, true)).elon;
  const prevLong = Astronomy.Ecliptic(Astronomy.GeoVector(body, prevTime, true)).elon;
  let diff = currentLong - prevLong;
  if (Math.abs(diff) > 180) diff = diff > 0 ? diff - 360 : diff + 360;
  return diff < 0;
}

export function formatRailwayResponse(
  railwayData: RailwayPositionsResponse,
  params: PlanetaryRequest,
): AstrologizeResponse {
  const planetKeys = [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
  ];

  const bodies: Record<string, CelestialBody> = {};
  const allBodies: CelestialBody[] = [];

  const positionsData =
    railwayData.planetary_positions ??
    railwayData.positions ??
    (railwayData as Record<string, RailwayPlanetData>);

  for (const key of planetKeys) {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    const planetData = (positionsData)[key] ?? (positionsData)[capitalizedKey];
    if (!planetData || typeof planetData !== "object") continue;

    const pd = planetData;
    const longitude = pd.exactLongitude ?? pd.longitude ?? pd.eclipticLongitude ?? 0;

    const { sign, degree: degreeInSign } = getSignFromLongitude(longitude);
    const degrees = Math.floor(degreeInSign);
    const minutes = Math.floor((degreeInSign - degrees) * 60);
    const seconds = Math.round(((degreeInSign - degrees) * 60 - minutes) * 60);

    const body: CelestialBody = {
      key,
      label: capitalizedKey,
      Sign: {
        key: sign,
        zodiac: sign,
        label: sign.charAt(0).toUpperCase() + sign.slice(1),
      },
      ChartPosition: {
        Ecliptic: {
          DecimalDegrees: longitude,
          ArcDegrees: { degrees, minutes, seconds },
        },
      },
      isRetrograde: Boolean(pd.isRetrograde ?? pd.retrograde ?? false),
    };

    bodies[key] = body;
    allBodies.push(body);
  }

  return {
    success: true,
    _celestialBodies: { all: allBodies, ...bodies } as any,
    birth_info: {
      year: params.year,
      month: params.month,
      date: params.date ?? params.day ?? 1,
      hour: params.hour,
      minute: params.minute,
      latitude: params.latitude ?? 0,
      longitude: params.longitude ?? 0,
      ayanamsa: params.zodiacSystem === "sidereal" ? "LAHIRI" : "TROPICAL",
    },
    source: "backend-pyswisseph",
    precision: "NASA JPL DE",
  };
}

export function calculateLocally(params: PlanetaryRequest): AstrologizeResponse {
  const date = new Date(
    Date.UTC(
      params.year,
      params.month - 1,
      params.date ?? params.day ?? 1,
      params.hour,
      params.minute,
    ),
  );
  const astroTime = new Astronomy.AstroTime(date);
  
  const allBodies: CelestialBody[] = [];
  const bodies: Record<string, CelestialBody> = {};

  for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
    let longitude: number;
    if (planet === "Sun") {
       longitude = (Astronomy.EclipticLongitude(Astronomy.Body.Earth, astroTime) + 180) % 360;
    } else {
       const geoVector = Astronomy.GeoVector(body, astroTime, true);
       const ecliptic = Astronomy.Ecliptic(geoVector);
       longitude = ecliptic.elon;
    }
    
    const isRetrograde = isPlanetRetrograde(body, date);
    const { sign, degree: degreeInSign } = getSignFromLongitude(longitude);
    
    const degrees = Math.floor(degreeInSign);
    const minutes = Math.floor((degreeInSign - degrees) * 60);
    const seconds = Math.round(((degreeInSign - degrees) * 60 - minutes) * 60);

    const celBody: CelestialBody = {
      key: planet.toLowerCase(),
      label: planet,
      Sign: {
        key: sign,
        zodiac: sign,
        label: sign.charAt(0).toUpperCase() + sign.slice(1),
      },
      ChartPosition: {
        Ecliptic: {
          DecimalDegrees: longitude,
          ArcDegrees: { degrees, minutes, seconds },
        },
      },
      isRetrograde,
    };

    bodies[planet.toLowerCase()] = celBody;
    allBodies.push(celBody);
  }

  return {
    success: true,
    _celestialBodies: { all: allBodies, ...bodies } as any,
    birth_info: {
      year: params.year,
      month: params.month,
      date: params.date ?? params.day ?? 1,
      hour: params.hour,
      minute: params.minute,
      latitude: params.latitude ?? 0,
      longitude: params.longitude ?? 0,
      ayanamsa: "TROPICAL",
    },
    source: "astronomy-engine",
    precision: "sub-arcminute",
  };
}
