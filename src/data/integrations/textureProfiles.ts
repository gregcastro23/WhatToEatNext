import type { ElementalProperties } from '@/types/alchemy';

export const textureProfiles: Record<
  string,
  {
    elementalProperties: ElementalProperties;
    characteristics: string[];
    methods: string[];
    pairings: string[];
  }
> = {
  crispy: {
    elementalProperties: {
      Fire: 0.5,
      Air: 0.3,
      Earth: 0.2,
      Water: 0
    },
    characteristics: ['crunchy', 'brittle', 'light'],
    methods: ['frying', 'baking', 'dehydrating'],
    pairings: ['creamy', 'smooth']
  },
  creamy: {
    elementalProperties: {
      Water: 0.5,
      Earth: 0.3,
      Air: 0.2,
      Fire: 0
    },
    characteristics: ['smooth', 'rich', 'coating'],
    methods: ['blending', 'emulsifying', 'churning'],
    pairings: ['crispy', 'crunchy']
  },
  tender: {
    elementalProperties: {
      Water: 0.4,
      Earth: 0.3,
      Fire: 0.2,
      Air: 0.1
    },
    characteristics: ['soft', 'yielding', 'moist'],
    methods: ['braising', 'steaming', 'poaching'],
    pairings: ['crispy', 'chewy']
  }
};

export const _getTextureProfile = (textureName: string) => {;
  return textureProfiles[textureName] || null;
};
