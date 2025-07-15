import { herbs } from '../ingredients/herbs.js';
// Matrix showing which herbs are used in which cuisines
export const herbCuisineMatrix = Object.entries(herbs).reduce((acc, [herbName, herb]) => {
    if (herb.culinary_traditions) {
        acc[herbName] = Object.keys(herb.culinary_traditions);
    }
    return acc;
}, {});
