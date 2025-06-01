import { RulingPlanet, ElementalCharacter, Season } from '../types/wiccan';

interface WiccanProperties {
  magicalAttributes: string[];
  planetaryRulers: RulingPlanet[];
  elementalAffinities: ElementalCharacter[];
  seasonalStrengths: Season[];
}

export class WiccanCorrespondenceService {
  async getMagicalProperties(ingredientName: string): Promise<WiccanProperties> {
    const response = await fetch(`https://wiccan-api.com/correspondences/${encodeURIComponent(ingredientName)}`);
    return response.json();
  }
} 