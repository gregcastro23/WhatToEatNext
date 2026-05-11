/**
 * Script to provision Historical Agents as 'Agentic Users' in the Alchm.kitchen Postgres database.
 * Fetches the dynamic profile data from the Planetary Agents backend and upserts a User record.
 * 
 * Usage:
 *   bun run scripts/sync-agentic-users.ts
 */

import { executeQuery, closeDatabase } from '../src/lib/database/connection.js';
import crypto from 'crypto';

const PLANETARY_BACKEND_URL = process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || 'http://localhost:8000';

async function main() {
  console.log(`Starting Agentic User Sync...`);
  console.log(`Fetching from: ${PLANETARY_BACKEND_URL}/api/agents/diet-profiles`);

  try {
    const res = await fetch(`${PLANETARY_BACKEND_URL}/api/agents/diet-profiles`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.profiles)) {
      throw new Error('Invalid response payload from Planetary Agents backend.');
    }

    const profiles = data.profiles;
    console.log(`Successfully fetched ${profiles.length} agent profiles. Processing...`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const agent of profiles) {
      const email = `${agent.agentId}@agents.alchm.kitchen`.toLowerCase();
      const name = agent.name;
      
      // Default preferences for agents
      const preferences = {
        dietaryRestrictions: [],
        preferredCuisines: [agent.historicalDiet?.culturalCuisine].filter(Boolean),
        spicePreference: 'medium',
        complexity: 'moderate',
        dislikedIngredients: agent.historicalDiet?.avoidedFoods || []
      };

      // Construct the comprehensive user profile JSON
      const userProfile = {
        name,
        title: agent.title,
        era: agent.era,
        historicalDiet: agent.historicalDiet,
        alchemicalState: agent.alchemicalState,
        contextBlueprint: agent.contextBlueprint,
        natalChart: {
          birthData: agent.birthData
        }
      };

      // Check if agent user exists
      const checkRes = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);
      
      if (checkRes.rows.length === 0) {
        // Insert new agent user
        // Generate a random password hash since they don't log in via traditional means
        const mockPasswordHash = crypto.randomBytes(32).toString('hex');

        await executeQuery(`
          INSERT INTO users (email, password_hash, role, is_active, is_agent, profile, preferences, email_verified, login_count)
          VALUES ($1, $2, 'ALCHEMIST', true, true, $3, $4, true, 0)
        `, [
          email,
          mockPasswordHash,
          JSON.stringify(userProfile),
          JSON.stringify(preferences)
        ]);
        insertedCount++;
        console.log(`Inserted agent: ${name}`);
      } else {
        // Update existing agent user
        await executeQuery(`
          UPDATE users 
          SET profile = $1, preferences = $2, is_agent = true, role = 'ALCHEMIST', is_active = true
          WHERE email = $3
        `, [
          JSON.stringify(userProfile),
          JSON.stringify(preferences),
          email
        ]);
        updatedCount++;
        console.log(`Updated agent: ${name}`);
      }
    }

    console.log(`Sync complete! Inserted: ${insertedCount}, Updated: ${updatedCount}`);

  } catch (error) {
    console.error('Error syncing agentic users:', error);
  } finally {
    await closeDatabase();
  }
}

main().catch(console.error);
