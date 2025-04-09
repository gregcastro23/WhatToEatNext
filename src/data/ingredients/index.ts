import { french, italian, middleEastern, thai } from '../cuisines';
import { wholeGrains } from './grains/wholeGrains';
import { refinedGrains } from './grains/refinedGrains';
import { medicinalHerbs } from './herbs/medicinalHerbs';

export const AlchemyData = {
  cuisines: {
    french: french,
    italian: italian,
    middleEastern: middleEastern,
    thai: thai
  },
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
