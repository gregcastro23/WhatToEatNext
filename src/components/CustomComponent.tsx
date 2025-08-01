import React from 'react';

interface CustomComponentProps {
  title?: string;
  children?: React.ReactNode;
}

export default function CustomComponent({ title = 'Default Title', children }: CustomComponentProps) {
  return (
    <div className="custom-component">
      <h3>{title}</h3>
      {children}
    </div>
  );
}