#!/usr/bin/env node

/**
 * Comprehensive Test Script for Both Astrologize and Alchemize APIs
 * Tests both APIs with various scenarios and validates responses
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000'; // Adjust if your dev server runs on different port
const ASTROLOGIZE_ENDPOINT = `${BASE_URL}/api/astrologize`;
const ALCHEMIZE_ENDPOINT = `${BASE_URL}/api/alchemize`;
const EXTERNAL_ASTROLOGIZE_URL = 'https://alchm-backend.onrender.com/astrologize';

console.log('🌟 Testing Both Astrologize and Alchemize APIs');
console.log('==============================================\n');

// Test scenarios for both APIs
const testScenarios = {
  astrologize:
    [object Object]      name: 'GET - Current Time (Default Location),      method:GET',
      url: ASTROLOGIZE_ENDPOINT,
      expectedStatus:200    },
    [object Object]      name: 'GET - Current Time (Custom Location),      method:GET',
      url: `${ASTROLOGIZE_ENDPOINT}?latitude=34522longitude=-1180.2437iacSystem=tropical`,
      expectedStatus:200    },
 [object Object]
      name: 'POST - Current Time (Default Location),     method: POST',
      url: ASTROLOGIZE_ENDPOINT,
      body: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1, //1dexed
        date: new Date().getDate(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        latitude: 40.7498,
        longitude:-73.7976      zodiacSystem: 'tropical'
      },
      expectedStatus:200    },
 [object Object]
      name: 'POST - Custom Date/Time (NYC),     method: POST',
      url: ASTROLOGIZE_ENDPOINT,
      body: {
        year: 2025,
        month: 7 July
        date: 1
        hour: 8,
        minute: 15,
        latitude: 40.7498,
        longitude:-73.7976      zodiacSystem: 'tropical'
      },
      expectedStatus:200    },
 [object Object]
      name: 'POST - Sidereal Zodiac,     method: POST',
      url: ASTROLOGIZE_ENDPOINT,
      body: {
        year: 2025,
        month: 7
        date: 1
        hour: 8,
        minute: 15,
        latitude: 40.7498,
        longitude:-73.7976      zodiacSystem: 'sidereal'
      },
      expectedStatus: 20   }
  ],
  alchemize:
    [object Object]      name: 'GET - Current Time (Default Location),      method:GET',
      url: ALCHEMIZE_ENDPOINT,
      expectedStatus:200    },
    [object Object]      name: 'GET - Current Time (Custom Location),      method:GET',
      url: `${ALCHEMIZE_ENDPOINT}?latitude=34522longitude=-1180.2437iacSystem=tropical`,
      expectedStatus:200    },
 [object Object]
      name: 'POST - Current Time (Default Location),     method: POST',
      url: ALCHEMIZE_ENDPOINT,
      body: [object Object]
        latitude: 40.7498,
        longitude:-73.7976      zodiacSystem: 'tropical'
      },
      expectedStatus:200    },
 [object Object]
      name: 'POST - Custom Date/Time (NYC),     method: POST',
      url: ALCHEMIZE_ENDPOINT,
      body: {
        year: 2025,
        month: 7 July
        date: 1
        hour: 8,
        minute: 15,
        latitude: 40.7498,
        longitude:-73.7976      zodiacSystem: 'tropical'
      },
      expectedStatus:200    },
 [object Object]
      name: 'POST - With Provided Planetary Positions,     method: POST',
      url: ALCHEMIZE_ENDPOINT,
      body: {
        planetaryPositions: [object Object]       Sun: { sign: cancer', degree:9 minute:55sRetrograde: false },
          Moon: { sign:virgo', degree: 25 minute:24sRetrograde: false },
          Mercury: { sign:leo degree:5 minute:40sRetrograde: false },
          Venus: { sign: taurus', degree: 26 minute:33sRetrograde: false },
          Mars: { sign: virgo', degree: 8, minute: 4, isRetrograde: false },
          Jupiter: { sign: cancer', degree:4 minute:56sRetrograde: false },
          Saturn: { sign: aries', degree:1 minute:49sRetrograde: false },
          Uranus: { sign: taurus', degree: 29 minute:44sRetrograde: false },
          Neptune: { sign: aries', degree:2 minute:10sRetrograde: false },
          Pluto:[object Object] sign: aquarius', degree: 3, minute: 8, isRetrograde: false }
        }
      },
      expectedStatus: 200   }
  ]
};

async function testAPI(apiName, scenarios)[object Object]
  console.log(`🧪 Testing ${apiName} API`);
  console.log(=eat(apiName.length + 15));

  let passedTests = 0;
  let totalTests = scenarios.length;

  for (const scenario of scenarios)[object Object]
    console.log(`\n📋 Test: ${scenario.name}`);
    console.log(`   Method: ${scenario.method}`);
    console.log(`   URL: ${scenario.url}`);

    try {
      const options =[object Object]  method: scenario.method,
        headers: {
         Content-Type':application/json'
        }
      };

      if (scenario.body)[object Object]      options.body = JSON.stringify(scenario.body);
        console.log(`   Body: ${JSON.stringify(scenario.body, null, 2)}`);
      }

      const startTime = Date.now();
      const response = await fetch(scenario.url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`   Status: ${response.status} (Expected: ${scenario.expectedStatus})`);
      console.log(`   Response Time: ${responseTime}ms`);

      if (response.status === scenario.expectedStatus) {
        const data = await response.json();

        // Validate response structure based on API type
        let isValid = false;

        if (apiName ===Astrologize')[object Object]         const hasCelestialBodies = data._celestialBodies && typeof data._celestialBodies === 'object;         const hasAstrologyInfo = data.astrology_info && data.astrology_info.horoscope_parameters;

          if (hasCelestialBodies || hasAstrologyInfo) {
            console.log(✅ PASS - Valid astrologize response structure');

            if (hasCelestialBodies) {
              const planetCount = Object.keys(data._celestialBodies).length;
              console.log(`   📊 Found ${planetCount} planetary positions`);
            }

            isValid = true;
          }
        } else if (apiName === 'Alchemize')[object Object]         const hasAlchemicalResult = data.alchemicalResult && typeof data.alchemicalResult === 'object;         const hasPlanetaryPositions = data.planetaryPositions && typeof data.planetaryPositions === 'object;         const hasSuccess = data.success === true;

          if (hasSuccess && hasAlchemicalResult && hasPlanetaryPositions) {
            console.log( ✅ PASS - Valid alchemize response structure');

            // Show alchemical properties
            const alchemical = data.alchemicalResult;
            if (alchemical.elementalBalance) {
              console.log(`   🔥 Elemental Balance: Fire=${alchemical.elementalBalance.fire?.toFixed(3)}, Water=${alchemical.elementalBalance.water?.toFixed(3)}, Earth=${alchemical.elementalBalance.earth?.toFixed(3)}, Air=${alchemical.elementalBalance.air?.toFixed(3`);
            }

            if (alchemical.thermodynamicMetrics) {
              const thermo = alchemical.thermodynamicMetrics;
              console.log(`   ⚗️  Thermodynamic: Heat=${thermo.heat?.toFixed(3)}, Entropy=${thermo.entropy?.toFixed(3 Reactivity=${thermo.reactivity?.toFixed(3`);
            }

            isValid = true;
          }
        }

        if (isValid) [object Object]       passedTests++;
        } else {
          console.log('   ❌ FAIL - Invalid response structure');
          console.log(`   Response: ${JSON.stringify(data, null,2);
        }
      } else[object Object]       console.log('   ❌ FAIL - Unexpected status code');
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }

    } catch (error) {
      console.log(`   ❌ FAIL - Network/Connection error: ${error.message}`);
    }
  }

  // Summary for this API
  console.log(`\n📊 ${apiName} API Test Summary`);
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100.toFixed(1)}%`);

  return { passedTests, totalTests };
}

async function testExternalAstrologizeAPI() [object Object]
  console.log('\n🌐 Testing External Astrologize API');
  console.log('==================================);
  try {
    const payload =[object Object]    year: new Date().getFullYear(),
      month: new Date().getMonth(), // 0-indexed for external API
      date: new Date().getDate(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      latitude: 40.7498,
      longitude:-73.7976
      ayanamsa: TROPICAL'
    };

    console.log('📤 Sending request to external API...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(EXTERNAL_ASTROLOGIZE_URL,[object Object]     method: 'POST',
      headers:[object Object]Content-Type': application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok)[object Object]   throw new Error(`External API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ External API Response received successfully');

    // Extract key info
    const birthInfo = data.birth_info;
    const celestialBodies = data._celestialBodies;

    console.log('📊 Birth Info:,[object Object]   ayanamsa: birthInfo?.ayanamsa,
      year: birthInfo?.year,
      month: birthInfo?.month,
      date: birthInfo?.date
    });

    if (celestialBodies) {
      console.log('🌟 Planetary Positions (Sample):');
      console.log(`☀️  Sun: ${celestialBodies.sun?.Sign?.label} ${celestialBodies.sun?.ChartPosition?.Ecliptic?.ArcDegrees?.degrees}°`);
      console.log(`🌙  Moon: ${celestialBodies.moon?.Sign?.label} ${celestialBodies.moon?.ChartPosition?.Ecliptic?.ArcDegrees?.degrees}°`);
      console.log(`☿   Mercury: ${celestialBodies.mercury?.Sign?.label} ${celestialBodies.mercury?.ChartPosition?.Ecliptic?.ArcDegrees?.degrees}°`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ External API Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Starting comprehensive API testing...\n');

  // Test external astrologize API first
  const externalResult = await testExternalAstrologizeAPI();

  // Test local astrologize API
  const astrologizeResult = await testAPI('Astrologize', testScenarios.astrologize);

  // Test local alchemize API
  const alchemizeResult = await testAPI('Alchemize', testScenarios.alchemize);

  // Overall summary
  console.log(n🎯 Overall Test Summary');
  console.log('======================');
  console.log(`External Astrologize API: ${externalResult.success ? ✅ PASS : AIL'}`);
  console.log(`Local Astrologize API: ${astrologizeResult.passedTests}/${astrologizeResult.totalTests} tests passed`);
  console.log(`Local Alchemize API: ${alchemizeResult.passedTests}/${alchemizeResult.totalTests} tests passed`);

  const totalLocalTests = astrologizeResult.totalTests + alchemizeResult.totalTests;
  const totalLocalPassed = astrologizeResult.passedTests + alchemizeResult.passedTests;

  console.log(`\n📊 Local APIs Success Rate: ${((totalLocalPassed / totalLocalTests) *100).toFixed(1)}%`);

  if (externalResult.success && totalLocalPassed === totalLocalTests)[object Object]    console.log('\n🎉 All tests passed! Both APIs are working correctly.);
  }else[object Object]    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
main().catch(console.error);
