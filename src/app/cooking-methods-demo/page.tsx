'use client';

import { Box, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
    dryCookingMethods,
    molecularCookingMethods,
    wetCookingMethods
} from '@/data/cooking/methods';
import type { CookingMethodData } from '@/types/cookingMethod';

// Inline temporary CookingMethodsSection to avoid test component dependencies
const CookingMethodsSection = ({
  methods,
  onSelectMethod,
  selectedMethodId,
  initiallyExpanded
}: {
  methods: unknown[],
  onSelectMethod: (m: unknown) => void,
  selectedMethodId?: string | null,
  initiallyExpanded?: boolean
}) => (
  <div className='space-y-2'>
    {methods.map(m => {
      const method = m as any
      return (
        <button
          key={String(method.id)}
          onClick={() => onSelectMethod(m)}
          className={`w-full rounded border p-3 text-left ${selectedMethodId === method.id ? 'bg-blue-50' : 'bg-white'}`}
        >
          <div className='font-semibold'>{String(method.name)}</div>
          <div className='text-sm text-gray-600'>{String(method.description)}</div>
        </button>
      )
    })}
  </div>
)

export default function CookingMethodsDemoPage() {
  const [methods, setMethods] = useState<CookingMethodData[]>([])
  const [selectedMethod, setSelectedMethod] = useState<CookingMethodData | null>(null)

  useEffect(() => {
    // Prepare demo data by formatting methods from different categories
    const demoMethods = [
      ..._formatMethodsForComponent(dryCookingMethods as any, 'dry'),
      ..._formatMethodsForComponent(wetCookingMethods as any, 'wet'),
      ..._formatMethodsForComponent(molecularCookingMethods as unknown, 'molecular')
    ],

    // Sort by score for a more realistic demo
    demoMethods.sort((a, b) => (b.score || 0) - (a.score || 0))

    // Limit to 12 methods for the demo
    setMethods(demoMethods.slice(0, 12) as CookingMethodData[])
  }, [])

  const _formatMethodsForComponent = (methodsObj: Record<string, unknown>, prefix: string) => {
    return Object.entries(methodsObj).map(([key, method]) => {
      // Format method name
      const name = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Generate a realistic score between 0.4 and 1.0
      const score = 0.4 + Math.random() * 0.6;

      return {
        id: `${prefix}_${key}`,
        name,
        description: (method as any).description || '',
        elementalEffect: (method as any).elementalEffect ||
          (method as any).elementalProperties || {
            Fire: Math.random(),
            Water: Math.random(),
            Earth: Math.random(),
            Air: Math.random()
          }
        score,
        duration: (method as any).time_range || (method as any).duration || { min: 10, max: 30 }
        suitable_for: (method as any).suitable_for || [],
        benefits: (method as any).benefits || [],
        // Create variations if they exist
        variations: (method as any).variations
          ? Array.isArray((method as any).variations)
            ? ((method as any).variations as string[]).map((v: string, i: number) => ({
                id: `${prefix}_${key}_var_${i}`,
                name: v,
                description: `A variation of ${name} with different characteristics.`,
                elementalEffect: {
                  Fire: Math.random(),
                  Water: Math.random(),
                  Earth: Math.random(),
                  Air: Math.random()
                }
                score: score - 0.1 + Math.random() * 0.2, // Slightly vary from parent score
              }))
            : []
          : []
      }
    })
  }

  const handleSelectMethod = (method: unknown) => {
    setSelectedMethod(method as CookingMethodData)
  }

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>
      <Typography variant='h2' component='h1' gutterBottom align='center' sx={{ mb: 4 }}>
        Cooking Methods Component Demo
      </Typography>

      <Typography variant='body1' paragraph align='center' sx={{ mb: 5 }}>
        This page demonstrates the CookingMethodsSection component with updated styling to match the
        ingredient recommender.
      </Typography>

      {methods.length > 0 ? (
        <Box sx={{ mb: 6 }}>
          <CookingMethodsSection
            methods={methods}
            onSelectMethod={handleSelectMethod}
            selectedMethodId={
              selectedMethod && typeof selectedMethod === 'object' && 'id' in selectedMethod
                ? (selectedMethod as { id: string }).id
                : null
            }
            initiallyExpanded={true}
          />
        </Box>
      ) : (
        <Typography align='center'>Loading cooking methods...</Typography>
      )}

      {selectedMethod && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <Typography variant='h5' gutterBottom>
            Selected Method:{' '}
            {selectedMethod && typeof selectedMethod === 'object' && 'name' in selectedMethod
              ? String(selectedMethod.name)
              : 'Unknown'}
          </Typography>
          <Typography variant='body1' paragraph>
            {selectedMethod && typeof selectedMethod === 'object' && 'description' in selectedMethod
              ? String(selectedMethod.description)
              : 'No description available'}
          </Typography>
          <Box
            component='pre'
            sx={{
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.8rem'
            }}
          >
            {JSON.stringify(selectedMethod, null, 2)}
          </Box>
        </Box>
      )}
    </Container>
  )
}