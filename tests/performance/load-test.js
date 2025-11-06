// K6 Load Testing for alchm.kitchen Backend Services
// Comprehensive performance testing for production readiness

import http from "k6/http";
import ws from "k6/ws";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const alchemicalCalculationTime = new Trend("alchemical_calculation_time");
const recipeRecommendationTime = new Trend("recipe_recommendation_time");
const authenticationTime = new Trend("authentication_time");

// Test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: "2m", target: 50 }, // Ramp up to 50 users over 2 minutes
    { duration: "5m", target: 100 }, // Stay at 100 users for 5 minutes
    { duration: "3m", target: 200 }, // Ramp up to 200 users over 3 minutes
    { duration: "10m", target: 200 }, // Stay at 200 users for 10 minutes
    { duration: "3m", target: 500 }, // Spike to 500 users over 3 minutes
    { duration: "2m", target: 500 }, // Stay at 500 users for 2 minutes
    { duration: "5m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    // Performance requirements
    http_req_duration: ["p(95)<1000", "p(99)<2000"], // 95% under 1s, 99% under 2s
    http_req_failed: ["rate<0.05"], // Error rate under 5%
    alchemical_calculation_time: ["p(95)<500"], // Alchemical calculations under 500ms
    recipe_recommendation_time: ["p(95)<1000"], // Recipe recommendations under 1s
    authentication_time: ["p(95)<200"], // Authentication under 200ms
  },
};

// Test data
const testIngredients = [
  ["tomato", "basil", "mozzarella"],
  ["chicken", "rice", "soy_sauce"],
  ["pasta", "olive_oil", "garlic"],
  ["salmon", "lemon", "dill"],
  ["beef", "onion", "potato"],
];

const testUsers = [
  { email: "test1@alchm.kitchen", password: "test123" },
  { email: "test2@alchm.kitchen", password: "test123" },
  { email: "test3@alchm.kitchen", password: "test123" },
];

const baseUrl = __ENV.API_BASE_URL || "http://localhost:8000";

// Authentication helper
function authenticate(userIndex = 0) {
  const user = testUsers[userIndex % testUsers.length];

  const authStart = Date.now();
  const authResponse = http.post(
    `${baseUrl}/api/auth/login`,
    JSON.stringify({
      email: user.email,
      password: user.password,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const authDuration = Date.now() - authStart;
  authenticationTime.add(authDuration);

  const authSuccess = check(authResponse, {
    "authentication successful": (r) => r.status === 200,
    "auth response time < 500ms": (r) => r.timings.duration < 500,
  });

  if (!authSuccess) {
    errorRate.add(1);
    return null;
  }

  const authData = JSON.parse(authResponse.body);
  return authData.accessToken;
}

// Main test scenarios
export default function () {
  const userIndex = Math.floor(Math.random() * testUsers.length);

  // Scenario selection (weighted distribution)
  const scenario = Math.random();

  if (scenario < 0.3) {
    // 30% - Guest user scenario (no authentication)
    guestUserScenario();
  } else if (scenario < 0.7) {
    // 40% - Authenticated user scenario
    authenticatedUserScenario(userIndex);
  } else {
    // 30% - Power user scenario (multiple operations)
    powerUserScenario(userIndex);
  }

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

function guestUserScenario() {
  const ingredients =
    testIngredients[Math.floor(Math.random() * testIngredients.length)];

  // 1. Basic elemental calculation
  const calcStart = Date.now();
  const calcResponse = http.post(
    `${baseUrl}/api/alchemical/calculate/elemental`,
    JSON.stringify({ ingredients }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const calcDuration = Date.now() - calcStart;
  alchemicalCalculationTime.add(calcDuration);

  const calcSuccess = check(calcResponse, {
    "elemental calculation successful": (r) => r.status === 200,
    "calculation response time < 1s": (r) => r.timings.duration < 1000,
    "elemental balance returned": (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.Fire && data.Water && data.Earth && data.Air;
      } catch {
        return false;
      }
    },
  });

  if (!calcSuccess) errorRate.add(1);

  // 2. Get planetary hour data
  const planetaryResponse = http.get(
    `${baseUrl}/api/alchemical/planetary/current-hour`,
  );

  check(planetaryResponse, {
    "planetary data retrieved": (r) => r.status === 200,
    "planetary response time < 500ms": (r) => r.timings.duration < 500,
  });

  // 3. Limited recipe recommendations (guest)
  const recStart = Date.now();
  const recResponse = http.post(
    `${baseUrl}/api/kitchen/recommend/recipes`,
    JSON.stringify({
      current_elements: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
      limit: 5,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const recDuration = Date.now() - recStart;
  recipeRecommendationTime.add(recDuration);

  const recSuccess = check(recResponse, {
    "recipe recommendations retrieved": (r) => r.status === 200,
    "recommendation response time < 2s": (r) => r.timings.duration < 2000,
  });

  if (!recSuccess) errorRate.add(1);
}

function authenticatedUserScenario(userIndex) {
  // Authenticate
  const token = authenticate(userIndex);
  if (!token) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const ingredients =
    testIngredients[Math.floor(Math.random() * testIngredients.length)];

  // 1. Advanced elemental calculation
  const calcStart = Date.now();
  const calcResponse = http.post(
    `${baseUrl}/api/alchemical/calculate/elemental`,
    JSON.stringify({
      ingredients,
      weights: [1.0, 0.8, 1.2],
      normalize: true,
    }),
    { headers },
  );

  const calcDuration = Date.now() - calcStart;
  alchemicalCalculationTime.add(calcDuration);

  check(calcResponse, {
    "authenticated calculation successful": (r) => r.status === 200,
    "advanced calc response time < 800ms": (r) => r.timings.duration < 800,
  });

  // 2. Thermodynamics calculation
  const thermoResponse = http.post(
    `${baseUrl}/api/alchemical/calculate/thermodynamics`,
    JSON.stringify({
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.2,
    }),
    { headers },
  );

  check(thermoResponse, {
    "thermodynamics calculation successful": (r) => r.status === 200,
    "thermo response time < 600ms": (r) => r.timings.duration < 600,
  });

  // 3. Personalized recipe recommendations
  const recStart = Date.now();
  const recResponse = http.post(
    `${baseUrl}/api/kitchen/recommend/recipes`,
    JSON.stringify({
      current_elements: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
      cuisine_preferences: ["Italian", "Chinese"],
      dietary_restrictions: ["Vegetarian"],
      limit: 10,
    }),
    { headers },
  );

  const recDuration = Date.now() - recStart;
  recipeRecommendationTime.add(recDuration);

  check(recResponse, {
    "personalized recommendations successful": (r) => r.status === 200,
    "personalized rec response time < 1.5s": (r) => r.timings.duration < 1500,
  });
}

function powerUserScenario(userIndex) {
  // Authenticate
  const token = authenticate(userIndex);
  if (!token) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 1. Multiple ingredient calculations in parallel
  const batchRequests = testIngredients
    .slice(0, 3)
    .map((ingredients) =>
      http.post(
        `${baseUrl}/api/alchemical/calculate/elemental`,
        JSON.stringify({ ingredients }),
        { headers },
      ),
    );

  // 2. Complex recipe search
  const complexRecRequest = http.post(
    `${baseUrl}/api/kitchen/recommend/recipes`,
    JSON.stringify({
      current_elements: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
      cuisine_preferences: ["Italian", "French", "Japanese"],
      dietary_restrictions: ["Vegetarian", "Gluten Free"],
      max_prep_time: 45,
      max_difficulty: 3,
      limit: 20,
    }),
    { headers },
  );

  check(complexRecRequest, {
    "complex recipe search successful": (r) => r.status === 200,
    "complex search response time < 2s": (r) => r.timings.duration < 2000,
  });

  // 3. Get user calculation history (if available)
  const historyResponse = http.get(`${baseUrl}/api/user/calculations/history`, {
    headers,
  });

  check(historyResponse, {
    "user history retrieved": (r) => r.status === 200 || r.status === 404, // 404 is OK if no history
  });
}

// WebSocket connection test
export function websocketTest() {
  const url = `ws://localhost:8001/ws`;

  const res = ws.connect(url, function (socket) {
    socket.on("open", function () {
      console.log("WebSocket connection established");

      // Subscribe to planetary updates
      socket.send(
        JSON.stringify({
          action: "subscribe",
          channel: "planetary_hours",
        }),
      );
    });

    socket.on("message", function (message) {
      const data = JSON.parse(message);
      check(data, {
        "websocket message received": (d) => d !== null,
        "valid message format": (d) => d.channel !== undefined,
      });
    });

    socket.on("error", function (e) {
      console.log("WebSocket error:", e);
      errorRate.add(1);
    });

    // Keep connection open for 30 seconds
    sleep(30);
  });

  check(res, {
    "websocket connection successful": (r) => r && r.status === 101,
  });
}

// Health check scenario
export function healthCheck() {
  const services = [
    `${baseUrl}/health`,
    `${baseUrl.replace("8000", "8100")}/health`, // Kitchen service
  ];

  services.forEach((url) => {
    const response = http.get(url);
    check(response, {
      [`${url} health check passed`]: (r) => r.status === 200,
      [`${url} health response time < 100ms`]: (r) => r.timings.duration < 100,
    });
  });
}

// Stress test specific scenarios
export function stressTest() {
  // Rapid-fire requests to test rate limiting
  for (let i = 0; i < 20; i++) {
    const response = http.get(
      `${baseUrl}/api/alchemical/planetary/current-hour`,
    );
    check(response, {
      "stress test response": (r) => r.status === 200 || r.status === 429, // 429 = rate limited
    });
  }
}
