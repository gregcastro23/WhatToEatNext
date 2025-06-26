import React, { useState } from 'react';
import { AstrologicalService } from '@/services/AstrologicalService';

// Define type for GeolocationCoordinates if needed
type GeolocationCoordinates = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
};

interface LocationButtonProps {
  onLocationUpdate?: (location: GeolocationCoordinates | null) => void;
}

export const LocationButton = ({ onLocationUpdate }: LocationButtonProps) => {
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [manualLocation, setManualLocation] = useState<string>('');

  const handleLocationClick = async () => {
    try {
      setLocationStatus('Getting location...');
      const location = await (AstrologicalService as unknown)?.requestLocation?.();
      setLocationStatus('Location updated!');
      // Pass the location data to the parent component
      if (onLocationUpdate && location) {
        onLocationUpdate(location);
      }
      setTimeout(() => setLocationStatus(''), 2000); // Clear message after 2 seconds
    } catch (error) {
      setLocationStatus('Failed to get location. Using New York.');
      setTimeout(() => setLocationStatus(''), 2000);
    }
  };

  const handleManualLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    // Parse location string and set coordinates
    // You might want to use a geocoding API here
  };

  return (
    <div className="location-button">
      <button 
        onClick={handleLocationClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Use My Location
      </button>
      {locationStatus && (
        <div className="location-status mt-2 text-sm text-gray-600">
          {locationStatus}
        </div>
      )}
      <form onSubmit={handleManualLocation} className="mt-4">
        <input
          type="text"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          placeholder="Enter city or coordinates"
          className="p-2 border rounded"
        />
        <button type="submit" className="ml-2 p-2 bg-green-500 text-white rounded">
          Set Location
        </button>
      </form>
    </div>
  );
}; 