'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.melons = void 0;
const elementalUtils_1 = require('../../../utils/elementalUtils');
const elementalUtils_2 = require('../../../utils/elemental/elementalUtils');
const rawMelons = {
  watermelon: {
    name: 'watermelon',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.1,
      Water: 0.7,
      Earth: 0.1,
      Air: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'libra'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Venus' },
        },
      },
      lunarPhaseModifiers: {
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.3,
            Air: 0.1,
          }),
          preparationTips: ['Maximum sweetness', 'Perfect for juicing'],
        },
        waxingGibbous: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.2,
            Earth: 0.1,
          }),
          preparationTips: ['Good balance of sweetness and refreshment'],
        },
      },
    },
    qualities: ['sweet', 'cooling', 'refreshing', 'hydrating', 'cleansing'],
    origin: ['Africa', 'Mediterranean'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'melon',
    culinaryApplications: {
      fresh: {
        name: 'Fresh',
        method: 'raw slices or cubes',
        applications: ['fruit salads', 'snacks', 'desserts'],
        techniques: 'chill thoroughly before serving',
        notes: 'The most common preparation method',
      },
      juiced: {
        name: 'Juiced',
        method: 'blended and strained',
        applications: ['beverages', 'cocktails', 'sorbets', 'granitas'],
        techniques: 'strain seeds for smooth texture',
        notes: 'Incredibly hydrating and refreshing',
      },
      grilled: {
        name: 'Grilled',
        method: 'thick slices, high heat',
        applications: ['side dishes', 'salads', 'desserts'],
        techniques: 'brief grilling to caramelize sugars',
        notes: 'Enhances sweetness with smoky notes',
      },
      pickled: {
        name: 'Pickled',
        method: 'brine or vinegar solution',
        applications: ['condiments', 'salads', 'garnish'],
        techniques: 'use firm, slightly underripe rinds',
        notes: 'Traditional in many Asian cuisines',
      },
    },
    storage: {
      temperature: {
        room: {
          fahrenheit: { min: 65, max: 70 },
          celsius: { min: 18, max: 21 },
        },
        refrigerated: {
          fahrenheit: { min: 45, max: 50 },
          celsius: { min: 7, max: 10 },
        },
      },
      duration: {
        room: '5-7 days (whole)',
        refrigerated: '2-3 weeks (whole), 3-4 days (cut)',
        notes: 'Cut watermelon should be tightly wrapped or sealed',
      },
    },
  },
  cantaloupe: {
    name: 'Cantaloupe',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.3,
      Water: 0.5,
      Earth: 0.1,
      Air: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Venus'],
      favorableZodiac: ['leo', 'libra'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
          second: { element: 'Fire', planet: 'Sun' },
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        firstQuarter: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Fire: 0.2,
            Water: 0.1,
          }),
          preparationTips: ['Good time for ripening'],
        },
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.2,
            Fire: 0.2,
          }),
          preparationTips: ['Peak flavor and aroma'],
        },
      },
    },
    qualities: ['sweet', 'aromatic', 'juicy', 'musky'],
    origin: ['Iran', 'Mediterranean', 'India'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'melon',
    culinaryApplications: {
      fresh: {
        name: 'Fresh',
        method: 'raw slices or cubes',
        applications: ['fruit salads', 'breakfast', 'snacks'],
        techniques: 'remove seeds and rind',
        notes: 'Classic with prosciutto in Italian cuisine',
      },
      chilled_soup: {
        name: 'Chilled Soup',
        method: 'blended with yogurt or cream',
        applications: ['appetizers', 'light lunches'],
        techniques: 'balance sweetness with acid like lime juice',
        notes: 'Refreshing summer starter',
      },
      grilled: {
        name: 'Grilled',
        method: 'thick slices, medium heat',
        applications: ['desserts', 'savory dishes'],
        techniques: 'brush with honey or balsamic',
        notes: 'Grilling concentrates sugars',
      },
    },
    storage: {
      temperature: {
        room: {
          fahrenheit: { min: 65, max: 70 },
          celsius: { min: 18, max: 21 },
        },
        refrigerated: {
          fahrenheit: { min: 36, max: 40 },
          celsius: { min: 2, max: 4 },
        },
      },
      duration: {
        room: '2-4 days (for ripening)',
        refrigerated: '5-7 days (whole), 2-3 days (cut)',
        notes: 'Ripens after harvesting, unlike watermelon',
      },
    },
  },
  honeydew: {
    name: 'Honeydew',
    elementalProperties: {
      Water: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Earth', planet: 'Moon' },
        },
      },
    },
    season: ['summer', 'early fall'],
    qualities: ['refreshing', 'crisp', 'subtle sweetness', 'delicate'],
    category: 'fruit',
    subCategory: 'melon',
    nutritionalProfile: {
      calories: 36,
      carbs_g: 9.1,
      fiber_g: 0.8,
      sugar_g: 8.4,
      water_percentage: 90,
      vitamins: ['c', 'b6', 'folate'],
      minerals: ['potassium', 'magnesium'],
    },
    varieties: {
      'Green Flesh': {
        appearance: 'smooth white-green rind, pale green flesh',
        size: 'medium to large (4-8 lbs)',
        flavor: 'mild, subtly sweet, clean finish',
        notes: 'most common commercial variety',
      },
      'Orange Flesh': {
        appearance: 'similar to green honeydew but with orange interior',
        size: 'medium (5-6 lbs)',
        flavor: 'sweeter than green, slight vanilla notes',
        notes: 'specialty variety, increasing in popularity',
      },
      'Golden Honeydew': {
        appearance: 'smooth yellow exterior, pale green flesh',
        size: 'medium (4-6 lbs)',
        flavor: 'honey-like sweetness, more aromatic',
        notes: 'specialty variety with distinct flavor',
      },
      'Honey Globe': {
        appearance: 'white-green exterior, green flesh',
        size: 'smaller (3-4 lbs)',
        flavor: 'intensely sweet, rich honey flavor',
        notes: 'Asian variety, highly prized for sweetness',
      },
    },
    culinaryApplications: {
      raw: {
        notes: ['Clean, refreshing flavor', 'Often used in fruit platters'],
        preparations: ['Cubed or balled', 'Sliced in wedges'],
        dishes: ['Breakfast fruit', 'Fruit salads', 'Fruit platters'],
      },
      chilled: {
        notes: ['Makes delicate, refreshing cold soups'],
        preparations: ['Puréed with herbs or cucumber'],
        dishes: ['Honeydew gazpacho', 'Chilled melon soup'],
      },
      beverage: {
        notes: ['Subtle flavor works well in drinks', 'Good with herbs and alcohol'],
        preparations: ['Juiced', 'Puréed', 'Infused'],
        dishes: ['Honeydew smoothies', 'Melon cocktails', 'Agua fresca'],
      },
      salad: {
        notes: ['PAirs well with salty and spicy elements'],
        preparations: ['Cubed or balled'],
        dishes: ['Honeydew-prosciutto salad', 'Melon and cucumber salad'],
      },
    },
    preparation: {
      selection: 'Should have creamy yellow rind (not green), slight give when pressed',
      cutting: 'Halve, remove seeds, then slice or cube',
      storage: 'Room temperature until ripe, then refrigerated for up to a week',
      tips: [
        'One of the hardest melons to select when ripe',
        'Benefit from day at room temp before eating',
      ],
    },
    pAirings: ['lime', 'ginger', 'cucumber', 'mint', 'prosciutto', 'yogurt', 'white wine'],
    substitutions: ['cantaloupe', 'watermelon', 'cucumber', 'pear'],
    traditionalUses: {
      American: 'Standard component in fruit salads and breakfast buffets',
      Asian: 'Eaten as dessert or post-meal palate cleanser',
      European: 'PAired with cured meats and aperitifs',
      Mexican: 'Used in aguas frescas and fruit drinks',
    },
  },
  casaba: {
    name: 'Casaba',
    elementalProperties: {
      Water: 0.6,
      Earth: 0.3,
      Air: 0.1,
      Fire: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['capricorn', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Water',
      },
    },
    season: ['summer', 'fall'],
    qualities: ['mild', 'subtle', 'cucumber-like', 'refreshing'],
    category: 'fruit',
    subCategory: 'melon',
    nutritionalProfile: {
      calories: 28,
      carbs_g: 6.6,
      fiber_g: 0.9,
      sugar_g: 5.7,
      water_percentage: 92,
      vitamins: ['c', 'b6'],
      minerals: ['potassium', 'magnesium'],
    },
    varieties: {
      'Golden Casaba': {
        appearance: 'bright yellow wrinkled rind, white flesh',
        size: 'medium to large (4-7 lbs)',
        flavor: 'mildly sweet, slightly tangy',
        notes: 'most common casaba variety',
      },
      'Winter Casaba': {
        appearance: 'green-yellow wrinkled skin, pale flesh',
        size: 'large (7-8 lbs)',
        flavor: 'very mild, cucumber-like',
        notes: 'late season variety with long storage life',
      },
    },
    culinaryApplications: {
      raw: {
        notes: ['Mild flavor best enhanced with acid or salt'],
        preparations: ['Cubed or sliced'],
        dishes: ['Simple fruit plates', 'Light salads'],
      },
      salad: {
        notes: ['Takes well to savory applications', 'Good with stronger flavors'],
        preparations: ['Cubed or sliced thin'],
        dishes: ['Mediterranean salads', 'Casaba with feta and mint'],
      },
      cooked: {
        notes: ['Can be lightly grilled or roasted', 'Takes well to spices'],
        preparations: ['Thin slices or wedges'],
        dishes: ['Grilled casaba', 'Roasted melon with spices'],
      },
    },
    preparation: {
      selection: 'Ripe when yellow and slightly soft at blossom end',
      cutting: 'Halve, remove seeds, then slice or cube',
      storage: 'Room temperature until ripe, then refrigerated for up to two weeks',
      tips: ['One of the longest-storing melons', 'Benefits from salt or acid to enhance flavor'],
    },
    pAirings: ['lime', 'salt', 'chili powder', 'mint', 'feta', 'olive oil', 'black pepper'],
    substitutions: ['honeydew', 'cucumber', 'chayote', 'jicama'],
    traditionalUses: {
      'Middle Eastern': 'Served with salt and sometimes spices',
      Mediterranean: 'Used in savory salads with cheese and herbs',
      'Latin American': 'Eaten with lime juice and salt or chili powder',
      American: 'Primarily used in fruit salads or as light dessert',
    },
  },
  crenshaw: {
    name: 'Crenshaw',
    elementalProperties: {
      Water: 0.5,
      Earth: 0.3,
      Fire: 0.1,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Jupiter'],
      favorableZodiac: ['taurus', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
      },
    },
    season: ['summer', 'early fall'],
    qualities: ['aromatic', 'rich', 'sweet', 'complex'],
    category: 'fruit',
    subCategory: 'melon',
    nutritionalProfile: {
      calories: 32,
      carbs_g: 7.8,
      fiber_g: 0.7,
      sugar_g: 7.1,
      water_percentage: 91,
      vitamins: ['a', 'c', 'folate'],
      minerals: ['potassium', 'magnesium'],
    },
    varieties: {
      'Standard Crenshaw': {
        appearance: 'yellow-green rind, salmon-pink flesh',
        size: 'large (8-10 lbs)',
        flavor: 'very sweet, spicy undertones',
        notes: 'cross between casaba and Persian melon',
      },
    },
    culinaryApplications: {
      raw: {
        notes: ['Rich flavor best enjoyed simply', 'Premium melon experience'],
        preparations: ['Sliced in wedges', 'Cubed or balled'],
        dishes: ['Gourmet fruit plates', 'Premium fruit salads'],
      },
      chilled: {
        notes: ['Makes excellent cold soups', 'Complex flavor stands alone'],
        preparations: ['Puréed with minimal additions'],
        dishes: ['Crenshaw gazpacho', 'Chilled melon soup'],
      },
      dessert: {
        notes: ['Sweet enough for dessert applications', 'PAirs well with cream'],
        preparations: ['Puréed', 'Sliced', 'Balled'],
        dishes: ['Melon sorbet base', 'Melon with cream or ice cream'],
      },
    },
    preparation: {
      selection: 'Ripe when yellow-beige, slightly soft at stem end, fragrant',
      cutting: 'Halve, remove seeds, then slice or cube',
      storage: 'Room temperature until ripe, then refrigerated for up to 5 days',
      tips: ['Highly fragrant when ripe', 'Bruises easily, handle with care'],
    },
    pAirings: ['vanilla', 'cream', 'ginger', 'champagne', 'light rum', 'mint', 'lime'],
    substitutions: ['cantaloupe', 'honeydew', 'Persian melon'],
    traditionalUses: {
      American: 'Considered a premium dessert melon',
      Gourmet: 'Used in high-end cuisine for its complex flavor',
      French: 'PAired with dessert wines and cream',
      California: 'Where most commercial production occurs',
    },
  },
  persian_melon: {
    name: 'Persian Melon',
    elementalProperties: {
      Water: 0.6,
      Earth: 0.2,
      Fire: 0.1,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Jupiter'],
      favorableZodiac: ['taurus', 'libra'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
      },
    },
    season: ['summer'],
    qualities: ['aromatic', 'floral', 'sweet', 'juicy'],
    category: 'fruit',
    subCategory: 'melon',
    nutritionalProfile: {
      calories: 34,
      carbs_g: 8.0,
      fiber_g: 0.8,
      sugar_g: 7.2,
      water_percentage: 90,
      vitamins: ['a', 'c'],
      minerals: ['potassium', 'magnesium'],
    },
    varieties: {
      'Standard Persian': {
        appearance: 'dark green netted rind, orange flesh',
        size: 'medium to large (5-8 lbs)',
        flavor: 'sweet, more aromatic than cantaloupe',
        notes: 'sometimes confused with cantaloupe but darker and more oblong',
      },
    },
    culinaryApplications: {
      raw: {
        notes: ['Floral flavor best enjoyed fresh', 'Premium eating experience'],
        preparations: ['Sliced in wedges', 'Cubed or balled'],
        dishes: ['Fresh fruit plates', 'Minimally dressed fruit salads'],
      },
      pAired: {
        notes: ['Works well with Middle Eastern flavors', 'Good with aromatic herbs'],
        preparations: ['Cubed or sliced'],
        dishes: ['Persian melon with rosewater', 'Melon with herbs and pistachios'],
      },
      beverage: {
        notes: ['Makes fragrant juices and drinks'],
        preparations: ['Juiced', 'Puréed', 'Infused'],
        dishes: ['Melon juice', 'Fruit smoothies', 'Infused water'],
      },
    },
    preparation: {
      selection: 'Ripe when fragrant, slight give when pressed at blossom end',
      cutting: 'Halve, remove seeds, then slice or cube',
      storage: 'Room temperature until ripe, then refrigerated for up to a week',
      tips: [
        'Allow to ripen at room temperature for best flavor',
        'Subtle floral notes are distinctive',
      ],
    },
    pAirings: ['rosewater', 'pistachios', 'mint', 'honey', 'cardamom', 'yogurt', 'lime'],
    substitutions: ['cantaloupe', 'honeydew', 'crenshaw'],
    traditionalUses: {
      Persian: 'Served with rosewater and pistachios',
      'Middle Eastern': 'Enjoyed with aromatic spices like cardamom',
      Mediterranean: 'PAired with soft cheese and herbs',
      Western: 'Typically treated similar to cantaloupe',
    },
  },
  winter_melon: {
    name: 'Winter Melon',
    elementalProperties: {
      Water: 0.6,
      Earth: 0.3,
      Air: 0.1,
      Fire: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['cancer', 'capricorn'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
      },
    },
    season: ['winter', 'fall'],
    qualities: ['mild', 'cooling', 'spongy', 'savory'],
    category: 'fruit',
    subCategory: 'melon',
    nutritionalProfile: {
      calories: 14,
      carbs_g: 3.5,
      fiber_g: 0.7,
      sugar_g: 1.2,
      water_percentage: 96,
      vitamins: ['c', 'b2'],
      minerals: ['potassium', 'zinc', 'iron'],
    },
    medicinalProperties: ['cooling', 'detoxifying', 'diuretic', 'anti-inflammatory'],
    varieties: {
      Eastern: {
        appearance: 'fuzzy skin when young, waxy white coating when mature',
        size: 'large (10-15 lbs)',
        flavor: 'very mild, slightly sweet when young',
        notes: 'used extensively in Asian cooking',
      },
    },
    culinaryApplications: {
      soup: {
        notes: ['Classic ingredient in Chinese soups', 'Holds shape when cooked'],
        preparations: ['Peeled, seeded, cubed'],
        dishes: ['Winter melon soup', 'Medicinal broths', 'Clear soups'],
      },
      stir_fry: {
        notes: ['Absorbs flavors well', 'Maintains texture when cooked'],
        preparations: ['Julienned or cubed'],
        dishes: ['Stir-fried winter melon', 'Vegetable medleys'],
      },
      braised: {
        notes: ['Traditional slow-cooked preparation', 'Takes on flavors of broth'],
        preparations: ['Large cubes or half-Moon slices'],
        dishes: ['Braised winter melon with pork', 'Red-braised melon'],
      },
      stuffed: {
        notes: ['Large size allows for impressive stuffed presentations'],
        preparations: ['Hollowed out, filled, steamed or baked'],
        dishes: ['Stuffed winter melon', 'Melon with glutinous rice filling'],
      },
    },
    preparation: {
      selection: 'Choose firm, unblemished melons, waxy coating indicates maturity',
      cutting: 'Remove waxy coating, cut into pieces, remove seeds and pith',
      storage: 'Whole melon can be stored in cool, dry place for months',
      tips: [
        'Young melons can be used with skin',
        'Mature melons need peeling',
        'Can be dried for later use',
      ],
    },
    pAirings: [
      'ginger',
      'garlic',
      'chinese_ham',
      'shiitake_mushrooms',
      'pork',
      'scallions',
      'star_anise',
    ],
    substitutions: ['chayote', 'zucchini', 'bottle_gourd', 'cucumber'],
    traditionalUses: {
      Chinese: 'Used in soups, stir-fries, and medicinal dishes',
      Vietnamese: 'Featured in clear broths and stews',
      Indian: 'Used in curry preparations and stir-fries',
      'Traditional Medicine': 'Valued for cooling properties and health benefits',
    },
  },
  galia: {
    name: 'Galia Melon',
    elementalProperties: {
      Water: 0.6,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mercury'],
      favorableZodiac: ['taurus', 'gemini'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Air',
      },
    },
    season: ['summer'],
    qualities: ['aromatic', 'sweet', 'complex', 'fragrant'],
    category: 'fruit',
    subCategory: 'melon',
    nutritionalProfile: {
      calories: 30,
      carbs_g: 7.5,
      fiber_g: 0.8,
      sugar_g: 6.7,
      water_percentage: 91,
      vitamins: ['a', 'c'],
      minerals: ['potassium', 'magnesium'],
    },
    varieties: {
      'Standard Galia': {
        appearance: 'golden netted exterior like cantaloupe, pale green flesh like honeydew',
        size: 'medium (3-5 lbs)',
        flavor: 'aromatic, tropical sweetness, hints of banana and spice',
        notes: 'hybrid developed in Israel, now popular worldwide',
      },
    },
    culinaryApplications: {
      raw: {
        notes: ['Aromatic flavor best enjoyed fresh', 'Distinguished eating experience'],
        preparations: ['Halved and eaten with spoon', 'Cubed or balled'],
        dishes: ['Fresh fruit plates', 'Premium fruit salads'],
      },
      chilled: {
        notes: ['Makes excellent cold soups', 'Aromatic quality shines'],
        preparations: ['Puréed with herbs'],
        dishes: ['Galia gazpacho', 'Chilled melon soup'],
      },
      beverage: {
        notes: ['Aromatic quality great in drinks', 'Good with spirits'],
        preparations: ['Juiced', 'Muddled', 'Infused'],
        dishes: ['Melon cocktails', 'Smoothies', 'Agua fresca'],
      },
    },
    preparation: {
      selection: 'Ripe when fragrant, golden yellow rind, slight give when pressed',
      cutting: 'Halve, remove seeds, then slice or cube',
      storage: 'Room temperature until ripe, then refrigerated for up to 5 days',
      tips: ['Ripens quickly after harvest', 'Most aromatic when room temperature'],
    },
    pAirings: ['lime', 'mint', 'ginger', 'white wine', 'vodka', 'prosciutto', 'arugula'],
    substitutions: ['cantaloupe', 'honeydew', 'charentais'],
    traditionalUses: {
      Israeli: 'Developed in Israel, enjoyed as premium dessert',
      Mediterranean: 'PAired with cured meats and cheeses',
      European: 'Considered a gourmet melon variety',
      'Modern Cuisine': 'Featured in upscale restaurants and cocktail programs',
    },
  },
};
// Fix the ingredient mappings to ensure they have all required properties
exports.melons = (0, elementalUtils_1.fixIngredientMappings)(rawMelons);
