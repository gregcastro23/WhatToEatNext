import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import Redis from 'ioredis';
import { 
  formatRailwayResponse, 
  calculateLocally 
} from './lib/astrology-utils.js';
import { 
  parseRailwayResponse, 
  PlanetaryRequestSchema 
} from '../lib/validation/railway.js';

const app = new Hono();

// Redis setup for caching - optional for local development
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
if (!redis) console.warn('[Hono] REDIS_URL not set. Caching is DISABLED.');

app.use('*', logger());
app.use('*', cors());

const RAILWAY_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || RAILWAY_URL || 'http://localhost:8000';

app.get('/health', (c) => c.json({ status: 'ok', service: 'hono-gateway', redis: !!redis, timestamp: new Date().toISOString() }));

/**
 * API: Astrologize (Hybrid with Redis Caching)
 * Migrated from Next.js API route to Hono for performance and unified stack.
 */
app.post('/api/astrologize', zValidator('json', PlanetaryRequestSchema), async (c) => {
  const params = c.req.valid('json');
  
  // Create a stable cache key including all relevant parameters
  const cacheKey = `astrology:pos:${params.year}:${params.month}:${params.date || params.day}:${params.hour}:${params.minute}:${params.latitude?.toFixed(2)}:${params.longitude?.toFixed(2)}:${params.zodiacSystem}`;
  
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Hono] Cache hit for ${cacheKey}`);
        const result = JSON.parse(cached);
        result.cache = 'hit';
        return c.json(result);
      }
    } catch (err) {
      console.error('[Hono] Redis error:', err);
    }
  }

  let result;
  
  // 1. Try Python backend for high-precision pyswisseph
  try {
    console.log(`[Hono] Calling Python backend at ${PYTHON_BACKEND_URL}/internal/astrology/positions`);
    const response = await fetch(`${PYTHON_BACKEND_URL}/internal/astrology/positions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify({
        year: params.year,
        month: params.month,
        day: params.date ?? params.day,
        hour: params.hour,
        minute: params.minute,
        latitude: params.latitude,
        longitude: params.longitude,
        zodiacSystem: params.zodiacSystem
      }),
      signal: AbortSignal.timeout(10000),
    });
    
    if (response.ok) {
      const raw = await response.json();
      const railwayData = parseRailwayResponse(raw);
      if (railwayData) {
        result = formatRailwayResponse(railwayData, params);
        result.source = 'hono-python-swisseph';
      }
    } else {
      console.warn(`[Hono] Python backend returned ${response.status}`);
    }
  } catch (err) {
    console.error('[Hono] Python backend failed, falling back to local:', err instanceof Error ? err.message : 'Unknown error');
  }

  // 2. Fallback to local astronomy-engine if Python fails
  if (!result) {
    console.log('[Hono] Using local astronomy-engine fallback');
    result = calculateLocally(params);
    result.source = 'hono-local-astronomy-engine';
  }

  // 3. Cache the result for 1 hour (3600s)
  if (redis && result) {
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    } catch (err) {
      console.error('[Hono] Failed to set cache:', err);
    }
  }

  return c.json(result);
});

/**
 * API: Outer Planet Epoch Echoes
 * specialized endpoint for finding historical dates of similar planetary positions.
 */
const epochSchema = z.object({
  planet: z.enum(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),
  target_longitude: z.number(),
  max_lookback_years: z.number().optional().default(200),
});

app.post('/api/astrology/outer-epochs', zValidator('json', epochSchema), async (c) => {
  const body = c.req.valid('json');
  const cacheKey = `astrology:epochs:${body.planet}:${body.target_longitude.toFixed(4)}`;
  
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached);
        result.cache = 'hit';
        return c.json(result);
      }
    } catch (err) {
      console.error('[Hono] Redis error:', err);
    }
  }

  try {
    console.log(`[Hono] Fetching outer-epochs for ${body.planet} at ${body.target_longitude}°`);
    const response = await fetch(`${PYTHON_BACKEND_URL}/internal/astrology/outer-epochs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) throw new Error(`Python microservice returned ${response.status}`);
    
    const data = await response.json();
    
    // Cache outer planet epochs for 30 days as they are extremely stable
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400 * 30);
      } catch (err) {
         console.error('[Hono] Failed to set cache:', err);
      }
    }
    
    return c.json(data);
  } catch (err) {
    console.error('[Hono] Epoch calculation failed:', err);
    return c.json({ 
      error: 'Failed to calculate epoch echoes', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

const port = Number(process.env.PORT) || 3001;
console.log(`🚀 Alchm.kitchen Hono API Gateway running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
