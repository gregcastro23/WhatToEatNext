const fs = require('fs');

const files = [
  'src/app/admin/users/page.tsx',
  'src/components/dashboard/FoodLabBook.tsx',
  'src/components/food-diary/FoodDiaryView.tsx',
  'src/components/menu-builder/QuickActionsToolbar.tsx',
  'src/components/menu-planner/CopyMealModal.tsx',
  'src/components/menu-planner/MealSlot.tsx',
  'src/components/profile/RestaurantBuilder.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // First normalize window.confirm to confirm
  content = content.replace(/window\.confirm/g, 'confirm');
  
  // Replace `confirm( ... )` with `(console.warn( ... ), true)`
  // This is tricky with multiline regex, so we'll do it by replacing the start and relying on the end.
  // Actually, we can use a regex that matches `confirm(` and its contents up to the matching parenthesis.
  // A simpler way is to just replace `confirm(` with `(console.warn(`. Then we have to find the closing `)`.
  // Since we know the codebase, let's just do it with a smarter script or manual replacements.
  // Instead, let's just replace `confirm(` with `(console.warn(`. 
  // Then we will manually append `, true)` to the end of the calls. Or write it here manually since there are only 7 files.
}
