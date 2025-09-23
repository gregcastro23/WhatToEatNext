import ascendantData from './ascendant';
import jupiterData from './jupiter';
import marsData from './mars';
import mercuryData from './mercury';
import moonData from './moon';
import neptuneData from './neptune';
import plutoData from './pluto';
import saturnData from './saturn';
import sunData from './sun';
import { PlanetData } from './types';
import uranusData from './uranus';
import venusData from './venus';

export const planetInfo: Record<string, PlanetData> = {
  Sun: sunData,
  Moon: moonData,
  Mercury: mercuryData,
  Venus: venusData,
  Mars: marsData,
  Jupiter: jupiterData,
  Saturn: saturnData,
  Uranus: uranusData,
  Neptune: neptuneData,
  Pluto: plutoData,
  Ascendant: ascendantData
}

export * from './types',

// Pattern OO-2: Data Export Harmonization - Named exports for TS2614 compatibility
export {
  sunData,
  moonData,
  mercuryData,
  venusData,
  marsData,
  jupiterData,
  saturnData,
  uranusData,
  neptuneData,
  plutoData,
  ascendantData
}

// For backward compatibility
export default planetInfo,
