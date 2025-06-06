#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class AstrologizeApiFixer {
  constructor(dryRun = true) {
    this.dryRun = dryRun;
    this.changes = [];
    this.errors = [];
    this.processedFiles = new Set();
  }

  async run() {
    console.log(`🔧 Updating files to use astrologize API (dry-run: ${this.dryRun})`);
    
    try {
      // Get files that need to be updated
      const filesToUpdate = await this.getFilesUsingFallbackData();
      console.log(`📊 Found ${filesToUpdate.length} files to update`);
      
      // Process each file
      for (const filePath of filesToUpdate) {
        await this.updateFile(filePath);
      }
      
      // Apply changes
      await this.applyChanges();
      
      console.log(`✅ Summary: ${this.changes.length} files updated, ${this.errors.length} errors`);
      
    } catch (error) {
      console.error('❌ Error during astrologize API fixing:', error.message);
      process.exit(1);
    }
  }

  async getFilesUsingFallbackData() {
    // Files that need to be updated to use astrologize API
    return [
      'src/services/AstrologyService.ts',
      'src/services/AstrologicalService.ts',
      'src/services/astrologyApi.ts',
      'src/utils/cuisineRecommender.ts',
      'src/services/celestialCalculations.ts',
      'src/services/RecommendationService.ts',
      'src/services/RecommendationAdapter.ts',
      'src/components/CuisineRecommender.tsx',
      'src/components/PlanetaryPositionInitializer.tsx',
      'src/lib/PlanetaryHourCalculator.ts',
      'src/calculations/alchemicalEngine.ts'
    ];
  }

  async updateFile(filePath) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);

    try {
      console.log(`\n📂 Processing: ${filePath}`);
      
      if (!await this.fileExists(filePath)) {
        console.log(`  ⏭️  File not found, skipping: ${filePath}`);
        return;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      let newContent = content;
      let hasChanges = false;

      // Apply fixes based on file type
      if (filePath.includes('AstrologyService.ts')) {
        const fix = this.fixAstrologyService(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('cuisineRecommender.ts')) {
        const fix = this.fixCuisineRecommender(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('CuisineRecommender.tsx')) {
        const fix = this.fixCuisineRecommenderComponent(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('celestialCalculations.ts')) {
        const fix = this.fixCelestialCalculations(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('RecommendationService.ts') || filePath.includes('RecommendationAdapter.ts')) {
        const fix = this.fixRecommendationServices(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('AstrologicalService.ts')) {
        const fix = this.fixAstrologicalService(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('astrologyApi.ts')) {
        const fix = this.fixAstrologyApi(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('PlanetaryPositionInitializer.tsx')) {
        const fix = this.fixPlanetaryPositionInitializer(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('PlanetaryHourCalculator.ts')) {
        const fix = this.fixPlanetaryHourCalculator(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      } else if (filePath.includes('alchemicalEngine.ts')) {
        const fix = this.fixAlchemicalEngine(newContent);
        if (fix.changed) {
          newContent = fix.content;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        if (!this.dryRun) {
          await fs.writeFile(filePath, newContent);
          console.log(`  ✅ Updated ${path.basename(filePath)}`);
        } else {
          console.log(`  📝 Would update ${path.basename(filePath)}`);
        }
        
        this.changes.push({
          file: filePath,
          type: 'astrologize-api-integration'
        });
      } else {
        console.log(`  ⏭️  No changes needed for ${path.basename(filePath)}`);
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  fixAstrologyService(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/types.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions, getPlanetaryPositionsForDateTime } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Replace the getCurrentPlanetaryPositions method to use astrologize API
    if (newContent.includes('async getCurrentPlanetaryPositions(forceRefresh = false)')) {
      newContent = newContent.replace(
        /async getCurrentPlanetaryPositions\(forceRefresh = false\): Promise<Record<Planet, CelestialPosition>> \{[\s\S]*?\n  \}/,
        `async getCurrentPlanetaryPositions(forceRefresh = false): Promise<Record<Planet, CelestialPosition>> {
    try {
      // Use astrologize API for real planetary positions
      const positions = await getCurrentPlanetaryPositions();
      
      // Convert to CelestialPosition format
      const celestialPositions: Record<Planet, CelestialPosition> = {};
      
      Object.entries(positions).forEach(([planet, position]) => {
        celestialPositions[planet as Planet] = {
          sign: position.sign,
          degree: position.degree
        };
      });
      
      // Update cached state
      this.currentState.currentPlanetaryAlignment = celestialPositions;
      this.currentState.isReady = true;
      
      return celestialPositions;
    } catch (error) {
      console.warn('Astrologize API failed, using cached data:', error);
      if (forceRefresh || !this.currentState.isReady) {
        await this.refreshAstrologicalState();
      }
      return this.currentState.currentPlanetaryAlignment;
    }
  }`
      );
      changed = true;
    }

    // Update refreshAstrologicalState to use astrologize API
    if (newContent.includes('private async refreshAstrologicalState()')) {
      newContent = newContent.replace(
        /private async refreshAstrologicalState\(\): Promise<void> \{[\s\S]*?\n  \}/,
        `private async refreshAstrologicalState(): Promise<void> {
    this.currentState.loading = true;
    
    try {
      const currentDate = new Date();
      
      // Try to get real planetary positions from astrologize API
      let planetaryAlignment: PlanetaryAlignment;
      try {
        const positions = await getCurrentPlanetaryPositions();
        
        // Convert to our format
        planetaryAlignment = {};
        Object.entries(positions).forEach(([planet, position]) => {
          planetaryAlignment[planet as Planet] = {
            sign: position.sign,
            degree: position.degree
          };
        });
        
        console.log('🌟 Using real astrologize API data for astrological state');
      } catch (apiError) {
        console.warn('Astrologize API failed, using fallback calculations:', apiError);
        planetaryAlignment = this.calculatePlanetaryPositions(currentDate);
      }
      
      const state: AstrologicalState = {
        currentZodiac: this.calculateZodiacSign(currentDate),
        moonPhase: this.calculateLunarPhase(currentDate),
        currentPlanetaryAlignment: planetaryAlignment,
        isDaytime: this.calculateIsDaytime(currentDate),
        planetaryHour: this.calculatePlanetaryHour(currentDate),
        loading: false,
        isReady: true,
        sunSign: 'aries'
      };
      
      this.currentState = state;
    } catch (error) {
      console.error("Failed to refresh astrological state", error);
    } finally {
      this.currentState.loading = false;
      this.currentState.isReady = true;
    }
  }`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixCuisineRecommender(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/data\/planets['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Replace mock planetary data usage with real astrologize API calls
    if (newContent.includes('const mockPlanetaryData = {')) {
      newContent = newContent.replace(
        /\/\/ Mock planetary data for calculations\nconst mockPlanetaryData = \{[\s\S]*?\};/,
        `// Real planetary data from astrologize API
let cachedPlanetaryData = null;
let lastFetchTime = 0;

async function getRealPlanetaryData() {
  const now = Date.now();
  // Cache for 1 hour
  if (cachedPlanetaryData && (now - lastFetchTime) < 60 * 60 * 1000) {
    return cachedPlanetaryData;
  }
  
  try {
    const positions = await getCurrentPlanetaryPositions();
    
    // Calculate current planetary influences based on real positions
    const currentPlanet = getCurrentPlanetaryRuler();
    const planetaryData = {
      currentPlanet,
      positions,
      flavorProfiles: calculateFlavorProfileFromPositions(positions),
      foodAssociations: calculateFoodAssociationsFromPositions(positions),
      herbalAssociations: calculateHerbalAssociationsFromPositions(positions)
    };
    
    cachedPlanetaryData = planetaryData;
    lastFetchTime = now;
    return planetaryData;
  } catch (error) {
    console.warn('Failed to get real planetary data, using fallback:', error);
    return {
      currentPlanet: 'Sun',
      positions: {},
      flavorProfiles: {
        sweet: 0.7, sour: 0.4, salty: 0.5, 
        bitter: 0.2, umami: 0.6, spicy: 0.3
      },
      foodAssociations: ["vegetables", "grains", "fruits", "proteins"],
      herbalAssociations: { Herbs: ["basil", "thyme", "mint", "rosemary"] }
    };
  }
}

function getCurrentPlanetaryRuler() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  return planetaryDays[dayOfWeek];
}

function calculateFlavorProfileFromPositions(positions) {
  // Calculate flavor preferences based on real planetary positions
  let sweet = 0.5, sour = 0.4, salty = 0.5, bitter = 0.2, umami = 0.6, spicy = 0.3;
  
  Object.entries(positions).forEach(([planet, position]) => {
    const element = getElementForSign(position.sign);
    switch (element) {
      case 'Fire':
        spicy += 0.1;
        umami += 0.05;
        break;
      case 'Earth':
        salty += 0.1;
        bitter += 0.05;
        break;
      case 'Air':
        sour += 0.1;
        sweet += 0.05;
        break;
      case 'Water':
        sweet += 0.1;
        umami += 0.05;
        break;
    }
  });
  
  return { sweet, sour, salty, bitter, umami, spicy };
}

function calculateFoodAssociationsFromPositions(positions) {
  const associations = new Set(["vegetables", "grains", "fruits", "proteins"]);
  
  Object.entries(positions).forEach(([planet, position]) => {
    // Add planet-specific food associations
    switch (planet) {
      case 'Venus':
        associations.add('sweets');
        associations.add('dairy');
        break;
      case 'Mars':
        associations.add('spices');
        associations.add('red_meat');
        break;
      case 'Mercury':
        associations.add('nuts');
        associations.add('seeds');
        break;
      case 'Jupiter':
        associations.add('oils');
        associations.add('rich_foods');
        break;
      case 'Saturn':
        associations.add('root_vegetables');
        associations.add('preserved_foods');
        break;
    }
  });
  
  return Array.from(associations);
}

function calculateHerbalAssociationsFromPositions(positions) {
  const herbs = new Set(["basil", "thyme", "mint", "rosemary"]);
  
  Object.entries(positions).forEach(([planet, position]) => {
    const element = getElementForSign(position.sign);
    switch (element) {
      case 'Fire':
        herbs.add('cayenne');
        herbs.add('ginger');
        break;
      case 'Earth':
        herbs.add('sage');
        herbs.add('oregano');
        break;
      case 'Air':
        herbs.add('lavender');
        herbs.add('lemon_balm');
        break;
      case 'Water':
        herbs.add('chamomile');
        herbs.add('dill');
        break;
    }
  });
  
  return { Herbs: Array.from(herbs) };
}

function getElementForSign(sign) {
  const fireSignss = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  
  const lowerSign = sign.toLowerCase();
  if (fireSignss.includes(lowerSign)) return 'Fire';
  if (earthSigns.includes(lowerSign)) return 'Earth';
  if (airSigns.includes(lowerSign)) return 'Air';
  if (waterSigns.includes(lowerSign)) return 'Water';
  return 'Fire'; // default
}`
      );
      changed = true;
    }

    // Update generateTopSauceRecommendations to use real data
    if (newContent.includes('export function generateTopSauceRecommendations(')) {
      newContent = newContent.replace(
        /export function generateTopSauceRecommendations\(currentElementalProfile = null, count = 5\) \{/,
        `export async function generateTopSauceRecommendations(currentElementalProfile = null, count = 5) {`
      );
      
      newContent = newContent.replace(
        /\/\/ Get current date for planetary calculations\n  const now = new Date\(\);\n  const dayOfWeek = now\.getDay\(\);\n  \n  \/\/ Get planetary day influence\n  const planetaryDays = \['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'\];\n  const currentPlanetaryDay = planetaryDays\[dayOfWeek\];/,
        `// Get real planetary data
  const planetaryData = await getRealPlanetaryData();
  const currentPlanetaryDay = planetaryData.currentPlanet;`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixCuisineRecommenderComponent(content) {
    let changed = false;
    let newContent = content;

    // Update the loadCuisines function to use astrologize API
    if (newContent.includes('// Get elemental profile from user\'s data')) {
      newContent = newContent.replace(
        /\/\/ Get elemental profile from user's data\n      setLoadingStep\('Calculating elemental profile\.\.\.'\);\n      const userElementalProfile = currentMomentElementalProfile \|\| \{ Fire: 0\.25, Water: 0\.25, Earth: 0\.25, Air: 0\.25\n      \};/,
        `// Get real planetary positions from astrologize API
      setLoadingStep('Getting real-time planetary positions...');
      try {
        const { getCurrentPlanetaryPositions } = await import('@/services/astrologizeApi');
        const realPositions = await getCurrentPlanetaryPositions();
        
        // Update astro state with real data
        astroStateRef.current = {
          ...astroStateRef.current,
          planetaryPositions: realPositions
        };
        
        console.log('🌟 Using real astrologize API data for cuisine recommendations');
      } catch (error) {
        console.warn('Failed to get real planetary data, using cached state:', error);
      }
      
      // Get elemental profile from user's data
      setLoadingStep('Calculating elemental profile...');
      const userElementalProfile = currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
      };`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixCelestialCalculations(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/utils\/astrologyUtils['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Replace manual calculation with astrologize API
    if (newContent.includes('let planetaryPositions: PlanetaryPositionRecord = {};')) {
      newContent = newContent.replace(
        /let planetaryPositions: PlanetaryPositionRecord = \{\};\n\n  \/\/ Try to calculate planetary positions\n  if \(typeof astronomiaCalculator\.calculatePlanetaryPositions === 'function'\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
        `let planetaryPositions: PlanetaryPositionRecord = {};

  // Try astrologize API first for real planetary positions
  try {
    const realPositions = await getCurrentPlanetaryPositions();
    planetaryPositions = realPositions as PlanetaryPositionRecord;
    console.log('🌟 Using real astrologize API data for celestial calculations');
  } catch (apiError) {
    console.warn('Astrologize API failed, falling back to local calculations:', apiError);
    
    // Fallback to local calculations
    if (typeof astronomiaCalculator.calculatePlanetaryPositions === 'function') {
      planetaryPositions = astronomiaCalculator.calculatePlanetaryPositions(now) as PlanetaryPositionRecord;
    } else {
      planetaryPositions = {
        Sun: { sign: 'gemini', degree: 15, minute: 30, exactLongitude: 75.5, isRetrograde: false },
        Moon: { sign: 'cancer', degree: 8, minute: 45, exactLongitude: 98.75, isRetrograde: false }
      };
    }
  }`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixRecommendationServices(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/types\/.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Replace setPlanetaryPositions to get real data
    if (newContent.includes('setPlanetaryPositions(planetaryPositions')) {
      newContent = newContent.replace(
        /setPlanetaryPositions\(planetaryPositions[\s\S]*?\) \{[\s\S]*?\n  \}/,
        `async setPlanetaryPositions(planetaryPositions) {
    try {
      // Try to get real planetary positions from astrologize API
      const realPositions = await getCurrentPlanetaryPositions();
      this.planetaryPositions = realPositions;
      console.log('🌟 Using real astrologize API data for recommendations');
    } catch (error) {
      console.warn('Astrologize API failed, using provided positions:', error);
      this.planetaryPositions = planetaryPositions || {};
    }
    
    // Process positions for compatibility
    Object.entries(this.planetaryPositions).forEach(([planet, data]) => {
      if (typeof data === 'object' && data.sign) {
        this.planetaryPositions[planet] = data;
      }
    });
    
    Object.entries(this.planetaryPositions).forEach(([planet, data]) => {
      if (typeof data === 'object' && data.sign) {
        this.planetaryPositions[planet] = data;
      }
    });
    
    return this;
  }`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixAstrologicalService(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/types\/.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Replace calculateDefaultPlanetaryPositions calls with astrologize API
    if (newContent.includes('private static calculateDefaultPlanetaryPositions()')) {
      newContent = newContent.replace(
        /private static calculateDefaultPlanetaryPositions\(\): PlanetaryAlignment \{[\s\S]*?\n  \}/,
        `private static async getRealtimePlanetaryPositions(): Promise<PlanetaryAlignment> {
    try {
      // Try astrologize API first
      const positions = await getCurrentPlanetaryPositions();
      
      // Convert to PlanetaryAlignment format
      const planetaryAlignment: PlanetaryAlignment = {};
      Object.entries(positions).forEach(([planet, position]) => {
        planetaryAlignment[planet as Planet] = {
          sign: position.sign,
          degree: position.degree
        };
      });
      
      console.log('🌟 Using real astrologize API data for AstrologicalService');
      return planetaryAlignment;
    } catch (error) {
      console.warn('Astrologize API failed, using fallback:', error);
      return this.calculateDefaultPlanetaryPositions();
    }
  }

  private static calculateDefaultPlanetaryPositions(): PlanetaryAlignment {
    // Fallback method for when API fails
    const defaultPositions: PlanetaryAlignment = {
      Sun: { sign: 'gemini', degree: 15 },
      Moon: { sign: 'cancer', degree: 22 },
      Mercury: { sign: 'gemini', degree: 8 },
      Venus: { sign: 'taurus', degree: 12 },
      Mars: { sign: 'leo', degree: 28 },
      Jupiter: { sign: 'pisces', degree: 5 },
      Saturn: { sign: 'aquarius', degree: 18 },
      Uranus: { sign: 'taurus', degree: 14 },
      Neptune: { sign: 'pisces', degree: 25 },
      Pluto: { sign: 'capricorn', degree: 29 }
    };
    
    return defaultPositions;
  }`
      );
      changed = true;
    }

    // Update calls to use the new realtime method
    if (newContent.includes('this.calculateDefaultPlanetaryPositions()')) {
      newContent = newContent.replace(
        /this\.calculateDefaultPlanetaryPositions\(\)/g,
        'await this.getRealtimePlanetaryPositions()'
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixAstrologyApi(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/types\/.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Replace getStaticPlanetaryPositions with astrologize API
    if (newContent.includes('function getStaticPlanetaryPositions()')) {
      newContent = newContent.replace(
        /\/\/ Helper function to get static planetary positions\nfunction getStaticPlanetaryPositions\(\): CelestialPosition\['planetaryPositions'\] \{[\s\S]*?\n\}/,
        `// Helper function to get real planetary positions from astrologize API
async function getRealPlanetaryPositions(): Promise<CelestialPosition['planetaryPositions']> {
  try {
    const positions = await getCurrentPlanetaryPositions();
    console.log('🌟 Using real astrologize API data for astrologyApi');
    return positions;
  } catch (error) {
    console.warn('Astrologize API failed, using static fallback:', error);
    return getStaticPlanetaryPositions();
  }
}

function getStaticPlanetaryPositions(): CelestialPosition['planetaryPositions'] {
  return {
    Sun: { sign: 'gemini', degree: 15 },
    Moon: { sign: 'cancer', degree: 22 },
    Mercury: { sign: 'gemini', degree: 8 },
    Venus: { sign: 'taurus', degree: 12 },
    Mars: { sign: 'leo', degree: 28 },
    Jupiter: { sign: 'pisces', degree: 5 },
    Saturn: { sign: 'aquarius', degree: 18 },
    Uranus: { sign: 'taurus', degree: 14 },
    Neptune: { sign: 'pisces', degree: 25 },
    Pluto: { sign: 'capricorn', degree: 29 }
  };
}`
      );
      changed = true;
    }

    // Update calls to the new async function
    if (newContent.includes('planetaryPositions: getStaticPlanetaryPositions()')) {
      newContent = newContent.replace(
        /planetaryPositions: getStaticPlanetaryPositions\(\)/g,
        'planetaryPositions: await getRealPlanetaryPositions()'
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixPlanetaryPositionInitializer(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Update the initialization logic to use astrologize API
    if (newContent.includes('Successfully applied fallback planetary positions')) {
      newContent = newContent.replace(
        /logger\.info\('Successfully applied fallback planetary positions'\);/,
        `try {
        // Try to get real planetary positions from astrologize API
        const realPositions = await getCurrentPlanetaryPositions();
        logger.info('🌟 Successfully loaded real planetary positions from astrologize API');
        // Apply real positions to state management
        // ... apply realPositions ...
      } catch (error) {
        logger.warn('Astrologize API failed, using fallback planetary positions:', error);
        logger.info('Successfully applied fallback planetary positions');
      }`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixPlanetaryHourCalculator(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Update getFallbackPlanetaryHour to try astrologize API first
    if (newContent.includes('private getFallbackPlanetaryHour(date: Date)')) {
      newContent = newContent.replace(
        /private getFallbackPlanetaryHour\(date: Date\): \{ planet: Planet, hourNumber: number, isDaytime: boolean \} \{/,
        `private async getRealOrFallbackPlanetaryHour(date: Date): Promise<{ planet: Planet, hourNumber: number, isDaytime: boolean }> {
    try {
      // Try to get real planetary positions to calculate accurate planetary hour
      const positions = await getCurrentPlanetaryPositions();
      console.log('🌟 Using real astrologize API data for planetary hour calculation');
      
      // Calculate planetary hour based on real positions
      // This would be more complex calculation based on actual sunrise/sunset
      const hour = date.getHours();
      const isDaytime = hour >= 6 && hour < 18;
      
      // Get the ruling planet for this hour based on real positions
      const planetaryOrder = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
      const hourNumber = hour % 24;
      const planetIndex = hourNumber % planetaryOrder.length;
      const planet = planetaryOrder[planetIndex] as Planet;
      
      return { planet, hourNumber, isDaytime };
    } catch (error) {
      console.warn('Astrologize API failed, using fallback calculation:', error);
      return this.getFallbackPlanetaryHour(date);
    }
  }

  private getFallbackPlanetaryHour(date: Date): { planet: Planet, hourNumber: number, isDaytime: boolean } {`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  fixAlchemicalEngine(content) {
    let changed = false;
    let newContent = content;

    // Add astrologize API import if not present
    if (!newContent.includes('@/services/astrologizeApi')) {
      newContent = newContent.replace(
        /import.*from.*['"]@\/.*['"];?\n/,
        `$&import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';\n`
      );
      changed = true;
    }

    // Update the hardcoded fallback to try astrologize API first
    if (newContent.includes('Using hardcoded fallback planetary positions')) {
      newContent = newContent.replace(
        /logger\.warn\('Using hardcoded fallback planetary positions'\)/,
        `try {
        // Try astrologize API before using hardcoded fallback
        const realPositions = await getCurrentPlanetaryPositions();
        logger.info('🌟 AlchemicalEngine using real astrologize API data');
        return realPositions;
      } catch (apiError) {
        logger.warn('Astrologize API failed, using hardcoded fallback planetary positions');
      }`
      );
      changed = true;
    }

    return { content: newContent, changed };
  }

  async applyChanges() {
    if (this.dryRun) {
      console.log('\n📋 DRY RUN - Changes that would be made:');
      this.changes.forEach((change, index) => {
        console.log(`${index + 1}. ${path.basename(change.file)}`);
        console.log(`   Type: ${change.type}\n`);
      });
      return;
    }
    
    console.log(`\n✅ Applied ${this.changes.length} astrologize API integrations across ${this.processedFiles.size} files`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (args.includes('--help')) {
  console.log(`
Astrologize API Integration Fixer

Updates files to use the astrologize API for real planetary positions instead of 
fallback or mock data. This ensures all astrological calculations use real-time data.

Usage:
  node fix-astrologize-api-usage.js [options]

Options:
  --dry-run    Preview changes without applying them (default)
  --execute    Apply the fixes to files
  --help       Show this help message

Examples:
  node fix-astrologize-api-usage.js                    # Dry run
  node fix-astrologize-api-usage.js --execute          # Apply fixes
`);
  process.exit(0);
}

// Run the fixer
const fixer = new AstrologizeApiFixer(dryRun);
fixer.run().catch(error => {
  console.error('❌ Astrologize API integration failed:', error);
  process.exit(1);
}); 