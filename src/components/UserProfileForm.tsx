<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { UserProfileService } from "../services/user/UserProfileService";
import { useCurrentChart } from "../hooks/useCurrentChart";
import { useAlchemical } from "../contexts/AlchemicalContext/hooks";
import { useUser } from "../contexts/UserContext";
import ChartComparison from "../components/ChartComparison";
import { ElementalProperties } from "../types/elementalProperties";
import { UserBirthInfo } from "../types/user";
import { createLogger } from "../utils/logger";

const logger = createLogger('UserProfileForm');

// Define the UserProfile interface with proper typing
interface UserProfile {
  id: string;
  name: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  astrological?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    dominantPlanet?: string;
    elementalDistribution?: {
      fire: number;
      water: number;
      earth: number;
      air: number;
    };
  };
  preferences?: {
    dietaryRestrictions?: string[];
    cuisinePreferences?: string[];
    alchemicalPreferences?: {
      preferredElement?: string;
      avoidedElement?: string;
    };
  };
  nutritionalGoals?: {
    caloriesPerDay?: number;
    proteinPercentage?: number;
    carbsPercentage?: number;
    fatPercentage?: number;
    waterIntakeTarget?: number;
  };
  elementalBalance?: ElementalProperties;
  alchemicalValues?: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
    heat?: number;
    entropy?: number;
    reactivity?: number;
    energy?: number;
  };
}

// Define validation error interface for form fields
interface ValidationErrors {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  city?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  caloriesPerDay?: string;
  proteinPercentage?: string;
  carbsPercentage?: string;
  fatPercentage?: string;
  waterIntakeTarget?: string;
}

interface UserProfileFormProps {
  onProfileCreated?: (profile: UserProfile) => void;
  initialData?: UserProfile | null;
  onSave?: (formData: any) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  onProfileCreated, 
  initialData, 
  onSave 
}) => {
  // User profile form state
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [showNutritionSection, setShowNutritionSection] = useState(false);
  const [caloriesPerDay, setCaloriesPerDay] = useState("");
  const [proteinPercentage, setProteinPercentage] = useState("");
  const [carbsPercentage, setCarbsPercentage] = useState("");
  const [fatPercentage, setFatPercentage] = useState("");
  const [waterIntakeTarget, setWaterIntakeTarget] = useState("");
  const [compositeChart, setCompositeChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showChartComparison, setShowChartComparison] = useState(false);
  const [culinaryRecommendations, setCulinaryRecommendations] = useState<{
    ingredients: string[], 
    cuisines: string[], 
    cookingMethods: string[], 
    seasonalSuggestions: string[]
  } | null>(null);
  const [showCulinaryRecommendations, setShowCulinaryRecommendations] = useState(false);

  // Services and hooks
  const userProfileService = UserProfileServicegetInstance();
  const { currentUser, loadProfile } = useUser();
  
  // Access chart data through hooks
  const { chartData, isLoading: chartLoading } = useCurrentChart();
  const { state, refreshPlanetaryPositions } = useAlchemical();

  // Force recalculation of alchemical values if needed
  useEffect(() => {
    const forceRefreshTimeout = setTimeout(() => {
      if (!stateelementalState || Objectvalues(stateelementalState).every(val => val === 0)) {
        loggerinfo('Forcing recalculation of alchemical values');
        refreshPlanetaryPositions();
      }
    }, 5000); // Wait 5 seconds after mount to do this check
    
    return () => clearTimeout(forceRefreshTimeout);
  }, [stateelementalState, refreshPlanetaryPositions]);

  // Load existing profile if available
  useEffect(() => {
    const loadExistingProfile = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Use the user from context
          setName(currentUsername || "");
          setBirthDate(currentUserbirthDate || "");
          setBirthTime(currentUserbirthTime || "");
          
          if (currentUserbirthLocation) {
            setLatitude(currentUserbirthLocation.latitude?.toString() || "");
            setLongitude(currentUserbirthLocation.longitude?.toString() || "");
            setCity(currentUserbirthLocation.city || "");
            setCountry(currentUserbirthLocation.country || "");
          }
          
          // Set dietary restrictions if available
          if (currentUserpreferences?.dietaryRestrictions) {
            setDietaryRestrictions(currentUserpreferences.dietaryRestrictions);
          }
          
          // Set nutritional goals if available
          if (currentUsernutritionalGoals) {
            const { nutritionalGoals } = currentUser;
            if (nutritionalGoalscaloriesPerDay) setCaloriesPerDay(nutritionalGoalscaloriesPerDay.toString());
            if (nutritionalGoalsproteinPercentage) setProteinPercentage(nutritionalGoalsproteinPercentage.toString());
            if (nutritionalGoalscarbsPercentage) setCarbsPercentage(nutritionalGoalscarbsPercentage.toString());
            if (nutritionalGoalsfatPercentage) setFatPercentage(nutritionalGoalsfatPercentage.toString());
            if (nutritionalGoalswaterIntakeTarget) setWaterIntakeTarget(nutritionalGoalswaterIntakeTarget.toString());
            setShowNutritionSection(true);
          }
          
          // Fetch composite chart for the profile
          if (currentUserid) {
            const chart = await userProfileServicegetCompositeChart(currentUserid, true);
            if (chart) {
              setCompositeChart(chart);
            }
            
            // Get culinary recommendations
            const recommendations = await userProfileServicegetCulinaryRecommendations(currentUserid);
            if (recommendations) {
              setCulinaryRecommendations(recommendations);
              setShowCulinaryRecommendations(true);
            }
          }
        }
      } catch (error) {
        loggererror('Error loading profile:', error);
        setError('Failed to load your profile. Please try again.');
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

  // Toggle culinary recommendations section
  const toggleCulinaryRecommendations = () => {
    setShowCulinaryRecommendations(!showCulinaryRecommendations);
  };

  // Handle dietary restriction changes
  const handleDietaryRestrictionChange = (restriction: string) => {
    setDietaryRestrictions(current => {
      if (currentincludes(restriction)) {
        return currentfilter(r => r !== restriction);
      } else {
        return [...current, restriction];
      }
    });
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Required field validation
    if (!nametrim()) {
      errorsname = 'Name is required';
    }
    
    // Date validation
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      
      if (birthDateObj > today) {
        errorsbirthDate = 'Birth date cannot be in the future';
      }
      
      // Check for valid date format
      if (isNaN(birthDateObjgetTime())) {
        errorsbirthDate = 'Please enter a valid date';
      }
      
      // Check if date is too far in the past (eg., more than 120 years)
      const minDate = new Date();
      minDatesetFullYear(minDategetFullYear() - 120);
      
      if (birthDateObj < minDate) {
        errorsbirthDate = 'Birth date seems too far in the past';
      }
    }
    
    // Time validation if provided
    if (birthTime) {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegextest(birthTime)) {
        errorsbirthTime = 'Please enter a valid time in 24-hour format (HH:MM)';
      }
    }
    
    // Coordinate validation
    if (latitude && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
      errorslatitude = 'Latitude must be a number between -90 and 90';
    }
    
    if (longitude && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
      errorslongitude = 'Longitude must be a number between -180 and 180';
    }
    
    // City and country validation
    if (city && citytrim().length < 2) {
      errorscity = 'City name is too short';
    }
    
    if (country && countrytrim().length < 2) {
      errorscountry = 'Country name is too short';
    }
    
    // Nutritional goals validation
    if (showNutritionSection) {
      if (caloriesPerDay && (isNaN(Number(caloriesPerDay)) || Number(caloriesPerDay) <= 0)) {
        errorscaloriesPerDay = 'Calories must be a positive number';
      }
      
      if (proteinPercentage && (isNaN(Number(proteinPercentage)) || Number(proteinPercentage) < 0 || Number(proteinPercentage) > 100)) {
        errorsproteinPercentage = 'Protein percentage must be between 0 and 100';
      }
      
      if (carbsPercentage && (isNaN(Number(carbsPercentage)) || Number(carbsPercentage) < 0 || Number(carbsPercentage) > 100)) {
        errorscarbsPercentage = 'Carbs percentage must be between 0 and 100';
      }
      
      if (fatPercentage && (isNaN(Number(fatPercentage)) || Number(fatPercentage) < 0 || Number(fatPercentage) > 100)) {
        errorsfatPercentage = 'Fat percentage must be between 0 and 100';
      }
      
      if (waterIntakeTarget && (isNaN(Number(waterIntakeTarget)) || Number(waterIntakeTarget) <= 0)) {
        errorswaterIntakeTarget = 'Water intake must be a positive number';
      }
      
      // Check if macronutrient percentages add up to 100 (if all are provided)
      if (proteinPercentage && carbsPercentage && fatPercentage) {
        const total = Number(proteinPercentage) + Number(carbsPercentage) + Number(fatPercentage);
        if (total !== 100) {
          errorsproteinPercentage = 'Macronutrient percentages must add up to 100%';
        }
      }
    }
    
    // Update validation errors state
    setValidationErrors(errors);
    
    // Form is valid if there are no errors
    return Objectkeys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e: ReactFormEvent) => {
    epreventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Process form data
      loggerinfo("Submitting user profile form...");
      
      // In a real implementation, this would save to your API
      if (onSave) {
        const formData = {
          name,
          birthDate,
          birthTime,
          birthLocation: {
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            city,
            country
          },
          preferences: {
            dietaryRestrictions
          },
          nutritionalGoals: showNutritionSection ? {
            caloriesPerDay: caloriesPerDay ? Number(caloriesPerDay) : undefined,
            proteinPercentage: proteinPercentage ? Number(proteinPercentage) : undefined,
            carbsPercentage: carbsPercentage ? Number(carbsPercentage) : undefined,
            fatPercentage: fatPercentage ? Number(fatPercentage) : undefined,
            waterIntakeTarget: waterIntakeTarget ? Number(waterIntakeTarget) : undefined
          } : undefined
        };
        
        await onSave(formData);
      }
      
      loggerinfo("User profile saved successfully");
    } catch (error) {
      loggererror('Error saving profile:', error);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get color based on element
  const getElementColor = (element: string): string => {
    const colors: Record<string, string> = {
      fire: '#FF5722',
      water: '#2196F3',
      earth: '#8BC34A',
      air: '#FFEB3B'
    };
    
    return colors[elementtoLowerCase()] || '#9E9E9E';
  };

  return (
    <div className="user-profile-form" data-testid="user-profile-form">
      <h2>{currentUser?.id ? 'Edit Your Profile' : 'Create Your Profile'}</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${validationErrorsname ? 'has-error' : ''}`}>
          <label htmlFor="name">Name <span className="required">*</span></label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(etarget.value)} 
            required 
            className="form-control"
            aria-describedby={validationErrorsname ? "name-error" : undefined}
          />
          {validationErrorsname && (
            <div className="error-message" id="name-error">{validationErrorsname}</div>
          )}
        </div>
        
        <div className={`form-group ${validationErrorsbirthDate ? 'has-error' : ''}`}>
          <label htmlFor="birthDate">Birth Date</label>
          <input 
            type="date" 
            id="birthDate" 
            value={birthDate} 
            onChange={(e) => setBirthDate(etarget.value)} 
            className="form-control"
            aria-describedby={validationErrorsbirthDate ? "birthDate-error" : undefined}
          />
          {validationErrorsbirthDate && (
            <div className="error-message" id="birthDate-error">{validationErrorsbirthDate}</div>
          )}
        </div>
        
        <div className={`form-group ${validationErrorsbirthTime ? 'has-error' : ''}`}>
          <label htmlFor="birthTime">Birth Time (optional)</label>
          <input 
            type="time" 
            id="birthTime" 
            value={birthTime} 
            onChange={(e) => setBirthTime(etarget.value)} 
            className="form-control"
            aria-describedby={validationErrorsbirthTime ? "birthTime-error" : undefined}
          />
          {validationErrorsbirthTime && (
            <div className="error-message" id="birthTime-error">{validationErrorsbirthTime}</div>
          )}
        </div>
        
        <div className="form-group">
          <h3>Dietary Preferences</h3>
          <div className="dietary-restrictions">
            <label className="form-label">Select any dietary restrictions that apply:</label>
            <div className="restriction-options">
              {[
                'vegan', 'vegetarian', 'pescatarian', 'gluten-free', 'dairy-free', 
                'keto', 'paleo', 'low-carb', 'low-fat', 'low-sodium', 'nut-free'
              ].map(restriction => (
                <div key={restriction} className="form-check">
                  <input 
                    type="checkbox" 
                    id={`restriction-${restriction}`} 
                    checked={dietaryRestrictionsincludes(restriction)} 
                    onChange={() => handleDietaryRestrictionChange(restriction)} 
                    className="form-check-input"
                  />
                  <label htmlFor={`restriction-${restriction}`} className="form-check-label">
                    {restrictioncharAt(0).toUpperCase() + restrictionslice(1).replace(/-/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <button 
            type="button" 
            onClick={toggleNutritionSection} 
            className="btn btn-outline-secondary"
          >
            {showNutritionSection ? 'Hide Nutritional Goals' : 'Add Nutritional Goals'}
          </button>
        </div>
        
        {showNutritionSection && (
          <div className="nutrition-section">
            <h3>Nutritional Goals</h3>
            
            <div className={`form-group ${validationErrorscaloriesPerDay ? 'has-error' : ''}`}>
              <label htmlFor="caloriesPerDay">Calories per Day</label>
              <input 
                type="number" 
                id="caloriesPerDay" 
                value={caloriesPerDay} 
                onChange={(e) => setCaloriesPerDay(etarget.value)} 
                min="0" 
                className="form-control"
                aria-describedby={validationErrorscaloriesPerDay ? "calories-error" : undefined}
              />
              {validationErrorscaloriesPerDay && (
                <div className="error-message" id="calories-error">{validationErrorscaloriesPerDay}</div>
              )}
            </div>
            
            <div className={`form-group ${validationErrorsproteinPercentage ? 'has-error' : ''}`}>
              <label htmlFor="proteinPercentage">Protein (%)</label>
              <input 
                type="number" 
                id="proteinPercentage" 
                value={proteinPercentage} 
                onChange={(e) => setProteinPercentage(etarget.value)} 
                min="0" 
                max="100" 
                className="form-control"
                aria-describedby={validationErrorsproteinPercentage ? "protein-error" : undefined}
              />
              {validationErrorsproteinPercentage && (
                <div className="error-message" id="protein-error">{validationErrorsproteinPercentage}</div>
              )}
            </div>
            
            <div className={`form-group ${validationErrorscarbsPercentage ? 'has-error' : ''}`}>
              <label htmlFor="carbsPercentage">Carbs (%)</label>
              <input 
                type="number" 
                id="carbsPercentage" 
                value={carbsPercentage} 
                onChange={(e) => setCarbsPercentage(etarget.value)} 
                min="0" 
                max="100" 
                className="form-control"
                aria-describedby={validationErrorscarbsPercentage ? "carbs-error" : undefined}
              />
              {validationErrorscarbsPercentage && (
                <div className="error-message" id="carbs-error">{validationErrorscarbsPercentage}</div>
              )}
            </div>
            
            <div className={`form-group ${validationErrorsfatPercentage ? 'has-error' : ''}`}>
              <label htmlFor="fatPercentage">Fat (%)</label>
              <input 
                type="number" 
                id="fatPercentage" 
                value={fatPercentage} 
                onChange={(e) => setFatPercentage(etarget.value)} 
                min="0" 
                max="100" 
                className="form-control"
                aria-describedby={validationErrorsfatPercentage ? "fat-error" : undefined}
              />
              {validationErrorsfatPercentage && (
                <div className="error-message" id="fat-error">{validationErrorsfatPercentage}</div>
              )}
            </div>
            
            <div className={`form-group ${validationErrorswaterIntakeTarget ? 'has-error' : ''}`}>
              <label htmlFor="waterIntakeTarget">Water Intake Target (ml)</label>
              <input 
                type="number" 
                id="waterIntakeTarget" 
                value={waterIntakeTarget} 
                onChange={(e) => setWaterIntakeTarget(etarget.value)} 
                min="0" 
                className="form-control"
                aria-describedby={validationErrorswaterIntakeTarget ? "water-error" : undefined}
              />
              {validationErrorswaterIntakeTarget && (
                <div className="error-message" id="water-error">{validationErrorswaterIntakeTarget}</div>
              )}
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || !name} 
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : currentUser?.id ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
      
      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default UserProfileForm;
=======
import React;
import ,..,/services/,user  from 'UserProfileService '
import {
import {
import useCurrentChart from '..,/hooks/,useCurrentChart,ZodiacSign.";""
import ,..,/contexts/,AlchemicalContext  from 'hooks '
import { "useUser" } from ',..,/contexts/,UserContext,ZodiacSign.",""
import ChartComparison from './ChartComparison,ZodiacSign.';
import { "ZodiacSign" } from ',..,/types/,constants,ZodiacSign.",""
import {
} from '..,/utils/,componentInitializer,ZodiacSign.",""
interface UserProfileFormProps {
  // Fixed empty interface
  [key: string]: unknown;
}
  // Fixed empty interface
  [key: string]: unknown;
}
  // Fixed empty interface
  [key: string]: unknown;
}
  // Fixed empty interface
  [key: string]: unknown;
}
  onProfileCreated?: (profile: UserProfile) ={'{,any,>:}'} void;: },ZodiacSign.",""
export const UserProfileForm;
const [dietaryRestrictions;
const [error;
  const userProfileService = UserProfileService.getInstance();
  const { "currentUser", ",loadProfile" } = useUser();ZodiacSign.",""
  // Access chart data through hooks
  const { "chartData", ,isLoading: chartLoading } = useCurrentChart()""
const {
  // Add a counter to track render cycles
  const [renderCount, "setRenderCount", string]: = useState(1);ZodiacSign.",""
  // New state for showing chart comparison
  const [showChartComparison, "setShowChartComparison", string]: = useState(false);ZodiacSign.",""
  useEffect(() ={'{',>'}'} { // Increment render count on each render,ZodiacSign.",""
setRenderCount(prev ={})
  
  // Force recalculation of alchemical values if needed
  useEffect(() ={'{',>'}'} {''
    const forceRefreshTimeout = setTimeout(() ={'{',>'}'} { if (!state.elementalState ||,ZodiacSign.",""
          Object.values(state.elementalState).every(val => val === 0)) {
        console.log('Forcing recalculation of alchemical values',)''
        refreshPlanetaryPositions()
      }
    }, 5000); // Wait 5 seconds after mount to do this check
    
return () ={
  // Load existing profile if available
  useEffect(() ={'{',>'}'} {''
    const loadExistingProfile = async () ={'{',>'}'} {''
      setLoading(true)
      try {
        if (currentUser) {
          // Use the user from context
          setName(currentUser.name || ')''
          setBirthDate(currentUser.birthDate || ')''
          setBirthTime(currentUser.birthTime || ')''
          if (currentUser.birthLocation) {
            setLatitude(currentUser.birthLocation.latitude?.toString() || ')''
            setLongitude(currentUser.birthLocation.longitude?.toString() || ')''
            setCity(currentUser.birthLocation.city || ')''
            setCountry(currentUser.birthLocation.country || ',);: }: // Set dietary restrictions if available,ZodiacSign.",""
          if (currentUser.preferences?.dietaryRestrictions) {
            setDietaryRestrictions(currentUser.preferences.dietaryRestrictions as string[index: string]:]);ZodiacSign.',''
          }
          
          // Set nutritional goals if available
          if (currentUser.nutritionalGoals) {
            const { "nutritionalGoals" } = currentUser;ZodiacSign.",""
            if (nutritionalGoals.caloriesPerDay) setCaloriesPerDay(nutritionalGoals.caloriesPerDay.toString())
            if (nutritionalGoals.proteinPercentage) setProteinPercentage(nutritionalGoals.proteinPercentage.toString())
            if (nutritionalGoals.carbsPercentage) setCarbsPercentage(nutritionalGoals.carbsPercentage.toString())
            if (nutritionalGoals.fatPercentage) setFatPercentage(nutritionalGoals.fatPercentage.toString())
            if (nutritionalGoals.waterIntakeTarget) setWaterIntakeTarget(nutritionalGoals.waterIntakeTarget.toString())
            setShowNutritionSection(true)
          }
          
          // Fetch composite chart for the profile
          let chart = await userProfileService.getCompositeChart(currentUser.id, true);
          if (chart) {
            setCompositeChart(chart)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)''
      } finally {
        setLoading(false)
      }
    }
    
    loadExistingProfile()
  }, [currentUser: string]:)
  
  // Toggle nutritional goals section
  const toggleNutritionSection = () ={'{',>'}'} {''
    setShowNutritionSection(!showNutritionSection)
  }
  
  // Handle dietary restriction changes
  const handleDietaryRestrictionChange = (restriction: string) ={'{',>'}'} {''
    setDietaryRestrictions(current ={'{',>'}'} {''
      if (current.includes(restriction)) {
        return current.filter(r ={'{',>'}'} r !== restriction)''
      } else {
        return [...current, "restriction", string]:;ZodiacSign.",""
      }
    })
  }
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) ={'{',>'}'} {''
    e.preventDefault()
    setLoading(true)
    setError(')''
    try {
      // Convert string values to numbers where needed
      const lat = latitude ? parseFloat(latitude) : undefined;
      const lng = longitude ? parseFloat(longitude) : undefined;
      
      // Create birth location object if coordinates are provided
const birthLocation = (lat && lng) ? {
      } : undefined
      
      let userProfile: UserProfile;
      
      // If we have an existing profile, update it
      if (currentUser) {
userProfile = userProfileService.updateUserProfile(currentUser.id
      } else {
        // Otherwise create a new profile
userProfile = await userProfileService.createUserProfile(name
      }
      
      // Add nutritional goals if provided
      if (showNutritionSection && (caloriesPerDay || proteinPercentage || carbsPercentage || fatPercentage || waterIntakeTarget)) {
const nutritionalGoals = {
        }
        
userProfileService.updateUserProfile(userProfile.id
} else if (dietaryRestrictions.length {
      }
      
      // Reload the user profile from context
      loadProfile()
      
      // Get composite chart if birth time is provided
      if (birthTime) {
        const chart = await userProfileService.getCompositeChart(userProfile.id, true);
        setCompositeChart(chart || null)
      }
      
      // Notify parent component if needed
      if (onProfileCreated) {
        onProfileCreated(userProfile)
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
setError(
    } finally {
      setLoading(false)
    }
  }
  
const renderElementalBalance = (elementalBalance;
    if (!elementalBalance || typeof elementalBalance !== 'object,) {: console.error(',Invalid elemental balance data:', elementalBalance);ZodiacSign.",""
return {
    return (
{
            const numValue = typeof value ===, 'number ? value : 0;: return (,ZodiacSign.",""
{
                    className=bar:""
style={{ backgroundColor: getElementColor(element)""
                    }} / ({ || 1)'{',>'}'}''
                </div{'{',>'}'}''
{
              </div{'{',>'}'}''
            )
          })}
        </div{'{',>'}'}''
      </div{'{',>'}'}''
    )
  }
  
  const getElementColor = (element: string): string ={'{',>'}'} {''
    switch (element.toLowerCase()) {
case
      default: return '#9e9e9e,: },ZodiacSign.",""
  }
  
  const renderCompositeChart = () ={'{',>'}'} { // Get current birth info and planetary positions,ZodiacSign.",""
let birthInfo = currentUser ? { longitude: currentUser.birthLocation?.longitude""
    } : { birthDate: new Date().toISOString().split(',T',)[0: string]:,ZodiacSign.",""
    }
    
    let positions = planetaryPositions || getDefaultPlanetaryPositions();
    
    // Calculate elemental balance
    const elementalBalanceToUse = calculateElementalProperties(birthInfo, positions);
    
    // Calculate alchemical properties
    const alchemicalProps = calculateAlchemicalValues(birthInfo, positions);
    
    // Calculate energetic properties
    const energeticProps = calculateEnergeticProperties(alchemicalProps);
    
    // Determine dominant element
    const dominantElement = getDominantElement(elementalBalanceToUse);
    
    return (
{
{
          </div{'{',>'}'}''
{
{
            </div{'{',>'}'}''
          </div{'{',>'}'}''
{
{
                </div{'{',>'}'}''
              </div{'{',>'}'}''
{
                </div{'{',>'}'}''
              </div{'{',>'}'}''
{
                </div{'{',>'}'}''
              </div{'{',>'}'}''
{
                </div{'{',>'}'}''
              </div{'{',>'}'}''
            </div{'{',>'}'}''
          </div{'{',>'}'}''
{
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
            </div{'{',>'}'}''
          </div{'{',>'}'}''
        </div{'{',>'}'}'</div{'{',>'}'})''
  }
  
  // Render profile information
  const renderProfileInfo = () ={'{',>'}'} {''
    if (!currentUser) return null
    
    // Get birth and alchemical data from user profile
    const {
      astrological = {}
      elementalBalance = {}
      tarotProfile = {}
    } = currentUser

    // Extract data from the composite chart if available
    const birthChart = compositeChart?.birthChart;
    
    // Get chart ruler based on rising sign (virgo = mercury)
    // In a real implementation, this would follow astrological rules for chart rulers
    const chartRuler = "moon;""
    const dominantPlanet = astrological?.dominantPlanet || chartRuler;
    const sunSign = astrological?.zodiacSign?.toLowerCase() || ZodiacSign.Cancer;
    const risingSign = astrological?.risingSign?.toLowerCase() || ZodiacSign.Virgo;
    
    // Calculate birth info for alchemical calculations
const birthInfo = { longitude: currentUser.birthLocation?.longitude""
    }
    
    // Get planetary positions from birth chart or use defaults
    const positions = birthChart?.planetaryPositions || getDefaultPlanetaryPositions();
    
    // Calculate elemental balance using alchemizer functions
    const correctedElementalBalance = calculateElementalProperties(birthInfo, positions);
    
    // Calculate percentages for display - use absolute values to handle negative values
    const totalElementalValue = Object.values(correctedElementalBalance);
.reduce((total
      acc[index: string]:key] = totalElementalValue {',{',>'}'} 0 ? (Math.abs(value) / (totalElementalValue || 1)) * 100 : 0''
      return acc
}
    const alchemicalProperties = calculateAlchemicalValues(birthInfo, positions);
    
    // Calculate energetic properties from alchemical values
    const energeticProperties = calculateEnergeticProperties(alchemicalProperties);
    
    // Determine tarot cards
    // Birth card based on sun sign
    const birthCard = getZodiacTarotCard(sunSign);
    
    // Decan card based on sun position in sign
    const sunDegree = (positions.sun as)?.degree || 1;
    const birthDecanCard = getDecanTarotCard(sunSign, sunDegree);
    
    // Chart ruler card based on rising sign
    const chartRulerCard = getZodiacTarotCard(chartRuler.toLowerCase());
    
    return (
{
{
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
            </div{'{',>'}'}''
          </div{'{',>'}'}''
{
{
{
                        className=bar:""
style={{ backgroundColor: getElementColor(element)""
                        }} / ({ || 1)'{',>'}'}''
                    </div{'{',>'}'}''
{
                  </div{'{',>'}'},: ))},ZodiacSign.","
              </div{'{',>'}'}''
            </div{'{',>'}'}''
          </div{'{',>'}'}''
{
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
{
              </div{'{',>'}'}''
            </div{'{',>'}'}''
          </div{'{',>'}'},: {/* Show natal chart planets if available */}: {birthChart && (,ZodiacSign.",""
{
{
                {Object.entries(birthChart.planetaryPositions || {}).map(([planet, "position", string]:) ={',{',>'}'} { // Get sign name from degree,ZodiacSign.",""
                  const signIndex = Math.floor(position / (30 || 1));
                  const signNames = [ZodiacSign.Aries, ZodiacSign.Taurus, ZodiacSign.Gemini, ZodiacSign.Cancer, ZodiacSign.Leo, ZodiacSign.Virgo, ;
                                    ZodiacSign.Libra, ZodiacSign.Scorpio, ZodiacSign.Sagittarius, ZodiacSign.Capricorn, ZodiacSign.Aquarius, ZodiacSign.Pisces: string]:
                  const sign = signNames[index: string]:signIndex] || ;ZodiacSign.',''
                  const degree = Math.floor(position % 30);
                  
return ({})}
              </div{'{',>'}'}''
            </div{'{',>'}'},: )},ZodiacSign.",""
        </div{'{',>'}'}''
      </div{'{',>'}'}''
    )
  }

  // Toggle chart comparison display
  const toggleChartComparison = () ={'{',>'}'} {''
    setShowChartComparison(!showChartComparison)
  }

  return (
{
{
{
{
{
                type="text""
                id="name""
                value="name",ZodiacSign.",""
                onChange={(e) ={'{',>'}'} setName(e.target.value)}''
                placeholder="Your name,: required""
              /{'{',>'}'}''
            </div{'{',>'}'}''
{
                type="date""
                id="birthDate""
                value="birthDate",ZodiacSign.",""
                onChange={(e) ={'{',>'}'} setBirthDate(e.target.value)},: required,ZodiacSign.",""
              /{'{',>'}'}''
            </div{'{',>'}'}''
{
                type="time""
                id="birthTime""
                value="birthTime",ZodiacSign.",""
                onChange={(e) ={'{',>'}'} setBirthTime(e.target.value)}''
              /{'{',>'}'}''
{
              </div{'{',>'}'}''
            </div{'{',>'}'}''
{
{
                  type="text""
                  placeholder="City""
                  value="city",ZodiacSign.",""
                  onChange={(e) ={'{',>'}'} setCity(e.target.value)}''
                /{'{',>'}'}''
                {'{',<'}'}input''
                  type="text""
                  placeholder="Country""
                  value="country",ZodiacSign.",""
                  onChange={(e) ={'{',>'}'} setCountry(e.target.value)}''
                /{'{',>'}'}''
              </div{'{',>'}'}''
{
                  type="number""
                  placeholder="Latitude""
                  value="latitude",ZodiacSign.",""
                  onChange={(e) ={'{',>'}'} setLatitude(e.target.value)}''
                  step="0.01""
                /{'{',>'}'}''
                {'{',<'}'}input''
                  type="number""
                  placeholder="Longitude""
                  value="longitude",ZodiacSign.",""
                  onChange={(e) ={'{',>'}'} setLongitude(e.target.value)}''
                  step="0.01""
                /{'{',>'}'}''
              </div{'{',>'}'}''
            </div{'{',>'}'}''
{
              </button{'{',>'}'},: {showNutritionSection && (,ZodiacSign.",""
{
                        type="number""
                        id="caloriesPerDay""
                        value="caloriesPerDay",ZodiacSign.",""
                        onChange={(e) ={'{',>'}'} setCaloriesPerDay(e.target.value)}''
                        placeholder="e.g. 2000""
                      /{'{',>'}'}''
                    </div{'{',>'}'}''
{
                        type="number""
                        id="proteinPercentage""
                        value="proteinPercentage",ZodiacSign.",""
                        onChange={(e) ={'{',>'}'} setProteinPercentage(e.target.value)}''
                        placeholder="e.g. 30""
                        min="0""
                        max="100""
                      /{'{',>'}'}''
                    </div{'{',>'}'}''
{
                        type="number""
                        id="carbsPercentage""
                        value="carbsPercentage",ZodiacSign.",""
                        onChange={(e) ={'{',>'}'} setCarbsPercentage(e.target.value)}''
                        placeholder="e.g. 40""
                        min="0""
                        max="100""
                      /{'{',>'}'}''
                    </div{'{',>'}'}''
{
                        type="number""
                        id="fatPercentage""
                        value="fatPercentage",ZodiacSign.",""
                        onChange={(e) ={'{',>'}'} setFatPercentage(e.target.value)}''
                        placeholder="e.g. 30""
                        min="0""
                        max="100""
                      /{'{',>'}'}''
                    </div{'{',>'}'}''
{
                        type="number""
                        id="waterIntakeTarget""
                        value="waterIntakeTarget",ZodiacSign.",""
                        onChange={(e) ={'{',>'}'} setWaterIntakeTarget(e.target.value)}''
                        placeholder="e.g. 2000""
                      /{'{',>'}'}''
                    </div{'{',>'}'}''
                  </div{'{',>'}'}''
                </div{'{',>'}'},: )},ZodiacSign.",""
            </div{'{',>'}'}''
{
{
                      type="checkbox""
                      id="restriction",ZodiacSign.",""
                      checked={dietaryRestrictions.includes(restriction)}
                      onChange={() ={'{',>'}'} handleDietaryRestrictionChange(restriction)}''
                    /{'{',>'}'}''
{
                  </div{'{',>'}'},: ))},ZodiacSign.",""
              </div{'{',>'}'}''
            </div{'{',>'}'}''
{
            </button{'{',>'}'}''
{error && {
          </form{'{',>'}'}''
        </div{'{',>'}'},: ) : (,ZodiacSign.",""
        // Display profile info for existing user
{
{
            </button{'{',>'}'}''
          </div{'{',>'}'}''
{showChartComparison && {
        </div{'{',>'}'},: )},ZodiacSign.",""
{
        .user-profile-form {
          max-width: 800px
          margin: 0 auto
          padding: 2rem
          background: white
          border-radius: 0.5rem
box-shadow
        }
        
        .profile-display {
          margin-top: 2rem
          display: flex
          flex-direction: column
          gap: 2rem
        }
        
        .profile-info { background: #f9fafb; ",padding" 1.5rem""
          border-radius: 0.5rem
          border-left: 4px solid #4f46e5
        }
        
        .profile-sections { display: grid""
          grid-template-columns: 1fr 1fr
          gap: 1.5rem
        }
        
        .profile-section { background: white; ",padding" 1.25rem""
          border-radius: 0.5rem
box-shadow
          border-top: 3px solid #4f46e5
        }
        
        .elemental-section {
          border-top-color: #10b981
        }
        
        .tarot-info {
          border-top-color: #f59e0b
        }
        
        .natal-planets {
          border-top-color: #3b82f6
          grid-column: span 2
        }
        
        .info-grid, .planets-grid { display: grid; ",gap" 0.75rem""
          margin-top: 1rem
        }
        
        .planets-grid { display: grid""
          grid-template-columns: repeat(3, 1fr)
          gap: 1rem
        }
        
        .info-row, .planet-row { display: grid""
          grid-template-columns: 40% 60%
          align-items: center
          padding: 0.5rem
          background: #f9fafb
          border-radius: 0.25rem
        }
        
        .info-label, .planet-name {
          font-weight: 600
          color: #4b5563
          text-transform: capitalize
        }
        
        .info-value, .planet-value { color: #1f2937""
          font-weight: 500
        }
        
        .elemental-balance {
          margin-top: 1rem
        }
        
        .elemental-bars { display: grid; ",gap" 0.75rem""
        }
        
        .element-bar-container { display: grid""
          grid-template-columns: 15% 70% 15%
          align-items: center
          gap: 0.5rem
        }
        
        .element-label {
          font-weight: 500
          text-transform: capitalize
        }
        
        .bar-container { height: 10px""
          background-color: #e5e7eb
          border-radius: 5px
          overflow: hidden
        }
        
        .bar { height: 100%""
          border-radius: 5px
          transition: width 0.5s ease
        }
        
        .element-value {
          font-size: 0.875rem
          text-align: right
        }
        
        h3 {
          font-size: 1.5rem
          font-weight: 700
          color: #1f2937
          margin-bottom: 1.25rem
        }
        
        h4 {
          font-size: 1.125rem
          font-weight: 600
          color: #374151
          margin-bottom: 0.75rem
          padding-bottom: 0.5rem
          border-bottom: 2px solid #e5e7eb
        }
        
        .composite-chart { background: #f9fafb; ",padding" 1.5rem""
          border-radius: 0.5rem
          border-left: 4px solid #10b981
        }
        
        .chart-details { display: grid; ",gap" 1.5rem""
          margin-top: 1rem
          grid-template-columns: repeat(2, 1fr)
        }
        
        .section:nth-child(3), .section:nth-child(4) {
          grid-column: span 2
        }
        
        .section h4 {
          margin-bottom: 0.75rem
          color: #374151
          font-weight: 600
          border-bottom: 2px solid #e5e7eb
          padding-bottom: 0.5rem
        }
        
        .properties-grid { display: grid""
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))
          gap: 1rem
        }
        
        .property { background: white; ",padding" 0.75rem""
          border-radius: 0.25rem
box-shadow
          text-align: center
        }
        
        .property-name {
          font-size: 0.875rem
          color: #6b7280
          margin-bottom: 0.25rem
        }
        
        .property-value {
          font-size: 1.25rem
          font-weight: 600
          color: #1f2937
        }
        
        .dominant-element {
          font-size: 1.5rem
          font-weight: 700
          color: #10b981
          text-transform: capitalize
          text-align: center
          padding: 1rem
          background: white
          border-radius: 0.25rem
box-shadow
        }
        
        .error-message { color: #dc2626""
          margin-top: 1rem
          padding: 0.75rem
          background: #fee2e2
          border-radius: 0.25rem
          font-size: 0.875rem
        }
        
        @media (max-width: 768px) {
          .profile-sections {
            grid-template-columns: 1fr
          }
          
          .natal-planets {
            grid-column: span 1
          }
          
          .planets-grid {
            grid-template-columns: repeat(2, 1fr)
          }
          
          .chart-details {
            grid-template-columns: 1fr
          }
          
          .section:nth-child(3), .section:nth-child(4) {
            grid-column: span 1
          }
        }
        
        @media (max-width: 640px) {
          .user-profile-form { padding: 1rem""
          }
          
          .planets-grid {
            grid-template-columns: 1fr
          }
          
          .properties-grid {
            grid-template-columns: repeat(2, 1fr)
          }
        }
`}</style{```
    </div{'{',>'}'}''
  )
}; ,ZodiacSign."','}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}})))))''"
>>>>>>> main
