'use client';

import React, { useEffect } from 'react';
import { UserProfileForm } from '../../components/UserProfileForm';
import { useUser } from '../../contexts/UserContext';
import PlanetaryPositionInitializer from '../../components/PlanetaryPositionInitializer';
import { initializeAlchemicalEngine } from '../../utils/alchemyInitializer';

export default function ProfilePage() {
  const { currentUser, isLoading } = useUser();
  
  // Initialize alchemical engine on mount
  useEffect(() => {
    initializeAlchemicalEngine();
  }, []);
  
  return (
    <div className="profile-page">
      <div className="header">
        <h1>{currentUser ? 'Your Astrological Profile' : 'Eat your Chart'}</h1>
        <p className="subtitle">
          {currentUser 
            ? 'Manage your personal profile to see how the current astrological energies are affecting you.'
            : 'Create your personal profile with your birth details to see how the current astrological energies are affecting you, and get personalized food recommendations!'}
        </p>
      </div>
      
      {/* Ensure planetary positions are initialized */}
      <PlanetaryPositionInitializer />
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      ) : (
        <UserProfileForm />
      )}
      
      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #f6f9fc 0%, #e9f1f7 100%);
        }
        
        .header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 3rem auto;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #2d3748;
          font-weight: 700;
        }
        
        .subtitle {
          font-size: 1.125rem;
          color: #4a5568;
          line-height: 1.6;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #4f46e5;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .profile-page {
            padding: 1.5rem 1rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
} 