import FoodBalanceTracker from '../../../FoodRecommender/components/FoodBalanceTracker';
import React from 'react';

// Define the proper type for the FoodBalanceTracker props
interface FoodBalanceTrackerProps {
  showCuisineSelection?: boolean;
  showElementalFeatures?: boolean;
  [key: string]: any; // Allow additional props to be spread
}

// Re-export the component with specific props for the header version
const HeaderFoodBalanceTracker: React.FC<Omit<FoodBalanceTrackerProps, 'showCuisineSelection' | 'showElementalFeatures'>> = (props) => {
  return <FoodBalanceTracker showCuisineSelection={true} showElementalFeatures={false} {...props} />;
};

export default HeaderFoodBalanceTracker; 