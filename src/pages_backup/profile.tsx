import React from 'react';
import Head from 'next/head';
import { UserProfileForm } from '../components/UserProfileForm';
import { UserProfile } from '../types/user';

export default function ProfilePage() {
  const handleProfileCreated = (profile: UserProfile) => {
    console.log('Profile created:', profile);
    // You can add additional actions here if needed
  };

  return (
    <>
      <Head>
        <title>Your Astrological Profile | What To Eat Next</title>
        <meta name="description" content="Create your personal astrological profile to get tailored food recommendations based on your birth chart." />
      </Head>
      
      <div className="profile-page">
        <div className="header">
          <h1>Your Astrological Profile</h1>
          <p className="subtitle">
            Create your personal profile with your birth details to see how the current astrological energies
            are affecting you, and get personalized food recommendations.
          </p>
        </div>
        
        <UserProfileForm onProfileCreated={handleProfileCreated} />
        
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
    </>
  );
} 