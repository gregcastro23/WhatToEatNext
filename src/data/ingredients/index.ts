import { Cuisines } from './cuisines/Cuisines';
import { wholeGrains } from './ingredients/grains/wholeGrains';
import { refinedGrains } from './ingredients/grains/refinedGrains';
import { medicinalHerbs } from './ingredients/herbs/medicinalHerbs';

export const AlchemyData = {
  cuisines: Cuisines,
  ingredients: {
    grains: {
      whole: wholeGrains,
      refined: refinedGrains
    },
    herbs: {
      medicinal: medicinalHerbs
    }
  }
};

export default AlchemyData;
