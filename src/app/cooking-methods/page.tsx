'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab } from '@mui/material';
import { useRouter } from 'next/navigation';
import { 
  dryCookingMethods, 
  wetCookingMethods, 
  molecularCookingMethods, 
  traditionalCookingMethods, 
  rawCookingMethods,
  transformationMethods
} from '@/data/cooking/methods';
import { capitalizeFirstLetter } from '@/utils/stringUtils';
import { CookingMethodsSection } from '@/components/CookingMethodsSection';

type MethodCategory = {
  name: string;
  description: string;
  methods: Record<string, unknown>;
  icon?: string;
};

const methodCategories: MethodCategory[] = [
  {
    name: 'Dry',
    description: 'Cooking with hot air, radiation, or hot fat',
    methods: dryCookingMethods,
    icon: '🔥'
  },
  {
    name: 'Wet',
    description: 'Cooking with water or steam',
    methods: wetCookingMethods,
    icon: '💧'
  },
  {
    name: 'Molecular',
    description: 'Scientific techniques that transform ingredients',
    methods: molecularCookingMethods,
    icon: '🧪'
  },
  {
    name: 'Traditional',
    description: 'Historical preservation and flavor development methods',
    methods: traditionalCookingMethods,
    icon: '🏺'
  },
  {
    name: 'Raw',
    description: 'Preparation without applying heat',
    methods: rawCookingMethods,
    icon: '🥬'
  },
  {
    name: 'Transformation',
    description: 'Methods that significantly alter food structure or preservation',
    methods: transformationMethods,
    icon: '⚗️'
  }
];

export default function CookingMethodsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [formattedMethods, setFormattedMethods] = useState<any[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  // Transform method data to match CookingMethodsSection component format
  useEffect(() => {
    if (methodCategories[tabValue]) {
      const categoryMethods = methodCategories[tabValue].methods;
      const transformed = Object.entries(categoryMethods).map(([key, method]) => {
        return {
          id: key,
          name: capitalizeFirstLetter(key.replace(/_/g, ' ')),
          description: (method as Record<string, unknown>).description || '',
          elementalEffect: (method as Record<string, unknown>).elementalEffect || (method as Record<string, unknown>).elementalProperties || {
            Fire: 0.5,
            Water: 0.5,
            Earth: 0.5,
            Air: 0.5
          },
          score: Math.random() * 0.5 + 0.5, // Mock score between 0.5-1.0
          duration: (method as Record<string, unknown>).time_range || (method as Record<string, unknown>).duration || { min: 10, max: 30 },
          suitable_for: (method as Record<string, unknown>).suitable_for || [],
          benefits: (method as Record<string, unknown>).benefits || [],
          // Create variations if they exist
          variations: (method as Record<string, unknown>).variations ? 
            (Array.isArray((method as Record<string, unknown>).variations) ? 
              ((method as Record<string, unknown>).variations as string[]).map((v: string, i: number) => ({
                id: `${key}_var_${i}`,
                name: v,
                description: `Variation of ${capitalizeFirstLetter(key.replace(/_/g, ' '))}`,
                elementalEffect: (method as Record<string, unknown>).elementalEffect || (method as Record<string, unknown>).elementalProperties,
                score: Math.random() * 0.3 + 0.6
              })) : []
            ) : []
        };
      });
      
      setFormattedMethods(transformed);
    }
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectMethod = (method: unknown) => {
    const methodObj = method as Record<string, unknown>;
    const methodId = String(methodObj.id || '');
    setSelectedMethodId(methodId);
    // If it's a main method (not a variation), navigate to it
    if (!methodId.includes('_var_')) {
      router.push(`/cooking-methods/${methodId}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Cooking Methods
      </Typography>
      
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Explore various techniques for transforming ingredients into delicious dishes
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="cooking method categories"
          sx={{ mb: 2 }}
        >
          {methodCategories.map((category, index) => (
            <Tab 
              key={category.name} 
              label={`${category.icon} ${category.name}`} 
              id={`method-tab-${index}`}
              aria-controls={`method-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
      
      {methodCategories.map((category, index) => (
        <div
          key={category.name}
          role="tabpanel"
          hidden={tabValue !== index}
          id={`method-tabpanel-${index}`}
          aria-labelledby={`method-tab-${index}`}
        >
          {tabValue === index && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                  {category.name} Cooking Methods
                </Typography>
                <Typography variant="body1" paragraph>
                  {category.description}
                </Typography>
              </Box>
              
              {/* Use our custom component here */}
              <CookingMethodsSection 
                methods={formattedMethods} 
                onSelectMethod={handleSelectMethod}
                selectedMethodId={selectedMethodId}
                initiallyExpanded={true}
              />
            </>
          )}
        </div>
      ))}
    </Container>
  );
} 