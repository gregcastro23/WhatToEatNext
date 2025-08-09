import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawTropicalFruits: Record<string, Partial<IngredientMapping>> = {
  mango: {
    name: 'Mango',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'taurus'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Earth', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
    },

    qualities: ['sweet', 'cooling', 'nourishing'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'chili', 'coconut', 'mint', 'ginger'],
    cookingMethods: ['raw', 'grilled', 'puréed', 'dried'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'b6'],
      minerals: ['copper', 'potassium'],
      calories: 60,
      carbs_g: 15,
      fiber_g: 1.6,
      antioxidants: ['beta-carotene', 'zeaxanthin'],
    },

    preparation: {
      washing: true,
      peeling: 'required',
      cutting: 'slice along pit',
      ripeness: 'slight give when pressed',
      notes: 'Can be ripened in paper bag',
    },

    storage: {
      temperature: 'room temp until ripe',
      duration: '5-7 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic mango profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},
  },

  pineapple: {
    name: 'Pineapple',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Mars'],
      favorableZodiac: ['leo', 'aries'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Earth', planet: 'Mars' },
          third: { element: 'Air', planet: 'Jupiter' },
        },
      },
    },

    qualities: ['sweet-tart', 'warming', 'cleansing'],
    season: ['spring', 'summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['coconut', 'rum', 'mint', 'chili', 'vanilla'],
    cookingMethods: ['raw', 'grilled', 'roasted', 'juiced'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6', 'thiamin'],
      minerals: ['manganese', 'copper'],
      calories: 50,
      carbs_g: 13,
      fiber_g: 1.4,
      enzymes: ['bromelain'],
    },

    preparation: {
      washing: true,
      cutting: 'remove crown and base',
      peeling: 'remove eyes',
      notes: 'Cut into spears or rings',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store upside down for even sweetness',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic pineapple profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},
  },

  papaya: {
    name: 'Papaya',
    elementalProperties: { Water: 0.5, Fire: 0.2, Air: 0.2, Earth: 0.1 },
    qualities: ['sweet', 'buttery', 'exotic'],
    season: ['year-round'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'chili', 'honey', 'ginger', 'coconut'],
    cookingMethods: ['raw', 'smoothies', 'dried'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'folate'],
      minerals: ['potassium', 'magnesium'],
      calories: 43,
      carbs_g: 11,
      fiber_g: 1.7,
      enzymes: ['papain'],
    },

    preparation: {
      washing: true,
      peeling: 'when ripe',
      seeding: 'scoop out seeds',
      ripeness: 'yields to gentle pressure',
      notes: 'Seeds are edible but peppery',
    },

    storage: {
      temperature: 'room temp until ripe',
      duration: '5-7 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic papaya profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  'passion fruit': {
    name: 'Passion Fruit',
    elementalProperties: { Water: 0.3, Fire: 0.3, Air: 0.3, Earth: 0.1 },
    qualities: ['tart', 'aromatic', 'exotic'],
    season: ['summer', 'autumn'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['mango', 'coconut', 'vanilla', 'citrus', 'banana'],
    cookingMethods: ['raw', 'juiced', 'pulped', 'preserved'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'a', 'b2'],
      minerals: ['iron', 'magnesium'],
      calories: 68,
      carbs_g: 16,
      fiber_g: 10.4,
      antioxidants: ['beta-carotene', 'polyphenols'],
    },

    preparation: {
      washing: true,
      ripeness: 'wrinkled skin indicates ripeness',
      cutting: 'halve and scoop',
      notes: 'Seeds are edible and nutritious',
    },

    storage: {
      temperature: 'room temp until ripe',
      duration: '7-10 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic passion fruit profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  'dragon fruit': {
    name: 'Dragon Fruit',
    elementalProperties: { Water: 0.6, Air: 0.2, Earth: 0.1, Fire: 0.1 },
    qualities: ['mild', 'refreshing', 'exotic'],
    season: ['summer', 'autumn'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'mint', 'coconut', 'kiwi', 'lychee'],
    cookingMethods: ['raw', 'smoothies', 'frozen'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b1', 'b2'],
      minerals: ['iron', 'magnesium'],
      calories: 60,
      carbs_g: 13,
      fiber_g: 3,
      antioxidants: ['betalains', 'hydroxycinnamates'],
    },

    preparation: {
      washing: true,
      cutting: 'halve lengthwise',
      scooping: 'flesh easily separates from skin',
      notes: 'Can be eaten with spoon directly from skin',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'moderate',
      notes: 'Best eaten when slightly firm',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic dragon fruit profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  lychee: {
    name: 'Lychee',
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    qualities: ['sweet', 'floral', 'delicate'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['rose', 'ginger', 'coconut', 'lime', 'mint'],
    cookingMethods: ['raw', 'desserts', 'preserved'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6', 'k'],
      minerals: ['copper', 'potassium'],
      calories: 66,
      carbs_g: 17,
      fiber_g: 1.3,
      antioxidants: ['flavonoids', 'proanthocyanidins'],
    },

    preparation: {
      washing: true,
      peeling: 'remove rough skin',
      pitting: 'remove brown seed',
      notes: 'Eat fresh or use in desserts',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'high',
      notes: 'Best eaten fresh, skin will brown over time',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic lychee profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  guava: {
    name: 'Guava',
    elementalProperties: { Water: 0.4, Fire: 0.2, Air: 0.2, Earth: 0.2 },
    qualities: ['sweet-tart', 'fragrant', 'tropical'],
    season: ['fall', 'winter'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'coconut', 'pineapple', 'mango', 'passion fruit'],
    cookingMethods: ['raw', 'juiced', 'preserved', 'baked'],

    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['c', 'a', 'e'],
      minerals: ['potassium', 'copper'],
      calories: 68,
      carbs_g: 14,
      fiber_g: 5.4,
      antioxidants: ['lycopene', 'beta-carotene'],
    },

    preparation: {
      washing: true,
      ripeness: 'yields slightly to pressure',
      cutting: 'quarter or slice',
      notes: 'Seeds are edible but often removed',
    },

    storage: {
      temperature: 'room temp until ripe',
      duration: '3-4 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic guava profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  rambutan: {
    name: 'Rambutan',
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['sweet', 'delicate', 'refreshing'],
    season: ['summer', 'fall'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lychee', 'coconut', 'lime', 'mango', 'passion fruit'],
    cookingMethods: ['raw', 'desserts'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b2', 'folate'],
      minerals: ['iron', 'phosphorus'],
      calories: 75,
      carbs_g: 18.7,
      fiber_g: 0.9,
      antioxidants: ['flavonoids', 'tannins'],
    },

    preparation: {
      washing: true,
      peeling: 'cut through hairy skin',
      pitting: 'remove seed',
      notes: 'Similar preparation to lychee',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      humidity: 'high',
      notes: 'Best eaten fresh',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic rambutan profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  mangosteen: {
    name: 'Mangosteen',
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    qualities: ['sweet', 'delicate', 'complex'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lychee', 'rambutan', 'coconut', 'lime', 'dragon fruit'],
    cookingMethods: ['raw', 'desserts', 'preserved'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b9', 'b1'],
      minerals: ['manganese', 'magnesium'],
      calories: 63,
      carbs_g: 15.6,
      fiber_g: 1.8,
      antioxidants: ['xanthones', 'anthocyanins'],
    },

    preparation: {
      washing: true,
      cutting: 'score around middle',
      opening: 'twist to separate',
      notes: 'Purple stains easily - handle with care',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'moderate',
      notes: 'Store in breathable container',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic mangosteen profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  soursop: {
    name: 'Soursop',
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.1, Earth: 0.2 },
    qualities: ['sweet-sour', 'creamy', 'tropical'],
    season: ['summer', 'fall'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['coconut', 'lime', 'banana', 'passion fruit', 'mango'],
    cookingMethods: ['raw', 'juiced', 'smoothies', 'frozen desserts'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b1', 'b3'],
      minerals: ['potassium', 'magnesium'],
      calories: 66,
      carbs_g: 16.8,
      fiber_g: 3.3,
      antioxidants: ['acetogenins', 'quercetin'],
    },

    preparation: {
      washing: true,
      ripeness: 'yields to gentle pressure',
      cutting: 'halve and scoop',
      notes: 'Remove seeds before consuming',
    },

    storage: {
      temperature: 'room temp until ripe',
      duration: '4-5 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic soursop profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  jackfruit: {
    name: 'Jackfruit',
    elementalProperties: { Water: 0.3, Earth: 0.3, Air: 0.2, Fire: 0.2 },
    qualities: ['sweet', 'meaty', 'complex'],
    season: ['summer', 'autumn'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['coconut', 'lime', 'ginger', 'banana', 'mango'],
    cookingMethods: ['raw', 'cooked', 'preserved', 'dried'],

    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['c', 'b6', 'a'],
      minerals: ['potassium', 'magnesium'],
      calories: 95,
      carbs_g: 23.2,
      fiber_g: 1.5,
      antioxidants: ['carotenoids', 'flavonoids'],
    },

    preparation: {
      washing: true,
      cutting: 'requires skill and oil on hands',
      seeding: 'remove seeds and pods',
      notes: 'Can be used as meat substitute when young',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'moderate',
      notes: 'Cut pieces must be used quickly',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic jackfruit profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  durian: {
    name: 'Durian',
    elementalProperties: { Water: 0.3, Earth: 0.4, Fire: 0.2, Air: 0.1 },
    qualities: ['creamy', 'pungent', 'complex'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['coconut', 'sticky rice', 'palm sugar', 'coffee', 'cream'],
    cookingMethods: ['raw', 'desserts', 'preserved'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6', 'thiamin'],
      minerals: ['potassium', 'iron'],
      calories: 147,
      carbs_g: 27.1,
      fiber_g: 3.8,
      antioxidants: ['flavonoids', 'polyphenols'],
    },

    preparation: {
      cutting: 'careful handling required',
      opening: 'cut along seams',
      scooping: 'remove flesh from pods',
      notes: 'Strong aroma - often restricted in public places',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      humidity: 'moderate',
      notes: 'Freeze for longer storage',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic durian profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  carambola: {
    name: 'Carambola',
    elementalProperties: { Water: 0.6, Air: 0.2, Fire: 0.1, Earth: 0.1 },
    qualities: ['sweet-tart', 'crisp', 'decorative'],
    season: ['winter', 'spring'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['citrus', 'mint', 'honey', 'tropical fruits', 'ginger'],
    cookingMethods: ['raw', 'juiced', 'preserved', 'garnish'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b5', 'folate'],
      minerals: ['copper', 'potassium'],
      calories: 31,
      carbs_g: 6.7,
      fiber_g: 2.8,
      antioxidants: ['epicatechin', 'gallic acid'],
    },

    preparation: {
      washing: true,
      cutting: 'slice crosswise for star shape',
      notes: 'Remove brown edges before serving',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'moderate',
      notes: 'Best eaten when slightly firm',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic carambola profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  kiwi: {
    name: 'Kiwi',
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.1, Earth: 0.2 },
    qualities: ['sweet-tart', 'bright', 'refreshing'],
    season: ['winter', 'spring'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['strawberry', 'mango', 'lime', 'mint', 'honey'],
    cookingMethods: ['raw', 'smoothies', 'garnish', 'preserved'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'k', 'e'],
      minerals: ['potassium', 'copper'],
      calories: 61,
      carbs_g: 14.7,
      fiber_g: 3,
      antioxidants: ['polyphenols', 'carotenoids'],
    },

    preparation: {
      washing: true,
      peeling: 'optional - skin is edible',
      cutting: 'halve and scoop or slice with skin',
      notes: 'Can be eaten whole like an apple',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Will ripen other fruits if stored together',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic kiwi profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  coconut: {
    name: 'Coconut',
    elementalProperties: { Water: 0.4, Earth: 0.4, Air: 0.1, Fire: 0.1 },
    qualities: ['sweet', 'creamy', 'tropical'],
    season: ['year-round'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'chocolate', 'mango', 'pineapple', 'rum'],
    cookingMethods: ['raw', 'cooked', 'baked', 'pressed'],

    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['b6', 'folate', 'c'],
      minerals: ['iron', 'magnesium'],
      calories: 354,
      carbs_g: 15.2,
      fiber_g: 9,
      fats: ['medium chain triglycerides'],
    },

    preparation: {
      opening: 'pierce eyes and drain water',
      cracking: 'careful splitting required',
      extraction: 'separate flesh from shell',
      notes: 'Young coconuts are best for water',
    },

    storage: {
      temperature: 'room temperature whole',
      duration: '2-3 months whole',
      processed: 'refrigerate once opened',
      notes: 'Freezes well when shredded',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic coconut profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  pomelo: {
    name: 'Pomelo',
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['sweet-tart', 'mild', 'refreshing'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['coconut', 'lime', 'chili', 'mint', 'ginger'],
    cookingMethods: ['raw', 'segments', 'juiced', 'preserved'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6', 'thiamin'],
      minerals: ['potassium', 'copper'],
      calories: 38,
      carbs_g: 9.6,
      fiber_g: 1.9,
      antioxidants: ['naringin', 'limonoids'],
    },

    preparation: {
      washing: true,
      peeling: 'remove thick rind and pith',
      segmenting: 'separate membrane carefully',
      notes: 'Less bitter than grapefruit',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Keeps well in cool conditions',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic pomelo profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  longan: {
    name: 'Longan',
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['sweet', 'subtle', 'refreshing'],
    season: ['late summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lychee', 'mango', 'coconut', 'ginger', 'honey'],
    cookingMethods: ['raw', 'dried', 'desserts'],

    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b2', 'b6'],
      minerals: ['iron', 'potassium'],
      calories: 60,
      carbs_g: 15.1,
      fiber_g: 1.1,
      antioxidants: ['gallic acid', 'ellagic acid'],
    },

    preparation: {
      washing: true,
      peeling: 'crack and remove thin shell',
      pitting: 'remove black seed',
      notes: 'Similar to lychee but milder',
    },

    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      humidity: 'high',
      notes: 'Best eaten fresh',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic longan profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },

  'custard apple': {
    name: 'Custard Apple',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['sweet', 'creamy', 'fragrant'],
    season: ['fall', 'winter'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['vanilla', 'coconut', 'lime', 'honey', 'cinnamon'],
    cookingMethods: ['raw', 'smoothies', 'desserts'],

    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6', 'thiamin'],
      minerals: ['potassium', 'magnesium'],
      calories: 94,
      carbs_g: 23.6,
      fiber_g: 4.4,
      antioxidants: ['catechins', 'kaempferol'],
    },

    preparation: {
      washing: true,
      ripeness: 'yields to gentle pressure',
      eating: 'split and spoon out flesh',
      notes: 'Avoid black seeds',
    },

    storage: {
      temperature: 'room temp until ripe',
      duration: '2-3 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when fully ripe',
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic custard apple profile',
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global'],
    },

    origin: ['Unknown'],
    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const tropical: Record<string, IngredientMapping> = fixIngredientMappings(rawTropicalFruits);
