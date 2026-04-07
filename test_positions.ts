import { getAccuratePlanetaryPositions } from "./src/utils/astrology/positions";
const date1991 = new Date(Date.UTC(1991, 5, 23, 10, 24)); // June 23 1991
const pos1 = getAccuratePlanetaryPositions(date1991);
console.log("1991 Sun:", pos1.Sun.sign, pos1.Sun.degree);
console.log("1991 Moon:", pos1.Moon.sign, pos1.Moon.degree);

const date2026 = new Date(Date.UTC(2026, 3, 6, 12, 0)); // April 6 2026
const pos2 = getAccuratePlanetaryPositions(date2026);
console.log("2026 Sun:", pos2.Sun.sign, pos2.Sun.degree);
console.log("2026 Moon:", pos2.Moon.sign, pos2.Moon.degree);
