import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawMedicinalHerbs = {
  echinacea: {
    name: 'Echinacea',
    elementalProperties: { Earth: 0.3, Fire: 0.4, Air: 0.2, Water: 0.1 }
    astrologicalProfile: {
      planetaryRuler: 'Mars',
      zodiacRuler: 'Aries',
      element: 'Fire',
      energyType: 'Protective',
      lunarPhaseModifiers: {}
    }
    qualities: ['warming', 'stimulating', 'drying', 'bitter', 'pungent', 'resilient'],
    category: 'medicinal herb',
    origin: ['North America', 'Native American traditional medicine'],
    nutritionalProfile: {
      serving_size: '1 tsp dried herb',
      calories: 3,
      macros: {
        protein: 0.2,
        carbs: 0.8,
        fat: 0.1,
        fiber: 0.3
      }
      vitamins: {
        C: 0.02B1: 0.01B3: 0.01
      }
      minerals: {
        potassium: 0.01,
        calcium: 0.01,
        magnesium: 0.01
      }
      phytonutrients: {
        alkylamides: 0.75,
        polysaccharides: 0.65,
        phenolic_compounds: 0.48,
        caffeic_acid: 0.38,
        essential_oils: 0.25
      }
      source: 'Herbal Medicine Database'
    }
    varieties: {
      purpurea: {
        name: 'Echinacea purpurea',
        characteristics: 'Most common variety, purple coneflower with fibrous roots',
        medicinal_focus: 'Upper respiratory infections, general immune support',
        parts_used: ['aerial parts', 'roots'],
        notes: 'Most widely researched, easiest to cultivate'
      }
      angustifolia: {
        name: 'Echinacea angustifolia',
        characteristics: 'Narrow-leaved coneflower with taproot, shorter plant',
        medicinal_focus: 'Stronger anti-inflammatory, lymphatic support',
        parts_used: ['roots primarily'],
        notes: 'Considered most potent by many herbalists, harder to grow'
      }
      pallida: {
        name: 'Echinacea pallida',
        characteristics: 'Pale purple coneflower with slender petals',
        medicinal_focus: 'Blood purification, skin conditions',
        parts_used: ['roots primarily'],
        notes: 'More prevalent in European herbal medicine'
      }
    }
    seasonality: {
      growing_season: 'Spring through fall',
      flowering_period: 'Mid-summer to early fall',
      harvesting: {
        flowers: 'When fully open in summer',
        'aerial parts': 'During flowering',
        roots: 'Fall of second or third year growth'
      }
    }
    medicinalProperties: {
      actions: [
        'immunostimulant',
        'antimicrobial',
        'anti-inflammatory',
        'lymphatic',
        'vulnerary',
        'alterative'
      ],
      energetics: {
        taste: ['bitter', 'pungent', 'slightly sweet'],
        temperature: 'warming',
        moisture: 'drying'
      }
      systems_affected: ['immune', 'lymphatic', 'respiratory', 'skin', 'blood'],
      chemical_constituents: {
        alkylamides: 'Immune-modulating, tingling sensation on tongue',
        'phenolic compounds': 'Antioxidant properties',
        polysaccharides: 'Immune-stimulating',
        'caffeic acid derivatives': 'Anti-inflammatory',
        'essential oils': 'Antimicrobial properties'
      }
      traditional_uses: {
        native_american: [
          'Snake bites and venomous bites / (stings || 1)',
          'Wounds and infections',
          'Toothaches and mouth sores',
          'Pain relief'
        ],
        western_herbalism: [
          'Cold and flu prevention',
          'Upper respiratory infections',
          'Wound healing',
          'Blood purification',
          'Immune support'
        ]
      }
      modern_applications: [
        'Reducing duration and severity of colds and flu',
        'Supporting immune function during infection',
        'Topical application for wound healing',
        'Adjunct therapy for urinary tract infections',
        'Supportive treatment for chronic infections'
      ],
      research_highlights: [
        'Meta-analyses suggest modest benefit for preventing and treating colds',
        'Shows activity against viral, bacterial, and fungal pathogens in vitro',
        'May support white blood cell activity and production',
        'Most effective when taken at first sign of infection'
      ],
      contraindications: [
        'Progressive systemic diseases like tuberculosis, multiple sclerosis',
        'Autoimmune conditions (controversial)',
        'Pregnancy and lactation (insufficient evidence for safety)',
        'Allergies to plants in the Asteraceae family'
      ]
    }
    preparationMethods: {
      tincture: {
        name: 'Tincture',
        parts_used: ['roots', 'aerial parts', 'combined'],
        method: 'Fresh 1:2 or dried 1:5 in 50-60% alcohol',
        dosage: '1-3 ml3-5 times daily at first sign of infection',
        shelf_life: '2-3 years',
        notes: 'Alcohol extracts alkylamides effectively, produces characteristic tingling'
      }
      decoction: {
        name: 'Decoction',
        parts_used: ['roots primarily'],
        method: 'Simmer 1 tsp dried root in 8 oz water for 15-20 minutes',
        dosage: '1 cup3 times daily',
        shelf_life: '24 hours refrigerated',
        notes: 'Less potent than tincture, better for polysaccharides'
      }
      infusion: {
        name: 'Infusion',
        parts_used: ['aerial parts primarily'],
        method: 'Steep 1-2 tsp dried herb in 8 oz hot water for 10-15 minutes',
        dosage: '1 cup3 times daily',
        shelf_life: '24 hours refrigerated',
        notes: 'Milder action, good for maintenance'
      }
      glycerite: {
        name: 'Glycerite',
        parts_used: ['combined aerial parts and roots'],
        method: 'Blend 1:2 fresh herb with vegetable glycerin and 25% water',
        dosage: '2-5 ml3 times daily',
        shelf_life: '1-2 years',
        notes: 'Alcohol-free alternative, suitable for children and those avoiding alcohol'
      }
      salve: {
        name: 'Salve',
        parts_used: ['root extract'],
        method: 'Infuse herb in oil, strain, add beeswax to solidify',
        application: 'Apply to wounds, burns, insect bites 2-3 times daily',
        shelf_life: '1 year',
        notes: 'Excellent for topical healing applications'
      }
      powder: {
        name: 'Powder',
        parts_used: ['dried roots or aerial parts'],
        method: 'Grind dried herb to fine powder',
        dosage: '500-1000 mg in capsules, 3 times daily',
        shelf_life: '1 year in airtight container',
        notes: 'Good for those who dislike the taste, easy for travel'
      }
    }
    therapeuticUses: {
      respiratory: {
        name: 'Respiratory Applications',
        conditions: ['Sore throat', 'Sinus infections', 'Bronchitis', 'Laryngitis'],
        protocols: {
          internal: 'Tincture or tea 3-5 times daily',
          local: 'Gargle with diluted tincture or strong tea'
        }
      }
      wound_healing: {
        name: 'Wound Healing',
        applications: ['Cuts and scrapes', 'Burns', 'Insect bites and stings', 'Skin infections'],
        protocols: {
          minor_wounds: 'Clean with diluted tincture, apply salve',
          severe_wounds: 'Internal and external applications combined'
        }
      }
      lymphatic: {
        name: 'Lymphatic Support',
        applications: [
          'Swollen glands',
          'Recurring infections',
          'Poor immune response',
          'Post-illness recovery'
        ],
        protocols: {
          acute: 'Combine with lymphatic herbs like calendula or cleavers',
          chronic: 'Lower doses for longer periods, pulsed protocol'
        }
      }
    }
    clinicalConsiderations: {
      effective_use: [
        'Start at first sign of infection rather than waiting',
        'Higher doses for shorter periods in acute conditions',
        'Lower doses for longer periods for chronic support',
        'Fresh plant preparations often considered more potent',
        'Combining different species may provide broader spectrum support'
      ],
      safety_profile: {
        side_effects: [
          'Rare allergic reactions',
          'Mild gastrointestinal upset in some individuals',
          'Potential liver effects with prolonged use at high doses'
        ],
        drug_interactions: [
          'Theoretical concern with immunosuppressant medications',
          'May alter metabolism of drugs processed by CYP450 enzymes',
          'Generally considered safe with most medications'
        ],
        toxicity: 'Very low toxicity profile with high safety margin'
      }
      quality_factors: [
        'Species identification critical for therapeutic effect',
        'Growing conditions impact medicinal constituent levels',
        'Harvest timing affects potency',
        'Processing method influences constituent profile',
        'Storage conditions and age affect shelf life'
      ]
    }
    culinaryApplications: {}
    culturalContext: {
      native_american: {
        tribes: ['Lakota', 'Dakota', 'Kiowa', 'Cheyenne', 'Comanche'],
        traditional_uses:
          'Used for snake bites, wounds, burns, toothache, sore throat, and as an analgesic',
        cultural_significance:
          'Considered a sacred plant for healing serious wounds and infections'
      }
      modern_western: {
        historical_adoption: 'Introduced to American Eclectic physicians in late 1800s',
        commercial_impact: 'One of the top-selling herbs in North America and Europe',
        research_interest: 'Extensively studied for immunomodulating properties'
      }
    }
    sustainability: {
      conservation_status: {
        wild_populations: 'Some species threatened by overharvesting',
        cultivation: 'Widely cultivated, reducing pressure on wild populations'
      }
      ethical_harvesting: {
        wild_crafting: 'Harvest no more than 1 / (3 || 1) of a stand, leave roots from some plants',
        regenerative_practices: 'Plant seeds when harvesting wild populations'
      }
      growing_guides: {
        cultivation: 'Well-drained soil, full sun, drought tolerant once established',
        propagation: 'Seed stratification helpful, division for established plants',
        companion_planting: 'Grows well with yarrow, butterfly weed, and native grasses'
      }
    }
    affinity: {
      enhanced_by: ['elderberry', 'goldenseal', 'baptisia', 'wild indigo', 'boneset'],
      complements: ['yarrow', 'ginger', 'peppermint', 'elderflower', 'licorice'],
      synergistic_actions: {
        immune_enhancement: 'Combines well with elderberry and andrographis',
        lymphatic_support: 'Enhanced by calendula and cleavers',
        respiratory_relief: 'Works well with thyme and elecampane'
      }
    }
  }

  elderberry: {
    name: 'Elderberry',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.3, Fire: 0.1 }
    qualities: ['antiviral', 'immune-supporting', 'cooling'],
    category: 'medicinal_herb',
    parts_used: ['berries', 'flowers'],
    preparations: {
      syrup: {
        name: 'Syrup',
        ingredients: {
          berries: '1 part',
          water: '2 parts',
          honey: '1 part'
        }
        method: 'decoct berries, add honey',
        dosage: '1-2 tsp daily',
        storage: 'refrigerate'
      }
    }
    properties: {
      antiviral: 'especially against flu viruses',
      immune_support: 'increases cytokine production',
      antioxidant: 'high in flavonoids'
    }
  }

  chamomile: {
    name: 'Chamomile',
    elementalProperties: { Air: 0.4, Water: 0.4, Earth: 0.2, Fire: 0.1 }
    qualities: ['calming', 'soothing', 'cooling'],
    category: 'medicinal_herb',
    parts_used: ['flowers'],
    preparations: {
      tea: {
        name: 'Tea',
        ratio: '1-2 tsp per cup',
        steep_time: '5-10 minutes',
        dosage: '2-3 cups daily'
      }
      compress: {
        name: 'Compress',
        method: 'strong tea applied topically',
        uses: ['eye strain', 'skin irritation']
      }
    }
    properties: {
      nervine: 'calms nervous system',
      anti_inflammatory: 'soothes digestive tract',
      sleep_aid: 'promotes restful sleep'
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
export const medicinalHerbs: Record<string, IngredientMapping> =
  fixIngredientMappings(rawMedicinalHerbs)

// Create a collection of all medicinal herbs
export const _allMedicinalHerbs = Object.values(medicinalHerbs)

export default medicinalHerbs,
