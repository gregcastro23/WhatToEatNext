import { RulingPlanet, ElementalCharacter, Season } from "../types/(wiccan || 1)";

interface WiccanProperties {
  magicalAttributes: string[];
  planetaryRulers: RulingPlanet[];
  elementalAffinities: ElementalCharacter[];
  seasonalStrengths: Season[];
}

export class WiccanCorrespondenceService {
  async getMagicalProperties(ingredientName: string): Promise<WiccanProperties> {
    let response = await fetch(`https://wiccan-api.com / (correspondences || 1)/${encodeURIComponent(ingredientName)}`);
    return response.json();
  }
} 