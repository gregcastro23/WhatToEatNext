#!/usr/bin/env node

/**
 * Test script for essential APIs
 * Tests the three most important endpoints:
 * 1. https://alchm-backend.onrender.com (base)
 * 2. https://alchm-backend.onrender.com/astrologize
 * 3. https://alchm-backend.onrender.com/alchemize
 */

const https = require('https');

// Test configuration
const TIMEOUT = 10000; // 10 seconds
const BASE_URL = 'alchm-backend.onrender.com';

// Test payload for astrologize
const ASTROLOGIZE_PAYLOAD = {
  year: 2025,
  month: 0, // January (0-indexed)
  date: 25,
  hour: 12,
  minute: 0,
  latitude: 40.7498,
  longitude: -73.7976,
  ayanamsa: 'TROPICAL'
};

// Test payload for alchemize (if it exists)
const ALCHEMIZE_PAYLOAD = {
  year: 2025,
  month: 1, // February (1-indexed for this endpoint)
  date: 25,
  hour: 12,
  minute: 0,
  latitude: 40.7498,
  longitude: -73.7976,
  zodiacSystem: 'tropical'
};

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatToEatNext-Test/1.0'
      },
      timeout: TIMEOUT
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            rawData: responseData
          });
        } catch (parseError) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: responseData,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
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

async function testEndpoint(name, path, method = 'GET', payload = null) {
  console.log(`\n🧪 Testing ${name}`);
  console.log(`   ${method} https://${BASE_URL}${path}`);
  console.log('   ' + '='.repeat(50));
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(path, method, payload);
    const duration = Date.now() - startTime;
    
    console.log(`   ⏱️  Response time: ${duration}ms`);
    console.log(`   📊 Status: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`   ✅ SUCCESS`);
      
      if (response.data) {
        console.log(`   📦 Response type: ${typeof response.data}`);
        if (typeof response.data === 'object') {
          const keys = Object.keys(response.data);
          console.log(`   🔑 Keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`   📦 Raw response: ${response.rawData.substring(0, 100)}${response.rawData.length > 100 ? '...' : ''}`);
      }
      
      return { success: true, duration, statusCode: response.statusCode, data: response.data };
    } else {
      console.log(`   ❌ FAILED - HTTP ${response.statusCode}`);
      console.log(`   📦 Response: ${response.rawData.substring(0, 200)}`);
      return { success: false, duration, statusCode: response.statusCode, error: `HTTP ${response.statusCode}` };
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🌟 Testing Essential APIs');
  console.log('========================');
  console.log(`Target: https://${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT}ms`);
  
  const results = [];
  
  // Test 1: Base endpoint
  results.push(await testEndpoint('Base Endpoint', '/', 'GET'));
  
  // Test 2: Astrologize endpoint
  results.push(await testEndpoint('Astrologize API', '/astrologize', 'POST', ASTROLOGIZE_PAYLOAD));
  
  // Test 3: Alchemize endpoint (if it exists)
  results.push(await testEndpoint('Alchemize API', '/alchemize', 'POST', ALCHEMIZE_PAYLOAD));
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log('==========');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful > 0) {
    const avgDuration = results
      .filter(r => r.success && r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / successful;
    console.log(`⏱️  Average response time: ${Math.round(avgDuration)}ms`);
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (successful === total) {
    console.log('✅ All essential APIs are working correctly!');
    console.log('✅ You can safely remove the problematic MCP servers.');
    console.log('✅ Focus on these working endpoints for your application.');
  } else if (successful > 0) {
    console.log('⚠️  Some APIs are working, others are not.');
    console.log('⚠️  Consider using only the working endpoints.');
    console.log('⚠️  Implement fallback mechanisms for failed endpoints.');
  } else {
    console.log('❌ None of the essential APIs are responding.');
    console.log('❌ Check if the backend service is running.');
    console.log('❌ Consider using local fallback data.');
  }
  
  // Exit with appropriate code
  process.exit(successful === total ? 0 : 1);
}

// Run the tests
main().catch(console.error);