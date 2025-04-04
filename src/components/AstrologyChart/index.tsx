'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AstrologyChart() {
  return (
    <div style={{
      background: 'rgba(30, 30, 40, 0.7)',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1.5rem 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent'
      }}>
        Current Celestial Alignment
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <AlertCircle style={{ color: '#a78bfa', width: '48px', height: '48px' }} />
        <p style={{ color: '#e2e8f0' }}>
          Astrological data is currently being recalculated.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          The celestial chart will be available soon.
        </p>
      </div>
    </div>
  );
} 