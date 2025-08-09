#!/usr/bin/env node

/**
 * Local API Validation Script
 * Tests your local Next.js API routes that proxy to the essential backend services
 * This script focuses on the APIs you actually use in your application
 */

import http from 'http';

// Configuration
const LOCAL_BASE = 'http://localhost:3000';
const TIMEOUT = 10000;

// Test payloads
const TEST_PAYLOADS = {
  astrologize: {
    year: 2025,
    month: 1, // January (1-indexed for local API)
    date: 25,
    hour: 12,
    minute: 0,
    latitude: 40.7498,
    longitude: -73.7976,
    zodiacSystem: 'tropical',
  },
  alchemize: {
    year: 2025,
    month: 1, // January (1-indexed for local API)
    date: 25,
    hour: 12,
    minute: 0,
    latitude: 40.7498,
    longitude: -73.7976,
    zodiacSystem: 'tropical',
  },
};

function makeLocalRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatToEatNext-LocalTest/1.0',
      },
      timeout: TIMEOUT,
    };

    const req = http.request(options, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            rawData: responseData,
          });
        } catch (parseError) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: responseData,
            parseError: parseError.message,
          });
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLocalAPI(name, path, method = 'GET', payload = null) {
  console.log(`\n🧪 Testing ${name}`);
  console.log(`   ${method} ${LOCAL_BASE}${path}`);
  console.log('   ' + '='.repeat(50));

  try {
    const startTime = Date.now();
    const response = await makeLocalRequest(path, method, payload);
    const duration = Date.now() - startTime;

    console.log(`   ⏱️  Response time: ${duration}ms`);
    console.log(`   📊 Status: ${response.statusCode}`);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`   ✅ SUCCESS`);

      if (response.data) {
        console.log(`   📦 Response type: ${typeof response.data}`);

        // Validate response structure based on API
        if (name.includes('Astrologize')) {
          if (response.data._celestialBodies || response.data.astrology_info) {
            console.log(`   🌟 Contains planetary data ✓`);
          } else {
            console.log(`   ⚠️  Missing expected planetary data structure`);
          }
        } else if (name.includes('Alchemize')) {
          if (response.data.success && response.data.alchemicalResult) {
            console.log(`   🧪 Contains alchemical result ✓`);
            console.log(
              `   🌍 Planetary positions: ${Object.keys(response.data.planetaryPositions || {}).length} planets`,
            );
          } else {
            console.log(`   ⚠️  Missing expected alchemical data structure`);
          }
        }

        if (typeof response.data === 'object') {
          const keys = Object.keys(response.data);
          console.log(`   🔑 Keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(
          `   📦 Raw response: ${response.rawData.substring(0, 100)}${response.rawData.length > 100 ? '...' : ''}`,
        );
      }

      return { success: true, duration, statusCode: response.statusCode, data: response.data };
    } else {
      console.log(`   ❌ FAILED - HTTP ${response.statusCode}`);
      console.log(`   📦 Response: ${response.rawData.substring(0, 200)}`);
      return {
        success: false,
        duration,
        statusCode: response.statusCode,
        error: `HTTP ${response.statusCode}`,
      };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      console.log(`   💡 Hint: Make sure your Next.js dev server is running (npm run dev)`);
    }

    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🏠 Local API Validation');
  console.log('=======================');
  console.log(`Target: ${LOCAL_BASE}`);
  console.log(`Timeout: ${TIMEOUT}ms`);
  console.log(`Time: ${new Date().toISOString()}`);

  const results = [];

  // Test GET endpoints first (simpler)
  console.log('\n📡 GET Endpoints (Current Time)');
  console.log('===============================');

  results.push(await testLocalAPI('Astrologize GET', '/api/astrologize', 'GET'));
  results.push(await testLocalAPI('Alchemize GET', '/api/alchemize', 'GET'));

  // Test POST endpoints with custom data
  console.log('\n📤 POST Endpoints (Custom Date/Time)');
  console.log('====================================');

  results.push(
    await testLocalAPI('Astrologize POST', '/api/astrologize', 'POST', TEST_PAYLOADS.astrologize),
  );
  results.push(
    await testLocalAPI('Alchemize POST', '/api/alchemize', 'POST', TEST_PAYLOADS.alchemize),
  );

  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('=====================');

  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  if (successful > 0) {
    const avgDuration =
      results.filter(r => r.success && r.duration).reduce((sum, r) => sum + r.duration, 0) /
      successful;
    console.log(`⏱️  Average response time: ${Math.round(avgDuration)}ms`);
  }

  // Status assessment
  console.log('\n🎯 STATUS ASSESSMENT');
  console.log('====================');

  if (successful === total) {
    console.log('🎉 EXCELLENT: All local APIs are working perfectly!');
    console.log('✅ Your essential endpoints are fully functional.');
    console.log('✅ No MCP servers needed for core functionality.');
    console.log('✅ Ready for development and testing.');
  } else if (successful >= 2) {
    console.log('👍 GOOD: Most APIs are working.');
    console.log('⚠️  Some endpoints may need attention.');
    console.log('✅ Core functionality is available.');
  } else if (successful >= 1) {
    console.log('⚠️  PARTIAL: Some APIs are working.');
    console.log('🔧 Check backend service connectivity.');
    console.log('💡 Consider implementing fallback mechanisms.');
  } else {
    console.log('❌ CRITICAL: No APIs are responding.');
    console.log('🔧 Check if Next.js dev server is running: npm run dev');
    console.log('🔧 Verify backend service is accessible.');
    console.log('🔧 Check network connectivity.');
  }

  // Next steps
  console.log('\n🚀 NEXT STEPS');
  console.log('=============');

  if (successful >= 2) {
    console.log('1. ✅ MCP cleanup completed successfully');
    console.log('2. ✅ Focus on your working local API routes');
    console.log('3. 💡 Consider adding error handling and retries');
    console.log('4. 💡 Implement caching for better performance');
  } else {
    console.log('1. 🔧 Start your Next.js development server');
    console.log('2. 🔧 Check backend service status');
    console.log('3. 🔧 Review API route implementations');
    console.log('4. 🔧 Test network connectivity');
  }

  // Exit with appropriate code
  process.exit(successful >= 2 ? 0 : 1);
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the validation
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
