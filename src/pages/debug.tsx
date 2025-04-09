import React from 'react';
import AlchemicalDebug from '../components/Debug/AlchemicalDebug';

const DebugPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      
      <div className="grid gap-6">
        <AlchemicalDebug />
      </div>
    </div>
  );
};

export default DebugPage; 