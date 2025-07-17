# 🌟 Astrological Calculation Debugging Guide

This specialized guide focuses on debugging astronomical calculations, planetary position systems, and elemental harmony computations within the WhatToEatNext project.

## 🔍 Diagnostic Overview

### Quick Diagnostic Commands
```bash
# Comprehensive astrological system check
npm run debug:astronomy

# Test planetary position calculations
npm run test:planetary-positions

# Validate elemental compatibility logic
npm run test:elemental-compatibility

# Check transit date accuracy
npm run validate:transit-dates

# Test fallback mechanisms
npm run test:fallbacks
```

### System Health Indicators
```typescript
interface AstrologicalHealth {
  planetaryPositions: 'healthy' | 'degraded' | 'fallback' | 'failed';
  transitValidation: 'accurate' | 'outdated' | 'invalid';
  elementalCalculations: 'consistent' | 'inconsistent' | 'error';
  apiConnectivity: 'connected' | 'throttled' | 'disconnected';
  cacheStatus: 'fresh' | 'stale' | 'empty';
  fallbackData: 'current' | 'outdated' | 'missing';
}
```

## 🪐 Planetary Position Debugging

### Common Planetary Position Issues

#### Issue: "Invalid planetary positions" Error
**Symptoms:**
```
Error: Invalid planetary positions received
Positions: undefined or null
Fallback: not triggered
```

**Debugging Steps:**
```typescript
// Step 1: Test API connectivity
async function debugApiConnectivity() {
  console.log('Testing API connectivity...');
  
  try {
    const response = await fetch('https://api.astronomyapi.com/api/v2/studio/moon-phase', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa('your-app-id:your-app-secret')
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Data Sample:', data);
    } else {
      console.error('API Error:', await response.text());
    }
  } catch (error) {
    console.error('API Connection Failed:', error);
  }
}

// Step 2: Test fallback mechanism
function debugFallbackMechanism() {
  console.log('Testing fallback mechanism...');
  
  const fallbackPositions = getMarch2025Positions();
  console.log('Fallback Positions:', fallbackPositions);
  
  const isValid = validatePlanetaryPositions(fallbackPositions);
  console.log('Fallback Validation:', isValid);
}

// Step 3: Test complete flow
async function debugCompleteFlow() {
  console.log('Testing complete planetary position flow...');
  
  try {
    const positions = await getReliablePlanetaryPositions();
    console.log('Final Positions:', positions);
    console.log('Position Source:', positions.source);
    console.log('Timestamp:', positions.timestamp);
  } catch (error) {
    console.error('Complete Flow Failed:', error);
  }
}
```

#### Issue: Planetary Positions Don't Match Expected Signs
**Symptoms:**
```
Expected: Mars in Cancer (July 2024)
Actual: Mars in Gemini
Transit validation: Failed
```

**Debugging Process:**
```typescript
// Step 1: Check current date and expected position
function debugTransitAccuracy() {
  const currentDate = new Date();
  console.log('Current Date:', currentDate.toISOString());
  
  // Check Mars transit data
  const marsData = require('./src/data/planets/mars.js');
  console.log('Mars Transit Data:', marsData.TransitDates);
  
  // Find current expected sign
  const expectedSign = getCurrentExpectedSign('mars', currentDate);
  console.log('Expected Mars Sign:', expectedSign);
  
  // Get actual calculated position
  getReliablePlanetaryPositions().then(positions => {
    console.log('Actual Mars Position:', positions.mars);
    console.log('Sign Match:', positions.mars.sign === expectedSign);
  });
}

// Step 2: Validate transit date ranges
function validateTransitDateRanges(planet: string) {
  const planetData = require(`./src/data/planets/${planet.toLowerCase()}.js`);
  const transitDates = planetData.TransitDates;
  
  console.log(`Validating ${planet} transit dates...`);
  
  for (const [sign, dates] of Object.entries(transitDates)) {
    const startDate = new Date(dates.Start);
    const endDate = new Date(dates.End);
    
    console.log(`${sign}: ${dates.Start} to ${dates.End}`);
    
    // Check for gaps or overlaps
    if (startDate >= endDate) {
      console.error(`Invalid date range for ${planet} in ${sign}`);
    }
  }
}

// Step 3: Cross-validate with multiple sources
async function crossValidatePositions() {
  console.log('Cross-validating planetary positions...');
  
  const primaryPositions = await getPrimaryApiPositions();
  const secondaryPositions = await getSecondaryApiPositions();
  const fallbackPositions = getMarch2025Positions();
  
  console.log('Primary API:', primaryPositions);
  console.log('Secondary API:', secondaryPositions);
  console.log('Fallback Data:', fallbackPositions);
  
  // Compare positions
  const tolerance = 0.5; // degrees
  for (const planet in primaryPositions) {
    if (secondaryPositions[planet]) {
      const diff = Math.abs(
        primaryPositions[planet].exactLongitude - 
        secondaryPositions[planet].exactLongitude
      );
      
      if (diff > tolerance && diff < (360 - tolerance)) {
        console.warn(`Position discrepancy for ${planet}: ${diff}°`);
      }
    }
  }
}
```

### Retrograde Motion Debugging

#### Issue: Retrograde Status Incorrect
**Symptoms:**
```
Mercury appears direct when should be retrograde
Retrograde calculations affecting recommendations incorrectly
```

**Debugging Steps:**
```typescript
// Step 1: Check retrograde calculation logic
function debugRetrogradeCalculation(planet: string, date: Date) {
  console.log(`Debugging retrograde status for ${planet} on ${date.toISOString()}`);
  
  // Get planetary data
  const planetData = require(`./src/data/planets/${planet.toLowerCase()}.js`);
  const retrogradePhases = planetData.TransitDates?.RetrogradePhases;
  
  if (!retrogradePhases) {
    console.log(`No retrograde data available for ${planet}`);
    return;
  }
  
  console.log('Retrograde Phases:', retrogradePhases);
  
  // Check if date falls within any retrograde phase
  for (const [phase, dates] of Object.entries(retrogradePhases)) {
    const startDate = new Date(dates.Start);
    const endDate = new Date(dates.End);
    
    if (date >= startDate && date <= endDate) {
      console.log(`${planet} is retrograde in phase: ${phase}`);
      console.log(`Phase duration: ${dates.Start} to ${dates.End}`);
      return true;
    }
  }
  
  console.log(`${planet} is direct (not retrograde)`);
  return false;
}

// Step 2: Test retrograde influence calculations
function debugRetrogradeInfluence(planet: string, baseInfluence: number, isRetrograde: boolean) {
  console.log(`Debugging retrograde influence for ${planet}`);
  console.log(`Base Influence: ${baseInfluence}`);
  console.log(`Is Retrograde: ${isRetrograde}`);
  
  const adjustedInfluence = adjustForRetrograde(planet, baseInfluence, isRetrograde);
  console.log(`Adjusted Influence: ${adjustedInfluence}`);
  
  const retrogradeModifiers = {
    mercury: 0.7,  // Reduced communication clarity
    venus: 0.8,    // Reduced harmony influence
    mars: 1.2,     // Increased intensity when retrograde
    jupiter: 0.9,  // Reduced expansion
    saturn: 1.1,   // Increased restriction
    uranus: 1.3,   // Increased unpredictability
    neptune: 0.6,  // Reduced clarity
    pluto: 1.1     // Increased transformation intensity
  };
  
  const expectedModifier = retrogradeModifiers[planet] || 1.0;
  const expectedInfluence = isRetrograde ? baseInfluence * expectedModifier : baseInfluence;
  
  console.log(`Expected Modifier: ${expectedModifier}`);
  console.log(`Expected Influence: ${expectedInfluence}`);
  console.log(`Calculation Correct: ${Math.abs(adjustedInfluence - expectedInfluence) < 0.01}`);
}
```

## 🔥 Elemental Harmony Debugging

### Common Elemental Calculation Issues

#### Issue: Compatibility Scores Below 0.7
**Symptoms:**
```
Fire + Water compatibility: 0.3
Earth + Air compatibility: 0.2
Opposition logic detected in calculations
```

**Debugging and Fix:**
```typescript
// Step 1: Identify problematic calculation
function debugElementalCompatibility(source: ElementalProperties, target: ElementalProperties) {
  console.log('Debugging elemental compatibility...');
  console.log('Source Properties:', source);
  console.log('Target Properties:', target);
  
  const sourceDominant = getDominantElement(source);
  const targetDominant = getDominantElement(target);
  
  console.log('Source Dominant:', sourceDominant);
  console.log('Target Dominant:', targetDominant);
  
  // Check for opposition logic (WRONG)
  const hasOppositionLogic = checkForOppositionLogic();
  if (hasOppositionLogic) {
    console.error('❌ OPPOSITION LOGIC DETECTED - This violates elemental principles!');
    console.error('All elements should have compatibility >= 0.7');
  }
  
  // Correct calculation
  const correctCompatibility = calculateCorrectCompatibility(sourceDominant, targetDominant);
  console.log('Correct Compatibility:', correctCompatibility);
  
  return correctCompatibility;
}

// Step 2: Fix compatibility calculation
function calculateCorrectCompatibility(sourceElement: Element, targetElement: Element): number {
  // Self-reinforcement: same elements have highest compatibility
  if (sourceElement === targetElement) {
    return 0.9; // Minimum 0.9 for same elements
  }
  
  // All different element combinations have good compatibility
  const compatibilityMatrix = {
    fire: { water: 0.7, earth: 0.7, air: 0.8 },
    water: { fire: 0.7, earth: 0.8, air: 0.7 },
    earth: { fire: 0.7, water: 0.8, air: 0.7 },
    air: { fire: 0.8, water: 0.7, earth: 0.7 }
  };
  
  return compatibilityMatrix[sourceElement][targetElement] || 0.7;
}

// Step 3: Validate all compatibility scores
function validateAllCompatibilityScores() {
  const elements: Element[] = ['fire', 'water', 'earth', 'air'];
  const results: Array<{source: Element, target: Element, score: number, valid: boolean}> = [];
  
  for (const source of elements) {
    for (const target of elements) {
      const score = calculateCorrectCompatibility(source, target);
      const valid = score >= 0.7;
      
      results.push({ source, target, score, valid });
      
      if (!valid) {
        console.error(`❌ Invalid compatibility: ${source} + ${target} = ${score}`);
      } else {
        console.log(`✅ Valid compatibility: ${source} + ${target} = ${score}`);
      }
    }
  }
  
  const allValid = results.every(r => r.valid);
  console.log(`All compatibility scores valid: ${allValid}`);
  
  return results;
}
```

#### Issue: Self-Reinforcement Not Working
**Symptoms:**
```
Fire + Fire compatibility: 0.7 (should be 0.9+)
Same element combinations not prioritized
Self-reinforcement principle violated
```

**Debugging and Fix:**
```typescript
// Step 1: Test self-reinforcement logic
function debugSelfReinforcement() {
  console.log('Testing self-reinforcement principle...');
  
  const testCases = [
    { source: 'fire', target: 'fire', expected: 0.9 },
    { source: 'water', target: 'water', expected: 0.9 },
    { source: 'earth', target: 'earth', expected: 0.9 },
    { source: 'air', target: 'air', expected: 0.9 }
  ];
  
  for (const testCase of testCases) {
    const actual = calculateCorrectCompatibility(testCase.source, testCase.target);
    const correct = actual >= testCase.expected;
    
    console.log(`${testCase.source} + ${testCase.source}: ${actual} (expected >= ${testCase.expected}) ${correct ? '✅' : '❌'}`);
    
    if (!correct) {
      console.error(`Self-reinforcement failed for ${testCase.source}`);
    }
  }
}

// Step 2: Implement correct self-reinforcement
function enhanceDominantElement(properties: ElementalProperties): ElementalProperties {
  const dominant = getDominantElement(properties);
  const enhancedProperties = { ...properties };
  
  // Self-reinforcement: boost the dominant element
  enhancedProperties[dominant] = Math.min(1.0, properties[dominant] * 1.1);
  
  console.log(`Enhanced ${dominant} from ${properties[dominant]} to ${enhancedProperties[dominant]}`);
  
  return enhancedProperties;
}

// Step 3: Test ingredient compatibility with self-reinforcement
function testIngredientCompatibility() {
  const fireIngredient = {
    name: 'Chili Pepper',
    elementalProperties: { fire: 0.9, water: 0.1, earth: 0.0, air: 0.0 }
  };
  
  const anotherFireIngredient = {
    name: 'Ginger',
    elementalProperties: { fire: 0.8, water: 0.1, earth: 0.1, air: 0.0 }
  };
  
  const waterIngredient = {
    name: 'Cucumber',
    elementalProperties: { fire: 0.0, water: 0.9, earth: 0.1, air: 0.0 }
  };
  
  console.log('Testing ingredient compatibility...');
  
  // Fire + Fire (should be high)
  const fireFireCompatibility = calculateElementalCompatibility(
    fireIngredient.elementalProperties,
    anotherFireIngredient.elementalProperties
  );
  console.log(`Fire + Fire: ${fireFireCompatibility} (should be >= 0.9)`);
  
  // Fire + Water (should be good but lower)
  const fireWaterCompatibility = calculateElementalCompatibility(
    fireIngredient.elementalProperties,
    waterIngredient.elementalProperties
  );
  console.log(`Fire + Water: ${fireWaterCompatibility} (should be >= 0.7, < 0.9)`);
}
```

## 🌙 Lunar Phase and Timing Debugging

### Lunar Phase Calculation Issues

#### Issue: Incorrect Lunar Phase
**Symptoms:**
```
Expected: Full Moon
Actual: New Moon
Lunar calculations affecting recommendations
```

**Debugging Steps:**
```typescript
// Step 1: Test lunar phase calculation
async function debugLunarPhase(date: Date = new Date()) {
  console.log(`Debugging lunar phase for ${date.toISOString()}`);
  
  try {
    // Test multiple calculation methods
    const sunCalcPhase = SunCalc.getMoonIllumination(date);
    console.log('SunCalc Phase:', sunCalcPhase);
    
    const astronomyEnginePhase = await getAstronomyEngineLunarPhase(date);
    console.log('Astronomy Engine Phase:', astronomyEnginePhase);
    
    // Compare with known lunar calendar
    const expectedPhase = getExpectedLunarPhase(date);
    console.log('Expected Phase:', expectedPhase);
    
    // Validate consistency
    const phasesConsistent = validateLunarPhaseConsistency(
      sunCalcPhase,
      astronomyEnginePhase,
      expectedPhase
    );
    
    console.log('Phases Consistent:', phasesConsistent);
    
  } catch (error) {
    console.error('Lunar phase calculation failed:', error);
  }
}

// Step 2: Test lunar timing for recommendations
function debugLunarTiming() {
  const currentPhase = getCurrentLunarPhase();
  console.log('Current Lunar Phase:', currentPhase);
  
  const recommendations = getLunarBasedRecommendations(currentPhase);
  console.log('Lunar Recommendations:', recommendations);
  
  // Validate recommendations match phase
  const validRecommendations = validateLunarRecommendations(currentPhase, recommendations);
  console.log('Recommendations Valid:', validRecommendations);
}
```

## 🔄 Fallback Mechanism Debugging

### Testing Fallback Systems

#### Issue: Fallback Not Triggering
**Symptoms:**
```
API fails but fallback doesn't activate
System returns undefined instead of fallback data
Timeout not working correctly
```

**Debugging Process:**
```typescript
// Step 1: Test timeout mechanism
async function debugTimeoutMechanism() {
  console.log('Testing API timeout mechanism...');
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 5000);
  });
  
  const apiPromise = fetch('https://slow-api-endpoint.com/data');
  
  try {
    const result = await Promise.race([apiPromise, timeoutPromise]);
    console.log('API Response:', result);
  } catch (error) {
    console.log('Timeout triggered correctly:', error.message);
    
    // Test fallback activation
    const fallbackData = getMarch2025Positions();
    console.log('Fallback Data:', fallbackData);
  }
}

// Step 2: Test complete fallback chain
async function debugFallbackChain() {
  console.log('Testing complete fallback chain...');
  
  const fallbackChain = ['api', 'cache', 'local'];
  
  for (const source of fallbackChain) {
    try {
      console.log(`Trying source: ${source}`);
      
      let data;
      switch (source) {
        case 'api':
          data = await getPrimaryApiData();
          break;
        case 'cache':
          data = await getCachedData();
          break;
        case 'local':
          data = getLocalFallbackData();
          break;
      }
      
      if (data && validatePlanetaryPositions(data)) {
        console.log(`✅ Success with ${source}:`, data);
        return data;
      } else {
        console.log(`❌ Failed with ${source}`);
      }
    } catch (error) {
      console.log(`❌ Error with ${source}:`, error.message);
    }
  }
  
  console.error('All fallback sources failed');
}

// Step 3: Test fallback data validity
function debugFallbackDataValidity() {
  console.log('Testing fallback data validity...');
  
  const fallbackData = getMarch2025Positions();
  
  // Check data structure
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  for (const planet of requiredPlanets) {
    if (!fallbackData[planet]) {
      console.error(`❌ Missing ${planet} in fallback data`);
    } else {
      const planetData = fallbackData[planet];
      
      // Validate planet data structure
      if (!planetData.sign || typeof planetData.degree !== 'number') {
        console.error(`❌ Invalid ${planet} data structure:`, planetData);
      } else {
        console.log(`✅ Valid ${planet} data:`, planetData);
      }
    }
  }
  
  // Test data age
  const fallbackDate = new Date('2025-03-28');
  const currentDate = new Date();
  const ageInDays = (currentDate.getTime() - fallbackDate.getTime()) / (1000 * 60 * 60 * 24);
  
  console.log(`Fallback data age: ${ageInDays.toFixed(1)} days`);
  
  if (ageInDays > 30) {
    console.warn('⚠️ Fallback data is over 30 days old - consider updating');
  }
}
```

## 🧪 Testing and Validation Tools

### Automated Testing Suite
```bash
# Run comprehensive astrological tests
npm run test:astrological

# Test specific components
npm run test:planetary-positions
npm run test:elemental-compatibility
npm run test:lunar-calculations
npm run test:fallback-mechanisms

# Performance testing
npm run test:calculation-performance
npm run test:memory-usage
```

### Manual Testing Procedures
```typescript
// Manual test suite for astrological calculations
class AstrologicalTestSuite {
  async runAllTests() {
    console.log('🌟 Starting Astrological Test Suite...');
    
    await this.testPlanetaryPositions();
    await this.testElementalCompatibility();
    await this.testTransitValidation();
    await this.testFallbackMechanisms();
    await this.testPerformance();
    
    console.log('✅ Astrological Test Suite Complete');
  }
  
  async testPlanetaryPositions() {
    console.log('Testing planetary positions...');
    
    const testDates = [
      new Date('2024-07-15'), // Known Mars in Cancer
      new Date('2024-12-25'), // Winter solstice period
      new Date('2025-03-28')  // Fallback data date
    ];
    
    for (const date of testDates) {
      const positions = await getReliablePlanetaryPositions(date);
      const isValid = validatePlanetaryPositions(positions);
      
      console.log(`Date: ${date.toISOString().split('T')[0]}`);
      console.log(`Valid: ${isValid}`);
      console.log(`Source: ${positions.source}`);
    }
  }
  
  async testElementalCompatibility() {
    console.log('Testing elemental compatibility...');
    
    const testCombinations = [
      { source: { fire: 1, water: 0, earth: 0, air: 0 }, target: { fire: 1, water: 0, earth: 0, air: 0 } },
      { source: { fire: 1, water: 0, earth: 0, air: 0 }, target: { fire: 0, water: 1, earth: 0, air: 0 } },
      { source: { fire: 0, water: 1, earth: 0, air: 0 }, target: { fire: 0, water: 0, earth: 1, air: 0 } },
      { source: { fire: 0, water: 0, earth: 1, air: 0 }, target: { fire: 0, water: 0, earth: 0, air: 1 } }
    ];
    
    for (const combo of testCombinations) {
      const compatibility = calculateElementalCompatibility(combo.source, combo.target);
      const valid = compatibility >= 0.7;
      
      console.log(`Compatibility: ${compatibility.toFixed(2)} - ${valid ? '✅' : '❌'}`);
    }
  }
}

// Run the test suite
const testSuite = new AstrologicalTestSuite();
testSuite.runAllTests();
```

## 📊 Performance Monitoring

### Calculation Performance Metrics
```typescript
// Monitor astrological calculation performance
class AstrologicalPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  async measureCalculation<T>(name: string, calculation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await calculation();
      const duration = performance.now() - startTime;
      
      this.recordMetric(name, duration);
      
      if (duration > 2000) {
        console.warn(`⚠️ Slow calculation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Calculation failed: ${name} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
  
  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const measurements = this.metrics.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
  }
  
  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    for (const [name, measurements] of this.metrics.entries()) {
      const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
      const max = Math.max(...measurements);
      const min = Math.min(...measurements);
      
      report[name] = {
        average: avg.toFixed(2),
        maximum: max.toFixed(2),
        minimum: min.toFixed(2),
        count: measurements.length
      };
    }
    
    return report;
  }
}
```

## 🚨 Emergency Procedures

### Critical Failure Recovery
```bash
# Complete astrological system failure
npm run emergency:astrological-reset

# Enable safe mode (fallback only)
npm run astrological:safe-mode

# Restore from backup
npm run restore:astrological-data

# Validate system integrity
npm run validate:astrological-integrity
```

### Data Corruption Recovery
```typescript
// Detect and recover from data corruption
async function detectAndRecoverCorruption() {
  console.log('Checking for astrological data corruption...');
  
  // Check planetary data integrity
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  for (const planet of planets) {
    try {
      const planetData = require(`./src/data/planets/${planet}.js`);
      
      // Validate data structure
      if (!planetData.TransitDates) {
        console.error(`❌ Corrupted ${planet} data: missing TransitDates`);
        await restorePlanetData(planet);
      }
      
      // Validate date formats
      for (const [sign, dates] of Object.entries(planetData.TransitDates)) {
        if (!isValidDate(dates.Start) || !isValidDate(dates.End)) {
          console.error(`❌ Corrupted ${planet} data: invalid dates for ${sign}`);
          await restorePlanetData(planet);
        }
      }
      
      console.log(`✅ ${planet} data integrity verified`);
      
    } catch (error) {
      console.error(`❌ Failed to load ${planet} data:`, error);
      await restorePlanetData(planet);
    }
  }
}
```

---

**Remember**: Astrological calculations are complex but debuggable. Use systematic approaches, validate at each step, and maintain good fallback mechanisms. When in doubt, check the data integrity first. 🌟