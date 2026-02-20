#!/usr/bin/env node

/**
 * Comprehensive Test Script for Astrologize API
 * Tests both GET and POST endpoints with various scenarios
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000'; // Adjust if your dev server runs on different port
const ASTROLOGIZE_ENDPOINT = `${BASE_URL}/api/astrologize`;

// Test scenarios
const testScenarios = [
  {
    name: 'GET - Current Time (Default Location)',
    method: 'GET',
    url: `${ASTROLOGIZE_ENDPOINT}`,
    expectedStatus: 200
  },
  {
    name: 'GET - Current Time (Custom Location)',
    method: 'GET,
    url: `${ASTROLOGIZE_ENDPOINT}?latitude=34522longitude=-1180.2437iacSystem=tropical`,
    expectedStatus: 200
  },
 [object Object]
    name: 'POST - Current Time (Default Location)',
    method: 'POST',
    url: ASTROLOGIZE_ENDPOINT,
    body:[object Object]    year: new Date().getFullYear(),
      month: new Date().getMonth() + 1, // 1-indexed
      date: new Date().getDate(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      latitude: 40.7498,
      longitude: -73.7976      zodiacSystem: tropical'
    },
    expectedStatus: 200
  },
 [object Object]
    name: 'POST - Custom Date/Time (NYC)',
    method: 'POST',
    url: ASTROLOGIZE_ENDPOINT,
    body: [object Object]      year: 2025      month: 7, // July
      date: 1    hour:8,
      minute: 15,
      latitude: 40.7498,
      longitude: -73.7976      zodiacSystem: tropical'
    },
    expectedStatus: 200
  },
 [object Object]
    name: 'POST - Custom Date/Time (Los Angeles)',
    method: 'POST',
    url: ASTROLOGIZE_ENDPOINT,
    body: [object Object]      year: 2025,
      month: 7    date:1
      hour: 5// 5 AM PST = 8 AM EST
      minute: 15,
      latitude: 34.0522,
      longitude: -118.2437      zodiacSystem: tropical'
    },
    expectedStatus: 200
  },
 [object Object]
    name: 'POST - Sidereal Zodiac',
    method: 'POST',
    url: ASTROLOGIZE_ENDPOINT,
    body: [object Object]      year: 2025,
      month: 7    date: 1    hour:8,
      minute: 15,
      latitude: 40.7498,
      longitude: -73.7976      zodiacSystem: sidereal'
    },
    expectedStatus:200];

async function testAstrologizeAPI()[object Object]
  console.log('🌟 Testing Astrologize API\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Endpoint: ${ASTROLOGIZE_ENDPOINT}\n`);

  let passedTests = 0;
  let totalTests = testScenarios.length;

  for (const scenario of testScenarios)[object Object]
    console.log(`🧪 Testing: ${scenario.name}`);
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

        // Validate response structure
        const hasCelestialBodies = data._celestialBodies && typeof data._celestialBodies ===object';
        const hasAstrologyInfo = data.astrology_info && data.astrology_info.horoscope_parameters;

        if (hasCelestialBodies || hasAstrologyInfo) {
          console.log(   ✅ PASS - Valid response structure');

          // Count planets if available
          if (hasCelestialBodies) {
            const planetCount = Object.keys(data._celestialBodies).length;
            console.log(`   📊 Found ${planetCount} planetary positions`);
          }

          passedTests++;
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

    console.log( // Empty line for readability
  }

  // Summary
  console.log('📊 Test Summary');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100.toFixed(1)}%`);

  if (passedTests === totalTests)[object Object]    console.log('\n🎉 All tests passed! Astrologize API is working correctly.);
  }else[object Object]    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
testAstrologizeAPI().catch(console.error);
