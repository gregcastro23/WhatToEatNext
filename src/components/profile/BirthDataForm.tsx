import React, { useState } from 'react';

interface BirthDataFormProps {
  onSubmit: (data: { birth_date: string; birth_time: string; latitude: number; longitude: number; city_name: string }) => void;
  isLoading: boolean;
}

export const BirthDataForm: React.FC<BirthDataFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    birth_date: '',
    birth_time: '12:00',
    city_name: '',
    latitude: '',
    longitude: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Initialize Your Profile</h2>
      <p className="text-gray-600 mb-6 text-center text-sm">
        To calculate your Alchemical Quantities, we need your precise birth moment.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Date</label>
          <input
            type="date"
            name="birth_date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={formData.birth_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Time</label>
          <input
            type="time"
            name="birth_time"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={formData.birth_time}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City Name</label>
          <input
            type="text"
            name="city_name"
            placeholder="e.g. New York"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={formData.city_name}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              required
              placeholder="40.7128"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              required
              placeholder="-74.0060"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Tip: You can find coordinates on Google Maps by right-clicking a location.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {isLoading ? 'Calculating Chart...' : 'Reveal My Alchemy'}
        </button>
      </form>
    </div>
  );
};
