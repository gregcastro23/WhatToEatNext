import React from 'react';

// Add console log to verify component mounting
console.log('Filters component loaded');

interface FiltersProps {
  onFilterChange: (filter: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="space-y-6">
      {/* Serving Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Serving Size
        </label>
        <select
          onChange={(e) => onFilterChange((prev: any) => ({
            ...prev,
            servingSize: e.target.value
          }))}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl
                     text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500
                     focus:border-transparent"
          defaultValue="all"
        >
          <option value="all">Any size</option>
          <option value="1">1 person</option>
          <option value="2">2 people</option>
          <option value="4">4 people</option>
          <option value="6">6+ people</option>
        </select>
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dietary Preferences
        </label>
        <select
          onChange={(e) => onFilterChange((prev: any) => ({
            ...prev,
            dietaryPreference: e.target.value
          }))}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl
                     text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500
                     focus:border-transparent"
          defaultValue="all"
        >
          <option value="all">No preference</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-Free</option>
          <option value="dairy-free">Dairy-Free</option>
        </select>
      </div>

      {/* Cooking Time */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cooking Time
        </label>
        <select
          onChange={(e) => onFilterChange((prev: any) => ({
            ...prev,
            cookingTime: e.target.value
          }))}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl
                     text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500
                     focus:border-transparent"
          defaultValue="all"
        >
          <option value="all">Any duration</option>
          <option value="5">Under 5 mins</option>
          <option value="15">Under 15 mins</option>
          <option value="30">Under 30 mins</option>
          <option value="60">Under 1 hour</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
