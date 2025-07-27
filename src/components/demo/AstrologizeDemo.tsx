'use client';

import React, { useState, useEffect } from 'react';

import { useAstrologize } from '@/hooks/useAstrologize';

// Default coordinates (New York City)
const DEFAULT_COORDINATES = {
  latitude: 40.7498,
  longitude: -73.7976
};

const AstrologizeDemo: React.FC = () => {
  // Get current date and time for initialization
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const time = now.toTimeString().substring(0, 5); // HH:MM format
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  // State for custom inputs - initialize with current moment
  const [useCustom, setUseCustom] = useState(false);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customDate, setCustomDate] = useState(currentDate);
  const [customTime, setCustomTime] = useState(currentTime);
  const [customLatitude, setCustomLatitude] = useState(DEFAULT_COORDINATES.latitude.toString());
  const [customLongitude, setCustomLongitude] = useState(DEFAULT_COORDINATES.longitude.toString());
  const [zodiacSystem, setZodiacSystem] = useState<'tropical' | 'sidereal'>('tropical');
  const [locationDetectionStatus, setLocationDetectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Attempt to get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationDetectionStatus('loading');
      
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          setCustomLatitude(position.coords.latitude.toFixed(4));
          setCustomLongitude(position.coords.longitude.toFixed(4));
          setLocationDetectionStatus('success');
        },
        // Error callback
        (error) => {
          console.log('Geolocation error:', error.message);
          setLocationDetectionStatus('error');
        },
        // Options
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      setLocationDetectionStatus('error');
    }
  }, []);
  
  // Parse custom date/time into components
  const getCustomOptions = () => {
    if (!useCustom && !useCustomLocation && zodiacSystem === 'tropical') return {};
    
    const options: any = {
      zodiacSystem
    };
    
    if (useCustom && customDate && customTime) {
      const dateObj = new Date(`${customDate}T${customTime}`);
      options.useCurrentTime = false;
      options.year = dateObj.getFullYear();
      options.month = dateObj.getMonth() + 1; // Use 1-indexed month for API
      options.date = dateObj.getDate();
      options.hour = dateObj.getHours();
      options.minute = dateObj.getMinutes();
    } else {
      options.useCurrentTime = true;
    }
    
    if (useCustomLocation) {
      options.useCurrentLocation = false;
      options.latitude = parseFloat(customLatitude);
      options.longitude = parseFloat(customLongitude);
    } else {
      options.useCurrentLocation = true;
      // Still pass coordinates since the API needs them regardless of the flag
      options.latitude = parseFloat(customLatitude);
      options.longitude = parseFloat(customLongitude);
    }
    
    return options;
  };
  
  // Use the hook with options
  const { loading, error, data, refetch } = useAstrologize(getCustomOptions());
  
  const handleLocationToggle = () => {
    setUseCustomLocation(!useCustomLocation);
  };
  
  const handleDateToggle = () => {
    setUseCustom(!useCustom);
    // No need to initialize here since fields are pre-filled
  };
  
  const handleRefresh = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  // Format planetary positions for display from _celestialBodies structure
  const formatPlanetaryPositions = () => {
    if (!data?._celestialBodies) {
      return null;
    }
    
    const planets = [
      'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
      'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
    ];
    
    return planets.map(planetKey => {
      const planet = data._celestialBodies[planetKey];
      if (!planet) return null;
      
      return (
        <div key={planetKey} className="flex justify-between border-b py-2">
          <div className="font-medium capitalize">{planet.label}</div>
          <div className="text-right">
            <span className="font-bold capitalize">{planet.Sign.label}</span> {' '}
            <span className="text-gray-600">
              {planet.ChartPosition.Ecliptic.ArcDegrees.degrees}° 
              {planet.ChartPosition.Ecliptic.ArcDegrees.minutes}' 
              {planet.ChartPosition.Ecliptic.ArcDegrees.seconds.toFixed(0)}''
            </span>
            {planet.isRetrograde && <span className="text-red-500 ml-1">℞</span>}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Astrologize API Demo</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        
        <form onSubmit={handleRefresh}>
          <div className="mb-4">
            <label className="block font-medium mb-2">Zodiac System</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="zodiacSystem"
                  value="tropical"
                  checked={zodiacSystem === 'tropical'}
                  onChange={() => setZodiacSystem('tropical')}
                  className="mr-2"
                />
                Tropical
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="zodiacSystem"
                  value="sidereal"
                  checked={zodiacSystem === 'sidereal'}
                  onChange={() => setZodiacSystem('sidereal')}
                  className="mr-2"
                />
                Sidereal
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="use-custom-date"
                checked={useCustom}
                onChange={handleDateToggle}
                className="mr-2"
              />
              <label htmlFor="use-custom-date" className="font-medium">
                Use Custom Date/Time
              </label>
            </div>
            
            {useCustom && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full p-2 border rounded"
                    required={useCustom}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Time</label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full p-2 border rounded"
                    required={useCustom}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="use-custom-location"
                checked={useCustomLocation}
                onChange={handleLocationToggle}
                className="mr-2"
              />
              <label htmlFor="use-custom-location" className="font-medium">
                Use Custom Location
              </label>
              
              {locationDetectionStatus === 'loading' && (
                <span className="ml-2 text-blue-500 text-sm">Detecting your location...</span>
              )}
              {locationDetectionStatus === 'success' && (
                <span className="ml-2 text-green-500 text-sm">Using your detected location</span>
              )}
              {locationDetectionStatus === 'error' && (
                <span className="ml-2 text-orange-500 text-sm">Using default location (New York)</span>
              )}
            </div>
            
            {useCustomLocation && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm mb-1">Latitude</label>
                  <input
                    type="text"
                    value={customLatitude}
                    onChange={(e) => setCustomLatitude(e.target.value)}
                    className="w-full p-2 border rounded"
                    required={useCustomLocation}
                    placeholder="40.7498"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Longitude</label>
                  <input
                    type="text"
                    value={customLongitude}
                    onChange={(e) => setCustomLongitude(e.target.value)}
                    className="w-full p-2 border rounded"
                    required={useCustomLocation}
                    placeholder="-73.7976"
                  />
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Astrological Data'}
          </button>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading astrological data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error.message}</p>
          </div>
        )}
        
        {!loading && !error && data && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Date & Location</h3>
              <p className="text-gray-700">
                {data.birth_info ? (
                  <>
                    {new Date(
                      data.birth_info.year,
                      data.birth_info.month,
                      data.birth_info.date,
                      data.birth_info.hour,
                      data.birth_info.minute
                    ).toLocaleString()}
                    {' at '}
                    {data.birth_info.latitude.toFixed(4)}, {data.birth_info.longitude.toFixed(4)}
                  </>
                ) : (
                  <span>Information not available</span>
                )}
              </p>
              <p className="text-green-600 font-medium mt-1">
                Using {data.birth_info?.ayanamsa || zodiacSystem} zodiac
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Planetary Positions</h3>
              <div className="bg-gray-50 rounded p-4">
                {formatPlanetaryPositions()}
              </div>
            </div>
            
            {/* For debugging */}
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-gray-500">Raw API Response</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstrologizeDemo; 