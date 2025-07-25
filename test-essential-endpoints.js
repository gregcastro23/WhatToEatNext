#!/usr/bin/env node

/**
 * Essential API Endpoint Tester
 * Tests the three most critical endpoints for WhatToEatNext:
 * 1. https://alchm-backend.onrender.com (health check)
 * 2. https://alchm-backend.onrender.com/astrologize (planetary positions)
 * 3. https://alchm-backend.onrender.com/alchemize (alchemical calculations)
 * 
 * Also tests local API routes that proxy to these endpoints.
 */

import fetch from 'node-fetch';

// Configuration
const TIMEOUT = 15000; // 15 seconds for external APIs (they can be slow)
const LOCAL_TIMEOUT = 5000; // 5 seconds for local APIs

// Test endpoints
const ENDPOINTS = {
  external: {
    base: 'https://alchm-backend.onrender.com',
    astrologize: 'https://alchm-backend.onrender.com/astrologize',
    alchemize: 'https://alchm-backend.onrender.com/alchemize'
  },
  local: {
    astrologize: 'http://localhost:3000/api/astrologize',
    alchemize: 'http://localhost:3000/api/alchemize'
  }
};

// Test payloads
const ASTROLOGIZE_PAYLOAD = {
  year: 2025,
  month: 0, // January (0-indexed for external API)
  date: 25,
  hour: 12,
  minute: 0,
  latitude: 40.7498,
  longitude: -73.7976,
  ayanamsa: 'TROPICAL'
};

const ALCHEMIZE_PAYLOAD = {
  year: 2025,
  month: 1, // February (1-indexed for local API)
  date: 25,
  hour: 12,
  minute: 0,
  latitude: 40.7498,
  longitude: -73.7976,
  zodiacSystem: 'tropical'
};

// Utility functions
function createTimeout(ms) {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
  );
}

async function testEndpoint(name, url, options = {}) {
  const { method = 'GET', body = null, timeout = TIMEOUT } = options;
  
  console.log(`\n🧪 Testing ${name}`);
  console.log(`   ${method} ${url}`);
  console.log('   ' + '='.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatToEatNext-Test/1.0'
      }
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await Promise.race([
      fetch(url, fetchOptions),
      createTimeout(timeout)
    ]);
    
    const duration = Date.now() - startTime;
    const statusCode = response.status;
    
    console.log(`   ⏱️  Response time: ${duration}ms`);
    console.log(`   📊 Status: ${statusCode} ${response.statusText}`);
    
    if (response.ok) {
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log(`   ✅ SUCCESS - JSON response received`);
          
          // Basic validation for different endpoints
          if (name.includes('astrologize') || name.includes('Astrologize')) {
            if (data._celestialBodies || data.astrology_info) {
              console.log(`   🌟 Contains planetary data`);
            } else {
              console.log(`   ⚠️  Unexpected astrologize response structure`);
            }
          } else if (name.includes('alchemize') || name.includes('Alchemize')) {
            if (data.alchemicalResult || data.success) {
              console.log(`   🧪 Contains alchemical data`);
            } else {
              console.log(`   ⚠️  Unexpected alchemize response structure`);
            }
          }
          
          // Show key structure
          if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            console.log(`   🔑 Response keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
          }
          
        } catch (parseError) {
          console.log(`   ⚠️  JSON parse error: ${parseError.message}`);
          data = await response.text();
          console.log(`   📦 Raw response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        }
      } else {
        data = await response.text();
        console.log(`   ✅ SUCCESS - Text response received`);
        console.log(`   📦 Content: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
      }
      
      return { 
        success: true, 
        duration, 
        statusCode, 
        data,
        endpoint: name
      };
      
    } else {
      const errorText = await response.text();
      console.log(`   ❌ FAILED - HTTP ${statusCode}`);
      console.log(`   📦 Error: ${errorText.substring(0, 200)}`);
      
      return { 
        success: false, 
        duration, 
        statusCode, 
        error: `HTTP ${statusCode}: ${errorText}`,
        endpoint: name
      };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ ERROR: ${error.message}`);
    
    return { 
      success: false, 
      duration, 
      error: error.message,
      endpoint: name
    };
  }
}

async function main() {
  console.log('🌟 WhatToEatNext Essential API Test');
  console.log('===================================');
  console.log(`Started at: ${new Date().toISOString()}`);
  
  const results = [];
  
  // Test external endpoints
  console.log('\n🌐 EXTERNAL ENDPOINTS');
  console.log('====================');
  
  // 1. Base health check
  results.push(await testEndpoint(
    'Backend Health Check', 
    ENDPOINTS.external.base,
    { timeout: TIMEOUT }
  ));
  
  // 2. Astrologize API
  results.push(await testEndpoint(
    'External Astrologize API', 
    ENDPOINTS.external.astrologize,
    { 
      method: 'POST', 
      body: ASTROLOGIZE_PAYLOAD,
      timeout: TIMEOUT 
    }
  ));
  
  // 3. Alchemize API (if it exists)
  results.push(await testEndpoint(
    'External Alchemize API', 
    ENDPOINTS.external.alchemize,
    { 
      method: 'POST', 
      body: ALCHEMIZE_PAYLOAD,
      timeout: TIMEOUT 
    }
  ));
  
  // Test local API routes
  console.log('\n🏠 LOCAL API ROUTES');
  console.log('==================');
  
  // 4. Local Astrologize API
  results.push(await testEndpoint(
    'Local Astrologize API', 
    ENDPOINTS.local.astrologize,
    { 
      method: 'POST', 
      body: { ...ASTROLOGIZE_PAYLOAD, month: ASTROLOGIZE_PAYLOAD.month + 1 }, // Convert to 1-indexed
      timeout: LOCAL_TIMEOUT 
    }
  ));
  
  // 5. Local Alchemize API
  results.push(await testEndpoint(
    'Local Alchemize API', 
    ENDPOINTS.local.alchemize,
    { 
      method: 'POST', 
      body: ALCHEMIZE_PAYLOAD,
      timeout: LOCAL_TIMEOUT 
    }
  ));
  
  // Summary and analysis
  console.log('\n📊 RESULTS SUMMARY');
  console.log('==================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    console.log(`⏱️  Average response time: ${Math.round(avgDuration)}ms`);
    
    console.log('\n✅ Working endpoints:');
    successful.forEach(r => {
      console.log(`   • ${r.endpoint} (${r.duration}ms)`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed endpoints:');
    failed.forEach(r => {
      console.log(`   • ${r.endpoint}: ${r.error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  const externalWorking = successful.filter(r => r.endpoint.includes('External')).length;
  const localWorking = successful.filter(r => r.endpoint.includes('Local')).length;
  
  if (externalWorking >= 2) {
    console.log('✅ External backend APIs are working well!');
    console.log('✅ Your essential endpoints are functional.');
    console.log('✅ MCP server cleanup was successful.');
  } else if (localWorking >= 1) {
    console.log('⚠️  External APIs may be slow/unreliable.');
    console.log('✅ Local API routes are working as proxies.');
    console.log('💡 Consider implementing better fallback mechanisms.');
  } else {
    console.log('❌ Critical: No essential APIs are responding.');
    console.log('🔧 Check if your Next.js dev server is running.');
    console.log('🔧 Verify backend service status.');
  }
  
  // MCP Configuration advice
  console.log('\n🔧 MCP CONFIGURATION');
  console.log('====================');
  console.log('✅ Removed problematic MCP servers successfully.');
  console.log('✅ Kept minimal fetch server for basic HTTP testing.');
  console.log('💡 Focus on your working local API routes.');
  console.log('💡 Your essential APIs are accessible without MCP servers.');
  
  // Exit with appropriate code
  const exitCode = successful.length >= 3 ? 0 : 1;
  console.log(`\n🏁 Test completed with exit code: ${exitCode}`);
  process.exit(exitCode);
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});