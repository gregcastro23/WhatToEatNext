import FoodBalanceTracker from '@/components/FoodRecommender/components/FoodBalanceTracker';

// Re-export the component with specific props for the header version
const HeaderFoodBalanceTracker = (props: Record<string, unknown> = {}) => {
  // Only spread props if it's a valid object
  const safeProps = props && typeof props === 'object' ? props : {};
  return (
    <FoodBalanceTracker showCuisineSelection={true} showElementalFeatures={false} {...safeProps} />
  );
};

export default HeaderFoodBalanceTracker;
