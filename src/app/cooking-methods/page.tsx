'use client';

import { useState } from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, CardMedia, CardActionArea, Chip, Tabs, Tab } from '@mui/material';
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

type MethodCategory = {
  name: string;
  description: string;
  methods: Record<string, any>;
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const navigateToMethod = (methodId: string) => {
    router.push(`/cooking-methods/${methodId}`);
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
              
              <Grid container spacing={3}>
                {Object.entries(category.methods).map(([key, method]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 8
                        }
                      }}
                    >
                      <CardActionArea onClick={() => navigateToMethod(key)} sx={{ flexGrow: 1 }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 140,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="h3" component="div" color="white">
                            {category.icon}
                          </Typography>
                        </CardMedia>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h5" component="h2">
                            {capitalizeFirstLetter(key.replace(/_/g, ' '))}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {method.description?.substring(0, 120)}
                            {method.description?.length > 120 ? '...' : ''}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                            {method.suitable_for?.slice(0, 3).map((item: string, i: number) => (
                              <Chip 
                                key={i} 
                                label={item} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                            {method.suitable_for?.length > 3 && (
                              <Chip 
                                label={`+${method.suitable_for.length - 3}`} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                              />
                            )}
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </div>
      ))}
    </Container>
  );
} 