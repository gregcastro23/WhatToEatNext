// index.js

const express = require('express');
const next = require('next');
const path = require('path');
const cors = require('cors');

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Server state
let currentState = {
  season: getCurrentSeason(),
  currentTime: new Date(),
  popups: []
};

// Helper functions
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getMealPeriod(hour) {
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
}

nextApp.prepare().then(() => {
  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      currentSeason: currentState.season
    });
  });

  // Recipe Routes
  app.get('/api/recipes', (req, res) => {
    try {
      const { cuisine, mealType, season } = req.query;
      const currentHour = new Date().getHours();
      const currentMealPeriod = getMealPeriod(currentHour);

      // Return filtered recipes (placeholder)
      res.json({
        filters: { cuisine, mealType, season },
        currentMeal: currentMealPeriod,
        recipes: []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // State Management Routes
  app.get('/api/state', (req, res) => {
    res.json({
      ...currentState,
      currentMeal: getMealPeriod(new Date().getHours())
    });
  });

  app.post('/api/state', (req, res) => {
    try {
      currentState = {
        ...currentState,
        ...req.body,
        lastUpdated: new Date()
      };
      res.json(currentState);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Popup Management Routes
  app.post('/api/popup', (req, res) => {
    try {
      const { message, options = {} } = req.body;
      const id = Date.now();
      const popup = {
        id,
        message,
        createdAt: new Date(),
        ...options
      };
      
      currentState.popups.push(popup);
      
      // Auto-remove popup after duration
      setTimeout(() => {
        currentState.popups = currentState.popups.filter(p => p.id !== id);
      }, options.duration || 3000);

      res.json(popup);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/popup/:id', (req, res) => {
    try {
      const { id } = req.params;
      currentState.popups = currentState.popups.filter(p => p.id !== parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // WebSocket support for real-time updates (if needed)
  if (process.env.ENABLE_WEBSOCKET === 'true') {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server: app });
    
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        // Handle WebSocket messages
      });
    });
  }

  // Handle Next.js requests
  app.get('*', (req, res) => {
    return handle(req, res);
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: dev ? err.message : 'Something went wrong'
    });
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`\n🌟 Server running on http://localhost:${PORT}`);
    console.log('\n📍 Available API endpoints:');
    console.log('- GET  /api/health');
    console.log('- GET  /api/recipes');
    console.log('- GET  /api/state');
    console.log('- POST /api/state');
    console.log('- POST /api/popup');
    console.log('- DELETE /api/popup/:id');
  });
});

module.exports = app;