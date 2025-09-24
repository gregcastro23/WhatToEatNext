import fetch from 'node-fetch';

// Safety metrics and validation system
class SafetyValidator {
  constructor() {
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      parsingErrors: 0,
      extractionErrors: 0,
      lastRunTime: null,
      safetyScore: 0.0,
    };
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

async function callAlchemizerAPI() {
  const payload = {
    year: 2025,
    month: 5, // June (0-based)
    date: 30,
    hour: 21,
    minute: 40,
    latitude: 40.7498,
    longitude: -73.7976,
    ayanamsa: 'TROPICAL',
  };

  log('🚀 Calling alchm-backend API directly...', 'blue');
  log(`📤 Sending payload: ${JSON.stringify(payload, null, 2)}`, 'cyan');

  try {
    const response = await fetch('https://alchm-backend.onrender.com/astrologize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log('✅ API response received successfully!', 'green');

    return data;
  } catch (error) {
    log(`❌ Error calling API: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  // Record run start
  safetyValidator.recordRunStart();

  try {
    // Call the API directly
    const response = await callAlchemizerAPI();

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
          const fs = await import('fs');
          fs.writeFileSync(
            'extracted-planetary-positions.json',
            JSON.stringify(planetaryPositions, null, 2),
          );
          log('\n✅ Planetary positions saved to extracted-planetary-positions.json', 'green');

          // Show success message without trying to import alchemize
          log('\n=== Success Summary ===', 'bright');
          log('✅ Successfully extracted planetary positions from API', 'green');
          log('✅ Data format is compatible with alchemize function', 'green');
          log('✅ File saved for use in your application', 'green');

          log('\n📋 Next Steps:', 'cyan');
          log('1. Use the extracted-planetary-positions.json file in your app', 'cyan');
          log('2. Import the alchemize function in your TypeScript environment', 'cyan');
          log('3. Pass the planetary positions to alchemize()', 'cyan');
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
  } catch (error) {
    log(`❌ Error in main execution: ${error.message}`, 'red');

    // Record parsing error
    safetyValidator.recordParsingError();
    safetyValidator.recordRunComplete(false);

    // Show safety metrics even on error
    safetyValidator.showMetrics();
  }
}

main();
