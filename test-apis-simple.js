#!/usr/bin/env node

/**
 * Simple Test Script for Astrologize and Alchemize APIs
 */

import fetch from 'node-fetch;

const BASE_URL = http://localhost:3000';
const ASTROLOGIZE_ENDPOINT = `${BASE_URL}/api/astrologize`;
const ALCHEMIZE_ENDPOINT = `${BASE_URL}/api/alchemize`;

console.log('🌟 Testing Astrologize and Alchemize APIs');
console.log('=========================================\n');

async function testAstrologizeAPI() {
  console.log('🧪 Testing Astrologize API');
  console.log('---------------------------');
  
  try {
    // Test GET request
    console.log('📤 Testing GET /api/astrologize...');
    const getResponse = await fetch(ASTROLOGIZE_ENDPOINT);
    
    if (getResponse.ok) {     const getData = await getResponse.json();
      console.log('✅ GET request successful');
      console.log(`📊 Response has celestial bodies: ${getData._celestialBodies ?Yes: 'No}`);
      
      if (getData._celestialBodies) {
        const planetCount = Object.keys(getData._celestialBodies).length;
        console.log(`🌟 Found ${planetCount} planetary positions`);
      }
    } else {
      console.log(`❌ GET request failed: ${getResponse.status}`);
    }
    
    // Test POST request
    console.log('📤 Testing POST /api/astrologize...');
    const postPayload = {
      year: 2025,
      month: 7,
      date: 1,
      hour:8,
      minute: 15,
      latitude: 40.7498,
      longitude: -73.7976,
      zodiacSystem: 'tropical'
    };
    
    const postResponse = await fetch(ASTROLOGIZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });
    
    if (postResponse.ok) {    const postData = await postResponse.json();
      console.log('✅ POST request successful');
      console.log(`📊 Response has celestial bodies: ${postData._celestialBodies ?Yes: 'No}`);
      
      if (postData._celestialBodies) {
        const planetCount = Object.keys(postData._celestialBodies).length;
        console.log(`🌟 Found ${planetCount} planetary positions`);
      }
    } else {
      console.log(`❌ POST request failed: ${postResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(❌ Astrologize API Error:', error.message);
    return false;
  }
}

async function testAlchemizeAPI() {
  console.log('\n🧪 Testing Alchemize API');
  console.log('-------------------------');
  
  try {
    // Test GET request
    console.log('📤 Testing GET /api/alchemize...');
    const getResponse = await fetch(ALCHEMIZE_ENDPOINT);
    
    if (getResponse.ok) {     const getData = await getResponse.json();
      console.log('✅ GET request successful');
      console.log(`📊 Response has alchemical result: ${getData.alchemicalResult ?Yes : }`);
      console.log(`📊 Response has planetary positions: ${getData.planetaryPositions ?Yes: 'No}`);
      
      if (getData.alchemicalResult) {  const alchemical = getData.alchemicalResult;
        if (alchemical.elementalBalance) {
          console.log('🔥 Elemental Balance:');
          console.log(`   Fire: ${alchemical.elementalBalance.fire?.toFixed(3) || 'N/A'}`);
          console.log(`   Water: ${alchemical.elementalBalance.water?.toFixed(3) || 'N/A'}`);
          console.log(`   Earth: ${alchemical.elementalBalance.earth?.toFixed(3) || 'N/A'}`);
          console.log(`   Air: ${alchemical.elementalBalance.air?.toFixed(3) ||N/A'}`);
        }
        
        if (alchemical.thermodynamicMetrics) {      const thermo = alchemical.thermodynamicMetrics;
          console.log('⚗️ Thermodynamic Metrics:');
          console.log(`   Heat: ${thermo.heat?.toFixed(3) || 'N/A'}`);
          console.log(`   Entropy: ${thermo.entropy?.toFixed(3) || 'N/A'}`);
          console.log(`   Reactivity: ${thermo.reactivity?.toFixed(3) || 'N/A'}`);
          console.log(`   Kalchm: ${thermo.kalchm?.toFixed(3) || 'N/A'}`);
          console.log(`   Monica: ${thermo.monica?.toFixed(3) ||N/A'}`);
        }
      }
    } else {
      console.log(`❌ GET request failed: ${getResponse.status}`);
    }
    
    // Test POST request with custom date
    console.log('📤 Testing POST /api/alchemize with custom date...');
    const postPayload = {
      year: 2025,
      month: 7,
      date: 1,
      hour:8,
      minute: 15,
      latitude: 40.7498,
      longitude: -73.7976,
      zodiacSystem: 'tropical'
    };
    
    const postResponse = await fetch(ALCHEMIZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });
    
    if (postResponse.ok) {    const postData = await postResponse.json();
      console.log('✅ POST request successful');
      console.log(`📊 Response has alchemical result: ${postData.alchemicalResult ?Yes : }`);
      console.log(`📊 Response has planetary positions: ${postData.planetaryPositions ?Yes: 'No}`);
      
      if (postData.alchemicalResult) {  const alchemical = postData.alchemicalResult;
        if (alchemical.elementalBalance) {
          console.log('🔥 Elemental Balance:');
          console.log(`   Fire: ${alchemical.elementalBalance.fire?.toFixed(3) || 'N/A'}`);
          console.log(`   Water: ${alchemical.elementalBalance.water?.toFixed(3) || 'N/A'}`);
          console.log(`   Earth: ${alchemical.elementalBalance.earth?.toFixed(3) || 'N/A'}`);
          console.log(`   Air: ${alchemical.elementalBalance.air?.toFixed(3) ||N/A'}`);
        }
      }
    } else {
      console.log(`❌ POST request failed: ${postResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Alchemize API Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('Starting API tests...\n'); 
  const astrologizeSuccess = await testAstrologizeAPI();
  const alchemizeSuccess = await testAlchemizeAPI();
  
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Astrologize API: ${astrologizeSuccess ? ✅ PASS : AIL'}`);
  console.log(`Alchemize API: ${alchemizeSuccess ? ✅ PASS' :❌ FAIL}`);
  
  if (astrologizeSuccess && alchemizeSuccess) {    console.log('🎉 All APIs are working correctly!');
  }else {    console.log('\n⚠️ Some APIs failed. Check the output above for details.'); }
}

main().catch(console.error); 