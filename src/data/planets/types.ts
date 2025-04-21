export interface PlanetData {
  'Dignity Effect': Record<string, number>;
  'Elements': string[];
  'Alchemy': {
    'Spirit': number;
    'Essence': number;
    'Matter': number;
    'Substance': number;
  };
  'Diurnal Element': string;
  'Nocturnal Element': string;
  'AstronomicalData'?: {
    'DistanceFromsun'?: string;
    'DistanceFromEarth'?: {
      'Minimum'?: string;
      'Maximum'?: string;
    };
    'Diameter'?: string;
    'SurfaceTemperature'?: string;
    'AtmosphericComposition'?: string;
    'RotationPeriod'?: string;
    'OrbitPeriod'?: string;
    'Axial Tilt'?: string;
    'PhaseCycle'?: string;
    'sunlightTravelTime'?: string;
    'ZodiacalRestriction'?: string;
    'PhysicalCharacteristics'?: {
      'Surface'?: string;
      'MagneticField'?: string;
      'Composition'?: string;
      'NotableFeatures'?: string;
    };
  };
  'AstrologicalProperties'?: {
    'AlchemicalName'?: string;
    'BeneficType'?: string;
    'DualDomicile'?: {
      'Spring'?: string;
      'Autumn'?: string;
    };
    'HouseJoy'?: number;
    'CyclePeriod'?: {
      'Return'?: string;
      'Retrograde'?: string;
    };
    'MorningEveningStar'?: {
      'MorningStar'?: string;
      'EveningStar'?: string;
    };
    'CoRules'?: string[];
    'Exaltation'?: string;
    'Fall'?: string;
    'Detriment'?: string[];
    'Keywords'?: string[];
    'Colors'?: string[];
    'Day'?: string;
    'Metal'?: string;
    'BodyParts'?: string[];
    'Animals'?: string[];
    'Stones'?: string[];
  };
  'ElementalConnections'?: {
    'DayEmission'?: string;
    'NightEmission'?: string;
    'ElementalBridges'?: string[];
    'SharedElements'?: Record<string, string[]>;
    'AssociatedQualities'?: string[];
  };
  'HerbalAssociations'?: {
    'Herbs'?: string[];
    'Flowers'?: string[];
    'Woods'?: string[];
    'Scents'?: string[];
  };
  'RetrogradeEffect'?: {
    'Spirit': number;
    'Essence': number;
    'Matter': number;
    'Substance': number;
  };
  'FoodAssociations'?: string[];
  'FlavorProfiles'?: {
    'Sweet': number;
    'Sour': number;
    'Salty': number;
    'Bitter': number;
    'Umami': number;
    'Spicy': number;
  };
  'CulinaryInfluences'?: string[];
  'AspectsEffect'?: Record<string, {
    'Conjunction': number;
    'Opposition': number;
    'Trine': number;
    'Square': number;
    'Sextile': number;
  }>;
  'PlanetSpecific'?: Record<string, unknown>;
}

// Type for Moon-specific data
export interface MoonSpecificData {
  'Phases': Record<string, {
    'Spirit': number;
    'Essence': number;
    'Matter': number;
    'Substance': number;
    'CulinaryEffect': string;
  }>;
  'Nodes': {
    'North': {
      'Element': string;
      'CulinaryEffect': string;
    };
    'South': {
      'Element': string;
      'CulinaryEffect': string;
    };
  };
}

// Type for sun-specific data
export interface sunSpecificData {
  'SolarCycles': {
    'Solstice': {
      'Summer': {
        'Element': string;
        'CulinaryEffect': string;
      };
      'Winter': {
        'Element': string;
        'CulinaryEffect': string;
      };
    };
    'Equinox': {
      'Spring': {
        'Element': string;
        'CulinaryEffect': string;
      };
      'Fall': {
        'Element': string;
        'CulinaryEffect': string;
      };
    };
  };
  'Eclipse': {
    'Solar': {
      'ElementalShift': string;
      'CulinaryEffect': string;
    };
  };
}

// Type for mercury-specific data
export interface mercurySpecificData {
  'RetrogradeIntensity': number;
  'CommunicationEffects': {
    'Direct': string;
    'Retrograde': string;
  };
  'FlavorModulation': {
    'Direct': Record<string, number>;
    'Retrograde': Record<string, number>;
  };
  'CulinaryTemperament'?: {
    'Airmercury'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'Earthmercury'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
  };
  'ZodiacTransit'?: Record<string, {
    'FoodFocus'?: string;
    'Elements'?: Record<string, number>;
    'Ingredients'?: string[];
  }>;
}

// Type for venus-specific data
export interface venusSpecificData {
  'ZodiacTransit'?: Record<string, {
    'FoodFocus'?: string;
    'Elements'?: Record<string, number>;
    'Ingredients'?: string[];
  }>;
  'CulinaryTemperament'?: {
    'Earthvenus'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'Airvenus'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'Watervenus'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'Firevenus'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
  };
  'CulinaryTechniques'?: Record<string, number>;
  'MealTypes'?: Record<string, {
    'Influence': number;
    'Recommendations'?: string[];
    'Flavors'?: Record<string, number>;
  }>;
  'Retrograde'?: {
    'CulinaryEffect'?: string;
    'ElementalShift'?: Record<string, number>;
    'FoodFocus'?: string;
    'Elements'?: Record<string, number>;
  };
  'LunarConnection'?: Record<string, {
    'CulinaryFocus'?: string;
    'Influence'?: number;
  }>;
}

// Type for Mars-specific data
export interface MarsSpecificData {
  'ZodiacTransit'?: Record<string, {
    'FoodFocus'?: string;
    'Elements'?: Record<string, number>;
    'Ingredients'?: string[];
  }>;
  'CulinaryTemperament'?: {
    'FireMars'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'WaterMars'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
  };
  'CulinaryTechniques'?: Record<string, number>;
  'Retrograde'?: {
    'CulinaryEffect': string;
    'Elements'?: Record<string, number>;
    'FoodFocus'?: string;
  };
}

// Type for Jupiter-specific data
export interface JupiterSpecificData {
  'ZodiacTransit'?: Record<string, {
    'FoodFocus'?: string;
    'Elements'?: Record<string, number>;
    'Ingredients'?: string[];
  }>;
  'CulinaryTemperament'?: {
    'FireJupiter'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'AirJupiter'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
  };
  'Retrograde'?: {
    'CulinaryEffect': string;
    'Elements'?: Record<string, number>;
    'FoodFocus'?: string;
  };
}

// Type for Saturn-specific data
export interface SaturnSpecificData {
  'ZodiacTransit'?: Record<string, {
    'FoodFocus'?: string;
    'Elements'?: Record<string, number>;
    'Ingredients'?: string[];
  }>;
  'CulinaryTemperament'?: {
    'EarthSaturn'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
    'AirSaturn'?: {
      'FoodFocus': string;
      'Elements'?: Record<string, number>;
      'Recommendations'?: string[];
    };
  };
  'Retrograde'?: {
    'CulinaryEffect': string;
    'Elements'?: Record<string, number>;
    'FoodFocus'?: string;
  };
}

// Additional planet-specific interfaces can be added as needed 