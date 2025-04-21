import React, { useState, useCallback, useEffect } from 'react';
import { UserProfileService } from '../services/user/UserProfileService';
import { UserBirthInfo, UserProfile } from '../types/user';
import { CompositeChart, ChartService } from '../services/ChartService';
import useCurrentChart from '../hooks/useCurrentChart';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { useUser } from '../contexts/UserContext';
import ChartComparison from './ChartComparison';
import { 
  getDefaultElementalProperties, 
  getDefaultAlchemicalValues, 
  calculateEnergeticProperties,
  getDefaultPlanetaryPositions,
  getDominantElement,
  calculateElementalProperties,
  calculateAlchemicalValues,
  getZodiacTarotCard,
  getDecanTarotCard
} from '../utils/componentInitializer';

interface UserProfileFormProps {
  onProfileCreated?: (profile: UserProfile) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onProfileCreated }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  
  // Nutritional goals state
  const [caloriesPerDay, setCaloriesPerDay] = useState<string>('');
  const [proteinPercentage, setProteinPercentage] = useState<string>('');
  const [carbsPercentage, setCarbsPercentage] = useState<string>('');
  const [fatPercentage, setFatPercentage] = useState<string>('');
  const [waterIntakeTarget, setWaterIntakeTarget] = useState<string>('');
  const [showNutritionSection, setShowNutritionSection] = useState<boolean>(false);
  
  // Dietary restrictions state
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compositeChart, setCompositeChart] = useState<CompositeChart | null>(null);
  
  const userProfileService = UserProfileService.getInstance();
  const { currentUser, loadProfile } = useUser();
  
  // Access chart data through hooks
  const { chartData, isLoading: chartLoading } = useCurrentChart();
  const { state, alchemicalValues, planetaryPositions, refreshPlanetaryPositions } = useAlchemical();
  
  // Add a counter to track render cycles
  const [renderCount, setRenderCount] = useState(1);
  
  // New state for showing chart comparison
  const [showChartComparison, setShowChartComparison] = useState(false);
  
  useEffect(() => {
    // Increment render count on each render
    setRenderCount(prev => prev + 1);
    console.log('UserProfileForm rendered:', renderCount);
  });
  
  // Force recalculation of alchemical values if needed
  useEffect(() => {
    const forceRefreshTimeout = setTimeout(() => {
      if (!alchemicalValues || 
          Object.values(alchemicalValues).every(val => val === 0) ||
          !state.elementalProperties ||
          Object.values(state.elementalProperties).every(val => val === 0)) {
        console.log('Forcing recalculation of alchemical values');
        refreshPlanetaryPositions();
      }
    }, 1000); // Wait 1 second before checking
    
    return () => clearTimeout(forceRefreshTimeout);
  }, [alchemicalValues, state.elementalProperties, refreshPlanetaryPositions]);
  
  // Load existing profile if available
  useEffect(() => {
    const loadExistingProfile = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Use the user from context
          setName(currentUser.name || '');
          setBirthDate(currentUser.birthDate || '');
          setBirthTime(currentUser.birthTime || '');
          
          if (currentUser.birthLocation) {
            setLatitude(currentUser.birthLocation.latitude?.toString() || '');
            setLongitude(currentUser.birthLocation.longitude?.toString() || '');
            setCity(currentUser.birthLocation.city || '');
            setCountry(currentUser.birthLocation.country || '');
          }
          
          // Set dietary restrictions if available
          if (currentUser.preferences?.dietaryRestrictions) {
            setDietaryRestrictions(currentUser.preferences.dietaryRestrictions as string[]);
          }
          
          // Set nutritional goals if available
          if (currentUser.nutritionalGoals) {
            const { nutritionalGoals } = currentUser;
            if (nutritionalGoals.caloriesPerDay) setCaloriesPerDay(nutritionalGoals.caloriesPerDay.toString());
            if (nutritionalGoals.proteinPercentage) setProteinPercentage(nutritionalGoals.proteinPercentage.toString());
            if (nutritionalGoals.carbsPercentage) setCarbsPercentage(nutritionalGoals.carbsPercentage.toString());
            if (nutritionalGoals.fatPercentage) setFatPercentage(nutritionalGoals.fatPercentage.toString());
            if (nutritionalGoals.waterIntakeTarget) setWaterIntakeTarget(nutritionalGoals.waterIntakeTarget.toString());
            setShowNutritionSection(true);
          }
          
          // Fetch composite chart for the profile
          const chart = await userProfileService.getCompositeChart(currentUser.id, true);
          if (chart) {
            setCompositeChart(chart);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingProfile();
  }, [currentUser]);
  
  // Toggle nutritional goals section
  const toggleNutritionSection = () => {
    setShowNutritionSection(!showNutritionSection);
  };
  
  // Handle dietary restriction changes
  const handleDietaryRestrictionChange = (restriction: string) => {
    setDietaryRestrictions(current => {
      if (current.includes(restriction)) {
        return current.filter(r => r !== restriction);
      } else {
        return [...current, restriction];
      }
    });
  };
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Convert string values to numbers where needed
      const lat = latitude ? parseFloat(latitude) : undefined;
      const lng = longitude ? parseFloat(longitude) : undefined;
      
      // Create birth location object if coordinates are provided
      const birthLocation = (lat && lng) ? {
        latitude: lat,
        longitude: lng,
        city: city || undefined,
        country: country || undefined
      } : undefined;
      
      let userProfile: UserProfile;
      
      // If we have an existing profile, update it
      if (currentUser) {
        userProfile = userProfileService.updateUserProfile(currentUser.id, {
          name,
          birthDate,
          birthTime: birthTime || undefined,
          birthLocation
        }) || currentUser;
      } else {
        // Otherwise create a new profile
        userProfile = await userProfileService.createUserProfile(name, {
          birthDate,
          birthTime: birthTime || undefined,
          birthLocation
        });
      }
      
      // Add nutritional goals if provided
      if (showNutritionSection && (caloriesPerDay || proteinPercentage || carbsPercentage || fatPercentage || waterIntakeTarget)) {
        const nutritionalGoals = {
          caloriesPerDay: caloriesPerDay ? parseInt(caloriesPerDay) : undefined,
          proteinPercentage: proteinPercentage ? parseInt(proteinPercentage) : undefined,
          carbsPercentage: carbsPercentage ? parseInt(carbsPercentage) : undefined,
          fatPercentage: fatPercentage ? parseInt(fatPercentage) : undefined,
          waterIntakeTarget: waterIntakeTarget ? parseInt(waterIntakeTarget) : undefined,
        };
        
        userProfileService.updateUserProfile(userProfile.id, { 
          nutritionalGoals,
          preferences: {
            ...userProfile.preferences,
            dietaryRestrictions: dietaryRestrictions as any[]
          }
        });
      } else if (dietaryRestrictions.length > 0) {
        // Just update dietary restrictions if nutrition section wasn't shown
        userProfileService.updateUserProfile(userProfile.id, {
          preferences: {
            ...userProfile.preferences,
            dietaryRestrictions: dietaryRestrictions as any[]
          }
        });
      }
      
      // Reload the user profile from context
      loadProfile();
      
      // Get composite chart if birth time is provided
      if (birthTime) {
        const chart = await userProfileService.getCompositeChart(userProfile.id, true);
        setCompositeChart(chart || null);
      }
      
      // Notify parent component if needed
      if (onProfileCreated) {
        onProfileCreated(userProfile);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during profile creation');
      }
      console.error('Profile creation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderElementalBalance = (elementalBalance: Record<string, number>) => {
    if (!elementalBalance || typeof elementalBalance !== 'object') {
      console.error('Invalid elemental balance data:', elementalBalance);
      return <div>Elemental data not available</div>;
    }
    
    return (
      <div className="elemental-balance">
        <div className="elemental-bars">
          {Object.entries(elementalBalance).map(([element, value]) => {
            // Ensure value is a number
            const numValue = typeof value === 'number' ? value : 0;
            
            return (
              <div key={element} className="element-bar-container">
                <div className="element-label">{element}</div>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${(numValue * 100).toFixed(0)}%`,
                      backgroundColor: getElementColor(element)
                    }}
                  />
                </div>
                <div className="element-value">{(numValue * 100).toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const getElementColor = (element: string): string => {
    switch (element.toLowerCase()) {
      case 'fire': return '#ff5722';
      case 'water': return '#2196f3';
      case 'earth': return '#4caf50';
      case 'air': return '#ffeb3b';
      default: return '#9e9e9e';
    }
  };
  
  const renderCompositeChart = () => {
    // Get current birth info and planetary positions
    const birthInfo = currentUser ? {
      birthDate: currentUser.birthDate || '',
      birthTime: currentUser.birthTime || '',
      latitude: currentUser.birthLocation?.latitude,
      longitude: currentUser.birthLocation?.longitude
    } : {
      birthDate: new Date().toISOString().split('T')[0]
    };
    
    const positions = chartData?.planetaryPositions || planetaryPositions || getDefaultPlanetaryPositions();
    
    // Calculate elemental balance
    const elementalBalanceToUse = calculateElementalProperties(birthInfo, positions);
    
    // Calculate alchemical properties
    const alchemicalProps = calculateAlchemicalValues(birthInfo, positions);
    
    // Calculate energetic properties
    const energeticProps = calculateEnergeticProperties(alchemicalProps);
    
    // Determine dominant element
    const dominantElement = getDominantElement(elementalBalanceToUse);
    
    return (
      <div className="composite-chart">
        <h3>Your Chart in the Current Moment</h3>
        
        <div className="chart-details">
          <div className="section">
            <h4>Elemental Balance</h4>
            {renderElementalBalance(elementalBalanceToUse)}
          </div>
          
          <div className="section">
            <h4>Dominant Element</h4>
            <div className="dominant-element">
              {dominantElement}
            </div>
          </div>
          
          <div className="section">
            <h4>Alchemical Properties</h4>
            <div className="properties-grid">
              <div className="property">
                <div className="property-name">Spirit</div>
                <div className="property-value">
                  {alchemicalProps.Spirit.toFixed(2)}
                </div>
              </div>
              <div className="property">
                <div className="property-name">Essence</div>
                <div className="property-value">
                  {alchemicalProps.Essence.toFixed(2)}
                </div>
              </div>
              <div className="property">
                <div className="property-name">Matter</div>
                <div className="property-value">
                  {alchemicalProps.Matter.toFixed(2)}
                </div>
              </div>
              <div className="property">
                <div className="property-name">Substance</div>
                <div className="property-value">
                  {alchemicalProps.Substance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <h4>Energetic Properties</h4>
            <div className="properties-grid">
              <div className="property">
                <div className="property-name">Heat</div>
                <div className="property-value">{energeticProps.Heat.toFixed(2)}</div>
              </div>
              <div className="property">
                <div className="property-name">Entropy</div>
                <div className="property-value">{energeticProps.Entropy.toFixed(2)}</div>
              </div>
              <div className="property">
                <div className="property-name">Reactivity</div>
                <div className="property-value">{energeticProps.Reactivity.toFixed(2)}</div>
              </div>
              <div className="property">
                <div className="property-name">Energy</div>
                <div className="property-value">{energeticProps.Energy.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render profile information
  const renderProfileInfo = () => {
    if (!currentUser) return null;
    
    // Get birth and alchemical data from user profile
    const {
      astrological = {},
      elementalBalance = {},
      tarotProfile = {}
    } = currentUser;

    // Extract data from the composite chart if available
    const birthChart = compositeChart?.birthChart;
    
    // Get chart ruler based on rising sign (virgo = mercury)
    // In a real implementation, this would follow astrological rules for chart rulers
    const chartRuler = astrological?.chartRuler || "Moon";
    const dominantPlanet = astrological?.dominantPlanet || chartRuler;
    const sunSign = astrological?.zodiacSign?.toLowerCase() || 'cancer';
    const risingSign = astrological?.risingSign?.toLowerCase() || 'virgo';
    
    // Calculate birth info for alchemical calculations
    const birthInfo = {
      birthDate: currentUser.birthDate || '',
      birthTime: currentUser.birthTime || '',
      latitude: currentUser.birthLocation?.latitude,
      longitude: currentUser.birthLocation?.longitude
    };
    
    // Get planetary positions from birth chart or use defaults
    const positions = birthChart?.planetaryPositions || getDefaultPlanetaryPositions();
    
    // Calculate elemental balance using alchemizer functions
    const correctedElementalBalance = calculateElementalProperties(birthInfo, positions);
    
    // Calculate percentages for display - use absolute values to handle negative values
    const totalElementalValue = Object.values(correctedElementalBalance)
      .reduce((total, value) => total + Math.abs(value), 0);
    
    const elementalPercentages = Object.entries(correctedElementalBalance).reduce((acc, [key, value]) => {
      // Convert to percentage of total absolute value
      acc[key] = totalElementalValue > 0 ? (Math.abs(value) / totalElementalValue) * 100 : 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate alchemical properties using alchemizer
    const alchemicalProperties = calculateAlchemicalValues(birthInfo, positions);
    
    // Calculate energetic properties from alchemical values
    const energeticProperties = calculateEnergeticProperties(alchemicalProperties);
    
    // Determine tarot cards
    // Birth card based on sun sign
    const birthCard = getZodiacTarotCard(sunSign);
    
    // Decan card based on sun position in sign
    const sunDegree = positions.sun?.degree || 1;
    const birthDecanCard = getDecanTarotCard(sunSign, sunDegree);
    
    // Chart ruler card based on rising sign
    const chartRulerCard = getZodiacTarotCard(chartRuler.toLowerCase());
    
    return (
      <div className="profile-info">
        <h3>Welcome, {currentUser.name}!</h3>
        
        <div className="profile-sections">
          <div className="profile-section astrological-info">
            <h4>Your Astrological Profile</h4>
            
            <div className="info-grid">
              <div className="info-row">
                <div className="info-label">sun Sign:</div>
                <div className="info-value">{sunSign}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Rising Sign:</div>
                <div className="info-value">{risingSign}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Dominant Planet:</div>
                <div className="info-value">{dominantPlanet.toLowerCase()}</div>
              </div>
            </div>
          </div>
          
          <div className="profile-section elemental-section">
            <h4>Birth Elemental Balance</h4>
            <div className="elemental-balance">
              <div className="elemental-bars">
                {Object.entries(elementalPercentages).map(([element, percentage]) => (
                  <div key={element} className="element-bar-container">
                    <div className="element-label">{element}</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          width: `${percentage.toFixed(0)}%`,
                          backgroundColor: getElementColor(element)
                        }}
                      />
                    </div>
                    <div className="element-value">{percentage.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="profile-section tarot-info">
            <h4>Your Tarot Profile</h4>
            
            <div className="info-grid">
              <div className="info-row">
                <div className="info-label">Birth Decan Card:</div>
                <div className="info-value">{birthDecanCard}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Chart Ruler Card:</div>
                <div className="info-value">{chartRulerCard}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Birth Card:</div>
                <div className="info-value">{birthCard}</div>
              </div>
            </div>
          </div>
          
          {/* Show natal chart planets if available */}
          {birthChart && (
            <div className="profile-section natal-planets">
              <h4>Your Natal Planets</h4>
              <div className="planets-grid">
                {Object.entries(birthChart.planetaryPositions || {}).map(([planet, position]) => {
                  // Get sign name from degree
                  const signIndex = Math.floor(position / 30);
                  const signNames = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                                    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
                  const sign = signNames[signIndex] || '';
                  const degree = Math.floor(position % 30);
                  
                  return (
                    <div key={planet} className="planet-row">
                      <div className="planet-name">{planet}:</div>
                      <div className="planet-value">{sign} {degree}°</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Toggle chart comparison display
  const toggleChartComparison = () => {
    setShowChartComparison(!showChartComparison);
  };

  return (
    <div className="user-profile-form">
      {!currentUser ? (
        // Display profile creation form if no user exists
        <div className="profile-creation">
          <h2>Create Your Astrological Profile</h2>
          <p>Enter your birth information to get personalized recommendations based on your astrological profile.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="birthDate">Birth Date:</label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="birthTime">Birth Time (optional):</label>
              <input
                type="time"
                id="birthTime"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
              />
              <div className="hint">
                Birth time allows for a more accurate chart with rising sign and house placements.
              </div>
            </div>
            
            <div className="form-group">
              <label>Birth Location (optional):</label>
              <div className="location-inputs">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              
              <div className="coordinates-inputs">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  step="0.01"
                />
                
                <input
                  type="number"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <button type="button" onClick={toggleNutritionSection}>
                {showNutritionSection ? 'Hide Nutritional Goals' : 'Add Nutritional Goals'}
              </button>
              
              {showNutritionSection && (
                <div className="nutrition-section">
                  <div className="nutrition-inputs">
                    <div className="input-group">
                      <label htmlFor="caloriesPerDay">Daily Calories:</label>
                      <input
                        type="number"
                        id="caloriesPerDay"
                        value={caloriesPerDay}
                        onChange={(e) => setCaloriesPerDay(e.target.value)}
                        placeholder="e.g. 2000"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="proteinPercentage">Protein %:</label>
                      <input
                        type="number"
                        id="proteinPercentage"
                        value={proteinPercentage}
                        onChange={(e) => setProteinPercentage(e.target.value)}
                        placeholder="e.g. 30"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="carbsPercentage">Carbs %:</label>
                      <input
                        type="number"
                        id="carbsPercentage"
                        value={carbsPercentage}
                        onChange={(e) => setCarbsPercentage(e.target.value)}
                        placeholder="e.g. 40"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="fatPercentage">Fat %:</label>
                      <input
                        type="number"
                        id="fatPercentage"
                        value={fatPercentage}
                        onChange={(e) => setFatPercentage(e.target.value)}
                        placeholder="e.g. 30"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="waterIntakeTarget">Water (ml):</label>
                      <input
                        type="number"
                        id="waterIntakeTarget"
                        value={waterIntakeTarget}
                        onChange={(e) => setWaterIntakeTarget(e.target.value)}
                        placeholder="e.g. 2000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Dietary Restrictions:</label>
              <div className="dietary-restrictions">
                {['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree', 'shellfishFree', 'kosher', 'halal'].map(restriction => (
                  <div key={restriction} className="restriction-option">
                    <input
                      type="checkbox"
                      id={restriction}
                      checked={dietaryRestrictions.includes(restriction)}
                      onChange={() => handleDietaryRestrictionChange(restriction)}
                    />
                    <label htmlFor={restriction}>{restriction.charAt(0).toUpperCase() + restriction.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Creating profile...' : 'Create Profile'}
            </button>
            
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      ) : (
        // Display profile info for existing user
        <div className="profile-details">
          {renderProfileInfo()}
          
          <div className="profile-actions">
            <button type="button" onClick={toggleChartComparison} className="chart-toggle-button">
              {showChartComparison ? 'Hide Chart Comparison' : 'Show Chart Comparison'}
            </button>
          </div>
          
          {showChartComparison && <ChartComparison className="profile-chart-comparison" />}
        </div>
      )}
      
      <style jsx>{`
        .user-profile-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .profile-display {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .profile-info {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border-left: 4px solid #4f46e5;
        }
        
        .profile-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .profile-section {
          background: white;
          padding: 1.25rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-top: 3px solid #4f46e5;
        }
        
        .elemental-section {
          border-top-color: #10b981;
        }
        
        .tarot-info {
          border-top-color: #f59e0b;
        }
        
        .natal-planets {
          border-top-color: #3b82f6;
          grid-column: span 2;
        }
        
        .info-grid, .planets-grid {
          display: grid;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .planets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .info-row, .planet-row {
          display: grid;
          grid-template-columns: 40% 60%;
          align-items: center;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.25rem;
        }
        
        .info-label, .planet-name {
          font-weight: 600;
          color: #4b5563;
          text-transform: capitalize;
        }
        
        .info-value, .planet-value {
          color: #1f2937;
          font-weight: 500;
        }
        
        .elemental-balance {
          margin-top: 1rem;
        }
        
        .elemental-bars {
          display: grid;
          gap: 0.75rem;
        }
        
        .element-bar-container {
          display: grid;
          grid-template-columns: 15% 70% 15%;
          align-items: center;
          gap: 0.5rem;
        }
        
        .element-label {
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .bar-container {
          height: 10px;
          background-color: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .bar {
          height: 100%;
          border-radius: 5px;
          transition: width 0.5s ease;
        }
        
        .element-value {
          font-size: 0.875rem;
          text-align: right;
        }
        
        h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.25rem;
        }
        
        h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .composite-chart {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border-left: 4px solid #10b981;
        }
        
        .chart-details {
          display: grid;
          gap: 1.5rem;
          margin-top: 1rem;
          grid-template-columns: repeat(2, 1fr);
        }
        
        .section:nth-child(3), .section:nth-child(4) {
          grid-column: span 2;
        }
        
        .section h4 {
          margin-bottom: 0.75rem;
          color: #374151;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }
        
        .property {
          background: white;
          padding: 0.75rem;
          border-radius: 0.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          text-align: center;
        }
        
        .property-name {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .property-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .dominant-element {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
          text-transform: capitalize;
          text-align: center;
          padding: 1rem;
          background: white;
          border-radius: 0.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .error-message {
          color: #dc2626;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fee2e2;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
          .profile-sections {
            grid-template-columns: 1fr;
          }
          
          .natal-planets {
            grid-column: span 1;
          }
          
          .planets-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .chart-details {
            grid-template-columns: 1fr;
          }
          
          .section:nth-child(3), .section:nth-child(4) {
            grid-column: span 1;
          }
        }
        
        @media (max-width: 640px) {
          .user-profile-form {
            padding: 1rem;
          }
          
          .planets-grid {
            grid-template-columns: 1fr;
          }
          
          .properties-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}; 