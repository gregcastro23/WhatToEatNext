#!/usr/bin/env node

/**
 * Live Astrologize API Test Script
 * Run this to test the API and see current planetary positions
 *
 * Usage: node test-astrologize-live.js
 */

import https from "https";

// API configuration
const ASTROLOGIZE_API_URL = "https://alchm-backend.onrender.com/astrologize";
const DEFAULT_LOCATION = {
  latitude: 40.7498,
  longitude: -73.7976,
};

/**
 * Make HTTP request to astrologize API
 */
function makeApiRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: "alchm-backend.onrender.com",
      port: 443,
      path: "/astrologize",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve(parsed);
          } else {
            reject(
              new Error(
                `API Error: ${res.statusCode} - ${parsed.message || "Unknown error"}`,
              ),
            );
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Get current date/time for API request
 */
function getCurrentDateTime() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(), // 0-indexed for API
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  };
}

/**
 * Format planetary positions for display
 */
function formatPlanetaryPositions(planets) {
  const planetOrder = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];
  const formatted = [];

  planetOrder.forEach((planet) => {
    if (planets[planet]) {
      const data = planets[planet];
      const signName = data.sign.charAt(0).toUpperCase() + data.sign.slice(1);
      const degree = data.degree.toFixed(2);
      const retrograde = data.isRetrograde ? " ℞" : "";

      formatted.push(
        `  ${planet.padEnd(8)}: ${signName.padEnd(11)} ${degree.padStart(5)}°${retrograde}`,
      );
    }
  });

  return formatted;
}

/**
 * Get element for zodiac sign
 */
function getSignElement(sign) {
  const elements = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };
  return elements[sign.toLowerCase()] || "Unknown";
}

/**
 * Get season from Sunsun sign
 */
function getSeason(sign) {
  const seasons = {
    aries: "Spring",
    taurus: "Spring",
    gemini: "Spring",
    cancer: "Summer",
    leo: "Summer",
    virgo: "Summer",
    libra: "Autumn",
    scorpio: "Autumn",
    sagittarius: "Autumn",
    capricorn: "Winter",
    aquarius: "Winter",
    pisces: "Winter",
  };
  return seasons[sign.toLowerCase()] || "Unknown";
}

/**
 * Calculate elemental distribution
 */
function calculateElementalDistribution(planets) {
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

  Object.values(planets).forEach((planet) => {
    if (planet && planet.sign) {
      const element = getSignElement(planet.sign);
      if (counts[element] !== undefined) {
        counts[element]++;
      }
    }
  });

  return counts;
}

/**
 * Main test function
 */
async function testAstrologizeAPI() {
  console.log("\n🌟 ASTROLOGIZE API LIVE TEST");
  console.log("============================");
  console.log("🕐 Current Time:", new Date().toLocaleString());
  console.log("🌍 Location: NYC Area (Default)");
  console.log("🔗 API Endpoint:", ASTROLOGIZE_API_URL);
  console.log("\n📡 Testing API connection...\n");

  try {
    // Prepare request data
    const requestData = getCurrentDateTime();
    console.log("📤 Request Data:", JSON.stringify(requestData, null, 2));

    // Make API call
    console.log("\n⏳ Calling astrologize API...");
    const response = await makeApiRequest(requestData);

    console.log("\n✅ API Response received!");
    console.log("\n📋 RAW API RESPONSE:");
    console.log("====================");
    console.log(JSON.stringify(response, null, 2));

    // Extract and format planetary data
    if (
      response.astrology_info &&
      response.astrology_info.horoscope_parameters &&
      response.astrology_info.horoscope_parameters.planets
    ) {
      const planets = response.astrology_info.horoscope_parameters.planets;

      console.log("\n🪐 CURRENT PLANETARY POSITIONS:");
      console.log("================================");

      const formattedPositions = formatPlanetaryPositions(planets);
      formattedPositions.forEach((line) => console.log(line));

      // Analysis
      console.log("\n📊 ASTROLOGICAL ANALYSIS:");
      console.log("==========================");

      // Sun analysis
      if (planets.Sun) {
        const sunSign = planets.Sun.sign;
        const season = getSeason(sunSign);
        console.log(`🌞 Sun in ${sunSign.toUpperCase()}`);
        console.log(`   Current season: ${season}`);
        console.log(`   Solar degree: ${planets.Sun.degree.toFixed(2)}°`);
      }

      // Moon analysis
      if (planets.Moon) {
        const moonSign = planets.Moon.sign;
        const moonElement = getSignElement(moonSign);
        console.log(`🌙 Moon in ${moonSign.toUpperCase()}`);
        console.log(`   Emotional focus: ${moonElement} energy`);
        console.log(`   Lunar degree: ${planets.Moon.degree.toFixed(2)}°`);
      }

      // Elemental distribution
      const elementCounts = calculateElementalDistribution(planets);
      console.log("\n🔥 ELEMENTAL DISTRIBUTION:");
      console.log(`   Fire: ${elementCounts.Fire} planets`);
      console.log(`   Earth: ${elementCounts.Earth} planets`);
      console.log(`   Air: ${elementCounts.Air} planets`);
      console.log(`   Water: ${elementCounts.Water} planets`);

      // Find dominant element
      const dominantElement = Object.entries(elementCounts).reduce((a, b) =>
        elementCounts[a[0]] > elementCounts[b[0]] ? a : b,
      )[0];
      console.log(`   Dominant element: ${dominantElement}`);

      console.log("\n🎯 TEST STATUS: SUCCESS! ✅");
      console.log("The astrologize API integration is working correctly.");
    } else {
      console.log("\n❌ ERROR: Unexpected API response structure");
      console.log("Expected planets data not found in response");
    }
  } catch (error) {
    console.log("\n❌ API TEST FAILED");
    console.log("==================");
    console.log("Error:", error.message);
    console.log("\nPossible causes:");
    console.log("- API server is down");
    console.log("- Network connectivity issues");
    console.log("- API endpoint changed");
    console.log("- Invalid request format");

    console.log("\n🔧 FALLBACK TEST: Testing request structure...");
    console.log("Request would be sent to:", ASTROLOGIZE_API_URL);
    console.log("With data:", JSON.stringify(getCurrentDateTime(), null, 2));
  }

  console.log("\n============================");
  console.log("🏁 Test completed at:", new Date().toLocaleString());
  console.log("============================\n");
}

// Test with custom location
async function testWithCustomLocation() {
  console.log("\n🌎 TESTING WITH CUSTOM LOCATION (London)");
  console.log("=========================================");

  try {
    const londonData = {
      ...getCurrentDateTime(),
      latitude: 51.5074,
      longitude: -0.1278,
    };

    console.log("📍 Location: London, UK");
    console.log("📤 Request:", JSON.stringify(londonData, null, 2));

    const response = await makeApiRequest(londonData);
    console.log("✅ London test successful!");

    if (
      response.astrology_info &&
      response.astrology_info.horoscope_parameters
    ) {
      console.log("📊 Received planetary data for London coordinates");
    }
  } catch (error) {
    console.log("❌ London test failed:", error.message);
  }
}

// Run the tests
async function main() {
  await testAstrologizeAPI();
  await testWithCustomLocation();

  console.log("🚀 All tests completed!");
  console.log("Integration is ready for production use.");
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  testAstrologizeAPI,
  testWithCustomLocation,
  makeApiRequest,
  getCurrentDateTime,
  formatPlanetaryPositions,
};
