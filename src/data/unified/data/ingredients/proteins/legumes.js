"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legumes = void 0;
exports.legumes = {
    "black_beans": {
        name: "Black Beans",
        description: "Small, shiny black beans with a dense, meaty texture popular in Latin American cuisine.",
        category: "legume",
        qualities: ["earthy", "dense", "hearty"],
        sustainabilityScore: 9,
        season: ["all"],
        regionalOrigins: ["central_america", "south_america"],
        elementalProperties: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1
        },
        nutritionalProfile: {
            serving_size_oz: 3,
            calories: 341,
            protein_g: 15,
            fat_g: 0.9,
            carbs_g: 41,
            vitamins: ['Vitamin B12', 'Vitamin B6'],
            minerals: ['Iron', 'Zinc']
        },
        culinaryApplications: {
            boil: {},
            braise: { notes: ["Slow-cooked with aromatics and spices"] }
        },
        pAirings: ["rice", "cumin", "corn", "lime", "cilantro"],
        substitutions: ["pinto_beans", "kidney_beans"],
        affinities: ["grains", "vegetables", "herbs"]
    },
    "chickpeas": {
        name: "Chickpeas",
        description: "Round, beige legumes with a nutty flavor and versatile applications.",
        category: "legume",
        qualities: ["nutty", "firm", "versatile"],
        sustainabilityScore: 9,
        season: ["all"],
        regionalOrigins: ["middle_east", "mediterranean", "india"],
        elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        },
        nutritionalProfile: {
            serving_size_oz: 3,
            calories: 364,
            protein_g: 19,
            fat_g: 6,
            carbs_g: 61,
            vitamins: ['Vitamin B12', 'Vitamin B6'],
            minerals: ['Iron', 'Zinc']
        },
        culinaryApplications: {
            boil: {},
            roast: {},
            puree: { notes: ["Base for hummus and other dips"] }
        },
        pAirings: ["tahini", "olive_oil", "lemon", "garlic", "herbs"],
        substitutions: ["white_beans", "lentils"],
        affinities: ["mediterranean_herbs", "grains", "vegetables"]
    },
    "lentils": {
        name: "Lentils",
        description: "Small, lens-shaped legumes available in various colors with quick cooking time.",
        category: "legume",
        qualities: ["earthy", "quick-cooking", "versatile", "nutritious", "protein-rich"],
        sustainabilityScore: 9,
        season: ["all"],
        regionalOrigins: ["middle_east", "india", "mediterranean", "north_africa"],
        elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1
        },
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Mercury'],
            favorableZodiac: ['capricorn', 'virgo', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Water',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Fire', planet: 'Mars' }
                }
            }
        },
        nutritionalProfile: {
            serving_size_oz: 3,
            calories: 353,
            protein_g: 25,
            fat_g: 1.1,
            carbs_g: 63,
            vitamins: ['Vitamin B12', 'Vitamin B6'],
            minerals: ['Iron', 'Zinc']
        },
        healthBenefits: {
            hearthealth: {
                benefit: "Cardiovascular Support",
                mechanism: "Soluble fiber helps lower cholesterol; potassium supports blood pressure regulation",
                evidence: "Multiple studies show regular consumption associated with reduced heart disease risk"
            },
            bloodSugarControl: {
                benefit: "Blood Sugar Management",
                mechanism: "High fiber and protein content slows digestion and glucose absorption",
                evidence: "Low glycemic index (GI values 25-30) helps prevent blood sugar spikes"
            },
            digestiveHealth: {
                benefit: "Digestive Support",
                mechanism: "Fiber promotes healthy gut microbiome and regular bowel movements",
                notes: "Prebiotic properties support beneficial gut bacteria"
            },
            weightManagement: {
                benefit: "Weight Management",
                mechanism: "High protein and fiber increase satiety and reduce overall calorie intake",
                evidence: "Studies show higher legume consumption associated with lower BMI"
            },
            ironSource: {
                benefit: "Non-heme Iron Source",
                mechanism: "Plant-based iron supports red blood cell production",
                notes: "PAiring with vitamin C foods improves absorption"
            }
        },
        varieties: {
            brown: {
                name: "Brown Lentils",
                appearance: "Medium-sized, khaki to dark brown",
                texture: "Holds shape when cooked properly, slightly meaty",
                cooking_time: "20-30 minutes",
                best_uses: ["soups", "stews", "casseroles", "veggie burgers"],
                notes: "Most common variety, all-purpose option"
            },
            green: {
                name: "Green Lentils (French Lentils / (Puy || 1))",
                appearance: "Small, mottled dark green",
                texture: "Firm, holds shape very well",
                cooking_time: "25-35 minutes",
                best_uses: ["salads", "side dishes", "warm applications where texture matters"],
                notes: "More expensive, peppery flavor profile"
            },
            red: {
                name: "Red / (Orange || 1) Lentils",
                appearance: "Split, salmon to orange color",
                texture: "Break down when cooked into soft puree",
                cooking_time: "15-20 minutes",
                best_uses: ["dal", "purees", "soups", "curries"],
                notes: "Fastest cooking, sweetest flavor"
            },
            black: {
                name: "Black Lentils (Beluga)",
                appearance: "Small, glossy black (resembling caviar)",
                texture: "Firm, maintains shape well",
                cooking_time: "25-30 minutes",
                best_uses: ["salads", "side dishes", "hearty entrees"],
                notes: "Most nutritionally dense variety, earthy flavor"
            },
            yellow: {
                name: "Yellow Lentils",
                appearance: "Split, golden yellow",
                texture: "Soft, breaks down when cooked",
                cooking_time: "15-20 minutes",
                best_uses: ["Indian dal", "smooth soups", "purees"],
                notes: "Often confused with split peas but cooks faster"
            }
        },
        culinaryApplications: {
            soups: {
                notes: ["Thickens naturally as red lentils break down", "Brown and green add texture to clear soups"],
                techniques: "Sauté aromatics first, add lentils, then liquid",
                cooking_ratio: "1:3 lentils to liquid for soup, 1:4 for thinner consistency"
            },
            salads: {
                notes: ["Use firm varieties that hold shape", "Dress while warm for better flavor absorption"],
                techniques: "Cook al dente (slightly firm), rinse to stop cooking",
                best_varieties: ["green", "black", "firm brown"]
            },
            dal: {
                notes: ["Traditional Indian preparation", "Seasoned with spices and ghee / (oil || 1)"],
                techniques: "Prepare tadka (tempered spices) separately and add at end",
                best_varieties: ["red", "yellow", "split varieties"]
            },
            patties: {
                notes: ["Excellent base for vegetarian burgers", "Combine with grains for complete protein"],
                binding_agents: ["eggs", "breadcrumbs", "flour", "mashed potato"],
                techniques: "Partially mash for cohesion while maintaining some texture"
            },
            sides: {
                notes: ["Simple preparation with aromatics", "PAirs with many mains"],
                techniques: "Toast spices first, add aromatics, then lentils and liquid",
                flavor_profiles: {
                    mediterranean: ["garlic", "lemon", "olive oil", "herbs"],
                    indian: ["cumin", "turmeric", "ginger", "ghee"],
                    middle_eastern: ["cinnamon", "allspice", "mint", "yogurt"]
                }
            },
            stuffing: {
                notes: ["Fill vegetables or use as layer in casseroles", "Adds protein to plant-based dishes"],
                techniques: "Combine with aromatics, herbs, perhaps nuts or dried fruits",
                applications: ["stuffed peppers", "eggplant", "cabbage rolls", "squash"]
            }
        },
        preparation: {
            sorting: "Check for small stones and debris",
            rinsing: "Rinse thoroughly under cold water",
            soaking: {
                required: false,
                benefits: "Can reduce cooking time and improve digestibility",
                method: "Cover with water for 2-8 hours, then drain and rinse",
                exceptions: "Split red and yellow varieties don't benefit much from soaking"
            },
            sprouting: {
                method: "Soak 12 hours, drain, rinse twice daily for 2-3 days",
                benefits: "Increases nutrient availability, reduces antinutrients",
                uses: "Salads, sandwiches, raw applications",
                varieties: "Whole lentils only (not split varieties)"
            },
            storage: {
                dry: "Cool, dark place in Airtight container for up to 1 year",
                cooked: "Refrigerate up to 5 days, freeze up to 3 months",
                notes: "Flavor and nutrition decline slowly after 6 months dry storage"
            }
        },
        culinaryPAirings: {
            herbs: ["thyme", "bay leaf", "parsley", "cilantro", "mint"],
            spices: ["cumin", "coriander", "turmeric", "garam masala", "smoked paprika"],
            vegetables: ["carrots", "celery", "onions", "tomatoes", "garlic"],
            acids: ["lemon juice", "vinegar", "tomato paste", "wine"],
            fats: ["olive oil", "coconut oil", "ghee", "butter"],
            proteins: ["yogurt", "eggs", "cheese", "rice (for complete protein)"]
        },
        regionalPreparations: {
            indian: {
                name: "Indian",
                dishes: ["dal", "khichdi", "sambar"],
                techniques: "Pressure cooking, tempering with spices in hot oil / (ghee || 1)",
                spice_profiles: ["turmeric", "cumin", "mustard seeds", "asafoetida"]
            },
            middle_eastern: {
                name: "Middle Eastern",
                dishes: ["mujadara", "koshari", "soup"],
                techniques: "Often pAired with rice, topped with caramelized onions",
                spice_profiles: ["cumin", "cinnamon", "allspice"]
            },
            mediterranean: {
                name: "Mediterranean",
                dishes: ["lentil soup", "salads", "side dishes"],
                techniques: "Often finished with olive oil and herbs",
                spice_profiles: ["bay leaf", "oregano", "thyme", "garlic"]
            },
            european: {
                name: "European",
                dishes: ["soups", "stews", "with sausage"],
                techniques: "Often pAired with smoked meats or vinegar",
                spice_profiles: ["bay leaf", "thyme", "black pepper", "vinegar"]
            }
        },
        pAirings: ["cumin", "coriander", "garlic", "tomato", "carrots", "onion", "lemon", "rice", "yogurt"],
        substitutions: ["split_peas", "mung_beans", "small_beans", "quinoa (for salads)"],
        affinities: ["spices", "aromatics", "vegetables", "grains", "herbs"]
    },
    "tempeh": {
        name: "Tempeh",
        description: "Fermented soybean cake with a firm texture and nutty flavor.",
        category: "legume",
        qualities: ["firm", "nutty", "fermented"],
        sustainabilityScore: 8,
        season: ["all"],
        regionalOrigins: ["indonesia"],
        elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2
        },
        nutritionalProfile: {
            serving_size_oz: 3,
            calories: 193,
            protein_g: 19,
            fat_g: 11,
            carbs_g: 9,
            vitamins: ['Vitamin B12', 'Vitamin B6'],
            minerals: ['Iron', 'Zinc']
        },
        culinaryApplications: {
            grill: {},
            fry: {},
            steam: { notes: ["Traditional preparation in some Indonesian dishes"] }
        },
        pAirings: ["soy_sauce", "ginger", "garlic", "chili", "lime"],
        substitutions: ["tofu", "seitan"],
        affinities: ["asian_aromatics", "umami_flavors"]
    }
};
exports.default = exports.legumes;
