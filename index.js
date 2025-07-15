// index.js

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add this new endpoint for planetary data
app.post('/planetary-data', async (request, response) => {
  console.log('\nindex.js >>> REQUEST -> /planetary-data');
  console.log('request.body', request.body);
  
  try {
    const { datetime, latitude, longitude } = request.body;
    
    // Use your existing AstrologicalService to get planet positions
    const astroService = new AstrologicalService();
    const planetaryAlignment = astroService.calculatePlanetaryAlignment(
      new Date(datetime),
      latitude,
      longitude
    );
    
    // Use your AlchemicalEngine to calculate the alchemical properties
    const { AlchemicalEngineBase } = require('./src/lib/alchemicalEngine');
    const alchemicalEngine = new AlchemicalEngineBase();
    const isDaytime = isDay(new Date(datetime), latitude, longitude);
    const alchemicalProperties = alchemicalEngine.calculateProperties(
      planetaryAlignment,
      isDaytime
    );
    
    response.json({
      planetaryAlignment,
      alchemicalProperties
    });
  } catch (error) {
    console.error('Error calculating planetary data:', error);
    response.status(500).json({ error: 'Failed to calculate planetary data' });
  }
});

// Import the AstrologicalService
const { AstrologicalService } = require('./src/services/AstrologicalService');

// Helper function to determine if it's day or night
function isDay(datetime, latitude, longitude) {
  // Implementation would depend on your requirements
  // Basic example: 6 AM to 6 PM is daytime
  const hour = datetime.getHours();
  return hour >= 6 && hour < 18;
}

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS enabled');
  console.log('Morgan logging enabled');
  console.log('Helmet security enabled');
  console.log('JSON parsing enabled');
  console.log('URL-encoded parsing enabled');
  console.log('Error handling middleware enabled');
});

export default app;