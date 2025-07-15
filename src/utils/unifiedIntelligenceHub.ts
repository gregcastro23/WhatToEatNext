/**
 * 🧠 UNIFIED INTELLIGENCE HUB
 * 
 * Central consolidation point for all intelligence systems in the WhatToEatNext project.
 * This file brings together all the sophisticated intelligence systems we've created
 * across the codebase for easy access and unified management.
 * 
 * Created: 2025-01-05
 * Version: 1.0.0
 */

// Import all intelligence systems
import { ELEMENTAL_INTELLIGENCE_SUITE, ELEMENTAL_SYSTEMS } from '../constants/elements';
import { CONSTANTS_INTELLIGENCE_SUITE, UTILS_CONSTANTS_SYSTEMS } from './constants';
import { ELEMENTAL_MAPPINGS_SUITE, ELEMENTAL_MAPPING_SYSTEMS } from './elementalMappings';
import { TAROT_MAPPINGS_SUITE, TAROT_MAPPING_SYSTEMS } from './tarotMappings';
import { PATH_INTELLIGENCE_SUITE, PATH_RESOLUTION_SYSTEMS } from '../paths';
import { CUISINE_INTELLIGENCE_SUITE, CUISINE_CONFIG_SYSTEMS } from '../config/cuisines';
import { CONFIG_INTELLIGENCE_SUITE, CONFIG_DEMO_SYSTEMS } from '../config/defaults';
import { ALCHEMICAL_ENERGY_SUITE, ALCHEMICAL_ENERGY_SYSTEMS } from '../constants/alchemicalEnergyMapping';
import { KALCHM_INTELLIGENCE_SUITE, KALCHM_SYSTEMS, UNIFIED_ALCHEMICAL_INTELLIGENCE } from '../data/unified/alchemicalCalculations';
import { MIDDLEWARE_INTELLIGENCE_SUITE, MIDDLEWARE_SYSTEMS, UNIFIED_MIDDLEWARE_INTELLIGENCE } from '../middleware';

/**
 * 🎯 MASTER INTELLIGENCE SUITE
 * All intelligence systems organized by category for easy access
 */
export const MASTER_INTELLIGENCE_SUITE = {
  // Core Systems
  elemental: ELEMENTAL_INTELLIGENCE_SUITE,
  alchemical: KALCHM_INTELLIGENCE_SUITE,
  middleware: MIDDLEWARE_INTELLIGENCE_SUITE,
  
  // Utility Systems
  constants: CONSTANTS_INTELLIGENCE_SUITE,
  paths: PATH_INTELLIGENCE_SUITE,
  
  // Mapping Systems
  elementalMappings: ELEMENTAL_MAPPINGS_SUITE,
  tarotMappings: TAROT_MAPPINGS_SUITE,
  
  // Configuration Systems
  cuisine: CUISINE_INTELLIGENCE_SUITE,
  config: CONFIG_INTELLIGENCE_SUITE,
  
  // Energy Systems
  alchemicalEnergy: ALCHEMICAL_ENERGY_SUITE
};

/**
 * 🔧 MASTER SYSTEMS COLLECTION
 * All intelligence systems organized for direct access
 */
export const MASTER_SYSTEMS = {
  // Core Systems
  ELEMENTAL: ELEMENTAL_SYSTEMS,
  ALCHEMICAL: KALCHM_SYSTEMS,
  MIDDLEWARE: MIDDLEWARE_SYSTEMS,
  
  // Utility Systems
  CONSTANTS: UTILS_CONSTANTS_SYSTEMS,
  PATHS: PATH_RESOLUTION_SYSTEMS,
  
  // Mapping Systems
  ELEMENTAL_MAPPINGS: ELEMENTAL_MAPPING_SYSTEMS,
  TAROT_MAPPINGS: TAROT_MAPPING_SYSTEMS,
  
  // Configuration Systems
  CUISINE: CUISINE_CONFIG_SYSTEMS,
  CONFIG: CONFIG_DEMO_SYSTEMS,
  
  // Energy Systems
  ALCHEMICAL_ENERGY: ALCHEMICAL_ENERGY_SYSTEMS
};

/**
 * 🌟 UNIFIED INTELLIGENCE ORCHESTRATOR
 * Master control system for all intelligence operations
 */
export const UNIFIED_INTELLIGENCE_ORCHESTRATOR = {
  // Core Intelligence Groups
  coreIntelligence: {
    alchemical: UNIFIED_ALCHEMICAL_INTELLIGENCE,
    middleware: UNIFIED_MIDDLEWARE_INTELLIGENCE
  },
  
  // Convenience Access
  suites: MASTER_INTELLIGENCE_SUITE,
  systems: MASTER_SYSTEMS,
  
  // Orchestration Methods
  getAllSystems: () => Object.values(MASTER_SYSTEMS),
  getAllSuites: () => Object.values(MASTER_INTELLIGENCE_SUITE),
  
  // System Health Check
  healthCheck: () => ({
    totalSystems: Object.keys(MASTER_SYSTEMS).length,
    totalSuites: Object.keys(MASTER_INTELLIGENCE_SUITE).length,
    status: 'operational',
    timestamp: new Date().toISOString()
  }),
  
  // System Discovery
  discoverSystems: (category?: string) => {
    if (category) {
      return MASTER_SYSTEMS[category as keyof typeof MASTER_SYSTEMS] || null;
    }
    return MASTER_SYSTEMS;
  }
};

/**
 * 🚀 QUICK ACCESS EXPORTS
 * Convenient shortcuts for commonly used intelligence systems
 */
export const QUICK_ACCESS = {
  // Most commonly used systems
  elemental: ELEMENTAL_INTELLIGENCE_SUITE,
  alchemical: KALCHM_INTELLIGENCE_SUITE,
  middleware: MIDDLEWARE_INTELLIGENCE_SUITE,
  
  // Utility shortcuts
  constants: CONSTANTS_INTELLIGENCE_SUITE,
  paths: PATH_INTELLIGENCE_SUITE,
  
  // All systems at once
  all: MASTER_INTELLIGENCE_SUITE
};

// Export everything for maximum compatibility
export {
  ELEMENTAL_INTELLIGENCE_SUITE,
  ELEMENTAL_SYSTEMS,
  CONSTANTS_INTELLIGENCE_SUITE,
  UTILS_CONSTANTS_SYSTEMS,
  ELEMENTAL_MAPPINGS_SUITE,
  ELEMENTAL_MAPPING_SYSTEMS,
  TAROT_MAPPINGS_SUITE,
  TAROT_MAPPING_SYSTEMS,
  PATH_INTELLIGENCE_SUITE,
  PATH_RESOLUTION_SYSTEMS,
  CUISINE_INTELLIGENCE_SUITE,
  CUISINE_CONFIG_SYSTEMS,
  CONFIG_INTELLIGENCE_SUITE,
  CONFIG_DEMO_SYSTEMS,
  ALCHEMICAL_ENERGY_SUITE,
  ALCHEMICAL_ENERGY_SYSTEMS,
  KALCHM_INTELLIGENCE_SUITE,
  KALCHM_SYSTEMS,
  UNIFIED_ALCHEMICAL_INTELLIGENCE,
  MIDDLEWARE_INTELLIGENCE_SUITE,
  MIDDLEWARE_SYSTEMS,
  UNIFIED_MIDDLEWARE_INTELLIGENCE
}; 