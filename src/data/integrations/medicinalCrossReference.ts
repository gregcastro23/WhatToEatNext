import { herbs } from '../ingredients/herbs';
import { medicinalHerbs } from '../ingredients/herbs/medicinalHerbs';

// Cross-references culinary and medicinal uses
export const herbMedicinalUses = Object.entries(herbs).reduce((acc, [herbName, herb]) => {
  if (medicinalHerbs[herbName]) {
    acc[herbName] = {
      culinary: herb.culinary_traditions,
      medicinal: medicinalHerbs[herbName].properties
    };
  }
  return acc;
}, {} as Record<string, any>);
