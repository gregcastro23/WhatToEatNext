import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChefHat, 
  Clock, 
  Users, 
  Star, 
  BarChart3, 
  Zap, 
  Target, 
  Share, 
  Download, 
  RefreshCw,
  Sparkles,
  TrendingUp,
  Heart,
  Award
} from 'lucide-react';

// Types
import type { 
  RecipeGenerationResult, 
  MonicaOptimizedRecipe 
} from '@/data/unified/recipeBuilding';

interface RecipeDisplayProps {
  recipe?: RecipeGenerationResult;
  onRegenerate?: () => void;
}

export default function RecipeDisplay({ 
  recipe, 
  onRegenerate 
}: RecipeDisplayProps) {
  
  const [activeTab, setActiveTab] = useState<'recipe' | 'analysis' | 'alternatives'>('recipe');

  if (!recipe) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Ready to Generate Your Recipe
          </h3>
          <p className="text-gray-500 mb-6">
            Complete the previous steps and click "Generate Recipe" to create your personalized alchemical recipe.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { recipe: optimizedRecipe, confidence, alternatives, generationMetadata } = recipe;

  // Helper function to format confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent';
    if (confidence >= 0.7) return 'Very Good';
    if (confidence >= 0.5) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-6">
      {/* Recipe Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-amber-900 mb-2">
                {optimizedRecipe.name || 'Alchemical Creation'}
              </CardTitle>
              <p className="text-amber-700">
                {optimizedRecipe.description || 'A harmonious blend of elements and flavors'}
              </p>
            </div>
            <Badge className={`${getConfidenceColor(confidence)} border-0`}>
              <Star className="w-3 h-3 mr-1" />
              {getConfidenceLabel(confidence)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <strong>{optimizedRecipe.numberOfServings || 4}</strong> servings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <strong>{optimizedRecipe.prepTime || '30 min'}</strong> prep
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <strong>{optimizedRecipe.cookTime || '45 min'}</strong> cook
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <strong>{optimizedRecipe.monicaOptimization?.optimizedMonica?.toFixed(2) || '1.00'}</strong> Monica
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-1 mb-6">
            {[
              { id: 'recipe', label: 'Recipe', icon: ChefHat },
              { id: 'analysis', label: 'Analysis', icon: BarChart3 },
              { id: 'alternatives', label: 'Alternatives', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Recipe Tab */}
          {activeTab === 'recipe' && (
            <div className="space-y-6">
              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Ingredients
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {optimizedRecipe.ingredients?.map((ingredient: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">
                        {typeof ingredient === 'string' ? ingredient : ingredient.name || `Ingredient ${index + 1}`}
                      </span>
                      {typeof ingredient === 'object' && ingredient.amount && (
                        <span className="text-sm text-gray-600">{ingredient.amount}</span>
                      )}
                    </div>
                  )) || (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      Ingredients will be generated based on your preferences
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Instructions
                </h3>
                <div className="space-y-3">
                  {optimizedRecipe.instructions?.map((instruction: string, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{instruction}</p>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      Detailed instructions will be generated with your recipe
                    </div>
                  )}
                </div>
              </div>

              {/* Cooking Methods */}
              {optimizedRecipe.cookingMethods?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Alchemical Methods
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {optimizedRecipe.cookingMethods.map((method: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Monica Optimization */}
              {optimizedRecipe.monicaOptimization && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      Monica Optimization Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-mono font-bold text-amber-600">
                          {optimizedRecipe.monicaOptimization.optimizedMonica?.toFixed(3) || '1.000'}
                        </div>
                        <div className="text-sm text-gray-600">Optimized Monica</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-mono font-bold text-green-600">
                          {Math.round((optimizedRecipe.monicaOptimization.optimizationScore || 0) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Optimization Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-mono font-bold text-blue-600">
                          {optimizedRecipe.monicaOptimization.originalMonica?.toFixed(3) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Original Monica</div>
                      </div>
                    </div>

                    {optimizedRecipe.monicaOptimization.intensityModifications?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Optimization Adjustments</h4>
                        <div className="space-y-1">
                          {optimizedRecipe.monicaOptimization.intensityModifications.map((mod: string, index: number) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-amber-600 rounded-full" />
                              {mod}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Elemental Properties */}
              {optimizedRecipe.elementalProperties && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Elemental Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(optimizedRecipe.elementalProperties).map(([element, value]) => (
                        <div key={element} className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {Math.round((value as number) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">{element}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(value as number) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generation Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Generation Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Criteria Matched</div>
                      <div>{generationMetadata.criteriaMatched}/{generationMetadata.totalCriteria}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Kalchm Accuracy</div>
                      <div>{Math.round(generationMetadata.kalchmAccuracy * 100)}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Seasonal Alignment</div>
                      <div>{Math.round(generationMetadata.seasonalAlignment * 100)}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Cuisine Authenticity</div>
                      <div>{Math.round(generationMetadata.cuisineAuthenticity * 100)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Alternatives Tab */}
          {activeTab === 'alternatives' && (
            <div className="space-y-4">
              {alternatives?.length > 0 ? (
                alternatives.map((alt: MonicaOptimizedRecipe, index: number) => (
                  <Card key={index} className="border-l-4 border-amber-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{alt.name || `Alternative ${index + 1}`}</h4>
                          <p className="text-sm text-gray-600">{alt.description}</p>
                        </div>
                        <Badge variant="outline">
                          Monica: {alt.monicaOptimization?.optimizedMonica?.toFixed(2) || 'N/A'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Prep: {alt.prepTime}</span>
                        <span>Cook: {alt.cookTime}</span>
                        <span>Serves: {alt.numberOfServings}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Alternatives Generated
                  </h3>
                  <p className="text-gray-500">
                    The current recipe is optimal for your criteria, or alternatives are still being generated.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share Recipe
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                Save to Favorites
              </Button>
              
              {onRegenerate && (
                <Button onClick={onRegenerate} className="bg-amber-600 hover:bg-amber-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Recipe
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}