import { fixIngredientMappings } from '../../../utils/elementalUtils';
import { createElementalProperties } from '../../../utils/elemental/elementalUtils';

const rawPome = {
    'apple': {
        name: 'Apple',
        elementalProperties: createElementalProperties({
            Earth: 0.5,
            Water: 0.3,
            Air: 0.2,
            Fire: 0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Saturn'],
            favorableZodiac: ['taurus', 'capricorn', 'libra'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Saturn' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        season: ['fall', 'winter'],
        qualities: ['crisp', 'sweet', 'tart', 'versatile', 'refreshing'],
        category: 'fruit',
        subCategory: 'pome',
        nutritionalProfile: {
            calories: 52,
            carbs_g: 14,
            fiber_g: 2.4,
            sugar_g: 10.3,
            vitamins: ['c', 'k'],
            minerals: ['potassium'],
            antioxidants: ['quercetin', 'catechin', 'chlorogenic acid'],
            notes: 'High in pectin and polyphenols'
        },
        varieties: {
            'Honeycrisp': {
                appearance: 'mottled red over yellow background',
                texture: 'extremely crisp, juicy',
                flavor: 'sweet-tart balance, honey notes',
                best_uses: ['eating fresh', 'salads'],
                storage: 'excellent keeper'
            },
            'Granny Smith': {
                appearance: 'bright green',
                texture: 'very firm, crisp',
                flavor: 'tart, acidic, minimal sweetness',
                best_uses: ['baking', 'pies', 'savory applications'],
                storage: 'excellent keeper'
            },
            'Gala': {
                appearance: 'red-orange striped',
                texture: 'crisp, dense flesh',
                flavor: 'mildly sweet, floral notes',
                best_uses: ['eating fresh', 'salads', 'applesauce'],
                storage: 'good keeper'
            },
            'Fuji': {
                appearance: 'red blush over yellow-green',
                texture: 'very crisp, dense',
                flavor: 'very sweet, low acidity',
                best_uses: ['eating fresh', 'salads', 'applesauce'],
                storage: 'excellent keeper'
            },
            'Pink Lady': {
                appearance: 'pink-red blush',
                texture: 'firm, crisp',
                flavor: 'sweet-tart balance, complex',
                best_uses: ['eating fresh', 'salads', 'baking'],
                storage: 'excellent keeper'
            },
            'Golden Delicious': {
                appearance: 'yellow-green',
                texture: 'soft to firm depending on ripeness',
                flavor: 'sweet, mild, honey notes',
                best_uses: ['eating fresh', 'baking', 'applesauce'],
                storage: 'moderate keeper'
            },
            'Braeburn': {
                appearance: 'red striped over yellow-green',
                texture: 'very firm, crisp',
                flavor: 'intense sweet-tart, spicy notes',
                best_uses: ['eating fresh', 'baking', 'pies'],
                storage: 'excellent keeper'
            }
        },
        culinaryApplications: {
            raw: {
                notes: ['Eaten fresh', 'Classic snack fruit'],
                techniques: ['Sliced', 'Wedged', 'Spiralized', 'Grated'],
                dishes: ['Fresh eating', 'Salads', 'Slaws', 'Cheese pAirings']
            },
            baked: {
                notes: ['Classic baking ingredient', 'Holds shape or breaks down depending on variety'],
                techniques: ['Sliced', 'Diced', 'Cored and stuffed'],
                dishes: ['Apple pie', 'Apple crisp', 'Baked apples', 'Cakes', 'Muffins']
            },
            sauced: {
                notes: ['Cooks down to smooth or chunky sauce', 'Minimal or no sugar needed with sweet varieties'],
                techniques: ['Peeled and chopped', 'Puréed after cooking'],
                dishes: ['Applesauce', 'Compote', 'Chutney']
            },
            fermented: {
                notes: ['Traditional preservation method', 'Develops complex flavors'],
                techniques: ['Pressed for juice', 'Fermented whole or chopped'],
                dishes: ['Cider', 'Hard cider', 'Vinegar', 'Kvass']
            },
            dried: {
                notes: ['Concentrates sweetness', 'Long-lasting preservation'],
                techniques: ['Sliced thin', 'Air dried or dehydrated'],
                dishes: ['Dried apple rings', 'Leather', 'Baking ingredient']
            }
        },
        preparation: {
            washing: 'Rinse under cold water, scrub if not organic',
            peeling: 'Optional - peel for sauces and some baked goods, leave on for fiber and color',
            coring: 'Remove core and seeds using apple corer or knife',
            preventing_browning: 'Toss with lemon juice or ascorbic acid solution'
        },
        storage: {
            fresh: {
                temperature: 'Refrigerated 32-35°F (0-1.6°C)',
                humidity: 'High',
                duration: '1-4 months depending on variety',
                notes: 'Store away from ethylene-sensitive produce'
            },
            frozen: {
                preparation: 'Slice or dice, treat with ascorbic acid',
                duration: 'Up to 12 months',
                uses: 'Best for cooking applications after freezing'
            }
        },
        pAirings: ['cinnamon', 'caramel', 'cheddar_cheese', 'pork', 'walnut', 'oats', 'vanilla'],
        substitutions: ['pear', 'quince', 'asian_pear'],
        idealSeasonings: {
            sweet: ['cinnamon', 'nutmeg', 'cardamom', 'vanilla', 'ginger'],
            savory: ['thyme', 'sage', 'rosemary', 'black pepper', 'mustard']
        },
        regionalUses: {
            'American': 'Apple pie, baked apples, apple butter',
            'British': 'Apple crumble, cider, sauce for pork',
            'French': 'Tarte tatin, calvados (apple brandy)',
            'German': 'Apfelstrudel, apfelkuchen (apple cake)',
            'Scandinavian': 'Apple soup, compotes with cardamom'
        }
    },
    'pear': {
        name: 'Pear',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.4,
            Air: 0.2,
            Fire: 0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['taurus', 'cancer', 'libra'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        season: ['fall', 'winter'],
        qualities: ['juicy', 'sweet', 'fragrant', 'delicate', 'elegant'],
        category: 'fruit',
        subCategory: 'pome',
        nutritionalProfile: {
            calories: 57,
            carbs_g: 15.2,
            fiber_g: 3.1,
            sugar_g: 9.8,
            vitamins: ['c', 'k'],
            minerals: ['copper', 'potassium'],
            antioxidants: ['flavonoids', 'catechins', 'epicatechin'],
            notes: 'Higher copper content than most fruits'
        },
        varieties: {
            'Bartlett': {
                appearance: 'classic pear shape, green to yellow when ripe',
                texture: 'buttery, juicy when ripe',
                flavor: 'aromatic, sweet, classic pear flavor',
                best_uses: ['eating fresh', 'canning', 'baby food'],
                ripening: 'ripens after harvest, changes color'
            },
            'Anjou': {
                appearance: 'egg-shaped, green or red varieties',
                texture: 'firm, juicy',
                flavor: 'mildly sweet, refreshing',
                best_uses: ['eating fresh', 'salads', 'poaching'],
                ripening: 'does not change color when ripe'
            },
            'Bosc': {
                appearance: 'long neck, russeted brown skin',
                texture: 'firm, dense flesh',
                flavor: 'sweet, complex, slightly spicy',
                best_uses: ['baking', 'poaching', 'eating fresh'],
                ripening: 'firm-ripe eating preferred'
            },
            'Comice': {
                appearance: 'round, green to yellow',
                texture: 'buttery, very juicy',
                flavor: 'exceptionally sweet, aromatic',
                best_uses: ['eating fresh', 'cheese pAirings'],
                ripening: 'very short window of perfect ripeness'
            },
            'Forelle': {
                appearance: 'small, red-blushed green',
                texture: 'crisp, juicy',
                flavor: 'sweet-tart, refreshing',
                best_uses: ['eating fresh', 'salads'],
                ripening: 'eaten firm'
            }
        },
        culinaryApplications: {
            raw: {
                notes: ['Best when perfectly ripe', 'Classic dessert fruit'],
                techniques: ['Sliced', 'Wedged', 'Spiralized'],
                dishes: ['Fresh eating', 'Salads', 'Cheese pAirings', 'Desserts']
            },
            poached: {
                notes: ['Classic preparation method', 'Enhances natural sweetness'],
                techniques: ['Poached in wine or syrup', 'Spiced with cinnamon or vanilla'],
                dishes: ['Poached pears', 'Pear tarte tatin', 'Desserts']
            },
            baked: {
                notes: ['Holds shape well in baking', 'Natural sweetness reduces sugar needs'],
                techniques: ['Sliced or halved', 'Baked with spices'],
                dishes: ['Pear pie', 'Pear crisp', 'Baked pears', 'Cakes']
            },
            preserved: {
                notes: ['Traditional preservation method', 'High pectin content'],
                techniques: ['Cooked with sugar', 'Canned or jarred'],
                dishes: ['Pear preserves', 'Pear butter', 'Chutney']
            },
            fermented: {
                notes: ['Traditional in some regions', 'Develops complex flavors'],
                techniques: ['Pressed for juice', 'Fermented whole'],
                dishes: ['Perry (pear cider)', 'Pear wine', 'Vinegar']
            }
        },
        preparation: {
            washing: 'Rinse under cold water',
            peeling: 'Optional - skin is edible and nutritious',
            coring: 'Remove core and seeds',
            ripening: 'Most varieties ripen after harvest at room temperature'
        },
        storage: {
            fresh: {
                temperature: 'Refrigerated after ripening',
                duration: '1-2 weeks when ripe',
                notes: 'Store away from ethylene-producing fruits'
            },
            frozen: {
                preparation: 'Slice and treat with ascorbic acid',
                duration: 'Up to 12 months',
                uses: 'Best for cooking applications'
            }
        },
        pAirings: ['blue_cheese', 'honey', 'cinnamon', 'vanilla', 'walnuts', 'wine', 'ginger'],
        substitutions: ['apple', 'quince', 'asian_pear'],
        idealSeasonings: {
            sweet: ['cinnamon', 'vanilla', 'ginger', 'cardamom', 'honey'],
            savory: ['blue cheese', 'prosciutto', 'arugula', 'black pepper']
        },
        regionalUses: {
            'French': 'Poached pears, tarte tatin, perry',
            'Italian': 'Pere al vino (wine-poached pears)',
            'British': 'Perry production, traditional desserts',
            'American': 'Fresh eating, baking, preserves'
        }
    },
    'quince': {
        name: 'Quince',
        elementalProperties: createElementalProperties({
            Earth: 0.5,
            Water: 0.3,
            Air: 0.2,
            Fire: 0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Saturn'],
            favorableZodiac: ['taurus', 'capricorn', 'libra'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Saturn' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        season: ['fall'],
        qualities: ['aromatic', 'tart', 'firm', 'versatile', 'traditional'],
        category: 'fruit',
        subCategory: 'pome',
        nutritionalProfile: {
            calories: 57,
            carbs_g: 15.3,
            fiber_g: 1.9,
            sugar_g: 8.9,
            vitamins: ['c'],
            minerals: ['potassium', 'copper'],
            antioxidants: ['phenolic compounds'],
            notes: 'High in pectin, excellent for preserves'
        },
        varieties: {
            'Champion': {
                appearance: 'large, round, yellow when ripe',
                texture: 'firm, dense',
                flavor: 'aromatic, tart, complex',
                best_uses: ['preserves', 'baking'],
                notes: 'Most common commercial variety'
            },
            'Smyrna': {
                appearance: 'pear-shaped, golden yellow',
                texture: 'firm, less gritty',
                flavor: 'sweet-tart, aromatic',
                best_uses: ['preserves', 'eating when fully ripe'],
                notes: 'Turkish variety'
            },
            'Pineapple': {
                appearance: 'small, round, yellow',
                texture: 'firm, less gritty',
                flavor: 'pineapple-like aroma when cooked',
                best_uses: ['preserves', 'baking'],
                notes: 'Named for its aroma'
            }
        },
        culinaryApplications: {
            preserves: {
                notes: ['Traditional use', 'High pectin content'],
                techniques: ['Cooked with sugar', 'Often combined with other fruits'],
                dishes: ['Quince paste (membrillo)', 'Quince jelly', 'Preserves']
            },
            baked: {
                notes: ['Requires cooking to be palatable', 'Develops complex flavors'],
                techniques: ['Baked whole or sliced', 'Often with honey or sugar'],
                dishes: ['Baked quince', 'Quince tarts', 'Pies']
            },
            poached: {
                notes: ['Classic preparation method', 'Enhances natural sweetness'],
                techniques: ['Poached in wine or syrup', 'Spiced with cinnamon or vanilla'],
                dishes: ['Poached quince', 'Desserts', 'Compotes']
            },
            savory: {
                notes: ['Traditional in Middle Eastern cuisine', 'Works well with meat'],
                techniques: ['Cooked with meat', 'Added to stews'],
                dishes: ['Quince tagine', 'Meat stews', 'Savory compotes']
            },
            fermented: {
                notes: ['Traditional preservation method', 'Develops complex flavors'],
                techniques: ['Fermented whole or sliced'],
                dishes: ['Quince wine', 'Traditional beverages']
            }
        },
        preparation: {
            washing: 'Rinse under cold water, scrub if needed',
            peeling: 'Optional - skin is edible when cooked',
            coring: 'Remove core and seeds',
            cooking: 'Must be cooked to be palatable'
        },
        storage: {
            fresh: {
                temperature: 'Cool, dark place',
                duration: '2-3 months',
                notes: 'Very long storage life'
            },
            preserved: {
                methods: 'Paste, jelly, preserves',
                duration: '1+ years',
                notes: 'Traditional preservation extends seasonal use'
            }
        },
        pAirings: ['manchego_cheese', 'honey', 'cinnamon', 'vanilla', 'walnuts', 'wine', 'ginger'],
        substitutions: ['apple', 'pear', 'asian_pear'],
        idealSeasonings: {
            sweet: ['honey', 'cinnamon', 'vanilla', 'ginger', 'cardamom'],
            savory: ['cumin', 'coriander', 'black pepper', 'garlic']
        },
        regionalUses: {
            'Spanish': 'Membrillo (quince paste) with manchego cheese',
            'Middle Eastern': 'Quince tagine, savory preparations',
            'Mediterranean': 'Preserves, traditional desserts',
            'British': 'Quince cheese (thick paste), preserves'
        }
    },
    'asian_pear': {
        name: 'Asian Pear',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.4,
            Air: 0.2,
            Fire: 0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Mercury'],
            favorableZodiac: ['taurus', 'gemini', 'libra'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Air', planet: 'Mercury' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            }
        },
        season: ['fall'],
        qualities: ['crisp', 'juicy', 'sweet', 'refreshing', 'apple-like'],
        category: 'fruit',
        subCategory: 'pome',
        nutritionalProfile: {
            calories: 42,
            carbs_g: 11.3,
            fiber_g: 3.6,
            sugar_g: 7.4,
            vitamins: ['c', 'k'],
            minerals: ['potassium', 'copper'],
            antioxidants: ['flavonoids'],
            notes: 'Higher fiber content than European pears'
        },
        varieties: {
            'Nijisseiki': {
                appearance: 'round, yellow-green skin',
                texture: 'very crisp, juicy',
                flavor: 'sweet, mild, refreshing',
                best_uses: ['eating fresh', 'salads'],
                notes: 'Most common variety'
            },
            'Hosui': {
                appearance: 'round, golden brown skin',
                texture: 'crisp, very juicy',
                flavor: 'sweet, aromatic',
                best_uses: ['eating fresh', 'salads'],
                notes: 'Japanese variety'
            },
            'Shinko': {
                appearance: 'round, russeted brown skin',
                texture: 'firm, crisp',
                flavor: 'sweet-tart, complex',
                best_uses: ['eating fresh', 'salads'],
                notes: 'Korean variety'
            }
        },
        culinaryApplications: {
            raw: {
                notes: ['Best eaten fresh', 'Crisp texture like apple'],
                techniques: ['Sliced', 'Wedged', 'Spiralized'],
                dishes: ['Fresh eating', 'Salads', 'Slaws', 'Cheese pAirings']
            },
            salads: {
                notes: ['Excellent in salads', 'Adds crunch and sweetness'],
                techniques: ['Sliced or diced', 'Tossed with other ingredients'],
                dishes: ['Fruit salads', 'Green salads', 'Slaws']
            },
            preserves: {
                notes: ['Less common but possible', 'High pectin content'],
                techniques: ['Cooked with sugar', 'Often combined with other fruits'],
                dishes: ['Preserves', 'Chutney', 'Compotes']
            },
            desserts: {
                notes: ['Works well in desserts', 'Maintains texture'],
                techniques: ['Sliced or diced', 'Baked or fresh'],
                dishes: ['Fruit tarts', 'Crisps', 'Fresh desserts']
            }
        },
        preparation: {
            washing: 'Rinse under cold water',
            peeling: 'Optional - skin is edible and nutritious',
            coring: 'Remove core and seeds',
            slicing: 'Slice just before serving to prevent browning'
        },
        storage: {
            fresh: {
                temperature: 'Refrigerated',
                duration: '2-3 weeks',
                notes: 'Store away from ethylene-producing fruits'
            },
            frozen: {
                preparation: 'Slice and treat with ascorbic acid',
                duration: 'Up to 12 months',
                uses: 'Best for cooking applications'
            }
        },
        pAirings: ['blue_cheese', 'honey', 'cinnamon', 'vanilla', 'walnuts', 'wine', 'ginger'],
        substitutions: ['apple', 'pear', 'quince'],
        idealSeasonings: {
            sweet: ['cinnamon', 'vanilla', 'ginger', 'cardamom', 'honey'],
            savory: ['blue cheese', 'prosciutto', 'arugula', 'black pepper']
        },
        regionalUses: {
            'Japanese': 'Fresh eating, traditional desserts',
            'Korean': 'Fresh eating, traditional preparations',
            'Chinese': 'Fresh eating, traditional medicine',
            'American': 'Fresh eating, salads, desserts'
        }
    },
    'medlar': {
        name: 'Medlar',
        elementalProperties: createElementalProperties({
            Earth: 0.5,
            Water: 0.3,
            Air: 0.2,
            Fire: 0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Venus'],
            favorableZodiac: ['capricorn', 'taurus', 'libra'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Water', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        season: ['fall', 'winter'],
        qualities: ['complex', 'traditional', 'historical', 'unique', 'mature'],
        category: 'fruit',
        subCategory: 'pome',
        nutritionalProfile: {
            calories: 79,
            carbs_g: 20.1,
            fiber_g: 1.7,
            sugar_g: 18.5,
            vitamins: ['c'],
            minerals: ['potassium', 'calcium'],
            antioxidants: ['phenolic compounds'],
            notes: 'High in pectin, excellent for preserves'
        },
        varieties: {
            'Nottingham': {
                appearance: 'small, round, brown when bletted',
                texture: 'finer flesh when bletted',
                flavor: 'more pronounced spice notes',
                best_uses: ['eating fresh after bletting', 'historical recipes'],
                notes: 'English variety'
            },
            'Royal': {
                appearance: 'larger fruit, lighter color',
                texture: 'softer, less gritty',
                flavor: 'milder, more accessible flavor',
                best_uses: ['introduction to medlars', 'modern adaptations'],
                notes: 'newer variety'
            }
        },
        culinaryApplications: {
            bletted: {
                notes: ['Must be "bletted" (partially rotted) to be edible', 'Traditional consumption method'],
                techniques: ['Left to soften post-frost', 'Eaten with spoon when soft'],
                dishes: ['Traditional dessert fruit', 'Medieval delicacy']
            },
            preserves: {
                notes: ['Traditional preservation method', 'High pectin content'],
                techniques: ['Cooked with sugar after bletting', 'Strained for smoother texture'],
                dishes: ['Medlar jelly', 'Medlar cheese (thick paste)', 'Preserves']
            },
            wine: {
                notes: ['Historical fermented beverage', 'Complex flavor development'],
                techniques: ['Fermented after bletting'],
                dishes: ['Medlar wine', 'Medieval-inspired beverages']
            },
            dessert: {
                notes: ['Historical dessert ingredient', 'Revival in historical cooking'],
                techniques: ['Puréed after bletting', 'Combined with cream or custard'],
                dishes: ['Medlar fool', 'Medlar tart', 'Historical dessert recreations']
            }
        },
        preparation: {
            harvesting: 'Pick after first frost or when firm-ripe',
            bletting: 'Store stem-down in cool, dark place until soft (2-3 weeks)',
            eating: 'Tear open top, scoop out flesh with spoon',
            preserving: 'Process when bletted but before fermentation occurs'
        },
        storage: {
            fresh: {
                temperature: 'Cool, dark place',
                duration: 'Until bletted (2-3 weeks)',
                notes: 'Traditionally laid out on straw or sawdust'
            },
            preserved: {
                methods: 'Jellies, cheese (paste), wine',
                duration: '1+ years',
                notes: 'Traditional preservation extends seasonal use'
            }
        },
        pAirings: ['cream', 'custard', 'cinnamon', 'port_wine', 'vanilla', 'walnuts', 'honey'],
        substitutions: ['persimmons', 'dates', 'roasted_apples'],
        idealSeasonings: {
            sweet: ['cinnamon', 'nutmeg', 'vanilla', 'cloves', 'orange zest'],
            savory: ['historically rarely used in savory applications']
        },
        regionalUses: {
            'Medieval European': 'Dessert fruit, symbol of decay and maturity',
            'British': 'Traditional jellies and "cheeses" (fruit pastes)',
            'French': 'Confiture de nèfles (medlar jam)',
            'Turkish': 'Popular wild-harvested fruit',
            'Italian': 'Regional preserves and liqueurs'
        },
        culturalSignificance: {
            'Literary': 'Mentioned by Shakespeare, Chaucer, and D.H. Lawrence',
            'Historical': 'Popular medieval fruit now mostly forgotten',
            'Symbolic': 'Used as metaphor for maturity and old age',
            'Modern': 'Revival interest among historical food enthusiasts'
        }
    },
    'loquat': {
        name: 'Loquat',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Venus'],
            favorableZodiac: ['leo', 'taurus'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Sun' },
                    second: { element: 'Fire', planet: 'Venus' },
                    third: { element: 'Earth', planet: 'Mercury' }
                }
            }
        },
        season: ['spring'],
        qualities: ['sweet-tart', 'fragrant', 'floral', 'refreshing', 'unique'],
        category: 'fruit',
        subCategory: 'pome',
        nutritionalProfile: {
            calories: 47,
            carbs_g: 12.1,
            fiber_g: 1.7,
            sugar_g: 8.3,
            vitamins: ['a', 'c', 'b6'],
            minerals: ['potassium', 'manganese'],
            antioxidants: ['carotenoids', 'phenolic compounds'],
            notes: 'Contains rare combination of B vitamins for a fruit'
        },
        varieties: {
            'Tanaka': {
                appearance: 'large, oval, orange skin',
                texture: 'firm, juicy',
                flavor: 'sweet-tart, pronounced aroma',
                best_uses: ['eating fresh', 'preserves'],
                notes: 'Japanese variety, larger fruit'
            },
            'Gold Nugget': {
                appearance: 'round, golden yellow',
                texture: 'tender, juicy',
                flavor: 'exceptionally sweet',
                best_uses: ['eating fresh', 'desserts'],
                notes: 'California variety'
            }
        },
        culinaryApplications: {
            raw: {
                notes: ['Complex flavor best enjoyed fresh', 'Similar to blend of peach and citrus'],
                techniques: ['Peeled', 'Halved and seeded', 'Sliced'],
                dishes: ['Fresh eating', 'Fruit salads', 'Garnishes']
            },
            jams: {
                notes: ['Traditional preservation method', 'Develops rich flavor'],
                techniques: ['Cooked with sugar, often with lemon'],
                dishes: ['Loquat jam', 'Loquat preserves', 'Chutney']
            },
            pies: {
                notes: ['Similar to stone fruit in baking applications', 'Complex flavor development'],
                techniques: ['Peeled, seeded, sliced', 'Combined with sugar and spices'],
                dishes: ['Loquat pie', 'Tarts', 'Cobblers']
            },
            sauces: {
                notes: ['Works well in both sweet and savory applications'],
                techniques: ['Puréed after cooking', 'Strained for smooth texture'],
                dishes: ['Dessert sauces', 'Meat glazes', 'Savory compotes']
            },
            infused: {
                notes: ['Traditional in East Asian preparations', 'Medicinal applications'],
                techniques: ['Steeped in liquid', 'Extracted for flavor'],
                dishes: ['Loquat syrup', 'Liqueur', 'Traditional medicines']
            }
        },
        preparation: {
            harvesting: 'Pick when fully colored and slightly soft',
            peeling: 'Thin skin can be peeled or eaten depending on preference',
            seeding: 'Remove large brown seeds and thin membrane',
            browning: 'Flesh browns quickly when cut, use lemon juice if needed'
        },
        storage: {
            fresh: {
                temperature: 'Refrigerated',
                duration: 'Very short - 3-5 days maximum',
                notes: 'Highly perishable, best eaten soon after picking'
            },
            preserved: {
                methods: 'Jam, syrup, canned in light syrup',
                duration: '1+ years',
                notes: 'Traditional preservation extends seasonal use'
            }
        },
        pAirings: ['vanilla', 'cinnamon', 'ginger', 'honey', 'lemon', 'tropical_fruits', 'almonds'],
        substitutions: ['apricots', 'peaches', 'plums', 'nectarines'],
        idealSeasonings: {
            sweet: ['vanilla', 'cinnamon', 'ginger', 'cardamom', 'citrus zest'],
            savory: ['star anise', 'five spice', 'black pepper', 'chili']
        },
        regionalUses: {
            'Japanese': 'Eaten fresh, preserved as jam, made into syrup (biwa no mitsuri)',
            'Chinese': 'Traditional medicine, cough syrup, pi pa gao',
            'Mediterranean': 'Fresh consumption, jams, local liqueurs',
            'Central American': 'Fresh eating, preserves, regional desserts'
        },
        culturalSignificance: {
            'East Asian': 'Symbol of spring, medicinal importance',
            'Japanese': 'Associated with the biwa (lute) due to similar shape',
            'Chinese Medicine': 'Used in traditional cough remedies for centuries',
            'California': 'Heritage tree often found in old gardens and homesteads'
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const pome = fixIngredientMappings(rawPome);

// Export the entire collection
export default pome;

// Export individual pome fruits for direct access
export const apple = pome.apple;
export const pear = pome.pear;
export const quince = pome.quince;
export const asianPear = pome.asian_pear;
export const medlar = pome.medlar;
export const loquat = pome.loquat;
