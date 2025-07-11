import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  ChefHat, 
  Target, 
  Sparkles,
  Activity,
  BarChart3
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria 
} from '@/data/unified/recipeBuilding';

interface PreviewData {
  confidence: number;
  ingredientSuggestions: string[];
  methodSuggestions: string[];
  estimatedTime: string;
  kalchmRange: [number, number];
  monicaTarget: number;
}

interface LivePreviewProps {
  criteria: Partial<RecipeBuildingCriteria>;
  previewData?: PreviewData;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function LivePreview({ 
  criteria, 
  previewData, 
  isGenerating, 
  onGenerate 
}: LivePreviewProps) {
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 8;
    
    if (criteria.season) completed++;
    if (criteria.mealType?.length) completed++;
    if (criteria.servings) completed++;
    if (criteria.elementalPreference) completed++;
    if (criteria.cuisine) completed++;
    if (criteria.targetMonica) completed++;
    if (criteria.targetKalchm) completed++;
    if (criteria.skillLevel) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Excellent';
    if (confidence >= 0.6) return 'Good';
    if (confidence >= 0.4) return 'Fair';
    return 'Poor';
  };

  const completionPercentage = getCompletionPercentage();
  const confidence = previewData?.confidence || 0;

  return (
    <div className="space-y-4">
      {/* Live Preview Header */}
      <Card className="border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-amber-600" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completion</span>
              <span className="text-sm text-gray-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Generation Confidence */}
          {previewData && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Confidence</span>
                <Badge className={getConfidenceColor(confidence)}>
                  {getConfidenceLabel(confidence)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${getConfidenceColor(confidence)}`} />
                <span className="text-sm">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={completionPercentage < 50 || isGenerating}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recipe
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recipe Insights */}
      {previewData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Recipe Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estimated Time */}
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Estimated Time</div>
                <div className="text-xs text-gray-600">{previewData.estimatedTime}</div>
              </div>
            </div>

            {/* Kalchm Range */}
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Kalchm Range</div>
                <div className="text-xs text-gray-600">
                  {previewData.kalchmRange[0].toFixed(1)} - {previewData.kalchmRange[1].toFixed(1)}
                </div>
              </div>
            </div>

            {/* Monica Target */}
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Monica Target</div>
                <div className="text-xs text-gray-600">{previewData.monicaTarget.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredient Suggestions */}
      {previewData?.ingredientSuggestions?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ChefHat className="w-5 h-5" />
              Suggested Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previewData.ingredientSuggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="text-sm p-2 bg-gray-50 rounded border-l-4 border-amber-400"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Method Suggestions */}
      {previewData?.methodSuggestions?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Cooking Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previewData.methodSuggestions.map((method, index) => (
                <div 
                  key={index}
                  className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400"
                >
                  {method}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Configuration Summary */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {criteria.season && (
              <div className="flex justify-between">
                <span className="text-gray-600">Season:</span>
                <span className="font-medium capitalize">{criteria.season}</span>
              </div>
            )}
            
            {criteria.mealType?.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Meal:</span>
                <span className="font-medium capitalize">
                  {criteria.mealType.join(', ')}
                </span>
              </div>
            )}
            
            {criteria.servings && (
              <div className="flex justify-between">
                <span className="text-gray-600">Servings:</span>
                <span className="font-medium">{criteria.servings}</span>
              </div>
            )}
            
            {criteria.cuisine && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cuisine:</span>
                <span className="font-medium">{criteria.cuisine}</span>
              </div>
            )}
            
            {criteria.skillLevel && (
              <div className="flex justify-between">
                <span className="text-gray-600">Skill Level:</span>
                <span className="font-medium capitalize">{criteria.skillLevel}</span>
              </div>
            )}

            {criteria.targetMonica && (
              <div className="flex justify-between">
                <span className="text-gray-600">Monica Target:</span>
                <span className="font-medium">{criteria.targetMonica.toFixed(2)}</span>
              </div>
            )}

            {criteria.targetKalchm && (
              <div className="flex justify-between">
                <span className="text-gray-600">Kalchm Target:</span>
                <span className="font-medium">{criteria.targetKalchm.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      {completionPercentage < 50 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                Complete at least 50% of the configuration to generate a recipe. 
                The more details you provide, the better your personalized result will be.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}