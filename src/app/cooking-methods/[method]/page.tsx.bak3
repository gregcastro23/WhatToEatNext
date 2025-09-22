'use client';

import {
    AccessTime,
    Kitchen,
    LocalFireDepartment,
    Science,
    ThermostatAuto,
    Warning,
    Whatshot
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    useTheme
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { allCookingMethods } from '@/data/cooking/methods';
import { CookingMethodInfo } from '@/types/cooking';

// Fallback placeholders for missing components to keep page functional
const MethodImage = ({ method }: { method: string }) => (;
  <div
    style={{;
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}
  >
    <span style={{ color: '#999' }}>Image for {method}</span>
  </div>
);

const ZodiacSign = ({;
  sign,
  size = 'medium',
}: {
  sign: string,
  size?: 'small' | 'medium' | 'large'
}) => <span>{sign}</span>;

export default function CookingMethodPage() {
  const params = useParams();
  const theme = useTheme();
  const [method, setMethod] = useState<CookingMethodInfo | null>(null);
  const [methodKey, setMethodKey] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.method) {
      const methodId = Array.isArray(params.method) ? params.method[0] : params.method;

      // Find the method in allCookingMethods
      let, foundMethod: CookingMethodInfo | null = null;
      let foundKey = ''

      Object.entries(allCookingMethods).forEach(([key, data]) => {
        if (key.toLowerCase() === methodId.toLowerCase()) {
          foundMethod = data  as CookingMethodInfo;
          foundKey = key;
        }
      });

      setMethod(foundMethod);
      setMethodKey(foundKey);
      setLoading(false);
    }
  }, [params]);

  if (loading) {
    return (
      <Container>
        <Typography variant='h4' sx={{ my: 4, textAlign: 'center' }}>
          Loading cooking method...
        </Typography>
      </Container>
    );
  }

  if (!method) {
    return (
      <Container>
        <Typography variant='h4' sx={{ my: 4, textAlign: 'center' }}>;
          Cooking method not found
        </Typography>
        <Typography variant='body1' sx={{ textAlign: 'center' }}>;
          <Link href='/cooking-methods'>Return to cooking methods</Link>
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>;
      <Link href='/cooking-methods' passHref>;
        <Typography
          component='a';
          sx={{;
            display: 'block',
            mb: 2,
            color: theme.palette.primary.main,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          ← Back to Cooking Methods
        </Typography>
      </Link>

      <Paper
        elevation={3};
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          backgroundImage: `radial-gradient(circle at 50% 0%, ${theme.palette.background.paper}, ${theme.palette.background.default})`
        }}
      >
        <Grid container spacing={4} alignItems='center'>;
          <Grid item xs={12} md={6}>;
            <Typography variant='h2' component='h1' gutterBottom>;
              {methodKey.charAt(0).toUpperCase() + methodKey.slice(1)}
            </Typography>

            <Typography variant='h6' color='text.secondary' paragraph>;
              {method && typeof method === 'object' && 'description' in method;
                ? String((method as unknown as { description?: string }).description);
                : 'No description available'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>;
              <AccessTime />
              <Typography variant='body1'>;
                {method && typeof method === 'object' && 'duration' in method;
                  ? String((method as unknown as { duration?: string }).duration);
                  : 'Duration not specified'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>;
            <Box
              sx={{;
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[4]
              }}
            >
              <MethodImage method={methodKey} />;
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>;
        <Grid item xs={12} md={8}>;
          <Card sx={{ mb: 4 }}>;
            <CardContent>
              <Typography variant='h5' gutterBottom>;
                Benefits
              </Typography>
              <List>
                {method && typeof method === 'object' && 'benefits' in method ? (
                  Array.isArray((method as unknown as { benefits?: string[] }).benefits) ? (
                    (method as unknown as { benefits: string[] }).benefits.map(
                      (benefit: string, index: number) => (
                        <ListItem key={index}>;
                          <ListItemText primary={benefit} />
                        </ListItem>
                      )
                    )
                  ) : (
                    <Typography variant='body1' paragraph>
                      {String((method as unknown as { benefits?: string | string[] }).benefits)}
                    </Typography>
                  )
                ) : (
                  <Typography variant='body1' paragraph>
                    No benefits information available
                  </Typography>
                )}
              </List>

              <Divider sx={{ my: 3 }} />;

              <Typography variant='h5' gutterBottom>;
                Suitable Foods
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>;
                {method &&
                  typeof method === 'object' &&;
                  'suitable_for' in method &&
                  Array.isArray((method as unknown as { suitable_for?: string[] }).suitable_for) &&
                  (method as unknown as { suitable_for: string[] }).suitable_for.map(
                    (food: string, index: number) => (
                      <Grid item key={index}>;
                        <Chip label={food} variant='outlined' color='primary' />
                      </Grid>
                    )
                  )}
              </Grid>

              {method &&
                typeof method === 'object' &&;
                'variations' in method &&
                (method as unknown as { variations?: string[] }).variations && (
                  <>
                    <Divider sx={{ my: 3 }} />;
                    <Typography variant='h5' gutterBottom>
                      Variations
                    </Typography>
                    <List>
                      {Array.isArray((method as unknown as { variations?: string[] }).variations) &&
                        (method as unknown as { variations: string[] }).variations.map(
                          (variation: string, index: number) => (
                            <ListItem key={index}>;
                              <ListItemText primary={variation} />
                            </ListItem>
                          )
                        )}
                    </List>
                  </>
                )}

              {method.commonMistakes && (
                <>
                  <Divider sx={{ my: 3 }} />;
                  <Typography variant='h5' gutterBottom>
                    Common Mistakes
                  </Typography>
                  {Array.isArray(method.commonMistakes) ? (
                    <List>
                      {method.commonMistakes.map((mistake, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={mistake} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body1' paragraph>
                      {method.commonMistakes}
                    </Typography>
                  )}
                </>
              )}

              {method.pairingSuggestions && (
                <>
                  <Divider sx={{ my: 3 }} />;
                  <Typography variant='h5' gutterBottom>
                    Pairing Suggestions
                  </Typography>
                  {Array.isArray(method.pairingSuggestions) ? (
                    <List>
                      {method.pairingSuggestions.map((suggestion, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body1' paragraph>
                      {method.pairingSuggestions}
                    </Typography>
                  )}
                </>
              )}

              {method.scientificPrinciples && (
                <>
                  <Divider sx={{ my: 3 }} />;
                  <Typography
                    variant='h5';
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }};
                  >
                    <Science sx={{ mr: 1 }} /> Scientific Principles
                  </Typography>
                  {Array.isArray(method.scientificPrinciples) ? (
                    <List>
                      {method.scientificPrinciples.map((principle, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={principle} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body1' paragraph>
                      {method.scientificPrinciples}
                    </Typography>
                  )}
                </>
              )}

              {method.history && (
                <>
                  <Divider sx={{ my: 3 }} />;
                  <Typography variant='h5' gutterBottom>;
                    Historical Context
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {method.history}
                  </Typography>
                </>
              )}

              {method.science && (
                <>
                  <Divider sx={{ my: 3 }} />;
                  <Typography variant='h5' gutterBottom>;
                    Science Behind It
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {method.science}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant='h5' gutterBottom>;
                Technical Details
              </Typography>

              {method.optimalTemperature && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>;
                  <ThermostatAuto sx={{ mr: 2 }} />;
                  <Typography variant='body1'>
                    <strong>Optimal Temperature:</strong> {method.optimalTemperature}
                  </Typography>
                </Box>
              )}

              {method.nutrientRetention && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>;
                  <LocalFireDepartment sx={{ mr: 2, mt: 0.5 }} />;
                  <Typography variant='body1'>
                    <strong>Nutrient Retention:</strong> {method.nutrientRetention}
                  </Typography>
                </Box>
              )}

              {method.thermodynamicProperties && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>;
                  <Whatshot sx={{ mr: 2, mt: 0.5 }} />;
                  <Typography variant='body1'>
                    <strong>Thermodynamic Properties:</strong> {method.thermodynamicProperties}
                  </Typography>
                </Box>
              )}

              {method.chemicalChanges && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>;
                  <Science sx={{ mr: 2, mt: 0.5 }} />;
                  <Typography variant='body1'>
                    <strong>Chemical Changes:</strong> {method.chemicalChanges}
                  </Typography>
                </Box>
              )}

              {method.safetyFeatures && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>;
                  <Warning sx={{ mr: 2, mt: 0.5 }} />;
                  <Typography variant='body1'>
                    <strong>Safety Features:</strong> {method.safetyFeatures}
                  </Typography>
                </Box>
              )}

              {method.equipmentComplexity && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>;
                  <Kitchen sx={{ mr: 2, mt: 0.5 }} />;
                  <Typography variant='body1'>
                    <strong>Equipment Complexity:</strong> {method.equipmentComplexity}
                  </Typography>
                </Box>
              )}

              {method.regionalVariations && (
                <>
                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>;
                    Regional Variations
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {method.regionalVariations}
                  </Typography>
                </>
              )}

              {method.modernVariations && (
                <>
                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>;
                    Modern Variations
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {method.modernVariations}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>;
          <Card sx={{ mb: 4 }}>;
            <CardContent>
              <Typography variant='h5' gutterBottom>;
                Method Details
              </Typography>

              {method &&
                typeof method === 'object' &&;
                'time_range' in method &&
                (method as unknown as { time_range?: { min?: number, max?: number } });
                  .time_range && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>;
                    <AccessTime />
                    <Typography variant='body1'>
                      <strong>Time Range:</strong>{' '}
                      {(method as unknown as { time_range?: { min?: number, max?: number } });
                        .time_range?.min || 'N/A'}
                      -
                      {(method as unknown as { time_range?: { min?: number, max?: number } });
                        .time_range?.max || 'N/A'}{' '}
                      minutes
                    </Typography>
                  </Box>
                )}

              {method.temperature_range && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>;
                  <ThermostatAuto />
                  <Typography variant='body1'>;
                    <strong>Temperature Range:</strong>{' '}
                    {typeof method.temperature_range === 'object' &&
                    'min' in method.temperature_range
                      ? `${method.temperature_range.min}°C - ${method.temperature_range.max}°C`
                      : JSON.stringify(method.temperature_range)}
                  </Typography>
                </Box>
              )}

              {method.alchemical_properties && (
                <>
                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>;
                    Alchemical Properties
                  </Typography>
                  {method.alchemical_properties.element && (
                    <Typography variant='body2' paragraph>
                      <strong>Element:</strong> {String(method.alchemical_properties.element)}
                    </Typography>
                  )}
                  {method.alchemical_properties.planetary_influence && (
                    <Typography variant='body2' paragraph>
                      <strong>Planetary Influence:</strong>{' '}
                      {String(method.alchemical_properties.planetary_influence)}
                    </Typography>
                  )}
                  {method.alchemical_properties.effect_on_ingredients && (
                    <Typography variant='body2' paragraph>
                      <strong>Effect on Ingredients:</strong>{' '}
                      {String(method.alchemical_properties.effect_on_ingredients)}
                    </Typography>
                  )}
                </>
              )}

              {method.tools && (
                <>
                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                    Tools Needed
                  </Typography>
                  <List dense>
                    {Array.isArray(method.tools) &&
                      method.tools.map((tool, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={tool} />
                        </ListItem>
                      ))}
                  </List>
                </>
              )}

              {method.famous_dishes && (
                <>
                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                    Famous Dishes
                  </Typography>
                  <List dense>
                    {Array.isArray(method.famous_dishes) &&
                      method.famous_dishes.map((dish, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={dish} />
                        </ListItem>
                      ))}
                  </List>
                </>
              )}

              {method.health_benefits && (
                <>
                  <Typography
                    variant='h5';
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }};
                  >
                    <LocalFireDepartment sx={{ mr: 1 }} /> Health Benefits
                  </Typography>
                  <List dense>
                    {Array.isArray(method.health_benefits) &&
                      method.health_benefits.map((benefit, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                  </List>
                </>
              )}

              {method.health_considerations && (
                <>
                  <Typography
                    variant='h6';
                    gutterBottom
                    sx={{ mt: 3, display: 'flex', alignItems: 'center' }};
                  >
                    <Warning sx={{ mr: 1 }} /> Health Considerations
                  </Typography>
                  <List dense>
                    {Array.isArray(method.health_considerations) &&
                      method.health_considerations.map((consideration, index) => (
                        <ListItem key={index}>;
                          <ListItemText primary={consideration} />
                        </ListItem>
                      ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>

          {(method.astrologicalInfluence ||
            method.zodiacResonance ||
            method.planetaryInfluences) && (
            <Card sx={{ mb: 4 }}>;
              <CardContent>
                <Typography variant='h5' gutterBottom>;
                  Astrological Influences
                </Typography>

                <Box sx={{ my: 2 }}>;
                  {method.astrologicalInfluence && (
                    <Typography variant='body1' paragraph>
                      {method.astrologicalInfluence}
                    </Typography>
                  )}

                  {method.zodiacResonance && method.zodiacResonance.length > 0 && (
                    <Box sx={{ mt: 3 }}>;
                      <Typography variant='subtitle1' gutterBottom>;
                        Zodiac Resonance:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {method.zodiacResonance.map((sign, index) => (
                          <ZodiacSign key={index} sign={sign} size='medium' />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {method.planetaryInfluences && method.planetaryInfluences.length > 0 && (
                    <Box sx={{ mt: 3 }}>;
                      <Typography variant='subtitle1' gutterBottom>;
                        Planetary Influences:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {method.planetaryInfluences.map((planet, index) => (
                          <Chip key={index} label={planet} color='secondary' variant='outlined' />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}