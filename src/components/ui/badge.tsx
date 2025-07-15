import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  title?: string;
}

export function Badge({ 
  children, 
  className = '', 
  variant = 'default',
  title
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title={title}
    >
      {children}
    </span>
  );
} 