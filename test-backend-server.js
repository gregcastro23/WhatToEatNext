#!/usr/bin/env node
/**
 * Test Backend Server for alchm.kitchen API Integration
 * Simulates backend services for validation without Python/FastAPI setup
 */

const http = require('http');
const url = require('url');

// Mock data and responses
const mockElementalResponse = {
  Fire: 0.3,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.2
};

const mockThermodynamicsResponse = {
  heat: 0.7,
  entropy: 0.3,
  reactivity: 0.8,
  gregsEnergy: 85.5,
  equilibrium: 0.6
};

const mockPlanetaryResponse = {
  current_time: new Date().toISOString(),
  dominant_planet: "Mars",
  influence_strength: 0.8,
  all_influences: {
    Sun: 0.6,
    Moon: 0.4,
    Mercury: 0.3,
    Venus: 0.5,
    Mars: 0.8,
    Jupiter: 0.4,
    Saturn: 0.2
  }
};

const mockRecipeRecommendations = {
  recommendations: [
    {
      recipe: {
        id: "fiery_dragon_stir_fry",
        name: "Fiery Dragon Stir Fry",
        cuisine: "Chinese",
        prep_time: 15,
        difficulty: 3
      },
      score: 0.92,
      match_reasons: ["High fire energy matches current Mars planetary hour", "Balances elemental composition"]
    },
    {
      recipe: {
        id: "cooling_lunar_salad",
        name: "Cooling Lunar Cucumber Salad",
        cuisine: "Mediterranean",
        prep_time: 10,
        difficulty: 1
      },
      score: 0.78,
      match_reasons: ["Cooling water energy", "Quick preparation"]
    }
  ],
  total_count: 2,
  request_context: {
    timestamp: new Date().toISOString(),
    algorithm_version: "1.0.0"
  }
};

// Alchemical Core Service (Port 8000)
const alchemicalServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`🔬 Alchemical Core: ${req.method} ${req.url}`);

  if (parsedUrl.pathname === '/calculate/elemental' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify(mockElementalResponse));
  } else if (parsedUrl.pathname === '/calculate/thermodynamics' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify(mockThermodynamicsResponse));
  } else if (parsedUrl.pathname === '/planetary/current-hour' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockPlanetaryResponse));
  } else if (parsedUrl.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy', service: 'alchemical-core', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Kitchen Intelligence Service (Port 8100)
const kitchenServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`🍳 Kitchen Intelligence: ${req.method} ${req.url}`);

  if (parsedUrl.pathname === '/recommend/recipes' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify(mockRecipeRecommendations));
  } else if (parsedUrl.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy', service: 'kitchen-intelligence', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start servers
alchemicalServer.listen(8000, () => {
  console.log('🔬 Alchemical Core Service running on http://localhost:8000');
  console.log('   • Health: http://localhost:8000/health');
  console.log('   • Elemental: POST http://localhost:8000/calculate/elemental');
  console.log('   • Planetary: GET http://localhost:8000/planetary/current-hour');
});

kitchenServer.listen(8100, () => {
  console.log('🍳 Kitchen Intelligence Service running on http://localhost:8100');
  console.log('   • Health: http://localhost:8100/health');
  console.log('   • Recipes: POST http://localhost:8100/recommend/recipes');
});

console.log('');
console.log('🎯 Backend services ready for frontend integration testing!');
console.log('🔗 Test with: curl http://localhost:8000/health');
console.log('🛑 Stop with: Ctrl+C');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend services...');
  alchemicalServer.close();
  kitchenServer.close();
  process.exit(0);
});