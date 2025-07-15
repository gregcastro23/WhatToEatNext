import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/services/AstrologicalService.ts');
const dryRun = process.argv.includes('--dry-run');

function fixAstrologicalService() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing AstrologicalService typing issues...`);

  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix issue with AstrologicalService class declaration (missing export in some cases)
  const fixedContent = content.replace(
    /class AstrologicalService {/g,
    'export class AstrologicalService {'
  );

  // Fix the PlanetPosition interface to align with CelestialPosition type
  const planetPositionInterfaceRegex = /export interface PlanetPosition \{[^}]*\}/;
  const hasPlanetPositionInterface = planetPositionInterfaceRegex.test(content);
  
  if (hasPlanetPositionInterface) {
    console.log('Found PlanetPosition interface, ensuring it matches CelestialPosition type');
    
    // Update the interface to match CelestialPosition by adding missing properties
    const updatedInterface = `export interface PlanetPosition {
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde: boolean;
  exactLongitude?: number;
  speed?: number;
}`;
    
    content = content.replace(planetPositionInterfaceRegex, updatedInterface);
  }
  
  // Ensure proper typing for methods returning PlanetaryAlignment
  const methodsToFix = [
    'processNASAHorizonsResponse',
    'processFreeAstrologyApiResponse',
    'processAstronomyApiResponse',
    'processProkeralaApiResponse',
    'fillMissingPlanets',
    'getPlanetaryPositions',
    'fetchProkeralaPositions',
    'fetchAstronomyApiPositions',
    'calculateDefaultPlanetaryPositions',
    'calculateAccuratePlanetaryPositions'
  ];
  
  let updatedContent = content;
  
  for (const method of methodsToFix) {
    // Match method signature and ensure it has proper return type
    const methodRegex = new RegExp(`(private|public|protected)\\s+static\\s+${method}\\s*\\([^)]*\\)\\s*(:)?\\s*([^{]*)?\\s*\\{`, 'g');
    
    updatedContent = updatedContent.replace(methodRegex, (match, access, hasReturnType, returnType) => {
      // If method already has proper return type, don't change it
      if (hasReturnType && returnType && returnType.trim().includes('PlanetaryAlignment')) {
        return match;
      }
      
      // Add or fix the return type
      return `${access} static ${method}(...): PlanetaryAlignment {`;
    });
  }
  
  // Fix the longitudeToZodiacPosition method to ensure it returns CelestialPosition
  updatedContent = updatedContent.replace(
    /(private|public|protected)\s+static\s+longitudeToZodiacPosition\s*\([^)]*\)\s*(:)?([^{]*)?{/g,
    '$1 static longitudeToZodiacPosition(longitude: number): CelestialPosition {'
  );
  
  // Ensure AstrologicalState interface aligns with CentralizedAstrologicalState
  const astrologicalStateRegex = /export interface AstrologicalState \{[^}]*\}/s;
  
  if (astrologicalStateRegex.test(updatedContent)) {
    console.log('Found AstrologicalState interface, ensuring it aligns with centralized types');
    
    // Use a mapping approach to avoid type conflicts
    const mapperCode = `
  /**
   * Maps internal AstrologicalState to centralized type
   */
  private static mapToCentralizedState(state: AstrologicalState): CentralizedAstrologicalState {
    return {
      currentZodiac: state.currentZodiac,
      moonPhase: state.moonPhase,
      currentPlanetaryAlignment: state.currentPlanetaryAlignment,
      activePlanets: state.activePlanets,
      sunSign: state.sunSign,
      moonSign: state.moonSign,
      lunarPhase: state.lunarPhase,
      timeOfDay: state.timeOfDay,
      isDaytime: state.isDaytime,
      planetaryHour: state.planetaryHour,
      activeAspects: state.activeAspects,
      dominantElement: state.dominantElement,
      planetaryPositions: state.planetaryPositions
    };
  }`;
    
    // Add mapper function to the class if it doesn't exist
    if (!updatedContent.includes('mapToCentralizedState')) {
      // Find a good place to insert - after the last private method
      const lastPrivateMethodIndex = updatedContent.lastIndexOf('private static');
      if (lastPrivateMethodIndex !== -1) {
        const insertPoint = updatedContent.indexOf('}', lastPrivateMethodIndex);
        if (insertPoint !== -1) {
          updatedContent = updatedContent.slice(0, insertPoint) + 
                         mapperCode + 
                         updatedContent.slice(insertPoint);
        }
      }
    }
  }
  
  // Write changes to file if not a dry run
  if (!dryRun) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Fixed AstrologicalService typing issues');
  } else {
    console.log('[DRY RUN] Would fix AstrologicalService typing issues');
  }
}

// Run the fix function
try {
  fixAstrologicalService();
} catch (error) {
  console.error('Error fixing AstrologicalService:', error);
  process.exit(1);
} 