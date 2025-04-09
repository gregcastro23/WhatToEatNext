#!/bin/bash

# Update imports from useAlchemical to AlchemicalContext/hooks
echo "Updating imports from @/contexts/useAlchemical to @/contexts/AlchemicalContext/hooks..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|import { useAlchemical } from '\''@/contexts/useAlchemical'\''|import { useAlchemical } from '\''@/contexts/AlchemicalContext/hooks'\''|g' {} \;

# Update imports from CurrentChartContext to ChartContext
echo "Updating imports from @/context/CurrentChartContext to @/contexts/ChartContext..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|import { CurrentChartProvider } from '\''@/context/CurrentChartContext'\''|import { CurrentChartProvider } from '\''@/contexts/ChartContext'\''|g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|import { useCurrentChart } from '\''@/context/CurrentChartContext'\''|import { useCurrentChart } from '\''@/contexts/ChartContext/hooks'\''|g' {} \;

# Update imports from TarotContext
echo "Updating imports from @/context/TarotContext to @/contexts/TarotContext..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|import { useTarotContext } from '\''@/context/TarotContext'\''|import { useTarotContext } from '\''@/contexts/TarotContext/hooks'\''|g' {} \;

# Update imports from PopupContext
echo "Updating imports from @/contexts/PopupContext to @/contexts/PopupContext/hooks..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|import { usePopup } from '\''@/contexts/PopupContext'\''|import { usePopup } from '\''@/contexts/PopupContext/hooks'\''|g' {} \;

# Update imports from AlchemicalContext to AlchemicalContext/provider
echo "Updating imports from @/contexts/AlchemicalContext to @/contexts/AlchemicalContext/provider..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|import { AlchemicalProvider } from '\''@/contexts/AlchemicalContext'\''|import { AlchemicalProvider } from '\''@/contexts/AlchemicalContext/provider'\''|g' {} \;

echo "Import updates completed!" 