import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-600',
}) => {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }[size];

  return (
    <div className='flex items-center justify-center p-4'>
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClass} ${color}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
