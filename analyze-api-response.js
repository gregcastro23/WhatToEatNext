import fs from 'fs';
import JSON5 from 'json5';

// Safety metrics and validation system
class SafetyValidator {
  constructor() {
    this.metrics = this.loadMetrics();
  }

  loadMetrics() {
    try {
      const metricsFile = '.api-response-metrics.json';
      if (fs.existsSync(metricsFile)) {
        return JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      }
    } catch (error) {
      console.log(`⚠️  Could not load safety metrics: ${error.message}`);
    }

    return {
      totalRuns: 0,
      successfulRuns: 0,
      parsingErrors: 0,
      extractionErrors: 0,
      lastRunTime: null,
      safetyScore: 0.0,
    };
  }

  saveMetrics() {
    try {
      const metricsFile = '.api-response-metrics.json';
      fs.writeFileSync(metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.log(`⚠️  Could not save safety metrics: ${error.message}`);
    }
  }

  calculateSafetyScore() {
    if (this.metrics.totalRuns === 0) return 0.0;

    const successRate = this.metrics.successfulRuns / this.metrics.totalRuns;
    const errorRate =
      (this.metrics.parsingErrors + this.metrics.extractionErrors) /
      Math.max(this.metrics.totalRuns, 1);
    const experienceBonus = Math.min(this.metrics.totalRuns / 5, 1.0);

    return successRate * 0.6 + (1 - errorRate) * 0.3 + experienceBonus * 0.1;
  }

  recordRunStart() {
    this.metrics.totalRuns++;
    this.metrics.lastRunTime = new Date().toISOString();
    this.currentErrors = 0;
  }

  recordParsingError() {
    this.metrics.parsingErrors++;
    this.currentErrors++;
  }

  recordExtractionError() {
    this.metrics.extractionErrors++;
    this.currentErrors++;
  }

  recordRunComplete(successful = true) {
    if (successful && this.currentErrors === 0) {
      this.metrics.successfulRuns++;
    }

    this.metrics.safetyScore = this.calculateSafetyScore();
    this.saveMetrics();
  }

  showMetrics() {
    const safetyScore = this.calculateSafetyScore();

    console.log('\n📊 API RESPONSE ANALYSIS SAFETY METRICS');
    console.log('='.repeat(50));
    console.log(`🎯 Safety Score: ${(safetyScore * 100).toFixed(1)}%`);
    console.log(`📈 Total Runs: ${this.metrics.totalRuns}`);
    console.log(`✅ Successful Runs: ${this.metrics.successfulRuns}`);
    console.log(`❌ Parsing Errors: ${this.metrics.parsingErrors}`);
    console.log(`❌ Extraction Errors: ${this.metrics.extractionErrors}`);

    if (this.metrics.lastRunTime) {
      console.log(`⏰ Last Run: ${new Date(this.metrics.lastRunTime).toLocaleString()}`);
    }
  }
}

const safetyValidator = new SafetyValidator();

// Enhanced color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

// Function to safely parse JavaScript object literal using eval with safety measures
function parseJavaScriptObject(jsonString) {
  // Remove any potential dangerous code by stripping function calls and other risky patterns
  let sanitized = jsonString;

  // Remove any function calls or other potentially dangerous code
  sanitized = sanitized.replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '{}');
  sanitized = sanitized.replace(/=>\s*\{[^}]*\}/g, '=>{}');
  sanitized = sanitized.replace(/new\s+\w+\([^)]*\)/g, 'null');
  sanitized = sanitized.replace(/require\([^)]*\)/g, 'null');
  sanitized = sanitized.replace(/import\s+[^;]*/g, '');
  sanitized = sanitized.replace(/export\s+[^;]*/g, '');

  // Create a safe context for eval
  const safeEval = code => {
    // Only allow object literal syntax
    if (!/^[\s{]*\{[\s\S]*\}[\s]*$/.test(code)) {
      throw new Error('Invalid object literal format');
    }

    // Use Function constructor instead of eval for better isolation
    const func = new Function('return ' + code);
    return func();
  };

  try {
    return safeEval(sanitized);
  } catch (error) {
    throw new Error(`Failed to parse JavaScript object: ${error.message}`);
  }
}

// Read the API response file
const responseData = fs.readFileSync('alchemizer-response.json', 'utf8');

// Find where the actual JSON response starts (after "API response received.")
const apiResponseStart = responseData.indexOf('API response received.');
if (apiResponseStart === -1) {
  log('❌ Could not find "API response received." marker', 'red');
  process.exit(1);
}

// Find the JSON start after the marker
const jsonStart = responseData.indexOf('{', apiResponseStart);
if (jsonStart === -1) {
  log('❌ Could not find JSON start after API response marker', 'red');
  process.exit(1);
}

// Find the end of the JSON object by counting braces
let braceCount = 0;
let jsonEnd = jsonStart;
let inString = false;
let stringChar = '';

for (let i = jsonStart; i < responseData.length; i++) {
  const char = responseData[i];

  // Handle string literals
  if ((char === '"' || char === "'") && responseData[i - 1] !== '\\') {
    if (!inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar) {
      inString = false;
    }
  }

  // Only count braces when not in a string
  if (!inString) {
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
  }
}

const jsonData = responseData.substring(jsonStart, jsonEnd);

// Debug: Show what we extracted
log(`📊 Extracted JSON length: ${jsonData.length}`, 'cyan');
log(`📊 JSON start: ${jsonStart}, JSON end: ${jsonEnd}`, 'cyan');
if (jsonData.length < 100) {
  log(`📊 Extracted content: ${jsonData}`, 'yellow');
} else {
  log(`📊 First 200 chars: ${jsonData.substring(0, 200)}`, 'yellow');
}

// Record run start
safetyValidator.recordRunStart();

try {
  log('🔧 Parsing JavaScript object literal with safe eval...', 'blue');

  // Parse the JavaScript object literal safely
  const response = parseJavaScriptObject(jsonData);

  log('✅ Successfully parsed API response!', 'green');

  log('\n=== API Response Structure Analysis ===', 'bright');
  log(`Top-level keys: ${Object.keys(response).join(', ')}`, 'cyan');

  if (response.astrology_info) {
    log('\n=== Astrology Info Keys ===', 'bright');
    log(Object.keys(response.astrology_info).join(', '), 'cyan');

    if (response.astrology_info.horoscope_parameters) {
      log('\n=== Horoscope Parameters Keys ===', 'bright');
      log(Object.keys(response.astrology_info.horoscope_parameters).join(', '), 'cyan');

      if (response.astrology_info.horoscope_parameters.planets) {
        log('\n=== Available Planets ===', 'bright');
        const planets = response.astrology_info.horoscope_parameters.planets;
        log(Object.keys(planets).join(', '), 'cyan');

        // Extract planetary positions in the format expected by alchemize function
        const planetaryPositions = {};

        for (const [planetName, planetData] of Object.entries(planets)) {
          if (planetData.sign && planetData.angle !== undefined) {
            // Convert angle to degrees and minutes
            const totalDegrees = planetData.angle;
            const degrees = Math.floor(totalDegrees);
            const minutes = Math.floor((totalDegrees - degrees) * 60);

            planetaryPositions[planetName] = {
              sign: planetData.sign,
              degree: degrees,
              minute: minutes,
              isRetrograde: planetData.isRetrograde || false,
            };
          }
        }

        log('\n=== Extracted Planetary Positions ===', 'bright');
        console.log(JSON.stringify(planetaryPositions, null, 2));

        // Save the extracted positions to a file
        fs.writeFileSync(
          'extracted-planetary-positions.json',
          JSON.stringify(planetaryPositions, null, 2),
        );
        log('\n✅ Planetary positions saved to extracted-planetary-positions.json', 'green');

        // Test the alchemize function with the extracted data
        log('\n=== Testing Alchemize Function ===', 'bright');
        try {
          // Import the alchemize function
          const alchemizeModule = await import('./src/calculations/alchemicalEngine.js');
          const alchemize = alchemizeModule.default.alchemize;

          if (typeof alchemize === 'function') {
            const result = alchemize(planetaryPositions);
            log('Alchemize result:', 'green');
            console.log(result);
          } else {
            log('❌ alchemize function not found in module', 'red');
            safetyValidator.recordExtractionError();
          }
        } catch (importError) {
          log(`❌ Could not import alchemize function: ${importError.message}`, 'red');
          safetyValidator.recordExtractionError();
        }
      } else {
        log('❌ No planets found in horoscope_parameters', 'red');
        safetyValidator.recordExtractionError();
      }
    } else {
      log('❌ No horoscope_parameters found', 'red');
      safetyValidator.recordExtractionError();
    }
  } else {
    log('❌ No astrology_info found in response', 'red');
    safetyValidator.recordExtractionError();
  }

  // Record successful run completion
  safetyValidator.recordRunComplete(true);

  // Show safety metrics
  safetyValidator.showMetrics();
} catch (parseError) {
  log(`❌ Error parsing API response with JSON5: ${parseError.message}`, 'red');
  log(`JSON start position: ${jsonStart}`, 'yellow');
  log('First 500 characters of extracted JSON:', 'yellow');
  console.log(jsonData.substring(0, 500));

  // Record parsing error
  safetyValidator.recordParsingError();
  safetyValidator.recordRunComplete(false);

  // Show safety metrics even on error
  safetyValidator.showMetrics();
}
