"use strict";
import { fixIngredientMappings } from '../../../utils/elementalUtils';

const rawDAiry = {
    "greek_yogurt": {
        name: "Greek Yogurt",
        description: "Strained yogurt with higher protein content and thick texture.",
        category: "dAiry",
        qualities: ["tangy", "creamy", "thick", "protein-rich", "versatile"],
        sustainabilityScore: 6,
        season: ["all"],
        regionalOrigins: ["mediterranean", "middle_east"],
        elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
        astrologicalProfile: {
            rulingPlanets: ["Moon", "Venus"],
            zodiacInfluence: ["cancer", "taurus"],
            celestialAspects: {
                moonPhase: {
                    waxing: "creamier texture, milder flavor",
                    full: "peak tanginess and thickness",
                    waning: "more digestible, gentler on system"
                }
            }
        },
        lunarPhaseModifiers: {
            "New moon": {
                elementalBoost: {
                    Water: 0.1,
                    Earth: 0.1
                },
                preparationTips: ["Best for starting new fermentation batches", "Ideal for milder yogurt"]
            },
            "Full moon": {
                elementalBoost: {
                    Water: 0.2
                },
                preparationTips: ["Maximum tangy flavor development", "Best probiotic activity"]
            }
        },
        nutritionalProfile: {
            serving_size_oz: 6,
            calories: 100,
            protein_g: 17,
            fat_g: 0.7,
            carbs_g: 6.2,
            vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin B6'],
            minerals: ['Calcium', 'Phosphorus', 'Zinc', 'Selenium', 'Potassium']
        },
        healthBenefits: {
            "gut health": "Contains beneficial probiotics that support digestive health",
            "protein source": "High-quality complete protein for muscle maintenance",
            "bone strength": "Rich calcium content supports skeletal structure",
            "satiety": "High protein content increases feeling of fullness",
            "blood sugar": "Lower glycemic impact than regular yogurt"
        },
        varieties: {
            "non-fat": {
                texture: "Less creamy, slightly more tangy",
                moisture: "Lower",
                protein: "Highest",
                uses: "Weight management, higher protein needs",
                notes: "Can be slightly grainy in texture"
            },
            "2% fat": {
                texture: "Balanced creaminess and tang",
                moisture: "Medium",
                protein: "High",
                uses: "All-purpose, good balance of flavor and nutrition",
                notes: "Most versatile variety"
            },
            "full-fat": {
                texture: "Creamiest, smoothest",
                moisture: "Medium-high",
                protein: "Moderate",
                uses: "Rich applications, cooking stability",
                notes: "Best for cooking as less likely to separate"
            },
            "strained": {
                texture: "Extra thick, almost cheese-like",
                moisture: "Low",
                protein: "Very high",
                uses: "Labneh-style spreads, ultra-rich applications",
                notes: "Can be hung in cheesecloth for even thicker result"
            }
        },
        culinaryApplications: {
            raw: {
                notes: ["Base for breakfast bowls", "Topping for savory dishes"],
                techniques: ["Top with honey and nuts", "Layer with granola and fruit"],
                dishes: ["Breakfast parfaits", "Fruit bowls", "Topped soups"]
            },
            mix: {
                notes: ["Base for dips and sauces", "Used in marinades"],
                techniques: ["Blend with herbs and garlic", "Whisk until smooth before incorporating"],
                dishes: ["Tzatziki", "Creamy herb dips", "Protein smoothies", "Marinades for chicken"]
            },
            bake: {
                notes: ["Adds moisture to baked goods", "Can replace sour cream or oil"],
                techniques: ["Bring to room temperature before baking", "Use in place of buttermilk (thicker result)"],
                dishes: ["Muffins", "Quick breads", "Pancakes", "Cakes"]
            },
            cook: {
                notes: ["Use higher fat content for cooking stability", "Add at end of cooking or will separate"],
                techniques: ["Temper with hot ingredients to prevent curdling", "Stabilize with cornstarch for high heat"],
                dishes: ["Creamy sauces", "Stroganoff", "Indian curry finisher"]
            }
        },
        preparation: {
            homemade: {
                ingredients: ["Whole milk", "Live cultures", "Time"],
                process: "Heat milk, cool slightly, add culture, incubate, strain through cheesecloth",
                tips: ["Longer straining creates thicker yogurt", "Save whey for other applications"]
            },
            storebought: {
                selection: "Choose without added thickeners for purest flavor",
                preparation: "Stir before using if separation has occurred"
            }
        },
        storage: {
            container: "Glass or original container",
            duration: "1-2 weeks refrigerated",
            temperature: {
                fahrenheit: 38,
                celsius: 3.3
            },
            notes: "May continue to increase in tanginess over time"
        },
        culturalSignificance: {
            "middle_eastern": {
                role: "Traditional breakfast component and sauce base",
                pAirings: "Olive oil, za'atar, honey, nuts",
                dishes: "Labneh, breakfast spreads"
            },
            "modern health": {
                role: "Protein-rich alternative to higher-fat dAiry",
                adaptations: "Protein bowls, smoothies, healthier baking"
            }
        },
        affinities: {
            sweet: ["honey", "maple syrup", "berries", "stone fruits", "granola", "nuts"],
            savory: ["cucumber", "mint", "dill", "garlic", "olive oil", "lemon"]
        },
        pAirings: ["honey", "berries", "nuts", "cucumber", "garlic", "dill", "mint", "olive oil"],
        substitutions: ["labneh", "skyr", "cottage_cheese", "thick_coconut_yogurt"],
        idealSeasonings: {
            sweet: ["vanilla", "cinnamon", "cardamom", "honey", "maple"],
            savory: ["dill", "mint", "za'atar", "sumac", "black pepper", "lemon zest"]
        }
    },
    "cottage_cheese": {
        name: "Cottage Cheese",
        description: "Fresh cheese curd product with mild flavor and varying textures.",
        category: "dAiry",
        qualities: ["mild", "soft", "fresh", "protein-rich", "versatile"],
        sustainabilityScore: 5,
        season: ["all"],
        regionalOrigins: ["europe", "north_america"],
        elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
        astrologicalProfile: {
            rulingPlanets: ["Moon", "Venus"],
            zodiacInfluence: ["taurus", "cancer"],
            celestialAspects: {
                moonPhase: {
                    waxing: "enhanced moisture and softness",
                    full: "optimal curd formation and flavor",
                    waning: "drier texture, easier digestion"
                }
            }
        },
        lunarPhaseModifiers: {
            "New moon": {
                elementalBoost: {
                    Water: 0.15,
                    Earth: 0.05
                },
                preparationTips: ["Best for starting fresh batches", "More delicate curds form"]
            },
            "Full moon": {
                elementalBoost: {
                    Water: 0.1,
                    Earth: 0.1
                },
                preparationTips: ["Optimal curd formation", "Best flavor development"]
            }
        },
        nutritionalProfile: {
            serving_size_oz: 4,
            calories: 110,
            protein_g: 12,
            fat_g: 5,
            carbs_g: 3,
            vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin A'],
            minerals: ['Calcium', 'Phosphorus', 'Selenium', 'Sodium']
        },
        healthBenefits: {
            "muscle support": "Rich source of casein protein for slow-release amino acids",
            "bone health": "Excellent calcium source for skeletal maintenance",
            "satiety": "High protein and moderate fat content increases fullness",
            "metabolism": "Contains conjugated linoleic acid (CLA) in full-fat versions",
            "recovery": "Popular among athletes for post-workout recovery"
        },
        varieties: {
            "small_curd": {
                texture: "Fine, small curds",
                moisture: "Medium-high",
                protein: "High",
                uses: "Salads, dips, smoothies",
                notes: "Most common variety"
            },
            "large_curd": {
                texture: "Larger, more distinct curds",
                moisture: "Medium",
                protein: "High",
                uses: "Eating fresh, fruit pAirings",
                notes: "More traditional style"
            },
            "low_fat": {
                texture: "Slightly drier, less creamy",
                moisture: "Medium",
                protein: "Very high",
                uses: "Weight management, high protein needs",
                notes: "Lower calorie option"
            },
            "full_fat": {
                texture: "Creamiest, richest",
                moisture: "High",
                protein: "High",
                uses: "Rich applications, traditional uses",
                notes: "Best flavor and texture"
            }
        },
        culinaryApplications: {
            raw: {
                notes: ["Classic breakfast food", "High-protein snack"],
                techniques: ["Top with fruit or honey", "Mix with herbs for savory"],
                dishes: ["Breakfast bowls", "Fruit salads", "Protein snacks"]
            },
            mix: {
                notes: ["Base for dips and spreads", "Used in fillings"],
                techniques: ["Blend until smooth for dips", "Mix gently for texture"],
                dishes: ["Veggie dip", "Stuffed pasta", "Protein smoothies"]
            },
            cook: {
                notes: ["Adds protein to dishes", "Can be used in baked goods"],
                techniques: ["Add at end of cooking", "Use in place of ricotta"],
                dishes: ["Lasagna", "Stuffed shells", "Protein pancakes"]
            },
            bake: {
                notes: ["Can replace ricotta in many recipes", "Adds protein to baked goods"],
                techniques: ["Mix with eggs for stability", "Combine with other cheeses for depth"],
                dishes: ["Ravioli", "Manicotti", "Stuffed shells", "Calzone"]
            }
        },
        preparation: {
            homemade: {
                ingredients: ["Whole milk", "Heavy cream (optional)", "Acid (vinegar, lemon juice, or buttermilk)"],
                process: "Heat milk, add acid, let curds form, drain in cheesecloth",
                tips: ["Higher fat content creates creamier cheese", "Save whey for bread making or soup"]
            },
            storebought: {
                selection: "Choose from refrigerated section, avoid shelf-stable varieties for best flavor",
                preparation: "Drain excess liquid before using in recipes requiring firmer texture"
            }
        },
        storage: {
            container: "Original container or Airtight glass",
            duration: "5-7 days refrigerated",
            temperature: {
                fahrenheit: 38,
                celsius: 3.3
            },
            notes: "Best used fresh, texture deteriorates over time"
        },
        culturalSignificance: {
            "sicilian": {
                role: "Key ingredient in traditional desserts",
                pAirings: "Chocolate, pistachios, candied fruit, cinnamon",
                dishes: "Cassata, cannoli, Sicilian cheesecake"
            },
            "modern": {
                role: "Versatile low-sodium cheese in contemporary cooking",
                adaptations: "Protein-rich breakfast component, sandwich spread, dip base"
            }
        },
        affinities: {
            sweet: ["honey", "figs", "berries", "chocolate", "citrus zest", "vanilla"],
            savory: ["tomatoes", "spinach", "basil", "garlic", "olive oil", "lemon"]
        },
        pAirings: ["honey", "olive_oil", "herbs", "lemon_zest", "tomato_sauce", "spinach", "pasta"],
        substitutions: ["cottage_cheese", "cream_cheese", "mascarpone", "quark"],
        idealSeasonings: {
            sweet: ["vanilla", "cinnamon", "orange zest", "honey", "pistachios"],
            savory: ["basil", "black pepper", "lemon zest", "red pepper flakes", "parsley"]
        }
    },
    "cream_cheese": {
        name: "Cream Cheese",
        description: "Soft, spreadable fresh cheese with mild flavor and smooth texture.",
        category: "dAiry",
        qualities: ["creamy", "tangy", "smooth", "spreadable", "rich"],
        sustainabilityScore: 4,
        season: ["all"],
        regionalOrigins: ["united_states", "europe"],
        elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
        astrologicalProfile: {
            rulingPlanets: ["Venus", "Moon"],
            zodiacInfluence: ["taurus", "cancer", "libra"],
            celestialAspects: {
                moonPhase: {
                    waxing: "creamier texture, milder flavor",
                    full: "perfect balance of richness and tang",
                    waning: "more pronounced tanginess"
                }
            }
        },
        lunarPhaseModifiers: {
            "New moon": {
                elementalBoost: {
                    Water: 0.1,
                    Earth: 0.1
                },
                preparationTips: ["Best for starting fresh batches", "Creates milder flavor profile"]
            },
            "Full moon": {
                elementalBoost: {
                    Earth: 0.2
                },
                preparationTips: ["Optimal richness and texture", "Best structure for baking"]
            }
        },
        nutritionalProfile: {
            serving_size_oz: 2,
            calories: 200,
            protein_g: 4,
            fat_g: 20,
            carbs_g: 2,
            vitamins: ['Vitamin A', 'Vitamin B12', 'Riboflavin'],
            minerals: ['Calcium', 'Phosphorus', 'Selenium']
        },
        healthBenefits: {
            "energy dense": "Provides concentrated calories from fat",
            "fat-soluble vitamins": "Contains vitamins A and D",
            "calcium source": "Contributes to daily calcium needs",
            "satiety": "High fat content increases feeling of fullness"
        },
        varieties: {
            "full-fat": {
                texture: "Richest, creamiest",
                moisture: "Medium-high",
                fat: "High (33%+)",
                uses: "Cheesecake, frostings, traditional applications",
                notes: "Best flavor and baking performance"
            },
            "reduced-fat": {
                texture: "Slightly less creamy, softer",
                moisture: "High",
                fat: "Medium",
                uses: "Everyday spreading, lighter applications",
                notes: "Common supermarket variety"
            },
            "whipped": {
                texture: "Lighter, fluffier",
                moisture: "Medium",
                fat: "Medium-high",
                uses: "Spreading, dipping, when lighter texture desired",
                notes: "Incorporates Air, easier to spread cold"
            },
            "cultured": {
                texture: "Traditional, more complex",
                moisture: "Medium",
                fat: "High",
                uses: "Gourmet applications, artisanal preparations",
                notes: "More traditional method with complex flavor"
            }
        },
        culinaryApplications: {
            spread: {
                notes: ["Classic bagel topping", "Base for sandwiches and wraps"],
                techniques: ["Allow to soften before spreading", "Layer thinly for best flavor"],
                dishes: ["Bagels and lox", "Tea sandwiches", "Canapés"]
            },
            mix: {
                notes: ["Base for dips and spreads", "Mix with herbs or honey for flavored spread"],
                techniques: ["Room temperature for easiest mixing", "Use paddle attachment not whisk"],
                dishes: ["Veggie dip", "Herb spread", "Flavored compound spreads"]
            },
            bake: {
                notes: ["Essential for cheesecake", "Structure-adding ingredient for desserts"],
                techniques: ["Room temperature for baking", "Beat until smooth but don't overbeat"],
                dishes: ["Cheesecake", "Danishes", "Puffs", "Sweet rolls"]
            },
            cook: {
                notes: ["Creates creamy sauces", "Thickens without flour or cornstarch"],
                techniques: ["Add at end of cooking", "Low heat to prevent separation"],
                dishes: ["Creamy pasta sauces", "Mashed potatoes", "Creamed spinach"]
            }
        },
        preparation: {
            homemade: {
                ingredients: ["Whole milk", "Heavy cream", "Acid (lemon juice or vinegar)", "Salt"],
                process: "Heat dAiry, add acid, strain, then blend until smooth",
                tips: ["Longer straining creates firmer texture", "Adding culture develops more complex flavor"]
            },
            storebought: {
                selection: "Choose block style for baking, whipped for spreading",
                preparation: "Bring to room temperature before using in recipes"
            }
        },
        storage: {
            container: "Original foil wrapper or Airtight container",
            duration: "2 weeks refrigerated unopened, 1 week once opened",
            temperature: {
                fahrenheit: 38,
                celsius: 3.3
            },
            notes: "Can be frozen for up to 2 months but texture may change"
        },
        culturalSignificance: {
            "american": {
                role: "Iconic breakfast spread popularized in New York",
                pAirings: "Bagels, lox, capers, red onion, tomato",
                dishes: "Cheesecake, cream cheese frosting, dips"
            },
            "european": {
                role: "Traditional fresh cheese in many regional varieties",
                pAirings: "Herbs, fruits, honey, nuts",
                dishes: "Pastries, tarts, savory spreads"
            },
            "modern": {
                role: "Versatile ingredient in contemporary cooking and baking",
                adaptations: "Vegan alternatives, flavored varieties, as cooking ingredient"
            }
        },
        affinities: {
            sweet: ["berries", "honey", "vanilla", "chocolate", "cinnamon", "caramel"],
            savory: ["chives", "garlic", "dill", "smoked salmon", "cucumber", "olive"]
        },
        pAirings: ["bagel", "berries", "honey", "smoked_salmon", "herbs", "cucumber", "walnuts"],
        substitutions: ["mascarpone", "ricotta", "neufchatel", "quark", "greek_yogurt"],
        idealSeasonings: {
            sweet: ["vanilla", "cinnamon", "orange zest", "honey", "maple"],
            savory: ["chives", "dill", "garlic powder", "everything bagel seasoning", "black pepper"]
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const dAiry = fixIngredientMappings(rawDAiry);
export default dAiry;
