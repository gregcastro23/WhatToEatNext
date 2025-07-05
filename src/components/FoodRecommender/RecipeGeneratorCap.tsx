import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChefHat, 
  Sparkles, 
  Clock, 
  Zap, 
  Shield, 
  Beaker,
  Target,
  Lightbulb
} from 'lucide-react';

interface RecipeGeneratorCapProps {
  onRemoveCap?: () => void;
}

export default function RecipeGeneratorCap({ onRemoveCap }: RecipeGeneratorCapProps) {
  return (
    <Card className="w-full border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <CardTitle className="text-xl font-bold text-purple-800">
            Recipe Generator - Development Preview
          </CardTitle>
          <Shield className="h-6 w-6 text-purple-600" />
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
          <Beaker className="h-3 w-3 mr-1" />
          Alchemical Protection Active
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preview Section */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-800">Recipe Generator Preview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Alchemical Analysis</span>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                • Planetary position analysis<br/>
                • Elemental compatibility scoring<br/>
                • A# (Alchemical Number) calculations<br/>
                • Thermodynamic metrics (Kalchm, Monica)
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Recipe Matching</span>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                • Ingredient compatibility<br/>
                • Cuisine alignment<br/>
                • Seasonal optimization<br/>
                • Nutritional balance
              </div>
            </div>
          </div>
        </div>

        {/* Development Goals */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Development Goals</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">Phase 1: Core Engine</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 ml-6">
                <li>• Enhanced alchemical calculations</li>
                <li>• Real-time planetary integration</li>
                <li>• A# metric optimization</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700">Phase 2: Intelligence</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 ml-6">
                <li>• Advanced recipe matching</li>
                <li>• Personalized recommendations</li>
                <li>• Culinary astrology integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-800">
                Currently in Development
              </span>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              v0.1.0-alpha
            </Badge>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            The recipe generator is being systematically enhanced with advanced alchemical calculations, 
            real-time planetary data integration, and intelligent recipe matching algorithms.
          </p>
        </div>

        {/* Remove Cap Button (for development) */}
        {onRemoveCap && (
          <div className="text-center pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRemoveCap}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Remove Protection Cap (Dev Only)
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              This will reveal the current development version
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 