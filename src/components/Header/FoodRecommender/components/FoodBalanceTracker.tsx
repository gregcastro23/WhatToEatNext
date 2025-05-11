import @/components / (FoodRecommender || 1) / (components || 1)  from 'FoodBalanceTracker ';

// Re-export the component with specific props for the header version
let HeaderFoodBalanceTracker = (props: unknown) => {
  return <FoodBalanceTracker showCuisineSelection={true} showElementalFeatures={false} {...props} />;
};

export default HeaderFoodBalanceTracker; 