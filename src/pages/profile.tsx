import React from 'react';
import { UserProfileForm } from '../components/UserProfileForm';
import { useUser } from '../contexts/UserContext';
import ChartComparison from '../components/ChartComparison';

const ProfilePage: React.FC = () => {
  const { currentUser } = useUser();

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>Your Astrological Profile</h1>
        <p>
          Create or update your astrological profile to get personalized recommendations
          based on your birth chart and current planetary alignments.
        </p>
      </div>

      <div className="profile-content">
        <UserProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage; 