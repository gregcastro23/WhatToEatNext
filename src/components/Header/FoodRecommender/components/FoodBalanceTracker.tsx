import FoodBalanceTracker from '@/components/FoodRecommender/components/FoodBalanceTracker';

// Re-export the component with specific props for the header version
const HeaderFoodBalanceTracker = (props: Record<string, unknown>) => {
  return <FoodBalanceTracker showCuisineSelection={true} showElementalFeatures={false} {...props} />;
};

export default HeaderFoodBalanceTracker; 