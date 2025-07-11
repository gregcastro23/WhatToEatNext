import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Palette, 
  Flame, 
  Heart, 
  Zap, 
  Waves,
  Plus,
  X,
  Search,
  ChefHat
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria 
} from '@/data/unified/recipeBuilding';

interface PreferenceMatrixProps {
  criteria: Partial<RecipeBuildingCriteria>;
  onUpdate: (updates: Partial<RecipeBuildingCriteria>) => void;
  previewData?: any;
  isGenerating?: boolean;
}

// Cuisine categories with fusion possibilities
const CUISINE_CATEGORIES = [
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    icon: '🌊',
    description: 'Fresh, healthy, olive oil-based',
    subcuisines: ['Italian', 'Greek', 'Spanish', 'Turkish', 'Moroccan'],
    flavorProfile: { spice: 0.3, richness: 0.6, sweetness: 0.4, acidity: 0.7 }
  },
  {
    id: 'asian',
    name: 'Asian',
    icon: '🥢',
    description: 'Balanced, umami-rich, diverse techniques',
    subcuisines: ['Chinese', 'Japanese', 'Thai', 'Vietnamese', 'Korean', 'Indian'],
    flavorProfile: { spice: 0.6, richness: 0.5, sweetness: 0.5, acidity: 0.6 }
  },
  {
    id: 'american',
    name: 'American',
    icon: '🍔',
    description: 'Comfort foods, fusion-friendly',
    subcuisines: ['Southern', 'Tex-Mex', 'BBQ', 'New American', 'Cajun'],
    flavorProfile: { spice: 0.4, richness: 0.8, sweetness: 0.6, acidity: 0.3 }
  },
  {
    id: 'latin',
    name: 'Latin American',
    icon: '🌶️',
    description: 'Vibrant, spicy, citrus-forward',
    subcuisines: ['Mexican', 'Peruvian', 'Brazilian', 'Colombian', 'Argentine'],
    flavorProfile: { spice: 0.8, richness: 0.6, sweetness: 0.4, acidity: 0.8 }
  },
  {
    id: 'middle_eastern',
    name: 'Middle Eastern',
    icon: '🧿',
    description: 'Aromatic spices, ancient traditions',
    subcuisines: ['Lebanese', 'Persian', 'Israeli', 'Egyptian', 'Syrian'],
    flavorProfile: { spice: 0.7, richness: 0.5, sweetness: 0.6, acidity: 0.5 }
  },
  {
    id: 'african',
    name: 'African',
    icon: '🌍',
    description: 'Bold flavors, traditional techniques',
    subcuisines: ['Ethiopian', 'Moroccan', 'Nigerian', 'South African'],
    flavorProfile: { spice: 0.9, richness: 0.6, sweetness: 0.3, acidity: 0.4 }
  }
];

// Flavor profile sliders
const FLAVOR_PROFILES = [
  {
    id: 'spice',
    label: 'Spice Level',
    icon: Flame,
    color: 'text-red-600',
    description: 'From mild to fiery hot',
    levels: ['Mild', 'Medium', 'Spicy', 'Very Spicy', 'Extreme']
  },
  {
    id: 'richness',
    label: 'Richness',
    icon: Heart,
    color: 'text-amber-600',
    description: 'From light to indulgent',
    levels: ['Light', 'Moderate', 'Rich', 'Very Rich', 'Decadent']
  },
  {
    id: 'sweetness',
    label: 'Sweetness',
    icon: Heart,
    color: 'text-pink-600',
    description: 'From savory to sweet',
    levels: ['Savory', 'Subtle', 'Balanced', 'Sweet', 'Very Sweet']
  },
  {
    id: 'acidity',
    label: 'Acidity',
    icon: Waves,
    color: 'text-green-600',
    description: 'From mellow to bright',
    levels: ['Mellow', 'Gentle', 'Balanced', 'Bright', 'Tart']
  }
];

// Fusion combinations
const POPULAR_FUSIONS = [
  { name: 'Italian-Asian', cuisines: ['Italian', 'Japanese'], description: 'Pasta meets umami' },
  { name: 'Mexican-Korean', cuisines: ['Mexican', 'Korean'], description: 'Spicy meets fermented' },
  { name: 'Indian-American', cuisines: ['Indian', 'American'], description: 'Spices meet comfort' },
  { name: 'French-Vietnamese', cuisines: ['French', 'Vietnamese'], description: 'Technique meets freshness' },
  { name: 'Mediterranean-Middle Eastern', cuisines: ['Greek', 'Lebanese'], description: 'Ancient neighbors' },
  { name: 'Thai-Mexican', cuisines: ['Thai', 'Mexican'], description: 'Heat and herbs' }
];

export default function PreferenceMatrix({ 
  criteria, 
  onUpdate, 
  previewData, 
  isGenerating 
}: PreferenceMatrixProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    criteria.cuisine ? [criteria.cuisine] : []
  );
  const [flavorPreferences, setFlavorPreferences] = useState({
    spice: 0.5,
    richness: 0.5,
    sweetness: 0.5,
    acidity: 0.5
  });
  const [fusionMode, setFusionMode] = useState(false);

  // Handle cuisine selection
  const toggleCuisine = useCallback((cuisine: string) => {
    setSelectedCuisines(prev => {
      const newSelection = prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine];
      
      // Update criteria
      if (newSelection.length === 1) {
        onUpdate({ cuisine: newSelection[0] });
      } else if (newSelection.length > 1) {
        onUpdate({ cuisine: newSelection.join(' + ') });
      } else {
        onUpdate({ cuisine: undefined });
      }
      
      return newSelection;
    });
  }, [onUpdate]);

  // Handle flavor preference changes
  const updateFlavorPreference = useCallback((flavor: string, value: number) => {
    setFlavorPreferences(prev => {
      const newPrefs = { ...prev, [flavor]: value };
      
      // Convert to criteria format if needed
      onUpdate({
        // Store flavor preferences in a custom field or map to existing fields
        cuisinePreferences: newPrefs
      } as any);
      
      return newPrefs;
    });
  }, [onUpdate]);

  // Apply fusion preset
  const applyFusion = useCallback((fusion: typeof POPULAR_FUSIONS[0]) => {
    setSelectedCuisines(fusion.cuisines);
    onUpdate({ cuisine: fusion.cuisines.join(' + ') });
  }, [onUpdate]);

  // Get flavor level description
  const getFlavorLevelDescription = (profileId: string, value: number) => {
    const profile = FLAVOR_PROFILES.find(p => p.id === profileId);
    if (!profile) return '';
    
    const index = Math.floor(value * profile.levels.length);
    return profile.levels[Math.min(index, profile.levels.length - 1)];
  };

  // Filter cuisines based on search
  const filteredCuisines = CUISINE_CATEGORIES.map(category => ({
    ...category,
    subcuisines: category.subcuisines.filter(cuisine =>
      cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcuisines.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Search and Mode Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <Button
          variant={fusionMode ? "default" : "outline"}
          onClick={() => setFusionMode(!fusionMode)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Fusion Mode
        </Button>
      </div>

      {/* Fusion Presets */}
      {fusionMode && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Popular Fusion Combinations
            </CardTitle>
            <p className="text-sm text-gray-600">
              Try these exciting cuisine combinations
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {POPULAR_FUSIONS.map((fusion) => (
                <button
                  key={fusion.name}
                  onClick={() => applyFusion(fusion)}
                  className="p-3 text-left border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-all"
                >
                  <div className="font-medium text-sm">{fusion.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{fusion.description}</div>
                  <div className="flex gap-1 mt-2">
                    {fusion.cuisines.map(cuisine => (
                      <Badge key={cuisine} variant="secondary" className="text-xs">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cuisine Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Cuisine Selection
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose your preferred cuisine(s). Multiple selections create fusion recipes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredCuisines.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 ml-11">
                {category.subcuisines.map((cuisine) => {
                  const isSelected = selectedCuisines.includes(cuisine);
                  
                  return (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Selected Cuisines */}
      {selectedCuisines.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-5 h-5" />
              <span className="font-medium">Selected Cuisines</span>
              {selectedCuisines.length > 1 && (
                <Badge className="bg-purple-100 text-purple-800">Fusion Recipe</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedCuisines.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant="default"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flavor Profile Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Flavor Profile
          </CardTitle>
          <p className="text-sm text-gray-600">
            Fine-tune the flavor characteristics of your recipe
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {FLAVOR_PROFILES.map((profile) => {
            const Icon = profile.icon;
            const value = flavorPreferences[profile.id as keyof typeof flavorPreferences];
            const levelDescription = getFlavorLevelDescription(profile.id, value);
            
            return (
              <div key={profile.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${profile.color}`} />
                    <div>
                      <span className="font-medium">{profile.label}</span>
                      <div className="text-sm text-gray-600">{profile.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{levelDescription}</Badge>
                </div>
                
                <div className="px-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value}
                    onChange={(e) => updateFlavorPreference(profile.id, parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{profile.levels[0]}</span>
                    <span>{profile.levels[Math.floor(profile.levels.length / 2)]}</span>
                    <span>{profile.levels[profile.levels.length - 1]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Flavor Profile Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-3">Your Flavor Profile</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FLAVOR_PROFILES.map((profile) => {
              const value = flavorPreferences[profile.id as keyof typeof flavorPreferences];
              const levelDescription = getFlavorLevelDescription(profile.id, value);
              
              return (
                <div key={profile.id} className="text-center">
                  <div className={`text-sm font-medium ${profile.color}`}>
                    {profile.label}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {levelDescription}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {Math.round(value * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recipe Style Impact */}
      {selectedCuisines.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h4 className="font-medium text-green-900 mb-3">Recipe Style Impact</h4>
            <div className="text-sm text-green-800 space-y-2">
              {selectedCuisines.length === 1 ? (
                <p>
                  Your recipe will follow traditional <strong>{selectedCuisines[0]}</strong> cooking methods and ingredients.
                </p>
              ) : (
                <p>
                  Your fusion recipe combines <strong>{selectedCuisines.join(' and ')}</strong>, 
                  creating an innovative dish that blends the best of both culinary traditions.
                </p>
              )}
              
              <p>
                With your current flavor preferences, expect a{' '}
                <strong>{getFlavorLevelDescription('spice', flavorPreferences.spice).toLowerCase()}</strong> level of heat,{' '}
                <strong>{getFlavorLevelDescription('richness', flavorPreferences.richness).toLowerCase()}</strong> richness, and{' '}
                <strong>{getFlavorLevelDescription('acidity', flavorPreferences.acidity).toLowerCase()}</strong> acidity.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}