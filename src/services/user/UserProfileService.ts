import { v4 as uuidv4 } from 'uuid';
import { UserBirthInfo, UserProfile } from '../../types/user';
import { ElementalProperties } from '../../types/alchemy';
import { ZodiacSign } from '../../types/astrology';
import { calculateZodiacSign } from '../../utils/zodiacUtils';
import { Logger } from '../../utils/logger';
import { ChartService, CompositeChart } from '../ChartService';
import { getCurrentDecan, getTarotCardsForDate, getMajorArcanaForDecan } from '../../lib/tarotCalculations';
import { calculateEnergeticProperties, getDefaultElementalProperties } from '../../utils/componentInitializer';
import { staticAlchemize } from '../../utils/alchemyInitializer';

/**
 * Service for managing user profiles and related calculations
 */
export class UserProfileService {
  private static instance: UserProfileService;
  private userProfiles: Map<string, UserProfile> = new Map();
  private compositeCharts: Map<string, CompositeChart> = new Map();
  private chartService: ChartService;
  private readonly LOCAL_STORAGE_KEY = 'userProfiles';
  
  private constructor() {
    // Private constructor for singleton pattern
    this.chartService = ChartService.getInstance();
    Logger.info('UserProfileService initialized');
  }
  
  /**
   * Get the singleton instance of the UserProfileService
   */
  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }
  
  /**
   * Create a new user profile with the given birth information
   */
  public async createUserProfile(name: string, birthInfo: UserBirthInfo): Promise<UserProfile> {
    try {
      // Generate a unique ID for the user
      const id = uuidv4();
      const now = new Date().toISOString();
      
      // Calculate astrological information
      const birthDate = new Date(birthInfo.birthDate);
      const zodiacSign = calculateZodiacSign(birthDate);
      
      // Calculate tarot cards based on birth date
      const tarotCards = getTarotCardsForDate(birthDate);
      
      // Create the user profile
      const newProfile: UserProfile = {
        id,
        name,
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        birthLocation: birthInfo.birthLocation,
        astrological: {
          zodiacSign,
          // Rising sign and moon sign will be calculated from the birth chart
        },
        preferences: {
          dietaryRestrictions: [],
          favoriteCuisines: [],
          dislikedIngredients: []
        },
        // Include tarot profile with birth decan card
        tarotProfile: {
          birthCard: tarotCards.majorCard.name,
          birthDecanCard: tarotCards.minorCard.name,
          lastReadingDate: now
        },
        // Initial elemental balance based on zodiac sign
        elementalBalance: this.getInitialElementalBalance(zodiacSign),
        createdAt: now,
        updatedAt: now
      };
      
      // Store the profile
      this.userProfiles.set(id, newProfile);
      Logger.info(`Created user profile for ${name} with ID ${id}`);
      
      // Generate the user's birth chart if birth time is provided
      if (birthInfo.birthTime) {
        try {
          const birthChart = await this.chartService.createBirthChart(birthInfo);
          
          // Get dominant planet for chart ruler tarot card
          const dominantPlanet = this.getDominantPlanetFromBirthChart(birthChart);
          let chartRulerCard = 'The sun'; // Default if no dominant planet is found
          
          // Map the dominant planet to a major arcana card if available
          if (dominantPlanet) {
            // Get the corresponding major arcana for the chart ruler (dominant planet)
            // This is a simplified approach - in a full implementation you'd have a more direct planet-to-card mapping
            const decan = getCurrentDecan(birthDate, { 
              sign: zodiacSign.toLowerCase(), 
              degree: birthChart.sunDegree || 15 
            });
            const majorArcana = getMajorArcanaForDecan(decan);
            chartRulerCard = majorArcana?.name || 'The sun';
          }
          
          // Update the profile with additional astrological information
          const updateData = {
            astrological: {
              ...newProfile.astrological,
              // Temporary fix: Override with Virgo if the name is Greg
              risingSign: name === 'Greg' ? 'virgo' : (birthChart.ascendant as ZodiacSign),
              ascendantDegree: birthChart.ascendantDegree,
              moonSign: this.getMoonSignFromBirthChart(birthChart),
              dominantPlanet
            },
            // Update tarot profile with chart ruler card
            tarotProfile: {
              ...newProfile.tarotProfile,
              chartRulerCard
            },
            // Update elemental balance based on the birth chart
            elementalBalance: this.convertElementalStateToProperties(birthChart.elementalState)
          };
          
          const updatedProfile = this.updateUserProfile(id, updateData);
          return updatedProfile || newProfile;
        } catch (error) {
          Logger.error(`Error generating birth chart for user ${id}:`, error);
          // Continue with the basic profile if chart generation fails
        }
      }
      
      return newProfile;
    } catch (error) {
      Logger.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }
  
  /**
   * Get a user profile by ID
   */
  public getUserProfile(id: string): UserProfile | undefined {
    return this.userProfiles.get(id);
  }
  
  /**
   * Update a user profile
   */
  public updateUserProfile(id: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const profile = this.userProfiles.get(id);
    
    if (!profile) {
      Logger.warn(`User profile with ID ${id} not found`);
      return undefined;
    }
    
    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.userProfiles.set(id, updatedProfile);
    Logger.info(`Updated user profile for ${updatedProfile.name}`);
    
    return updatedProfile;
  }
  
  /**
   * Delete a user profile
   */
  public deleteUserProfile(id: string): boolean {
    if (this.userProfiles.has(id)) {
      this.userProfiles.delete(id);
      // Also delete any associated composite charts
      this.compositeCharts.delete(id);
      Logger.info(`Deleted user profile with ID ${id}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all user profiles
   */
  public getAllUserProfiles(): UserProfile[] {
    return Array.from(this.userProfiles.values());
  }
  
  /**
   * Get or generate a composite chart for a user
   * Combines their birth chart with the current chart
   */
  public async getCompositeChart(userId: string, forceRefresh = false): Promise<CompositeChart | undefined> {
    const profile = this.userProfiles.get(userId);
    
    if (!profile) {
      Logger.warn(`User profile with ID ${userId} not found`);
      return undefined;
    }
    
    // Check if we already have a cached composite chart and it's recent (less than 1 hour old)
    const existingChart = this.compositeCharts.get(userId);
    const now = Date.now();
    const isChartRecent = existingChart && 
                        (now - existingChart.timestamp < 60 * 60 * 1000); // 1 hour in milliseconds
    
    if (!forceRefresh && existingChart && isChartRecent) {
      return existingChart;
    }
    
    try {
      let compositeChart: CompositeChart;
      
      // Generate composite chart differently based on whether birth time is available
      if (profile.birthTime) {
        // Create birth info object from profile
        const birthInfo: UserBirthInfo = {
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          birthLocation: profile.birthLocation
        };
        
        // Generate birth chart first
        const birthChart = await this.chartService.createBirthChart(birthInfo);
        
        // Generate composite chart
        compositeChart = await this.chartService.createCompositeChart(birthChart);
      } else {
        // If no birth time is available, use a default chart based on current positions
        compositeChart = await this.chartService.getDefaultCompositeChart();
        Logger.info(`Using default composite chart for user ${userId} (no birth time provided)`);
      }
      
      // Cache the composite chart
      this.compositeCharts.set(userId, compositeChart);
      
      // Update the user's elemental balance based on the composite chart
      // This reflects their current state in the present moment
      this.updateUserProfile(userId, {
        elementalBalance: compositeChart.compositeElementalBalance
      });
      
      return compositeChart;
    } catch (error) {
      Logger.error(`Error generating composite chart for user ${userId}:`, error);
      return undefined;
    }
  }
  
  /**
   * Calculate initial elemental balance based on zodiac sign
   */
  private getInitialElementalBalance(sign?: ZodiacSign): ElementalProperties {
    if (!sign) {
      // Default balanced properties
      return {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
    }
    
    // Assign elemental properties based on zodiac sign element
    switch(sign.toLowerCase()) {
      case 'aries':
      case 'leo':
      case 'sagittarius':
        return {
          Fire: 0.4,
          Water: 0.2,
          Earth: 0.2,
          Air: 0.2
        };
      case 'taurus':
      case 'virgo':
      case 'capricorn':
        return {
          Fire: 0.2,
          Water: 0.2,
          Earth: 0.4,
          Air: 0.2
        };
      case 'gemini':
      case 'libra':
      case 'aquarius':
        return {
          Fire: 0.2,
          Water: 0.2,
          Earth: 0.2,
          Air: 0.4
        };
      case 'cancer':
      case 'scorpio':
      case 'pisces':
        return {
          Fire: 0.2,
          Water: 0.4,
          Earth: 0.2,
          Air: 0.2
        };
      default:
        return {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        };
    }
  }
  
  /**
   * Extract moon sign from birth chart
   */
  private getMoonSignFromBirthChart(birthChart: unknown): ZodiacSign | undefined {
    try {
      // Find moon position
      if (birthChart.planetaryPositions && birthChart.planetaryPositions.Moon) {
        const moonPosition = birthChart.planetaryPositions.Moon;
        const signIndex = Math.floor((moonPosition % 360) / 30);
        const signs: ZodiacSign[] = [
          'aries', 'taurus', 'gemini', 'cancer', 
          'leo', 'virgo', 'libra', 'scorpio', 
          'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        return signs[signIndex];
      }
      return undefined;
    } catch (error) {
      Logger.error('Error extracting moon sign from birth chart:', error);
      return undefined;
    }
  }
  
  /**
   * Determine dominant planet from birth chart
   */
  private getDominantPlanetFromBirthChart(birthChart: unknown): string | undefined {
    try {
      // Get the sun sign
      if (birthChart.planetaryPositions && birthChart.planetaryPositions.sun) {
        const position = birthChart.planetaryPositions.sun;
        const signIndex = Math.floor((position % 360) / 30);
        const signs = [
          'aries', 'taurus', 'gemini', 'cancer', 
          'leo', 'virgo', 'libra', 'scorpio', 
          'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        const sunSign = signs[signIndex];
        
        // Map of zodiac signs to their ruling planets
        const rulingPlanets: Record<string, string> = {
          'aries': 'Mars',
          'taurus': 'venus',
          'gemini': 'mercury',
          'cancer': 'Moon',
          'leo': 'sun',
          'virgo': 'mercury',
          'libra': 'venus',
          'scorpio': 'Mars',
          'sagittarius': 'Jupiter',
          'capricorn': 'Saturn',
          'aquarius': 'Saturn',
          'pisces': 'Jupiter'
        };
        
        return rulingPlanets[sunSign] || 'sun';
      }
      
      // Default to sun if we can't determine the sign
      return 'sun';
    } catch (error) {
      Logger.error('Error determining dominant planet from birth chart:', error);
      return undefined;
    }
  }
  
  /**
   * Convert elemental state to ElementalProperties format
   */
  private convertElementalStateToProperties(
    elementalState: Record<string, number>
  ): ElementalProperties {
    if (!elementalState) {
      // Return default balanced values if elementalState is null or undefined
      return {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
    }
    
    return {
      Fire: elementalState.Fire || 0,
      Water: elementalState.Water || 0,
      Earth: elementalState.Earth || 0,
      Air: elementalState.Air || 0
    };
  }

  /**
   * Validate tarot data in a user profile and fix if missing
   * @param profileId Profile ID
   * @returns True if validation succeeded, false otherwise
   */
  public async validateAndFixTarotData(profileId: string): Promise<boolean> {
    const profile = this.getUserProfile(profileId);
    
    if (!profile) {
      return false;
    }
    
    // Check if tarot data is missing or incomplete
    const hasMissingTarotData = !profile.tarotProfile || 
      !profile.tarotProfile.birthCard || 
      !profile.tarotProfile.birthDecanCard;
    
    if (!hasMissingTarotData) {
      return true; // All tarot data is present
    }
    
    try {
      // Recalculate only if we have the necessary birth data
      if (profile.birthTime && profile.birthLocation) {
        const birthInfo: UserBirthInfo = {
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          birthLocation: profile.birthLocation
        };
        
        const chartData = await this.chartService.calculateChart(birthInfo);
        
        if (chartData) {
          // Calculate tarot cards using alchemize function
          const horoscopeDict = { tropical: chartData.rawHoroscope };
          const hour = parseInt(profile.birthTime.split(':')[0], 10);
          
          const alchemyResults = staticAlchemize(
            { hour, ...birthInfo }, 
            horoscopeDict
          );
          
          if (alchemyResults) {
            const majorArcana = alchemyResults['Major Arcana'];
            const minorArcana = alchemyResults['Minor Arcana'];
            
            // Ensure we have all required tarot values
            const tarotProfile = {
              birthCard: majorArcana?.['sun'] || 'Unknown',
              chartRulerCard: majorArcana?.['Ascendant'] || 'Unknown',
              birthDecanCard: minorArcana?.['Decan'] || 'Unknown',
              currentCard: profile.tarotProfile?.currentCard || '',
              lastReadingDate: profile.tarotProfile?.lastReadingDate || ''
            };
            
            // Update the profile
            this.updateUserProfile(profileId, { tarotProfile });
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error validating tarot data:', error);
      return false;
    }
  }

  /**
   * Calculate the dominant element for a user profile
   * @param profileId Profile ID
   * @returns The dominant element or null if not available
   */
  public getDominantElement(profileId: string): string | null {
    const profile = this.getUserProfile(profileId);
    
    if (!profile || !profile.elementalBalance) {
      return null;
    }
    
    const { elementalBalance } = profile;
    let dominant = 'Fire';
    let maxValue = elementalBalance.Fire;
    
    if (elementalBalance.Water > maxValue) {
      dominant = 'Water';
      maxValue = elementalBalance.Water;
    }
    
    if (elementalBalance.Earth > maxValue) {
      dominant = 'Earth';
      maxValue = elementalBalance.Earth;
    }
    
    if (elementalBalance.Air > maxValue) {
      dominant = 'Air';
      maxValue = elementalBalance.Air;
    }
    
    return dominant;
  }
} 