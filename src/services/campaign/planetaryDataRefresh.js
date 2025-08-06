#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Planetary Data Refresh System
 * Updates planetary positions and validates astrological calculations
 */

class PlanetaryDataRefresh {
  constructor(options = {}) {
    this.validateTransitDates = options.validateTransitDates !== false;
    this.updateCache = options.updateCache !== false;
    this.generateReport = options.generateReport !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async refreshPlanetaryData() {
    console.log('🌟 Starting planetary data refresh...');
    
    try {
      // Get current planetary positions
      const positions = await this.getCurrentPlanetaryPositions();
      
      // Validate transit dates
      if (this.validateTransitDates) {
        await this.validateTransitDates(positions);
      }
      
      // Update cache
      if (this.updateCache) {
        await this.updatePositionCache(positions);
      }
      
      // Generate report
      if (this.generateReport) {
        await this.generateRefreshReport(positions);
      }
      
      console.log('✅ Planetary data refresh completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Planetary data refresh failed:', error.message);
      await this.handleRefreshError(error);
      return false;
    }
  }

  async getCurrentPlanetaryPositions() {
    console.log('🔍 Fetching current planetary positions...');
    
    try {
      // Try to use the reliable astronomy utility
      const reliableAstronomyPath = path.join(process.cwd(), 'src/utils/reliableAstronomy.ts');
      
      if (fs.existsSync(reliableAstronomyPath)) {
        // Use Node.js to execute TypeScript (requires ts-node or compilation)
        const { execSync } = require('child_process');
        
        // Create a temporary script to get positions
        const tempScript = `
const { getReliablePlanetaryPositions } = require('./src/utils/reliableAstronomy');

async function getPositions() {
  try {
    const positions = await getReliablePlanetaryPositions();
    console.log(JSON.stringify(positions, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getPositions();
`;
        
        const tempPath = path.join(process.cwd(), 'temp-planetary-fetch.js');
        fs.writeFileSync(tempPath, tempScript);
        
        try {
          const output = execSync(`node ${tempPath}`, { 
            encoding: 'utf8',
            timeout: 30000 // 30 second timeout
          });
          
          fs.unlinkSync(tempPath);
          return JSON.parse(output);
          
        } catch (execError) {
          fs.unlinkSync(tempPath);
          throw execError;
        }
      } else {
        // Fallback to basic API call
        return await this.fetchFromAPI();
      }
      
    } catch (error) {
      console.warn('⚠️ Primary fetch failed, using fallback positions');
      return this.getFallbackPositions();
    }
  }

  async fetchFromAPI() {
    // Simple API fetch implementation
    const apiEndpoints = [
      // astronomia API removed
      'https://ssd.jpl.nasa.gov/api/horizons.api'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint, {
          timeout: 10000,
          headers: {
            'User-Agent': 'WhatToEatNext-PlanetaryRefresh/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return this.normalizeAPIResponse(data);
        }
      } catch (error) {
        console.warn(`⚠️ API ${endpoint} failed:`, error.message);
      }
    }
    
    throw new Error('All API endpoints failed');
  }

  normalizeAPIResponse(data) {
    // Normalize different API response formats to our standard format
    const normalized = {};
    
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    
    planets.forEach(planet => {
      if (data[planet]) {
        normalized[planet] = {
          sign: data[planet].sign || 'aries',
          degree: data[planet].degree || 0,
          exactLongitude: data[planet].longitude || data[planet].exactLongitude || 0,
          isRetrograde: data[planet].retrograde || false
        };
      }
    });
    
    return normalized;
  }

  getFallbackPositions() {
    // Return the reliable March 28, 2025 positions as fallback
    return {
      sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
      moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
      mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
      venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
      mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
      jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
      saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
      uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
      neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
      pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
      northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
      southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true }
    };
  }

  async validateTransitDates(positions) {
    console.log('🔍 Validating transit dates...');
    
    const validationResults = {};
    const currentDate = new Date();
    
    for (const [planet, position] of Object.entries(positions)) {
      try {
        const isValid = await this.validatePlanetTransit(planet, currentDate, position.sign);
        validationResults[planet] = {
          valid: isValid,
          currentSign: position.sign,
          degree: position.degree
        };
        
        if (!isValid) {
          console.warn(`⚠️ Transit validation failed for ${planet} in ${position.sign}`);
        }
        
      } catch (error) {
        console.warn(`⚠️ Could not validate ${planet}:`, error.message);
        validationResults[planet] = { valid: false, error: error.message };
      }
    }
    
    const validCount = Object.values(validationResults).filter(r => r.valid).length;
    const totalCount = Object.keys(validationResults).length;
    
    console.log(`✅ Transit validation: ${validCount}/${totalCount} planets validated`);
    
    return validationResults;
  }

  async validatePlanetTransit(planet, date, sign) {
    try {
      const planetDataPath = path.join(process.cwd(), 'src/data/planets', `${planet.toLowerCase()}.ts`);
      
      if (!fs.existsSync(planetDataPath)) {
        console.warn(`⚠️ No transit data file for ${planet}`);
        return false;
      }
      
      // Read and parse the planet data file
      const planetDataContent = fs.readFileSync(planetDataPath, 'utf8');
      
      // Extract TransitDates using regex (simple approach)
      const transitDatesMatch = planetDataContent.match(/TransitDates:\s*{([^}]+)}/s);
      
      if (!transitDatesMatch) {
        console.warn(`⚠️ No TransitDates found in ${planet} data`);
        return false;
      }
      
      // Parse the transit dates (simplified parsing)
      const transitSection = transitDatesMatch[1];
      const signMatch = transitSection.match(new RegExp(`${sign}:\\s*{[^}]*Start:\\s*['"]([^'"]+)['"][^}]*End:\\s*['"]([^'"]+)['"]`, 'i'));
      
      if (!signMatch) {
        console.warn(`⚠️ No transit data for ${planet} in ${sign}`);
        return false;
      }
      
      const startDate = new Date(signMatch[1]);
      const endDate = new Date(signMatch[2]);
      
      return date >= startDate && date <= endDate;
      
    } catch (error) {
      console.warn(`⚠️ Error validating ${planet} transit:`, error.message);
      return false;
    }
  }

  async updatePositionCache(positions) {
    console.log('💾 Updating position cache...');
    
    try {
      const cacheDir = path.join(process.cwd(), '.kiro', 'planetary-cache');
      
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      const cacheData = {
        timestamp: new Date().toISOString(),
        positions: positions,
        source: 'daily-refresh',
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
      };
      
      const cachePath = path.join(cacheDir, 'current-positions.json');
      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
      
      // Also create a dated backup
      const backupPath = path.join(cacheDir, `positions-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(cacheData, null, 2));
      
      console.log('✅ Position cache updated');
      
    } catch (error) {
      console.error('❌ Failed to update cache:', error.message);
    }
  }

  async generateRefreshReport(positions) {
    console.log('📊 Generating refresh report...');
    
    try {
      const report = {
        timestamp: new Date().toISOString(),
        refreshType: 'daily-scheduled',
        positions: positions,
        statistics: {
          totalPlanets: Object.keys(positions).length,
          retrogradeCount: Object.values(positions).filter(p => p.isRetrograde).length,
          signDistribution: this.calculateSignDistribution(positions)
        },
        validation: await this.validateTransitDates(positions),
        nextRefresh: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      const reportDir = path.join(process.cwd(), 'logs', 'planetary-reports');
      
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const reportPath = path.join(reportDir, `planetary-refresh-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      // Also update the latest report
      const latestPath = path.join(reportDir, 'latest-refresh.json');
      fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
      
      console.log(`📊 Refresh report generated: ${reportPath}`);
      
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
    }
  }

  calculateSignDistribution(positions) {
    const distribution = {};
    
    Object.values(positions).forEach(position => {
      const sign = position.sign;
      distribution[sign] = (distribution[sign] || 0) + 1;
    });
    
    return distribution;
  }

  async handleRefreshError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      type: 'planetary-data-refresh-error'
    };
    
    const errorLogPath = path.join(process.cwd(), 'logs', 'planetary-errors.log');
    const logsDir = path.dirname(errorLogPath);
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.appendFileSync(errorLogPath, JSON.stringify(errorLog) + '\n');
    
    console.log('📝 Error logged for review');
  }
}

// Main execution function
async function refreshPlanetaryData() {
  const refresher = new PlanetaryDataRefresh({
    validateTransitDates: true,
    updateCache: true,
    generateReport: true
  });
  
  return await refresher.refreshPlanetaryData();
}

// Run if called directly
if (require.main === module) {
  refreshPlanetaryData().catch(console.error);
}

module.exports = { PlanetaryDataRefresh, refreshPlanetaryData };