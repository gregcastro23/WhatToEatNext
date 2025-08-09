import React from 'react';

interface FilterState {
  servingSize: string;
  dietaryPreference: string;
  cookingTime: string;
  [key: string]: string;
}

interface FiltersProps {
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  return (
    <div className='space-y-6'>
      {/* Serving Size */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>Serving Size</label>
        <select
          onChange={e =>
            onFilterChange((prev: FilterState) => ({
              ...prev,
              servingSize: e.target.value,
            }))
          }
          className='w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-700 focus:border-transparent focus:ring-2 focus:ring-indigo-500'
          defaultValue='all'
        >
          <option value='all'>Any size</option>
          <option value='1'>1 person</option>
          <option value='2'>2 people</option>
          <option value='4'>4 people</option>
          <option value='6'>6+ people</option>
        </select>
      </div>

      {/* Dietary Preferences */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>Dietary Preferences</label>
        <select
          onChange={e =>
            onFilterChange((prev: FilterState) => ({
              ...prev,
              dietaryPreference: e.target.value,
            }))
          }
          className='w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-700 focus:border-transparent focus:ring-2 focus:ring-indigo-500'
          defaultValue='all'
        >
          <option value='all'>No preference</option>
          <option value='vegetarian'>Vegetarian</option>
          <option value='vegan'>Vegan</option>
          <option value='gluten-free'>Gluten-Free</option>
          <option value='dairy-free'>Dairy-Free</option>
        </select>
      </div>

      {/* Cooking Time */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>Cooking Time</label>
        <select
          onChange={e =>
            onFilterChange((prev: FilterState) => ({
              ...prev,
              cookingTime: e.target.value,
            }))
          }
          className='w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-700 focus:border-transparent focus:ring-2 focus:ring-indigo-500'
          defaultValue='all'
        >
          <option value='all'>Any duration</option>
          <option value='5'>Under 5 mins</option>
          <option value='15'>Under 15 mins</option>
          <option value='30'>Under 30 mins</option>
          <option value='60'>Under 1 hour</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
