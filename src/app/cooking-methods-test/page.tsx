'use client';

// import { useState } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

export default function CookingMethodsTestPage() {
  // const [loading, _setLoading] = useState(false);
  const loading = false; // Simplified for testing

  const testMethods = [
    {
      id: 'baking',
      name: 'Baking',
      description: 'Cooking food by dry heat in an oven',
      score: 0.8
    },
    {
      id: 'grilling',
      name: 'Grilling',
      description: 'Cooking food on a grill over direct heat',
      score: 0.7
    },
    {
      id: 'steaming',
      name: 'Steaming',
      description: 'Cooking food with steam from boiling water',
      score: 0.9
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Cooking Methods Test
      </Typography>
      
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Simple test to verify cooking methods functionality
      </Typography>
      
      {loading ? (
        <Typography align="center">Loading...</Typography>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '32px' }}>
          {testMethods.map((method) => (
            <Card key={method.id} sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {method.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {method.description}
                </Typography>
                <Typography variant="body2" color="primary">
                  Score: {Math.round(method.score * 100)}%
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
} 